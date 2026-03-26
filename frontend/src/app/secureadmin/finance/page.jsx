'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

export default function FinanceAdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    razorpayKeyId: 'rzp_test_rzp_test_SUkV9ZLVTWvtDS',
    razorpaySecret: '1Z57AWN4voemJFTzr7Xvmsuu',
    mode: 'test',
    adminUpi: '8056106136@pz'
  });

  useEffect(() => {
    // In a real app, fetch from Supabase 'site_settings'
    const loadSettings = async () => {
      // Simulate fetch
      const savedKey = localStorage.getItem('oa_razorpay_key');
      const savedSecret = localStorage.getItem('oa_razorpay_secret');
      const savedMode = localStorage.getItem('oa_razorpay_mode');
      const savedUpi = localStorage.getItem('oa_admin_upi_id');
      
      if (savedKey) setConfig(prev => ({ ...prev, razorpayKeyId: savedKey }));
      if (savedSecret) setConfig(prev => ({ ...prev, razorpaySecret: savedSecret }));
      if (savedMode) setConfig(prev => ({ ...prev, mode: savedMode }));
      if (savedUpi) setConfig(prev => ({ ...prev, adminUpi: savedUpi }));
      
      setLoading(false);
    };
    loadSettings();
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('oa_razorpay_key', config.razorpayKeyId);
      localStorage.setItem('oa_razorpay_secret', config.razorpaySecret);
      localStorage.setItem('oa_razorpay_mode', config.mode);
      localStorage.setItem('oa_admin_upi_id', config.adminUpi);
      setSaving(false);
      alert("Finance Settings Vault Updated Successfully! 🚀");
    }, 1000);
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse">Initializing Financial Vault...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20 pt-10 px-4">
      <div className="flex items-center justify-between mb-12">
        <div>
           <Link href="/secureadmin/jerry" className="text-xs font-black text-primary-500 uppercase tracking-widest hover:underline flex items-center gap-1 mb-2">← Back to Strategist</Link>
           <h1 className="text-4xl font-black text-gray-900 tracking-tight">Finance <span className="text-primary-600">& Payments</span></h1>
           <p className="text-sm text-gray-500 font-medium italic mt-1">Manage gateways, API keys, and transaction modes.</p>
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-2xl border border-emerald-100 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
           <p className="text-[10px] font-black uppercase tracking-widest">Gateway Online</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Razorpay Section */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
           <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <span className="text-2xl">💳</span>
                 <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">Razorpay Integration</h3>
              </div>
              <div className="flex bg-white p-1 rounded-xl shadow-inner border border-gray-200">
                 <button 
                  onClick={() => setConfig({...config, mode: 'test'})}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${config.mode === 'test' ? 'bg-amber-100 text-amber-700 shadow-sm' : 'text-gray-400 opacity-50'}`}
                 >Test Mode</button>
                 <button 
                  onClick={() => setConfig({...config, mode: 'live'})}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${config.mode === 'live' ? 'bg-primary-900 text-white shadow-sm' : 'text-gray-400 opacity-50'}`}
                 >Live Mode</button>
              </div>
           </div>

           <div className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Key ID</label>
                    <input 
                      type="text" 
                      value={config.razorpayKeyId}
                      onChange={e => setConfig({...config, razorpayKeyId: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                      placeholder="rzp_test_..."
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Key Secret</label>
                    <input 
                      type="password" 
                      value={config.razorpaySecret}
                      onChange={e => setConfig({...config, razorpaySecret: e.target.value})}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                      placeholder="••••••••••••••••"
                    />
                 </div>
              </div>

              <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100 flex items-center gap-4">
                 <span className="text-2xl text-primary-600 group-hover:rotate-12 transition-transform italic font-black">!</span>
                 <p className="text-xs text-primary-900 font-medium leading-relaxed">
                   When <strong>Live Mode</strong> is active, all real transactions will hit the production API. Ensure your secret keys are protected.
                 </p>
              </div>
           </div>
        </div>

        {/* UPI Section */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden">
           <div className="p-8 bg-gray-50 border-b border-gray-100 flex items-center gap-3">
              <span className="text-2xl">📲</span>
              <h3 className="font-black text-xl text-gray-900 uppercase tracking-tight">Manual UPI Config</h3>
           </div>
           <div className="p-10">
              <div className="space-y-2 max-w-md">
                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Admin UPI ID</label>
                 <input 
                   type="text" 
                   value={config.adminUpi}
                   onChange={e => setConfig({...config, adminUpi: e.target.value})}
                   className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                   placeholder="name@bank/upi"
                 />
              </div>
           </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-primary-900 text-white py-6 rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl hover:bg-black transition-all disabled:opacity-50 active:scale-[0.98]"
        >
          {saving ? 'Syncing Financial Data...' : 'Confirm & Save Changes'}
        </button>
      </div>
    </div>
  );
}
