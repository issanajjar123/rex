'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, Search, Shield, User, Trash2, Lock, Unlock } from 'lucide-react';
import Link from 'next/link';

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'freelancer' | 'admin';
  status: 'active' | 'banned' | 'suspended';
  created_at: string;
  balance?: number;
  kyc_status?: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionType, setActionType] = useState<'ban' | 'unban' | 'role' | 'delete' | null>(null);
  const [newRole, setNewRole] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter }),
        ...(statusFilter && { status: statusFilter }),
        page: page.toString()
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedUser || !actionType) return;

    try {
      setActionLoading(true);
      const token = localStorage.getItem('adminToken');
      const adminId = localStorage.getItem('adminId');

      const body: any = { action: actionType };
      if (actionType === 'role') body.role = newRole;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users/${selectedUser.id}`,
        {
          method: actionType === 'delete' ? 'DELETE' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-admin-id': adminId || ''
          },
          body: JSON.stringify(body)
        }
      );

      if (!response.ok) throw new Error('Action failed');

      setShowModal(false);
      setSelectedUser(null);
      setActionType(null);
      fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'banned': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === 'admin') return <Shield className="w-4 h-4" />;
    return <User className="w-4 h-4" />;
  };

  if (loading && !users.length) {
    return <div className="p-4 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">إدارة المستخدمين</h1>
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="ابحث عن المستخدم..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الأدوار</option>
              <option value="user">مستخدم</option>
              <option value="freelancer">مستقل</option>
              <option value="admin">إدمن</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="banned">محظور</option>
              <option value="suspended">معلق</option>
            </select>
          </div>

          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-4">
              {error}
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">المستخدم</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">البريد</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">الدور</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">الحالة</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">تاريخ الإنشاء</th>
                  <th className="px-6 py-3 text-right font-semibold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {user.role === 'freelancer' ? 'مستقل' : user.role === 'admin' ? 'إدمن' : 'مستخدم'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status === 'active' ? 'نشط' : user.status === 'banned' ? 'محظور' : 'معلق'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        إجراءات
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end z-50">
          <div className="bg-white w-full rounded-t-2xl p-6 max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">إجراءات - {selectedUser.name}</h3>

            {actionType === null ? (
              <div className="grid grid-cols-2 gap-3">
                {selectedUser.status !== 'banned' && (
                  <button
                    onClick={() => setActionType('ban')}
                    className="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-medium flex items-center gap-2"
                  >
                    <Lock className="w-5 h-5" />
                    حظر
                  </button>
                )}

                {selectedUser.status === 'banned' && (
                  <button
                    onClick={() => setActionType('unban')}
                    className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium flex items-center gap-2"
                  >
                    <Unlock className="w-5 h-5" />
                    إلغاء حظر
                  </button>
                )}

                {selectedUser.role !== 'admin' && (
                  <button
                    onClick={() => setActionType('role')}
                    className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium flex items-center gap-2"
                  >
                    <Shield className="w-5 h-5" />
                    تغيير الدور
                  </button>
                )}

                <button
                  onClick={() => setActionType('delete')}
                  className="p-4 bg-red-50 hover:bg-red-100 rounded-lg text-red-700 font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  حذف
                </button>
              </div>
            ) : actionType === 'role' ? (
              <div className="space-y-4">
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر دوراً جديداً</option>
                  <option value="user">مستخدم</option>
                  <option value="freelancer">مستقل</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={handleAction}
                    disabled={!newRole || actionLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg disabled:opacity-50"
                  >
                    {actionLoading ? 'جاري...' : 'تأكيد'}
                  </button>
                  <button
                    onClick={() => {
                      setActionType(null);
                      setNewRole('');
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 rounded-lg"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  {actionType === 'ban' && 'هل تريد حقاً حظر هذا المستخدم؟'}
                  {actionType === 'unban' && 'هل تريد حقاً إلغاء حظر هذا المستخدم؟'}
                  {actionType === 'delete' && 'هل تريد حقاً حذف هذا المستخدم؟ (سيتم حذف ناعم)'}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAction}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg disabled:opacity-50"
                  >
                    {actionLoading ? 'جاري...' : 'تأكيد'}
                  </button>
                  <button
                    onClick={() => {
                      setActionType(null);
                    }}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 rounded-lg"
                  >
                    إلغاء
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
