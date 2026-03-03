'use client';

import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';

export default function AdminWalletPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const res = await fetch('/api/admin/wallet');
      const data = await res.json();
      setTransactions(data.transactions || []);
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessWithdrawal = async (withdrawalId: number, action: string) => {
    const notes = action === 'reject' ? prompt('سبب الرفض (اختياري):') : '';
    
    if (action === 'reject' && notes === null) return;

    try {
      const res = await fetch('/api/admin/wallet', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId, action, notes }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        fetchWalletData();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('حدث خطأ في معالجة طلب السحب');
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">إدارة المحفظة</h1>
        <p className="text-gray-500">إدارة المعاملات وطلبات السحب</p>
      </div>

      {/* طلبات السحب المعلقة */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">طلبات السحب المعلقة</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المستخدم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">طريقة الدفع</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">تفاصيل الحساب</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {withdrawals.filter(w => w.status === 'pending').map((withdrawal) => (
                <tr key={withdrawal.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{withdrawal.user_name}</p>
                      <p className="text-xs text-gray-500">{withdrawal.user_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    ${withdrawal.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {withdrawal.method_type === 'bank_account' ? 'حساب بنكي' :
                     withdrawal.method_type === 'paypal' ? 'PayPal' : withdrawal.method_type}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {withdrawal.account_holder_name && <p>{withdrawal.account_holder_name}</p>}
                    {withdrawal.bank_name && <p className="text-xs">{withdrawal.bank_name}</p>}
                    {withdrawal.account_number && <p className="text-xs">{withdrawal.account_number}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
                      معلق
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(withdrawal.created_at).toLocaleDateString('ar-SA')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleProcessWithdrawal(withdrawal.id, 'approve')}
                        className="text-green-600 hover:text-green-800 transition-colors"
                        title="موافقة"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleProcessWithdrawal(withdrawal.id, 'reject')}
                        className="text-red-600 hover:text-red-800 transition-colors"
                        title="رفض"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {withdrawals.filter(w => w.status === 'pending').length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد طلبات سحب معلقة
          </div>
        )}
      </div>

      {/* آخر المعاملات */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">آخر معاملات المحفظة</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المستخدم</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">النوع</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المبلغ</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الوصف</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{transaction.user_name}</p>
                      <p className="text-xs text-gray-500">{transaction.user_email}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                      transaction.type === 'withdrawal' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {transaction.type === 'deposit' ? 'إيداع' :
                       transaction.type === 'withdrawal' ? 'سحب' : transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-800">
                    ${transaction.amount}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{transaction.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(transaction.created_at).toLocaleDateString('ar-SA')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            لا توجد معاملات
          </div>
        )}
      </div>
    </div>
  );
}
