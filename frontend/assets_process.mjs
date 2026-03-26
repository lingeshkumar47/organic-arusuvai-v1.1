import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ystqgsofjpigymjuoqrl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlzdHFnc29manBpZ3ltanVvcXJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxNzk3MjQsImV4cCI6MjA4OTc1NTcyNH0.Ba5hTMCTyt_c08nb4bQqj2sKWnDO6TkSN-JCdO4U3XM';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('--- Asset Processing Script ---');
  
  // 1. Convert Logos to SVG Base64 embed
  const logoDir = 'C:\\Users\\linge\\OneDrive\\Desktop\\Project OA\\Projects\\OA\\Gallery\\Logo';
  const outLogoDir = './public/logos';
  if (!fs.existsSync(outLogoDir)) fs.mkdirSync(outLogoDir, { recursive: true });

  const files = fs.readdirSync(logoDir);
  for (const file of files) {
    if (file.toLowerCase().endsWith('.png')) {
      const raw = fs.readFileSync(path.join(logoDir, file));
      const base64 = raw.toString('base64');
      // Wrap in SVG
      const svgCode = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid meet">
        <image href="data:image/png;base64,${base64}" x="0" y="0" width="100%" height="100%" />
      </svg>`;
      const outName = file.replace(/\.png$/i, '.svg');
      fs.writeFileSync(path.join(outLogoDir, outName), svgCode);
      console.log(`Converted Logo: ${file} -> ${outName}`);
    }
  }

  // 2. Map Product Images
  const prodDir = 'C:\\Users\\linge\\OneDrive\\Desktop\\Project OA\\Projects\\OA\\Gallery\\Product Gallery';
  const outProdDir = './public/images/products';
  if (!fs.existsSync(outProdDir)) fs.mkdirSync(outProdDir, { recursive: true });

  const folders = fs.readdirSync(prodDir);
  const finalImages = {};

  for (const folder of folders) {
    const fPath = path.join(prodDir, folder);
    if (fs.statSync(fPath).isDirectory()) {
      const images = fs.readdirSync(fPath).filter(v => v.match(/\.(png|jpe?g)$/i));
      const outPaths = [];
      for (const img of images) {
        const src = path.join(fPath, img);
        const safeFolder = folder.replace(/\s+/g, '-').toLowerCase();
        const safeName = `${safeFolder}-${img.replace(/\s+/g, '-')}`;
        const dest = path.join(outProdDir, safeName);
        fs.copyFileSync(src, dest);
        outPaths.push(`/images/products/${safeName}`);
      }
      finalImages[folder] = outPaths;
    }
  }
  
  console.log('Images Copied locally:', Object.keys(finalImages));

  // 3. Map to DB Products
  const { data: products } = await supabase.from('products').select('*');
  if (!products) { console.error('Failed to load products'); return; }

  const mapToFolder = {
    'kodaikanal-wild-pepper': 'Pepper',
    'idukki-full-cardamom-pods': 'Cardamom',
    'poomparai-premium-hill-garlic': 'Garlic',
    'thandikudi-pure-hill-honey': 'Honey',
    'kodaikanal-hill-banana': 'Banana',
    'idukki-cardamom-powder': 'Cardamom' 
  };

  const imagesToInsert = [];
  
  for (const p of products) {
    const folderName = mapToFolder[p.slug];
    if (folderName && finalImages[folderName]) {
      const paths = finalImages[folderName];
      paths.forEach((imgPath, idx) => {
        imagesToInsert.push({
          product_id: p.id,
          image_url: imgPath,
          sort_order: idx
        });
      });
    }
  }

  const { error: insErr } = await supabase.from('product_images').insert(imagesToInsert);
  if (insErr) {
    console.error('Failed to insert images info into DB:', insErr);
  } else {
    console.log(`Inserted ${imagesToInsert.length} image records into DB.`);
  }

  console.log('Asset processing complete.');
}

run();
