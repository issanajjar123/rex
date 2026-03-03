'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  budget_min: number;
  budget_max: number;
  category: string;
  user_name: string;
  user_email: string;
  created_at: string;
  approval_status: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

interface Job {
  id: number;
  title: string;
  description: string;
  budget: number;
  category: string;
  location: string;
  user_name: string;
  user_email: string;
  created_at: string;
  approval_status: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

interface Offer {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  user_name: string;
  user_email: string;
  created_at: string;
  approval_status: string;
  reviewed_by_name?: string;
  reviewed_at?: string;
  rejection_reason?: string;
}

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<'projects' | 'jobs' | 'offers'>('projects');
  const [statusFilter, setStatusFilter] = useState<'pending_approval' | 'approved' | 'rejected'>('pending_approval');
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (activeTab === 'projects') {
        const res = await fetch(`${apiUrl}/api/admin/projects?status=${statusFilter}`);
        const data = await res.json();
        setProjects(data.projects || []);
      } else if (activeTab === 'jobs') {
        const res = await fetch(`${apiUrl}/api/admin/jobs?status=${statusFilter}`);
        const data = await res.json();
        setJobs(data.jobs || []);
      } else {
        const res = await fetch(`${apiUrl}/api/admin/offers?status=${statusFilter}`);
        const data = await res.json();
        setOffers(data.offers || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, type: string) => {
    try {
      const adminUser = localStorage.getItem('adminUser');
      if (!adminUser) return;
      
      const admin = JSON.parse(adminUser);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      const endpoint = type === 'project' ? 'projects' : type === 'job' ? 'jobs' : 'offers';
      const idKey = type === 'project' ? 'projectId' : type === 'job' ? 'jobId' : 'offerId';
      
      const res = await fetch(`${apiUrl}/api/admin/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [idKey]: id,
          action: 'approve',
          adminId: admin.id
        })
      });

      if (res.ok) {
        alert('Approved successfully!');
        fetchData();
      } else {
        alert('Failed to approve');
      }
    } catch (error) {
      console.error('Error approving:', error);
      alert('Error approving');
    }
  };

  const openRejectModal = (item: any) => {
    setSelectedItem(item);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const adminUser = localStorage.getItem('adminUser');
      if (!adminUser) return;
      
      const admin = JSON.parse(adminUser);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      
      const endpoint = activeTab === 'projects' ? 'projects' : activeTab === 'jobs' ? 'jobs' : 'offers';
      const idKey = activeTab === 'projects' ? 'projectId' : activeTab === 'jobs' ? 'jobId' : 'offerId';
      
      const res = await fetch(`${apiUrl}/api/admin/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          [idKey]: selectedItem.id,
          action: 'reject',
          adminId: admin.id,
          reason: rejectionReason
        })
      });

      if (res.ok) {
        alert('Rejected successfully!');
        setShowRejectModal(false);
        fetchData();
      } else {
        alert('Failed to reject');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Error rejecting');
    }
  };

  const renderContent = () => {
    const data = activeTab === 'projects' ? projects : activeTab === 'jobs' ? jobs : offers;

    if (loading) {
      return <div className="text-center py-8">Loading...</div>;
    }

    if (data.length === 0) {
      return <div className="text-center py-8 text-gray-500">No items found</div>;
    }

    return (
      <div className="space-y-4">
        {data.map((item: any) => (
          <div key={item.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                
                <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                  <span className="bg-blue-50 px-3 py-1 rounded-full">{item.category}</span>
                  {activeTab === 'projects' && (
                    <span className="bg-green-50 px-3 py-1 rounded-full">
                      ${item.budget_min} - ${item.budget_max}
                    </span>
                  )}
                  {activeTab === 'jobs' && (
                    <>
                      <span className="bg-green-50 px-3 py-1 rounded-full">${item.budget}</span>
                      <span className="bg-purple-50 px-3 py-1 rounded-full">{item.location}</span>
                    </>
                  )}
                  {activeTab === 'offers' && (
                    <span className="bg-green-50 px-3 py-1 rounded-full">${item.price}</span>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  <p>Posted by: <span className="font-medium">{item.user_name}</span> ({item.user_email})</p>
                  <p>Posted: {new Date(item.created_at).toLocaleString()}</p>
                  {item.reviewed_at && (
                    <p>Reviewed by: <span className="font-medium">{item.reviewed_by_name}</span> on {new Date(item.reviewed_at).toLocaleString()}</p>
                  )}
                  {item.rejection_reason && (
                    <p className="text-red-600 mt-2">Rejection reason: {item.rejection_reason}</p>
                  )}
                </div>
              </div>

              {statusFilter === 'pending_approval' && (
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(item.id, activeTab.slice(0, -1))}
                    className="flex items-center gap-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(item)}
                    className="flex items-center gap-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}

              {statusFilter === 'approved' && (
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-5 h-5" /> Approved
                </span>
              )}

              {statusFilter === 'rejected' && (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <XCircle className="w-5 h-5" /> Rejected
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Content Approval</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'projects'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'jobs'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Jobs
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'offers'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Offers
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setStatusFilter('pending_approval')}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'pending_approval'
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending
        </button>
        <button
          onClick={() => setStatusFilter('approved')}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'approved'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Approved
        </button>
        <button
          onClick={() => setStatusFilter('rejected')}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
            statusFilter === 'rejected'
              ? 'bg-red-100 text-red-800 border border-red-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <XCircle className="w-4 h-4" />
          Rejected
        </button>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Reject Content</h2>
            <p className="text-gray-600 mb-4">Please provide a reason for rejection:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px]"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
