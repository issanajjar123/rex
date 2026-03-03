'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessageCircle, Briefcase, Search, Wallet, Tag, Menu } from 'lucide-react';
import { useState } from 'react';
import Sidebar from './Sidebar';

export default function BottomNav() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 w-full z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="relative w-full pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          <div className="flex items-center justify-around w-full px-2">
            
            <button 
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col items-center gap-1 min-w-[50px] group"
            >
              <div className="relative p-1.5">
                <Menu 
                  className="w-6 h-6 text-gray-400 transition-colors"
                />
              </div>
              <span className="text-[10px] font-medium text-gray-500 transition-colors">القائمة</span>
            </button>
          
          <Link href="/" className="flex flex-col items-center gap-1 min-w-[50px] group">
            <div className="relative p-1.5">
              <Home 
                className={`w-6 h-6 ${isActive('/') ? 'text-purple-600' : 'text-gray-400'} transition-colors`}
                fill={isActive('/') ? 'currentColor' : 'none'}
              />
              {isActive('/') && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></span>}
            </div>
            <span className={`text-[10px] font-medium ${isActive('/') ? 'text-purple-600' : 'text-gray-500'} transition-colors`}>Home</span>
          </Link>

          <Link href="/chat" className="flex flex-col items-center gap-1 min-w-[50px] group">
            <div className="relative p-1.5">
              <MessageCircle 
                className={`w-6 h-6 ${isActive('/chat') ? 'text-purple-600' : 'text-gray-400'} transition-colors`}
                fill={isActive('/chat') ? 'currentColor' : 'none'}
              />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              {isActive('/chat') && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></span>}
            </div>
            <span className={`text-[10px] font-medium ${isActive('/chat') ? 'text-purple-600' : 'text-gray-500'} transition-colors`}>Chat</span>
          </Link>

          <Link href="/projects" className="flex flex-col items-center gap-1 min-w-[50px] group">
            <div className="relative p-1.5">
              <Briefcase 
                className={`w-6 h-6 ${isActive('/projects') ? 'text-purple-600' : 'text-gray-400'} transition-colors`}
                fill={isActive('/projects') ? 'currentColor' : 'none'}
              />
              {isActive('/projects') && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></span>}
            </div>
            <span className={`text-[10px] font-medium ${isActive('/projects') ? 'text-purple-600' : 'text-gray-500'} transition-colors`}>Projects</span>
          </Link>

          <Link href="/wallet" className="flex flex-col items-center gap-1 min-w-[50px] group">
            <div className="relative p-1.5">
              <Wallet 
                className={`w-6 h-6 ${isActive('/wallet') ? 'text-purple-600' : 'text-gray-400'} transition-colors`}
              />
              {isActive('/wallet') && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></span>}
            </div>
            <span className={`text-[10px] font-medium ${isActive('/wallet') ? 'text-purple-600' : 'text-gray-500'} transition-colors`}>Wallet</span>
          </Link>

          <Link href="/price-offers" className="flex flex-col items-center gap-1 min-w-[50px] group">
            <div className="relative p-1.5">
              <Tag 
                className={`w-6 h-6 ${isActive('/price-offers') ? 'text-purple-600' : 'text-gray-400'} transition-colors`}
              />
              {isActive('/price-offers') && <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-600 rounded-full"></span>}
            </div>
            <span className={`text-[10px] font-medium ${isActive('/price-offers') ? 'text-purple-600' : 'text-gray-500'} transition-colors`}>Offers</span>
          </Link>

        </div>
      </div>
    </nav>

    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}