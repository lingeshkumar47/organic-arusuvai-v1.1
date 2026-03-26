'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';

/* ── Sample Data ── */
const allProducts = [
  { id: 1, slug: 'organic-turmeric-powder', name: 'Organic Turmeric Powder', price: 149, mrp: 199, category: 'Spices', rating: 4.8, reviews: 124, image: '🌿', variants: ['100g', '250g', '500g'] },
  { id: 2, slug: 'organic-red-chilli-powder', name: 'Organic Red Chilli Powder', price: 129, mrp: 169, category: 'Spices', rating: 4.6, reviews: 98, image: '🌶️', variants: ['100g', '250g'] },
  { id: 3, slug: 'organic-coriander-powder', name: 'Organic Coriander Powder', price: 109, mrp: 139, category: 'Spices', rating: 4.7, reviews: 87, image: '🫑', variants: ['100g', '250g', '500g'] },
  { id: 4, slug: 'organic-cumin-seeds', name: 'Organic Cumin Seeds', price: 179, mrp: 229, category: 'Spices', rating: 4.9, reviews: 156, image: '🌿', variants: ['100g', '250g'] },
  { id: 5, slug: 'organic-black-pepper', name: 'Organic Black Pepper', price: 199, mrp: 279, category: 'Spices', rating: 4.9, reviews: 145, image: '⚫', variants: ['50g', '100g', '250g'] },
  { id: 6, slug: 'cold-pressed-coconut-oil', name: 'Cold Pressed Coconut Oil', price: 349, mrp: 449, category: 'Cold Pressed Oils', rating: 4.9, reviews: 89, image: '🥥', variants: ['500ml', '1L'] },
  { id: 7, slug: 'cold-pressed-groundnut-oil', name: 'Cold Pressed Groundnut Oil', price: 279, mrp: 350, category: 'Cold Pressed Oils', rating: 4.7, reviews: 67, image: '🥜', variants: ['500ml', '1L'] },
  { id: 8, slug: 'cold-pressed-sesame-oil', name: 'Cold Pressed Sesame Oil', price: 319, mrp: 399, category: 'Cold Pressed Oils', rating: 4.8, reviews: 54, image: '🫒', variants: ['500ml', '1L'] },
  { id: 9, slug: 'organic-foxtail-millet', name: 'Organic Foxtail Millet', price: 129, mrp: 179, category: 'Millets', rating: 4.7, reviews: 56, image: '🌾', variants: ['500g', '1kg'] },
  { id: 10, slug: 'organic-ragi-flour', name: 'Organic Ragi Flour', price: 109, mrp: 149, category: 'Millets', rating: 4.5, reviews: 92, image: '🌱', variants: ['500g', '1kg'] },
  { id: 11, slug: 'organic-little-millet', name: 'Organic Little Millet', price: 139, mrp: 189, category: 'Millets', rating: 4.6, reviews: 43, image: '🌾', variants: ['500g', '1kg'] },
  { id: 12, slug: 'sambar-powder-mix', name: 'Sambar Powder Mix', price: 99, mrp: 149, category: 'Ready Mixes', rating: 4.6, reviews: 203, image: '🥘', variants: ['100g', '250g'] },
  { id: 13, slug: 'rasam-powder-mix', name: 'Rasam Powder Mix', price: 89, mrp: 129, category: 'Ready Mixes', rating: 4.5, reviews: 167, image: '🍲', variants: ['100g', '250g'] },
  { id: 14, slug: 'idli-dosa-batter-mix', name: 'Idli Dosa Batter Mix', price: 79, mrp: 109, category: 'Ready Mixes', rating: 4.4, reviews: 134, image: '🫓', variants: ['200g', '500g'] },
  { id: 15, slug: 'farm-fresh-jaggery', name: 'Farm Fresh Jaggery', price: 89, mrp: 120, category: 'Farm Products', rating: 4.8, reviews: 78, image: '🍯', variants: ['250g', '500g', '1kg'] },
  { id: 16, slug: 'organic-honey', name: 'Organic Wild Honey', price: 299, mrp: 399, category: 'Farm Products', rating: 4.9, reviews: 112, image: '🍯', variants: ['250g', '500g'] },
];

const categoryMeta = {
  'spices': { name: 'Spices', emoji: '🌶️', desc: 'Authentic Indian spices sourced from organic farms' },
  'farm-products': { name: 'Farm Products', emoji: '🌿', desc: 'Fresh produce directly from certified organic farms' },
  'ready-mixes': { name: 'Ready Mixes', emoji: '🥘', desc: 'Traditional recipes made easy with organic ingredients' },
  'millets': { name: 'Millets', emoji: '🌾', desc: 'Ancient supergrains for modern healthy living' },
  'cold-pressed-oils': { name: 'Cold Pressed Oils', emoji: '🫒', desc: 'Stone-ground, chemical-free cooking oils' },
};

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'newest', label: 'Newest First' },
];

const priceRanges = [
  { label: 'Under ₹100', min: 0, max: 100 },
  { label: '₹100 - ₹200', min: 100, max: 200 },
  { label: '₹200 - ₹500', min: 200, max: 500 },
  { label: 'Above ₹500', min: 500, max: Infinity },
];

export default function CategoryPage({ params }) {
  const slug = params.slug;
  const meta = categoryMeta[slug] || { name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), emoji: '🛒', desc: '' };

  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const categoryProducts = allProducts.filter(p => {
    const match = slug === 'all' || p.category.toLowerCase().replace(/\s+/g, '-') === slug;
    if (!match) return false;
    if (priceFilter !== null) {
      const range = priceRanges[priceFilter];
      return p.price >= range.min && p.price < range.max;
    }
    return true;
  });

  const sortedProducts = useMemo(() => {
    const sorted = [...categoryProducts];
    switch (sortBy) {
      case 'price-low': return sorted.sort((a, b) => a.price - b.price);
      case 'price-high': return sorted.sort((a, b) => b.price - a.price);
      case 'rating': return sorted.sort((a, b) => b.rating - a.rating);
      case 'newest': return sorted.sort((a, b) => b.id - a.id);
      default: return sorted.sort((a, b) => b.reviews - a.reviews);
    }
  }, [categoryProducts, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100/80 sticky top-[110px] md:top-[128px] z-30">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-[13px] text-gray-500">
            <Link href="/" className="hover:text-primary-600 transition-colors font-medium">Home</Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-semibold">{meta.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <section className="bg-gradient-to-br from-primary-800 to-primary-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh-1 opacity-20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center text-5xl md:text-7xl shadow-xl border border-white/10 animate-scale-in">
              {meta.emoji}
            </div>
            <div>
              <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-4 animate-fade-in-up">
                {meta.name}
              </h1>
              <p className="text-primary-100 text-lg md:text-xl max-w-2xl leading-relaxed animate-fade-in-up delay-100 italic">
                {meta.desc}
              </p>
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-3 animate-fade-in-up delay-200">
                <span className="badge !bg-white/10 !text-white !px-4 !py-2 border border-white/10">
                  🍃 {sortedProducts.length} Products
                </span>
                <span className="badge !bg-cta-400 !text-primary-900 !px-4 !py-2 font-bold select-none">
                  ⭐ Premium Quality
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex gap-10">
          {/* Sidebar Filters */}
          <aside className={`w-72 shrink-0 hidden md:block`}>
            <div className="sticky top-[180px] space-y-8">
              {/* Filter Card */}
              <div className="glass-card p-6 border-white/60 shadow-xl-soft">
                <h3 className="font-display font-bold text-gray-900 text-lg mb-6 flex items-center justify-between">
                  Filters
                  <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center text-[11px] font-bold">
                    {priceFilter !== null ? '1' : '0'}
                  </span>
                </h3>

                {/* Price Range */}
                <div className="mb-8">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Price Range</h4>
                  <div className="space-y-3">
                    {priceRanges.map((range, i) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer group select-none">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="radio"
                            name="price"
                            checked={priceFilter === i}
                            onChange={() => setPriceFilter(priceFilter === i ? null : i)}
                            className="peer appearance-none w-5 h-5 rounded-md border-2 border-gray-200 checked:border-primary-500 transition-all duration-300"
                          />
                          <div className="absolute w-2.5 h-2.5 rounded-sm bg-primary-500 scale-0 peer-checked:scale-100 transition-transform duration-300" />
                        </div>
                        <span className="text-sm font-medium text-gray-600 group-hover:text-primary-700 transition-colors">
                          {range.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {priceFilter !== null && (
                    <button 
                      onClick={() => setPriceFilter(null)} 
                      className="text-xs font-bold text-primary-600 mt-4 hover:text-primary-700 transition-colors flex items-center gap-1 group"
                    >
                      <span className="group-hover:rotate-90 transition-transform">✕</span> Clear Filter
                    </button>
                  )}
                </div>

                {/* Categories */}
                {slug === 'all' && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Our Categories</h4>
                    <div className="space-y-2">
                      {Object.entries(categoryMeta).map(([key, val]) => (
                        <Link key={key} href={`/category/${key}`}
                              className="flex items-center gap-3 text-[15px] font-medium text-gray-600 hover:text-primary-700 hover:bg-primary-50/50 p-2.5 rounded-xl transition-all duration-200">
                          <span className="text-xl">{val.emoji}</span> {val.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Promo Banner in Sidebar */}
              <div className="bg-gradient-to-br from-cta-400 to-cta-500 rounded-3xl p-6 text-primary-900 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 group-hover:scale-110 transition-transform duration-500 select-none">🌶️</div>
                <h4 className="font-display font-bold text-lg mb-2">Weekend Special</h4>
                <p className="text-sm font-medium opacity-80 mb-4">Get 20% extra on all spice mixes!</p>
                <div className="inline-block bg-primary-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary-900/20 active:scale-95 transition-transform cursor-pointer">
                  Shop Now
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-2">
                <div className="md:hidden">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <span>🔍</span> Filters {priceFilter !== null ? '(1)' : ''}
                  </button>
                </div>
                <p className="text-sm text-gray-400 font-medium hidden sm:block">
                  Showing <span className="text-gray-900 font-bold">{sortedProducts.length}</span> results
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-400 hidden lg:block">SORT BY</span>
                <div className="relative min-w-[200px]">
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full appearance-none bg-white border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 focus:outline-none focus:border-primary-400 transition-colors pr-10 cursor-pointer shadow-sm"
                  >
                    {sortOptions.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    ▼
                  </div>
                </div>
              </div>
            </div>

            {sortedProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {sortedProducts.map((product, idx) => (
                  <div key={product.id} className={`animate-fade-in-up`} style={{ animationDelay: `${idx * 50}ms` }}>
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 glass-card border-none shadow-none">
                <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 select-none animate-bounce-subtle">
                  🛰️
                </div>
                <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">No products found</h3>
                <p className="text-gray-500 mb-10 max-w-sm mx-auto text-lg">We couldn't find any products matching your current filters. Try adjusting your search.</p>
                <button 
                  onClick={() => { setPriceFilter(null); setSortBy('popular'); }} 
                  className="btn-primary"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[40px] p-8 animate-slide-up">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8" />
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-display font-bold text-2xl text-gray-900">Filters</h3>
              <button 
                onClick={() => setShowFilters(false)} 
                className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-8">
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Price Range</h4>
                <div className="grid grid-cols-2 gap-3">
                  {priceRanges.map((range, i) => (
                    <button
                      key={i}
                      onClick={() => setPriceFilter(priceFilter === i ? null : i)}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-bold transition-all duration-200
                        ${priceFilter === i 
                          ? 'border-primary-500 bg-primary-500 text-white shadow-lg shadow-primary-200' 
                          : 'border-gray-100 text-gray-600 active:bg-gray-50'}`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                onClick={() => setShowFilters(false)} 
                className="btn-primary w-full justify-center text-lg !py-4 shadow-xl shadow-primary-200/50"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
