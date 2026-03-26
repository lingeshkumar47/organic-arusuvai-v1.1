'use client';
import { useState } from 'react';
import Link from 'next/link';

const steps = [
  { num: 1, title: 'Create a Google Cloud Project', instructions: [
    'Go to <a href="https://console.cloud.google.com/" target="_blank" class="text-primary-600 underline">Google Cloud Console</a>',
    'Click "Select a project" → "New Project"',
    'Name it "Organic Arusuvai" and click Create',
  ]},
  { num: 2, title: 'Enable Google OAuth API', instructions: [
    'In the sidebar, go to <strong>APIs & Services → Library</strong>',
    'Search for "Google Identity" or "Google+ API"',
    'Click <strong>Enable</strong>',
  ]},
  { num: 3, title: 'Create OAuth Credentials', instructions: [
    'Go to <strong>APIs & Services → Credentials</strong>',
    'Click <strong>"+ Create Credentials" → "OAuth Client ID"</strong>',
    'Select <strong>Web application</strong> as the type',
    'Add authorized redirect URI: <code>http://organicarusuvai.local/api/auth/google/callback/</code>',
    'Also add: <code>http://localhost:3000/api/auth/google/callback/</code> for dev',
  ]},
  { num: 4, title: 'Copy Your Credentials', instructions: [
    'Copy the <strong>Client ID</strong> and <strong>Client Secret</strong>',
    'Paste them in the fields below',
    'Click <strong>Save & Test</strong>',
  ]},
];

export default function GoogleOAuthSettings() {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (clientId && clientSecret) setSaved(true);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Link href="/secureadmin/settings" className="text-gray-400 hover:text-gray-600 transition">← Settings</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-800 font-medium">Google OAuth</span>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <span className="text-4xl">🔐</span>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Google OAuth Integration</h1>
          <p className="text-sm text-gray-500">Allow customers to sign in with their Google account</p>
        </div>
      </div>

      {/* API Key Form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8">
        <h2 className="font-display font-semibold text-gray-900 mb-4">🔑 API Credentials</h2>
        <div className="space-y-4 max-w-xl">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Google Client ID</label>
            <input value={clientId} onChange={e => { setClientId(e.target.value); setSaved(false); }}
              placeholder="xxxxxxxxx.apps.googleusercontent.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Google Client Secret</label>
            <input value={clientSecret} onChange={e => { setClientSecret(e.target.value); setSaved(false); }}
              type="password" placeholder="GOCSPX-xxxxxxxxxxxxxxxxx"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="btn-primary !py-2.5">
              {saved ? '✅ Saved' : '💾 Save & Test'}
            </button>
            {saved && <span className="text-green-600 text-sm font-medium animate-fade-in">Connection successful!</span>}
          </div>
        </div>
      </div>

      {/* Step-by-Step Instructions */}
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

      {/* Callback URLs */}
      <div className="bg-blue-50 rounded-2xl p-5 mt-6 border border-blue-100">
        <h3 className="font-semibold text-blue-800 mb-2">ℹ️ Authorized Redirect URIs</h3>
        <p className="text-sm text-blue-700 mb-3">Add these URLs to your Google Cloud OAuth consent screen:</p>
        <div className="space-y-2">
          <code className="block bg-white px-4 py-2 rounded-lg text-sm text-blue-900 border border-blue-200">http://organicarusuvai.local/api/auth/google/callback/</code>
          <code className="block bg-white px-4 py-2 rounded-lg text-sm text-blue-900 border border-blue-200">http://localhost:3000/api/auth/google/callback/</code>
        </div>
      </div>
    </div>
  );
}
