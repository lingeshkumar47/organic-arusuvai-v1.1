'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

function simpleEncrypt(text, key = 'OA_VAULT_2026') {
  return btoa(text.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join(''));
}

function simpleDecrypt(enc, key = 'OA_VAULT_2026') {
  try {
    const decoded = atob(enc);
    return decoded.split('').map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))).join('');
  } catch { return '***ERROR***'; }
}

export default function VaultPage() {
  const [secrets, setSecrets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', service_name: '', username: '', value: '', category: 'api_key', notes: '' });
  const [revealed, setRevealed] = useState({});

  useEffect(() => { fetchSecrets(); }, []);
  async function fetchSecrets() { setLoading(true); const { data } = await supabase.from('credentials_vault').select('*').order('service_name'); setSecrets(data || []); setLoading(false); }

  async function saveSecret() {
    if (!form.label || !form.value) return alert('Label and value required');
    await supabase.from('credentials_vault').insert({ ...form, encrypted_value: simpleEncrypt(form.value), });
    setShowForm(false); setForm({ label: '', service_name: '', username: '', value: '', category: 'api_key', notes: '' }); fetchSecrets();
  }

  async function deleteSecret(id) { if (confirm('Delete this credential?')) { await supabase.from('credentials_vault').delete().eq('id', id); fetchSecrets(); } }

  const catColors = { api_key: 'bg-blue-100 text-blue-700', password: 'bg-red-100 text-red-700', token: 'bg-purple-100 text-purple-700', secret: 'bg-amber-100 text-amber-700', other: 'bg-gray-100 text-gray-600' };

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">Credentials Vault</h1><p className="text-sm text-gray-500">Securely store API keys, passwords, and secrets with encryption.</p></div>
        <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition shadow-md">+ Add Secret</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Loading vault...</div> : secrets.length === 0 ? (
          <div className="p-10 text-center text-gray-400"><span className="text-4xl block mb-3">🔐</span>No credentials stored yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
              <th className="px-5 py-3">Label</th><th className="px-5 py-3">Service</th><th className="px-5 py-3">User</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Value</th><th className="px-5 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {secrets.map(s => (
                <tr key={s.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-bold">{s.label}</td>
                  <td className="px-5 py-3 text-xs">{s.service_name}</td>
                  <td className="px-5 py-3 text-xs font-mono">{s.username || '—'}</td>
                  <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${catColors[s.category]}`}>{s.category}</span></td>
                  <td className="px-5 py-3">
                    {revealed[s.id] ? (
                      <span className="text-xs font-mono bg-green-50 px-2 py-1 rounded border border-green-200">{simpleDecrypt(s.encrypted_value)}</span>
                    ) : (
                      <span className="text-xs text-gray-400">••••••••••</span>
                    )}
                    <button onClick={() => setRevealed({...revealed, [s.id]: !revealed[s.id]})} className="ml-2 text-[10px] text-primary-600 font-bold">{revealed[s.id] ? 'Hide' : 'Show'}</button>
                  </td>
                  <td className="px-5 py-3 text-right"><button onClick={() => deleteSecret(s.id)} className="text-red-400 hover:text-red-600">🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h2 className="font-display text-xl font-bold mb-6">Add Credential</h2>
            <div className="space-y-3">
              <input placeholder="Label (e.g. Razorpay Live Key)" value={form.label} onChange={e => setForm({...form, label: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <input placeholder="Service Name (e.g. Razorpay)" value={form.service_name} onChange={e => setForm({...form, service_name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <input placeholder="Username (optional)" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <input placeholder="Secret Value (will be encrypted)" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" type="password" />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                <option value="api_key">API Key</option><option value="password">Password</option><option value="token">Token</option><option value="secret">Secret</option><option value="other">Other</option>
              </select>
              <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={saveSecret} className="flex-1 bg-gray-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-black transition">🔒 Encrypt & Save</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-gray-400 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
