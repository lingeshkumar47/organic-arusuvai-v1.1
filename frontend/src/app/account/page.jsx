'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import Link from 'next/link';
import Loading from '../../components/Loading';
import { getCart, getCartTotal, getCartCount, removeFromCart, updateQty } from '../../lib/cart';

export default function AccountPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Secure Admin Key Logic
  const [secureKey, setSecureKey] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [keyError, setKeyError] = useState(false);
  const [isAttemptingAdmin, setIsAttemptingAdmin] = useState(false);
  const [isAdminStepTwo, setIsAdminStepTwo] = useState(false);
  
  // Phase 10: Multi-tab Account Logic
  const [activeTab, setActiveTab] = useState('orders');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [firstTimeForm, setFirstTimeForm] = useState({ phone: '', address: '', city: '', pin: '', whatsapp: true });

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Profile Picture State
  const [customAvatar, setCustomAvatar] = useState(null);
  const fileInputRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [cartStats, setCartStats] = useState({ total: 0, totalMrp: 0, discount: 0, count: 0 });

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        if (!window.localStorage.getItem('oa_address_prompt_shown')) {
           setShowAddressModal(true);
        }
        fetchMyOrders(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
      if (session?.user) fetchMyOrders(session.user.id);
      setLoading(false);
    });

    const addresses = JSON.parse(window.localStorage.getItem('oa_saved_addresses') || '[]');
    setSavedAddresses(addresses);
    const avatar = window.localStorage.getItem('oa_profile_avatar');
    if (avatar) setCustomAvatar(avatar);
    const updateStats = () => {
      setCartItems(getCart());
      const stats = getCartTotal();
      setCartStats(stats);
      setCartTotal(stats.total);
      setCartCount(stats.count);
    };
    updateStats();
    window.addEventListener('cart-updated', updateStats);
    window.addEventListener('storage', updateStats); // Cross-tab sync

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('cart-updated', updateStats);
      window.removeEventListener('storage', updateStats);
    };
  }, []);

  async function fetchMyOrders(uid) {
    setLoadingOrders(true);
    const { data } = await supabase.from('orders').select('*').eq('user_id', uid).order('created_at', { ascending: false });
    if (data) setMyOrders(data);
    setLoadingOrders(false);
  }

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/account` } });
  };
  const handleLogout = async () => { await supabase.auth.signOut(); };

  const handleSecureAccessPart1 = async (e) => {
    e.preventDefault();
    setKeyError(false);

    // 1. Silent Master Admin Check
    if (adminUsername === 'masteradn' && adminPassword === 'masteradmin123') {
      setIsAdminStepTwo(true);
      return;
    }

    // 2. Standard User / Admin Login via Supabase
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: adminUsername,
      password: adminPassword,
    });

    if (error) {
      setKeyError(true);
      setTimeout(() => setKeyError(false), 2000);
      setAdminPassword('');
      setLoading(false);
    } else {
      // If user has admin flags, silently transition to PIN step if desired,
      // but usually standard users just go to their dashboard.
      // For now, let's just let them log in normally as users.
      setUser(data.user);
      setLoading(false);
    }
  };

  const handleSecureAccessPart2 = (e) => {
    e.preventDefault();
    const d = String(new Date().getDate()).padStart(2, '0');
    const m = String(new Date().getMonth() + 1).padStart(2, '0');
    
    if (secureKey === `${d}${m}`) {
      window.sessionStorage.setItem('masterAdminBypass', 'true');
      window.location.href = '/secureadmin';
    } else {
      setKeyError(true);
      setTimeout(() => setKeyError(false), 2000);
      setSecureKey('');
    }
  };

  // === Address Management ===
  const persistAddresses = (list) => {
    setSavedAddresses(list);
    window.localStorage.setItem('oa_saved_addresses', JSON.stringify(list));
  };

  const addAddress = () => {
    const trimmed = newAddress.trim();
    if (!trimmed) return;
    const updated = [...savedAddresses, {
      id: Date.now().toString(),
      address: trimmed,
      isDefault: savedAddresses.length === 0,
    }];
    persistAddresses(updated);
    setNewAddress('');
    setShowAddForm(false);
  };

  const deleteAddress = (id) => {
    const filtered = savedAddresses.filter(a => a.id !== id);
    // If we deleted the default, make the first one default
    if (filtered.length > 0 && !filtered.some(a => a.isDefault)) {
      filtered[0].isDefault = true;
    }
    persistAddresses(filtered);
  };

  const setDefault = (id) => {
    const updated = savedAddresses.map(a => ({ ...a, isDefault: a.id === id }));
    persistAddresses(updated);
    // Also update the header delivery address
    const addr = updated.find(a => a.id === id);
    if (addr) {
      window.localStorage.setItem('oa_delivery_address', addr.address);
    }
  };

  const startEdit = (addr) => {
    setEditingId(addr.id);
    setEditValue(addr.address);
  };

  const saveEdit = (id) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    const updated = savedAddresses.map(a => a.id === id ? { ...a, address: trimmed } : a);
    persistAddresses(updated);
    // If this was the default, update header too
    const addr = updated.find(a => a.id === id);
    if (addr?.isDefault) {
      window.localStorage.setItem('oa_delivery_address', trimmed);
    }
    setEditingId(null);
  };

  // === Profile Picture ===
  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Please choose an image under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target.result;
      setCustomAvatar(dataUrl);
      window.localStorage.setItem('oa_profile_avatar', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const removeCustomAvatar = () => {
    setCustomAvatar(null);
    window.localStorage.removeItem('oa_profile_avatar');
  };

  // === First-Time Address Modal ===
  const handleFirstTimeSubmit = () => {
    if (!firstTimeForm.phone || !firstTimeForm.address || !firstTimeForm.city || !firstTimeForm.pin) {
       return alert("Please fill all required fields to secure your profile.");
    }
    const addrStr = `${firstTimeForm.address}, ${firstTimeForm.city} - ${firstTimeForm.pin}`;
    window.localStorage.setItem('oa_address_prompt_shown', 'true');
    window.localStorage.setItem('oa_delivery_address', addrStr);
    
    const existing = JSON.parse(window.localStorage.getItem('oa_saved_addresses') || '[]');
    existing.forEach(e => e.isDefault = false);
    existing.push({
       id: Date.now().toString(),
       name: user?.user_metadata?.full_name || 'Member',
       phone: firstTimeForm.phone,
       address: firstTimeForm.address,
       city: firstTimeForm.city,
       pin: firstTimeForm.pin,
       whatsappMode: firstTimeForm.whatsapp,
       isDefault: true
    });
    persistAddresses(existing);
    setShowAddressModal(false);
  };

  // Determine which avatar to display
  const avatarUrl = customAvatar || user?.user_metadata?.avatar_url;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white pt-24 pb-32 relative overflow-hidden flex items-center justify-center">
      {/* Cinematic Blur BG */}
      <div className="absolute inset-0 bg-primary-950/5 pointer-events-none" />
      <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-cta-500/10 rounded-full blur-[100px] pointer-events-none animate-float" />
      <div className="absolute bottom-[20%] left-[10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none animate-float" style={{ animationDelay: '2s' }} />

      {!user ? (
        // Login State
        <div className="relative z-10 w-full max-w-md px-4 animate-scale-in">
          <div className="glass-panel-heavy p-10 sm:p-12 rounded-[3.5rem] shadow-float border-2 border-white text-center">
            
            <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-soft flex items-center justify-center mx-auto mb-8 relative border border-gray-100 p-2">
               <img src="/logos/SpecialLogo.png" alt="Organic Arusuvai" className="w-full h-full object-contain" />
            </div>

            <h1 className="font-display font-black text-3xl text-primary-900 tracking-tight mb-2">Welcome Back</h1>
            <p className="text-gray-500 font-medium mb-10 text-sm">Sign in to track orders or access your staff portal.</p>
            
            <div className="space-y-6">
               {/* Unified Login Engine */}
               {!isAdminStepTwo ? (
                  <form onSubmit={handleSecureAccessPart1} className="space-y-4 text-left">
                    <div className="space-y-1">
                       <p className="text-[10px] font-black tracking-widest text-primary-400 uppercase ml-4">Access Credentials</p>
                       <input 
                         type="text" 
                         placeholder="Username or Email" 
                         value={adminUsername}
                         onChange={(e) => setAdminUsername(e.target.value)}
                         className="w-full input-premium text-sm !rounded-2xl !bg-white/50 focus:!bg-white"
                         autoFocus
                       />
                    </div>
                    <div className="space-y-1">
                       <input 
                         type="password" 
                         placeholder="Password"
                         value={adminPassword}
                         onChange={(e) => setAdminPassword(e.target.value)}
                         className="w-full input-premium text-sm !rounded-2xl !bg-white/50 focus:!bg-white"
                       />
                    </div>
                    <button type="submit" className="w-full btn-premium !py-4 shadow-cta">Access Secure Portal</button>
                    
                    {keyError && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-500 text-[10px] uppercase font-black tracking-widest animate-shake">
                         Invalid Credentials. Please Verify.
                      </div>
                    )}
                  </form>
               ) : (
                  <form onSubmit={handleSecureAccessPart2} className="space-y-5 animate-scale-in">
                    <div className="w-16 h-16 rounded-[1.2rem] bg-cta-500/10 text-cta-600 flex items-center justify-center text-3xl mx-auto mb-4 border border-cta-100 shadow-sm">🔒</div>
                    <p className="text-sm font-bold text-primary-950 mb-2">Authenticated: Master Admin</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6 leading-relaxed">Please enter your secondary security pin to proceed to the secureadmin zone.</p>
                    <input 
                      type="password" 
                      placeholder="••••"
                      maxLength={4}
                      value={secureKey}
                      onChange={(e) => setSecureKey(e.target.value)}
                      className="w-full input-premium text-center text-2xl !rounded-2xl !tracking-[10px] !py-4 shadow-soft"
                      autoFocus
                    />
                    <button type="submit" className="w-full btn-cta !py-4 shadow-float">Unlock Dashboard</button>
                    {keyError && <p className="text-red-500 text-[11px] font-black uppercase tracking-widest animate-shake mt-2">Invalid PIN Access</p>}
                  </form>
               )}

               <div className="relative flex items-center gap-4 py-2">
                 <div className="flex-1 h-px bg-gray-100"></div>
                 <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">OR</span>
                 <div className="flex-1 h-px bg-gray-100"></div>
               </div>

               <button 
                  onClick={handleGoogleLogin} 
                  className="w-full btn-glass !bg-white !shadow-sm !border-gray-100 hover:!border-primary-200 !text-gray-900 flex items-center justify-center gap-3 relative overflow-hidden group !py-4"
               >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Continue with Google
               </button>
            </div>
            
          </div>
        </div>
      ) : (
        // Logged In User Dashboard
        <div className="relative z-10 w-full max-w-5xl px-4 animate-scale-in">
          <div className="bg-primary-950 rounded-[3.5rem] shadow-float overflow-hidden flex flex-col md:flex-row border border-primary-900">
            {/* Sidebar Stats */}
            <div className="w-full md:w-1/3 bg-primary-900 p-10 flex flex-col justify-between">
               <div>
                  {/* Sidebar Avatar */}
                  <div className="w-16 h-16 rounded-[1.2rem] overflow-hidden shadow-glow-cta mb-6 shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-cta-400 to-cta-500 flex items-center justify-center text-primary-950 font-black text-3xl">
                        {user.email[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <h2 className="font-display font-black text-2xl text-white tracking-tight mb-2 truncate" title={user.email}>{user.user_metadata?.full_name || user.email}</h2>
                  <p className="text-primary-300 font-bold text-sm uppercase tracking-widest">Organic Member</p>
               </div>
               
               <div className="mt-12 space-y-4">
                 <button onClick={handleLogout} className="btn-glass !w-full !justify-start !bg-white/5 hover:!bg-red-500/20 hover:!text-red-300 !border-white/5">
                   Sign Out
                 </button>
               </div>
            </div>

            {/* Dynamic Content Area */}
            <div className="w-full md:w-2/3 p-10 bg-white">
               
               {/* Nav Tabs */}
               <div className="flex gap-8 border-b border-gray-100 mb-10 overflow-x-auto shrink-0 pb-1">
                 {[
                   { id: 'orders', name: 'Track Orders', icon: '📦' },
                   { id: 'info', name: 'Saved Info', icon: '📍' },
                   { id: 'profile', name: 'Member Details', icon: '👤' },
                 ].map(tab => (
                   <button 
                     key={tab.id}
                     onClick={() => setActiveTab(tab.id)}
                     className={`pb-4 px-2 text-sm font-black uppercase tracking-widest whitespace-nowrap transition-all relative
                       ${activeTab === tab.id ? 'text-primary-950' : 'text-gray-400 hover:text-gray-600'}`}
                   >
                     <span className="mr-2">{tab.icon}</span>
                     {tab.name}
                     {activeTab === tab.id && (
                       <div className="absolute bottom-0 left-0 right-0 h-1 bg-cta-500 rounded-full animate-scale-in" />
                     )}
                   </button>
                 ))}
               </div>

               {/* ===== TRACK ORDERS TAB ===== */}
               {activeTab === 'orders' && (
                 <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="font-display font-black text-3xl text-primary-900 tracking-tight">Recent Orders</h3>
                      <span className={`badge-cta ${myOrders.length === 0 ? 'opacity-50 grayscale' : ''}`}>{myOrders.length} Vaulted Orders</span>
                    </div>
                    
                    {loadingOrders ? (
                      <div className="py-20 text-center text-gray-400 font-bold animate-pulse">Synchronizing History...</div>
                    ) : myOrders.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
                         <span className="text-5xl mb-4 grayscale opacity-50">🛒</span>
                         <p className="text-gray-500 font-bold mb-6">Your order history is a clean slate.</p>
                         <Link href="/category/spice" className="btn-primary !rounded-2xl">Browse Harvests</Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myOrders.map(order => {
                          const statusColor = 
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                            order.status === 'in_transit' ? 'bg-indigo-100 text-indigo-700' :
                            order.status === 'processing' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700';
                            
                          return (
                            <div key={order.id} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 group hover:border-primary-200 transition-all shadow-sm">
                               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                  <div>
                                    <h4 className="font-bold text-gray-900 leading-none">Order ...{order.id.toString().slice(-6).toUpperCase()}</h4>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-2">{new Date(order.created_at).toLocaleDateString()}</p>
                                  </div>
                                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${statusColor}`}>
                                    {order.status.replace(/_/g, ' ')}
                                  </span>
                               </div>
                               
                               <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-gray-200/60">
                                  <p className="text-sm font-bold text-gray-900">Total: <span className="text-cta-500">₹{order.total}</span></p>
                                  <p className="text-xs text-gray-500 font-medium tracking-wide">Via {order.notes?.replace('Payment Method: ', '') || 'Unknown'}</p>
                                  <p className="text-xs text-gray-500 font-medium tracking-wide line-clamp-1 flex-1">Delivering to: {order.delivery_address}</p>
                               </div>
                            </div>
                          )
                        })}
                      </div>
                     )}
                  </div>
                )}

                {/* ===== ACTIVE CART SECTION - ALWAYS VISIBLE BELOW HISTORY ===== */}
                <div className="mt-16 pt-12 border-t-2 border-gray-100 animate-fade-in-up">
                   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                     <div>
                       <h3 className="font-display font-black text-3xl text-primary-900 tracking-tight">Items in your Bucket</h3>
                       <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Ready for checkout</p>
                     </div>
                     {cartItems.length > 0 && (
                        <Link href="/checkout" className="btn-cta !py-3 !px-8 shadow-glow-cta">
                           Checkout Now ₹{cartTotal}
                        </Link>
                     )}
                   </div>

                   {cartItems.length === 0 ? (
                      <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 text-center">
                         <p className="text-gray-400 font-bold">Your bucket is currently empty.</p>
                         <Link href="/category/spice" className="text-primary-600 font-black uppercase text-[10px] tracking-widest mt-2 block hover:underline">Start Shopping →</Link>
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {cartItems.map((item) => (
                            <div key={`${item.id}-${item.variantId}`} className="p-4 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center gap-4 hover:border-primary-200 transition-all">
                               <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden shrink-0 border border-gray-50">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                               </div>
                               <div className="flex-1 min-w-0">
                                  <p className="font-black text-gray-900 text-sm truncate">{item.name}</p>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{item.variant}</p>
                                  <p className="text-cta-600 font-black text-xs mt-1">₹{item.price} × {item.qty}</p>
                               </div>
                               <div className="flex flex-col gap-1">
                                  <button onClick={() => { updateQty(item.id, item.variantId, item.qty + 1); }} className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center font-black hover:bg-primary-50">+</button>
                                  <button onClick={() => { updateQty(item.id, item.variantId, item.qty - 1); }} className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center font-black hover:bg-primary-50">-</button>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>

               {/* ===== SAVED INFO TAB ===== */}
               {activeTab === 'info' && (
                 <div className="animate-fade-in space-y-6">
                    <h3 className="font-display font-black text-3xl text-primary-900 tracking-tight mb-8">Saved Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {/* Existing Saved Addresses */}
                       {savedAddresses.map((addr) => (
                         <div key={addr.id} className="p-6 rounded-[2rem] bg-gray-50 border border-gray-100 group hover:border-primary-200 transition-all relative">
                            <div className="flex justify-between items-start mb-4">
                               <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm">🏠</div>
                               {addr.isDefault && (
                                 <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full">Default</span>
                               )}
                            </div>
                            
                            {editingId === addr.id ? (
                              <div>
                                <input
                                  type="text"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit(addr.id)}
                                  className="input-premium !rounded-xl !py-2.5 text-sm mb-2"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <button onClick={() => saveEdit(addr.id)} className="btn-primary !py-1.5 !px-3 !text-[10px] !rounded-lg">Save</button>
                                  <button onClick={() => setEditingId(null)} className="btn-ghost !py-1.5 !px-3 !text-[10px] !rounded-lg">Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <h4 className="font-bold text-gray-900 mb-1 text-sm leading-relaxed">{addr.address}</h4>
                                <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                                  {!addr.isDefault && (
                                    <button onClick={() => setDefault(addr.id)} className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:underline">Set Default</button>
                                  )}
                                  <button onClick={() => startEdit(addr)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900">Edit</button>
                                  <button onClick={() => deleteAddress(addr.id)} className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-600">Delete</button>
                                </div>
                              </>
                            )}
                         </div>
                       ))}

                       {/* Add New Address Card */}
                       {showAddForm ? (
                         <div className="p-6 rounded-[2rem] border-2 border-primary-200 bg-primary-50/30 transition-all">
                           <h4 className="font-bold text-primary-900 text-sm mb-3">New Address</h4>
                           <textarea
                             value={newAddress}
                             onChange={(e) => setNewAddress(e.target.value)}
                             placeholder="Enter full delivery address..."
                             className="input-premium !rounded-xl text-sm mb-3 min-h-[80px] resize-none"
                             autoFocus
                           />
                           <div className="flex gap-2">
                             <button onClick={addAddress} className="btn-primary !py-2 !text-xs !rounded-xl flex-1">Save Address</button>
                             <button onClick={() => { setShowAddForm(false); setNewAddress(''); }} className="btn-ghost !py-2 !text-xs !rounded-xl">Cancel</button>
                           </div>
                         </div>
                       ) : (
                         <div 
                           onClick={() => setShowAddForm(true)}
                           className="p-6 rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center group hover:bg-primary-50 hover:border-primary-200 transition-all cursor-pointer min-h-[140px]"
                         >
                            <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">➕</span>
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">Add New Address</span>
                         </div>
                       )}
                    </div>

                    <div className="mt-12">
                       <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-6">Payment Methods</h4>
                       <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100 flex items-center gap-4">
                          <span className="text-2xl">💳</span>
                          <p className="text-sm text-amber-900 font-bold">Encrypted via Razorpay. No cards saved yet.</p>
                       </div>
                    </div>
                 </div>
               )}

               {/* ===== MEMBER DETAILS TAB ===== */}
               {activeTab === 'profile' && (
                 <div className="animate-fade-in space-y-8">
                    <h3 className="font-display font-black text-3xl text-primary-900 tracking-tight mb-8">Member Details</h3>
                    
                    <div className="space-y-6">
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                             <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Full Name</label>
                             <div className="p-4 rounded-2xl bg-gray-50 font-bold text-gray-900 border border-gray-100">
                                {user.user_metadata?.full_name || 'Premium Member'}
                             </div>
                          </div>
                          <div>
                             <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Email Address</label>
                             <div className="p-4 rounded-2xl bg-gray-50 font-bold text-gray-900 border border-gray-100 truncate">
                                {user.email}
                             </div>
                          </div>
                       </div>

                       <div>
                          <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Mobile Number</label>
                          <div className="flex gap-2">
                             <input 
                                type="text"
                                placeholder="10-Digit Mobile Number"
                                value={user.user_metadata?.phone || ''}
                                onChange={async (e) => {
                                   const val = e.target.value;
                                   if (val.length <= 10) {
                                      const { data, error } = await supabase.auth.updateUser({
                                         data: { phone: val }
                                      });
                                      if (!error) setUser({...user, user_metadata: {...user.user_metadata, phone: val}});
                                   }
                                }}
                                className="flex-1 p-4 rounded-2xl bg-gray-50 font-bold text-gray-900 border border-gray-100 focus:border-primary-300 outline-none"
                             />
                          </div>
                       </div>
                       
                       {/* Profile Picture Section */}
                       <div className="pt-6 border-t border-gray-100">
                          <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4">Profile Picture</h4>
                          <div className="flex items-start gap-6">
                            <div 
                              className="w-20 h-20 rounded-2xl overflow-hidden shadow-soft border-2 border-white shrink-0 group relative cursor-pointer"
                              onClick={() => fileInputRef.current?.click()}
                            >
                               {avatarUrl ? (
                                 <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                               ) : (
                                 <div className="w-full h-full bg-primary-100 flex items-center justify-center text-primary-600 font-black text-2xl">
                                    {user.email[0].toUpperCase()}
                                 </div>
                               )}
                               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-2xl">
                                 <span className="text-white text-lg">📷</span>
                               </div>
                            </div>
                            <div className="flex-1 pt-1">
                               <p className="text-sm font-bold text-gray-900 mb-1">
                                 {customAvatar ? 'Custom Photo' : (user.user_metadata?.avatar_url ? 'Google Profile Photo' : 'No Photo Set')}
                               </p>
                               <p className="text-xs text-gray-500 font-medium mb-3">Click the avatar to upload a custom photo. Max 2MB. JPG or PNG recommended.</p>
                               <div className="flex gap-2 flex-wrap">
                                 <button 
                                   onClick={() => fileInputRef.current?.click()}
                                   className="btn-primary !py-1.5 !px-4 !text-[10px] !rounded-xl"
                                 >
                                   Upload Photo
                                 </button>
                                 {customAvatar && (
                                   <button 
                                     onClick={removeCustomAvatar}
                                     className="btn-ghost !py-1.5 !px-4 !text-[10px] !rounded-xl text-red-500 hover:!text-red-600 hover:!bg-red-50"
                                   >
                                     Remove Custom Photo
                                   </button>
                                 )}
                               </div>
                            </div>
                          </div>

                          {/* Hidden file input */}
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleAvatarUpload}
                            className="hidden"
                          />
                       </div>
                    </div>
                 </div>
               )}

            </div>
          </div>
        </div>
      )}

      {/* Phase 10: First Time Address Modal */}
      {showAddressModal && (
         <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-primary-950/60 backdrop-blur-md animate-fade-in" onClick={() => { window.localStorage.setItem('oa_address_prompt_shown', 'true'); setShowAddressModal(false); }} />
            <div className="relative z-10 w-full max-w-lg glass-panel-heavy p-8 sm:p-10 rounded-[2.5rem] shadow-2xl animate-scale-in border-2 border-white">
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <h2 className="font-display font-black text-2xl text-primary-900 tracking-tight leading-loose">Secure your Profile</h2>
                   <p className="text-gray-500 text-xs font-medium">To speed up checkout, save your primary details.</p>
                 </div>
                 <div className="w-12 h-12 rounded-xl bg-cta-500/20 text-cta-600 flex items-center justify-center text-xl shrink-0">📍</div>
               </div>
               
               <div className="space-y-4 mb-8">
                 <input 
                   placeholder="10-Digit Mobile Number" 
                   value={firstTimeForm.phone}
                   onChange={(e) => setFirstTimeForm({...firstTimeForm, phone: e.target.value})}
                   className="input-premium text-sm !rounded-xl"
                   autoFocus
                 />
                 <input 
                   placeholder="Primary Delivery Address (Street/Apt)" 
                   value={firstTimeForm.address}
                   onChange={(e) => setFirstTimeForm({...firstTimeForm, address: e.target.value})}
                   className="input-premium text-sm !rounded-xl"
                 />
                 <div className="grid grid-cols-2 gap-4">
                    <input 
                      placeholder="City/Region" 
                      value={firstTimeForm.city}
                      onChange={(e) => setFirstTimeForm({...firstTimeForm, city: e.target.value})}
                      className="input-premium text-sm !rounded-xl"
                    />
                    <input 
                      placeholder="PIN Code" 
                      value={firstTimeForm.pin}
                      onChange={(e) => setFirstTimeForm({...firstTimeForm, pin: e.target.value})}
                      className="input-premium text-sm !rounded-xl"
                    />
                 </div>
                 <label className="flex items-center gap-3 p-3 bg-green-50/50 border border-green-100 rounded-xl cursor-pointer">
                    <input type="checkbox" checked={firstTimeForm.whatsapp} onChange={e => setFirstTimeForm({...firstTimeForm, whatsapp: e.target.checked})} className="w-4 h-4 text-green-600 rounded" />
                    <span className="text-xs font-bold text-green-800">Use this number for WhatsApp delivery updates</span>
                 </label>
               </div>
               
               <div className="flex flex-col gap-3">
                  <button onClick={handleFirstTimeSubmit} className="btn-primary flex-1 !rounded-[1rem] shadow-md">Complete Setup</button>
                  <button onClick={() => { window.localStorage.setItem('oa_address_prompt_shown', 'true'); setShowAddressModal(false); }} className="btn-ghost flex-1 !rounded-[1rem] !text-gray-400 hover:!text-gray-700 !text-xs">I'll do it later</button>
               </div>
            </div>
         </div>
      )}

       {/* Floating Admin Entry Button */}
       {!user && !isAttemptingAdmin && (
          <button 
             onClick={() => setIsAttemptingAdmin(true)}
             className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-gray-900 border-2 border-primary-900 text-white rounded-full flex items-center justify-center text-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all z-[100] group"
             title="Staff Access"
          >
             <span className="group-hover:-rotate-12 transition-transform duration-300">👨‍💼</span>
          </button>
       )}
    </div>
  );
}
