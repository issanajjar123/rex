'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/auth-store';
import BottomNav from './BottomNav';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isAuthenticated, isHydrated, hydrate } = useAuthStore();

  useEffect(() => {
    setIsClient(true);
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isClient && isHydrated && !isAuthenticated) {
      router.push('/auth/signin');
    }
  }, [isClient, isHydrated, isAuthenticated, router]);

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
      {children}
      <BottomNav />
    </>
  );
}
