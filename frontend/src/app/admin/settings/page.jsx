'use client';
import Link from 'next/link';

export default function AdminSettings() {
  const integrations = [
    {
      icon: '🔐', title: 'Google OAuth', desc: 'Enable Google login for your customers',
      href: '/admin/settings/google-oauth', status: 'Not Connected', statusColor: 'text-amber-600 bg-amber-50',
    },
    {
      icon: '💳', title: 'Razorpay Payment Gateway', desc: 'Accept UPI, cards, and net banking payments',
      href: '/admin/settings/razorpay', status: 'Not Connected', statusColor: 'text-amber-600 bg-amber-50',
    },
    {
      icon: '💬', title: 'WhatsApp Business API', desc: 'Send order notifications and marketing broadcasts',
      href: '/admin/settings/whatsapp', status: 'Not Connected', statusColor: 'text-amber-600 bg-amber-50',
    },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-sm text-gray-500 mb-8">Configure integrations and API keys for your store.</p>

      <div className="space-y-4">
        {integrations.map(item => (
          <Link key={item.title} href={item.href}
            className="flex items-center gap-5 bg-white rounded-2xl border border-gray-100 p-6 hover:border-primary-200 hover:shadow-md transition group">
            <span className="text-4xl">{item.icon}</span>
            <div className="flex-1">
              <h2 className="font-display font-semibold text-gray-900 group-hover:text-primary-700 transition">{item.title}</h2>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${item.statusColor}`}>⚠️ {item.status}</span>
            <span className="text-gray-400 group-hover:text-primary-600 text-xl">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
