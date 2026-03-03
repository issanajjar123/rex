'use client';

import "./globals.css";
import { AppGenProvider } from "@/components/appgen-provider";
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Pages that don't require authentication
  const publicPages = ['/auth/signin', '/auth/signup', '/auth/forgot-password', '/privacy-policy'];
  const isPublicPage = publicPages.some(page => pathname?.startsWith(page));

  return (
    <html lang="ar" dir="rtl">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <title>خدماتي - TeleWork</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <AppGenProvider>
          <main className="pb-20">
            {isPublicPage ? children : <ProtectedRoute>{children}</ProtectedRoute>}
          </main>
        </AppGenProvider>
      </body>
    </html>
  );
}
