'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ReportsPage() {
  const [activeReport, setActiveReport] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});

  useEffect(() => { loadReport(activeReport); }, [activeReport]);

  async function loadReport(type) {
    setLoading(true);
    if (type === 'sales') {
      const { data: orders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const totalRevenue = (orders || []).filter(o => o.payment_status === 'paid').reduce((s, o) => s + parseFloat(o.total || 0), 0);
      const totalOrders = (orders || []).length;
      const avgOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      setData({ orders: orders || [], totalRevenue, totalOrders, avgOrder });
    } else if (type === 'customers') {
      const { data: profiles } = await supabase.from('profiles').select('*');
      const admins = (profiles || []).filter(p => p.role === 'admin').length;
      const customers = (profiles || []).filter(p => p.role === 'customer').length;
      setData({ profiles: profiles || [], admins, customers, total: (profiles || []).length });
    } else if (type === 'stock') {
      const { data: variants } = await supabase.from('product_variants').select('*, products(name)');
      const outOfStock = (variants || []).filter(v => (v.stock || 0) <= 0).length;
      const lowStock = (variants || []).filter(v => (v.stock || 0) > 0 && (v.stock || 0) <= 10).length;
      setData({ variants: variants || [], outOfStock, lowStock, total: (variants || []).length });
    } else if (type === 'pnl') {
      const { data: orders } = await supabase.from('orders').select('total, discount_amount, delivery_charge').eq('payment_status', 'paid');
      const revenue = (orders || []).reduce((s, o) => s + parseFloat(o.total || 0), 0);
      const discounts = (orders || []).reduce((s, o) => s + parseFloat(o.discount_amount || 0), 0);
      const delivery = (orders || []).reduce((s, o) => s + parseFloat(o.delivery_charge || 0), 0);
      setData({ revenue, discounts, delivery, netProfit: revenue - discounts });
    }
    setLoading(false);
  }

  const reports = [
    { key: 'sales', label: '💰 Sales Reports', icon: '💰' },
    { key: 'customers', label: '👥 Customer Insights', icon: '👥' },
    { key: 'stock', label: '📦 Stock Reports', icon: '📦' },
    { key: 'pnl', label: '📊 Profit & Loss', icon: '📊' },
  ];

  return (
    <div className="pb-10">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Reports Engine</h1>
      <p className="text-sm text-gray-500 mb-6">Business intelligence and analytics from your live data.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {reports.map(r => (
          <button key={r.key} onClick={() => setActiveReport(r.key)} className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${activeReport === r.key ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}>{r.label}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Generating report...</div> : (
          <>
            {activeReport === 'sales' && (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-emerald-50 rounded-xl p-4 text-center"><p className="text-xs text-emerald-600">Total Revenue</p><p className="text-2xl font-bold text-emerald-700">₹{(data.totalRevenue || 0).toLocaleString()}</p></div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-xs text-blue-600">Total Orders</p><p className="text-2xl font-bold text-blue-700">{data.totalOrders || 0}</p></div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center"><p className="text-xs text-purple-600">Avg Order Value</p><p className="text-2xl font-bold text-purple-700">₹{(data.avgOrder || 0).toFixed(0)}</p></div>
                </div>
                <p className="text-xs text-gray-400">Showing data from {data.totalOrders || 0} orders.</p>
              </div>
            )}
            {activeReport === 'customers' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-xs text-blue-600">Total Users</p><p className="text-2xl font-bold text-blue-700">{data.total || 0}</p></div>
                <div className="bg-emerald-50 rounded-xl p-4 text-center"><p className="text-xs text-emerald-600">Customers</p><p className="text-2xl font-bold text-emerald-700">{data.customers || 0}</p></div>
                <div className="bg-purple-50 rounded-xl p-4 text-center"><p className="text-xs text-purple-600">Admins</p><p className="text-2xl font-bold text-purple-700">{data.admins || 0}</p></div>
              </div>
            )}
            {activeReport === 'stock' && (
              <div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-4 text-center"><p className="text-xs text-blue-600">Total SKUs</p><p className="text-2xl font-bold text-blue-700">{data.total || 0}</p></div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center"><p className="text-xs text-amber-600">Low Stock</p><p className="text-2xl font-bold text-amber-700">{data.lowStock || 0}</p></div>
                  <div className="bg-red-50 rounded-xl p-4 text-center"><p className="text-xs text-red-600">Out of Stock</p><p className="text-2xl font-bold text-red-700">{data.outOfStock || 0}</p></div>
                </div>
              </div>
            )}
            {activeReport === 'pnl' && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4 text-center"><p className="text-xs text-emerald-600">Gross Revenue</p><p className="text-2xl font-bold text-emerald-700">₹{(data.revenue || 0).toLocaleString()}</p></div>
                <div className="bg-red-50 rounded-xl p-4 text-center"><p className="text-xs text-red-600">Discounts Given</p><p className="text-2xl font-bold text-red-700">-₹{(data.discounts || 0).toLocaleString()}</p></div>
                <div className="bg-amber-50 rounded-xl p-4 text-center"><p className="text-xs text-amber-600">Delivery Charges</p><p className="text-2xl font-bold text-amber-700">₹{(data.delivery || 0).toLocaleString()}</p></div>
                <div className="bg-blue-50 rounded-xl p-4 text-center border-2 border-blue-200"><p className="text-xs text-blue-600">Net Profit</p><p className="text-2xl font-bold text-blue-700">₹{(data.netProfit || 0).toLocaleString()}</p></div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
