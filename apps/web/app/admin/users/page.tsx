'use client';

import { useEffect, useState } from 'react';
import { Search, Trash2, Edit } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [kycFilter, setKycFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, kycFilter]);

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);
      if (kycFilter) params.append('kyc_status', kycFilter);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId: number, newRole: string) => {
    if (!confirm('هل أنت متأكد من تغيير دور هذا المستخدم؟')) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'change_role', role: newRole }),
      });

      if (res.ok) {
        alert('تم تحديث دور المستخدم بنجاح');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error changing role:', error);
      alert('حدث خطأ في تحديث الدور');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستخدم؟ سيتم حذف جميع بياناته نهائياً.')) return;

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('تم حذف المستخدم بنجاح');
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('حدث خطأ في حذف المستخدم');
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">إدارة المستخدمين</h1>
        <p className="text-gray-500">عرض وإدارة جميع مستخدمي المنصة</p>
      </div>

      {/* البحث والتصفية */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الأدوار</option>
            <option value="user">مستخدم عادي</option>
            <option value="admin">مسؤول</option>
          </select>

          <select
            value={kycFilter}
            onChange={(e) => setKycFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع حالات KYC</option>
            <option value="verified">موثق</option>
            <option value="pending">معلق</option>
            <option value="rejected">مرفوض</option>
            <option value="not_verified">غير موثق</option>
          </select>
        </div>
      </div>

      {/* جدول المستخدمين */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المستخدم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">البريد الإلكتروني</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الدور</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">حالة KYC</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الرصيد</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">تاريخ التسجيل</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{user.name?.[0]}</span>
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      onChange={(e) => handleChangeRole(user.id, e.target.value)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-600 border-purple-300' : 'bg-blue-100 text-blue-600 border-blue-300'
                      }`}
                    >
                      <option value="user">مستخدم</option>
                      <option value="admin">مسؤول</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.kyc_status === 'verified' ? 'bg-green-100 text-green-600' :
                      user.kyc_status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                      user.kyc_status === 'rejected' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {user.kyc_status === 'verified' ? 'موثق' :
                       user.kyc_status === 'pending' ? 'معلق' :
                       user.kyc_status === 'rejected' ? 'مرفوض' : 'غير موثق'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    ${user.balance || '0.00'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="حذف المستخدم"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            لا توجد مستخدمين
          </div>
        )}
      </div>
    </div>
  );
}
