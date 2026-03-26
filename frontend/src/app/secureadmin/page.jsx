'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

const stats = [
  { label: 'Today Revenue', value: '₹0', trend: '0.0%', color: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-200' },
  { label: 'Active Orders', value: '0', trend: '0', color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-200' },
  { label: 'Low Stock Alerts', value: '0', trend: '0', color: 'from-rose-500 to-red-500', shadow: 'shadow-red-200' },
  { label: 'New Customers', value: '0', trend: '0.0%', color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-200' },
];

const moduleGroups = [
  { 
    title: 'Commerce Core',
    items: [
      { name: 'Products Database', icon: '📦', desc: 'Manage catalog & variants', path: '/secureadmin/products' },
      { name: 'Inventory Engine', icon: '📋', desc: 'Stock alerts & tracked batches', path: '/secureadmin/inventory' },
      { name: 'Pricing Control', icon: '💲', desc: 'Global variable adjustments', path: '/secureadmin/pricing' },
    ]
  },
  {
    title: 'Logistics & Ops',
    items: [
      { name: 'Live Orders', icon: '🛒', desc: 'Process & fulfill', path: '/secureadmin/orders' },
      { name: 'Invoicing', icon: '🧾', desc: 'Generate & send bills', path: '/secureadmin/invoices' },
      { name: 'Dispatch & Fleet', icon: '🚚', desc: 'Carrier tracking', path: '/secureadmin/logistics' },
    ]
  },
  {
    title: 'Audience & Growth',
    items: [
      { name: 'Customers', icon: '👥', desc: 'Segments & profiles', path: '/secureadmin/users' },
      { name: 'Jerry AI', icon: '🤖', desc: 'Smart sales agent', path: '/secureadmin/jerry' },
      { name: 'Testimonials', icon: '⭐', desc: 'Moderate reviews', path: '/secureadmin/testimonials' },
    ]
  }
];

export default function SecureAdminDashboard() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  return (
    <div className="space-y-10 animate-fade-in">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 glass-panel p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cta-500/10 rounded-full blur-[80px]" />
        
        <div className="relative z-10">
          <p className="text-cta-600 font-bold uppercase tracking-widest text-xs mb-2">Secure Hub</p>
          <h1 className="font-display font-black text-4xl text-admin-900 tracking-tight leading-none mb-2">
            {greeting}, <span className="text-primary-600">Admin</span>.
          </h1>
          <p className="text-admin-500 font-medium tracking-wide">Here's what's happening with Organic Arusuvai today.</p>
        </div>
        
        <div className="relative z-10 flex items-center gap-3">
          <button className="btn-glass !bg-white !shadow-sm !border-gray-200 !text-admin-600 hover:!text-primary-600">
             Export Report
          </button>
          <Link href="/secureadmin/orders" className="btn-cta !rounded-xl !py-3 !px-6 shadow-glow-cta">
             View Live Orders
          </Link>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`p-6 rounded-[2rem] bg-gradient-to-br ${stat.color} text-white shadow-lg ${stat.shadow} relative overflow-hidden hover:-translate-y-1 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]`}>
             <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/20 rounded-full blur-2xl" />
             <p className="text-white/80 font-bold text-xs uppercase tracking-widest mb-2 relative z-10">{stat.label}</p>
             <h3 className="font-display font-black text-4xl mb-4 relative z-10 tracking-tighter">{stat.value}</h3>
             <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/20 text-white text-[10px] font-black uppercase tracking-widest relative z-10 backdrop-blur-sm">
                <span>{stat.trend}</span>
             </div>
          </div>
        ))}
      </div>

      {/* Categorized Modules */}
      <div className="space-y-10">
        {moduleGroups.map((group, grpIdx) => (
           <section key={grpIdx} className="animate-fade-in-up" style={{ animationDelay: `${(grpIdx + 1) * 100}ms` }}>
              <div className="flex items-center gap-4 mb-6">
                 <h2 className="font-display font-black text-2xl text-admin-900">{group.title}</h2>
                 <div className="flex-1 h-px bg-gray-200 rounded-full" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {group.items.map((item, idx) => (
                    <Link 
                      href={item.path} 
                      key={idx}
                      className="group glass-panel p-6 rounded-[2rem] bg-white border border-gray-100 hover:border-primary-200 hover:shadow-float transition-all duration-300 flex items-center gap-5 cursor-pointer relative overflow-hidden"
                    >
                       <div className="absolute right-0 top-0 h-full w-32 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none group-hover:from-primary-50/50 transition-colors" />
                       
                       <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl shrink-0 group-hover:scale-110 group-hover:bg-white group-hover:shadow-sm transition-all duration-300 border border-gray-100">
                          {item.icon}
                       </div>
                       
                       <div className="relative z-10">
                          <h3 className="font-display font-bold text-admin-900 text-lg group-hover:text-primary-600 transition-colors">{item.name}</h3>
                          <p className="text-admin-400 text-xs font-bold mt-1 line-clamp-1">{item.desc}</p>
                       </div>
                    </Link>
                 ))}
              </div>
           </section>
        ))}
      </div>

    </div>
  );
}
