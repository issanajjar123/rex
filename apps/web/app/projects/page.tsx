'use client';

import { useState, useEffect } from 'react';
import { Briefcase, Plus, Search, X, Upload, CheckCircle, XCircle, Star, MessageCircle } from 'lucide-react';
import BottomNav from '@/app/components/BottomNav';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [proposals, setProposals] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/projects`);
      if (!res.ok) {
        // Use mock data as fallback
        const mockProjects = [
          {
            id: 1,
            title: 'Mobile App Development',
            description: 'Need a React Native developer',
            budget: 5000,
            duration: '30 days',
            category: 'Development',
            status: 'open',
            proposals: 5,
            skills: ['React Native', 'JavaScript', 'Mobile'],
            progress: 0
          },
          {
            id: 2,
            title: 'Logo Design',
            description: 'Looking for a creative logo designer',
            budget: 500,
            duration: '7 days',
            category: 'Design',
            status: 'open',
            proposals: 8,
            skills: ['Graphic Design', 'Illustrator'],
            progress: 0
          }
        ];
        setProjects(mockProjects);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
      } else {
        setProjects([]);
      }
    } catch (error) {
      // Use mock data as fallback on error
      const mockProjects = [
        {
          id: 1,
          title: 'Mobile App Development',
          description: 'Need a React Native developer',
          budget: 5000,
          duration: '30 days',
          category: 'Development',
          status: 'open',
          proposals: 5,
          skills: ['React Native', 'JavaScript', 'Mobile'],
          progress: 0
        },
        {
          id: 2,
          title: 'Logo Design',
          description: 'Looking for a creative logo designer',
          budget: 500,
          duration: '7 days',
          category: 'Design',
          status: 'open',
          proposals: 8,
          skills: ['Graphic Design', 'Illustrator'],
          progress: 0
        }
      ];
      setProjects(mockProjects);
    }
  };

  const fetchProposals = async (projectId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/projects?projectId=${projectId}&action=proposals`);
      if (!res.ok) {
        setProposals([]);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setProposals(data.proposals);
      } else {
        setProposals([]);
      }
    } catch (error) {
      console.error('Failed to load proposals:', error);
      setProposals([]);
    }
  };

  const fetchDeliverables = async (projectId: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/projects?projectId=${projectId}&action=deliverables`);
      if (!res.ok) {
        setDeliverables([]);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setDeliverables(data.deliverables);
      } else {
        setDeliverables([]);
      }
    } catch (error) {
      console.error('Failed to load deliverables:', error);
      setDeliverables([]);
    }
  };

  const createProject = async (formData: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...formData })
      });
      const data = await res.json();
      if (data.success) {
        setProjects([data.project, ...projects]);
        setShowCreateModal(false);
        alert('✅ تم إنشاء المشروع بنجاح!');
      } else {
        alert(data.error || 'فشل في إنشاء المشروع');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('حدث خطأ أثناء إنشاء المشروع');
    }
  };

  const submitProposal = async (formData: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_proposal', projectId: selectedProject.id, ...formData })
      });
      const data = await res.json();
      if (data.success) {
        setShowProposalModal(false);
        fetchProposals(selectedProject.id);
        fetchProjects();
        alert('✅ تم تقديم العرض بنجاح!');
      } else {
        alert(data.error || 'فشل في تقديم العرض');
      }
    } catch (error) {
      console.error('Error submitting proposal:', error);
      alert('حدث خطأ أثناء تقديم العرض');
    }
  };

  const acceptProposal = async (proposalId: string, proposalPrice: number, freelancerId: string) => {
    const confirmed = confirm(
      `هل تريد قبول هذا العرض؟\n\n` +
      `💰 السعر: ${proposalPrice}\n` +
      `📊 العمولة (10%): ${(proposalPrice * 0.10).toFixed(2)}\n` +
      `💳 الإجمالي: ${(proposalPrice * 1.10).toFixed(2)}\n\n` +
      `سيتم حجز المبلغ في Escrow وإطلاقه عند التسليم.`
    );

    if (!confirmed) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      // إنشاء Escrow أولاً
      const escrowRes = await fetch(`${apiUrl}/api/escrow`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': '1' // TODO: Get from auth
        },
        body: JSON.stringify({
          action: 'create',
          sellerId: freelancerId,
          amount: proposalPrice,
          relatedType: 'project',
          relatedId: selectedProject?.id
        })
      });

      if (!escrowRes.ok) {
        const error = await escrowRes.json();
        alert(error.error || 'فشل في حجز المبلغ. تأكد من رصيدك المتاح.');
        return;
      }

      // قبول العرض
      const res = await fetch(`${apiUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'accept_proposal', proposalId })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('✅ تم قبول العرض وحجز المبلغ في Escrow بنجاح!');
        fetchProjects();
        setSelectedProject(data.project);
        fetchProposals(data.project.id);
      }
    } catch (error) {
      console.error('Error accepting proposal:', error);
      alert('حدث خطأ أثناء قبول العرض');
    }
  };

  const submitDeliverable = async (formData: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_deliverable', projectId: selectedProject.id, ...formData })
      });
      const data = await res.json();
      if (data.success) {
        setShowDeliverableModal(false);
        fetchDeliverables(selectedProject.id);
        alert('✅ تم رفع المسلم بنجاح!');
      } else {
        alert(data.error || 'فشل في رفع المسلم');
      }
    } catch (error) {
      console.error('Error submitting deliverable:', error);
      alert('حدث خطأ أثناء رفع المسلم');
    }
  };

  const approveDeliverable = async (deliverableId: string) => {
    const confirmed = confirm('هل تم استلام العمل بشكل مرضٍ؟\n\nسيتم إطلاق المبلغ للمستقل بعد التأكيد.');
    if (!confirmed) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';

    try {
      // الموافقة على التسليم
      const res = await fetch(`${apiUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_deliverable', deliverableId })
      });
      const data = await res.json();

      if (data.success && data.project.escrowId) {
        // إطلاق المبلغ من Escrow
        const escrowRes = await fetch(`${apiUrl}/api/escrow`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'x-user-id': '1' // TODO: Get from auth
          },
          body: JSON.stringify({
            action: 'release',
            escrowId: data.project.escrowId
          })
        });

        if (escrowRes.ok) {
          alert('✅ تم الموافقة على التسليم وإطلاق المبلغ للمستقل بنجاح!');
          fetchProjects();
          setSelectedProject(data.project);
          fetchDeliverables(data.project.id);
          setShowRatingModal(true);
        } else {
          const error = await escrowRes.json();
          alert(error.error || 'فشل في إطلاق المبلغ');
        }
      } else if (data.success) {
        fetchProjects();
        setSelectedProject(data.project);
        fetchDeliverables(data.project.id);
        setShowRatingModal(true);
      }
    } catch (error) {
      console.error('Error approving deliverable:', error);
      alert('حدث خطأ أثناء الموافقة على التسليم');
    }
  };

  const rateProject = async (formData: any) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rate_project', projectId: selectedProject.id, ...formData })
      });
      const data = await res.json();
      if (data.success) {
        setShowRatingModal(false);
        fetchProjects();
        setSelectedProject(data.project);
        alert('✅ تم تقييم المشروع بنجاح!');
      } else {
        alert(data.error || 'فشل في تقييم المشروع');
      }
    } catch (error) {
      console.error('Error rating project:', error);
      alert('حدث خطأ أثناء تقييم المشروع');
    }
  };

  const cancelProject = async (reason: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel_project', projectId: selectedProject.id, reason })
      });
      const data = await res.json();
      if (data.success) {
        fetchProjects();
        setSelectedProject(data.project);
        alert('تم إلغاء المشروع');
      } else {
        alert(data.error || 'فشل في إلغاء المشروع');
      }
    } catch (error) {
      console.error('Error canceling project:', error);
      alert('حدث خطأ أثناء إلغاء المشروع');
    }
  };

  const filteredProjects = projects.filter(p => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return p.status === 'open';
    if (activeTab === 'in_progress') return p.status === 'in_progress';
    if (activeTab === 'completed') return p.status === 'completed';
    return true;
  });

  const openProjectDetails = (project: any) => {
    setSelectedProject(project);
    fetchProposals(project.id);
    if (project.status !== 'open') {
      fetchDeliverables(project.id);
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen pt-[55px] pb-28 antialiased overflow-x-hidden">
        {/* Animated Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 -z-10"></div>
        
        {/* Ambient Glows */}
        <div className="fixed top-[-10%] left-[-20%] w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse"></div>
        <div className="fixed bottom-[-10%] right-[-20%] w-[400px] h-[400px] bg-blue-300/30 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-[150px] pointer-events-none z-0"></div>

        {/* Header */}
        <header className="relative z-10 w-full px-6 mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold tracking-tight text-gray-800">المشاريع</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-purple-600 group"
          >
            <Plus className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </header>

        <main className="relative z-10 w-full px-6 space-y-6">
          {/* Search Bar */}
          <section className="animate-slide-up">
            <div className="relative w-full">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="ابحث عن مشروع..." 
                className="w-full bg-white shadow-lg border border-gray-100 rounded-2xl py-3 pr-12 pl-4 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all" 
              />
            </div>
          </section>

          {/* Tabs */}
          <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
              {['all', 'open', 'in_progress', 'completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 border-b-2 text-sm font-semibold whitespace-nowrap ${
                    activeTab === tab
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 transition-colors'
                  }`}
                >
                  {tab === 'all' && 'الكل'}
                  {tab === 'open' && 'مفتوح'}
                  {tab === 'in_progress' && 'قيد التنفيذ'}
                  {tab === 'completed' && 'مكتمل'}
                </button>
              ))}
            </div>
          </section>

          {/* Projects List */}
          <section className="flex flex-col gap-4 animate-slide-up pb-6" style={{ animationDelay: '0.2s' }}>
            {filteredProjects.length === 0 ? (
              <div className="bg-white shadow-lg rounded-[24px] p-8 text-center border border-gray-200">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">لا توجد مشاريع</h3>
                <p className="text-sm text-gray-600 mb-4">لم يتم العثور على أي مشاريع حالياً</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-purple-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-600 active:scale-95 transition-all"
                >
                  إنشاء مشروع جديد
                </button>
              </div>
            ) : (
              filteredProjects.map((project) => (
              <div 
                key={project.id}
                onClick={() => openProjectDetails(project)}
                className="group relative overflow-hidden bg-white shadow-lg rounded-[24px] p-5 active:scale-[0.99] transition-all cursor-pointer border border-gray-100 hover:shadow-xl"
              >
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                    project.status === 'open' ? 'bg-green-100 text-green-700 border border-green-200' :
                    project.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                    project.status === 'completed' ? 'bg-purple-100 text-purple-700 border border-purple-200' :
                    'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      project.status === 'open' ? 'bg-green-500' :
                      project.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                      project.status === 'completed' ? 'bg-purple-500' :
                      'bg-gray-500'
                    }`}></span>
                    {project.status === 'open' && 'مفتوح'}
                    {project.status === 'in_progress' && 'قيد التنفيذ'}
                    {project.status === 'completed' && 'مكتمل'}
                    {project.status === 'cancelled' && 'ملغي'}
                  </span>
                </div>

                <h3 className="font-display font-bold text-lg text-gray-800 mb-1 mt-8">{project.title}</h3>
                <p className="text-xs text-gray-600 mb-4">{project.description}</p>

                {/* Skills */}
                {project.skills && project.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-1 rounded-md bg-purple-50 border border-purple-100 text-[10px] text-purple-700">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress Bar for In-Progress Projects */}
                {project.status === 'in_progress' && (
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-gray-600 font-medium">التقدم</span>
                      <span className="text-gray-800 font-bold">{project.progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full relative overflow-hidden transition-all" 
                        style={{ width: `${project.progress}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20"></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>⏱️ {project.duration}</span>
                    <span>📝 {project.proposals} عرض</span>
                  </div>
                  <span className="text-gray-800 font-bold text-base">${project.budget}</span>
                </div>
              </div>
            )))}
          </section>
        </main>

        {/* Create Project Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold">إنشاء مشروع جديد</h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createProject({
                  title: formData.get('title'),
                  description: formData.get('description'),
                  budget_min: formData.get('budget_min'),
                  budget_max: formData.get('budget_max'),
                  deadline: formData.get('deadline'),
                  category: formData.get('category'),
                  skills: (formData.get('skills') as string).split(',').map(s => s.trim())
                });
              }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">عنوان المشروع *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="مثال: تصميم موقع إلكتروني"
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">الوصف *</label>
                  <textarea
                    name="description"
                    required
                    placeholder="اشرح تفاصيل المشروع والمتطلبات..."
                    rows={4}
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">الميزانية الأدنى ($) *</label>
                    <input
                      type="number"
                      name="budget_min"
                      required
                      placeholder="1000"
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">الميزانية الأعلى ($) *</label>
                    <input
                      type="number"
                      name="budget_max"
                      required
                      placeholder="5000"
                      className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">الموعد النهائي *</label>
                  <input
                    type="date"
                    name="deadline"
                    required
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">الفئة *</label>
                  <select
                    name="category"
                    required
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">اختر الفئة</option>
                    <option value="تطوير">تطوير</option>
                    <option value="تصميم">تصميم</option>
                    <option value="كتابة">كتابة</option>
                    <option value="تسويق">تسويق</option>
                    <option value="ترجمة">ترجمة</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">المهارات المطلوبة (افصل بفاصلة)</label>
                  <input
                    type="text"
                    name="skills"
                    placeholder="React, Node.js, MongoDB"
                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600 active:scale-95 transition-all"
                  >
                    إنشاء المشروع
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 active:scale-95 transition-all"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Project Details Modal */}
        {selectedProject && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-2xl w-full my-8">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <h2 className="text-xl font-bold">{selectedProject.title}</h2>
                <button 
                  onClick={() => setSelectedProject(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Project Info */}
                <div>
                  <h3 className="font-bold mb-2">الوصف</h3>
                  <p className="text-gray-600">{selectedProject.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">الميزانية</span>
                    <p className="font-bold text-lg">${selectedProject.budget}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">المدة</span>
                    <p className="font-bold text-lg">{selectedProject.duration}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">الحالة</span>
                    <p className="font-bold text-lg">
                      {selectedProject.status === 'open' && 'مفتوح'}
                      {selectedProject.status === 'in_progress' && 'قيد التنفيذ'}
                      {selectedProject.status === 'completed' && 'مكتمل'}
                      {selectedProject.status === 'cancelled' && 'ملغي'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">عدد العروض</span>
                    <p className="font-bold text-lg">{selectedProject.proposals}</p>
                  </div>
                </div>

                {/* Skills */}
                {selectedProject.skills && selectedProject.skills.length > 0 && (
                  <div>
                    <h3 className="font-bold mb-2">المهارات المطلوبة</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-sm text-purple-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Proposals Section */}
                {selectedProject.status === 'open' && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">العروض المقدمة ({proposals.length})</h3>
                      <button
                        onClick={() => setShowProposalModal(true)}
                        className="bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-600"
                      >
                        تقديم عرض
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {proposals.map((proposal) => (
                        <div key={proposal.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-bold">{proposal.freelancerName}</p>
                              <p className="text-sm text-gray-600">{proposal.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              proposal.status === 'accepted' ? 'bg-green-100 text-green-700' :
                              proposal.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {proposal.status === 'accepted' && 'مقبول'}
                              {proposal.status === 'rejected' && 'مرفوض'}
                              {proposal.status === 'pending' && 'قيد المراجعة'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t">
                            <div className="flex gap-4 text-sm">
                              <span className="font-bold text-purple-600">${proposal.price}</span>
                              <span className="text-gray-600">{proposal.duration}</span>
                            </div>
                            
                            {proposal.status === 'pending' && selectedProject.ownerId === 'currentUser' && (
                              <button
                                onClick={() => acceptProposal(proposal.id, proposal.price, proposal.freelancerId)}
                                className="bg-green-500 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-green-600"
                              >
                                💰 قبول ودفع
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* In Progress Section */}
                {selectedProject.status === 'in_progress' && (
                  <div>
                    <h3 className="font-bold mb-4">التقدم في العمل</h3>
                    
                    {/* Progress Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 font-medium">التقدم</span>
                        <span className="text-gray-800 font-bold">{selectedProject.progress}%</span>
                      </div>
                      <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-500 rounded-full transition-all" 
                          style={{ width: `${selectedProject.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Deliverables */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold">المسلمات</h4>
                        {selectedProject.acceptedProposal?.freelancerId === 'currentUser' && (
                          <button
                            onClick={() => setShowDeliverableModal(true)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600"
                          >
                            رفع مسلم
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        {deliverables.map((deliverable) => (
                          <div key={deliverable.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-bold">{deliverable.title}</p>
                                <p className="text-sm text-gray-600">{deliverable.description}</p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-bold ${
                                deliverable.status === 'approved' ? 'bg-green-100 text-green-700' :
                                deliverable.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {deliverable.status === 'approved' && 'موافق عليه'}
                                {deliverable.status === 'rejected' && 'مرفوض'}
                                {deliverable.status === 'pending_review' && 'قيد المراجعة'}
                              </span>
                            </div>
                            
                            {deliverable.status === 'pending_review' && selectedProject.ownerId === 'currentUser' && (
                              <div className="flex gap-2 mt-3 pt-3 border-t">
                                <button
                                  onClick={() => approveDeliverable(deliverable.id)}
                                  className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600"
                                >
                                  الموافقة
                                </button>
                                <button
                                  className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600"
                                >
                                  الرفض
                                </button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cancel Project */}
                    <button
                      onClick={() => {
                        const reason = prompt('سبب الإلغاء:');
                        if (reason) cancelProject(reason);
                      }}
                      className="w-full bg-red-100 text-red-700 py-2 rounded-lg font-semibold hover:bg-red-200 mt-4"
                    >
                      إلغاء المشروع
                    </button>
                  </div>
                )}

                {/* Completed Section */}
                {selectedProject.status === 'completed' && (
                  <div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="font-bold text-green-900">المشروع مكتمل</span>
                      </div>
                      {selectedProject.completedAt && (
                        <p className="text-sm text-green-700">
                          تم الإكمال في {new Date(selectedProject.completedAt).toLocaleDateString('ar-SA')}
                        </p>
                      )}
                    </div>

                    {/* Rating */}
                    {selectedProject.rating ? (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-bold mb-2">التقييم</h4>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < selectedProject.rating.score
                                  ? 'text-yellow-400 fill-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{selectedProject.rating.comment}</p>
                      </div>
                    ) : (
                      selectedProject.ownerId === 'currentUser' && (
                        <button
                          onClick={() => setShowRatingModal(true)}
                          className="w-full bg-purple-500 text-white py-3 rounded-lg font-semibold hover:bg-purple-600"
                        >
                          تقييم المشروع
                        </button>
                      )
                    )}
                  </div>
                )}

                {/* Cancelled Section */}
                {selectedProject.status === 'cancelled' && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="font-bold text-red-900">المشروع ملغي</span>
                    </div>
                    {selectedProject.cancellationReason && (
                      <p className="text-sm text-red-700">السبب: {selectedProject.cancellationReason}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Proposal Modal */}
        {showProposalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full">
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">تقديم عرض</h2>
                <button onClick={() => setShowProposalModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                submitProposal({
                  price: formData.get('price'),
                  duration: formData.get('duration'),
                  description: formData.get('description')
                });
              }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">السعر ($) *</label>
                  <input
                    type="number"
                    name="price"
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">المدة *</label>
                  <input
                    type="text"
                    name="duration"
                    required
                    placeholder="مثال: 30 يوم"
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">الوصف *</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-500 text-white py-3 rounded-lg font-semibold"
                  >
                    تقديم العرض
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowProposalModal(false)}
                    className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Deliverable Modal */}
        {showDeliverableModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full">
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">رفع مسلم</h2>
                <button onClick={() => setShowDeliverableModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                submitDeliverable({
                  title: formData.get('title'),
                  description: formData.get('description'),
                  files: []
                });
              }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">العنوان *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">الوصف *</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-3 rounded-lg font-semibold"
                  >
                    رفع المسلم
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeliverableModal(false)}
                    className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full">
              <div className="border-b px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">تقييم المشروع</h2>
                <button onClick={() => setShowRatingModal(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                rateProject({
                  score: formData.get('score'),
                  comment: formData.get('comment')
                });
              }} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">التقييم *</label>
                  <select
                    name="score"
                    required
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="">اختر التقييم</option>
                    <option value="5">⭐⭐⭐⭐⭐ ممتاز</option>
                    <option value="4">⭐⭐⭐⭐ جيد جداً</option>
                    <option value="3">⭐⭐⭐ جيد</option>
                    <option value="2">⭐⭐ مقبول</option>
                    <option value="1">⭐ ضعيف</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">التعليق *</label>
                  <textarea
                    name="comment"
                    required
                    rows={4}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-500 text-white py-3 rounded-lg font-semibold"
                  >
                    إرسال التقييم
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRatingModal(false)}
                    className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </ProtectedRoute>
  );
}
