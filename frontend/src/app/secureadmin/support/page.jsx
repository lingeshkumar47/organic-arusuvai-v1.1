'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function SupportPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'medium', category: 'general' });

  useEffect(() => { fetchTickets(); }, []);
  async function fetchTickets() {
    setLoading(true);
    const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
    setTickets(data || []);
    setLoading(false);
  }

  async function createTicket() {
    if (!form.subject) return alert('Subject required');
    const slaHours = { low: 48, medium: 24, high: 8, urgent: 2 };
    const sla = new Date(Date.now() + slaHours[form.priority] * 3600000).toISOString();
    await supabase.from('support_tickets').insert({ ...form, sla_deadline: sla });
    setShowForm(false); setForm({ subject: '', description: '', priority: 'medium', category: 'general' }); fetchTickets();
  }

  async function updateStatus(id, status) {
    const updates = { status };
    if (status === 'resolved') updates.resolved_at = new Date().toISOString();
    await supabase.from('support_tickets').update(updates).eq('id', id);
    fetchTickets();
  }

  const priorityColors = { low: 'bg-gray-100 text-gray-600', medium: 'bg-blue-100 text-blue-700', high: 'bg-amber-100 text-amber-700', urgent: 'bg-red-100 text-red-700' };
  const statusColors = { open: 'bg-yellow-100 text-yellow-700', in_progress: 'bg-blue-100 text-blue-700', resolved: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-500' };
  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">Support Tickets</h1><p className="text-sm text-gray-500">Track and resolve customer issues with SLA monitoring.</p></div>
        <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition shadow-md">+ New Ticket</button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {[['open','Open','🟡'],['in_progress','In Progress','🔵'],['resolved','Resolved','🟢'],['closed','Closed','⚫']].map(([s, lbl, dot]) => {
          const count = tickets.filter(t => t.status === s).length;
          return <div key={s} onClick={() => setFilter(s === filter ? 'all' : s)} className={`p-4 rounded-xl border cursor-pointer transition ${filter === s ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
            <p className="text-xs text-gray-500">{dot} {lbl}</p><p className="text-2xl font-bold mt-1">{count}</p>
          </div>;
        })}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
              <th className="px-5 py-3">#</th><th className="px-5 py-3">Subject</th><th className="px-5 py-3">Priority</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">SLA</th><th className="px-5 py-3 text-right">Action</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(t => {
                const slaBreached = t.sla_deadline && new Date(t.sla_deadline) < new Date() && t.status !== 'resolved' && t.status !== 'closed';
                return (
                  <tr key={t.id} className={`hover:bg-gray-50/50 ${slaBreached ? 'bg-red-50/30' : ''}`}>
                    <td className="px-5 py-3 font-mono text-xs">#{t.id}</td>
                    <td className="px-5 py-3"><p className="font-bold">{t.subject}</p><p className="text-[10px] text-gray-400 line-clamp-1">{t.description}</p></td>
                    <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${priorityColors[t.priority]}`}>{t.priority}</span></td>
                    <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColors[t.status]}`}>{t.status?.replace(/_/g,' ')}</span></td>
                    <td className="px-5 py-3 text-xs">{slaBreached ? <span className="text-red-600 font-bold">⚠️ BREACHED</span> : t.sla_deadline ? new Date(t.sla_deadline).toLocaleString() : '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <select onChange={e => updateStatus(t.id, e.target.value)} value={t.status} className="text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white">
                        <option value="open">Open</option><option value="in_progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan="6" className="px-5 py-10 text-center text-gray-400">No tickets found.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h2 className="font-display text-xl font-bold mb-6">Create Support Ticket</h2>
            <div className="space-y-3">
              <input placeholder="Subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows="3" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                <option value="general">General</option><option value="order">Order Issue</option><option value="product">Product Issue</option><option value="payment">Payment</option><option value="delivery">Delivery</option>
              </select>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={createTicket} className="flex-1 bg-gray-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-black transition">Create Ticket</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-gray-400 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
