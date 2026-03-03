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
        <span className="flex items-center gap-2 text-sm text-white font-medium">
          <i className="ph-fill ph-check-circle text-base"></i>
          موثق
        </span>
      );
    } else if (kycStatus === 'pending') {
      return (
        <span className="flex items-center gap-2 text-sm text-yellow-200 font-medium">
          <i className="ph-fill ph-clock text-base"></i>
          قيد المراجعة
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-2 text-sm text-white/80 font-medium">
          <i className="ph ph-warning-circle text-base"></i>
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
            className="fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-blue-50 to-white shadow-2xl z-50 flex flex-col"
            style={{ direction: 'rtl' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 pt-8 rounded-bl-3xl shadow-lg">
              <button
                onClick={onClose}
                className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
              >
                <i className="ph ph-x text-xl"></i>
              </button>

              {user && (
                <div className="flex flex-col items-center mt-4">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-blue-600 text-3xl font-bold shadow-lg overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name?.charAt(0).toUpperCase()
                      )}
                    </div>
                    {kycStatus === 'verified' && (
                      <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 shadow-md">
                        <i className="ph-fill ph-check text-white text-base"></i>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <h3 className="text-white font-bold text-xl mt-4">{user.name}</h3>
                  <p className="text-blue-100 text-sm mt-1">{user.email}</p>
                  <div className="mt-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                    {getKycBadge()}
                  </div>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div className="flex-1 overflow-y-auto py-6 px-3">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center gap-4 px-5 py-4 mb-2 text-gray-700 hover:bg-blue-50 rounded-xl transition-all hover:shadow-sm group"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                    <i className={`${item.icon} text-xl text-blue-600 group-hover:text-white transition-colors`}></i>
                  </div>
                  <span className="font-medium text-base group-hover:text-blue-600 transition-colors">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Logout Button */}
            <div className="p-4 pt-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-medium py-4 rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl"
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
