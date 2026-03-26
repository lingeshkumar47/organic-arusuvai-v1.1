'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

const statusColors = {
  placed: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function AdminOrders() {
  const [filter, setFilter] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    // Fetch orders and their associated profile/user details
    const { data: orderData, error } = await supabase
      .from('orders')
      .select('*, profiles(full_name, email)');
      
    if (orderData) {
      // Map to the format needed for the table
      const formatted = orderData.map(o => ({
        id: o.id.toString(),
        customer: o.profiles?.full_name || 'Anonymous User',
        email: o.profiles?.email || 'N/A',
        items: o.total > 0 ? 'Multiple' : '-', // We can refine item counting if order_items are fetched
        total: o.total,
        status: o.status || 'placed',
        payment: o.payment_status || 'unpaid',
        date: new Date(o.created_at).toLocaleDateString()
      }));
      setOrders(formatted);
    }
    setLoading(false);
  }

  const deleteOrder = async (id) => {
    if (confirm("Move this order to trash?")) {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (!error) {
        setOrders(orders.filter(o => o.id !== id));
      } else {
        alert("Failed to delete order: " + error.message);
      }
    }
  };

  const wipeAllOrders = async () => {
    if (confirm("CRITICAL WARNING: This will permanently wipe ALL orders from the database. Are you sure you want to start fresh?")) {
      setLoading(true);
      const { error } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes everything
      if (!error) {
        setOrders([]);
        alert("Database successfully wiped. Starting fresh.");
      } else {
        alert("Failed to wipe orders: " + error.message);
      }
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
           <h1 className="font-display text-2xl font-bold text-gray-900 border-b-4 border-primary-200 pb-1 inline-block">Order Management</h1>
           <p className="text-sm text-gray-500 mt-2">{orders.length} total orders recorded</p>
        </div>
        <button 
           onClick={wipeAllOrders}
           className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-xl text-sm border border-red-100 hover:bg-red-500 hover:text-white transition-all shadow-sm"
        >
           🚨 Wipe Database
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'placed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition
              ${filter === s ? 'border-primary-500 bg-primary-50 text-primary-700 font-bold' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 bg-gray-50/80">
              <th className="px-5 py-4 font-bold border-b border-gray-100">Order Ref</th>
              <th className="px-5 py-4 font-bold border-b border-gray-100">Customer Details</th>
              <th className="px-5 py-4 font-bold border-b border-gray-100">Revenue</th>
              <th className="px-5 py-4 font-bold border-b border-gray-100">Live Status</th>
              <th className="px-5 py-4 font-bold border-b border-gray-100 text-right">Master Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="px-5 py-10 text-center text-gray-400 italic">Synchronizing database...</td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-16 text-center text-gray-500 font-medium bg-gray-50/30">
                     <div className="text-4xl mb-4 grayscale opacity-40">🛒</div>
                     No active orders found. Starting fresh.
                  </td>
                </tr>
              ) : (filter === 'all' ? orders : orders.filter(o => o.status === filter)).map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition">
                  <td className="px-5 py-4 font-mono font-bold text-[10px] text-gray-400">
                    {/* Truncate UUID for display */}
                    ...{o.id.slice(-6).toUpperCase()}
                  </td>
                  <td className="px-5 py-4">
                    <p className="text-gray-900 font-bold">{o.customer}</p>
                    <p className="text-xs text-gray-400 font-medium">{o.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-emerald-700">₹{o.total}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${o.payment === 'paid' ? 'text-green-500' : 'text-amber-500'}`}>
                      {o.payment === 'paid' ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1.5 rounded-xl border ${statusColors[o.status] || 'bg-gray-100 text-gray-700'}`}>
                      {o.status.replace(/_/g, ' ')}
                    </span><br/>
                    <span className="text-[9px] text-gray-400 mt-2 inline-block font-mono">{o.date}</span>
                  </td>
                  <td className="px-5 py-4 flex items-center justify-end gap-3 h-full">
                    <select 
                      value={o.status === "placed" ? "Update Status..." : o.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      onChange={async (e) => {
                         const val = e.target.value;
                         if (val === 'Update Status...') return;
                         const dbVal = val.toLowerCase().replace(/ /g, '_');
                         const { error } = await supabase.from('orders').update({ status: dbVal }).eq('id', o.id);
                         if (!error) {
                           setOrders(orders.map(order => order.id === o.id ? { ...order, status: dbVal } : order));
                         } else {
                           alert("Failed to update status: " + error.message);
                         }
                      }}
                      className="text-xs font-bold uppercase text-primary-600 tracking-widest px-3 py-2 rounded-xl border border-primary-100 bg-primary-50 hover:bg-primary-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-200 transition shadow-sm"
                    >
                      <option>Update Status...</option>
                      <option>Confirmed</option>
                      <option>Processing</option>
                      <option>Packed And Scheduled</option>
                      <option>In Transit</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                    <button onClick={() => deleteOrder(o.id)} className="w-8 h-8 flex items-center justify-center text-red-400 hover:text-white hover:bg-red-500 bg-red-50 rounded-xl transition-colors shadow-sm" title="Trash Order">
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
