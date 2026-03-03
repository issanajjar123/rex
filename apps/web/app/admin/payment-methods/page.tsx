'use client';

import { useState, useEffect } from 'react';

interface PaymentMethod {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  method_type: string;
  provider: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  iban: string;
  swift_code: string;
  paypal_email: string;
  approval_status: string;
  approved_by_name: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPaymentMethods();
  }, [filter]);

  const fetchPaymentMethods = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/payment-methods?status=${filter}`
      );
      const data = await res.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Are you sure you want to approve this payment method?')) return;

    setProcessing(true);
    try {
      const adminId = localStorage.getItem('adminId');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/payment-methods`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: 'approve', adminId }),
        }
      );

      if (res.ok) {
        alert('Payment method approved successfully');
        fetchPaymentMethods();
        setSelectedMethod(null);
      } else {
        alert('Failed to approve payment method');
      }
    } catch (error) {
      console.error('Error approving payment method:', error);
      alert('Error approving payment method');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!rejectReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const adminId = localStorage.getItem('adminId');
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/payment-methods`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, action: 'reject', adminId, reason: rejectReason }),
        }
      );

      if (res.ok) {
        alert('Payment method rejected');
        fetchPaymentMethods();
        setSelectedMethod(null);
        setRejectReason('');
      } else {
        alert('Failed to reject payment method');
      }
    } catch (error) {
      console.error('Error rejecting payment method:', error);
      alert('Error rejecting payment method');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>
        <p className="text-gray-600 mt-1">Review and approve user payment methods</p>
      </div>

      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected', 'all'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold text-gray-900">
                    {method.method_type.toUpperCase()} - {method.provider}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(method.approval_status)}`}>
                    {method.approval_status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>User:</strong> {method.user_name} ({method.user_email})</p>
                  <p><strong>Phone:</strong> {method.user_phone}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">#{method.id}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-gray-600">Account Holder</p>
                <p className="font-medium text-gray-900">{method.account_holder_name}</p>
              </div>
              {method.method_type === 'bank' && (
                <>
                  <div>
                    <p className="text-gray-600">Bank Name</p>
                    <p className="font-medium text-gray-900">{method.bank_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Account Number</p>
                    <p className="font-medium text-gray-900">{method.account_number}</p>
                  </div>
                  {method.iban && (
                    <div>
                      <p className="text-gray-600">IBAN</p>
                      <p className="font-medium text-gray-900">{method.iban}</p>
                    </div>
                  )}
                  {method.swift_code && (
                    <div>
                      <p className="text-gray-600">SWIFT Code</p>
                      <p className="font-medium text-gray-900">{method.swift_code}</p>
                    </div>
                  )}
                </>
              )}
              {method.method_type === 'paypal' && (
                <div>
                  <p className="text-gray-600">PayPal Email</p>
                  <p className="font-medium text-gray-900">{method.paypal_email}</p>
                </div>
              )}
            </div>

            {method.rejection_reason && (
              <div className="mb-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-800">
                  <strong>Rejection Reason:</strong> {method.rejection_reason}
                </p>
              </div>
            )}

            {method.approval_status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => handleApprove(method.id)}
                  disabled={processing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => setSelectedMethod(method)}
                  disabled={processing}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}

            {method.approved_at && (
              <p className="text-sm text-gray-500 mt-4">
                {method.approval_status === 'approved' ? 'Approved' : 'Rejected'} by {method.approved_by_name} on{' '}
                {new Date(method.approved_at).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No payment methods found</p>
        </div>
      )}

      {selectedMethod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Reject Payment Method</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this payment method.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedMethod(null);
                  setRejectReason('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedMethod.id)}
                disabled={processing || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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
