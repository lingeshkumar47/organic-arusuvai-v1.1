'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function SocialPlannerPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ platform: 'instagram', content: '', scheduled_at: '' });
  const [view, setView] = useState('list');

  useEffect(() => { fetchPosts(); }, []);
  async function fetchPosts() { setLoading(true); const { data } = await supabase.from('social_posts').select('*').order('scheduled_at', { ascending: true }); setPosts(data || []); setLoading(false); }

  async function createPost() {
    if (!form.content) return alert('Content required');
    await supabase.from('social_posts').insert({ ...form, status: form.scheduled_at ? 'scheduled' : 'draft' });
    setShowForm(false); setForm({ platform: 'instagram', content: '', scheduled_at: '' }); fetchPosts();
  }

  async function updateStatus(id, status) { await supabase.from('social_posts').update({ status }).eq('id', id); fetchPosts(); }
  async function deletePost(id) { await supabase.from('social_posts').delete().eq('id', id); fetchPosts(); }

  const platformIcons = { instagram: '📸', facebook: '📘', twitter: '🐦', whatsapp: '💬', youtube: '🎬' };
  const statusColors = { draft: 'bg-gray-100 text-gray-600', scheduled: 'bg-blue-100 text-blue-700', posted: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-700' };

  // Calendar view: group posts by date
  const groupedByDate = posts.reduce((acc, p) => {
    const d = p.scheduled_at ? new Date(p.scheduled_at).toLocaleDateString() : 'Unscheduled';
    (acc[d] = acc[d] || []).push(p); return acc;
  }, {});

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">Social Planner</h1><p className="text-sm text-gray-500">Schedule and manage social media content across platforms.</p></div>
        <button onClick={() => setShowForm(true)} className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-black transition shadow-md">+ Schedule Post</button>
      </div>

      <div className="flex gap-2 mb-6">
        {[['list','📋 List View'],['calendar','📅 Calendar']].map(([k,l]) => (
          <button key={k} onClick={() => setView(k)} className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${view === k ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}>{l}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : (
          <>
            {view === 'list' && (
              <table className="w-full text-sm">
                <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
                  <th className="px-5 py-3">Platform</th><th className="px-5 py-3">Content</th><th className="px-5 py-3">Scheduled</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-gray-50">
                  {posts.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3"><span className="text-xl">{platformIcons[p.platform]}</span> <span className="text-xs">{p.platform}</span></td>
                      <td className="px-5 py-3 text-xs max-w-xs truncate">{p.content}</td>
                      <td className="px-5 py-3 text-xs text-gray-400">{p.scheduled_at ? new Date(p.scheduled_at).toLocaleString() : '—'}</td>
                      <td className="px-5 py-3"><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColors[p.status]}`}>{p.status}</span></td>
                      <td className="px-5 py-3 text-right flex gap-1 justify-end">
                        {p.status === 'scheduled' && <button onClick={() => updateStatus(p.id, 'posted')} className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded font-bold">✓ Mark Posted</button>}
                        <button onClick={() => deletePost(p.id)} className="text-red-400 hover:text-red-600">🗑️</button>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && <tr><td colSpan="5" className="px-5 py-10 text-center text-gray-400">No posts scheduled yet.</td></tr>}
                </tbody>
              </table>
            )}
            {view === 'calendar' && (
              <div className="p-6 space-y-4">
                {Object.entries(groupedByDate).map(([date, datePosts]) => (
                  <div key={date}>
                    <h4 className="font-bold text-gray-700 text-sm mb-2 flex items-center gap-2">📅 {date}</h4>
                    <div className="space-y-2 ml-4">
                      {datePosts.map(p => (
                        <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <span>{platformIcons[p.platform]}</span>
                          <p className="text-xs flex-1 truncate">{p.content}</p>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColors[p.status]}`}>{p.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(groupedByDate).length === 0 && <p className="text-center text-gray-400 py-10">No posts to display.</p>}
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8">
            <h2 className="font-display text-xl font-bold mb-6">Schedule Post</h2>
            <div className="space-y-3">
              <select value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm">
                {Object.entries(platformIcons).map(([k,v]) => <option key={k} value={k}>{v} {k}</option>)}
              </select>
              <textarea placeholder="Post content..." value={form.content} onChange={e => setForm({...form, content: e.target.value})} rows="4" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
              <input type="datetime-local" value={form.scheduled_at} onChange={e => setForm({...form, scheduled_at: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm" />
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={createPost} className="flex-1 bg-gray-900 text-white rounded-xl py-3 font-bold text-sm hover:bg-black transition">Schedule</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-3 text-gray-400 font-bold text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
