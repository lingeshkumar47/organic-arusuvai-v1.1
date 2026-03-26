'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function StoragePage() {
  const [buckets, setBuckets] = useState([]);
  const [files, setFiles] = useState([]);
  const [activeBucket, setActiveBucket] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBuckets(); }, []);

  async function fetchBuckets() {
    setLoading(true);
    const { data } = await supabase.storage.listBuckets();
    setBuckets(data || []);
    if (data && data.length > 0) {
      setActiveBucket(data[0].name);
      await fetchFiles(data[0].name);
    }
    setLoading(false);
  }

  async function fetchFiles(bucketName) {
    const { data } = await supabase.storage.from(bucketName).list('', { limit: 100, sortBy: { column: 'name', order: 'asc' } });
    setFiles(data || []);
    setActiveBucket(bucketName);
  }

  async function deleteFile(fileName) {
    if (confirm(`Delete ${fileName}?`)) {
      await supabase.storage.from(activeBucket).remove([fileName]);
      fetchFiles(activeBucket);
    }
  }

  function getPublicUrl(fileName) {
    const { data } = supabase.storage.from(activeBucket).getPublicUrl(fileName);
    return data?.publicUrl;
  }

  function formatSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
    return (bytes/(1024*1024)).toFixed(1) + ' MB';
  }

  return (
    <div className="pb-10">
      <h1 className="font-display text-2xl font-bold text-gray-900 mb-1">Storage Pool</h1>
      <p className="text-sm text-gray-500 mb-6">Browse and manage Supabase storage buckets and files.</p>

      <div className="flex gap-2 mb-6 flex-wrap">
        {buckets.map(b => (
          <button key={b.name} onClick={() => fetchFiles(b.name)} className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${activeBucket === b.name ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-500'}`}>
            💾 {b.name}
          </button>
        ))}
        {buckets.length === 0 && !loading && <p className="text-sm text-gray-400">No storage buckets found.</p>}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Loading storage...</div> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-400 bg-gray-50/80 text-[10px] uppercase tracking-wider">
              <th className="px-5 py-3">File Name</th><th className="px-5 py-3">Size</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Last Modified</th><th className="px-5 py-3 text-right">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {files.map(f => (
                <tr key={f.name} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-800">{f.name}</td>
                  <td className="px-5 py-3 text-xs text-gray-400">{formatSize(f.metadata?.size)}</td>
                  <td className="px-5 py-3 text-xs text-gray-400">{f.metadata?.mimetype || '—'}</td>
                  <td className="px-5 py-3 text-xs text-gray-400">{f.updated_at ? new Date(f.updated_at).toLocaleString() : '—'}</td>
                  <td className="px-5 py-3 text-right flex gap-1 justify-end">
                    <a href={getPublicUrl(f.name)} target="_blank" rel="noreferrer" className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded font-bold">🔗 URL</a>
                    <button onClick={() => deleteFile(f.name)} className="text-red-400 hover:text-red-600">🗑️</button>
                  </td>
                </tr>
              ))}
              {files.length === 0 && <tr><td colSpan="5" className="px-5 py-10 text-center text-gray-400">No files in this bucket.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
