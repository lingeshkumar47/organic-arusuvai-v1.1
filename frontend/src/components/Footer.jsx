'use client';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-primary-950 text-white overflow-hidden pt-20 pb-10">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cta-500/10 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-soft p-1">
                <img src="/logos/SpecialLogo.png" alt="Organic Arusuvai" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg tracking-tight leading-none uppercase">Organic<br/>Arusuvai</h3>
              </div>
            </Link>
            <p className="text-sm font-medium text-primary-200 leading-relaxed max-w-xs">
              Premium, single-origin heirloom products. A proud sole proprietorship to Mrs. Sangeetha K.
            </p>
            
            {/* Social SVGs */}
            <div className="flex gap-4">
              <a href="https://www.instagram.com/organic.arusuvai" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:-translate-y-1 transition-all text-lg shadow-sm border border-white/10 group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:text-white text-gray-300">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-blue-600 hover:-translate-y-1 transition-all text-lg shadow-sm border border-white/10 group">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:text-white text-gray-300">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              <a href="https://wa.me/918220351497" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-[#25D366] hover:-translate-y-1 transition-all text-lg shadow-sm border border-white/10 group">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 group-hover:text-white text-gray-300">
                   <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                 </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h4 className="font-bold text-sm tracking-widest text-primary-400 uppercase mb-6 drop-shadow-sm">Shop</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-300">
              <li><Link href="/category/spice" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Premium Spices</Link></li>
              <li><Link href="/category/farm-products" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Farm Direct</Link></li>
              <li><Link href="/category/ready-mixes" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Ready Mixes</Link></li>
              <li><Link href="/our-story" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Our Heritage</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-bold text-sm tracking-widest text-primary-400 uppercase mb-6">Support</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-300">
              <li><Link href="/contact" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Contact Us</Link></li>
              <li><Link href="/account" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Track Order</Link></li>
              <li><Link href="/support/shipping" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Shipping Policy</Link></li>
              <li><Link href="/support/payments" className="hover:text-white hover:translate-x-1 inline-block transition-transform">Secure Payments</Link></li>
            </ul>
          </div>

          {/* Contact Block */}
          <div>
            <h4 className="font-bold text-sm tracking-widest text-primary-400 uppercase mb-6">Connect</h4>
            <ul className="space-y-4 text-sm font-bold text-gray-300">
              <li className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <a href="https://www.google.com/maps/search/?api=1&query=17/29,+6th+main+road,+Nanganallur+Chennai+Tamilnadu" target="_blank" rel="noreferrer" className="hover:text-white transition-colors underline decoration-white/20 underline-offset-4 decoration-dashed">
                  17/29, 6th Main Road,<br/>Nanganallur, Chennai - 600061,<br/>Tamil Nadu, India
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">📞</span>
                <a href="tel:+918220351497" className="hover:text-white">+91 8220351497</a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-xl">✉️</span>
                <a href="mailto:organic.arusuvai@gmail.com" className="hover:text-white">organic.arusuvai@<wbr/>gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Certifications (New Block) */}
        <div className="mb-12 border-t border-white/10 pt-10 flex flex-col md:flex-row gap-6 justify-center">
            <Link href="/certifications/proprietorship" className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors shadow-soft">
               <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center text-2xl">👩‍💼</div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Official Verification</p>
                  <h5 className="font-bold text-white text-sm">Sole Proprietorship to Mrs. Sangeetha K</h5>
               </div>
            </Link>
            
            <Link href="/certifications/fssai" className="flex items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-colors shadow-soft">
               <div className="w-12 h-12 rounded-xl border-2 border-green-500 bg-white flex items-center justify-center p-1 font-black text-green-700 text-[10px] uppercase">
                  FSSAI
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Quality Assured</p>
                  <h5 className="font-bold text-white text-sm">FSSAI Certified Purity</h5>
               </div>
            </Link>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-primary-300/60 uppercase tracking-widest">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p>© 2026 ORGANIC ARUSUVAI. ALL RIGHTS RESERVED.</p>
            
            {/* Developer Signature */}
            <a href="https://www.instagram.com/lingeshkumar_gv/" target="_blank" rel="noreferrer" className="dev-signature flex items-center gap-1 group cursor-pointer text-gray-400 hover:text-white transition-colors">
              Made with Love (<span className="heart-icon inline-block transition-all duration-300 group-hover:animate-ping-slow drop-shadow-sm pb-px">❤️</span>) by <span className="underline decoration-white/30 underline-offset-4">Lingeshkumar Gv</span>
            </a>
          </div>
          
          <div className="flex items-center gap-6 grayscale opacity-50">
            <span>SSL Secured</span>
            <span>Razorpay Auth</span>
            <Link href="/secureadmin" className="hover:opacity-100 transition-opacity">Staff Login</Link>
          </div>
        </div>
      </div>

      {/* Inline styles for heartbeat burst */}
      <style jsx>{`
        .animate-ping-once {
          animation: heartBurst 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes heartBurst {
          0% { transform: scale(1); }
          50% { transform: scale(1.5) rotate(-5deg); filter: drop-shadow(0 0 10px rgba(239,68,68,0.8)); }
          100% { transform: scale(1.2); filter: drop-shadow(0 0 6px rgba(239,68,68,0.5)); }
        }
      `}</style>

      {/* Floating WhatsApp CTA */}
      <a 
        href="https://wa.me/918220351497" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 w-14 h-14 bg-[#25D366] text-white rounded-[1.25rem] flex items-center justify-center shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all z-[100] group"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-7 h-7 group-hover:animate-shake">
           <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
        </svg>
      </a>
    </footer>
  );
}
