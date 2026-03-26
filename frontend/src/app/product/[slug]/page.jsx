'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';
import { supabase } from '../../../lib/supabase';

function StarRating({ rating, size = 'text-sm' }) {
  return (
    <span className={`text-cta-500 ${size} drop-shadow-sm`}>
      {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
    </span>
  );
}

export default function ProductDetailPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', comment: '', rating: 5 });

  useEffect(() => {
    async function loadData() {
      // Fetch Product
      const { data: p, error: pErr } = await supabase.from('products').select('*, categories(name, slug)').eq('slug', params.slug).single();
      if (pErr || !p) { setLoading(false); return; }

      // Fetch Extraneous Data
      const { data: variants } = await supabase.from('product_variants').select('*').eq('product_id', p.id);
      const { data: media } = await supabase.from('product_images').select('*').eq('product_id', p.id).order('sort_order', { ascending: true });
      const { data: reviews } = await supabase.from('reviews').select('*').eq('product_id', p.id).order('is_pinned', { ascending: false }).order('created_at', { ascending: false });

      p.category = p.categories?.name || 'Uncategorized';
      p.categorySlug = p.categories?.slug || 'all';
      p.variants = variants || [];
      if (p.variants.length === 0) {
        p.variants = [{ id: 0, name: 'Standard', mrp_price: p.base_price, price: p.base_price, stock: 10 }];
      }
      p.images = media && media.length > 0 ? media.map(m => m.image_url) : ['🌿'];
      p.reviewsList = reviews || [];
      p.totalReviews = reviews?.length || 0;
      
      const avgRating = p.totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / p.totalReviews) : 4.8;
      p.rating = avgRating.toFixed(1);

      setProduct(p);
      setLoading(false);
    }
    loadData();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 space-y-12 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-1/2 h-[500px] skeleton rounded-[3rem]" />
          <div className="w-full lg:w-1/2 space-y-6 pt-10">
            <div className="h-4 w-24 skeleton rounded-full" />
            <div className="h-16 w-3/4 skeleton rounded-3xl" />
            <div className="h-6 w-1/4 skeleton rounded-full" />
            <div className="h-32 w-full skeleton rounded-[2rem] mt-10" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 pt-20">
      <div className="text-8xl mb-6 blur-sm opacity-50">🌱</div>
      <h1 className="font-display font-black text-3xl text-primary-900 mb-2">Harvest Not Found</h1>
      <p className="text-gray-500 font-medium mb-8">This heirloom product may be out of season.</p>
      <Link href="/category/all" className="btn-primary">Return to Store</Link>
    </div>
  );

  const currentVariant = product.variants[selectedVariant] || product.variants[0];
  const discount = Math.round(((currentVariant.mrp_price - currentVariant.price) / currentVariant.mrp_price) * 100);

  return (
    <div className="min-h-screen bg-white pt-24 pb-20">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <nav className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-gray-400">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.categorySlug}`} className="hover:text-primary-600 transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </nav>
      </div>

      <section className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Image Gallery (1:1 Apple-Style) */}
          <div className="w-full lg:w-[55%] space-y-6">
            <div className="relative aspect-square rounded-[3rem] bg-gray-50/50 overflow-hidden group shadow-float border border-gray-100/50">
              <div className="absolute inset-0 flex items-center justify-center p-10 lg:p-20 transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 select-none">
                {product.images[selectedImage].length < 10 ? (
                   <span className="text-[140px] md:text-[220px] drop-shadow-2xl">{product.images[selectedImage]}</span>
                ) : (
                   <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-contain drop-shadow-xl" />
                )}
              </div>
              {discount > 0 && (
                <div className="absolute top-8 left-8 bg-cta-400 text-primary-950 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-cta-500/30">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`shrink-0 w-24 h-24 rounded-2xl border-2 transition-all duration-300 overflow-hidden flex items-center justify-center p-2 
                      ${selectedImage === i ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white hover:border-gray-200 opacity-60 hover:opacity-100'}`}
                  >
                    {img.length < 10 ? <span className="text-3xl">{img}</span> : <img src={img} className="w-full h-full object-contain drop-shadow-sm" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details & Sticky Action Panel */}
          <div className="w-full lg:w-[45%]">
            <div className="sticky top-28 space-y-8 animate-fade-in-up delay-100">
              
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="badge-cta py-1.5 shadow-sm">HEIRLOOM QUALITY</span>
                  <span className="badge !bg-primary-900 !text-primary-200">{product.category}</span>
                </div>
                
                <h1 className="font-display text-4xl lg:text-5xl font-black text-gray-900 leading-[1.1] tracking-tight mb-4">
                  {product.name}
                </h1>
                
                {/* Zomato-style review block */}
                <div className="flex items-center gap-4 py-3 border-y border-gray-100 mb-6">
                  <div className="flex items-center gap-1.5 bg-primary-50 px-3 py-1.5 rounded-lg border border-primary-100">
                    <span className="text-sm font-black text-primary-900">{product.rating}</span>
                    <span className="text-cta-500 text-sm leading-none -mt-0.5">★</span>
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{product.totalReviews} Reviews</span>
                  <div className="w-px h-4 bg-gray-200" />
                  <span className="flex items-center gap-1.5 text-xs font-black text-emerald-600 uppercase tracking-widest select-none">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                     In Stock
                  </span>
                </div>
                
                <p className="text-gray-500 text-lg leading-relaxed font-medium">
                   {product.description || 'Premium, unadulterated harvest strictly sourced from native organic farmers. Delivered straight to your kitchen.'}
                </p>
              </div>

              {/* Pricing & Variants (Glass Panel) */}
              <div className="glass-panel p-8 rounded-[2.5rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-cta-500/10 rounded-full blur-3xl" />
                
                <div className="flex items-baseline gap-4 mb-2 relative z-10">
                  <span className="text-5xl font-black text-gray-900 tracking-tighter">₹{currentVariant.price}</span>
                  {currentVariant.mrp_price > currentVariant.price && (
                    <span className="text-xl text-gray-400 line-through font-bold">₹{currentVariant.mrp_price}</span>
                  )}
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 relative z-10">Inclusive of all taxes</p>

                {/* Variant Selector */}
                <div className="space-y-4 relative z-10">
                  <h4 className="text-[10px] font-black text-primary-900 uppercase tracking-widest px-1">Select Size / Pack</h4>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedVariant(i)}
                        className={`px-6 py-3.5 rounded-2xl text-sm font-black transition-all duration-300 border-2 select-none
                          ${selectedVariant === i 
                            ? 'border-primary-500 bg-primary-600 text-white shadow-glow scale-[1.03]' 
                            : 'border-white bg-white/50 backdrop-blur-md text-gray-600 hover:border-primary-200 active:scale-95'}`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <div className="flex items-center justify-between px-2 bg-gray-50 rounded-2xl border border-gray-100 w-full sm:w-32 h-16">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary-600 rounded-xl transition-colors active:scale-90">
                    <span className="text-2xl font-bold leading-none -mt-1">−</span>
                  </button>
                  <span className="font-black text-lg text-gray-900 w-8 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-primary-600 rounded-xl transition-colors active:scale-90">
                    <span className="text-2xl font-bold leading-none -mt-0.5">+</span>
                  </button>
                </div>
                
                <button 
                  onClick={() => {
                    import('../../../lib/cart').then(({ addToCart }) => {
                      addToCart({
                        id: product.id,
                        variantId: currentVariant.id,
                        name: product.name,
                        variant: currentVariant.name,
                        price: currentVariant.price,
                        mrp: currentVariant.mrp_price,
                        image: product.images[0] || '🌿',
                        slug: product.slug,
                        qty: quantity,
                        stock: currentVariant.stock || 100
                      });
                      // Reset qty and perhaps show visual feedback
                      setQuantity(1);
                    });
                  }}
                  className="flex-1 btn-cta !h-16 !rounded-2xl !text-lg !font-black uppercase tracking-widest md:text-xl"
                >
                  Add to Bag
                </button>
              </div>

              {/* Micro Trust Features */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl">
                  <span className="text-2xl drop-shadow-sm">📦</span>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-900 uppercase">Express Ship</h4>
                    <p className="text-[10px] font-bold text-gray-400">Within 24 Hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50/50 rounded-2xl">
                  <span className="text-2xl drop-shadow-sm">🛡️</span>
                  <div>
                    <h4 className="text-[11px] font-black text-gray-900 uppercase">Secure Pay</h4>
                    <p className="text-[10px] font-bold text-gray-400">UPI/Cards Safe</p>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Storytelling & Details Section */}
        <div className="mt-32 max-w-4xl mx-auto space-y-20">
           <div className="text-center">
              <h2 className="font-display font-black text-3xl md:text-4xl text-gray-900 tracking-tight mb-6">Why {product.name}?</h2>
              <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto">
                 We carefully select single-origin harvests to guarantee maximum flavor, high essential oil content, and absolute chemical-free purity.
              </p>
           </div>
           
           {/* Reviews */}
           <div className="glass-panel p-8 md:p-12 rounded-[3rem]">
              <div className="flex flex-col md:flex-row justify-between items-center bg-primary-950 p-8 rounded-[2rem] shadow-float mb-12">
                 <div className="text-center md:text-left mb-6 md:mb-0">
                    <p className="text-6xl font-black text-white tracking-tighter mb-2">{product.rating}</p>
                    <StarRating rating={product.rating} size="text-2xl" />
                    <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mt-3">{product.totalReviews} Verified Buyers</p>
                 </div>
                 <button onClick={() => setShowReviewForm(true)} className="btn-cta !px-8 !py-4 shadow-glow-cta">
                    Write a Review
                 </button>
              </div>

              <div className="space-y-6">
                 {product.reviewsList.length > 0 ? product.reviewsList.map((review, i) => (
                    <div key={i} className={`p-8 bg-white rounded-3xl border border-gray-100 shadow-soft relative overflow-hidden group hover:shadow-float hover:-translate-y-1 transition-all duration-500 ${review.is_pinned ? 'ring-2 ring-cta-400' : ''}`}>
                       {review.is_pinned && (
                         <div className="absolute top-0 right-0 bg-cta-400 text-primary-950 px-4 py-1.5 rounded-bl-xl font-black text-[9px] uppercase tracking-widest shadow-sm">
                           Featured Review
                         </div>
                       )}
                       <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-black text-xl text-gray-400 shadow-inner">
                            {review.user_name[0].toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 leading-none mb-1.5">{review.user_name}</h4>
                            <div className="flex items-center gap-2">
                               <StarRating rating={review.rating} size="text-[10px]" />
                               <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest ml-2">Verified</span>
                            </div>
                          </div>
                       </div>
                       <p className="text-gray-600 font-medium leading-relaxed text-sm md:text-base">"{review.comment}"</p>
                    </div>
                 )) : (
                    <div className="text-center py-10">
                       <p className="text-gray-400 font-bold mb-4">Be the first to review this premium harvest.</p>
                       <button onClick={() => setShowReviewForm(true)} className="text-primary-600 font-bold hover:underline">Write a Review →</button>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </section>

      {/* Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-950/40 backdrop-blur-md animate-fade-in" onClick={() => setShowReviewForm(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-float animate-scale-in">
            <button onClick={() => setShowReviewForm(false)} className="absolute top-6 right-6 w-8 h-8 bg-gray-100 rounded-full font-black text-gray-500 hover:bg-gray-200 transition-colors">×</button>
            <h3 className="font-display text-3xl font-black text-gray-900 mb-8 tracking-tight">Share your experience</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Your Name</label>
                <input placeholder="Ex. Karthik Mani" className="input-premium" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(r => (
                    <button key={r} onClick={() => setNewReview({...newReview, rating: r})} className={`text-3xl transition-transform hover:scale-110 ${newReview.rating >= r ? 'text-cta-500 drop-shadow-sm' : 'text-gray-200'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Review</label>
                <textarea rows={4} placeholder="What did you love about it?" className="input-premium resize-none" />
              </div>
              <button className="btn-primary w-full justify-center !py-4.5 !text-lg !rounded-2xl">Publish Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
