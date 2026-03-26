'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function GlobalPricingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bulkPercent, setBulkPercent] = useState('');
  const [bulkType, setBulkType] = useState('increase');

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*, product_variants(*), categories(name)').order('name');
    setProducts(data || []);
    setLoading(false);
  }

  async function updateProductPrice(id, field, value) {
    await supabase.from('products').update({ [field]: parseFloat(value) }).eq('id', id);
    setProducts(products.map(p => p.id === id ? { ...p, [field]: parseFloat(value) } : p));
  }

  async function updateVariantPrice(vid, field, value) {
    await supabase.from('product_variants').update({ [field]: parseFloat(value) }).eq('id', vid);
    setProducts(products.map(p => ({
      ...p,
      product_variants: (p.product_variants || []).map(v => v.id === vid ? { ...v, [field]: parseFloat(value) } : v)
    })));
  }

  async function applyBulkUpdate() {
    if (!bulkPercent || isNaN(bulkPercent)) return alert('Enter a valid percentage');
    const pct = parseFloat(bulkPercent) / 100;
    const multiplier = bulkType === 'increase' ? (1 + pct) : (1 - pct);

    for (const p of products) {
      const newBase = Math.round(p.base_price * multiplier * 100) / 100;
      const newDiscount = p.discount_price ? Math.round(p.discount_price * multiplier * 100) / 100 : null;
      await supabase.from('products').update({ base_price: newBase, discount_price: newDiscount }).eq('id', p.id);

      for (const v of (p.product_variants || [])) {
        const newVPrice = Math.round(v.price * multiplier * 100) / 100;
        const newVMrp = v.mrp_price ? Math.round(v.mrp_price * multiplier * 100) / 100 : newVPrice;
        await supabase.from('product_variants').update({ price: newVPrice, mrp_price: newVMrp }).eq('id', v.id);
      }
    }
    alert(`Bulk ${bulkType} of ${bulkPercent}% applied to all products!`);
    setBulkPercent('');
    fetchProducts();
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pb-10">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Global Pricing Control</h1>
      <p className="text-sm text-gray-500 mb-6">Centralized pricing management across all products and variants.</p>

      {/* Bulk Update Tool */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <p className="text-xs font-bold text-amber-700 mb-2">⚡ Bulk Price Update</p>
          <p className="text-[10px] text-amber-600">Apply a percentage change to ALL products and variants at once.</p>
        </div>
        <select value={bulkType} onChange={e => setBulkType(e.target.value)} className="px-3 py-2 rounded-lg border border-amber-200 text-sm bg-white">
          <option value="increase">Increase ↑</option>
          <option value="decrease">Decrease ↓</option>
        </select>
        <div className="relative">
          <input type="number" placeholder="%" value={bulkPercent} onChange={e => setBulkPercent(e.target.value)} className="w-24 px-3 py-2 rounded-lg border border-amber-200 text-sm bg-white" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-400 text-xs">%</span>
        </div>
        <button onClick={applyBulkUpdate} className="bg-amber-600 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-amber-700 transition shadow-md">Apply to All</button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-primary-400" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Loading pricing data...</div> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
                <th className="px-5 py-3">Product</th><th className="px-5 py-3">MRP (Base)</th><th className="px-5 py-3">Sell Price</th><th className="px-5 py-3">Variants</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition align-top">
                    <td className="px-5 py-4">
                      <p className="font-bold text-gray-800">{p.name}</p>
                      <p className="text-[10px] text-gray-400">{p.categories?.name}</p>
                    </td>
                    <td className="px-5 py-4">
                      <input type="number" value={p.base_price} onBlur={e => updateProductPrice(p.id, 'base_price', e.target.value)} onChange={e => setProducts(products.map(pr => pr.id === p.id ? {...pr, base_price: e.target.value} : pr))} className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-500 line-through" />
                    </td>
                    <td className="px-5 py-4">
                      <input type="number" value={p.discount_price || ''} onBlur={e => updateProductPrice(p.id, 'discount_price', e.target.value)} onChange={e => setProducts(products.map(pr => pr.id === p.id ? {...pr, discount_price: e.target.value} : pr))} className="w-24 px-2 py-1.5 border border-green-200 rounded-lg text-xs font-bold text-green-700" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-1.5">
                        {(p.product_variants || []).map(v => (
                          <div key={v.id} className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg">
                            <span className="text-[10px] text-gray-500 w-12 shrink-0">{v.name}</span>
                            <input type="number" value={v.mrp_price || ''} onBlur={e => updateVariantPrice(v.id, 'mrp_price', e.target.value)} onChange={e => {
                              const updated = products.map(pr => ({...pr, product_variants: (pr.product_variants||[]).map(vr => vr.id === v.id ? {...vr, mrp_price: e.target.value} : vr)}));
                              setProducts(updated);
                            }} className="w-16 px-1.5 py-1 border border-gray-200 rounded text-[10px] text-gray-400 line-through" title="MRP" />
                            <input type="number" value={v.price} onBlur={e => updateVariantPrice(v.id, 'price', e.target.value)} onChange={e => {
                              const updated = products.map(pr => ({...pr, product_variants: (pr.product_variants||[]).map(vr => vr.id === v.id ? {...vr, price: e.target.value} : vr)}));
                              setProducts(updated);
                            }} className="w-16 px-1.5 py-1 border border-green-200 rounded text-[10px] font-bold text-green-700" title="Sell" />
                          </div>
                        ))}
                        {(!p.product_variants || p.product_variants.length === 0) && <span className="text-[10px] text-gray-300">No variants</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
