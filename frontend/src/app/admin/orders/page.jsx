'use client';
import { useState } from 'react';

const statusColors = {
  placed: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-amber-100 text-amber-700',
  out_for_delivery: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const sampleOrders = [
  { id: 'OA-1042', customer: 'Priya Sharma', email: 'priya@gmail.com', items: 3, total: 649, status: 'delivered', date: 'Mar 22, 2026', payment: 'paid' },
  { id: 'OA-1041', customer: 'Arun Kumar', email: 'arun@gmail.com', items: 1, total: 349, status: 'out_for_delivery', date: 'Mar 22, 2026', payment: 'paid' },
  { id: 'OA-1040', customer: 'Meena R.', email: 'meena@gmail.com', items: 5, total: 1299, status: 'processing', date: 'Mar 21, 2026', payment: 'paid' },
  { id: 'OA-1039', customer: 'Rajesh V.', email: 'rajesh@gmail.com', items: 2, total: 449, status: 'placed', date: 'Mar 21, 2026', payment: 'paid' },
  { id: 'OA-1038', customer: 'Lakshmi S.', email: 'lakshmi@gmail.com', items: 4, total: 789, status: 'delivered', date: 'Mar 20, 2026', payment: 'paid' },
  { id: 'OA-1037', customer: 'Karthik M.', email: 'karthik@gmail.com', items: 1, total: 199, status: 'cancelled', date: 'Mar 20, 2026', payment: 'refunded' },
];

export default function AdminOrders() {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? sampleOrders : sampleOrders.filter(o => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{sampleOrders.length} total orders</p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'placed', 'processing', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 rounded-xl text-xs font-medium border transition
              ${filter === s ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
            {s === 'all' ? 'All' : s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500 bg-gray-50">
              <th className="px-5 py-3 font-medium">Order ID</th>
              <th className="px-5 py-3 font-medium">Customer</th>
              <th className="px-5 py-3 font-medium">Items</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Payment</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {(filter === 'all' ? sampleOrders : sampleOrders.filter(o => o.status === filter)).map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-semibold text-gray-800">{o.id}</td>
                  <td className="px-5 py-3">
                    <p className="text-gray-800">{o.customer}</p>
                    <p className="text-xs text-gray-400">{o.email}</p>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{o.items}</td>
                  <td className="px-5 py-3 font-semibold">₹{o.total}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[o.status]}`}>
                      {o.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium ${o.payment === 'paid' ? 'text-green-600' : 'text-red-500'}`}>
                      {o.payment === 'paid' ? '✅ Paid' : '🔄 Refunded'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">{o.date}</td>
                  <td className="px-5 py-3">
                    <select className="text-xs px-2 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none">
                      <option>Update Status</option>
                      <option>Confirmed</option>
                      <option>Processing</option>
                      <option>Out for Delivery</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
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
