'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const [leaves, setLeaves] = useState([]);
  
  useEffect(() => {
    // Generate 45 leaves with random properties mapping to the globals CSS animations
    const newLeaves = Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // vw
      delay: Math.random() * 8, // s
      duration: 6 + Math.random() * 6, // s
      scale: 0.4 + Math.random() * 1.5, // scale
      rotation: Math.random() * 360, // deg
      isDark: Math.random() > 0.5
    }));
    setLeaves(newLeaves);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-primary-50 flex items-center justify-center pt-24 pb-20">
      {/* Falling Leaves Background Engine */}
      {leaves.map(leaf => (
        <div 
          key={leaf.id}
          className="absolute text-3xl opacity-60 pointer-events-none animate-flying-leaf z-0 mix-blend-multiply"
          style={{
            left: `${leaf.x}vw`,
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
            transform: `scale(${leaf.scale}) rotate(${leaf.rotation}deg)`,
            top: '-10vh'
          }}
        >
          {leaf.isDark ? '🍃' : '🌿'}
        </div>
      ))}

      {/* Main Content Modal */}
      <div className="relative z-10 glass-panel-heavy p-10 md:p-16 rounded-[3.5rem] shadow-float max-w-2xl text-center border-2 border-primary-100 animate-scale-in flex flex-col items-center">
         
         {/* Plant Growing Animation Container */}
         <div className="w-40 h-40 mx-auto mb-10 relative flex items-end justify-center perspective-[1000px]">
            <div className="absolute w-3/4 h-3/4 border-b-8 border-primary-900/10 rounded-full animate-pulse blur-xl"></div>
            <div className="text-[100px] animate-plant-grow origin-bottom relative z-10 drop-shadow-2xl">🌱</div>
         </div>

         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel-heavy text-xs font-black text-cta-600 tracking-widest uppercase mb-8 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-cta-500 animate-pulse" />
            Order Confirmed
         </div>

         <h1 className="font-display font-black text-5xl md:text-6xl text-primary-950 mb-6 tracking-tight drop-shadow-sm">
            Thank You!
         </h1>
         <h2 className="text-2xl font-bold text-primary-600 mb-8 max-w-md bg-white/50 py-3 px-6 rounded-2xl shadow-inner border border-white">
            For Choosing Organic Arusuvai
         </h2>
         
         <p className="text-gray-600 font-medium mb-12 leading-relaxed text-base md:text-lg max-w-lg">
           Your harvest will be processed and shipped directly from Farm to Home shortly. We ensure the highest purity and care in every dispatch.
         </p>
         
         <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full">
           <a 
              href="https://wa.me/918056106136?text=Hi!%20I%20just%20placed%20an%20order%20and%20had%20a%20query." 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-glass !bg-[#25D366] !text-white !border-[#128C7E] flex items-center gap-3 w-full sm:w-auto justify-center group hover:scale-[1.03] transition-transform !rounded-[1.5rem] !py-4 shadow-[0_10px_20px_rgba(37,211,102,0.3)]"
           >
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png" alt="WA" className="w-6 h-6 group-hover:animate-bounce" />
              Reach out on WhatsApp
           </a>
           <Link href="/" className="btn-primary w-full sm:w-auto !px-[3rem] !py-4 !rounded-[1.5rem] shrink-0 text-center shadow-glow font-black">
              Back to Home
           </Link>
         </div>
      </div>
    </div>
  );
}
