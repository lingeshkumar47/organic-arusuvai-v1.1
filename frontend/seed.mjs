import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ystqgsofjpigymjuoqrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdHFnc29manBpZ3ltanVvcXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzk3MjQsImV4cCI6MjA4OTc1NTcyNH0.Ba5hTMCTyt_c08nb4bQqj2sKWnDO6TkSN-JCdO4U3XM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Clearing old data...');
  const { error: e3 } = await supabase.from('reviews').delete().gte('id', 0);
  const { error: e4 } = await supabase.from('product_variants').delete().gte('id', 0);
  const { error: e5 } = await supabase.from('product_images').delete().gte('id', 0);
  const { error: e6 } = await supabase.from('products').delete().gte('id', 0);
  const { error: e7 } = await supabase.from('categories').delete().gte('id', 0);

  console.log('Errors during clear:', e3?.message, e4?.message, e5?.message, e6?.message, e7?.message);

  console.log('Inserting Categories...');
  const cats = [
    { name: 'Spice', slug: 'spice', description: 'Premium spices from the hills' },
    { name: 'Farm Products', slug: 'farm-products', description: 'Fresh farm produce' },
    { name: 'Ready Mixes', slug: 'ready-mixes', description: 'Authentic ready mixes' }
  ];
  const { data: catData, error: catErr } = await supabase.from('categories').insert(cats).select();
  if (catErr) { console.error('Cat Error:', catErr); return; }
  
  const catMap = {};
  catData.forEach(c => catMap[c.slug] = c.id);

  console.log('Inserting Products...');
  const productsToInsert = [
    { name: 'Kodaikanal Wild Pepper', slug: 'kodaikanal-wild-pepper', category_id: catMap['spice'], base_price: 69, is_active: true, description: 'Wild harvested black pepper from Kodaikanal hills. Intense flavor and aroma.' },
    { name: 'Idukki Full Cardamom Pods', slug: 'idukki-full-cardamom-pods', category_id: catMap['spice'], base_price: 199, is_active: true, description: 'Premium export quality full cardamom pods from Idukki known for their high essential oil content.' },
    { name: 'Poomparai Premium Hill Garlic', slug: 'poomparai-premium-hill-garlic', category_id: catMap['farm-products'], base_price: 399, is_active: true, description: 'High altitude hill garlic from Poomparai with pungent aroma and potent medicinal properties.' },
    { name: 'Thandikudi Pure Hill Honey', slug: 'thandikudi-pure-hill-honey', category_id: catMap['farm-products'], base_price: 599, is_active: true, description: 'Raw, unprocessed wild honey sourced directly from the pristine forests of Thandikudi.' },
    { name: 'Kodaikanal Hill Banana', slug: 'kodaikanal-hill-banana', category_id: catMap['farm-products'], base_price: 109, is_active: true, description: 'Nutrient-rich traditional hill bananas, naturally ripened and sourced from Kodaikanal.' },
    { name: 'Idukki Cardamom Powder', slug: 'idukki-cardamom-powder', category_id: catMap['ready-mixes'], base_price: 199, is_active: true, description: 'Finely ground powder of authentic Idukki cardamom, perfect for adding instant flavor to dishes and teas.' }
  ];

  const { data: prodData, error: prodErr } = await supabase.from('products').insert(productsToInsert).select();
  if (prodErr) { console.error('Prod Error:', prodErr); return; }
  
  const prodMap = {};
  prodData.forEach(p => prodMap[p.slug] = p.id);

  console.log('Inserting Variants...');
  const variantsToInsert = [
    { product_id: prodMap['kodaikanal-wild-pepper'], name: '100g', price: 69, mrp_price: 99, stock: 100 },
    { product_id: prodMap['kodaikanal-wild-pepper'], name: '200g', price: 139, mrp_price: 199, stock: 100 },
    { product_id: prodMap['kodaikanal-wild-pepper'], name: '500g', price: 325, mrp_price: 499, stock: 100 },
    { product_id: prodMap['kodaikanal-wild-pepper'], name: '1Kg', price: 650, mrp_price: 899, stock: 100 },

    { product_id: prodMap['idukki-full-cardamom-pods'], name: '100g', price: 199, mrp_price: 299, stock: 100 },
    { product_id: prodMap['idukki-full-cardamom-pods'], name: '200g', price: 399, mrp_price: 599, stock: 100 },
    { product_id: prodMap['idukki-full-cardamom-pods'], name: '500g', price: 949, mrp_price: 1299, stock: 100 },
    { product_id: prodMap['idukki-full-cardamom-pods'], name: '1Kg', price: 1899, mrp_price: 2499, stock: 100 },

    { product_id: prodMap['poomparai-premium-hill-garlic'], name: '500g', price: 399, mrp_price: 599, stock: 100 },
    { product_id: prodMap['poomparai-premium-hill-garlic'], name: '1Kg', price: 799, mrp_price: 1199, stock: 100 },
    { product_id: prodMap['poomparai-premium-hill-garlic'], name: '2Kg', price: 1549, mrp_price: 2199, stock: 100 },
    { product_id: prodMap['poomparai-premium-hill-garlic'], name: '5Kg', price: 3099, mrp_price: 4599, stock: 100 },

    { product_id: prodMap['thandikudi-pure-hill-honey'], name: '500ml', price: 599, mrp_price: 799, stock: 100 },
    { product_id: prodMap['thandikudi-pure-hill-honey'], name: '1L', price: 1199, mrp_price: 1599, stock: 100 },
    { product_id: prodMap['thandikudi-pure-hill-honey'], name: '2L', price: 2299, mrp_price: 2999, stock: 100 },
    
    { product_id: prodMap['kodaikanal-hill-banana'], name: '1Kg', price: 109, mrp_price: 159, stock: 100 },
    { product_id: prodMap['kodaikanal-hill-banana'], name: '2Kg', price: 199, mrp_price: 299, stock: 100 },
    { product_id: prodMap['kodaikanal-hill-banana'], name: '5Kg', price: 489, mrp_price: 699, stock: 100 },

    { product_id: prodMap['idukki-cardamom-powder'], name: '100g', price: 199, mrp_price: 299, stock: 100 },
    { product_id: prodMap['idukki-cardamom-powder'], name: '200g', price: 399, mrp_price: 599, stock: 100 },
    { product_id: prodMap['idukki-cardamom-powder'], name: '500g', price: 949, mrp_price: 1299, stock: 100 },
    { product_id: prodMap['idukki-cardamom-powder'], name: '1Kg', price: 1899, mrp_price: 2499, stock: 100 }
  ];

  const { error: varErr } = await supabase.from('product_variants').insert(variantsToInsert);
  if (varErr) { console.error('Var Error:', varErr); return; }

  console.log('Seed fully complete!');
}

run();
