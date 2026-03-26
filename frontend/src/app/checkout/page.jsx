'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCartTotal, clearCart } from '../../lib/cart';
import { supabase } from '../../lib/supabase';

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cartStats, setCartStats] = useState({ total: 0, totalMrp: 0, count: 0 });
  const [cartItems, setCartItems] = useState([]);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [adminUpi, setAdminUpi] = useState('8056106136@pz');
  const [user, setUser] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // New Address State Flow
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({ name: '', phone: '', address: '', city: '', pin: '' });
  const [saveNewAddress, setSaveNewAddress] = useState(true);

  useEffect(() => {
    setCartStats(getCartTotal());
    
    // Load cart items for DB insertion
    try {
      setCartItems(JSON.parse(localStorage.getItem('oa_cart') || '[]'));
    } catch(e) {}

    // Check auth
    supabase.auth.getSession().then(({ data: { session } }) => {
       if (session?.user) setUser(session.user);
    });

    // Load saved addresses
    try {
      const addresses = JSON.parse(localStorage.getItem('oa_saved_addresses') || '[]');
      setSavedAddresses(addresses);
    } catch(e) {}

    // Load admin UPI if set
    const upi = localStorage.getItem('oa_admin_upi_id');
    if (upi) setAdminUpi(upi);

    // Load Razorpay Script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
     if (savedAddresses.length === 0) setShowNewAddress(true);
  }, [savedAddresses]);

  const activeAddress = showNewAddress ? newAddressForm : (savedAddresses[selectedAddressIndex] || null);

  const handleRazorpayPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: cartStats.total, 
          currency: 'INR',
          receipt: `rcpt_${Date.now()}`
        })
      });
      const data = await res.json();
      
      if (data.error) throw new Error(data.error);

      // Use the Key ID from LocalStorage (Admin Config) or Fallback to Env
      const activeKeyId = localStorage.getItem('oa_razorpay_key') || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      const options = {
        key: activeKeyId,
        amount: data.amount,
        currency: data.currency,
        name: 'Organic Arusuvai',
        description: 'Premium Grocery Harvest',
        order_id: data.id,
        handler: async function (response) {
          await createOrder({ 
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature 
          });
        },
        prefill: {
          name: activeAddress?.name || '',
          contact: activeAddress?.phone || '',
          email: user?.email || ''
        },
        theme: { color: '#880000' } // Arusuvai Red
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
       console.error(error);
       alert("Payment initialization failed. Please try again or use UPI.");
    } finally {
       setIsProcessing(false);
    }
  };

  const createOrder = async (payData = null) => {
    if (!activeAddress) return alert("Select an address");
    if (!user) {
        alert("Please log into your account to place a database tracked order.");
        router.push('/account');
        return;
    }
    setIsProcessing(true);
    
    const addressStr = `${activeAddress.name}, ${activeAddress.address}, ${activeAddress.city} - ${activeAddress.pin}. Ph: ${activeAddress.phone}`;

    const { data: order, error: orderError } = await supabase.from('orders').insert({
        user_id: user.id,
        status: 'placed',
        total: cartStats.total,
        delivery_address: addressStr,
        payment_status: (paymentMethod === 'cod' || paymentMethod === 'upi') ? 'unpaid' : 'paid',
        notes: `Payment Method: ${paymentMethod} ${payData ? `(Razorpay ID: ${payData.paymentId})` : ''}`
    }).select().single();

    if (orderError) {
        alert("Checkout failed: " + orderError.message);
        setIsProcessing(false);
        return;
    }

    // Insert order items
    const itemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        product_id: item.id,
        variant_name: item.variant,
        quantity: item.quantity,
        price: item.price
    }));

    if (itemsToInsert.length > 0) {
        await supabase.from('order_items').insert(itemsToInsert);
    }

    clearCart();
    router.push('/order-success');
    setIsProcessing(false);
  };

  const handleProceedAddress = () => {
    if (showNewAddress) {
       if (!newAddressForm.name || !newAddressForm.phone || !newAddressForm.address || !newAddressForm.city || !newAddressForm.pin) {
          return alert("Please fill out all address fields completely.");
       }
       const addrObj = {
          id: Date.now().toString(),
          ...newAddressForm,
          isDefault: savedAddresses.length === 0
       };
       const updatedList = [...savedAddresses, addrObj];
       setSavedAddresses(updatedList);
       setSelectedAddressIndex(updatedList.length - 1);
       if (saveNewAddress) {
          localStorage.setItem('oa_saved_addresses', JSON.stringify(updatedList));
       }
       setShowNewAddress(false);
    }
    setStep(2);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-24 pb-32">
      {/* Secure Header */}
      <header className="bg-white border-b border-gray-100 py-6 mb-12 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between">
           <Link href="/cart" className="flex items-center gap-2 text-primary-900 font-black hover:text-primary-600 transition-colors">
              <span className="text-xl leading-none -mt-1">←</span>
              <h2 className="text-lg tracking-tight uppercase">Checkout</h2>
           </Link>
           <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Secure SSL
           </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 w-full">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
           
           <div className="flex-1 space-y-8">
              {/* Step 1: Delivery Address */}
              <div className={`glass-panel p-8 rounded-[2rem] transition-all duration-500 ${step === 1 ? 'ring-2 ring-primary-500 shadow-float' : 'opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="font-display font-black text-2xl text-primary-900">1. Delivery Address</h3>
                    {step > 1 && <button onClick={() => setStep(1)} className="text-xs font-bold text-primary-600 hover:underline uppercase tracking-widest">Edit</button>}
                 </div>
                 
                 {step === 1 ? (
                     <div className="space-y-6">
                      {savedAddresses.length > 0 && !showNewAddress && (
                        <div className="mb-6 space-y-3">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Select Saved Address</label>
                          {savedAddresses.map((addr, i) => (
                            <label key={i} className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${selectedAddressIndex === i ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:border-primary-200'}`}>
                              <input type="radio" name="address" checked={selectedAddressIndex === i} onChange={() => setSelectedAddressIndex(i)} className="mt-1" />
                              <div>
                                <p className="font-bold text-gray-900 leading-none mb-1">{addr.name} {addr.isDefault && <span className="ml-2 text-[10px] bg-primary-900 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Default</span>}</p>
                                <p className="text-sm text-gray-500 mt-1">{addr.address}, {addr.city} {addr.pin}</p>
                                <p className="text-xs text-gray-400 font-medium mt-1">Phone: {addr.phone}</p>
                              </div>
                            </label>
                          ))}
                          <button onClick={() => setShowNewAddress(true)} className="text-[10px] font-black uppercase tracking-widest text-primary-600 hover:text-primary-800 transition py-2 px-1">+ Add New Address</button>
                        </div>
                      )}

                      {showNewAddress && (
                         <div className="bg-primary-50/50 p-6 rounded-[1.5rem] border border-primary-100 space-y-4">
                            <div className="flex justify-between items-center mb-2">
                               <h4 className="font-bold text-primary-900">New Delivery Location</h4>
                               {savedAddresses.length > 0 && (
                                 <button onClick={() => setShowNewAddress(false)} className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 transition">Cancel</button>
                               )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               <input placeholder="Full Name" value={newAddressForm.name} onChange={e => setNewAddressForm({...newAddressForm, name: e.target.value})} className="input-premium !rounded-xl text-sm" />
                               <input placeholder="Mobile Phone" value={newAddressForm.phone} onChange={e => setNewAddressForm({...newAddressForm, phone: e.target.value})} className="input-premium !rounded-xl text-sm" />
                            </div>
                            <input placeholder="Street Address / Building" value={newAddressForm.address} onChange={e => setNewAddressForm({...newAddressForm, address: e.target.value})} className="input-premium !rounded-xl text-sm w-full" />
                            <div className="grid grid-cols-2 gap-4">
                               <input placeholder="City" value={newAddressForm.city} onChange={e => setNewAddressForm({...newAddressForm, city: e.target.value})} className="input-premium !rounded-xl text-sm" />
                               <input placeholder="PIN Code" value={newAddressForm.pin} onChange={e => setNewAddressForm({...newAddressForm, pin: e.target.value})} className="input-premium !rounded-xl text-sm" />
                            </div>
                            
                            <label className="flex items-center gap-3 pt-2 cursor-pointer">
                               <input type="checkbox" checked={saveNewAddress} onChange={e => setSaveNewAddress(e.target.checked)} className="w-4 h-4 text-primary-600 rounded" />
                               <span className="text-xs font-bold text-gray-600">Securely vault this address for future harvests</span>
                            </label>
                         </div>
                      )}

                      <button onClick={handleProceedAddress} className="btn-primary w-full sm:w-auto !px-10 !py-4 mt-4 relative z-10">
                        Continue to Payment
                      </button>
                   </div>
                 ) : (
                   <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      {activeAddress ? (
                        <>
                          <p className="font-bold text-gray-900">{activeAddress.name} <span className="text-gray-400 font-medium ml-2">{activeAddress.phone}</span></p>
                          <p className="text-gray-500 text-sm mt-1">{activeAddress.address}, {activeAddress.city} - {activeAddress.pin}</p>
                        </>
                      ) : (
                        <p className="text-gray-500 text-sm">No address selected.</p>
                      )}
                   </div>
                 )}
              </div>

              {/* Step 2: Payment */}
              <div className={`glass-panel p-8 rounded-[2rem] transition-all duration-500 ${step === 2 ? 'ring-2 ring-primary-500 shadow-float' : 'opacity-40 pointer-events-none'}`}>
                 <h3 className="font-display font-black text-2xl text-primary-900 mb-8">2. Secure Payment</h3>
                 
                 <div className="space-y-4">
                    {/* Razorpay Option */}
                    <label className={`flex flex-col p-6 bg-white border-2 rounded-2xl cursor-pointer shadow-soft transition-all ${paymentMethod === 'razorpay' ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-100 hover:border-primary-200'}`}>
                       <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-4 h-4 text-primary-600" />
                            <div>
                               <span className="font-bold text-gray-900 block">Razorpay Secure</span>
                               <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Cards, Netbanking, Walllets</span>
                            </div>
                         </div>
                         <div className="flex gap-2">
                             <img src="https://razorpay.com/favicon.png" className="w-5 h-5 opacity-80" alt="RZP" />
                         </div>
                       </div>
                    </label>

                    {/* UPI Option */}
                    <label className={`flex flex-col p-6 bg-white border-2 rounded-2xl cursor-pointer shadow-soft transition-all ${paymentMethod === 'upi' ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-100 hover:border-primary-200'}`}>
                       <div className="flex items-center gap-4">
                          <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="w-4 h-4 text-primary-600" />
                          <span className="font-bold text-gray-900">Direct UPI Scan</span>
                       </div>
                       {paymentMethod === 'upi' && (
                         <div className="mt-4 pt-4 border-t border-gray-100 pl-8 space-y-3">
                           <p className="text-xs text-gray-500 font-medium leading-relaxed italic">Pay directly using any UPI app. Your harvest ships once transaction is confirmed.</p>
                           <div className="bg-primary-50 border border-primary-200 text-primary-900 px-4 py-3 rounded-xl font-bold font-mono text-center flex items-center justify-between">
                             {adminUpi}
                             <button onClick={() => { navigator.clipboard.writeText(adminUpi); alert("UPI ID copied!"); }} className="text-[9px] bg-primary-900 text-white px-3 py-1.5 rounded-lg active:scale-95 transition-transform hover:bg-black">COPY</button>
                           </div>
                         </div>
                       )}
                    </label>

                    {/* COD Option */}
                    <label className={`flex flex-col p-6 bg-white border-2 rounded-2xl cursor-pointer shadow-soft transition-all ${paymentMethod === 'cod' ? 'border-primary-500 ring-2 ring-primary-100' : 'border-gray-100 hover:border-primary-200'}`}>
                       <div className="flex items-center gap-4">
                          <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4 text-primary-600" />
                          <span className="font-bold text-gray-900">Cash on Delivery (COD)</span>
                       </div>
                    </label>

                    <button 
                       onClick={async () => {
                         if (paymentMethod === 'razorpay') {
                            await handleRazorpayPayment();
                         } else {
                            await createOrder();
                         }
                       }}
                       disabled={isProcessing}
                       className="btn-cta w-full !text-lg !py-4.5 !rounded-2xl mt-8 flex justify-center shadow-glow-cta hover:scale-[1.02] transition-transform disabled:opacity-50"
                    >
                       {isProcessing ? "Processing Vault Transaction..." : `Confirm Order — ₹${cartStats.total}`}
                    </button>
                 </div>
              </div>
           </div>

           {/* Small Summary */}
           <div className="w-full md:w-80 shrink-0">
             <div className="glass-panel p-6 rounded-[2rem] sticky top-8 border-t-4 border-t-primary-500">
                <h4 className="font-display font-black text-lg text-primary-900 mb-4">Order Summary</h4>
                <div className="space-y-3 text-sm border-b border-gray-100 pb-4 mb-4">
                   <div className="flex justify-between font-bold text-gray-600"><span>{cartStats.count} Items</span> <span>₹{cartStats.total}</span></div>
                   <div className="flex justify-between font-bold text-gray-600"><span>Delivery</span> <span className="text-emerald-500 uppercase tracking-widest text-[10px]">Free</span></div>
                </div>
                <div className="flex justify-between items-end">
                   <span className="font-bold text-gray-900">Total</span>
                   <span className="text-2xl font-black text-primary-900">₹{cartStats.total}</span>
                </div>
             </div>
           </div>
           
        </div>
      </main>
    </div>
  );
}
