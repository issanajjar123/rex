'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/auth-store';
import Header from '@/app/components/Header';

export default function Settings() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');

  const [settings, setSettings] = useState({
    language: 'ar',
    notificationsEnabled: true,
    darkMode: false,
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }

    // جلب الإعدادات
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSettings({
            language: data.settings.language || 'ar',
            notificationsEnabled: data.settings.notifications_enabled ?? true,
            darkMode: data.settings.dark_mode ?? false,
          });
        }
      })
      .catch((err) => console.error('Error fetching settings:', err));
  }, [user, router]);

  const handleUpdateSettings = async (updatedSettings: Partial<typeof settings>) => {
    if (!user) return;

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          ...updatedSettings,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSettings({ ...settings, ...data.settings });
      } else {
        alert(data.error || 'فشل التحديث');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!confirm('هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه!')) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/settings`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          password: deletePassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('تم حذف حسابك بنجاح');
        logout();
        router.push('/auth/signin');
      } else {
        alert(data.error || 'فشل حذف الحساب');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('حدث خطأ أثناء حذف الحساب');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50" style={{ direction: 'rtl' }}>
      <Header title="الإعدادات" />

      <div className="pb-20 p-4 space-y-4">
        {/* اللغة */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <i className="ph ph-globe text-2xl text-blue-600"></i>
              <div>
                <h3 className="font-bold text-gray-800">اللغة</h3>
                <p className="text-sm text-gray-500">اختر لغة التطبيق</p>
              </div>
            </div>
          </div>

          <select
            value={settings.language}
            onChange={(e) => {
              const newSettings = { ...settings, language: e.target.value };
              setSettings(newSettings);
              handleUpdateSettings({ language: e.target.value });
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>

        {/* الإشعارات */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="ph ph-bell text-2xl text-blue-600"></i>
              <div>
                <h3 className="font-bold text-gray-800">الإشعارات</h3>
                <p className="text-sm text-gray-500">تلقي التنبيهات والإشعارات</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => {
                  const newSettings = { ...settings, notificationsEnabled: e.target.checked };
                  setSettings(newSettings);
                  handleUpdateSettings({ notificationsEnabled: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* الوضع الليلي */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <i className="ph ph-moon text-2xl text-blue-600"></i>
              <div>
                <h3 className="font-bold text-gray-800">الوضع الليلي</h3>
                <p className="text-sm text-gray-500">تفعيل الثيم الداكن</p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => {
                  const newSettings = { ...settings, darkMode: e.target.checked };
                  setSettings(newSettings);
                  handleUpdateSettings({ darkMode: e.target.checked });
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* الخصوصية */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <i className="ph ph-lock text-2xl text-blue-600"></i>
            <div>
              <h3 className="font-bold text-gray-800">الخصوصية والأمان</h3>
              <p className="text-sm text-gray-500">إدارة خصوصية حسابك</p>
            </div>
          </div>

          <div className="space-y-3">
            <button className="w-full text-right px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="text-gray-700">من يمكنه رؤية ملفي الشخصي</span>
            </button>
            <button className="w-full text-right px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="text-gray-700">من يمكنه مراسلتي</span>
            </button>
            <button className="w-full text-right px-4 py-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <span className="text-gray-700">حظر المستخدمين</span>
            </button>
          </div>
        </div>

        {/* حذف الحساب */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <i className="ph ph-warning text-2xl text-red-600"></i>
            <div>
              <h3 className="font-bold text-red-600">منطقة الخطر</h3>
              <p className="text-sm text-gray-500">إجراءات لا يمكن التراجع عنها</p>
            </div>
          </div>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-600 text-white font-medium py-3 rounded-xl hover:bg-red-700 transition-colors"
          >
            حذف الحساب نهائياً
          </button>
        </div>
      </div>

      {/* Modal حذف الحساب */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" style={{ direction: 'rtl' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-red-600">حذف الحساب نهائياً</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <i className="ph ph-x text-2xl"></i>
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-600">
                <strong>تحذير:</strong> سيتم حذف جميع بياناتك بشكل نهائي بما في ذلك:
              </p>
              <ul className="list-disc list-inside text-sm text-red-600 mt-2 mr-2">
                <li>الملف الشخصي والرسائل</li>
                <li>المحفظة والمعاملات</li>
                <li>الطلبات والمشاريع</li>
                <li>بيانات التحقق من الهوية</li>
              </ul>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أدخل كلمة المرور للتأكيد
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="كلمة المرور"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 text-white font-medium py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'جارٍ الحذف...' : 'نعم، احذف حسابي نهائياً'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
