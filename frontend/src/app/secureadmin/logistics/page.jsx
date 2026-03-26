'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function LogisticsPage() {
  const [partners, setPartners] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('partners');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', tracking_url_template: '', notes: '' });

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data: p } = await supabase.from('shipping_partners').select('*').order('name');
    const { data: o } = await supabase.from('orders').select('*').not('courier_partner', 'is', null).order('dispatch_date', { ascending: false }).limit(50);
    setPartners(p || []);
    setOrders(o || []);
    setLoading(false);
  }

  async function savePartner() {
    if (!form.name) return alert('Name is required');
    await supabase.from('shipping_partners').insert(form);
    setShowForm(false);
    setForm({ name: '', contact_person: '', phone: '', email: '', tracking_url_template: '', notes: '' });
    fetchData();
  }

  async function deletePartner(id) {
    if (confirm('Delete this shipping partner?')) {
      await supabase.from('shipping_partners').delete().eq('id', id);
      fetchData();
    }
  }

  async function updateOrderLogistics(orderId, field, value) {
    await supabase.from('orders').update({ [field]: value }).eq('id', orderId);
    setOrders(orders.map(o => o.id === orderId ? { ...o, [field]: value } : o));
  }

  const statusColors = { placed: 'bg-gray-100 text-gray-700', confirmed: 'bg-blue-100 text-blue-700', processing: 'bg-amber-100 text-amber-700', out_for_delivery: 'bg-indigo-100 text-indigo-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };

  return (
    <div className="pb-10">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Logistics Management</h1>
      <p className="text-sm text-gray-500 mb-6">Manage shipping partners, track dispatches, and monitor deliveries.</p>

      <div className="flex gap-2 mb-6">
        {[['partners','🚚 Shipping Partners'],['dispatch','📤 Dispatch Tracking'],['delivery','📬 Delivery Status']].map(([key, lbl]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${activeTab === key ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}>{lbl}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
          <>
            {activeTab === 'partners' && (
              <div>
                <div className="p-4 border-b border-gray-100 flex justify-end">
                  <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition">+ Add Partner</button>
                </div>
                <table className="w-full text-sm">
                  <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
                    <th className="px-5 py-3">Partner</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">Tracking Template</th><th className="px-5 py-3 text-right">Actions</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {partners.map(p => (
                      <tr key={p.id} className="hover:bg-gray-50/50">
                        <td className="px-5 py-3"><p className="font-bold">{p.name}</p><p className="text-[10px] text-gray-400">{p.contact_person}</p></td>
                        <td className="px-5 py-3 text-xs">{p.phone}<br/>{p.email}</td>
                        <td className="px-5 py-3 text-xs text-gray-400 font-mono truncate max-w-xs">{p.tracking_url_template || '—'}</td>
                        <td className="px-5 py-3 text-right"><button onClick={() => deletePartner(p.id)} className="text-red-400 hover:text-red-600 text-xs">🗑️</button></td>
                      </tr>
                    ))}
                    {partners.length === 0 && <tr><td colSpan="4" className="px-5 py-10 text-center text-gray-400">No shipping partners added yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}

            {(activeTab === 'dispatch' || activeTab === 'delivery') && (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
                  <th className="px-5 py-3">Order</th><th className="px-5 py-3">Courier</th><th className="px-5 py-3">AWB</th><th className="px-5 py-3">Dispatch Date</th><th className="px-5 py-3">Status</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-bold">#{o.id}</td>
                      <td className="px-5 py-3">{o.courier_partner || '—'}</td>
                      <td className="px-5 py-3 font-mono text-xs">{o.awb_number || '—'}</td>
                      <td className="px-5 py-3 text-xs">{o.dispatch_date ? new Date(o.dispatch_date).toLocaleDateString() : '—'}</td>
                      <td className="px-5 py-3"><span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${statusColors[o.status] || 'bg-gray-100'}`}>{(o.status || '').replace(/_/g, ' ')}</span></td>
                    </tr>
                  ))}
                  {orders.length === 0 && <tr><td colSpan="5" className="px-5 py-10 text-center text-gray-400">No dispatched orders yet.</td></tr>}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h2 className="font-display text-xl font-bold mb-6">Add Shipping Partner</h2>
            <div className="space-y-3">
              {['name','contact_person','phone','email'].map(f => (
                <input key={f} placeholder={f.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              ))}
              <input placeholder="Tracking URL Template (use {awb})" value={form.tracking_url_template} onChange={e => setForm({...form, tracking_url_template: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={savePartner} className="flex-1 bg-gray-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-black transition">Save</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-gray-400 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
