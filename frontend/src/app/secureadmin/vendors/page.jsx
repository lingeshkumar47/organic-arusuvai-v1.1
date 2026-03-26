'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', contact_person: '', phone: '', email: '', address: '', gst_number: '', vendor_type: 'supplier', notes: '' });
  const [activeTab, setActiveTab] = useState('directory');
  const [vendorProducts, setVendorProducts] = useState([]);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data: v } = await supabase.from('vendors').select('*').order('name');
    const { data: vp } = await supabase.from('vendor_products').select('*, vendors(name), products(name)').order('last_ordered', { ascending: false });
    setVendors(v || []);
    setVendorProducts(vp || []);
    setLoading(false);
  }

  async function saveVendor() {
    if (!form.name) return alert('Vendor name required');
    await supabase.from('vendors').insert(form);
    setShowForm(false);
    setForm({ name: '', contact_person: '', phone: '', email: '', address: '', gst_number: '', vendor_type: 'supplier', notes: '' });
    fetchData();
  }

  async function deleteVendor(id) {
    if (confirm('Delete this vendor?')) { await supabase.from('vendors').delete().eq('id', id); fetchData(); }
  }

  async function toggleActive(id, current) {
    await supabase.from('vendors').update({ is_active: !current }).eq('id', id);
    fetchData();
  }

  const typeColors = { supplier: 'bg-blue-100 text-blue-700', printer: 'bg-purple-100 text-purple-700', logistics: 'bg-emerald-100 text-emerald-700', packaging: 'bg-amber-100 text-amber-700' };

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-sm text-gray-500">Manage suppliers, printers, logistics partners, and procurement.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition shadow-md">+ Add Vendor</button>
      </div>

      <div className="flex gap-2 mb-6">
        {[['directory','🏭 Directory'],['pricing','💰 Pricing Records'],['procurement','📋 Procurement']].map(([key, lbl]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${activeTab === key ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}>{lbl}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
          <>
            {activeTab === 'directory' && (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
                  <th className="px-5 py-3">Vendor</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Contact</th><th className="px-5 py-3">GST</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {vendors.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3"><p className="font-bold">{v.name}</p><p className="text-[10px] text-gray-400">{v.contact_person}</p></td>
                      <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${typeColors[v.vendor_type] || 'bg-gray-100'}`}>{v.vendor_type}</span></td>
                      <td className="px-5 py-3 text-xs">{v.phone}<br/>{v.email}</td>
                      <td className="px-5 py-3 text-xs font-mono">{v.gst_number || '—'}</td>
                      <td className="px-5 py-3"><button onClick={() => toggleActive(v.id, v.is_active)} className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${v.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{v.is_active ? 'Active' : 'Inactive'}</button></td>
                      <td className="px-5 py-3 text-right"><button onClick={() => deleteVendor(v.id)} className="text-red-400 hover:text-red-600">🗑️</button></td>
                    </tr>
                  ))}
                  {vendors.length === 0 && <tr><td colSpan="6" className="px-5 py-10 text-center text-gray-400">No vendors added yet.</td></tr>}
                </tbody>
              </table>
            )}
            {activeTab === 'pricing' && (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
                  <th className="px-5 py-3">Vendor</th><th className="px-5 py-3">Product</th><th className="px-5 py-3">Procurement Price</th><th className="px-5 py-3">Last Ordered</th><th className="px-5 py-3">Qty Ordered</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {vendorProducts.map(vp => (
                    <tr key={vp.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 font-medium">{vp.vendors?.name}</td>
                      <td className="px-5 py-3">{vp.products?.name}</td>
                      <td className="px-5 py-3 font-bold text-green-700">₹{vp.procurement_price}</td>
                      <td className="px-5 py-3 text-xs text-gray-400">{vp.last_ordered || '—'}</td>
                      <td className="px-5 py-3">{vp.quantity_ordered}</td>
                    </tr>
                  ))}
                  {vendorProducts.length === 0 && <tr><td colSpan="5" className="px-5 py-10 text-center text-gray-400">No procurement records.</td></tr>}
                </tbody>
              </table>
            )}
            {activeTab === 'procurement' && (
              <div className="p-10 text-center text-gray-400">
                <span className="text-4xl block mb-3">📋</span>
                Procurement tracking is linked to vendor-product relationships. Add vendors and link them to products to start tracking.
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h2 className="font-display text-xl font-bold mb-6">Add Vendor</h2>
            <div className="space-y-3">
              {['name','contact_person','phone','email','address','gst_number'].map(f => (
                <input key={f} placeholder={f.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase())} value={form[f]} onChange={e => setForm({...form, [f]: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              ))}
              <select value={form.vendor_type} onChange={e => setForm({...form, vendor_type: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                <option value="supplier">Supplier</option><option value="printer">Printer</option><option value="logistics">Logistics</option><option value="packaging">Packaging</option>
              </select>
              <textarea placeholder="Notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={saveVendor} className="flex-1 bg-gray-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-black transition">Save Vendor</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-gray-400 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
