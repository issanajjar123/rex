'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye, User, Mail, Calendar, MapPin, FileText } from 'lucide-react';

interface KYCVerification {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  id_front_url: string;
  id_back_url: string;
  selfie_url: string;
  full_name: string;
  id_number: string;
  date_of_birth: string;
  address: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  reviewed_by?: number;
  reviewed_at?: string;
  created_at: string;
}

export default function AdminKYCPage() {
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const res = await fetch('/api/kyc?admin=true');
      const data = await res.json();
      setVerifications(data.verifications || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (verificationId: number) => {
    if (!confirm('Are you sure you want to approve this verification?')) return;

    setProcessing(true);
    try {
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const res = await fetch('/api/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          status: 'approved',
          reviewerId: adminUser.id
        })
      });

      if (res.ok) {
        alert('Verification approved successfully');
        setSelectedVerification(null);
        fetchVerifications();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to approve verification');
      }
    } catch (error) {
      console.error('Error approving verification:', error);
      alert('Failed to approve verification');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (verificationId: number) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    if (!confirm('Are you sure you want to reject this verification?')) return;

    setProcessing(true);
    try {
      const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const res = await fetch('/api/kyc', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          status: 'rejected',
          rejectionReason: rejectionReason,
          reviewerId: adminUser.id
        })
      });

      if (res.ok) {
        alert('Verification rejected successfully');
        setSelectedVerification(null);
        setRejectionReason('');
        fetchVerifications();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to reject verification');
      }
    } catch (error) {
      console.error('Error rejecting verification:', error);
      alert('Failed to reject verification');
    } finally {
      setProcessing(false);
    }
  };

  const filteredVerifications = verifications.filter(v => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.status === 'pending').length,
    approved: verifications.filter(v => v.status === 'approved').length,
    rejected: verifications.filter(v => v.status === 'rejected').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">KYC Verifications</h1>
        <p className="text-gray-500">Review and manage identity verifications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total</p>
              <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <FileText className="w-10 h-10 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Pending</p>
              <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Approved</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Rejected</p>
              <p className="text-3xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 font-medium ${
              filter === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-6 py-3 font-medium ${
              filter === 'pending'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending ({stats.pending})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-6 py-3 font-medium ${
              filter === 'approved'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Approved ({stats.approved})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-6 py-3 font-medium ${
              filter === 'rejected'
                ? 'text-red-600 border-b-2 border-red-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rejected ({stats.rejected})
          </button>
        </div>
      </div>

      {/* Verifications List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">User</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Full Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">ID Number</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Submitted</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredVerifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No verifications found
                  </td>
                </tr>
              ) : (
                filteredVerifications.map((verification) => (
                  <tr key={verification.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{verification.user_name}</p>
                        <p className="text-sm text-gray-500">{verification.user_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-800">{verification.full_name}</td>
                    <td className="px-6 py-4 text-gray-600">{verification.id_number}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          verification.status === 'approved'
                            ? 'bg-green-100 text-green-600'
                            : verification.status === 'rejected'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-orange-100 text-orange-600'
                        }`}
                      >
                        {verification.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(verification.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setSelectedVerification(verification)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verification Details Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">KYC Verification Details</h2>
                <button
                  onClick={() => {
                    setSelectedVerification(null);
                    setRejectionReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center gap-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedVerification.status === 'approved'
                      ? 'bg-green-100 text-green-600'
                      : selectedVerification.status === 'rejected'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-orange-100 text-orange-600'
                  }`}
                >
                  {selectedVerification.status}
                </span>
                <span className="text-sm text-gray-500">
                  Submitted: {new Date(selectedVerification.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-6">
              {/* User Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">User Name</p>
                      <p className="font-medium text-gray-800">{selectedVerification.user_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{selectedVerification.user_email}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* KYC Details */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">KYC Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Full Name</p>
                    <p className="font-medium text-gray-800">{selectedVerification.full_name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ID Number</p>
                    <p className="font-medium text-gray-800">{selectedVerification.id_number}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Date of Birth</p>
                      <p className="font-medium text-gray-800">
                        {new Date(selectedVerification.date_of_birth).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-medium text-gray-800">{selectedVerification.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Uploaded Documents</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">ID Front</p>
                    <a
                      href={selectedVerification.id_front_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={selectedVerification.id_front_url}
                        alt="ID Front"
                        className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer"
                      />
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">ID Back</p>
                    <a
                      href={selectedVerification.id_back_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={selectedVerification.id_back_url}
                        alt="ID Back"
                        className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer"
                      />
                    </a>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Selfie</p>
                    <a
                      href={selectedVerification.selfie_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={selectedVerification.selfie_url}
                        alt="Selfie"
                        className="w-full h-40 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer"
                      />
                    </a>
                  </div>
                </div>
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedVerification.status === 'rejected' && selectedVerification.rejection_reason && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Rejection Reason</h3>
                  <p className="text-gray-700 bg-red-50 p-4 rounded-lg">
                    {selectedVerification.rejection_reason}
                  </p>
                </div>
              )}

              {/* Actions (only for pending) */}
              {selectedVerification.status === 'pending' && (
                <div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleApprove(selectedVerification.id)}
                      disabled={processing}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {processing ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleReject(selectedVerification.id)}
                      disabled={processing}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      {processing ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
