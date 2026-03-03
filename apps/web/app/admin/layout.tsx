'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '../components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // تحقق من تسجيل الدخول
    const adminUser = localStorage.getItem('adminUser');
    
    if (!adminUser && pathname !== '/admin/login') {
      router.push('/admin/login');
      return;
    }

    if (adminUser) {
      try {
        const user = JSON.parse(adminUser);
        if (user.role !== 'admin') {
          localStorage.removeItem('adminUser');
          router.push('/admin/login');
          return;
        }
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem('adminUser');
        router.push('/admin/login');
        return;
      }
    }

    setIsLoading(false);
  }, [pathname, router]);

  // صفحة تسجيل الدخول لا تحتاج Sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <main className="mr-64 p-8">
        {children}
      </main>
    </div>
  );
}
