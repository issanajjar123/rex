'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { useAuthStore } from '../../lib/auth-store';
import { Camera as CameraIcon, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function KYCVerifyPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [existingVerification, setExistingVerification] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    idFront: '',
    idBack: '',
    selfie: '',
    fullName: '',
    idNumber: '',
    dateOfBirth: '',
    address: ''
  });

  const [capturedImages, setCapturedImages] = useState({
    idFront: false,
    idBack: false,
    selfie: false
  });

  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    checkExistingVerification();
  }, [user]);

  const checkExistingVerification = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/kyc?userId=${user?.id}`
      );
      const data = await response.json();
      
      if (data.hasVerification) {
        setExistingVerification(data.verification);
      }
    } catch (error) {
      console.error('Error checking verification:', error);
    } finally {
      setChecking(false);
    }
  };

  const captureImage = async (type: 'idFront' | 'idBack' | 'selfie') => {
    try {
      if (!Capacitor.isNativePlatform()) {
        alert('التقاط الصور يعمل فقط على الأجهزة المحمولة. استخدم التطبيق على الهاتف.');
        return;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera, // إجبار استخدام الكاميرا فقط
        correctOrientation: true,
        width: 1200
      });

      const base64Image = `data:image/jpeg;base64,${image.base64String}`;
      
      setFormData(prev => ({ ...prev, [type]: base64Image }));
      setCapturedImages(prev => ({ ...prev, [type]: true }));
    } catch (error) {
      console.error('Error capturing image:', error);
      alert('فشل التقاط الصورة. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!capturedImages.idFront || !capturedImages.idBack || !capturedImages.selfie) {
      alert('يرجى التقاط جميع الصور المطلوبة باستخدام الكاميرا');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kyc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        alert('تم إرسال طلب التحقق بنجاح! سيتم مراجعته خلال 24-48 ساعة.');
        router.push('/');
      } else {
        alert(data.error || 'فشل في إرسال الطلب');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('حدث خطأ في الإرسال');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (existingVerification) {
    const statusConfig = {
      pending: {
        icon: <AlertCircle className="w-16 h-16 text-yellow-500" />,
        title: 'طلبك قيد المراجعة',
        message: 'سيتم مراجعة طلب التحقق خلال 24-48 ساعة',
        color: 'yellow'
      },
      approved: {
        icon: <CheckCircle className="w-16 h-16 text-green-500" />,
        title: 'تم التحقق من حسابك',
        message: 'حسابك موثق ويمكنك استخدام جميع الميزات',
        color: 'green'
      },
      rejected: {
        icon: <AlertCircle className="w-16 h-16 text-red-500" />,
        title: 'تم رفض التحقق',
        message: existingVerification.rejection_reason || 'يرجى التواصل مع الدعم',
        color: 'red'
      }
    };

    const status = statusConfig[existingVerification.status as keyof typeof statusConfig];

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">التحقق من الهوية</h1>
        </div>

        <div className="flex flex-col items-center justify-center px-4 py-12">
          {status.icon}
          <h2 className="text-2xl font-bold text-gray-900 mt-4 text-center">{status.title}</h2>
          <p className="text-gray-600 mt-2 text-center">{status.message}</p>
          
          <button
            onClick={() => router.push('/')}
            className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg font-medium"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900">التحقق من الهوية (KYC)</h1>
      </div>

      <div className="p-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900">
            ⚠️ يجب استخدام كاميرا الهاتف مباشرة لالتقاط الصور (لضمان الأمان)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ID Front */}
          <div className="bg-white rounded-lg p-4 border">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              صورة الهوية (الأمام) *
            </label>
            <button
              type="button"
              onClick={() => captureImage('idFront')}
              className={`w-full py-4 rounded-lg border-2 border-dashed flex flex-col items-center gap-2 ${
                capturedImages.idFront 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              {capturedImages.idFront ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className="text-sm text-green-700 font-medium">تم التقاط الصورة ✓</span>
                </>
              ) : (
                <>
                  <CameraIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">اضغط لالتقاط صورة الهوية</span>
                </>
              )}
            </button>
          </div>

          {/* ID Back */}
          <div className="bg-white rounded-lg p-4 border">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              صورة الهوية (الخلف) *
            </label>
            <button
              type="button"
              onClick={() => captureImage('idBack')}
              className={`w-full py-4 rounded-lg border-2 border-dashed flex flex-col items-center gap-2 ${
                capturedImages.idBack 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              {capturedImages.idBack ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className="text-sm text-green-700 font-medium">تم التقاط الصورة ✓</span>
                </>
              ) : (
                <>
                  <CameraIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">اضغط لالتقاط صورة خلفية الهوية</span>
                </>
              )}
            </button>
          </div>

          {/* Selfie */}
          <div className="bg-white rounded-lg p-4 border">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              صورة شخصية (سيلفي) *
            </label>
            <button
              type="button"
              onClick={() => captureImage('selfie')}
              className={`w-full py-4 rounded-lg border-2 border-dashed flex flex-col items-center gap-2 ${
                capturedImages.selfie 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              {capturedImages.selfie ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span className="text-sm text-green-700 font-medium">تم التقاط الصورة ✓</span>
                </>
              ) : (
                <>
                  <CameraIcon className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-600">اضغط لالتقاط صورة سيلفي</span>
                </>
              )}
            </button>
          </div>

          {/* Personal Info */}
          <div className="bg-white rounded-lg p-4 border space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="كما هو مكتوب في الهوية"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهوية *
              </label>
              <input
                type="text"
                required
                value={formData.idNumber}
                onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="رقم الهوية أو جواز السفر"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                تاريخ الميلاد *
              </label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان الكامل *
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="المدينة، الحي، الشارع"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !capturedImages.idFront || !capturedImages.idBack || !capturedImages.selfie}
            className="w-full bg-blue-500 text-white py-4 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                جاري الإرسال...
              </>
            ) : (
              'إرسال طلب التحقق'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
