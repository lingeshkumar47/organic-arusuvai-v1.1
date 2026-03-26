'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { addToCart, updateQty, getCart, getCartTotal } from '../lib/cart';

export default function ProductCard({ product }) {
  const [currentVariant, setCurrentVariant] = useState(
    product.variants?.[0] || { id: 0, name: 'Standard', mrp_price: product.base_price, price: product.base_price }
  );
  const [cartQty, setCartQty] = useState(0);

  useEffect(() => {
    const checkCart = () => {
      const cart = getCart();
      const item = cart.find(c => c.id === product.id && c.variantId === currentVariant.id);
      setCartQty(item ? item.qty : 0);
    };
    checkCart();
    
    window.addEventListener('cart-updated', checkCart);
    return () => window.removeEventListener('cart-updated', checkCart);
  }, [product.id, currentVariant.id]);
  
  const image = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : '🌿';
  const discount = Math.round(((currentVariant.mrp_price - currentVariant.price) / currentVariant.mrp_price) * 100);

  const handleIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (cartQty === 0) {
      addToCart({
        id: product.id,
        variantId: currentVariant.id,
        name: product.name,
        variant: currentVariant.name,
        price: currentVariant.price,
        mrp: currentVariant.mrp_price,
        image: image,
        slug: product.slug,
        stock: currentVariant.stock || 100
      });
    } else {
      updateQty(product.id, currentVariant.id, cartQty + 1);
    }
    
    // Dispatch Global Toast
    const { total } = getCartTotal();
    window.dispatchEvent(new CustomEvent('oa-toast', { detail: `+ Added ${currentVariant.name} ${product.name} | Cart: ₹${total}` }));
  };

  const handleDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartQty > 0) {
      updateQty(product.id, currentVariant.id, cartQty - 1);
      const { total } = getCartTotal();
      window.dispatchEvent(new CustomEvent('oa-toast', { detail: `- Removed ${currentVariant.name} ${product.name} | Cart: ₹${total}` }));
    }
  };

  return (
    <div className="card-premium group relative flex flex-col h-full bg-white z-0">
      <Link href={`/product/${product.slug}`} className="block relative aspect-square overflow-hidden bg-gray-50/50 rounded-t-[1.5rem] z-0">
        <div className="absolute inset-0 flex items-center justify-center p-8 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 z-0">
          {image.length < 10 
            ? <span className="text-[120px] drop-shadow-xl">{image}</span>
            : <img src={image} alt={product.name} className="w-full h-full object-contain drop-shadow-lg" loading="lazy" />
          }
        </div>
        
        {/* Badges Overlay */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10 pointer-events-none">
          {discount > 0 ? (
            <span className="bg-cta-400 text-primary-950 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-md">
              {discount}% OFF
            </span>
          ) : <span />}
          
          <div className="bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 border border-white">
             <span className="text-cta-500 text-[10px] leading-none">★</span>
             <span className="text-gray-900 text-[10px] font-bold leading-none">{product.rating || '4.8'}</span>
          </div>
        </div>
      </Link>

      <div className="p-5 sm:p-6 flex flex-col flex-1 z-10 bg-white rounded-b-[1.5rem]">
        <Link href={`/category/${product.categorySlug || 'all'}`} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary-500 transition-colors mb-2 inline-block w-max hidden sm:block">
          {product.category || 'Farm Direct'}
        </Link>
        
        <Link href={`/product/${product.slug}`} className="block flex-1 group/title">
          <h3 className="font-display font-bold text-gray-900 text-sm sm:text-base leading-snug group-hover/title:text-primary-600 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Dynamic Variant Selector */}
        {product.variants?.length > 1 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentVariant(v); }}
                className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-all duration-300
                  ${currentVariant.id === v.id 
                    ? 'bg-primary-500 text-white shadow-md scale-105 border border-primary-400' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-200 border border-gray-100'}`}
              >
                {v.name}
              </button>
            ))}
          </div>
        )}
        
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-end justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">{currentVariant.name}</p>
            <div className="flex items-baseline gap-2 transition-all">
               <span className="text-lg font-black text-primary-900 leading-none">₹{currentVariant.price}</span>
               {currentVariant.mrp_price > currentVariant.price && (
                 <span className="text-xs text-gray-400 line-through font-bold">₹{currentVariant.mrp_price}</span>
               )}
            </div>
          </div>
          
          {cartQty > 0 ? (
            <div className="flex items-center bg-cta-400 rounded-2xl p-1 shadow-sm border border-cta-500 z-10">
              <button onClick={handleDecrease} className="w-8 h-8 flex items-center justify-center font-black text-primary-950 text-xl hover:bg-white/40 rounded-xl transition-colors leading-none">-</button>
              <span className="w-5 text-center font-black text-primary-950 text-sm">{cartQty}</span>
              <button onClick={handleIncrease} className="w-8 h-8 flex items-center justify-center font-black text-primary-950 text-xl hover:bg-white/40 rounded-xl transition-colors leading-none">+</button>
            </div>
          ) : (
            <button onClick={handleIncrease} className="w-10 h-10 lg:w-11 lg:h-11 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl hover:bg-cta-400 hover:text-primary-950 transition-all duration-300 active:scale-95 shadow-sm group z-10">
              <span className="group-hover:rotate-90 transition-transform duration-300">+</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
