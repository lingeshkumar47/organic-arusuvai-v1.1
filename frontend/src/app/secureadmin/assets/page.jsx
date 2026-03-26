'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function AssetsPage() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { fetchAssets(); }, []);

  async function fetchAssets() {
    setLoading(true);
    const { data: imgs } = await supabase.from('product_images').select('*, products(name)').order('sort_order');
    setImages(imgs || []);
    setLoading(false);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const fileName = `asset_${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage.from('product-images').upload(fileName, file);
    if (error) { alert(error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
    alert(`Uploaded! URL: ${urlData.publicUrl}`);
    setUploading(false);
    fetchAssets();
  }

  async function deleteImage(id) {
    if (confirm('Delete this image record?')) { await supabase.from('product_images').delete().eq('id', id); fetchAssets(); }
  }

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-gray-900">Asset Gallery</h1><p className="text-sm text-gray-500">Browse and manage all product images and media assets.</p></div>
        <label className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold cursor-pointer hover:bg-black transition shadow-md">
          📤 Upload Asset
          <input type="file" accept="image/*,video/*" onChange={handleUpload} className="hidden" />
        </label>
      </div>

      {uploading && <div className="p-4 bg-blue-50 rounded-xl text-sm text-blue-700 mb-4 animate-pulse">Uploading asset...</div>}

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {loading ? <div className="p-10 text-center text-gray-400">Loading assets...</div> : images.length === 0 ? (
          <div className="p-10 text-center text-gray-400"><span className="text-4xl block mb-3">🖼️</span>No assets found. Upload images or add products to see them here.</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.map(img => (
              <div key={img.id} className="group relative rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition">
                <img src={img.image_url} alt={img.alt_text || 'Product'} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-end p-2">
                  <div className="flex-1">
                    <p className="text-[10px] text-white truncate">{img.products?.name || 'Unlinked'}</p>
                  </div>
                  <button onClick={() => deleteImage(img.id)} className="text-red-300 hover:text-red-400 text-sm">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
