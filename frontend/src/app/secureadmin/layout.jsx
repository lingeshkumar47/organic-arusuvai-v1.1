'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const navGroups = [
  { label: 'Overview', items: [
    { href: '/secureadmin', label: 'Dashboard Hub', icon: '📊' },
  ]},
  { label: 'Commerce', items: [
    { href: '/secureadmin/inventory', label: 'Inventory', icon: '📋' },
    { href: '/secureadmin/products', label: 'Products', icon: '📦' },
    { href: '/secureadmin/pricing', label: 'Pricing', icon: '💲' },
  ]},
  { label: 'Operations', items: [
    { href: '/secureadmin/orders', label: 'Orders', icon: '🛒' },
    { href: '/secureadmin/invoices', label: 'Invoices', icon: '🧾' },
    { href: '/secureadmin/logistics', label: 'Logistics', icon: '🚚' },
  ]},
  { label: 'Engagement', items: [
    { href: '/secureadmin/users', label: 'Customers', icon: '👥' },
    { href: '/secureadmin/testimonials', label: 'Testimonials', icon: '⭐' },
    { href: '/secureadmin/feedbacks', label: 'Feedback', icon: '💭' },
    { href: '/secureadmin/jerry', label: 'Jerry AI', icon: '🤖' },
  ]},
  { label: 'System', items: [
    { href: '/secureadmin/settings', label: 'Settings', icon: '⚙️' },
    { href: '/secureadmin/finance', label: 'Finance', icon: '💰' },
    { href: '/secureadmin/control-panel', label: 'Control', icon: '🎛️' },
  ]},
];

export default function SecureAdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Quick validation of the ddmm local storage bypass
    if (typeof window !== 'undefined') {
      const bypass = window.sessionStorage.getItem('masterAdminBypass');
      if (bypass === 'true') {
        setIsAuthorized(true);
      } else {
        router.push('/account');
      }
      setMounted(true);
    }
  }, [router]);

  if (!mounted || !isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-950/5 pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-white p-2 shadow-float flex items-center justify-center animate-pulse mb-6">
           <img src="/logos/SpecialLogo.png" alt="Auth" className="w-full h-full object-contain" />
        </div>
        <div className="text-xl font-black text-gray-400 uppercase tracking-widest animate-pulse">Authenticating SSL Hub...</div>
      </div>
    );
  }

  const handleLogout = () => {
    window.sessionStorage.removeItem('masterAdminBypass');
    router.push('/account');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden font-sans selection:bg-cta-400 selection:text-primary-950">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-admin-950/40 backdrop-blur-sm transition-opacity" onClick={() => setIsMobileOpen(false)} />
      )}

      {/* Sidebar (SaaS Style + iOS 26 Glass) */}
      <aside className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-admin-950 text-admin-300 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isSidebarOpen ? 'w-72' : 'w-24'} 
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        border-r border-white/5 shadow-2xl lg:shadow-none lg:relative`}
      >
         {/* Sidebar Header */}
         <div className="h-24 flex items-center justify-between px-6 shrink-0 border-b border-white/5">
            <Link href="/secureadmin" className="flex items-center gap-4 group overflow-hidden">
               <div className="w-10 h-10 p-1 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-float group-hover:scale-105 transition-transform">
                 <img src="/logos/SpecialLogo.png" alt="OA" className="w-full h-full object-contain" />
               </div>
               <div className={`transition-opacity duration-300 ${!isSidebarOpen ? 'opacity-0 w-0' : 'opacity-100'}`}>
                 <h2 className="font-display font-black text-white text-lg tracking-tight uppercase leading-none">OA Hub</h2>
                 <span className="text-[9px] font-black text-cta-500 uppercase tracking-widest leading-none">Secure Access</span>
               </div>
            </Link>
         </div>

         {/* Nav Links */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
            {navGroups.map((group, i) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
                 <p className={`text-[10px] font-black text-admin-500 uppercase tracking-widest mb-3 px-2 transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
                   {group.label}
                 </p>
                 <nav className="space-y-1">
                   {group.items.map((item) => {
                     const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                     return (
                       <Link 
                         key={item.href} 
                         href={item.href}
                         title={item.label}
                         onClick={() => setIsMobileOpen(false)}
                         className={`flex items-center gap-4 px-3 py-3 rounded-2xl font-bold transition-all duration-300 group
                           ${isActive 
                             ? 'bg-admin-800 text-white shadow-soft ring-1 ring-white/10' 
                             : 'hover:bg-admin-900/50 hover:text-white'}`}
                       >
                         <span className={`text-xl transition-transform duration-300 ${isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'group-hover:scale-110 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'}`}>
                           {item.icon}
                         </span>
                         <span className={`text-sm tracking-wide truncate transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 w-0 absolute' : 'opacity-100 static'}`}>
                           {item.label}
                         </span>
                       </Link>
                     );
                   })}
                 </nav>
              </div>
            ))}
         </div>

         {/* Sidebar Footer */}
         <div className="p-6 border-t border-white/5">
            <button onClick={handleLogout} title="Sign Out" className="flex items-center gap-4 w-full px-3 py-3 rounded-2xl font-bold text-admin-400 hover:text-red-400 hover:bg-red-500/10 transition-colors group">
              <span className="text-xl group-hover:scale-110 transition-transform grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100">🚪</span>
              <span className={`text-sm tracking-wide truncate transition-all duration-300 ${!isSidebarOpen ? 'opacity-0 w-0 absolute' : 'opacity-100 static'}`}>
                Sign Out
              </span>
            </button>
         </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 h-screen overflow-hidden">
        
        {/* Top Header / Command Bar */}
        <header className="h-24 px-6 md:px-10 flex items-center justify-between shrink-0 glass-panel border-b-0 border-gray-200 z-30 lg:mx-8 lg:mt-6 rounded-3xl shadow-sm mb-6">
           <div className="flex items-center gap-4">
             <button onClick={() => setIsMobileOpen(true)} className="lg:hidden w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl text-gray-600 hover:bg-gray-200 transition-colors">
               ☰
             </button>
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="hidden lg:flex w-10 h-10 items-center justify-center bg-gray-100 rounded-xl text-admin-400 hover:text-admin-900 hover:bg-gray-200 transition-colors tooltip relative group">
                {isSidebarOpen ? '◀' : '▶'}
             </button>
           </div>

           <div className="flex items-center gap-4 md:gap-6">
             <div className="hidden sm:flex items-center px-4 py-2 bg-gray-100 rounded-2xl border border-gray-200 focus-within:ring-2 ring-admin-200 focus-within:bg-white transition-all w-64 shadow-inner">
               <span className="text-gray-400 text-sm">🔍</span>
               <input placeholder="Command Search..." className="bg-transparent border-none outline-none text-sm w-full ml-2 font-medium placeholder:text-gray-400 text-admin-900" />
             </div>
             <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cta-400 to-cta-500 shadow-glow-cta flex items-center justify-center text-primary-950 font-black text-lg border-2 border-white dropdown-trigger cursor-pointer hover:scale-105 transition-transform">
               A
             </div>
           </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-8 lg:px-10 pb-20 custom-scrollbar animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
