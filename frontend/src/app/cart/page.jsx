'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

import { getCart, updateQty, removeFromCart } from '../../lib/cart';

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load actual cart
  useEffect(() => {
    const loadCart = () => {
      setItems(getCart());
      setLoading(false);
    };
    loadCart();

    window.addEventListener('cart-updated', loadCart);
    return () => window.removeEventListener('cart-updated', loadCart);
  }, []);

  const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const totalMrp = items.reduce((sum, item) => sum + ((item.mrp || item.price) * item.qty), 0);
  const discount = totalMrp - total;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="mb-10 text-center sm:text-left animate-fade-in-up">
          <h1 className="font-display font-black text-4xl text-primary-900 tracking-tight mb-2">Your Bag</h1>
          <p className="text-gray-500 font-bold">You have {items.length} heirloom items in your bag.</p>
        </div>

        {loading ? (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {[1, 2].map(i => <div key={i} className="h-40 skeleton rounded-[2rem]" />)}
            </div>
            <div className="w-full lg:w-96 h-80 skeleton rounded-[2rem]" />
          </div>
        ) : items.length === 0 ? (
          <div className="glass-panel text-center py-32 rounded-[3rem] shadow-soft max-w-2xl mx-auto mt-12">
            <div className="text-7xl mb-6">🛒</div>
            <h3 className="font-display font-black text-3xl text-primary-900 mb-4">Your bag is empty</h3>
            <p className="text-gray-500 font-medium mb-8">Looks like you haven't added any premium harvests yet.</p>
            <Link href="/category/all" className="btn-primary !px-10 !py-4.5 !text-lg !rounded-2xl">Start Shopping</Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 relative animate-fade-in-up delay-100">
            {/* Cart Items List */}
            <div className="flex-1 border-gray-100 rounded-[2rem] space-y-6">
              {/* Promo Banner */}
              <div className="glass-panel-dark p-6 rounded-[2rem] flex items-center gap-4 bg-primary-950 text-white relative overflow-hidden shadow-float">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-cta-500/20 rounded-full blur-[80px]" />
                 <span className="text-3xl relative z-10 drop-shadow-md">✨</span>
                 <p className="font-medium text-primary-100 relative z-10">
                   You unlocked <strong className="text-white">Free Priority Shipping</strong> on this order!
                 </p>
              </div>

              {items.map(item => (
                <div key={item.id} className="relative group p-4 sm:p-6 bg-white rounded-[2rem] border border-gray-100 shadow-soft hover:shadow-float transition-all duration-300 flex flex-col sm:flex-row gap-6">
                  {/* Remove Button */}
                  <button onClick={() => removeFromCart(item.id, item.variantId)} className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-red-500 transition-colors w-8 h-8 flex items-center justify-center bg-gray-50 hover:bg-red-50 rounded-full font-black">
                    ×
                  </button>
                  
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 bg-gray-50/50 rounded-2xl flex items-center justify-center text-5xl overflow-hidden border border-gray-100 group-hover:border-primary-200 transition-colors">
                    {item.image.length < 5 ? item.image : <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between pt-1">
                    <div className="pr-10">
                      <h3 className="font-display font-bold text-gray-900 text-lg mb-1">{item.name}</h3>
                      <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest bg-primary-50 w-max px-2 py-0.5 rounded-md mb-3">{item.variant}</p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-auto">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-gray-900">₹{item.price}</span>
                        {item.mrp > item.price && <span className="text-sm font-bold text-gray-400 line-through">₹{item.mrp}</span>}
                      </div>

                      {/* Quantity Control */}
                      <div className="flex items-center justify-between px-2 bg-gray-50 rounded-xl border border-gray-200 w-28 h-10">
                        <button onClick={() => updateQty(item.id, item.variantId, item.qty - 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-600 transition-colors font-bold text-xl leading-none -mt-0.5">−</button>
                        <span className="font-black text-gray-900 text-sm w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.variantId, item.qty + 1)} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-primary-600 transition-colors font-bold text-xl leading-none -mt-0.5">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary (Sticky) */}
            <div className="w-full lg:w-96 shrink-0">
              <div className="glass-panel p-8 rounded-[2.5rem] sticky top-32">
                <h3 className="font-display font-black text-xl text-primary-900 mb-6">Order Summary</h3>
                
                <div className="space-y-4 text-sm font-medium border-b border-gray-100 pb-6 mb-6">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Bag Total (MRP)</span>
                    <span>₹{totalMrp}</span>
                  </div>
                  <div className="flex justify-between items-center text-primary-600 font-bold">
                    <span>Harvest Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Delivery Fee</span>
                    <span><strike className="text-gray-400">₹60</strike> <span className="text-emerald-500 font-bold ml-1 text-xs uppercase tracking-widest">Free</span></span>
                  </div>
                </div>

                <div className="flex items-end justify-between mb-8">
                  <div>
                    <h4 className="text-gray-900 font-bold">Total Amount</h4>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Incl. of all taxes</p>
                  </div>
                  <span className="text-3xl font-black text-primary-900 tracking-tighter">₹{total}</span>
                </div>

                <Link href="/checkout" className="btn-cta w-full !text-lg !py-4.5 !rounded-2xl flex items-center justify-center gap-2 mb-4">
                  Proceed to Pay <span className="text-xl">→</span>
                </Link>

                <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-6">
                  🔒 Secure 256-bit Encryption
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
