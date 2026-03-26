'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AnalyticsPage() {
  const [data, setData] = useState({ pageViews: 0, sessions: 0, events: [], topPages: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchAnalytics(); }, []);

  async function fetchAnalytics() {
    setLoading(true);
    const { data: events } = await supabase.from('analytics_events').select('*').order('created_at', { ascending: false }).limit(100);
    
    const evts = events || [];
    const pageViews = evts.filter(e => e.event_type === 'page_view').length;
    const sessions = [...new Set(evts.map(e => e.user_agent))].length;
    
    const pageCounts = {};
    evts.filter(e => e.event_type === 'page_view').forEach(e => { pageCounts[e.page_path || '/'] = (pageCounts[e.page_path || '/'] || 0) + 1; });
    const topPages = Object.entries(pageCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([path, count]) => ({ path, count }));

    setData({ pageViews, sessions, events: evts, topPages });
    setLoading(false);
  }

  const eventTypeCounts = {};
  data.events.forEach(e => { eventTypeCounts[e.event_type] = (eventTypeCounts[e.event_type] || 0) + 1; });

  return (
    <div className="pb-10">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Analytics Engine</h1>
      <p className="text-sm text-gray-500 mb-6">Track traffic, events, and user behavior across your platform.</p>

      {loading ? <div className="p-10 text-center text-gray-400">Loading analytics...</div> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Page Views', value: data.pageViews, icon: '👁️', color: 'from-blue-500 to-blue-600' },
              { label: 'Unique Sessions', value: data.sessions, icon: '🖥️', color: 'from-purple-500 to-purple-600' },
              { label: 'Total Events', value: data.events.length, icon: '📊', color: 'from-emerald-500 to-emerald-600' },
              { label: 'Conversion Rate', value: data.pageViews > 0 ? ((eventTypeCounts['purchase'] || 0) / data.pageViews * 100).toFixed(1) + '%' : '0%', icon: '🎯', color: 'from-amber-500 to-amber-600' },
            ].map(c => (
              <div key={c.label} className={`bg-gradient-to-br ${c.color} rounded-2xl p-5 text-white shadow-lg`}>
                <p className="text-xs opacity-80 font-medium">{c.label}</p>
                <p className="text-2xl font-bold mt-1">{c.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Pages */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">📊 Top Pages</h3>
              {data.topPages.length === 0 ? <p className="text-gray-400 text-sm">No page view data yet.</p> : (
                <div className="space-y-2">
                  {data.topPages.map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs font-mono text-gray-700">{p.path}</span>
                      <span className="text-xs font-bold text-gray-500">{p.count} views</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Event Breakdown */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">🎯 Event Types</h3>
              {Object.keys(eventTypeCounts).length === 0 ? <p className="text-gray-400 text-sm">No events tracked yet. Events will appear here as users interact with your store.</p> : (
                <div className="space-y-2">
                  {Object.entries(eventTypeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-xs font-medium">{type}</span>
                      <span className="text-xs font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Events */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <h3 className="font-bold text-gray-800 p-6 pb-3">📋 Recent Events</h3>
            <table className="w-full text-sm">
              <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
                <th className="px-5 py-3">Timestamp</th><th className="px-5 py-3">Event</th><th className="px-5 py-3">Page</th><th className="px-5 py-3">Data</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {data.events.slice(0, 20).map(e => (
                  <tr key={e.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3 text-xs text-gray-400">{new Date(e.created_at).toLocaleString()}</td>
                    <td className="px-5 py-3"><span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-700">{e.event_type}</span></td>
                    <td className="px-5 py-3 text-xs font-mono">{e.page_path || '—'}</td>
                    <td className="px-5 py-3 text-[10px] text-gray-400 truncate max-w-xs">{e.event_data ? JSON.stringify(e.event_data) : '—'}</td>
                  </tr>
                ))}
                {data.events.length === 0 && <tr><td colSpan="4" className="px-5 py-10 text-center text-gray-400">No analytics events yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
