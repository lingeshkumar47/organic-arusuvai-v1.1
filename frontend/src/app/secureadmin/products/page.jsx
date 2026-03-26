'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';

const variantOptions = ['100g', '200g', '250g', '500g', '1kg', '2kg', '5kg'];

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML && value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const exec = (cmd, arg=null) => { document.execCommand(cmd, false, arg); editorRef.current.focus(); onChange(editorRef.current.innerHTML); };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white flex flex-col focus-within:border-primary-400 focus-within:ring-1 focus-within:ring-primary-400 transition">
      <div className="flex bg-gray-50 border-b border-gray-200 p-2 gap-1 flex-wrap items-center">
        <button tabIndex="-1" type="button" onClick={(e) => { e.preventDefault(); exec('bold'); }} className="w-7 h-7 font-bold border rounded bg-white hover:bg-gray-100 shadow-sm text-sm">B</button>
        <button tabIndex="-1" type="button" onClick={(e) => { e.preventDefault(); exec('italic'); }} className="w-7 h-7 italic border rounded bg-white hover:bg-gray-100 shadow-sm text-sm">I</button>
        <button tabIndex="-1" type="button" onClick={(e) => { e.preventDefault(); exec('underline'); }} className="w-7 h-7 underline border rounded bg-white hover:bg-gray-100 shadow-sm text-sm">U</button>
        <div className="w-px bg-gray-300 mx-1 h-5"></div>
        <button tabIndex="-1" type="button" onClick={(e) => { e.preventDefault(); exec('insertUnorderedList'); }} className="w-7 h-7 flex items-center justify-center border rounded bg-white hover:bg-gray-100 shadow-sm text-[10px]">●</button>
        <button tabIndex="-1" type="button" onClick={(e) => { e.preventDefault(); exec('insertOrderedList'); }} className="w-7 h-7 flex items-center justify-center border rounded bg-white hover:bg-gray-100 shadow-sm text-xs font-serif font-bold">1.</button>
        <div className="w-px bg-gray-300 mx-1 h-5"></div>
        <button tabIndex="-1" type="button" onClick={(e) => { e.preventDefault(); exec('formatBlock', 'H1'); }} className="px-2 h-7 border rounded bg-white hover:bg-gray-100 shadow-sm text-xs font-bold">Heading</button>
        <button tabIndex="-1" type="button" onClick={(e) => { e.preventDefault(); exec('formatBlock', 'H3'); }} className="px-2 h-7 border rounded bg-white hover:bg-gray-100 shadow-sm text-[11px] font-bold">Subhead</button>
        <button tabIndex="-1" type="button" onClick={(e) => { e.preventDefault(); exec('formatBlock', 'P'); }} className="px-2 h-7 border rounded bg-white hover:bg-gray-100 shadow-sm text-xs">Normal</button>
      </div>
      <div 
        ref={editorRef}
        className="p-4 outline-none min-h-[250px] text-sm max-w-none" 
        contentEditable 
        onInput={e => onChange(e.currentTarget.innerHTML)} 
      />
    </div>
  );
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Form State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    category_id: '',
    base_price: 0,
    discount_price: 0,
    is_active: true,
    is_featured: false
  });
  
  const [selectedImages, setSelectedImages] = useState([]); // File objects
  const [previewImages, setPreviewImages] = useState([]);   // Preview URLs
  const [existingImages, setExistingImages] = useState([]); // URLs from database
  
  const [productVariants, setProductVariants] = useState([
    { name: '100g', mrp_price: 0, price: 0, stock: 0 },
    { name: '250g', mrp_price: 0, price: 0, stock: 0 },
    { name: '500g', mrp_price: 0, price: 0, stock: 0 },
    { name: '1kg', mrp_price: 0, price: 0, stock: 0 },
  ]);

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    setLoading(true);
    const { data: prods } = await supabase.from('products').select('*, categories(*)');
    const { data: cats } = await supabase.from('categories').select('*');
    if (prods) setProducts(prods);
    if (cats) setCategories(cats);
    setLoading(false);
  }

  async function handleAddProduct() {
      // Create guaranteed unique slug
      const nameSlug = (formData.name || 'product').toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
      const uniqueSuffix = Date.now().toString().slice(-6);
      const finalSlug = `${nameSlug}-${uniqueSuffix}`;
      
      // 1. Insert Product
      const productPayload = { ...formData, slug: finalSlug };
      
      let res;
      if (isEditing) {
          res = await supabase.from('products').update(productPayload).eq('id', currentProductId).select().single();
      } else {
          res = await supabase.from('products').insert(productPayload).select().single();
      }

      const { data: product, error: pError } = res;
      if (pError) return alert("Product Error: " + pError.message);

      const pid = product.id;

      // 2. Handle Variants
      // First clear existing if editing
      if (isEditing) await supabase.from('product_variants').delete().eq('product_id', pid);
      
      const variantsToSave = productVariants.filter(v => v.price > 0).map(v => ({
           product_id: pid,
           name: v.name,
           mrp_price: v.mrp_price || v.price,
           price: v.price,
           stock: v.stock
      }));
      if (variantsToSave.length > 0) {
          await supabase.from('product_variants').insert(variantsToSave);
      }

      // 3. Handle Images
      // In a real app we'd upload then save URLs. Let's do a simplified upload loop
      const uploadedUrls = [];
      for (const file of selectedImages) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${pid}-${Math.random()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('products').upload(fileName, file);
          if (!uploadError) {
              const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
              uploadedUrls.push({ product_id: pid, image_url: publicUrl });
          }
      }
      if (uploadedUrls.length > 0) {
          await supabase.from('product_images').insert(uploadedUrls);
      }

      setShowModal(false);
      resetForm();
      fetchInitialData();
  }

  function resetForm() {
    setFormData({ name: '', slug: '', description: '', category_id: '', base_price: 0, discount_price: 0, is_active: true, is_featured: false });
    setSelectedImages([]);
    setPreviewImages([]);
    setExistingImages([]);
    setProductVariants([
        { name: '100g', mrp_price: 0, price: 0, stock: 0 },
        { name: '250g', mrp_price: 0, price: 0, stock: 0 },
        { name: '500g', mrp_price: 0, price: 0, stock: 0 },
        { name: '1kg', mrp_price: 0, price: 0, stock: 0 },
      ]);
      setIsEditing(false);
      setCurrentProductId(null);
  }

  const handleImageChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(prev => [...prev, ...files]);
      const previews = files.map(f => URL.createObjectURL(f));
      setPreviewImages(prev => [...prev, ...previews]);
    }
  };

  async function editProduct(p) {
      setIsEditing(true);
      setCurrentProductId(p.id);
      setFormData({
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          category_id: p.category_id,
          base_price: p.base_price || 0,
          discount_price: p.discount_price || 0,
          is_active: p.is_active,
          is_featured: p.is_featured
      });
      // Fetch variations
      const { data: vars } = await supabase.from('product_variants').select('*').eq('product_id', p.id);
      if (vars && vars.length > 0) {
          setProductVariants(vars);
      }
      // Fetch images
      const { data: imgs } = await supabase.from('product_images').select('*').eq('product_id', p.id);
      if (imgs) setExistingImages(imgs.map(i => i.image_url));

      // Fetch reviews
      const { data: revs } = await supabase.from('reviews').select('*').eq('product_id', p.id);
      if (revs) setReviews(revs);

      setShowModal(true);
  }

  async function deleteProduct(id) {
      if (confirm("Permanently delete this product?")) {
          await supabase.from('products').delete().eq('id', id);
          fetchInitialData();
      }
  }

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Catalogue Manager</h1>
          <p className="text-sm text-gray-500">{products.length} active items in your inventory</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary shadow-lg shadow-primary-200">+ New Product</button>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50/30 flex gap-4">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search catalog..." className="w-full max-w-md px-4 py-2.5 border border-gray-200 rounded-xl text-sm transition focus:border-primary-400 focus:ring-0 outline-none" />
        </div>
        <div className="overflow-x-auto text-sm">
          <table className="w-full">
            <thead><tr className="text-left text-gray-400 bg-gray-50/50">
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Product / ID</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Category</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Price Point</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px]">Visibility</th>
              <th className="px-6 py-4 font-semibold uppercase tracking-wider text-[10px] text-right">Settings</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">Loading catalog...</td></tr>
              ) : filtered.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-400">No products found matching "{search}"</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="group hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl border border-primary-100">🌿</div>
                      <div>
                        <p className="font-bold text-gray-800">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">#{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 font-medium">{p.categories?.name || 'Uncategorized'}</td>
                  <td className="px-6 py-4">
                    <span className="line-through text-gray-400 text-xs">₹{p.base_price}</span>
                    <span className="font-bold text-gray-900 ml-1">₹{p.discount_price || p.base_price}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {p.is_active ? 'Active' : 'Offline'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={() => editProduct(p)} className="p-2 bg-gray-100 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition">⚙️</button>
                      <button onClick={() => deleteProduct(p.id)} className="p-2 bg-red-50 text-red-400 rounded-lg hover:bg-red-100 hover:text-red-700 transition">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative animate-slide-up">
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-2xl text-gray-400 hover:text-gray-900 transition">✕</button>
            <div className="p-8">
              <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">{isEditing ? 'Editing Product' : 'Register New Product'}</h2>
              <p className="text-gray-500 text-sm mb-8">Maintain your premium inventory with full media and variant control</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Information Side */}
                <div className="space-y-6">
                   <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Display Name</label>
                     <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Pure Organic Turmeric" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-primary-400 focus:bg-white transition" />
                   </div>
                   
                   <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Detailed Narration (Rich Format)</label>
                     <RichTextEditor value={formData.description} onChange={val => setFormData({...formData, description: val})} />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-2">Category</label>
                       <div className="flex gap-2">
                         <select value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="flex-1 px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-primary-400 focus:bg-white transition appearance-none">
                           <option value="">Select Category</option>
                           {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                         </select>
                         <button 
                           onClick={async () => {
                             const newCat = prompt("Enter new Category name:");
                             if (newCat) {
                               const slug = newCat.toLowerCase().replace(/ /g, '-');
                               const { data, error } = await supabase.from('categories').insert({ name: newCat, slug }).select().single();
                               if (error) alert("Error adding category: " + error.message);
                               else {
                                 setCategories(prev => [...prev, data]);
                                 setFormData({...formData, category_id: data.id});
                               }
                             }
                           }}
                           className="p-3 bg-primary-100 text-primary-700 rounded-xl hover:bg-primary-600 hover:text-white transition shadow-sm"
                           title="Add New Category"
                         >
                           +
                         </button>
                         {formData.category_id && (
                           <button 
                             onClick={async () => {
                               if (confirm("Permanently remove this category? Products in this category will be uncategorized.")) {
                                 const { error } = await supabase.from('categories').delete().eq('id', formData.category_id);
                                 if (error) alert(error.message);
                                 else {
                                   const deletedId = formData.category_id;
                                   setCategories(prev => prev.filter(c => c.id != deletedId));
                                   setFormData({...formData, category_id: ''});
                                 }
                               }
                             }}
                             className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition shadow-sm"
                             title="Delete Selected Category"
                           >
                             ✕
                           </button>
                         )}
                       </div>
                     </div>
                     <div>
                       <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Pricing Setup</label>
                       <div className="flex gap-2">
                         <div className="relative w-1/2">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs line-through">MRP: ₹</span>
                           <input type="number" title="MRP (Striked Price)" value={formData.base_price} onChange={e => setFormData({...formData, base_price: e.target.value})} className="w-full pl-12 pr-2 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-red-400 focus:bg-white transition text-xs" />
                         </div>
                         <div className="relative w-1/2">
                           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 font-bold text-xs">Sell: ₹</span>
                           <input type="number" title="Actual Selling Price" value={formData.discount_price} onChange={e => setFormData({...formData, discount_price: e.target.value})} className="w-full pl-12 pr-2 py-3 bg-green-50/30 border border-green-200 rounded-xl outline-none focus:border-green-500 focus:bg-white transition text-xs font-bold text-gray-900" />
                         </div>
                       </div>
                     </div>
                   </div>

                   {/* Media Manager */}
                   <div>
                     <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Product Media (4-8 Images)</label>
                     <p className="text-[10px] text-gray-400 mb-3">Add premium high-res captures of your product</p>
                     
                     <div className="grid grid-cols-4 gap-2 mb-4">
                        {existingImages.map((src, idx) => (
                           <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-100 relative group">
                             <img src={src} className="w-full h-full object-cover" />
                             <div className="absolute inset-0 bg-red-500/80 hidden group-hover:flex items-center justify-center cursor-pointer text-white text-xs font-bold">REMOVE</div>
                           </div>
                        ))}
                        {previewImages.map((src, idx) => (
                           <div key={idx} className="aspect-square bg-emerald-50 rounded-lg overflow-hidden border border-emerald-100 animate-pulse">
                             <img src={src} className="w-full h-full object-cover" />
                           </div>
                        ))}
                        <label className="border-2 border-dashed border-gray-200 aspect-square rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition">
                           <span className="text-xl">📸</span>
                           <span className="text-[9px] font-bold text-gray-400">UPLOAD</span>
                           <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                     </div>
                   </div>
                </div>

                {/* Logistics Side */}
                <div className="space-y-6">
                   <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">Variants & Specific Pricing</label>
                      <div className="space-y-3">
                         {productVariants.map((v, i) => (
                           <div key={i} className="flex items-center gap-2 bg-white p-2.5 rounded-xl border border-gray-100">
                             <select value={v.name} onChange={e => {
                               const copy = [...productVariants];
                               copy[i].name = e.target.value;
                               setProductVariants(copy);
                             }} className="bg-gray-50 px-2 py-1.5 rounded-lg text-xs outline-none">
                               {variantOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                             </select>
                             <div className="flex bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-1">
                               <input type="number" title="MRP Price (Strikethrough)" placeholder="MRP" value={v.mrp_price} onChange={e => {
                                 const copy = [...productVariants];
                                 copy[i].mrp_price = e.target.value;
                                 setProductVariants(copy);
                               }} className="w-16 px-2 py-1.5 text-xs outline-none bg-gray-50 border-r border-gray-200 text-gray-500 line-through" />
                               <input type="number" title="Selling Price" placeholder="Sell Price" value={v.price} onChange={e => {
                                 const copy = [...productVariants];
                                 copy[i].price = e.target.value;
                                 setProductVariants(copy);
                               }} className="w-20 px-2 py-1.5 text-xs outline-none focus:bg-white font-bold text-gray-900" />
                             </div>
                             <input type="number" title="Stock Quantity" placeholder="Stock" value={v.stock} onChange={e => {
                               const copy = [...productVariants];
                               copy[i].stock = e.target.value;
                               setProductVariants(copy);
                             }} className="w-16 px-2 py-1.5 border-b border-gray-100 text-xs outline-none" />
                             <button onClick={() => setProductVariants(productVariants.filter((_, idx)=> idx !== i))} className="text-gray-300 hover:text-red-500">✕</button>
                           </div>
                         ))}
                         {productVariants.length < 5 && (
                           <button onClick={() => setProductVariants([...productVariants, { name: '250g', mrp_price: 0, price: 0, stock: 0 }])} className="text-[10px] font-bold text-primary-600 hover:underline">+ ADD ANOTHER VARIANT</button>
                         )}
                      </div>
                   </div>

                   {/* Visibility Controls */}
                   <div className="flex gap-4">
                      <label className="flex-1 flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl cursor-pointer">
                        <span className="text-sm font-bold text-gray-700">Online Status</span>
                        <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} className="w-5 h-5 accent-green-600 rounded" />
                      </label>
                      <label className="flex-1 flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl cursor-pointer">
                        <span className="text-sm font-bold text-gray-700">Featured</span>
                        <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="w-5 h-5 accent-amber-500 rounded" />
                      </label>
                   </div>

                   {/* Feedbacks Display (if editing) */}
                   {isEditing && reviews.length > 0 && (
                     <div className="bg-primary-50/50 p-6 rounded-3xl border border-primary-100">
                       <label className="text-xs font-bold text-primary-600 uppercase tracking-widest block mb-4">Proud Customer Feedback</label>
                       <div className="max-h-48 overflow-y-auto space-y-3">
                          {reviews.map(r => (
                            <div key={r.id} className="bg-white p-3 rounded-xl border border-primary-100 flex flex-col gap-1">
                               <div className="flex justify-between items-center text-[10px]">
                                 <span className="font-bold text-gray-900">{r.user_name}</span>
                                 <span className="text-primary-500">{'★'.repeat(r.rating)}</span>
                               </div>
                               <p className="text-[10px] text-gray-500 italic">"{r.comment}"</p>
                            </div>
                          ))}
                       </div>
                     </div>
                   )}
                </div>

              </div>

              <div className="mt-10 flex gap-4">
                <button onClick={handleAddProduct} className="flex-1 btn-primary py-4 text-base font-bold shadow-xl shadow-primary-500/20">
                  {isEditing ? 'COMMIT CHANGES' : 'DEPLOY TO STORE'}
                </button>
                <button onClick={() => setShowModal(false)} className="px-8 py-4 border border-gray-200 text-gray-500 rounded-2xl font-bold hover:bg-gray-50 transition">DISCARD</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
