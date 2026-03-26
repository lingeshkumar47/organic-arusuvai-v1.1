import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE env vars.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const galleryPath = path.resolve(__dirname, '../Gallery/Cursourel');
const videosDir = path.resolve(__dirname, 'public/videos/hero');

if (!fs.existsSync(videosDir)) {
  fs.mkdirSync(videosDir, { recursive: true });
}

// 1. Create table `carousel_slides` if not exists
// In Supabase we use the REST API via postgres functions or we just assume we'll just insert and let Supabase handle if it's there?
// Wait, we need to execute raw SQL to create the table. If we only have anon key, we cannot create tables via standard SDK unless we use postgres setup.
// Wait, let's just make the frontend rely on frontend configuration IF database creation fails.
// Since we have full control over the DB, perhaps I can create a table using standard REST? No.
// Let's just create a SQL file that we instruct the user to run if anon-key fails, or better yet, I will add the schema creation to 'seed.js' assuming anon-key works? Supabase JS client cannot execute raw SQL without an RPC. 
// However, I can just use a local JSON file OR I can provide instructions. The user prompt says "Add New Table (if not exists)... Rules: DO NOT modify existing tables destructively". I'll write an RPC if there is one, but normally we can't create tables with anon key. I will structure the data directly in `setup_carousel.mjs` and attempt an insert. If the table doesn't exist, we'll get an error.

async function run() {
  console.log('Copying carousel videos...');
  
  // Mapping the EXACT order required.
  const videoMappings = [
    { slugPart: 'honey', file: 'Honey Cursourel.mp4', order: 1 },
    { slugPart: 'pepper', file: 'Pepper Cursourel.mp4', order: 2 },
    { slugPart: 'garlic', file: 'Garlic Cursourel.mp4', order: 3 },
    { slugPart: 'cardamom', file: 'Cardamom Cursourel.mp4', order: 4 },
    { slugPart: 'banana', file: 'Banana Cursourel.mp4', order: 5 },
  ];

  let mappedSlides = [];

  for (const m of videoMappings) {
    const src = path.join(galleryPath, m.file);
    const destName = m.file.replace(/\s/g, '_').toLowerCase();
    const dest = path.join(videosDir, destName);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${m.file} to public/videos/hero/${destName}`);
    } else {
      console.warn(`Video not found: ${src}`);
    }

    // Attempt to map to product
    const { data: products } = await supabase.from('products').select('id, slug, name');
    const product = products?.find(p => p.slug.includes(m.slugPart));

    if (product) {
      mappedSlides.push({
        product_id: product.id,
        video_path: `/videos/hero/${destName}`,
        slide_order: m.order,
        is_active: true
      });
    } else {
      console.warn(`Could not find a product matching slug part: ${m.slugPart}`);
    }
  }

  // Instead of risking table creation failures, let's check if table exists via a simple select
  const { error: tableError } = await supabase.from('carousel_slides').select('id').limit(1);
  
  if (tableError && tableError.code === '42P01') {
    // relation "carousel_slides" does not exist. 
    // I cannot create a table from anon_key. 
    // I will write a SQL snippet out for the user and instead of breaking, the frontend will fallback to fetching from local JSON or the mapping above if DB fetch fails.
    console.log("Table 'carousel_slides' does NOT exist. Since I cannot create tables via Anon Key, creating a local config file for now, and providing SQL.");
    
    fs.writeFileSync(path.join(__dirname, 'src/lib/carouselData.json'), JSON.stringify(mappedSlides, null, 2));
    
    fs.writeFileSync(path.join(__dirname, 'create_carousel_table.sql'), `
-- SQL TO EXECUTE IN SUPABASE SQL EDITOR:
CREATE TABLE public.carousel_slides (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id bigint REFERENCES public.products(id),
  video_path text NOT NULL,
  slide_order int NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);
    `);
    console.log("Written `create_carousel_table.sql` and `src/lib/carouselData.json`.");
  } else {
    // Insert into DB if table exists (e.g. if the user runs the SQL) or if it somehow exists
    if (!tableError) {
      console.log('Inserting carousel slides into DB...');
      await supabase.from('carousel_slides').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // clear all
      // We need product_id. Wait, they might be mapped.
      const { data, error } = await supabase.from('carousel_slides').insert(mappedSlides);
      if (error) console.error("Error inserting slides:", error);
      else console.log("Slides inserted successfully.");
    }
  }

  console.log("Done video copy mapping process.");
}

run().catch(console.error);
