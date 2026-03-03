'use client';

import "./globals.css";
import { AppGenProvider } from "@/components/appgen-provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
            {children}
          </main>
        </AppGenProvider>
      </body>
    </html>
  );
}
