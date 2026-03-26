'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function UserManagement() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [products, setProducts] = useState([]);
  
  // Local Order State
  const [orderData, setOrderData] = useState({
    productId: '',
    variant: '',
    quantity: 1,
    price: 0,
    paymentStatus: 'paid'
  });

  useEffect(() => {
    fetchUsers();
    fetchProducts();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*');
    if (data) setProfiles(data);
    setLoading(false);
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*, product_variants(*)');
    if (data) setProducts(data);
  }

  async function updateRole(userId, newRole) {
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) alert(error.message);
    else fetchUsers();
  }

  async function deleteUser(id) {
    if (confirm("Are you sure? This will remove the user profile!")) {
      await supabase.from('profiles').delete().eq('id', id);
      fetchUsers();
    }
  }

  async function addLocalOrder() {
    if (!orderData.productId) return alert("Select a product");

    const { data: order, error: oError } = await supabase.from('orders').insert({
      user_id: selectedUser.id,
      status: 'delivered',
      total: orderData.price * orderData.quantity,
      delivery_address: 'Sold Locally',
      payment_status: orderData.paymentStatus,
      notes: 'Local Direct Sale'
    }).select().single();

    if (oError) return alert(oError.message);

    await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: orderData.productId,
      variant_name: orderData.variant,
      quantity: orderData.quantity,
      price: orderData.price
    });

    alert("Order added successfully!");
    setShowOrderModal(false);
    setOrderData({ productId: '', variant: '', quantity: 1, price: 0, paymentStatus: 'paid' });
  }

  const filtered = profiles.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) || 
    u.phone?.includes(search)
  );

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 border-b-4 border-primary-200 pb-1">Master User Management</h1>
          <p className="text-sm text-gray-500 mt-2">Oversee your customer base and administrative permissions</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex gap-4">
           <div className="relative flex-1 max-w-md">
             <input value={search} onChange={e => setSearch(e.target.value)}
               placeholder="Search by name, phone..." className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:border-primary-400 focus:bg-white outline-none transition shadow-inner" />
             <span className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30">🔍</span>
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 bg-gray-50/80">
              <th className="px-6 py-4 font-bold border-b border-gray-100">User Details</th>
              <th className="px-6 py-4 font-bold border-b border-gray-100">Contact / Location</th>
              <th className="px-6 py-4 font-bold border-b border-gray-100">Security Role</th>
              <th className="px-6 py-4 font-bold border-b border-gray-100 text-right">Master Actions</th>
            </tr></thead>
            <tbody>
              {loading ? (
                  <tr><td colSpan="4" className="px-6 py-10 text-center text-gray-400 italic">Reading database...</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-primary-50/30 transition border-b border-gray-50 group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700 shadow-sm overflow-hidden">
                        {u.avatar_url ? <img src={u.avatar_url} className="w-full h-full object-cover" /> : u.full_name?.[0] || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{u.full_name || 'Anonymous User'}</p>
                        <p className="text-[10px] text-gray-400 font-mono tracking-tighter truncate max-w-[100px]">{u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-gray-700 font-medium">{u.phone || 'No Phone'}</p>
                    <p className="text-xs text-gray-400">Chennai, Tamil Nadu</p>
                  </td>
                  <td className="px-6 py-5">
                    <select value={u.role} onChange={e => updateRole(u.id, e.target.value)} 
                      className={`px-3 py-1.5 rounded-xl font-bold text-[11px] uppercase border transition cursor-pointer ${u.role === 'admin' ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-white text-gray-600 border-gray-200'}`}>
                      <option value="customer">CUSTOMER</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => { setSelectedUser(u); setShowOrderModal(true); }} className="bg-emerald-50 text-emerald-600 font-bold px-3 py-1.5 rounded-xl hover:bg-emerald-600 hover:text-white transition">+ Add Local Order</button>
                      <button onClick={() => deleteUser(u.id)} className="p-2 border border-red-100 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD LOCAL ORDER MODAL */}
      {showOrderModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-slide-up">
             <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Record Local Sale</h2>
             <p className="text-xs text-gray-500 mb-6">Recording a direct sale for: <span className="text-primary-600 font-bold">{selectedUser.full_name}</span></p>
             
             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Select Product</label>
                   <select 
                     value={orderData.productId} 
                     onChange={e => {
                        const p = products.find(prod => prod.id == e.target.value);
                        setOrderData({...orderData, productId: e.target.value, price: p?.base_price || 0});
                     }}
                     className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm italic"
                   >
                     <option value="">Select a Product</option>
                     {products.map(p => <option key={p.id} value={p.id}>{p.name} (Base: ₹{p.base_price})</option>)}
                   </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Variant</label>
                      <input value={orderData.variant} onChange={e => setOrderData({...orderData, variant: e.target.value})} placeholder="e.g. 500g" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm" />
                   </div>
                   <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Quantity</label>
                      <input type="number" value={orderData.quantity} onChange={e => setOrderData({...orderData, quantity: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm" />
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Selling Price Per Item</label>
                   <p className="text-[9px] text-gray-400 mb-2">Adjusted for local discount if any</p>
                   <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                      <input type="number" value={orderData.price} onChange={e => setOrderData({...orderData, price: e.target.value})} className="w-full pl-8 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-emerald-700" />
                   </div>
                </div>
             </div>

             <div className="mt-8 flex gap-3">
                <button onClick={addLocalOrder} className="flex-1 bg-gray-900 text-white rounded-2xl py-4 font-bold text-sm shadow-xl shadow-gray-200 hover:bg-black transition">VALIDATE & RECORD</button>
                <button onClick={() => setShowOrderModal(false)} className="px-6 py-4 text-gray-400 font-bold text-sm hover:text-gray-900">CANCEL</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
