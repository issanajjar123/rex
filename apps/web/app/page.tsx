'use client';

import { useRouter } from 'next/navigation';
import BottomNav from '@/app/components/BottomNav';
import { useAuthStore } from '@/app/lib/auth-store';
import { LogIn, UserPlus, LogOut, MessageCircle, Briefcase, Search, Tag, Shield } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, logout } = useAuthStore();

    return (
      <>
        <div className="relative min-h-screen pt-[55px] pb-28 antialiased overflow-x-hidden">
          {/* 
    AESTHETIC DNA:
    Trend Core: Modern Gradient / Light Premium
    Spice: Soft Purple & Blue Accents
    Palette: Pearl White, Soft Lavender, Sky Blue
    Type: Outfit (Display) + General Sans (Body)
*/}

    {/* Animated Gradient Background */}
    <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 -z-10"></div>
    
    {/* Ambient Glows */}
    <div className="fixed top-[-10%] left-[-20%] w-[500px] h-[500px] bg-purple-300/30 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse"></div>
    <div className="fixed bottom-[-10%] right-[-20%] w-[400px] h-[400px] bg-blue-300/30 rounded-full blur-[120px] pointer-events-none z-0 animate-pulse" style={{ animationDelay: '1s' }}></div>
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-200/20 rounded-full blur-[150px] pointer-events-none z-0"></div>

    {/* Header */}
    <header className="relative z-10 w-full px-6 mb-6 flex items-center justify-between">
        {isAuthenticated ? (
          <>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" 
                         alt="Profile" 
                         className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                         onClick={() => router.push('/profile')}
                     />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-purple-600 font-medium tracking-wide uppercase">مرحباً بعودتك</span>
                    <h1 className="text-xl font-display font-semibold text-gray-800">{user?.name}</h1>
                </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-red-600 transition-colors shadow-md active:scale-95"
            >
              <LogOut className="w-4 h-4" />
              <span>خروج</span>
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg">
                  💬
                </div>
                <div className="flex flex-col">
                    <span className="text-xs text-purple-600 font-medium tracking-wide uppercase">مرحباً بك</span>
                    <h1 className="text-xl font-display font-semibold text-gray-800">TeleWork</h1>
                </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/auth/signin')}
                className="flex items-center gap-2 bg-white border border-blue-600 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-50 transition-colors shadow-md active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>دخول</span>
              </button>
              <button
                onClick={() => router.push('/auth/signup')}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg active:scale-95"
              >
                <UserPlus className="w-4 h-4" />
                <span>تسجيل</span>
              </button>
            </div>
          </>
        )}
    </header>

    <main className="relative z-10 w-full px-6 space-y-8">
        
        {/* Hero: Earnings/Status */}
        <section className="w-full animate-fade-in">
            <div className="w-full rounded-[32px] p-6 bg-gradient-to-br from-purple-500 to-blue-500 relative overflow-hidden shadow-2xl group">
                {/* Decorative elements */}
                <div className="absolute right-0 top-0 w-32 h-32 bg-white/20 rounded-full blur-2xl transform translate-x-10 -translate-y-10 group-hover:scale-110 transition-transform duration-700"></div>
                <div className="absolute left-0 bottom-0 w-24 h-24 bg-pink-400/30 rounded-full blur-xl transform -translate-x-5 translate-y-5"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <p className="text-white/90 text-sm font-medium mb-1">Total Balance</p>
                            <h2 className="text-3xl font-display font-bold tracking-tight text-white">$4,285.00</h2>
                        </div>
                        <button className="bg-white/20 hover:bg-white/30 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors text-white">
                            <span>📈</span> +12%
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-3 flex flex-col justify-between h-20 border border-white/20">
                            <div className="text-white text-lg mb-1">✓</div>
                            <div>
                                <span className="text-xl font-bold block leading-none text-white">12</span>
                                <span className="text-[10px] text-white/90 uppercase tracking-wider">Completed</span>
                            </div>
                        </div>
                        <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-2xl p-3 flex flex-col justify-between h-20 border border-white/20">
                            <div className="text-white text-lg mb-1">⏳</div>
                            <div>
                                <span className="text-xl font-bold block leading-none text-white">3</span>
                                <span className="text-[10px] text-white/90 uppercase tracking-wider">In Progress</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* Quick Navigation Grid */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-gray-800">Dashboard</h3>
                <button onClick={() => router.push('/all-apps')} className="text-xs text-purple-600 font-medium">Edit</button>
            </div>
            <div className="grid grid-cols-4 gap-4">
                {/* Chat (Nav Button) */}
                <button onClick={() => router.push('/chat')} className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 rounded-[24px] bg-white shadow-lg flex items-center justify-center group-active:scale-95 transition-all duration-300 group-hover:shadow-xl">
                        <MessageCircle className="w-7 h-7 text-cyan-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Chat</span>
                </button>

                {/* Projects */}
                <button onClick={() => router.push('/projects')} className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 rounded-[24px] bg-white shadow-lg flex items-center justify-center group-active:scale-95 transition-all duration-300 group-hover:shadow-xl">
                        <Briefcase className="w-7 h-7 text-purple-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Projects</span>
                </button>

                {/* Jobs */}
                <button onClick={() => router.push('/jobs')} className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 rounded-[24px] bg-white shadow-lg flex items-center justify-center group-active:scale-95 transition-all duration-300 group-hover:shadow-xl">
                        <Search className="w-7 h-7 text-emerald-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Find Jobs</span>
                </button>

                {/* Price Offers */}
                <button onClick={() => router.push('/price-offers')} className="flex flex-col items-center gap-2 group">
                    <div className="w-16 h-16 rounded-[24px] bg-white shadow-lg flex items-center justify-center group-active:scale-95 transition-all duration-300 group-hover:shadow-xl">
                        <Tag className="w-7 h-7 text-orange-500 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs font-medium text-gray-600 group-hover:text-gray-800 transition-colors">Offers</span>
                </button>
            </div>

            {/* KYC Banner - Show only if user is authenticated and not verified */}
            {isAuthenticated && user?.kyc_status !== 'verified' && (
              <div className="mt-4">
                <button 
                  onClick={() => router.push('/kyc/verify')} 
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 flex items-center justify-between group active:scale-[0.98] transition-all shadow-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-semibold text-white">التحقق من الهوية (KYC)</h4>
                      <p className="text-xs text-white/90">وثّق حسابك للوصول لجميع الميزات</p>
                    </div>
                  </div>
                  <span className="text-white group-hover:-translate-x-1 transition-transform">◀</span>
                </button>
              </div>
            )}
        </section>



        {/* Recent Chats Preview */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-gray-800">Recent Messages</h3>
                <button onClick={() => router.push('/chat')} className="text-xs text-purple-600 font-medium">View All</button>
            </div>

            <div className="flex flex-col gap-3">
                {/* Chat Item 1 */}
                <div onClick={() => router.push('/chat-detail-1')} className="bg-white rounded-2xl p-4 flex gap-4 shadow-md active:shadow-lg transition-all">
                    <div className="relative">
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop" className="w-12 h-12 rounded-full object-cover" alt="User" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm text-gray-800 truncate">Sarah Miller</h4>
                            <span className="text-[10px] text-purple-600 font-bold bg-purple-100 px-2 py-0.5 rounded-full">New</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">Hey! I just uploaded the new design files...</p>
                    </div>
                </div>

                {/* Chat Item 2 */}
                <div onClick={() => router.push('/chat-detail-2')} className="bg-white rounded-2xl p-4 flex gap-4 shadow-md active:shadow-lg transition-all">
                    <div className="relative">
                        <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop" className="w-12 h-12 rounded-full object-cover" alt="User" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm text-gray-800 truncate">David Chen</h4>
                            <span className="text-[10px] text-gray-400">2h ago</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">Can we discuss the budget for the next phase?</p>
                    </div>
                </div>
            </div>
        </section>

        {/* New Jobs (Horizontal) */}
        <section className="animate-slide-up pb-6" style={{ animationDelay: '0.25s' }}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-display font-semibold text-gray-800">Latest Jobs</h3>
                <button onClick={() => router.push('/jobs')} className="text-xs text-purple-600 font-medium">See All</button>
            </div>
            
            <div className="flex overflow-x-auto gap-4 hide-scrollbar pb-2 -mx-6 px-6">
                {/* Job Card 1 */}
                <div onClick={() => router.push('/job-detail-1')} className="min-w-[260px] bg-white rounded-2xl p-4 shadow-lg flex flex-col gap-3 active:scale-95 transition-transform">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" className="w-6 h-6" alt="Logo" />
                        </div>
                        <span className="text-xs font-medium text-purple-600">$45/hr</span>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800 text-sm">UX Designer</h4>
                        <p className="text-xs text-gray-500">Google • Remote</p>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <span className="px-2 py-1 rounded-md bg-purple-100 text-[10px] text-purple-700">Figma</span>
                        <span className="px-2 py-1 rounded-md bg-blue-100 text-[10px] text-blue-700">Mobile</span>
                    </div>
                </div>

                {/* Job Card 2 */}
                <div onClick={() => router.push('/job-detail-2')} className="min-w-[260px] bg-white rounded-2xl p-4 shadow-lg flex flex-col gap-3 active:scale-95 transition-transform">
                    <div className="flex justify-between items-start">
                        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                            F
                        </div>
                        <span className="text-xs font-medium text-purple-600">Fixed</span>
                    </div>
                    <div>
                        <h4 className="font-medium text-gray-800 text-sm">Frontend Dev</h4>
                        <p className="text-xs text-gray-500">Meta • Contract</p>
                    </div>
                    <div className="flex gap-2 mt-1">
                        <span className="px-2 py-1 rounded-md bg-purple-100 text-[10px] text-purple-700">React</span>
                        <span className="px-2 py-1 rounded-md bg-blue-100 text-[10px] text-blue-700">Tailwind</span>
                    </div>
                </div>
            </div>
        </section>

    </main>

    {/* Bottom Navigation */}
        </div>
      <BottomNav />
      </>
    );
}
