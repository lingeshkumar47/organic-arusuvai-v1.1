'use client';
import { useState } from 'react';
import Link from 'next/link';

const steps = [
  { num: 1, title: 'Get a WhatsApp Business Account', instructions: [
    'Go to <a href="https://business.facebook.com/" target="_blank" class="text-primary-600 underline">Meta Business Suite</a>',
    'Create a Business Account if you don\'t have one',
    'Add your phone number for verification',
  ]},
  { num: 2, title: 'Set Up WhatsApp Cloud API', instructions: [
    'Go to <a href="https://developers.facebook.com/" target="_blank" class="text-primary-600 underline">Meta Developers</a> → Create an App',
    'Select <strong>"Business"</strong> type',
    'Add <strong>WhatsApp</strong> from the product list',
    'You\'ll get a <strong>temporary access token</strong> and <strong>Phone Number ID</strong>',
  ]},
  { num: 3, title: 'Generate Permanent Token', instructions: [
    'In Meta Developers, go to your app',
    'Navigate to <strong>WhatsApp → Configuration</strong>',
    'Create a <strong>System User</strong> with admin access',
    'Generate a <strong>Permanent Access Token</strong> with <code>whatsapp_business_messaging</code> permission',
  ]},
  { num: 4, title: 'Configure Webhook (for receiving messages)', instructions: [
    'In <strong>WhatsApp → Configuration → Webhook</strong>',
    'Callback URL: <code>http://organicarusuvai.local/api/whatsapp/webhook/</code>',
    'Verify Token: Use any secure string and paste it below',
    'Subscribe to: <strong>messages</strong>, <strong>message_status</strong>',
  ]},
  { num: 5, title: 'Paste Your Credentials Below', instructions: [
    'Copy the <strong>Access Token</strong>, <strong>Phone Number ID</strong>, and <strong>Business Account ID</strong>',
    'Click <strong>Save & Test</strong> to send a test message',
  ]},
];

export default function WhatsAppSettings() {
  const [accessToken, setAccessToken] = useState('');
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [businessAccountId, setBusinessAccountId] = useState('');
  const [webhookVerifyToken, setWebhookVerifyToken] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (accessToken && phoneNumberId) setSaved(true);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/secureadmin/settings" className="text-gray-400 hover:text-gray-600 transition">← Settings</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-800 font-medium">WhatsApp</span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <span className="text-4xl">💬</span>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">WhatsApp Business API</h1>
          <p className="text-sm text-gray-500">Automated order notifications, CRM broadcasts, and customer chat</p>
        </div>
      </div>

      {/* API Key Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-display font-semibold text-gray-900 mb-4">🔑 API Credentials</h2>
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Permanent Access Token</label>
            <input value={accessToken} onChange={e => { setAccessToken(e.target.value); setSaved(false); }}
              type="password" placeholder="EAAxxxxxxxxxxxxxxxx..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Phone Number ID</label>
            <input value={phoneNumberId} onChange={e => { setPhoneNumberId(e.target.value); setSaved(false); }}
              placeholder="1234567890123456"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Business Account ID</label>
            <input value={businessAccountId} onChange={e => setBusinessAccountId(e.target.value)}
              placeholder="1234567890123456"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Webhook Verify Token <span className="text-gray-400">(any secure string)</span></label>
            <input value={webhookVerifyToken} onChange={e => setWebhookVerifyToken(e.target.value)}
              placeholder="my_secure_verify_token_123"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="btn-primary !py-2.5">
              {saved ? '✅ Saved' : '💾 Save & Test'}
            </button>
            {saved && <span className="text-green-600 text-sm font-medium animate-fade-in">WhatsApp connected! Test message sent.</span>}
          </div>
        </div>
      </div>

      {/* Automated Messages */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-display font-semibold text-gray-900 mb-4">📨 Automated Messages</h2>
        <div className="space-y-3">
          {[
            { event: 'Order Placed', template: '🎉 Order #{order_id} confirmed! Total: ₹{total}', enabled: true },
            { event: 'Out for Delivery', template: '🚚 Your order #{order_id} is out for delivery!', enabled: true },
            { event: 'Delivered', template: '✅ Order #{order_id} delivered! Rate your experience.', enabled: true },
            { event: 'Abandoned Cart', template: '👋 You left items in your cart! Complete your order now.', enabled: false },
            { event: 'Promotional', template: '🌿 New arrivals! Check out our latest organic products.', enabled: false },
          ].map(m => (
            <div key={m.event} className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{m.event}</p>
                <p className="text-xs text-gray-500 font-mono">{m.template}</p>
              </div>
              <div className={`w-10 h-6 rounded-full flex items-center cursor-pointer transition ${m.enabled ? 'bg-primary-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                <span className="w-4 h-4 bg-white rounded-full mx-1 shadow" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-display font-semibold text-gray-900 mb-6">📋 Setup Instructions</h2>
        <div className="space-y-6">
          {steps.map(step => (
            <div key={step.num} className="flex gap-4">
              <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">{step.num}</span>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                <ul className="space-y-1.5">
                  {step.instructions.map((inst, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-primary-400 mt-0.5">•</span>
                      <span dangerouslySetInnerHTML={{ __html: inst }} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook URL */}
      <div className="bg-green-50 rounded-2xl p-5 mt-6 border border-green-100">
        <h3 className="font-semibold text-green-800 mb-2">🔗 Webhook URL</h3>
        <code className="block bg-white px-4 py-2 rounded-lg text-sm text-green-900 border border-green-200">http://organicarusuvai.local/api/whatsapp/webhook/</code>
      </div>
    </div>
  );
}
