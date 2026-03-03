'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../lib/auth-store';
import { CheckCircle, XCircle, Clock, User, Loader, FileText } from 'lucide-react';

interface KYCVerification {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  full_name: string;
  id_number: string;
  date_of_birth: string;
  address: string;
  id_front_url: string;
  id_back_url: string;
  selfie_url: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason?: string;
  created_at: string;
  reviewed_at?: string;
}

export default function AdminKYCPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [verifications, setVerifications] = useState<KYCVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<KYCVerification | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    if (user.role !== 'admin') {
      router.push('/');
      return;
    }
    loadVerifications();
  }, [user]);

  const loadVerifications = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/kyc?admin=true`
      );
      const data = await response.json();
      setVerifications(data.verifications || []);
    } catch (error) {
      console.error('Error loading verifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (verificationId: number, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !rejectionReason.trim()) {
      alert('يرجى إدخال سبب الرفض');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kyc`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId,
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : null,
          reviewerId: user?.id
        })
      });

      if (response.ok) {
        alert(status === 'approved' ? 'تم قبول التحقق' : 'تم رفض التحقق');
        setSelectedVerification(null);
        setRejectionReason('');
        loadVerifications();
      } else {
        alert('فشل في تحديث الحالة');
      }
    } catch (error) {
      console.error('Action error:', error);
      alert('حدث خطأ');
    } finally {
      setActionLoading(false);
    }
  };

  const statusBadge = (status: string) => {
    const config = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock, label: 'قيد المراجعة' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'مقبول' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'مرفوض' }
    };
    const { bg, text, icon: Icon, label } = config[status as keyof typeof config];
    return (
      <span className={`${bg} ${text} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">مراجعة التحقق من الهوية</h1>
        <p className="text-sm text-gray-600 mt-1">
          {verifications.filter(v => v.status === 'pending').length} طلب قيد المراجعة
        </p>
      </div>

      {verifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <FileText className="w-16 h-16 text-gray-300" />
          <p className="text-gray-500 mt-4">لا توجد طلبات تحقق حالياً</p>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {verifications.map((verification) => (
            <div key={verification.id} className="bg-white rounded-lg p-4 border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{verification.full_name}</h3>
                    <p className="text-xs text-gray-500">{verification.user_email}</p>
                  </div>
                </div>
                {statusBadge(verification.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">رقم الهوية:</span>
                  <span className="font-medium">{verification.id_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ الميلاد:</span>
                  <span className="font-medium">{verification.date_of_birth}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تاريخ الطلب:</span>
                  <span className="font-medium">
                    {new Date(verification.created_at).toLocaleDateString('ar-SA')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedVerification(verification)}
                className="w-full mt-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-medium text-sm"
              >
                عرض التفاصيل والوثائق
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Details Modal */}
      {selectedVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
          <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">تفاصيل التحقق</h2>
              <button
                onClick={() => setSelectedVerification(null)}
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-6">
              {/* User Info */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">المعلومات الشخصية</h3>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">الاسم:</span>
                    <span className="font-medium">{selectedVerification.full_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رقم الهوية:</span>
                    <span className="font-medium">{selectedVerification.id_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاريخ الميلاد:</span>
                    <span className="font-medium">{selectedVerification.date_of_birth}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-gray-600">العنوان:</span>
                    <span className="font-medium">{selectedVerification.address}</span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">الوثائق</h3>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">صورة الهوية (الأمام)</p>
                  <img 
                    src={selectedVerification.id_front_url} 
                    alt="ID Front" 
                    className="w-full rounded-lg border"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">صورة الهوية (الخلف)</p>
                  <img 
                    src={selectedVerification.id_back_url} 
                    alt="ID Back" 
                    className="w-full rounded-lg border"
                  />
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">الصورة الشخصية</p>
                  <img 
                    src={selectedVerification.selfie_url} 
                    alt="Selfie" 
                    className="w-full rounded-lg border"
                  />
                </div>
              </div>

              {/* Actions */}
              {selectedVerification.status === 'pending' && (
                <div className="space-y-3">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="سبب الرفض (اختياري للقبول، إجباري للرفض)"
                    className="w-full px-4 py-2 border rounded-lg text-sm"
                    rows={3}
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(selectedVerification.id, 'rejected')}
                      disabled={actionLoading}
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg font-medium disabled:bg-gray-300"
                    >
                      {actionLoading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'رفض'}
                    </button>
                    <button
                      onClick={() => handleAction(selectedVerification.id, 'approved')}
                      disabled={actionLoading}
                      className="flex-1 bg-green-500 text-white py-3 rounded-lg font-medium disabled:bg-gray-300"
                    >
                      {actionLoading ? <Loader className="w-5 h-5 animate-spin mx-auto" /> : 'قبول'}
                    </button>
                  </div>
                </div>
              )}

              {selectedVerification.status !== 'pending' && (
                <div className={`p-4 rounded-lg ${
                  selectedVerification.status === 'approved' 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className="text-sm font-medium">
                    {selectedVerification.status === 'approved' ? '✓ تم قبول هذا الطلب' : '✕ تم رفض هذا الطلب'}
                  </p>
                  {selectedVerification.rejection_reason && (
                    <p className="text-sm text-gray-700 mt-2">
                      السبب: {selectedVerification.rejection_reason}
                    </p>
                  )}
                  {selectedVerification.reviewed_at && (
                    <p className="text-xs text-gray-500 mt-1">
                      تاريخ المراجعة: {new Date(selectedVerification.reviewed_at).toLocaleDateString('ar-SA')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
