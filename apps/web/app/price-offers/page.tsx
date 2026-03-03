'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';
import BottomNav from '@/app/components/BottomNav';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import { useAuthStore } from '@/app/lib/auth-store';
import * as Sentry from '@sentry/nextjs';

export default function PriceOffersPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('received');

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/offers`);
      if (!res.ok) {
        // Use mock data as fallback
        const mockOffers = [
          {
            id: 1,
            title: 'Logo Design Service',
            description: 'Professional logo design',
            price: 500,
            category: 'Design',
            status: 'pending',
            user_id: 2
          },
          {
            id: 2,
            title: 'SEO Optimization',
            description: 'Complete SEO audit',
            price: 800,
            category: 'Marketing',
            status: 'active',
            user_id: 3
          }
        ];
        setOffers(mockOffers);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setOffers(data.offers || []);
      } else {
        setOffers([]);
      }
    } catch (error) {
      // Use mock data as fallback on error
      const mockOffers = [
        {
          id: 1,
          title: 'Logo Design Service',
          description: 'Professional logo design',
          price: 500,
          category: 'Design',
          status: 'pending',
          user_id: 2
        },
        {
          id: 2,
          title: 'SEO Optimization',
          description: 'Complete SEO audit',
          price: 800,
          category: 'Marketing',
          status: 'active',
          user_id: 3
        }
      ];
      setOffers(mockOffers);
    }
  };

  const handleAcceptOffer = async (offerId: number, offerAmount: number, sellerId: number) => {
    // التحقق من رغبة المستخدم في استخدام Escrow
    const useEscrow = confirm(
      `هل تريد استخدام نظام Escrow لحجز المبلغ؟\n\n` +
      `المبلغ: ${offerAmount}\n` +
      `العمولة (10%): ${(offerAmount * 0.10).toFixed(2)}\n` +
      `الإجمالي: ${(offerAmount * 1.10).toFixed(2)}\n\n` +
      `سيتم حجز المبلغ في Escrow وإطلاقه عند التسليم.`
    );

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      if (useEscrow) {
        // إنشاء Escrow أولاً
        const escrowResponse = await fetch(`${apiUrl}/api/escrow`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': user?.id?.toString() || ''
          },
          body: JSON.stringify({
            action: 'create',
            sellerId: sellerId,
            amount: offerAmount,
            relatedType: 'offer',
            relatedId: offerId
          })
        });

        if (!escrowResponse.ok) {
          const error = await escrowResponse.json();
          alert(error.error || 'فشل في إنشاء Escrow');
          setIsLoading(false);
          return;
        }

        alert('تم حجز المبلغ في Escrow بنجاح! سيتم إطلاقه عند التسليم.');
      }

      // قبول العرض
      const response = await fetch(`${apiUrl}/api/offers`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: offerId,
          action: 'accept'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept offer');
      }

      const data = await response.json();
      
      // Show success message
      alert('تم قبول العرض بنجاح! 🎉');
      
      // Redirect to projects page
      router.push('/projects');
    } catch (error) {
      console.error('Error accepting offer:', error);
      Sentry.captureException(error);
      alert('حدث خطأ أثناء قبول العرض');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNegotiate = async (offerId: number) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/offers`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: offerId,
          action: 'negotiate'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to negotiate offer');
      }

      alert('تم رفض العرض. يمكنك إرسال عرض جديد في الدردشة.');
      router.push('/chat');
    } catch (error) {
      console.error('Error negotiating offer:', error);
      alert('حدث خطأ أثناء التفاوض');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelivery = async (offerId: number, escrowId: number) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    const confirmed = confirm('هل تريد تأكيد استلام العمل؟ سيتم إطلاق المبلغ للبائع.');
    
    if (!confirmed) return;

    setIsLoading(true);
    try {
      // Release escrow
      const escrowResponse = await fetch(`${apiUrl}/api/escrow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id?.toString() || ''
        },
        body: JSON.stringify({
          action: 'release',
          escrowId: escrowId
        })
      });

      if (!escrowResponse.ok) {
        const error = await escrowResponse.json();
        alert(error.error || 'فشل في إطلاق المبلغ');
        return;
      }

      // Mark offer as completed
      await fetch(`${apiUrl}/api/offers`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: offerId,
          action: 'complete'
        }),
      });

      alert('✅ تم تأكيد الاستلام وإطلاق المبلغ للبائع بنجاح!');
      window.location.reload();
    } catch (error) {
      console.error('Error confirming delivery:', error);
      Sentry.captureException(error);
      alert('حدث خطأ أثناء تأكيد الاستلام');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="relative min-h-screen pt-[55px] pb-28 antialiased overflow-x-hidden">
        {/* Animated Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 -z-10"></div>
        
        {/* Ambient Glows */}
        <div className="fixed top-[-10%] left-[-20%] w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse"></div>
        <div className="fixed bottom-[-10%] right-[-20%] w-[400px] h-[400px] bg-blue-300/30 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-[150px] pointer-events-none z-0"></div>

        {/* Header */}
        <header className="relative z-10 w-full px-6 mb-4 flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold tracking-tight text-gray-800">عروض الأسعار</h1>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/offer-history')} className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-md active:scale-95 transition-transform hover:shadow-lg">
              <i className="ph ph-clock-counter-clockwise text-xl text-gray-600"></i>
            </button>
            <button onClick={() => router.push('/filter-offers')} className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center shadow-lg active:scale-95 transition-transform hover:bg-purple-600">
              <i className="ph-bold ph-funnel text-xl text-white"></i>
            </button>
          </div>
        </header>

        <main className="relative z-10 w-full px-6 space-y-6">
          {/* Tabs */}
          <section className="animate-slide-up">
            <div className="flex p-1 bg-white rounded-xl shadow-md border border-gray-200 mb-2">
              <button 
                onClick={() => setActiveTab('received')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg ${activeTab === 'received' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800 transition-colors'}`}
              >
                المستلمة ({offers.length})
              </button>
              <button 
                onClick={() => setActiveTab('sent')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg ${activeTab === 'sent' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800 transition-colors'}`}
              >
                المرسلة
              </button>
              <button 
                onClick={() => setActiveTab('accepted')}
                className={`flex-1 py-2 text-xs font-medium rounded-lg ${activeTab === 'accepted' ? 'bg-purple-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800 transition-colors'}`}
              >
                المقبولة
              </button>
            </div>
          </section>

          {/* Offer List */}
          <section className="flex flex-col gap-5 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {offers.length === 0 ? (
              <div className="bg-white shadow-lg rounded-[24px] p-8 text-center border border-gray-200">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Tag className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">لا توجد عروض</h3>
                <p className="text-sm text-gray-600 mb-4">لم يتم العثور على أي عروض أسعار حالياً</p>
              </div>
            ) : (
              <>
            {/* Pending Offer Card */}
            <div className="group relative overflow-hidden bg-white shadow-lg rounded-[24px] p-5 border border-purple-200 hover:shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md" alt="Sarah" />
                  <div>
                    <p className="text-xs text-gray-600">عرض من</p>
                    <h3 className="font-bold text-sm text-gray-800">Sarah Miller</h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wide border border-orange-200">
                  <i className="ph-fill ph-clock"></i> قيد الانتظار
                </span>
              </div>

              <div className="mb-5 pb-5 border-b border-dashed border-gray-200">
                <h2 className="font-display font-bold text-3xl text-gray-800 mb-1">$4,500<span className="text-lg text-gray-500 font-normal">.00</span></h2>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <i className="ph-fill ph-briefcase text-purple-500"></i>
                  للمشروع: <span className="text-gray-700 font-medium">Fintech App Redesign</span>
                </p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => handleNegotiate(1)} className="flex-1 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 text-sm font-semibold hover:bg-gray-100 active:scale-95 transition-all">
                  تفاوض
                </button>
                <button onClick={() => handleAcceptOffer(1, 4500, 2)} className="flex-1 py-3 rounded-xl bg-purple-500 text-white text-sm font-semibold shadow-lg hover:bg-purple-600 active:scale-95 transition-all flex items-center justify-center gap-2" disabled={isLoading}>
                  {isLoading ? 'جاري القبول...' : '💰 قبول ودفع'} <i className="ph-bold ph-check"></i>
                </button>
              </div>
            </div>

            {/* Accepted Offer (Escrow Held) */}
            <div className="group relative overflow-hidden bg-white shadow-lg rounded-[24px] p-5 border-2 border-green-200 hover:shadow-xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md" alt="John" />
                  <div>
                    <p className="text-xs text-gray-600">عرض من</p>
                    <h3 className="font-bold text-sm text-gray-800">John Smith</h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide border border-green-200">
                  <i className="ph-fill ph-check-circle"></i> مقبول
                </span>
              </div>

              <div className="mb-4 pb-4 border-b border-dashed border-gray-200">
                <h2 className="font-display font-bold text-3xl text-gray-800 mb-1">$3,200<span className="text-lg text-gray-500 font-normal">.00</span></h2>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <i className="ph-fill ph-briefcase text-purple-500"></i>
                  للمشروع: <span className="text-gray-700 font-medium">Logo Design</span>
                </p>
              </div>

              {/* Escrow Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="ph-fill ph-lock text-blue-600 text-lg"></i>
                  <span className="text-sm font-bold text-blue-900">🔒 المبلغ محجوز في Escrow</span>
                </div>
                <div className="text-xs text-blue-700 space-y-1">
                  <p>💰 المبلغ: $3,200</p>
                  <p>📊 العمولة (10%): $320</p>
                  <p className="font-bold">💳 الإجمالي المحجوز: $3,520</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => router.push('/chat')} className="flex-1 py-3 rounded-xl border border-purple-300 bg-purple-50 text-purple-700 text-sm font-semibold hover:bg-purple-100 active:scale-95 transition-all">
                  💬 المحادثة
                </button>
                <button onClick={() => handleConfirmDelivery(2, 1)} className="flex-1 py-3 rounded-xl bg-green-500 text-white text-sm font-semibold shadow-lg hover:bg-green-600 active:scale-95 transition-all flex items-center justify-center gap-2" disabled={isLoading}>
                  ✅ تأكيد الاستلام
                </button>
              </div>
            </div>

            {/* Completed Offer */}
            <div className="group relative overflow-hidden bg-white shadow-lg rounded-[24px] p-5 border border-gray-200 opacity-75">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md" alt="Emma" />
                  <div>
                    <p className="text-xs text-gray-600">عرض من</p>
                    <h3 className="font-bold text-sm text-gray-800">Emma Wilson</h3>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wide border border-purple-200">
                  <i className="ph-fill ph-check-circle"></i> مكتمل
                </span>
              </div>

              <div className="mb-4">
                <h2 className="font-display font-bold text-3xl text-gray-800 mb-1">$2,800<span className="text-lg text-gray-500 font-normal">.00</span></h2>
                <p className="text-xs text-gray-600 flex items-center gap-1.5">
                  <i className="ph-fill ph-briefcase text-purple-500"></i>
                  للمشروع: <span className="text-gray-700 font-medium">Content Writing</span>
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600">✅ تم إطلاق المبلغ للبائع في 15 يناير 2024</p>
              </div>
            </div>
              </>
            )}
          </section>
        </main>
      </div>
      <BottomNav />
    </ProtectedRoute>
  );
}
