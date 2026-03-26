import Link from 'next/link';
import ProductCard from '../../components/ProductCard';

export default function OurStoryPage() {
  return (
    <div className="bg-white min-h-screen pt-24 pb-32 overflow-hidden">
      {/* Cinematic Hero */}
      <section className="relative px-4 mb-24 lg:mb-40">
        <div className="max-w-7xl mx-auto rounded-[3rem] sm:rounded-[4rem] bg-primary-950 overflow-hidden relative shadow-float pt-32 pb-40 px-6 sm:px-16 text-center lg:text-left flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-mesh-1 opacity-20 pointer-events-none" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cta-500/20 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="relative z-10 max-w-4xl mx-auto">
             <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full glass-panel-dark text-xs font-black text-cta-400 tracking-widest uppercase mb-8 mx-auto animate-fade-in pointer-events-none">
                <span className="w-2 h-2 rounded-full bg-cta-500 animate-pulse" />
                Est. 2026
             </div>
             
             <h1 className="font-display font-black text-5xl sm:text-7xl lg:text-8xl text-white tracking-tight leading-[1] mb-8 animate-fade-in-up delay-100 text-center">
               Rooted in the <br/><span className="text-cta-400">Ghats.</span>
             </h1>
             
             <h2 className="text-2xl font-bold text-primary-600 mb-2 max-w-md bg-white/50 py-3 px-6 rounded-2xl shadow-inner border border-white">
            For Choosing Organic Arusuvai
         </h2>
         
         {/* Lisa AI Bridge */}
         <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-lisa'))}
            className="flex items-center gap-3 bg-cta-500/10 text-cta-700 px-6 py-3 rounded-full border border-cta-500/20 hover:bg-cta-500/20 transition-all font-black text-xs uppercase tracking-widest mb-8 animate-bounce-slow"
         >
            <span>🌿</span> Learn Benefits & Recipes from Lisa AI
         </button>
             <p className="text-lg sm:text-2xl text-primary-100/90 font-medium mb-0 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200 text-center">
               Organic Arusuvai is a commitment to native farmers, pure heirloom soil, and bringing unadulterated flavors straight from the high hills of Kodaikanal and Idukki to your kitchen.
             </p>
          </div>
        </div>
      </section>

      {/* Visual Timeline Section */}
      <section className="max-w-5xl mx-auto px-4 mb-32">
        <div className="flex flex-col gap-24 relative">
          
           {/* Step 1 */}
           <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-24 group">
             <div className="w-full md:w-1/2 rounded-[3rem] bg-gray-50 aspect-square flex items-center justify-center text-[180px] drop-shadow-2xl shadow-float transition-transform duration-1000 group-hover:scale-105 border border-gray-100 overflow-hidden relative">
                <div className="absolute inset-0 bg-primary-900/5 mix-blend-multiply" />
                🌱
             </div>
             <div className="w-full md:w-1/2">
               <h2 className="font-display font-black text-4xl text-primary-900 tracking-tight mb-6">Born from genuine agricultural passion.</h2>
               <p className="text-xl text-gray-500 font-medium leading-relaxed">
                 We witnessed firsthand how markets dilute authentic spices. The vibrant aroma of native Cardamom and raw hill-garlic was being lost to commercial processing.
               </p>
             </div>
           </div>

           {/* Step 2 */}
           <div className="flex flex-col md:flex-row-reverse items-center gap-12 lg:gap-24 group">
             <div className="w-full md:w-1/2 rounded-[3rem] bg-primary-50 aspect-square flex items-center justify-center text-[180px] drop-shadow-2xl shadow-float transition-transform duration-1000 group-hover:scale-105 border border-primary-100 overflow-hidden relative">
                <div className="absolute inset-0 bg-cta-500/10 mix-blend-multiply" />
                ⛰️
             </div>
             <div className="w-full md:w-1/2">
               <h2 className="font-display font-black text-4xl text-primary-900 tracking-tight mb-6">Sourced exclusively from single-origin hills.</h2>
               <p className="text-xl text-gray-500 font-medium leading-relaxed">
                 By bridging the gap between small-scale Kodaikanal farmers and your pantry, we empower local tribal agriculture while ensuring total chemical-free purity.
               </p>
             </div>
           </div>

        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="max-w-7xl mx-auto px-4">
         <div className="glass-panel text-center py-20 lg:py-32 rounded-[4rem] border-2 border-primary-500 shadow-float relative overflow-hidden bg-primary-900">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cta-500/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/20 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative z-10 max-w-3xl mx-auto px-6">
              <span className="text-6xl drop-shadow-xl mb-8 inline-block animate-float">✨</span>
              <h2 className="font-display font-black text-4xl sm:text-6xl text-white tracking-tight leading-tight mb-8">
                The Arusuvai <span className="text-cta-400">Promise.</span>
              </h2>
              <p className="text-xl text-primary-100/90 font-medium leading-relaxed mb-12">
                Every jar of honey, every crushed pepper pod, and every banana delivered is fully traceable, completely organic, and sealed with our strict zero-preservative guarantee.
              </p>
               <Link href="/category/all" className="btn-cta !px-12 !py-5 !text-xl !rounded-2xl">
                Taste the Difference Today
              </Link>
            </div>
         </div>
      </section>

      {/* Venture with Us Section */}
      <section className="max-w-4xl mx-auto px-4 mt-32">
         <div className="bg-gray-50 rounded-[3rem] p-10 sm:p-16 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-100/50 rounded-full -mr-20 -mt-20 blur-2xl" />
            
            <div className="text-center mb-12">
               <h2 className="font-display font-black text-4xl text-primary-950 tracking-tight mb-4">Venture with Us</h2>
               <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Partner as a Vendor</p>
            </div>

            <div className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Your Name" className="input-premium !bg-white !rounded-2xl" />
                  <input type="email" placeholder="Business Email" className="input-premium !bg-white !rounded-2xl" />
               </div>
               <input type="text" placeholder="Farm / Brand Name" className="input-premium !bg-white !rounded-2xl" />
               <textarea placeholder="Tell us about your organic harvests..." className="input-premium !bg-white !rounded-2xl min-h-[120px] resize-none" />
               
               <div className="p-6 bg-primary-100/30 rounded-3xl border border-primary-100/50 flex items-center gap-4">
                  <span className="text-2xl animate-pulse">📞</span>
                  <p className="text-xs text-primary-900 font-bold leading-relaxed">
                     Our team will contact you back shortly within our business hours <span className="text-primary-700">10:00 AM to 8:00 PM IST</span>.
                  </p>
               </div>

               <button className="w-full btn-primary !py-5 shadow-glow shadow-primary-500/20 !rounded-2xl">Register as Vendor</button>
            </div>
         </div>
      </section>

    </div>
  );
}
