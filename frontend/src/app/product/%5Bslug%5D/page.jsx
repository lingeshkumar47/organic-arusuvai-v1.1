'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';
import { supabase } from '../../../lib/supabase';

function StarRating({ rating, size = 'text-sm' }) {
  return (
    <span className={`text-cta-500 ${size}`}>
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
  const [newReview, setNewReview] = useState({ name: '', comment: '', rating: 5, files: [] });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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
        p.variants = [{ id: 0, name: 'Standard', mrp_price: p.base_price, price: p.discount_price || p.base_price, stock: 10 }];
      }
      p.images = media && media.length > 0 ? media.map(m => m.image_url) : ['🌿'];
      p.reviewsList = reviews || [];
      p.totalReviews = reviews?.length || 0;
      
      const avgRating = p.totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / p.totalReviews) : 5;
      p.rating = avgRating.toFixed(1);

      setProduct(p);
      setLoading(false);
    }
    loadData();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 space-y-12 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-1/2 h-[500px] bg-gray-100 rounded-[40px]" />
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="h-4 w-24 bg-gray-100 rounded-full" />
            <div className="h-12 w-3/4 bg-gray-100 rounded-2xl" />
            <div className="h-6 w-1/4 bg-gray-100 rounded-full" />
            <div className="h-24 w-full bg-gray-100 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <div className="text-center py-40 font-display font-bold text-2xl text-gray-400">Product not found.</div>;

  const currentVariant = product.variants[selectedVariant] || product.variants[0];
  const discount = Math.round(((currentVariant.mrp_price - currentVariant.price) / currentVariant.mrp_price) * 100);

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <nav className="flex items-center gap-2 text-[13px] font-medium text-gray-400">
          <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.categorySlug}`} className="hover:text-primary-600 transition-colors">{product.category}</Link>
          <span>/</span>
          <span className="text-gray-900 font-bold truncate">{product.name}</span>
        </nav>
      </div>

      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          {/* Image Gallery (Apple-Style) */}
          <div className="flex-1 space-y-6 animate-fade-in">
            <div className="relative aspect-square rounded-[40px] bg-gradient-to-br from-gray-50 to-primary-50/30 border border-gray-100/80 overflow-hidden group shadow-xl-soft">
              <div className="absolute inset-0 flex items-center justify-center p-12 lg:p-20 group-hover:scale-110 transition-transform duration-1000 ease-out select-none">
                {product.images[selectedImage].length < 10 ? (
                   <span className="text-[140px] md:text-[220px] drop-shadow-2xl">{product.images[selectedImage]}</span>
                ) : (
                   <img src={product.images[selectedImage]} alt={product.name} className="w-full h-full object-contain drop-shadow-2xl" />
                )}
              </div>
              {discount > 0 && (
                <div className="absolute top-8 left-8 bg-cta-400 text-primary-950 px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-cta-200/50">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Thumbnail Navigation */}
            {product.images.length > 1 && (
              <div className="flex flex-wrap gap-4 justify-center">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-2xl border-2 transition-all duration-300 overflow-hidden flex items-center justify-center p-2 
                      ${selectedImage === i ? 'border-primary-500 bg-primary-50 ring-4 ring-primary-50 shadow-lg' : 'border-gray-100 bg-white hover:border-primary-200'}`}
                  >
                    {img.length < 10 ? <span className="text-2xl">{img}</span> : <img src={img} className="w-full h-full object-contain" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Actions */}
          <div className="flex-1 space-y-8 lg:pt-4 animate-fade-in-up">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="badge-cta py-1.5 uppercase tracking-widest font-black text-[10px] shadow-none select-none">Organic Direct</span>
                <span className="text-sm font-bold text-primary-600">{product.category}</span>
              </div>
              <h1 className="font-display text-3xl md:text-5xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 py-2 border-y border-gray-50 mb-6">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={product.rating} size="text-lg" />
                  <span className="text-sm font-black text-gray-900 ml-1">{product.rating}</span>
                </div>
                <div className="w-[1px] h-4 bg-gray-200" />
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{product.totalReviews} Reviews</span>
                <div className="w-[1px] h-4 bg-gray-200" />
                <span className="text-xs font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full select-none">In Stock</span>
              </div>
            </div>

            <div className="space-y-6">
              {/* Pricing */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-[32px] border border-gray-100/80 shadow-card">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-5xl font-black text-gray-900 tracking-tighter italic">₹{currentVariant.price}</span>
                  {currentVariant.mrp_price > currentVariant.price && (
                    <span className="text-xl text-gray-400 line-through font-bold">₹{currentVariant.mrp_price}</span>
                  )}
                </div>
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Inclusive of all local taxes</p>

                {/* Variant Selector */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black text-gray-900 uppercase tracking-widest px-1">Select Size / Pack</h4>
                  <div className="flex flex-wrap gap-3">
                    {product.variants.map((v, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedVariant(i)}
                        className={`px-5 py-3 rounded-2xl text-sm font-black transition-all duration-300 border-2 select-none
                          ${selectedVariant === i 
                            ? 'border-primary-500 bg-primary-600 text-white shadow-xl shadow-primary-200/50 scale-105' 
                            : 'border-gray-100 bg-white text-gray-600 hover:border-primary-200 active:scale-95'}`}
                      >
                        {v.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quantity and CTA */}
              <div className="flex flex-col sm:flex-row gap-4 items-stretch pt-2">
                <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-2xl border border-gray-100 shrink-0">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90">
                    <span className="text-xl font-bold">−</span>
                  </button>
                  <span className="w-8 text-center font-black text-lg text-gray-900">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-primary-600 hover:bg-white rounded-xl transition-all shadow-sm active:scale-90">
                    <span className="text-xl font-bold">+</span>
                  </button>
                </div>
                
                <button className="flex-1 btn-cta !py-4.5 !rounded-2xl !text-lg !font-black uppercase tracking-widest shadow-xl shadow-cta-200/40 group active:scale-[0.98]">
                  🛒 Add to Bag
                  <span className="group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                </button>
              </div>
            </div>

            {/* Micro Trust Section */}
            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="flex items-center gap-3 p-4 glass-card border-none shadow-sm group">
                <span className="text-2xl group-hover:scale-110 transition-transform select-none">📦</span>
                <div>
                  <h4 className="text-[11px] font-black text-gray-900 uppercase">Express Delivery</h4>
                  <p className="text-[10px] font-bold text-gray-400">Within 24-48 Hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 glass-card border-none shadow-sm group">
                <span className="text-2xl group-hover:scale-110 transition-transform select-none">🛡️</span>
                <div>
                  <h4 className="text-[11px] font-black text-gray-900 uppercase">Secure Payment</h4>
                  <p className="text-[10px] font-bold text-gray-400">UPI/Cards Protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Tabs (Frosted Glass) */}
        <div className="mt-24 space-y-12">
          <div className="flex justify-center border-b border-gray-100 sticky top-[165px] bg-white z-20 md:top-[183px]">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-5 text-xs font-black uppercase tracking-[0.2em] transition-all relative
                  ${activeTab === tab ? 'text-primary-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 animate-slide-in-left" />}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto min-h-[400px]">
            {activeTab === 'description' && (
              <div className="animate-fade-in space-y-6">
                <h3 className="font-display text-2xl font-bold text-gray-900">About this product</h3>
                <div className="prose prose-sm md:prose-base text-gray-500 leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: product.description || 'No description available for this heirloom product.' }} />
              </div>
            )}

            {activeTab === 'specifications' && (
               <div className="animate-fade-in space-y-8">
                <h3 className="font-display text-2xl font-bold text-gray-900">Technical Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: 'Sourcing', val: 'Direct from Organic Farms' },
                    { label: 'Harvest Date', val: 'July 2026 Batch' },
                    { label: 'Best Before', val: '12 Months from MFD' },
                    { label: 'Organic Cert', val: 'OAR-TN-2026-X832' },
                    { label: 'Processing', val: 'Stone-ground / Cold Processed' },
                    { label: 'Pesticides', val: '0% Chemical Traces' },
                  ].map((spec, i) => (
                    <div key={i} className="flex justify-between p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{spec.label}</span>
                      <span className="text-sm font-bold text-gray-900">{spec.val}</span>
                    </div>
                  ))}
                </div>
               </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-fade-in space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-center bg-primary-50 p-8 rounded-[32px] gap-6">
                  <div className="text-center md:text-left">
                    <p className="text-6xl font-black text-primary-900 tracking-tighter mb-2 italic">{product.rating}</p>
                    <StarRating rating={product.rating} size="text-2xl" />
                    <p className="text-xs font-bold text-primary-700/60 uppercase tracking-widest mt-2">{product.totalReviews} Customer Reviews</p>
                  </div>
                  <button 
                    onClick={() => setShowReviewForm(true)}
                    className="btn-primary !px-8 !py-4 shadow-xl shadow-primary-200"
                  >
                    ✏️ Written Review
                  </button>
                </div>

                {/* Review Gallery Filter (Pinned first) */}
                <div className="space-y-6">
                  {product.reviewsList.map((review, i) => (
                    <div key={i} className={`p-8 glass-card border-none shadow-sm relative overflow-hidden group hover:shadow-xl-soft transition-all duration-500 ${review.is_pinned ? 'ring-2 ring-cta-400' : ''}`}>
                      {review.is_pinned && (
                        <div className="absolute top-0 right-0 bg-cta-400 text-primary-950 px-4 py-1.5 rounded-bl-2xl font-black text-[9px] uppercase tracking-widest animate-pulse-gentle select-none">
                          Pinned Feedback ⭐
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 mb-5">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500 shadow-sm">
                          {review.user_name[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 leading-none mb-1.5">{review.user_name}</h4>
                          <div className="flex items-center gap-2">
                             <StarRating rating={review.rating} size="text-xs" />
                             <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-gray-600 font-medium leading-relaxed italic">"{review.comment}"</p>
                      
                      {review.media_urls?.length > 0 && (
                        <div className="flex gap-3 mt-6">
                          {JSON.parse(review.media_urls).map((url, j) => (
                            <div key={j} className="w-20 h-20 rounded-xl overflow-hidden border border-gray-100 shadow-sm cursor-zoom-in group/img">
                              <img src={url} className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-500" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recommended Products (Zomato-style) */}
      <section className="bg-gray-50/50 py-24 border-t border-gray-100/80">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="badge mb-4 select-none">🌱 Pure Living</div>
            <h2 className="section-title">You May Also Like</h2>
            <p className="section-subtitle mx-auto">Heirloom organic varieties curated for your health.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {/* Realistically would fetch related here, fallback to placeholders for design */}
            <div className="opacity-0 animate-fade-in-up delay-100"><ProductCard product={{id:1, name: 'Wild Forest Honey', price: 99, mrp: 150, rating: 4.8, reviews: 12, category: 'Farm Direct', image: '🍯'}} /></div>
            <div className="opacity-0 animate-fade-in-up delay-200"><ProductCard product={{id:2, name: 'Stone Ground Mustard', price: 149, mrp: 199, rating: 4.9, reviews: 45, category: 'Spices', image: '🌾'}} /></div>
            <div className="opacity-0 animate-fade-in-up delay-300"><ProductCard product={{id:3, name: 'Cold Pressed Sesame', price: 349, mrp: 450, rating: 4.7, reviews: 89, category: 'Oils', image: '🫒'}} /></div>
            <div className="opacity-0 animate-fade-in-up delay-400"><ProductCard product={{id:4, name: 'Himalayan Pink Salt', price: 89, mrp: 120, rating: 5.0, reviews: 6, category: 'Spices', image: '🧂'}} /></div>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setShowReviewForm(false)} />
          <div className="relative bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl animate-scale-in">
            <h3 className="font-display text-2xl font-bold text-gray-900 mb-6">Write a review</h3>
            <div className="space-y-6">
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Your Name</label>
                <input placeholder="Ex. Karthik Mani" className="input-premium" />
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Rating</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(r => (
                    <button key={r} onClick={() => setNewReview({...newReview, rating: r})} className={`text-2xl transition-all ${newReview.rating >= r ? 'text-cta-500 scale-110' : 'text-gray-100'}`}>★</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Description</label>
                <textarea rows={4} placeholder="Tell others about your experience..." className="input-premium resize-none" />
              </div>
              <button className="btn-primary w-full justify-center !py-4 shadow-xl shadow-primary-200">Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
