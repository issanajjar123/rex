'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../lib/auth-store';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, User, FileText, ExternalLink, MessageCircle } from 'lucide-react';

type Application = {
  id: number;
  job_id: number;
  user_id: number;
  cover_letter: string;
  cv_url: string | null;
  portfolio_url: string | null;
  status: string;
  created_at: string;
  applicant_name: string;
  applicant_email: string;
};

type Job = {
  id: number;
  title: string;
  description: string;
  status: string;
  user_id: number;
};

export default function ApplicationsContent({ jobId }: { jobId: string }) {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [applications, setApplications] = useState<Application[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    fetchApplications();
  }, [user, jobId]);

  const fetchApplications = async () => {
    try {
      const [jobRes, appsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?user_id=${user?.id}`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?action=applications&job_id=${jobId}`)
      ]);

      const jobsData = await jobRes.json();
      const currentJob = jobsData.find((j: Job) => j.id === parseInt(jobId));
      
      if (!currentJob || currentJob.user_id !== user?.id) {
        router.push('/jobs');
        return;
      }

      setJob(currentJob);
      const appsData = await appsRes.json();
      setApplications(appsData);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (applicationId: number) => {
    if (!confirm('هل أنت متأكد من قبول هذا المتقدم؟ سيتم إنشاء دردشة تلقائية للتواصل معه.')) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'accept',
          application_id: applicationId,
          job_id: jobId,
          employer_id: user?.id
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert('تم قبول المتقدم بنجاح! تم إنشاء دردشة للتواصل معه.');
        fetchApplications();
        
        if (data.chat_id) {
          router.push('/chat');
        }
      } else {
        alert('حدث خطأ أثناء قبول المتقدم');
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      alert('حدث خطأ أثناء قبول المتقدم');
    }
  };

  const handleReject = async (applicationId: number) => {
    if (!confirm('هل أنت متأكد من رفض هذا المتقدم؟')) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reject',
          application_id: applicationId
        })
      });

      if (res.ok) {
        alert('تم رفض المتقدم');
        fetchApplications();
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      alert('حدث خطأ أثناء رفض المتقدم');
    }
  };

  const handleCloseJob = async () => {
    if (!confirm('هل تريد إغلاق هذه الوظيفة؟ لن يتمكن أحد من التقديم بعد الإغلاق.')) {
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'close',
          job_id: jobId,
          employer_id: user?.id
        })
      });

      if (res.ok) {
        alert('تم إغلاق الوظيفة');
        router.push('/jobs');
      }
    } catch (error) {
      console.error('Error closing job:', error);
      alert('حدث خطأ أثناء إغلاق الوظيفة');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      accepted: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700'
    };
    const labels = {
      pending: 'قيد المراجعة',
      accepted: 'مقبول',
      rejected: 'مرفوض'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>رجوع</span>
          </button>

          {job && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500">
                  {applications.length} متقدم
                </span>
                <span className="text-sm text-gray-500">•</span>
                <span className={`text-sm ${job.status === 'active' ? 'text-green-600' : 'text-gray-500'}`}>
                  {job.status === 'active' ? 'نشطة' : 'مغلقة'}
                </span>
              </div>

              {job.status === 'active' && (
                <button
                  onClick={handleCloseJob}
                  className="mt-4 text-sm text-red-600 hover:text-red-700"
                >
                  إغلاق الوظيفة
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Applications List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">لا توجد طلبات تقديم بعد</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">{app.applicant_name}</h3>
                    <p className="text-sm text-gray-500">{app.applicant_email}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      تقدم في {new Date(app.created_at).toLocaleDateString('ar', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    رسالة التقديم
                  </h4>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{app.cover_letter}</p>
                </div>

                {(app.cv_url || app.portfolio_url) && (
                  <div className="flex gap-3 mb-4">
                    {app.cv_url && (
                      <a
                        href={app.cv_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        عرض السيرة الذاتية
                      </a>
                    )}
                    {app.portfolio_url && (
                      <a
                        href={app.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4" />
                        معرض الأعمال
                      </a>
                    )}
                  </div>
                )}

                {app.status === 'pending' && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAccept(app.id)}
                      className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      قبول
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      رفض
                    </button>
                  </div>
                )}

                {app.status === 'accepted' && (
                  <button
                    onClick={() => router.push('/chat')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <MessageCircle className="w-4 h-4" />
                    فتح الدردشة
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
