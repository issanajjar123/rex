'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // قائمة الصفحات التي لا تحتاج هيدر
  const hideHeaderPages = ['/auth/signin', '/auth/signup', '/auth/forgot-password'];
  
  if (hideHeaderPages.includes(pathname)) {
    return null;
  }

  // العناوين التلقائية حسب المسار
  const getTitle = () => {
    if (title) return title;
    
    const titles: Record<string, string> = {
      '/': 'خدماتي',
      '/jobs': 'الوظائف',
      '/applications': 'الطلبات',
      '/price-offers': 'عروض الأسعار',
      '/chat': 'المحادثات',
      '/projects': 'المشاريع',
      '/wallet': 'المحفظة',
      '/profile/edit': 'تعديل الملف الشخصي',
      '/settings': 'الإعدادات',
      '/kyc/verify': 'التحقق من الهوية',
      '/admin/kyc': 'مراجعة الهويات',
      '/privacy-policy': 'سياسة الخصوصية',
    };

    return titles[pathname] || 'خدماتي';
  };

  return (
    <>
      <header className="sticky top-0 bg-white border-b border-gray-200 z-30" style={{ direction: 'rtl' }}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* عنوان الصفحة */}
          <h1 className="text-xl font-bold text-gray-800">{getTitle()}</h1>

          {/* الأزرار */}
          <div className="flex items-center gap-3">
            {/* الإشعارات */}
            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <i className="ph ph-bell text-2xl"></i>
              {/* نقطة التنبيه */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* القائمة */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <i className="ph ph-list text-2xl"></i>
            </button>
          </div>
        </div>
      </header>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}
