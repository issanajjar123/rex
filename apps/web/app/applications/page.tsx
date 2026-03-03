'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/auth-store';
import Header from '@/app/components/Header';

interface Application {
  id: number;
  job_id: number;
  job_title: string;
  cover_letter: string;
  status: string;
  created_at: string;
}

export default function Applications() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // جلب الطلبات
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobs?userId=${user.id}&action=my-applications`)
      .then((res) => res.json())
      .then((data) => {
        if (data.applications) {
          setApplications(data.applications);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching applications:', err);
        setLoading(false);
      });
  }, [user, router]);

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'قيد المراجعة' },
      accepted: { bg: 'bg-green-100', text: 'text-green-700', label: 'مقبول' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'مرفوض' },
    };

    const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {style.label}
      </span>
    );
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50" style={{ direction: 'rtl' }}>
      <Header title="طلبات العمل" />

      <div className="pb-20 p-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="text-center py-16">
            <i className="ph ph-briefcase text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد طلبات</h3>
            <p className="text-gray-500 mb-6">لم تتقدم لأي وظائف بعد</p>
            <button
              onClick={() => router.push('/jobs')}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              تصفح الوظائف
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{app.job_title}</h3>
                    <p className="text-sm text-gray-500">
                      {new Date(app.created_at).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                  {getStatusBadge(app.status)}
                </div>

                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{app.cover_letter}</p>

                <button
                  onClick={() => router.push(`/jobs/${app.job_id}`)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  عرض تفاصيل الوظيفة ←
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
