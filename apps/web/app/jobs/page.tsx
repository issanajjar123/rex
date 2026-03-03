'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../lib/auth-store';
import { useRouter } from 'next/navigation';
import BottomNav from '../components/BottomNav';
import { Briefcase, MapPin, DollarSign, Clock, X, Upload, Send } from 'lucide-react';

type Job = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  salary: string;
  job_type: string;
  category: string;
  location: string;
  work_type: string;
  required_skills: string;
  status: string;
  created_at: string;
};

export default function JobsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myJobs, setMyJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'browse' | 'posted' | 'applied'>('browse');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    job_type: 'full_time',
    category: 'برمجة',
    location: '',
    work_type: 'remote',
    required_skills: ''
  });
  const [applyData, setApplyData] = useState({
    cover_letter: '',
    cv_url: '',
    portfolio_url: ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    fetchJobs();
    fetchMyJobs();
  }, [user]);

  const fetchJobs = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`);
      const data = await res.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyJobs = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?user_id=${user.id}`);
      const data = await res.json();
      setMyJobs(data);
    } catch (error) {
      console.error('Error fetching my jobs:', error);
    }
  };

  const handlePostJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, user_id: user?.id })
      });

      if (res.ok) {
        setShowPostModal(false);
        setFormData({
          title: '',
          description: '',
          salary: '',
          job_type: 'full_time',
          category: 'برمجة',
          location: '',
          work_type: 'remote',
          required_skills: ''
        });
        fetchJobs();
        fetchMyJobs();
        setActiveTab('posted');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      alert('حدث خطأ أثناء نشر الوظيفة');
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply',
          job_id: selectedJob.id,
          user_id: user?.id,
          ...applyData
        })
      });

      const data = await res.json();

      if (res.ok) {
        alert('تم التقديم بنجاح!');
        setShowApplyModal(false);
        setSelectedJob(null);
        setApplyData({ cover_letter: '', cv_url: '', portfolio_url: '' });
      } else {
        alert(data.error || 'حدث خطأ أثناء التقديم');
      }
    } catch (error) {
      console.error('Error applying:', error);
      alert('حدث خطأ أثناء التقديم');
    }
  };

  const openApplyModal = (job: Job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const getJobTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      full_time: 'دوام كامل',
      part_time: 'دوام جزئي',
      freelance: 'عمل حر'
    };
    return labels[type] || type;
  };

  const getWorkTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      remote: 'عن بعد',
      on_site: 'في الموقع',
      hybrid: 'مختلط'
    };
    return labels[type] || type;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">الوظائف</h1>
            <button
              onClick={() => setShowPostModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              نشر وظيفة
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              تصفح الوظائف
            </button>
            <button
              onClick={() => setActiveTab('posted')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                activeTab === 'posted'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              وظائفي ({myJobs.length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Browse Jobs */}
            {activeTab === 'browse' && (
              <div className="space-y-4">
                {jobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد وظائف متاحة حالياً</p>
                  </div>
                ) : (
                  jobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <h3 className="font-bold text-lg mb-2">{job.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{job.description}</p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                          <Briefcase className="w-3 h-3" />
                          {getJobTypeLabel(job.job_type)}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">
                          <MapPin className="w-3 h-3" />
                          {getWorkTypeLabel(job.work_type)}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs">
                          <DollarSign className="w-3 h-3" />
                          {job.salary}
                        </span>
                      </div>

                      {job.required_skills && (
                        <p className="text-xs text-gray-500 mb-3">
                          المهارات: {job.required_skills}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(job.created_at).toLocaleDateString('ar')}
                        </span>
                        <button
                          onClick={() => openApplyModal(job)}
                          disabled={job.user_id === Number(user?.id)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {job.user_id === Number(user?.id) ? 'وظيفتك' : 'تقدم الآن'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* My Posted Jobs */}
            {activeTab === 'posted' && (
              <div className="space-y-4">
                {myJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">لم تنشر أي وظائف بعد</p>
                    <button
                      onClick={() => setShowPostModal(true)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      نشر وظيفة جديدة
                    </button>
                  </div>
                ) : (
                  myJobs.map((job) => (
                    <div key={job.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg">{job.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs ${
                          job.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {job.status === 'active' ? 'نشط' : 'مغلق'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{job.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {new Date(job.created_at).toLocaleDateString('ar')}
                        </span>
                        <button
                          onClick={() => router.push(`/jobs/${job.id}/applications`)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          عرض المتقدمين
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Post Job Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">نشر وظيفة جديدة</h2>
              <button onClick={() => setShowPostModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handlePostJob} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الوظيفة</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الراتب</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="مثال: 1000-1500$"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع الوظيفة</label>
                  <select
                    value={formData.job_type}
                    onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="full_time">دوام كامل</option>
                    <option value="part_time">دوام جزئي</option>
                    <option value="freelance">عمل حر</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">التصنيف</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="برمجة">برمجة</option>
                    <option value="تصميم">تصميم</option>
                    <option value="تسويق">تسويق</option>
                    <option value="كتابة">كتابة</option>
                    <option value="ترجمة">ترجمة</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع العمل</label>
                  <select
                    value={formData.work_type}
                    onChange={(e) => setFormData({ ...formData, work_type: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="remote">عن بعد</option>
                    <option value="on_site">في الموقع</option>
                    <option value="hybrid">مختلط</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الموقع</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="مثال: الرياض، جدة، عن بعد"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المهارات المطلوبة</label>
                <input
                  type="text"
                  value={formData.required_skills}
                  onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                  placeholder="مثال: Laravel, PHP, MySQL"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                نشر الوظيفة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">التقديم على الوظيفة</h2>
              <button onClick={() => setShowApplyModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-lg mb-1">{selectedJob.title}</h3>
                <p className="text-sm text-gray-600">{selectedJob.description}</p>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رسالة التقديم</label>
                  <textarea
                    value={applyData.cover_letter}
                    onChange={(e) => setApplyData({ ...applyData, cover_letter: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="اكتب رسالة تعريفية تشرح فيها خبرتك ولماذا أنت مناسب لهذه الوظيفة..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رابط السيرة الذاتية (CV)</label>
                  <input
                    type="url"
                    value={applyData.cv_url}
                    onChange={(e) => setApplyData({ ...applyData, cv_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/cv.pdf"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">رابط معرض الأعمال (اختياري)</label>
                  <input
                    type="url"
                    value={applyData.portfolio_url}
                    onChange={(e) => setApplyData({ ...applyData, portfolio_url: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://portfolio.com"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  إرسال الطلب
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
