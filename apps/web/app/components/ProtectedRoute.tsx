'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/app/lib/auth-store';
import Link from 'next/link';
import { Search, LogOut } from 'lucide-react';
import BottomNav from './BottomNav';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, isHydrated, hydrate, logout } = useAuthStore();

  useEffect(() => {
    setIsClient(true);
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isClient && isHydrated && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isClient, isHydrated, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/signin');
  };

  // Show loading during hydration
  if (!isClient || !isHydrated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Show loading while redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Header with Jobs icon and Logout */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <h1 className="text-lg font-bold text-purple-600">خدماتي - TeleWork</h1>
          <div className="flex items-center gap-2">
            <Link 
              href="/jobs" 
              className={`p-2 rounded-lg transition-colors ${
                pathname === '/jobs' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Search className="w-5 h-5" />
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Add padding to account for fixed header */}
      <div className="pt-[60px]">
        {children}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </>
  );
}
