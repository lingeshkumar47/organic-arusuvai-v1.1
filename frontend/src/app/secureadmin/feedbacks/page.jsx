'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

function StarRating({ rating }) {
  return (
    <span className="text-amber-500 text-lg">
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  );
}

export default function FeedbacksManager() {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  async function fetchFeedbacks() {
    setLoading(true);
    // Fetch all reviews and their associated products in a joined manner
    const { data, error } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });

    if (data) {
      setReviews(data);
    }
    setLoading(false);
  }

  async function togglePin(reviewId, currentlyPinned) {
    const { error } = await supabase
      .from('reviews')
      .update({ is_pinned: !currentlyPinned })
      .eq('id', reviewId);
    
    if (error) {
      alert("Error toggling pin status: " + error.message);
    } else {
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, is_pinned: !currentlyPinned } : r));
    }
  }

  async function deleteReview(reviewId) {
    if (confirm("Are you sure you want to permanently delete this feedback and its media?")) {
      await supabase.from('reviews').delete().eq('id', reviewId);
      setReviews(reviews.filter(r => r.id !== reviewId));
    }
  }

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Feedbacks & Testimonials</h1>
          <p className="text-sm text-gray-500">Monitor, pin, and delete customer reviews and media entries across your entire catalogue.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading Feedbacks...</div>
        ) : reviews.length === 0 ? (
          <div className="p-10 text-center text-gray-400 flex flex-col items-center">
            <span className="text-4xl mb-3 border border-gray-100 p-4 rounded-full bg-gray-50">💭</span>
            No feedbacks received yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 bg-gray-50/50">
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Customer / Product</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Rating & Feedback</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Media Attached</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Pinned Status</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map(r => (
                  <tr key={r.id} className="group hover:bg-gray-50/50 transition">
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900">{r.user_name}</p>
                      <p className="text-xs text-gray-500 mt-1 pb-1">ref: {r.products?.name || 'Unknown Product'}</p>
                      <span className="text-[9px] text-gray-400">{new Date(r.created_at).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-5 max-w-sm">
                      <div className="mb-2"><StarRating rating={r.rating} /></div>
                      <p className="text-sm text-gray-600 italic line-clamp-3">"{r.comment}"</p>
                    </td>
                    <td className="px-6 py-5">
                      {(!r.media_urls || r.media_urls.length === 0) ? (
                        <span className="text-xs text-gray-400 border border-gray-100 bg-gray-50 px-2 py-1 rounded-md">None</span>
                      ) : (
                        <div className="flex gap-2">
                          {r.media_urls.map((md, idx) => (
                            <img key={idx} src={md} className="w-12 h-12 object-cover rounded shadow-sm border border-gray-200 hover:scale-150 transition-transform origin-left z-10" alt="Customer media" />
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <button onClick={() => togglePin(r.id, r.is_pinned)} className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${r.is_pinned ? 'bg-amber-100 border-amber-200 text-amber-700 shadow-sm' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-white hover:border-gray-300'}`}>
                        {r.is_pinned ? '📌 Pinned on Storefront' : 'Unpinned'}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button onClick={() => deleteReview(r.id)} className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm" title="Delete Feedback">
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
