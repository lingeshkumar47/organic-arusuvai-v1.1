'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ControlPanelPage() {
  const [toggles, setToggles] = useState({
    maintenance_mode: false, cod_enabled: true, reviews_enabled: true,
    registration_enabled: true, guest_checkout: true, whatsapp_notifications: false,
    email_notifications: true, auto_invoice: false, low_stock_alerts: true
  });

  const [config, setConfig] = useState({
    store_name: 'Organic Arusuvai', currency: 'INR', delivery_charge: '49',
    free_delivery_above: '499', tax_rate: '0', min_order: '0'
  });

  const toggleDescriptions = {
    maintenance_mode: { label: 'Maintenance Mode', desc: 'Show maintenance page to visitors', icon: '🔧', danger: true },
    cod_enabled: { label: 'Cash on Delivery', desc: 'Allow COD payment method', icon: '💵' },
    reviews_enabled: { label: 'Product Reviews', desc: 'Allow customers to post reviews', icon: '⭐' },
    registration_enabled: { label: 'User Registration', desc: 'Allow new account creation', icon: '👤' },
    guest_checkout: { label: 'Guest Checkout', desc: 'Allow checkout without account', icon: '🛒' },
    whatsapp_notifications: { label: 'WhatsApp Alerts', desc: 'Send order updates via WhatsApp', icon: '💬' },
    email_notifications: { label: 'Email Notifications', desc: 'Send order confirmations via email', icon: '📧' },
    auto_invoice: { label: 'Auto Invoice', desc: 'Generate invoice on order completion', icon: '🧾' },
    low_stock_alerts: { label: 'Low Stock Alerts', desc: 'Notify when stock drops below threshold', icon: '⚠️' },
  };

  return (
    <div className="pb-10">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Control Panel</h1>
      <p className="text-sm text-gray-500 mb-6">System settings and feature toggles for your store.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Feature Toggles */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">🎛️ Feature Toggles</h3>
          <div className="space-y-3">
            {Object.entries(toggleDescriptions).map(([key, meta]) => (
              <div key={key} className={`flex items-center justify-between p-3 rounded-xl border transition ${toggles[key] ? (meta.danger ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200') : 'bg-gray-50 border-gray-100'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-xl">{meta.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{meta.label}</p>
                    <p className="text-[10px] text-gray-400">{meta.desc}</p>
                  </div>
                </div>
                <button onClick={() => setToggles({...toggles, [key]: !toggles[key]})}
                  className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${toggles[key] ? (meta.danger ? 'bg-red-500' : 'bg-green-500') : 'bg-gray-300'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${toggles[key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* System Config */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4">⚙️ System Configuration</h3>
          <div className="space-y-3">
            {[
              { key: 'store_name', label: 'Store Name', type: 'text' },
              { key: 'currency', label: 'Currency', type: 'text' },
              { key: 'delivery_charge', label: 'Delivery Charge (₹)', type: 'number' },
              { key: 'free_delivery_above', label: 'Free Delivery Above (₹)', type: 'number' },
              { key: 'tax_rate', label: 'Tax Rate (%)', type: 'number' },
              { key: 'min_order', label: 'Minimum Order (₹)', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">{f.label}</label>
                <input type={f.type} value={config[f.key]} onChange={e => setConfig({...config, [f.key]: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              </div>
            ))}
            <button className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition mt-4">💾 Save Configuration</button>
          </div>
        </div>
      </div>
    </div>
  );
}
