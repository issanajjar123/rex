'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/app/lib/auth-store';
import Link from 'next/link';
import { Search, LogOut } from 'lucide-react';
import Sidebar from './Sidebar';

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthStore();

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

  const handleLogout = () => {
    logout();
    router.push('/auth/signin');
  };

  return (
    <>
      <header className="sticky top-0 bg-white border-b border-gray-200 z-30" style={{ direction: 'rtl' }}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* عنوان الصفحة */}
          <h1 className="text-xl font-bold text-gray-800">{getTitle()}</h1>

          {/* الأزرار */}
          <div className="flex items-center gap-3">
            {/* أيقونة الوظائف */}
            <Link 
              href="/jobs" 
              className={`p-2 rounded-full transition-colors ${
                pathname === '/jobs' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* تسجيل الخروج */}
            <button 
              onClick={handleLogout}
              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>

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
