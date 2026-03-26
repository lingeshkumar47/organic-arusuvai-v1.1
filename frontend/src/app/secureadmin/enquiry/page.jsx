'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchEnquiries(); }, []);
  async function fetchEnquiries() { setLoading(true); const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false }); setEnquiries(data || []); setLoading(false); }

  async function updateStatus(id, status) { await supabase.from('enquiries').update({ status }).eq('id', id); fetchEnquiries(); }
  async function deleteEnquiry(id) { await supabase.from('enquiries').delete().eq('id', id); fetchEnquiries(); }

  const statusColors = { new: 'bg-yellow-100 text-yellow-700', read: 'bg-blue-100 text-blue-700', replied: 'bg-green-100 text-green-700', closed: 'bg-gray-100 text-gray-500' };

  return (
    <div className="pb-10">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Customer Enquiries</h1>
      <p className="text-sm text-gray-500 mb-6">Manage incoming customer questions and contact form submissions.</p>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Loading...</div> : enquiries.length === 0 ? (
          <div className="p-10 text-center text-gray-400"><span className="text-4xl block mb-3">📩</span>No enquiries received yet.</div>
        ) : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
              <th className="px-5 py-3">From</th><th className="px-5 py-3">Subject</th><th className="px-5 py-3">Message</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th><th className="px-5 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {enquiries.map(e => (
                <tr key={e.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3"><p className="font-bold">{e.name}</p><p className="text-[10px] text-gray-400">{e.email || e.phone}</p></td>
                  <td className="px-5 py-3 text-xs font-medium">{e.subject || '—'}</td>
                  <td className="px-5 py-3 text-xs text-gray-600 max-w-xs truncate">{e.message}</td>
                  <td className="px-5 py-3">
                    <select value={e.status} onChange={ev => updateStatus(e.id, ev.target.value)} className={`text-[10px] px-2 py-1 rounded-full font-bold border-0 ${statusColors[e.status]}`}>
                      <option value="new">New</option><option value="read">Read</option><option value="replied">Replied</option><option value="closed">Closed</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-400">{new Date(e.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right"><button onClick={() => deleteEnquiry(e.id)} className="text-red-400 hover:text-red-600">🗑️</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
