'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function TestimonialsPage() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const { data: revs } = await supabase.from('reviews').select('*').eq('is_pinned', true).order('created_at', { ascending: false });
    const { data: prods } = await supabase.from('products').select('id, name');
    setReviews(revs || []);
    setProducts(prods || []);
    setLoading(false);
  }

  async function unpinReview(id) {
    await supabase.from('reviews').update({ is_pinned: false }).eq('id', id);
    fetchData();
  }

  function getProductName(pid) {
    return products.find(p => p.id === pid)?.name || 'Unknown';
  }

  return (
    <div className="pb-10">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Testimonials</h1>
      <p className="text-sm text-gray-500 mb-6">Curated customer testimonials — pinned reviews from the Feedbacks page appear here.</p>

      {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : reviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center shadow-sm">
          <span className="text-4xl block mb-3">💭</span>
          <p className="text-gray-500">No pinned testimonials yet.</p>
          <p className="text-xs text-gray-400 mt-1">Go to Feedbacks → Pin reviews to feature them as testimonials.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm relative">
              <span className="absolute top-3 right-3 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">📌 Pinned</span>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">{r.user_name?.[0] || 'U'}</div>
                <div>
                  <p className="font-bold text-gray-800">{r.user_name}</p>
                  <p className="text-[10px] text-gray-400">{getProductName(r.product_id)}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">{Array.from({ length: 5 }, (_, i) => <span key={i} className={i < r.rating ? 'text-amber-400' : 'text-gray-200'}>★</span>)}</div>
              <p className="text-sm text-gray-600">{r.comment}</p>
              {r.media_urls && r.media_urls.length > 0 && (
                <div className="flex gap-2 mt-3">{r.media_urls.map((url, i) => <img key={i} src={url} className="w-16 h-16 object-cover rounded-lg border" />)}</div>
              )}
              <button onClick={() => unpinReview(r.id)} className="mt-4 text-xs text-red-400 hover:text-red-600 font-bold">Unpin Testimonial</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
