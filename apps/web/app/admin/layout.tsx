'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminSidebar from '../components/admin/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Skip auth check for login page
    if (pathname === '/admin/login') {
      setIsLoading(false);
      setIsAuthenticated(false);
      return;
    }

    // Check admin authentication
    const adminUser = localStorage.getItem('adminUser');
    
    if (!adminUser) {
      setIsAuthenticated(false);
      setIsLoading(false);
      router.replace('/admin/login');
      return;
    }

    try {
      const user = JSON.parse(adminUser);
      if (user.role !== 'admin') {
        localStorage.removeItem('adminUser');
        setIsAuthenticated(false);
        setIsLoading(false);
        router.replace('/admin/login');
        return;
      }
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch {
      localStorage.removeItem('adminUser');
      setIsAuthenticated(false);
      setIsLoading(false);
      router.replace('/admin/login');
    }
  }, [pathname, router, isClient]);

  // صفحة تسجيل الدخول لا تحتاج Sidebar
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isClient || isLoading) {
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
