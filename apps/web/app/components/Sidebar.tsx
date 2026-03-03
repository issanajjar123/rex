'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/app/lib/auth-store';
import { useEffect, useState } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [kycStatus, setKycStatus] = useState<string>('not_verified');

  useEffect(() => {
    if (isOpen && user) {
      // جلب حالة KYC
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/kyc?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.verification) {
            setKycStatus(data.verification.status);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, user]);

  const handleLogout = () => {
    logout();
    onClose();
    router.push('/auth/signin');
  };

  const menuItems = [
    { icon: 'ph-user', label: 'تعديل الملف الشخصي', href: '/profile/edit' },
    { icon: 'ph-gear', label: 'الإعدادات', href: '/settings' },
    { icon: 'ph-briefcase', label: 'طلبات العمل', href: '/applications' },
    { icon: 'ph-wallet', label: 'المحفظة', href: '/wallet' },
    { icon: 'ph-identification-card', label: 'التحقق من الهوية', href: '/kyc/verify' },
    { icon: 'ph-file-text', label: 'سياسة الخصوصية', href: '/privacy-policy' },
  ];

  const getKycBadge = () => {
    if (kycStatus === 'verified') {
      return (
        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
          <i className="ph-fill ph-check-circle text-sm"></i>
          موثق
        </span>
      );
    } else if (kycStatus === 'pending') {
      return (
        <span className="flex items-center gap-1 text-xs text-yellow-600 font-medium">
          <i className="ph-fill ph-clock text-sm"></i>
          قيد المراجعة
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <i className="ph ph-warning-circle text-sm"></i>
          غير موثق
        </span>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
            style={{ direction: 'rtl' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-6 pt-8">
              <button
                onClick={onClose}
                className="absolute top-4 left-4 text-white/90 hover:text-white transition-colors"
              >
                <i className="ph ph-x text-2xl"></i>
              </button>

              {user && (
                <div className="flex flex-col items-center mt-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold border-4 border-white/30 overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    {kycStatus === 'verified' && (
                      <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                        <i className="ph-fill ph-check text-white text-xs"></i>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <h3 className="text-white font-bold text-lg mt-3">{user.name}</h3>
                  <p className="text-white/80 text-sm">{user.email}</p>
                  <div className="mt-2">{getKycBadge()}</div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-4 px-6 py-4 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <i className={`${item.icon} text-2xl text-gray-600`}></i>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Logout Button */}
            <div className="border-t p-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 bg-red-50 text-red-600 font-medium py-3 rounded-xl hover:bg-red-100 transition-colors"
              >
                <i className="ph ph-sign-out text-xl"></i>
                <span>تسجيل الخروج</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
