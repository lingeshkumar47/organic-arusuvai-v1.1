'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBuilder, setShowBuilder] = useState(false);
  const [customInvoice, setCustomInvoice] = useState({ customer_name: '', customer_email: '', billing_address: '', items: [{ desc: '', qty: 1, rate: 0 }], tax: 0, notes: '' });

  useEffect(() => { fetchInvoices(); }, []);

  async function fetchInvoices() {
    setLoading(true);
    const { data } = await supabase.from('invoices').select('*').order('created_at', { ascending: false });
    setInvoices(data || []);
    setLoading(false);
  }

  async function autoGenerateFromOrders() {
    const { data: orders } = await supabase.from('orders').select('*, order_items(*)').eq('payment_status', 'paid').order('created_at', { ascending: false }).limit(20);
    if (!orders || orders.length === 0) return alert('No paid orders found.');

    let generated = 0;
    for (const o of orders) {
      const existing = invoices.find(i => i.order_id === o.id);
      if (existing) continue;

      const invNum = `OA-INV-${Date.now()}-${o.id}`;
      await supabase.from('invoices').insert({
        order_id: o.id,
        invoice_number: invNum,
        customer_name: o.delivery_address?.split(',')[0] || 'Customer',
        items: JSON.stringify(o.order_items || []),
        subtotal: o.total - (o.delivery_charge || 0),
        tax: 0,
        total: o.total,
        notes: `Auto-generated from Order #${o.id}`
      });
      generated++;
    }
    alert(`${generated} invoices auto-generated!`);
    fetchInvoices();
  }

  async function saveCustomInvoice() {
    const subtotal = customInvoice.items.reduce((s, i) => s + (i.qty * i.rate), 0);
    const total = subtotal + parseFloat(customInvoice.tax || 0);
    const invNum = `OA-CINV-${Date.now()}`;

    await supabase.from('invoices').insert({
      invoice_number: invNum,
      customer_name: customInvoice.customer_name,
      customer_email: customInvoice.customer_email,
      billing_address: customInvoice.billing_address,
      items: JSON.stringify(customInvoice.items),
      subtotal, tax: parseFloat(customInvoice.tax || 0), total,
      notes: customInvoice.notes,
      is_custom: true
    });
    alert('Custom invoice created!');
    setShowBuilder(false);
    setCustomInvoice({ customer_name: '', customer_email: '', billing_address: '', items: [{ desc: '', qty: 1, rate: 0 }], tax: 0, notes: '' });
    fetchInvoices();
  }

  function printInvoice(inv) {
    const items = typeof inv.items === 'string' ? JSON.parse(inv.items) : (inv.items || []);
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Invoice ${inv.invoice_number}</title><style>body{font-family:sans-serif;padding:40px;max-width:800px;margin:auto}table{width:100%;border-collapse:collapse;margin:20px 0}th,td{border:1px solid #ddd;padding:8px;text-align:left}th{background:#f5f5f5}.header{display:flex;justify-content:space-between;align-items:start;margin-bottom:30px}.total{font-size:24px;font-weight:bold;text-align:right}</style></head><body>
      <div class="header"><div><h1 style="color:#16a34a">🌿 Organic Arusuvai</h1><p>Premium Organic Products</p></div><div style="text-align:right"><h2>INVOICE</h2><p>${inv.invoice_number}</p><p>${new Date(inv.created_at).toLocaleDateString()}</p></div></div>
      <p><strong>Bill To:</strong> ${inv.customer_name || 'Customer'}</p><p>${inv.billing_address || ''}</p>
      <table><thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${items.map((it, i) => `<tr><td>${i+1}</td><td>${it.desc || it.variant_name || 'Item'}</td><td>${it.qty || it.quantity || 1}</td><td>₹${it.rate || it.price || 0}</td><td>₹${(it.qty || it.quantity || 1) * (it.rate || it.price || 0)}</td></tr>`).join('')}</tbody></table>
      <p style="text-align:right">Subtotal: ₹${inv.subtotal || 0}</p><p style="text-align:right">Tax: ₹${inv.tax || 0}</p><p class="total">Total: ₹${inv.total || 0}</p>
      ${inv.notes ? `<p style="margin-top:20px;color:#888">${inv.notes}</p>` : ''}
      <script>window.print()</script></body></html>`);
  }

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Invoice Generation</h1>
          <p className="text-sm text-gray-500">Auto-generate from orders or create custom invoices.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={autoGenerateFromOrders} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition shadow-md">⚡ Auto-Generate</button>
          <button onClick={() => setShowBuilder(true)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition shadow-md">+ Custom Invoice</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Loading invoices...</div> : invoices.length === 0 ? (
          <div className="p-10 text-center text-gray-400">No invoices yet. Click Auto-Generate to create from paid orders.</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
              <th className="px-5 py-3">Invoice #</th><th className="px-5 py-3">Customer</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-5 py-3 font-mono text-xs font-bold text-gray-800">{inv.invoice_number}</td>
                  <td className="px-5 py-3">{inv.customer_name || '—'}</td>
                  <td className="px-5 py-3 font-bold text-green-700">₹{inv.total}</td>
                  <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${inv.is_custom ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{inv.is_custom ? 'Custom' : 'Auto'}</span></td>
                  <td className="px-5 py-3 text-xs text-gray-400">{new Date(inv.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => printInvoice(inv)} className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200 font-bold transition">🖨️ Print/PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Custom Invoice Builder Modal */}
      {showBuilder && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 my-8">
            <h2 className="font-display text-xl font-bold mb-6">Custom Invoice Builder</h2>
            <div className="space-y-4">
              <input placeholder="Customer Name" value={customInvoice.customer_name} onChange={e => setCustomInvoice({...customInvoice, customer_name: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <input placeholder="Customer Email" value={customInvoice.customer_email} onChange={e => setCustomInvoice({...customInvoice, customer_email: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <textarea placeholder="Billing Address" value={customInvoice.billing_address} onChange={e => setCustomInvoice({...customInvoice, billing_address: e.target.value})} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />

              <p className="text-xs font-bold text-gray-500 mt-4">Line Items</p>
              {customInvoice.items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input placeholder="Description" value={item.desc} onChange={e => { const c = [...customInvoice.items]; c[i].desc = e.target.value; setCustomInvoice({...customInvoice, items: c}); }} className="flex-1 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" />
                  <input type="number" placeholder="Qty" value={item.qty} onChange={e => { const c = [...customInvoice.items]; c[i].qty = e.target.value; setCustomInvoice({...customInvoice, items: c}); }} className="w-16 px-2 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" />
                  <input type="number" placeholder="Rate" value={item.rate} onChange={e => { const c = [...customInvoice.items]; c[i].rate = e.target.value; setCustomInvoice({...customInvoice, items: c}); }} className="w-20 px-2 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm" />
                </div>
              ))}
              <button onClick={() => setCustomInvoice({...customInvoice, items: [...customInvoice.items, { desc: '', qty: 1, rate: 0 }]})} className="text-xs text-primary-600 font-bold">+ Add Line Item</button>

              <input type="number" placeholder="Tax Amount (₹)" value={customInvoice.tax} onChange={e => setCustomInvoice({...customInvoice, tax: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <textarea placeholder="Notes" value={customInvoice.notes} onChange={e => setCustomInvoice({...customInvoice, notes: e.target.value})} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={saveCustomInvoice} className="flex-1 bg-gray-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-black transition">Create Invoice</button>
              <button onClick={() => setShowBuilder(false)} className="px-6 py-3 text-gray-400 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
