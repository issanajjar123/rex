'use client';

import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pb-20">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <span className="text-xl">←</span>
            <span className="mr-2">العودة للرئيسية</span>
          </Link>

          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl text-white">🔒</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              سياسة الخصوصية
            </h1>
            <p className="text-gray-600">آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">المقدمة</h2>
            <p className="text-gray-700 leading-relaxed">
              نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند استخدام منصتنا.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">المعلومات التي نجمعها</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">📝 المعلومات الشخصية</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                  <li>الاسم الكامل</li>
                  <li>البريد الإلكتروني</li>
                  <li>رقم الهاتف (إن وُجد)</li>
                  <li>الصورة الشخصية (اختياري)</li>
                </ul>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">💼 معلومات الاستخدام</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                  <li>المشاريع والوظائف التي تنشرها</li>
                  <li>عروض الأسعار المرسلة والمستلمة</li>
                  <li>الرسائل والمحادثات</li>
                  <li>سجل التعاملات والمدفوعات</li>
                </ul>
              </div>

              <div className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                <h3 className="font-semibold text-gray-800 mb-2">📱 البيانات التقنية</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 mr-4">
                  <li>عنوان IP</li>
                  <li>نوع المتصفح والجهاز</li>
                  <li>نظام التشغيل</li>
                  <li>سجلات الاستخدام والأنشطة</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">كيف نستخدم معلوماتك</h2>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 ml-2">✓</span>
                  <span>تقديم وتحسين خدماتنا</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 ml-2">✓</span>
                  <span>التواصل معك بشأن حسابك والتحديثات</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 ml-2">✓</span>
                  <span>معالجة المعاملات والمدفوعات</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 ml-2">✓</span>
                  <span>الأمان ومنع الاحتيال</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 ml-2">✓</span>
                  <span>الامتثال للمتطلبات القانونية</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">مشاركة المعلومات</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              نحن لا نبيع أو نؤجر معلوماتك الشخصية لأطراف ثالثة. قد نشارك معلوماتك فقط في الحالات التالية:
            </p>
            <div className="space-y-2 text-gray-700 mr-4">
              <p>• <strong>مع مقدمي الخدمات:</strong> لمعالجة المدفوعات والاستضافة والتحليلات</p>
              <p>• <strong>بموافقتك:</strong> عندما توافق صراحةً على المشاركة</p>
              <p>• <strong>للامتثال القانوني:</strong> عند الطلب من السلطات القانونية</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">حماية البيانات</h2>
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed mb-4">
                نستخدم تدابير أمنية تقنية وتنظيمية لحماية بياناتك:
              </p>
              <ul className="space-y-2 text-gray-700 mr-4">
                <li>🔐 تشفير SSL/TLS لجميع البيانات المنقولة</li>
                <li>🛡️ تشفير كلمات المرور</li>
                <li>🔒 خوادم آمنة ومحمية</li>
                <li>👥 وصول محدود للبيانات الشخصية</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">حقوقك</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-3">
              <p className="text-gray-700"><strong>الوصول:</strong> الحق في الوصول إلى بياناتك الشخصية</p>
              <p className="text-gray-700"><strong>التصحيح:</strong> الحق في تصحيح البيانات غير الدقيقة</p>
              <p className="text-gray-700"><strong>الحذف:</strong> الحق في طلب حذف بياناتك</p>
              <p className="text-gray-700"><strong>الاعتراض:</strong> الحق في الاعتراض على معالجة بياناتك</p>
              <p className="text-gray-700"><strong>النقل:</strong> الحق في نقل بياناتك إلى خدمة أخرى</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">ملفات تعريف الارتباط (Cookies)</h2>
            <p className="text-gray-700 leading-relaxed">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك وتذكر تفضيلاتك. يمكنك التحكم في ملفات تعريف الارتباط من إعدادات المتصفح الخاص بك.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">التغييرات على سياسة الخصوصية</h2>
            <p className="text-gray-700 leading-relaxed">
              قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سنقوم بإخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">التواصل معنا</h2>
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl p-6">
              <p className="mb-4">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية أو معالجة بياناتك، يرجى التواصل معنا:
              </p>
              <div className="space-y-2">
                <p>📧 <strong>البريد الإلكتروني:</strong> privacy@example.com</p>
                <p>📱 <strong>الهاتف:</strong> +966 XX XXX XXXX</p>
                <p>🏢 <strong>العنوان:</strong> [عنوان الشركة]</p>
              </div>
            </div>
          </section>

          <section className="border-t border-gray-200 pt-6">
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-600 mb-4">
                بإستخدامك لخدماتنا، فإنك توافق على هذه السياسة
              </p>
              <Link
                href="/auth/signup"
                className="inline-block px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition shadow-lg"
              >
                إنشاء حساب جديد
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
