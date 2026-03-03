'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    fetchOffers();
  }, [statusFilter, categoryFilter]);

  const fetchOffers = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await fetch(`/api/admin/offers?${params}`);
      const data = await res.json();
      setOffers(data.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (offerId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا العرض؟')) return;

    try {
      const res = await fetch(`/api/admin/offers?offerId=${offerId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        alert('تم حذف العرض بنجاح');
        fetchOffers();
      }
    } catch (error) {
      console.error('Error deleting offer:', error);
      alert('حدث خطأ في حذف العرض');
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">إدارة عروض الأسعار</h1>
        <p className="text-gray-500">عرض وإدارة جميع عروض الأسعار</p>
      </div>

      {/* التصفية */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="sold">مباع</option>
            <option value="inactive">غير نشط</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">جميع الفئات</option>
            <option value="خدمات">خدمات</option>
            <option value="منتجات">منتجات</option>
            <option value="استشارات">استشارات</option>
            <option value="أخرى">أخرى</option>
          </select>
        </div>
      </div>

      {/* جدول العروض */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">العنوان</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">البائع</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الفئة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">السعر</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{offer.title}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{offer.user_name}</p>
                      <p className="text-xs text-gray-500">{offer.user_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{offer.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">${offer.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      offer.status === 'active' ? 'bg-green-100 text-green-600' :
                      offer.status === 'sold' ? 'bg-blue-100 text-blue-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {offer.status === 'active' ? 'نشط' :
                       offer.status === 'sold' ? 'مباع' : 'غير نشط'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(offer.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                      title="حذف العرض"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {offers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            لا توجد عروض
          </div>
        )}
      </div>
    </div>
  );
}
