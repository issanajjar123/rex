'use client';

import { useEffect, useState } from 'react';
import StatsCard from '../../components/admin/StatsCard';
import { 
  Users, 
  Briefcase, 
  FolderKanban, 
  DollarSign, 
  Wallet,
  Shield,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
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
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">لوحة التحكم</h1>
        <p className="text-gray-500">مرحباً بك في لوحة إدارة المنصة</p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="إجمالي المستخدمين"
          value={stats?.users?.total || 0}
          icon={Users}
          color="bg-blue-500"
          subtitle={`${stats?.users?.newToday || 0} جديد اليوم`}
        />
        <StatsCard
          title="الوظائف النشطة"
          value={stats?.jobs?.active || 0}
          icon={Briefcase}
          color="bg-green-500"
          subtitle={`من ${stats?.jobs?.total || 0} إجمالي`}
        />
        <StatsCard
          title="المشاريع النشطة"
          value={stats?.projects?.active || 0}
          icon={FolderKanban}
          color="bg-purple-500"
          subtitle={`من ${stats?.projects?.total || 0} إجمالي`}
        />
        <StatsCard
          title="العروض النشطة"
          value={stats?.offers?.active || 0}
          icon={DollarSign}
          color="bg-orange-500"
          subtitle={`من ${stats?.offers?.total || 0} إجمالي`}
        />
      </div>

      {/* إحصائيات المحفظة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="إجمالي الأرصدة"
          value={`$${stats?.wallet?.totalBalance?.toFixed(2) || '0.00'}`}
          icon={Wallet}
          color="bg-teal-500"
        />
        <StatsCard
          title="الأرصدة المحجوزة"
          value={`$${stats?.wallet?.totalHeld?.toFixed(2) || '0.00'}`}
          icon={Shield}
          color="bg-yellow-500"
        />
        <StatsCard
          title="إجمالي العمولات"
          value={`$${stats?.escrow?.totalCommission?.toFixed(2) || '0.00'}`}
          icon={TrendingUp}
          color="bg-pink-500"
        />
        <StatsCard
          title="معاملات الضمان النشطة"
          value={stats?.escrow?.active || 0}
          icon={Shield}
          color="bg-indigo-500"
        />
      </div>

      {/* الطلبات المعلقة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-800">طلبات معلقة</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">طلبات التحقق من الهوية</span>
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-semibold">
                {stats?.pending?.kyc || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">طلبات السحب</span>
              <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-semibold">
                {stats?.pending?.withdrawals || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-green-500" />
            <h2 className="text-xl font-bold text-gray-800">المستخدمون الموثقون</h2>
          </div>
          <div className="text-center py-8">
            <p className="text-5xl font-bold text-green-600 mb-2">
              {stats?.users?.verified || 0}
            </p>
            <p className="text-gray-500">مستخدم موثق</p>
          </div>
        </div>
      </div>

      {/* آخر المستخدمين */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">آخر المستخدمين المسجلين</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الاسم</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">البريد الإلكتروني</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الدور</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">حالة KYC</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats?.recentUsers?.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-800">{user.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {user.role === 'admin' ? 'مسؤول' : 'مستخدم'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.kyc_status === 'verified' ? 'bg-green-100 text-green-600' :
                      user.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.kyc_status === 'verified' ? 'موثق' :
                       user.kyc_status === 'pending' ? 'معلق' : 'غير موثق'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* آخر المعاملات */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">آخر معاملات المحفظة</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المستخدم</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">النوع</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">الوصف</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats?.recentTransactions?.map((transaction: any) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{transaction.user_name}</p>
                      <p className="text-xs text-gray-500">{transaction.user_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                      transaction.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {transaction.type === 'deposit' ? 'إيداع' :
                       transaction.type === 'withdrawal' ? 'سحب' : transaction.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                    ${transaction.amount}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{transaction.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(transaction.created_at).toLocaleDateString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
