'use client';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/15 backdrop-blur-sm transition-opacity duration-500 overflow-hidden">
      
      {/* Soothing Wind Leaves */}
      {[...Array(8)].map((_, i) => (
        <div 
          key={i} 
          className="absolute text-xl animate-flying-leaf drop-shadow-sm opacity-60" 
          style={{ 
            top: `${Math.random() * 80 + 10}%`, 
            left: `-10%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${6 + Math.random() * 4}s`
          }}
        >
          🍃
        </div>
      ))}

      <div className="flex flex-col items-center gap-6 animate-scale-in relative z-10 p-8 rounded-[2.5rem] bg-white/40 backdrop-blur-md shadow-2xl border border-white/60">
        <div className="w-24 h-24 relative flex items-center justify-center">
            {/* The SVG animation for seed growing into a leaf */}
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
               <defs>
                 <linearGradient id="leafGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                   <stop offset="0%" stopColor="#10b981" />
                   <stop offset="100%" stopColor="#059669" />
                 </linearGradient>
               </defs>

               <g className="animate-plant-grow origin-bottom translate-y-4">
                 {/* Stem */}
                 <path d="M50 90 Q 40 70 50 40" fill="none" stroke="#059669" strokeWidth="4" strokeLinecap="round" className="animate-stem-draw" />
                 
                 {/* Left Leaf */}
                 <path d="M50 70 C 25 70 20 40 45 45 C 50 45 50 70 50 70" fill="url(#leafGrad)" className="animate-leaf-left origin-[50px_70px]" />
                 
                 {/* Right Leaf */}
                 <path d="M50 55 C 75 55 80 25 55 30 C 50 30 50 55 50 55" fill="url(#leafGrad)" className="animate-leaf-right origin-[50px_55px]" />
                 
                 {/* Top Tip Leaf */}
                 <path d="M50 40 C 35 25 65 25 50 40" fill="url(#leafGrad)" className="animate-leaf-top origin-[50px_40px]" />
               </g>

               {/* Soil/Seed */}
               <ellipse cx="50" cy="90" rx="15" ry="4" fill="#78350f" className="opacity-80" />
            </svg>
        </div>
        <p className="font-display font-black text-primary-900 uppercase tracking-[0.2em] text-xs animate-pulse">
          Crafting Purity...
        </p>
      </div>
    </div>
  );
}
