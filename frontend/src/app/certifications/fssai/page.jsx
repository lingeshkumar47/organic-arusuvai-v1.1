'use client';
import Link from 'next/link';

export default function FSSAI() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-primary-600 font-bold mb-8 hover:text-primary-800 transition-colors">
          <span className="text-xl leading-none -mt-1">←</span> Back
        </Link>
        <div className="text-center mb-16">
          <div className="w-24 h-24 mx-auto border-4 border-green-500 bg-white rounded-3xl flex items-center justify-center p-2 shadow-2xl shadow-green-200 mb-8 overflow-hidden">
             <span className="font-black text-green-700 text-[20px] tracking-tight uppercase">FSSAI</span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-6xl text-primary-950 tracking-tight leading-none mb-6">FSSAI Certified Purity</h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            Organic Arusuvai adheres to the highest safety and quality standards set by the Food Safety and Standards Authority of India (FSSAI).
          </p>
        </div>

        <div className="prose prose-lg mx-auto text-gray-600 space-y-8">
          <p>
            At <strong>Organic Arusuvai</strong>, we believe that food should not only be delicious but also safe and healthy. Our FSSAI certification is a testament to our unwavering commitment to hygiene, quality, and purity.
          </p>
          
          <div className="bg-emerald-50 p-8 rounded-[2rem] border border-emerald-100 mb-8">
             <h3 className="font-display font-black text-emerald-900 text-2xl mb-4">Our Processing Standards</h3>
             <ul className="space-y-4 font-medium text-emerald-800">
               <li className="flex gap-4 items-start">
                 <span className="text-xl">✅</span>
                 <span>Direct sourcing from certified pristine organic farms.</span>
               </li>
               <li className="flex gap-4 items-start">
                 <span className="text-xl">✅</span>
                 <span>Hygienic processing environments devoid of synthetic chemicals and preservatives.</span>
               </li>
               <li className="flex gap-4 items-start">
                 <span className="text-xl">✅</span>
                 <span>Regular quality audits and standard-compliant packaging ensuring zero contamination.</span>
               </li>
             </ul>
          </div>

          <p>
            The FSSAI logo on our products is your assurance that every grain of millet, every drop of cold-pressed oil, and every pinch of spice has been rigorously checked against India's supreme food safety benchmarks. We don't just sell food; we craft health.
          </p>
        </div>
      </div>
    </div>
  );
}
