'use client';
import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';
import Loading from '../../components/Loading';
import { supabase } from '../../lib/supabase';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const { data: prods } = await supabase.from('products').select('*, categories(name, slug)');
      const { data: variants } = await supabase.from('product_variants').select('*');
      const { data: images } = await supabase.from('product_images').select('*').order('sort_order', { ascending: true });

      if (prods) {
        setAllProducts(prods.map(p => ({
          ...p,
          category: p.categories?.name,
          categorySlug: p.categories?.slug,
          variants: variants?.filter(v => v.product_id === p.id) || [],
          images: images?.filter(img => img.product_id === p.id).map(img => img.image_url) || ['🌿'],
        })));
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const results = useMemo(() => {
    if (!searchTerm.trim() || !allProducts.length) return [];
    const q = searchTerm.toLowerCase();
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category && p.category.toLowerCase().includes(q))
    );
  }, [searchTerm, allProducts]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-32">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-100 py-10 shadow-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">
            <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
            <span>›</span>
            <span className="text-primary-900 border-b-2 border-primary-500">Search Hub</span>
          </nav>
          
          <div className="max-w-3xl">
            <h1 className="font-display font-black text-4xl text-primary-950 mb-6 tracking-tight">Explore the Harvest</h1>
            <div className="relative group">
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search for spices, oils, millets..."
                className="w-full pl-14 pr-6 py-5 rounded-[2rem] border-2 border-primary-100 bg-primary-50/30
                           focus:border-primary-400 focus:bg-white focus:outline-none transition-all duration-300 text-xl font-medium shadow-soft group-hover:shadow-float"
                autoFocus
              />
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-3xl opacity-50 grayscale group-focus-within:opacity-100 transition-opacity">🔍</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 relative animate-fade-in-up">
        {searchTerm.trim() ? (
          <>
            <div className="mb-10 flex items-center justify-between">
               <p className="text-gray-500 font-medium text-lg">
                 {results.length > 0
                   ? <><span className="font-black text-primary-950 px-2 py-1 bg-white rounded-lg shadow-sm">{results.length}</span> harvest{results.length !== 1 ? 's' : ''} located for "<span className="font-bold text-primary-700">{searchTerm}</span>"</>
                   : <>No results for "<span className="font-bold">{searchTerm}</span>"</>
                 }
               </p>
               {results.length > 0 && (
                 <span className="text-[10px] uppercase font-black tracking-widest text-green-600 bg-green-100 px-3 py-1.5 rounded-full border border-green-200">Live Search Active</span>
               )}
            </div>

            {results.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                {results.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3.5rem] shadow-float border border-gray-100 text-center animate-scale-in mt-10">
                <div className="w-24 h-24 rounded-[2rem] bg-gray-50 flex items-center justify-center text-4xl mx-auto mb-6 border-2 border-gray-100 shadow-sm opacity-60 grayscale">🔍</div>
                <h3 className="font-display font-black text-3xl text-gray-900 tracking-tight mb-4">No matching items found</h3>
                <p className="text-gray-500 text-lg mb-10 font-medium leading-relaxed max-w-md mx-auto">We don't find any items referred to your search. Please adjust your keywords or reach out directly to our team.</p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="https://wa.me/918056106136?text=Hi!%20I'm%20looking%20for%20a%20product%20not%20listed." target="_blank" rel="noopener noreferrer" className="btn-glass !bg-[#25D366] !text-white !border-[#128C7E] flex items-center justify-center gap-3 !py-4 w-full sm:w-auto !rounded-2xl shadow-[0_10px_20px_rgba(37,211,102,0.3)] hover:scale-105 transition-transform">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png" alt="WA" className="w-6 h-6" /> Reach out on WhatsApp
                  </a>
                  <Link href="/category/all" className="btn-ghost !text-primary-700 !bg-primary-50 hover:!bg-primary-100 !py-4 w-full sm:w-auto !rounded-2xl block border mr-0 border-primary-200 transition-colors font-black flex items-center justify-center gap-2 group">
                      Browse All Categories <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>
                  </Link>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto bg-white p-12 rounded-[3.5rem] shadow-sm border border-gray-100 text-center animate-fade-in mt-10">
            <span className="text-7xl block mb-6 drop-shadow-sm animate-float">🌿</span>
            <h3 className="font-display font-black text-3xl text-gray-900 mb-4 tracking-tight">What are you looking for?</h3>
            <p className="text-gray-500 font-medium text-lg">Try searching for keywords like "turmeric", "coconut oil", or "pepper"</p>
          </div>
        )}
      </div>
    </div>
  );
}
