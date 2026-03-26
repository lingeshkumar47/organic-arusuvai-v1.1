'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function SEOPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ page_path: '', meta_title: '', meta_description: '', keywords: '', og_image: '', robots: 'index,follow' });

  useEffect(() => { fetchSEO(); }, []);
  async function fetchSEO() { setLoading(true); const { data } = await supabase.from('seo_metadata').select('*').order('page_path'); setPages(data || []); setLoading(false); }

  async function saveSEO() {
    if (!form.page_path) return alert('Page path required');
    const payload = { ...form, keywords: form.keywords ? form.keywords.split(',').map(k => k.trim()) : [] };
    await supabase.from('seo_metadata').upsert(payload, { onConflict: 'page_path' });
    setShowForm(false); setForm({ page_path: '', meta_title: '', meta_description: '', keywords: '', og_image: '', robots: 'index,follow' }); fetchSEO();
  }

  async function deleteSEO(id) { await supabase.from('seo_metadata').delete().eq('id', id); fetchSEO(); }

  function generateSitemap() {
    const urls = ['/', '/category/spices', '/category/cold-pressed-oils', '/account', ...pages.map(p => p.page_path)];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `  <url><loc>https://organicArusuvai.com${u}</loc><changefreq>weekly</changefreq></url>`).join('\n')}\n</urlset>`;
    const blob = new Blob([xml], { type: 'application/xml' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'sitemap.xml'; a.click();
  }

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">SEO Optimization</h1><p className="text-sm text-gray-500">Manage meta tags, keywords, and generate sitemaps.</p></div>
        <div className="flex gap-2">
          <button onClick={generateSitemap} className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-700 transition">📄 Generate Sitemap</button>
          <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition">+ Add Page SEO</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
              <th className="px-5 py-3">Page Path</th><th className="px-5 py-3">Title</th><th className="px-5 py-3">Description</th><th className="px-5 py-3">Keywords</th><th className="px-5 py-3">Robots</th><th className="px-5 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {pages.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-mono text-xs font-bold text-primary-700">{p.page_path}</td>
                  <td className="px-5 py-3 text-xs max-w-xs truncate">{p.meta_title || '—'}</td>
                  <td className="px-5 py-3 text-xs text-gray-500 max-w-xs truncate">{p.meta_description || '—'}</td>
                  <td className="px-5 py-3"><div className="flex flex-wrap gap-1">{(p.keywords || []).map((k,i) => <span key={i} className="text-[9px] px-1.5 py-0.5 bg-gray-100 rounded-full">{k}</span>)}</div></td>
                  <td className="px-5 py-3 text-[10px] text-gray-400">{p.robots}</td>
                  <td className="px-5 py-3 text-right"><button onClick={() => deleteSEO(p.id)} className="text-red-400 hover:text-red-600">🗑️</button></td>
                </tr>
              ))}
              {pages.length === 0 && <tr><td colSpan="6" className="px-5 py-10 text-center text-gray-400">No SEO metadata configured yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h2 className="font-display text-xl font-bold mb-6">Page SEO Configuration</h2>
            <div className="space-y-3">
              <input placeholder="Page Path (e.g. /category/spices)" value={form.page_path} onChange={e => setForm({...form, page_path: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <input placeholder="Meta Title" value={form.meta_title} onChange={e => setForm({...form, meta_title: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <textarea placeholder="Meta Description" value={form.meta_description} onChange={e => setForm({...form, meta_description: e.target.value})} rows="2" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <input placeholder="Keywords (comma-separated)" value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <input placeholder="OG Image URL" value={form.og_image} onChange={e => setForm({...form, og_image: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <select value={form.robots} onChange={e => setForm({...form, robots: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                <option value="index,follow">index, follow</option><option value="noindex,follow">noindex, follow</option><option value="index,nofollow">index, nofollow</option><option value="noindex,nofollow">noindex, nofollow</option>
              </select>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={saveSEO} className="flex-1 bg-gray-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-black transition">Save SEO</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-gray-400 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
