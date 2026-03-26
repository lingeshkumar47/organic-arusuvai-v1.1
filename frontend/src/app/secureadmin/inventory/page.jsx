'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [adjustModal, setAdjustModal] = useState(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustType, setAdjustType] = useState('restock');
  const [adjustNotes, setAdjustNotes] = useState('');

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data: prods } = await supabase.from('products').select('*, product_variants(*), categories(name)').order('name');
    const { data: invLogs } = await supabase.from('inventory_logs').select('*, products(name)').order('created_at', { ascending: false }).limit(50);
    setProducts(prods || []);
    setLogs(invLogs || []);
    setLoading(false);
  }

  async function submitAdjustment() {
    if (!adjustQty || adjustQty == 0) return;
    const variant = adjustModal;
    const newStock = Math.max(0, (variant.stock || 0) + parseInt(adjustQty));
    
    await supabase.from('product_variants').update({ stock: newStock }).eq('id', variant.id);
    await supabase.from('inventory_logs').insert({
      product_id: variant.product_id,
      variant_id: variant.id,
      change_type: adjustType,
      quantity_change: parseInt(adjustQty),
      notes: adjustNotes
    });
    setAdjustModal(null);
    setAdjustQty(0);
    setAdjustNotes('');
    fetchData();
  }

  const allVariants = products.flatMap(p => (p.product_variants || []).map(v => ({ ...v, productName: p.name, category: p.categories?.name, threshold: p.low_stock_threshold || 10 })));
  const lowStock = allVariants.filter(v => (v.stock || 0) <= v.threshold);
  const totalStock = allVariants.reduce((s, v) => s + (v.stock || 0), 0);

  return (
    <div className="pb-10">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Inventory Management</h1>
      <p className="text-sm text-gray-500 mb-6">Track stock levels, manage batches, and monitor low-stock alerts.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total SKUs', value: allVariants.length, icon: '📋', color: 'from-blue-500 to-blue-600' },
          { label: 'Total Stock', value: totalStock, icon: '📦', color: 'from-emerald-500 to-emerald-600' },
          { label: 'Low Stock Alerts', value: lowStock.length, icon: '⚠️', color: lowStock.length > 0 ? 'from-red-500 to-red-600' : 'from-gray-400 to-gray-500' },
          { label: 'Stock Movements', value: logs.length, icon: '🔄', color: 'from-purple-500 to-purple-600' },
        ].map(c => (
          <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white shadow-lg`}>
            <p className="text-xs opacity-80 font-medium">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[['overview','📋 Stock Overview'],['alerts','⚠️ Low Stock'],['logs','🔄 Movement Log']].map(([key, lbl]) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${activeTab === key ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>{lbl}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Loading inventory...</div> : (
          <div className="overflow-x-auto">
            {activeTab === 'overview' && (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
                  <th className="px-5 py-3">Product</th><th className="px-5 py-3">Variant</th><th className="px-5 py-3">Stock</th><th className="px-5 py-3">Threshold</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {allVariants.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50/50 transition">
                      <td className="px-5 py-3"><p className="font-bold text-gray-800">{v.productName}</p><p className="text-[10px] text-gray-400">{v.category}</p></td>
                      <td className="px-5 py-3 font-medium">{v.name}</td>
                      <td className="px-5 py-3 font-bold">{v.stock || 0}</td>
                      <td className="px-5 py-3 text-gray-400">{v.threshold}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold ${(v.stock || 0) <= 0 ? 'bg-red-100 text-red-700' : (v.stock || 0) <= v.threshold ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                          {(v.stock || 0) <= 0 ? 'Out of Stock' : (v.stock || 0) <= v.threshold ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => setAdjustModal(v)} className="text-xs bg-primary-50 text-primary-700 px-3 py-1.5 rounded-lg hover:bg-primary-100 font-bold transition">± Adjust</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'alerts' && (
              <div className="p-6">
                {lowStock.length === 0 ? <p className="text-center text-gray-400 py-10">✅ All stock levels are healthy!</p> : (
                  <div className="space-y-3">
                    {lowStock.map(v => (
                      <div key={v.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                        <div>
                          <p className="font-bold text-red-800">{v.productName} — {v.name}</p>
                          <p className="text-xs text-red-500">Only {v.stock || 0} units remaining (threshold: {v.threshold})</p>
                        </div>
                        <button onClick={() => setAdjustModal(v)} className="text-xs bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition">Restock Now</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'logs' && (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
                  <th className="px-5 py-3">Date</th><th className="px-5 py-3">Product</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Qty Change</th><th className="px-5 py-3">Notes</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map(l => (
                    <tr key={l.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3 text-xs text-gray-400">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="px-5 py-3 font-medium">{l.products?.name || '—'}</td>
                      <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${l.change_type === 'restock' ? 'bg-green-100 text-green-700' : l.change_type === 'sale' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{l.change_type}</span></td>
                      <td className={`px-5 py-3 font-bold ${l.quantity_change > 0 ? 'text-green-600' : 'text-red-500'}`}>{l.quantity_change > 0 ? '+' : ''}{l.quantity_change}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{l.notes || '—'}</td>
                    </tr>
                  ))}
                  {logs.length === 0 && <tr><td colSpan="5" className="px-5 py-10 text-center text-gray-400">No stock movements recorded yet.</td></tr>}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Adjust Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h2 className="font-display text-xl font-bold mb-1">Stock Adjustment</h2>
            <p className="text-xs text-gray-500 mb-6">{adjustModal.productName} — {adjustModal.name} (Current: {adjustModal.stock || 0})</p>
            <div className="space-y-4">
              <select value={adjustType} onChange={e => setAdjustType(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                <option value="restock">Restock (+)</option>
                <option value="sale">Sale (−)</option>
                <option value="adjustment">Manual Adjustment</option>
                <option value="return">Customer Return (+)</option>
                <option value="damage">Damage/Loss (−)</option>
              </select>
              <input type="number" placeholder="Quantity (use negative for removal)" value={adjustQty} onChange={e => setAdjustQty(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <input placeholder="Notes (optional)" value={adjustNotes} onChange={e => setAdjustNotes(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={submitAdjustment} className="flex-1 bg-gray-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-black transition">Confirm</button>
              <button onClick={() => setAdjustModal(null)} className="px-6 py-3 text-gray-400 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
