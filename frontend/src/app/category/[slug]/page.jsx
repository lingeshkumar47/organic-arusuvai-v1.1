'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '../../../components/ProductCard';
import { supabase } from '../../../lib/supabase';

export default function CategoryPage({ params }) {
  const slug = params?.slug || 'all';
  const isAll = slug === 'all';
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState({ name: isAll ? 'All Harvests' : 'Store', description: 'Premium selection' });
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchCategoryData() {
      // Get category info
      if (!isAll) {
        const { data: catData } = await supabase.from('categories').select('*').eq('slug', slug).single();
        if (catData) setCategory(catData);
      }

      // Get products
      let query = supabase.from('products').select('*, categories(name, slug)');
      if (!isAll && category.id) {
        query = query.eq('category_id', category.id);
      }
      const { data: prods } = await query;
      
      if (prods) {
        // Fetch variants & images
        const { data: variants } = await supabase.from('product_variants').select('*');
        const { data: images } = await supabase.from('product_images').select('*').order('sort_order', { ascending: true });

        const mapped = prods.map(p => ({
          ...p,
          category: p.categories?.name,
          categorySlug: p.categories?.slug,
          variants: variants?.filter(v => v.product_id === p.id) || [],
          images: images?.filter(img => img.product_id === p.id).map(img => img.image_url) || ['🌿'],
        }));
        
        // Sorting
        if (sortOrder === 'low') mapped.sort((a,b) => (a.variants[0]?.price || a.base_price) - (b.variants[0]?.price || b.base_price));
        if (sortOrder === 'high') mapped.sort((a,b) => (b.variants[0]?.price || b.base_price) - (a.variants[0]?.price || a.base_price));
        
        setProducts(mapped);
      }
      setLoading(false);
    }
    fetchCategoryData();
  }, [slug, sortOrder, category.id]);

  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-20">
      {/* Category Banner */}
      <div className="max-w-7xl mx-auto px-4 mb-10 fade-in-up">
        <div className="bg-primary-950 rounded-[2.5rem] p-10 md:p-16 relative overflow-hidden shadow-2xl flex items-center justify-between">
          <div className="absolute inset-0 bg-mesh-1 opacity-20 pointer-events-none" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 bg-cta-500/20 rounded-full blur-[100px] -translate-y-1/2" />
          
          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-3 mb-4">
               <Link href="/" className="text-[10px] font-black tracking-widest uppercase text-primary-400 hover:text-white transition-colors">Home</Link>
               <span className="text-gray-600 text-[10px]">/</span>
               <span className="text-[10px] font-black tracking-widest uppercase text-white">{category.name}</span>
            </div>
            <h1 className="font-display font-black text-4xl md:text-6xl text-white tracking-tight leading-none mb-4">{category.name}</h1>
            <p className="text-primary-200/80 font-medium text-lg">{category.description}</p>
          </div>

          <div className="hidden md:flex text-[140px] relative z-10 opacity-80 drop-shadow-2xl hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {slug === 'spice' ? '🌶️' : slug === 'ready-mixes' ? '🥘' : '🌾'}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters (Glassmorphism) */}
        <aside className={`fixed inset-0 z-[100] lg:static lg:z-auto lg:w-72 shrink-0 transition-all duration-500
          ${isMobileFilterOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto'}`}>
          <div className="absolute inset-0 bg-primary-950/40 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileFilterOpen(false)} />
          
          <div className="absolute right-0 top-0 bottom-0 w-[85%] max-w-sm glass-panel-heavy p-6 lg:static lg:w-full lg:max-w-none lg:bg-transparent lg:shadow-none lg:border-none lg:p-0 lg:backdrop-blur-none h-full overflow-y-auto lg:overflow-visible">
            <div className="flex justify-between items-center lg:mb-8 mb-6 lg:hidden">
              <h3 className="font-display font-black text-xl text-primary-900">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full font-black text-gray-500">×</button>
            </div>

            <div className="space-y-8 sticky top-[100px]">
              {/* Category Links */}
              <div className="glass-panel p-6 rounded-[2rem]">
                <h4 className="font-display font-black text-lg text-primary-900 mb-6">Categories</h4>
                <div className="space-y-3">
                  {['all', 'spice', 'farm-products', 'ready-mixes'].map(t => (
                    <Link 
                      key={t}
                      href={`/category/${t}`}
                      className="group flex justify-between items-center cursor-pointer"
                    >
                      <span className={`text-sm font-bold transition-colors ${slug === t || (isAll && t === 'all') ? 'text-primary-600' : 'text-gray-500 group-hover:text-primary-900'}`}>
                        {t === 'all' ? 'All Harvests' : t.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      {(slug === t || (isAll && t === 'all')) && <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Price Filter styling */}
              <div className="glass-panel p-6 rounded-[2rem]">
                <h4 className="font-display font-black text-lg text-primary-900 mb-6">Price Range</h4>
                 <div className="space-y-4">
                    {['Under ₹500', '₹500 - ₹1000', 'Over ₹1000'].map(r => (
                      <label key={r} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-5 h-5 rounded-md border-2 border-gray-200 group-hover:border-primary-400 transition-colors">
                           <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer peer" />
                           <div className="w-2.5 h-2.5 rounded-sm bg-primary-500 scale-0 peer-checked:scale-100 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                        </div>
                        <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900 transition-colors">{r}</span>
                      </label>
                    ))}
                 </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <p className="text-sm font-bold text-gray-500">
              Showing <span className="text-primary-900">{products.length}</span> highest-grade harvests.
            </p>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex-1 btn-glass !bg-white !text-primary-900 !border-gray-200 !shadow-sm focus:ring-4 focus:ring-primary-100"
              >
                Filters 🎛️
              </button>
              <select 
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="flex-1 sm:w-48 input-premium !py-2.5 !bg-white !shadow-sm cursor-pointer appearance-none"
                style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
              >
                <option value="popular">Most Popular</option>
                <option value="low">Price: Low to High</option>
                <option value="high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="h-[350px] skeleton rounded-[2rem]" />
               ))}
             </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 xl:gap-6">
              {products.map((product, i) => (
                <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${(i % 6) * 100}ms` }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel text-center py-24 rounded-[3rem] shadow-soft">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="font-display font-black text-2xl text-primary-900 mb-2">No Harvests Found</h3>
              <p className="text-gray-500 font-medium">Try adjusting your filters or search criteria.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
