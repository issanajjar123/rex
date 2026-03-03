'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  FolderKanban, 
  DollarSign, 
  Wallet, 
  Shield, 
  UserCheck, 
  Settings,
  LogOut,
  ArrowLeftRight,
  CreditCard,
  ArrowDownToLine
} from 'lucide-react';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/approvals', icon: UserCheck, label: 'Approvals' },
    { href: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
    { href: '/admin/projects', icon: FolderKanban, label: 'Projects' },
    { href: '/admin/offers', icon: DollarSign, label: 'Offers' },
    { href: '/admin/transactions', icon: ArrowLeftRight, label: 'Transactions' },
    { href: '/admin/payment-methods', icon: CreditCard, label: 'Payment Methods' },
    { href: '/admin/withdrawals', icon: ArrowDownToLine, label: 'Withdrawals' },
    { href: '/admin/escrow', icon: Shield, label: 'Escrow' },
    { href: '/admin/kyc', icon: UserCheck, label: 'KYC Verification' },
    { href: '/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    window.location.href = '/admin/login';
  };

  return (
    <aside className="fixed right-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-2xl z-50">
      <div className="p-6 border-b border-blue-700">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-blue-200 text-sm mt-1">Platform Management</p>
      </div>

      <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-200px)]">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-white text-blue-900 font-semibold shadow-lg'
                  : 'text-blue-100 hover:bg-blue-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-200 hover:bg-red-500/20 transition-all w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
