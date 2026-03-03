'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/auth-store';
import ProtectedRoute from '../components/ProtectedRoute';
import * as Sentry from '@sentry/nextjs';

interface Wallet {
  id: number;
  user_id: number;
  balance: string;
  held_balance: string;
  created_at: string;
  updated_at: string;
}

interface Transaction {
  id: number;
  user_id: number;
  type: string;
  amount: string;
  description: string;
  created_at: string;
}

interface PaymentMethod {
  id: number;
  method_type: string;
  provider: string;
  account_holder_name: string;
  account_number: string;
  bank_name: string;
  iban: string;
  swift_code: string;
  paypal_email: string;
  is_default: boolean;
  is_verified: boolean;
}

interface WithdrawalRequest {
  id: number;
  amount: string;
  status: string;
  provider: string;
  account_holder_name: string;
  created_at: string;
}

export default function WalletPage() {
  return (
    <ProtectedRoute>
      <WalletContent />
    </ProtectedRoute>
  );
}

function WalletContent() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showAddMethodModal, setShowAddMethodModal] = useState(false);
  const [showPaymentMethodsModal, setShowPaymentMethodsModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(null);
  const [depositMethod, setDepositMethod] = useState('card');
  const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals'>('transactions');
  
  // نموذج طريقة الدفع
  const [methodForm, setMethodForm] = useState({
    method_type: 'bank',
    provider: '',
    account_holder_name: '',
    account_number: '',
    bank_name: '',
    iban: '',
    swift_code: '',
    paypal_email: '',
    is_default: false
  });

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    fetchPaymentMethods();
    fetchWithdrawalRequests();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet`, {
        headers: { 'x-user-id': user?.id?.toString() || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWallet(data);
      }
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
      Sentry.captureException(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet/transactions`, {
        headers: { 'x-user-id': user?.id?.toString() || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      Sentry.captureException(error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment-methods`, {
        headers: { 'x-user-id': user?.id?.toString() || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data);
        if (data.length > 0 && !selectedPaymentMethod) {
          const defaultMethod = data.find((m: PaymentMethod) => m.is_default) || data[0];
          setSelectedPaymentMethod(defaultMethod.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
      Sentry.captureException(error);
    }
  };

  const fetchWithdrawalRequests = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/withdrawal-requests`, {
        headers: { 'x-user-id': user?.id?.toString() || '' }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWithdrawalRequests(data);
      }
    } catch (error) {
      console.error('Failed to fetch withdrawal requests:', error);
      Sentry.captureException(error);
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('الرجاء إدخال مبلغ صحيح');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id?.toString() || ''
        },
        body: JSON.stringify({ action: 'deposit', amount: parseFloat(amount) })
      });

      if (response.ok) {
        alert('تم الإيداع بنجاح');
        setShowDepositModal(false);
        setAmount('');
        fetchWallet();
        fetchTransactions();
      } else {
        const error = await response.json();
        alert(error.error || 'فشل الإيداع');
      }
    } catch (error) {
      console.error('Deposit error:', error);
      Sentry.captureException(error);
      alert('حدث خطأ أثناء الإيداع');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('الرجاء إدخال مبلغ صحيح');
      return;
    }

    if (!selectedPaymentMethod) {
      alert('الرجاء اختيار طريقة سحب');
      return;
    }

    // تحقق من KYC
    if (user?.kyc_status !== 'verified') {
      if (confirm('يجب التحقق من هويتك أولاً للسحب. هل تريد الانتقال لصفحة التحقق؟')) {
        router.push('/kyc/verify');
      }
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/withdrawal-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id?.toString() || ''
        },
        body: JSON.stringify({ 
          amount: parseFloat(amount),
          payment_method_id: selectedPaymentMethod
        })
      });

      if (response.ok) {
        alert('تم إرسال طلب السحب بنجاح. سيتم معالجته خلال 1-3 أيام عمل.');
        setShowWithdrawModal(false);
        setAmount('');
        fetchWallet();
        fetchTransactions();
        fetchWithdrawalRequests();
      } else {
        const error = await response.json();
        alert(error.error || 'فشل السحب');
      }
    } catch (error) {
      console.error('Withdraw error:', error);
      Sentry.captureException(error);
      alert('حدث خطأ أثناء السحب');
    } finally {
      setProcessing(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    if (!methodForm.account_holder_name) {
      alert('الرجاء إدخال اسم صاحب الحساب');
      return;
    }

    if (methodForm.method_type === 'bank' && !methodForm.account_number) {
      alert('الرجاء إدخال رقم الحساب');
      return;
    }

    if (methodForm.method_type === 'paypal' && !methodForm.paypal_email) {
      alert('الرجاء إدخال بريد PayPal');
      return;
    }

    setProcessing(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id?.toString() || ''
        },
        body: JSON.stringify(methodForm)
      });

      if (response.ok) {
        alert('تم إضافة طريقة الدفع بنجاح');
        setShowAddMethodModal(false);
        setMethodForm({
          method_type: 'bank',
          provider: '',
          account_holder_name: '',
          account_number: '',
          bank_name: '',
          iban: '',
          swift_code: '',
          paypal_email: '',
          is_default: false
        });
        fetchPaymentMethods();
      } else {
        alert('فشل في إضافة طريقة الدفع');
      }
    } catch (error) {
      console.error('Add payment method error:', error);
      Sentry.captureException(error);
      alert('حدث خطأ');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: number) => {
    if (!confirm('هل أنت متأكد من حذف هذه الطريقة؟')) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment-methods?id=${methodId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user?.id?.toString() || '' }
      });

      if (response.ok) {
        alert('تم الحذف بنجاح');
        fetchPaymentMethods();
      } else {
        alert('فشل في الحذف');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('حدث خطأ');
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit': return '💰';
      case 'withdraw': return '🏦';
      case 'escrow_hold': return '🔒';
      case 'escrow_release': return '📤';
      case 'escrow_receive': return '📥';
      case 'escrow_refund': return '↩️';
      default: return '💳';
    }
  };

  const getTransactionColor = (type: string) => {
    if (type === 'deposit' || type === 'escrow_receive' || type === 'escrow_refund') {
      return 'text-green-600';
    }
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <button onClick={() => router.back()} className="mb-4">
          ← رجوع
        </button>
        <h1 className="text-2xl font-bold mb-6">المحفظة</h1>
        
        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <p className="text-sm opacity-90 mb-1">الرصيد المتاح</p>
            <p className="text-2xl font-bold">${wallet?.balance || '0.00'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4">
            <p className="text-sm opacity-90 mb-1">الرصيد المحجوز</p>
            <p className="text-2xl font-bold">${wallet?.held_balance || '0.00'}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <button
            onClick={() => setShowDepositModal(true)}
            className="bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition text-sm"
          >
            💰 إيداع
          </button>
          <button
            onClick={() => router.push('/payments')}
            className="bg-white/20 backdrop-blur text-white font-semibold py-3 rounded-lg hover:bg-white/30 transition text-sm"
          >
            📊 المدفوعات
          </button>
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="bg-white/20 backdrop-blur text-white font-semibold py-3 rounded-lg hover:bg-white/30 transition text-sm"
          >
            🏦 سحب
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b bg-white">
        <div className="flex">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            العمليات
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex-1 py-3 text-sm font-semibold border-b-2 ${
              activeTab === 'withdrawals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500'
            }`}
          >
            طلبات السحب
          </button>
        </div>
      </div>

      {/* Transactions */}
      {activeTab === 'transactions' && (
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">العمليات الأخيرة</h2>
        
        {transactions.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500">لا توجد عمليات بعد</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{transaction.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                  <p className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                    {transaction.type.includes('withdraw') || transaction.type.includes('hold') || transaction.type.includes('release') ? '-' : '+'}
                    ${transaction.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      )}

      {/* Withdrawal Requests */}
      {activeTab === 'withdrawals' && (
        <div className="p-4">
          <h2 className="text-lg font-bold text-gray-800 mb-3">طلبات السحب</h2>
          
          {withdrawalRequests.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">لا توجد طلبات سحب</p>
            </div>
          ) : (
            <div className="space-y-2">
              {withdrawalRequests.map((request) => (
                <div key={request.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-lg text-gray-800">${request.amount}</p>
                      <p className="text-sm text-gray-600">إلى: {request.provider}</p>
                      <p className="text-xs text-gray-500">{request.account_holder_name}</p>
                    </div>
                    <div className="text-left">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        request.status === 'completed' ? 'bg-green-100 text-green-700' :
                        request.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        request.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {request.status === 'completed' ? '✅ مكتمل' :
                         request.status === 'processing' ? '⏳ قيد المعالجة' :
                         request.status === 'rejected' ? '❌ مرفوض' :
                         '🕐 قيد الانتظار'}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(request.created_at).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payment Methods Modal */}
      {showPaymentMethodsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">طرق السحب</h3>
              <button
                onClick={() => setShowPaymentMethodsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">لا توجد طرق دفع مضافة</p>
                <button
                  onClick={() => {
                    setShowPaymentMethodsModal(false);
                    setShowAddMethodModal(true);
                  }}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  إضافة طريقة دفع
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 ${
                      method.id === selectedPaymentMethod ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          checked={method.id === selectedPaymentMethod}
                          onChange={() => setSelectedPaymentMethod(method.id)}
                          className="w-4 h-4"
                        />
                        <span className="font-semibold text-gray-800">
                          {method.method_type === 'bank' ? '🏦 حساب بنكي' : 
                           method.method_type === 'paypal' ? '💳 PayPal' : '💰 محفظة'}
                        </span>
                        {method.is_default && (
                          <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">افتراضي</span>
                        )}
                      </div>
                      <button
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="text-sm text-gray-600 mr-6">
                      <p>{method.account_holder_name}</p>
                      {method.method_type === 'bank' && (
                        <>
                          <p className="text-xs">{method.bank_name}</p>
                          <p className="text-xs font-mono">{method.account_number}</p>
                        </>
                      )}
                      {method.method_type === 'paypal' && (
                        <p className="text-xs">{method.paypal_email}</p>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => {
                    setShowPaymentMethodsModal(false);
                    setShowAddMethodModal(true);
                  }}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
                >
                  ➕ إضافة طريقة جديدة
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">إيداع رصيد</h3>
            
            {/* طرق الإيداع */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">اختر طريقة الدفع:</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setDepositMethod('card')}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    depositMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">💳</div>
                  <div className="text-xs font-semibold">بطاقة</div>
                </button>
                <button
                  onClick={() => setDepositMethod('paypal')}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    depositMethod === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">🅿️</div>
                  <div className="text-xs font-semibold">PayPal</div>
                </button>
                <button
                  onClick={() => setDepositMethod('bank')}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    depositMethod === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">🏦</div>
                  <div className="text-xs font-semibold">تحويل</div>
                </button>
              </div>
            </div>

            <input
              type="number"
              placeholder="المبلغ بالدولار"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 mb-4 text-lg"
            />
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                💡 في التطبيق الحقيقي، سيتم ربط بوابة دفع (Stripe, PayPal, إلخ) لمعالجة الدفعات بشكل آمن
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDeposit}
                disabled={processing}
                className="flex-1 bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {processing ? 'جاري الإيداع...' : 'إيداع'}
              </button>
              <button
                onClick={() => {
                  setShowDepositModal(false);
                  setAmount('');
                }}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">سحب رصيد</h3>
            <p className="text-sm text-gray-600 mb-4">
              الرصيد المتاح: <span className="font-bold text-green-600">${wallet?.balance}</span>
            </p>

            {/* اختيار طريقة السحب */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-700">طريقة السحب:</p>
                <button
                  onClick={() => setShowPaymentMethodsModal(true)}
                  className="text-sm text-blue-600 hover:underline"
                >
                  إدارة الطرق
                </button>
              </div>
              
              {paymentMethods.length === 0 ? (
                <button
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setShowAddMethodModal(true);
                  }}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-600 hover:border-blue-500 hover:text-blue-600 transition"
                >
                  ➕ إضافة طريقة سحب
                </button>
              ) : (
                <select
                  value={selectedPaymentMethod || ''}
                  onChange={(e) => setSelectedPaymentMethod(parseInt(e.target.value))}
                  className="w-full border rounded-lg px-4 py-3 mb-2"
                >
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.method_type === 'bank' ? '🏦' : method.method_type === 'paypal' ? '💳' : '💰'}{' '}
                      {method.account_holder_name} - {method.provider || method.bank_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <input
              type="number"
              placeholder="المبلغ بالدولار"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 mb-4 text-lg"
            />

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-800">
                ⏱️ سيتم معالجة طلبك خلال 1-3 أيام عمل
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleWithdraw}
                disabled={processing || paymentMethods.length === 0}
                className="flex-1 bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {processing ? 'جاري الإرسال...' : 'إرسال طلب السحب'}
              </button>
              <button
                onClick={() => {
                  setShowWithdrawModal(false);
                  setAmount('');
                }}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Payment Method Modal */}
      {showAddMethodModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">إضافة طريقة سحب</h3>

            {/* نوع الحساب */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">نوع الحساب</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMethodForm({...methodForm, method_type: 'bank'})}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    methodForm.method_type === 'bank' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">🏦</div>
                  <div className="text-sm font-semibold">حساب بنكي</div>
                </button>
                <button
                  onClick={() => setMethodForm({...methodForm, method_type: 'paypal'})}
                  className={`p-3 rounded-lg border-2 text-center transition ${
                    methodForm.method_type === 'paypal' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">💳</div>
                  <div className="text-sm font-semibold">PayPal</div>
                </button>
              </div>
            </div>

            {/* نموذج الحساب البنكي */}
            {methodForm.method_type === 'bank' && (
              <>
                <input
                  type="text"
                  placeholder="اسم صاحب الحساب *"
                  value={methodForm.account_holder_name}
                  onChange={(e) => setMethodForm({...methodForm, account_holder_name: e.target.value})}
                  className="w-full border rounded-lg px-4 py-3 mb-3"
                />
                <input
                  type="text"
                  placeholder="اسم البنك *"
                  value={methodForm.bank_name}
                  onChange={(e) => setMethodForm({...methodForm, bank_name: e.target.value, provider: e.target.value})}
                  className="w-full border rounded-lg px-4 py-3 mb-3"
                />
                <input
                  type="text"
                  placeholder="رقم الحساب *"
                  value={methodForm.account_number}
                  onChange={(e) => setMethodForm({...methodForm, account_number: e.target.value})}
                  className="w-full border rounded-lg px-4 py-3 mb-3"
                />
                <input
                  type="text"
                  placeholder="IBAN (اختياري)"
                  value={methodForm.iban}
                  onChange={(e) => setMethodForm({...methodForm, iban: e.target.value})}
                  className="w-full border rounded-lg px-4 py-3 mb-3"
                />
                <input
                  type="text"
                  placeholder="SWIFT Code (اختياري)"
                  value={methodForm.swift_code}
                  onChange={(e) => setMethodForm({...methodForm, swift_code: e.target.value})}
                  className="w-full border rounded-lg px-4 py-3 mb-3"
                />
              </>
            )}

            {/* نموذج PayPal */}
            {methodForm.method_type === 'paypal' && (
              <>
                <input
                  type="text"
                  placeholder="اسم صاحب الحساب *"
                  value={methodForm.account_holder_name}
                  onChange={(e) => setMethodForm({...methodForm, account_holder_name: e.target.value})}
                  className="w-full border rounded-lg px-4 py-3 mb-3"
                />
                <input
                  type="email"
                  placeholder="البريد الإلكتروني PayPal *"
                  value={methodForm.paypal_email}
                  onChange={(e) => setMethodForm({...methodForm, paypal_email: e.target.value, provider: 'PayPal'})}
                  className="w-full border rounded-lg px-4 py-3 mb-3"
                />
              </>
            )}

            {/* جعلها افتراضية */}
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={methodForm.is_default}
                onChange={(e) => setMethodForm({...methodForm, is_default: e.target.checked})}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">جعلها طريقة افتراضية</span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={handleAddPaymentMethod}
                disabled={processing}
                className="flex-1 bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                {processing ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button
                onClick={() => {
                  setShowAddMethodModal(false);
                  setMethodForm({
                    method_type: 'bank',
                    provider: '',
                    account_holder_name: '',
                    account_number: '',
                    bank_name: '',
                    iban: '',
                    swift_code: '',
                    paypal_email: '',
                    is_default: false
                  });
                }}
                className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
