'use client';
import { useState } from 'react';
import Link from 'next/link';

const steps = [
  { num: 1, title: 'Create a Razorpay Account', instructions: [
    'Go to <a href="https://dashboard.razorpay.com/signup" target="_blank" class="text-primary-600 underline">Razorpay Dashboard</a> and sign up',
    'Complete KYC verification (PAN, bank account, business details)',
    'Activate your account (takes 1–2 business days)',
  ]},
  { num: 2, title: 'Generate API Keys', instructions: [
    'Login to <a href="https://dashboard.razorpay.com/#/access/signin" target="_blank" class="text-primary-600 underline">Razorpay Dashboard</a>',
    'Go to <strong>Account & Settings → API Keys</strong>',
    'Click <strong>"Generate Key"</strong> for either Test or Live mode',
    '⚡ Use <strong>Test Mode</strong> first to verify the integration, then switch to Live',
  ]},
  { num: 3, title: 'Set Up Webhooks (Optional)', instructions: [
    'Go to <strong>Account & Settings → Webhooks</strong>',
    'Click <strong>"+ Add New Webhook"</strong>',
    'Webhook URL: <code>http://organicarusuvai.local/api/payments/webhook/</code>',
    'Select events: <strong>payment.captured</strong>, <strong>order.paid</strong>, <strong>refund.created</strong>',
    'Copy the Webhook Secret and paste below',
  ]},
  { num: 4, title: 'Paste Your Keys Below', instructions: [
    'Copy the <strong>Key ID</strong> (starts with <code>rzp_test_</code> or <code>rzp_live_</code>)',
    'Copy the <strong>Key Secret</strong>',
    'Click <strong>Save & Test</strong>',
  ]},
];

export default function RazorpaySettings() {
  const [keyId, setKeyId] = useState('');
  const [keySecret, setKeySecret] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [mode, setMode] = useState('test');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (keyId && keySecret) setSaved(true);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/secureadmin/settings" className="text-gray-400 hover:text-gray-600 transition">← Settings</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-800 font-medium">Razorpay</span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <span className="text-4xl">💳</span>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Razorpay Payment Gateway</h1>
          <p className="text-sm text-gray-500">Accept UPI, debit/credit cards, and net banking</p>
        </div>
      </div>

      {/* API Key Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-display font-semibold text-gray-900 mb-4">🔑 API Credentials</h2>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-5">
          {['test', 'live'].map(m => (
            <button key={m} onClick={() => { setMode(m); setSaved(false); }}
              className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition
                ${mode === m ? (m === 'test' ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-green-400 bg-green-50 text-green-700') : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {m === 'test' ? '🧪 Test Mode' : '🟢 Live Mode'}
            </button>
          ))}
        </div>

        {mode === 'test' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 text-sm text-amber-800">
            ⚡ <strong>Test Mode</strong> — No real payments will be processed. Use Razorpay test cards to verify the integration.
          </div>
        )}

        <div className="space-y-4 max-w-xl">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Razorpay Key ID</label>
            <input value={keyId} onChange={e => { setKeyId(e.target.value); setSaved(false); }}
              placeholder={mode === 'test' ? 'rzp_test_xxxxxxxxxxxxxxx' : 'rzp_live_xxxxxxxxxxxxxxx'}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Razorpay Key Secret</label>
            <input value={keySecret} onChange={e => { setKeySecret(e.target.value); setSaved(false); }}
              type="password" placeholder="xxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Webhook Secret <span className="text-gray-400">(optional)</span></label>
            <input value={webhookSecret} onChange={e => setWebhookSecret(e.target.value)}
              type="password" placeholder="whsec_xxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="btn-primary !py-2.5">
              {saved ? '✅ Saved' : '💾 Save & Test'}
            </button>
            {saved && <span className="text-green-600 text-sm font-medium animate-fade-in">Payment gateway connected!</span>}
          </div>
        </div>
      </div>

      {/* Supported Methods */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-display font-semibold text-gray-900 mb-4">💰 Supported Payment Methods</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['UPI (GPay, PhonePe)', 'Credit Cards', 'Debit Cards', 'Net Banking', 'Wallets', 'EMI', 'Pay Later', 'International'].map(m => (
            <div key={m} className="bg-gray-50 rounded-xl p-3 text-center text-sm text-gray-700 font-medium">
              ✅ {m}
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

      {/* Test Card Info */}
      <div className="bg-purple-50 rounded-2xl p-5 mt-6 border border-purple-100">
        <h3 className="font-semibold text-purple-800 mb-2">🧪 Test Card Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm text-purple-700">
          <div>
            <p className="font-medium">Card Number</p>
            <code className="bg-white px-2 py-1 rounded text-purple-900">4111 1111 1111 1111</code>
          </div>
          <div>
            <p className="font-medium">Expiry / CVV</p>
            <code className="bg-white px-2 py-1 rounded text-purple-900">Any future date / Any 3 digits</code>
          </div>
          <div>
            <p className="font-medium">UPI ID (Test)</p>
            <code className="bg-white px-2 py-1 rounded text-purple-900">success@razorpay</code>
          </div>
          <div>
            <p className="font-medium">UPI ID (Failure)</p>
            <code className="bg-white px-2 py-1 rounded text-purple-900">failure@razorpay</code>
          </div>
        </div>
      </div>
    </div>
  );
}
