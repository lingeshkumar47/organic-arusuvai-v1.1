'use client';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminHoneypot() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Record the phishing attempt silently
    try {
      await supabase.from('phishing_attempts').insert({
        entered_email: email,
        entered_password: password,
        user_agent: navigator.userAgent,
        ip_address: 'client-side'
      });
    } catch (err) {
      // silently fail — don't expose the trap
    }

    // Simulate realistic login delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    setLoading(false);
    setError('Invalid credentials. Your access request has been logged and forwarded to the security team.');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Fake branding */}
        <div className="text-center mb-8">
          <span className="text-5xl">🌿</span>
          <h1 className="font-display text-2xl font-bold text-white mt-3">Organic Arusuvai</h1>
          <p className="text-gray-400 text-sm mt-1">Administrative Control Panel</p>
        </div>

        <form onSubmit={handleLogin} className="bg-gray-800 rounded-2xl border border-gray-700 p-8 shadow-2xl">
          <h2 className="text-white font-bold text-lg mb-1">Admin Sign In</h2>
          <p className="text-gray-500 text-xs mb-6">Authorized personnel only. All access attempts are monitored.</p>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-xs font-medium mb-4 animate-pulse">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Administrator Email</label>
              <input 
                value={email} onChange={e => setEmail(e.target.value)}
                type="email" placeholder="admin@company.com" required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none transition placeholder:text-gray-600"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block mb-2">Secure Password</label>
              <input 
                value={password} onChange={e => setPassword(e.target.value)}
                type="password" placeholder="••••••••••" required
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:border-blue-500 outline-none transition placeholder:text-gray-600"
              />
            </div>
          </div>

          <button type="submit" disabled={loading}
            className={`w-full mt-6 py-3.5 rounded-xl font-bold text-sm transition ${loading ? 'bg-blue-800 text-blue-300 cursor-wait' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'}`}>
            {loading ? 'Authenticating...' : 'Access Dashboard'}
          </button>

          <p className="text-center text-[10px] text-gray-600 mt-6">
            🔒 256-bit SSL Encrypted Connection
          </p>
        </form>

        <p className="text-center text-gray-600 text-[10px] mt-6">
          © 2026 Organic Arusuvai Pvt. Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
}
