'use client';

import { useState, useEffect } from 'react';

interface WithdrawalRequest {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  amount: number;
  method_type: string;
  provider: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  paypal_email: string;
  status: string;
  notes: string | null;
  processed_at: string | null;
  created_at: string;
}

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    fetchWithdrawals();
  }, [filter]);

  const fetchWithdrawals = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawal-requests?status=${filter}`
      );
      const data = await res.json();
      setWithdrawals(data.withdrawalRequests || []);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedWithdrawal) return;
    
    if (actionType === 'reject' && !notes.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/withdrawal-requests`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedWithdrawal.id,
            action: actionType,
            notes: notes.trim() || undefined,
          }),
        }
      );

      if (res.ok) {
        alert(`Withdrawal ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
        fetchWithdrawals();
        setSelectedWithdrawal(null);
        setNotes('');
      } else {
        const error = await res.json();
        alert(error.error || `Failed to ${actionType} withdrawal`);
      }
    } catch (error) {
      console.error(`Error ${actionType}ing withdrawal:`, error);
      alert(`Error ${actionType}ing withdrawal`);
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
        <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
        <p className="text-gray-600 mt-1">Review and process withdrawal requests</p>
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
        {withdrawals.map((withdrawal) => (
          <div key={withdrawal.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    ${withdrawal.amount.toFixed(2)}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                    {withdrawal.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p><strong>User:</strong> {withdrawal.user_name} ({withdrawal.user_email})</p>
                  <p><strong>Phone:</strong> {withdrawal.user_phone}</p>
                  <p><strong>Requested:</strong> {new Date(withdrawal.created_at).toLocaleString()}</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">#{withdrawal.id}</span>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-900 mb-2">Payment Method Details</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600">Method</p>
                  <p className="font-medium text-gray-900">{withdrawal.method_type} - {withdrawal.provider}</p>
                </div>
                <div>
                  <p className="text-gray-600">Account Holder</p>
                  <p className="font-medium text-gray-900">{withdrawal.account_holder_name}</p>
                </div>
                {withdrawal.method_type === 'bank' && (
                  <>
                    <div>
                      <p className="text-gray-600">Bank</p>
                      <p className="font-medium text-gray-900">{withdrawal.bank_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Account Number</p>
                      <p className="font-medium text-gray-900">{withdrawal.account_number}</p>
                    </div>
                  </>
                )}
                {withdrawal.method_type === 'paypal' && (
                  <div>
                    <p className="text-gray-600">PayPal Email</p>
                    <p className="font-medium text-gray-900">{withdrawal.paypal_email}</p>
                  </div>
                )}
              </div>
            </div>

            {withdrawal.notes && (
              <div className={`mb-4 p-3 rounded-lg ${
                withdrawal.status === 'rejected' ? 'bg-red-50' : 'bg-blue-50'
              }`}>
                <p className="text-sm">
                  <strong>Notes:</strong> {withdrawal.notes}
                </p>
              </div>
            )}

            {withdrawal.status === 'pending' && (
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedWithdrawal(withdrawal);
                    setActionType('approve');
                    setNotes('');
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => {
                    setSelectedWithdrawal(withdrawal);
                    setActionType('reject');
                    setNotes('');
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            )}

            {withdrawal.processed_at && (
              <p className="text-sm text-gray-500 mt-4">
                Processed on {new Date(withdrawal.processed_at).toLocaleString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {withdrawals.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No withdrawal requests found</p>
        </div>
      )}

      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'approve' ? 'Approve' : 'Reject'} Withdrawal
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              Amount: <strong>${selectedWithdrawal.amount.toFixed(2)}</strong>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              User: <strong>{selectedWithdrawal.user_name}</strong>
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4"
              rows={4}
              placeholder={actionType === 'approve' ? 'Optional notes...' : 'Enter rejection reason...'}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedWithdrawal(null);
                  setNotes('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={processing || (actionType === 'reject' && !notes.trim())}
                className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 ${
                  actionType === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
