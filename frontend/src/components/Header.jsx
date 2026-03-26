'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import { getCartCount, getCartTotal, mergeGuestCart, detachCartUser } from '../lib/cart';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const [theme, setTheme] = useState('light');
  const [navBgAnim, setNavBgAnim] = useState(''); // sun-rise / sun-set class
  const [cartStats, setCartStats] = useState({ total: 0, totalMrp: 0, discount: 0, count: 0 });

  useEffect(() => {
    // Sync with HTML attribute on mount
    const root = document.documentElement;
    const initialTheme = root.getAttribute('data-theme') || 'light';
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    // Trigger the swipe animation
    const animClass = newTheme === 'dark' ? 'nav-bg-entering-dark' : 'nav-bg-entering-light';
    setNavBgAnim(animClass);
    setTimeout(() => setNavBgAnim(''), 900); // clear after animation
  };

  // Cart Burst effect Hook
  const [cartBurst, setCartBurst] = useState(false);
  const [addedItem, setAddedItem] = useState(null);
  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    const updateStats = () => {
      const stats = getCartTotal();
      setCartStats(stats);
      setCartCount(stats.count);
    };
    updateStats();
    window.addEventListener('cart-updated', updateStats);
    window.addEventListener('storage', updateStats);
    return () => {
      window.removeEventListener('cart-updated', updateStats);
      window.removeEventListener('storage', updateStats);
    };
  }, []);

  const [cartAction, setCartAction] = useState('added');
  const burstTimerRef = useRef(null);

  useEffect(() => {
    // Trigger toast if count changes (except for the very first load)
    if (prevCartCountRef.current !== undefined && cartCount !== prevCartCountRef.current) {
        const wasAdded = cartCount > prevCartCountRef.current;
        setCartAction(wasAdded ? 'added' : 'removed');
        
        // Update the addedItem preview from the actual cart
        const cart = JSON.parse(localStorage.getItem('oa_cart') || '[]');
        if (cart.length > 0) {
          // If added, show the last item in cart
          // If removed, we don't have the specific item easily, so keep previous or generic
          if (wasAdded) setAddedItem(cart[cart.length - 1]);
        }

        if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
        setCartBurst(true);
        burstTimerRef.current = setTimeout(() => setCartBurst(false), 2500);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount]);

  // Integrated Search Engine Setup
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allSearchProducts, setAllSearchProducts] = useState([]);
  const searchRef = useRef(null);

  // Prefetch search catalog securely on active search mode
  useEffect(() => {
     if (isSearchOpen && allSearchProducts.length === 0) {
        supabase.from('products').select('id, name, slug, price, categories(name)').then(({data}) => {
           if (data) setAllSearchProducts(data);
        });
     }
  }, [isSearchOpen]);

  // Faster responsive dynamic search engine filter algorithm
  useEffect(() => {
     if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
     }
     const q = searchQuery.toLowerCase();
     const hits = allSearchProducts.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.categories?.name && p.categories.name.toLowerCase().includes(q))
     );
     setSearchResults(hits.slice(0, 5)); // display top 5 rapid suggestions
  }, [searchQuery, allSearchProducts]);

  // Handle Search UI closing on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  // Location selector state
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const locationRef = useRef(null);

  // Toast Global State
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Auth logic
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session) mergeGuestCart();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (event === 'SIGNED_IN') mergeGuestCart();
      if (event === 'SIGNED_OUT') detachCartUser();
      // Force refresh cart stats upon auth change
      window.dispatchEvent(new Event('cart-updated'));
    });

    // Load saved address from localStorage
    const saved = window.localStorage.getItem('oa_delivery_address');
    if (saved) {
      setDeliveryAddress(saved);
      setAddressInput(saved);
    }

    // Toast Listener
    const handleToast = (e) => {
      setToast(e.detail);
      setTimeout(() => setToast(null), 3000);
    };
    window.addEventListener('oa-toast', handleToast);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('oa-toast', handleToast);
      subscription.unsubscribe();
    };
  }, []);

  // Close location dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (locationRef.current && !locationRef.current.contains(e.target)) {
        setIsLocationOpen(false);
      }
    };
    if (isLocationOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLocationOpen]);

  const saveAddress = () => {
    const trimmed = addressInput.trim();
    if (trimmed) {
      setDeliveryAddress(trimmed);
      window.localStorage.setItem('oa_delivery_address', trimmed);
      // Also add to saved addresses if not already there
      const existing = JSON.parse(window.localStorage.getItem('oa_saved_addresses') || '[]');
      if (!existing.some(a => a.address === trimmed)) {
        existing.push({ id: Date.now().toString(), address: trimmed, isDefault: existing.length === 0 });
        window.localStorage.setItem('oa_saved_addresses', JSON.stringify(existing));
      }
    }
    setIsLocationOpen(false);
  };

  const clearAddress = () => {
    setDeliveryAddress('');
    setAddressInput('');
    window.localStorage.removeItem('oa_delivery_address');
    setIsLocationOpen(false);
  };

  const displayAddress = deliveryAddress 
    ? (deliveryAddress.length > 18 ? deliveryAddress.slice(0, 18) + '…' : deliveryAddress)
    : (user ? 'Select Address' : 'Set Location');

  if (pathname.startsWith('/secureadmin')) return null;

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isScrolled ? 'pt-2 md:pt-4' : 'pt-4 md:pt-6'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div 
            className={`relative flex items-center justify-between px-6 transition-all duration-500 rounded-3xl overflow-hidden
            ${isScrolled ? 'glass-panel-heavy py-3 shadow-ios' : 'bg-primary-950 text-white shadow-float py-4'}`}
          >
            {/* Nav BG Image Layer — animated on theme switch */}
            <div
              aria-hidden="true"
              className={`nav-bg-layer ${navBgAnim}`}
              style={{
                backgroundImage: theme === 'dark'
                  ? "url('/images/ui/darkmodeNavBG.png')"
                  : "url('/images/ui/LightmodeNavBG.png')",
                opacity: isScrolled ? 0 : 0.85,
                transition: 'opacity 0.5s ease',
              }}
            />
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-3 group relative z-10 shrink-0">
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors 
              ${isScrolled ? 'bg-primary-50 shadow-sm' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}>
              <img src="/logos/SpecialLogo.png" alt="Organic Arusuvai" className="w-[85%] h-[85%] object-contain drop-shadow-sm" />
            </div>
               <div className="hidden sm:block transition-colors text-cta-400">
                 <h1 className="font-display font-black text-xs md:text-sm tracking-tight leading-none uppercase drop-shadow-md">ORGANIC<br/>ARUSUVAI</h1>
               </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-gray-500/10 p-1.5 rounded-full backdrop-blur-md border border-gray-500/20">
               {[
                 { name: 'Home', path: '/' },
                 { name: 'Shop Spices', path: '/category/spice' },
                 { name: 'Farm Direct', path: '/category/farm-products' },
                 { name: 'Our Story', path: '/our-story' },
               ].map(link => {
                 const isActive = pathname === link.path;
                 return (
                   <Link 
                     key={link.name} 
                     href={link.path}
                     className={`relative px-5 py-2 rounded-full text-xs font-bold transition-all duration-300
                       ${isActive ? 'text-primary-950 bg-white shadow-sm' 
                                  : isScrolled ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50' 
                                               : 'text-gray-200 hover:text-white hover:bg-white/10'}`}
                   >
                     {link.name}
                   </Link>
                 );
               })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4 relative z-10">
               {/* Location Selector — Interactive */}
               <div className="hidden lg:block relative" ref={locationRef}>
                 <button 
                   onClick={() => setIsLocationOpen(!isLocationOpen)}
                   className="flex items-center gap-2 group cursor-pointer mr-2"
                 >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-full transition-all
                      ${isScrolled ? 'bg-primary-50 text-primary-700' : 'bg-white/10 text-white'} group-hover:scale-105`}>
                      📍
                    </div>
                   <div className="flex flex-col text-left">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isScrolled ? 'text-gray-400' : 'text-white/60'}`}>Deliver to</span>
                      <span className={`text-xs font-bold truncate max-w-[120px] ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                        {displayAddress}
                      </span>
                   </div>
                 </button>

                 {/* Location Dropdown */}
                 {isLocationOpen && (
                   <div className="absolute top-full mt-3 left-0 w-80 glass-panel-heavy rounded-3xl shadow-float p-6 animate-fade-in-up border-2 border-white z-[60]">
                     <div className="flex items-center gap-3 mb-4">
                       <div className="w-10 h-10 rounded-2xl bg-cta-500/20 text-cta-600 flex items-center justify-center text-xl shrink-0">📍</div>
                       <div>
                         <h4 className="font-display font-black text-sm text-primary-900 tracking-tight">Delivery Address</h4>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Where should we deliver?</p>
                       </div>
                     </div>
                     
                     <input
                       type="text"
                       value={addressInput}
                       onChange={(e) => setAddressInput(e.target.value)}
                       onKeyDown={(e) => e.key === 'Enter' && saveAddress()}
                       placeholder="Enter your delivery address..."
                       className="input-premium !rounded-2xl mb-3 text-sm"
                       autoFocus
                     />

                     <div className="flex gap-2">
                       <button onClick={saveAddress} className="btn-primary flex-1 !py-2.5 !text-xs !rounded-xl">
                         Save Address
                       </button>
                       {deliveryAddress && (
                         <button onClick={clearAddress} className="btn-ghost !py-2.5 !text-xs !rounded-xl !px-4 text-red-500 hover:!text-red-600 hover:!bg-red-50">
                           Clear
                         </button>
                       )}
                     </div>

                     {deliveryAddress && (
                       <div className="mt-3 pt-3 border-t border-gray-100">
                         <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">Current</p>
                         <p className="text-xs font-bold text-primary-900 truncate">{deliveryAddress}</p>
                       </div>
                     )}
                   </div>
                 )}
               </div>

               {/* Search Interface System */}
               <div ref={searchRef} className={`flex items-center transition-all duration-300 relative ${isSearchOpen ? 'w-full md:w-80 max-w-[280px]' : 'w-10'}`}>
                  <button 
                   onClick={() => { setIsSearchOpen(!isSearchOpen); setSearchQuery(''); }}
                   className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors shrink-0
                   ${isScrolled ? 'text-gray-600 hover:bg-gray-100' : 'text-white hover:bg-white/10'}`}
                  >
                    🔍
                  </button>
                 {isSearchOpen && (
                   <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { router.push(`/search?q=${searchQuery}`); setIsSearchOpen(false); } }} className="w-full relative">
                     <input 
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search items, categories..." 
                      className={`ml-2 w-full bg-transparent border-b outline-none text-sm placeholder:text-gray-400 pb-1
                       ${isScrolled ? 'border-gray-200 text-gray-900' : 'border-white/30 text-white'}`}
                     />
                     
                     {searchQuery.trim().length > 0 && (
                        <div className="absolute top-[50px] left-0 md:-left-10 w-[280px] sm:w-[350px] bg-white rounded-3xl shadow-float border border-gray-100 overflow-hidden z-[200] animate-scale-in">
                           <div className="p-3 bg-gray-50 border-b border-gray-100 shrink-0">
                               <p className="text-[10px] uppercase tracking-widest font-black text-gray-400">Search Results</p>
                           </div>
                           {searchResults.length > 0 ? (
                              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                 {searchResults.map(p => (
                                    <Link key={p.id} href={`/product/${p.slug}`} className="flex items-center justify-between p-4 hover:bg-primary-50 border-b border-gray-50 transition-colors group" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
                                       <div>
                                          <p className="text-sm font-bold text-gray-900 group-hover:text-primary-600">{p.name}</p>
                                          <p className="text-[10px] uppercase font-black tracking-widest text-gray-400 group-hover:text-cta-500 transition-colors mt-1">{p.categories?.name}</p>
                                       </div>
                                       <span className="text-xs font-black text-primary-950 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm group-hover:border-primary-200">₹{p.price}</span>
                                    </Link>
                                 ))}
                                 <button type="submit" className="w-full p-4 text-xs font-bold text-primary-600 hover:bg-primary-50 transition-colors uppercase tracking-widest flex items-center justify-center gap-2">
                                     View all matching results <span>→</span>
                                 </button>
                              </div>
                           ) : (
                              <div className="p-8 text-center bg-white">
                                 <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-3xl mx-auto mb-4 border border-gray-100 shadow-sm opacity-60 grayscale">🔍</div>
                                 <h4 className="font-black text-gray-900 text-base mb-2">No matching items found</h4>
                                 <p className="text-xs text-gray-500 mb-6 font-medium leading-relaxed">We don't find any items referred to your search. Please adjust your keywords or reach out.</p>
                                 <div className="flex flex-col gap-3">
                                     <a href="https://wa.me/918056106136?text=Hi!%20I'm%20looking%20for%20a%20product%20not%20listed." target="_blank" rel="noopener noreferrer" className="btn-glass !bg-[#25D366] !text-white !border-[#128C7E] flex items-center justify-center gap-2 !py-3 !rounded-xl !text-xs shadow-[0_5px_15px_rgba(37,211,102,0.3)] hover:scale-105 transition-transform" onClick={() => setIsSearchOpen(false)}>
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/WhatsApp_icon.png" alt="WA" className="w-5 h-5" /> Reach out on WhatsApp
                                     </a>
                                     <Link href="/category/all" onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="btn-ghost !text-primary-700 !bg-primary-50 hover:!bg-primary-100 !py-3 !rounded-xl !text-xs block text-center border mr-0 border-primary-100 transition-colors font-bold flex items-center justify-center gap-2 group">
                                         Browse All Products <span className="group-hover:translate-x-1 inline-block transition-transform">→</span>
                                     </Link>
                                 </div>
                              </div>
                           )}
                        </div>
                     )}
                   </form>
                 )}
               </div>

                {/* Theme Toggle — Premium Sliding Pill */}
               <button
                 onClick={toggleTheme}
                 aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                 className="theme-toggle-pill"
               >
                 <span className="theme-toggle-thumb">
                   {theme === 'light' ? '☀️' : '🌙'}
                 </span>
               </button>

               {/* Account / User Avatar */}
                <Link href="/account" className={`w-10 h-10 md:w-12 md:h-12 rounded-[1rem] flex items-center justify-center font-bold text-sm shadow-md transition-all hover:scale-105 shrink-0 overflow-hidden border-2
                  ${isScrolled ? 'border-primary-100 bg-white text-primary-900' : 'border-white/20 bg-white/10 text-white'}`}>
                  {user ? (
                    user.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg">{user.email[0].toUpperCase()}</span>
                    )
                  ) : (
                      <span className="text-[22px]">👨‍💼</span>
                  )}
                </Link>

                {/* Cart Icon & Live Counter */}
                <div className="relative shrink-0 ml-1 md:ml-3">
                  <Link href="/cart" className="group">
                    <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-[1rem] transition-all shadow-sm
                      ${isScrolled ? 'bg-primary-50 text-primary-700 hover:bg-primary-100' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                      🛍️
                    </div>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 w-6 h-6 bg-[#ff0000] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg pointer-events-none border-2 border-white z-20 transition-transform duration-300 scale-100 overflow-hidden">
                        <span key={cartCount} className="animate-scale-in inline-block">
                          {cartCount}
                        </span>
                      </span>
                    )}
                  </Link>
                </div>
               {/* Cart Toast — Fixed near cart icon, smooth spring pop */}
               {cartBurst && (
                 <div
                   className="fixed z-[400] animate-cart-toast"
                   style={{ top: '76px', right: '1.5rem' }}
                 >
                   {/* Arrow pointing up to cart icon */}
                   <div className="absolute -top-2 right-6 w-4 h-4 rotate-45 border-t-2 border-l-2"
                        style={{ background: cartAction === 'added' ? '#022c22' : '#7f1d1d',
                                 borderColor: cartAction === 'added' ? '#10b981' : '#ef4444' }} />

                   <div
                     className="w-[280px] rounded-[1.75rem] shadow-[0_20px_50px_rgba(0,0,0,0.25)] overflow-hidden border-2"
                     style={{
                       background: cartAction === 'added'
                         ? 'linear-gradient(135deg,#022c22 0%,#064e3b 100%)'
                         : 'linear-gradient(135deg,#450a0a 0%,#7f1d1d 100%)',
                       borderColor: cartAction === 'added' ? '#10b981' : '#ef4444',
                     }}
                   >
                     {/* Top strip */}
                     <div className="flex items-center justify-between px-5 pt-4 pb-3">
                       <div className="flex items-center gap-2.5">
                         <span className="text-xl">{cartAction === 'added' ? '✅' : '🗑️'}</span>
                         <div>
                           <p className="text-white font-black text-[11px] uppercase tracking-widest leading-none">
                             {cartAction === 'added' ? 'Added to bucket' : 'Removed from bucket'}
                           </p>
                           <p className="text-white/60 text-[10px] font-medium mt-0.5 truncate max-w-[160px]">
                             {addedItem?.name || 'Item updated'}
                           </p>
                         </div>
                       </div>
                       <button
                         onClick={() => setCartBurst(false)}
                         className="text-white/40 hover:text-white text-lg leading-none transition-colors"
                       >
                         ×
                       </button>
                     </div>

                     {/* Cart value bar */}
                     <div className="mx-4 mb-3 px-4 py-2.5 rounded-2xl flex items-center justify-between"
                          style={{ background: 'rgba(255,255,255,0.08)' }}>
                       <span className="text-white/70 text-[10px] font-black uppercase tracking-wider">Cart Total</span>
                       <span className="text-white font-black text-base tracking-tight">
                         ₹{cartStats.total?.toFixed(0) || '0'}
                         <span className="text-white/50 text-[10px] font-bold ml-1">({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
                       </span>
                     </div>

                     {/* Checkout CTA */}
                     <Link
                       href="/checkout"
                       onClick={() => setCartBurst(false)}
                       className="flex items-center justify-between mx-4 mb-4 px-5 py-3 rounded-2xl font-black text-sm text-primary-950 transition-all hover:scale-[1.02] active:scale-[0.98]"
                       style={{ background: 'linear-gradient(135deg,#eab308,#facc15)' }}
                     >
                       <span>Proceed to Checkout</span>
                       <span className="text-lg">→</span>
                     </Link>
                   </div>
                 </div>
               )}

               {/* Mobile Menu Hamburger */}
               <div className="flex items-center">
                 <button 
                   onClick={() => setIsMobileMenuOpen(true)}
                   className={`md:hidden w-10 h-10 flex items-center justify-center rounded-[1rem] shrink-0 shadow-sm transition-colors border
                   ${isScrolled ? 'text-gray-900 bg-gray-50 border-gray-100' : 'text-white bg-white/10 border-white/10'}`}
                 >
                   ☰
                 </button>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-primary-950/40 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-4 right-4 left-4 glass-panel-heavy p-6 rounded-3xl shadow-float animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
               <h2 className="font-display font-black text-primary-900">Menu</h2>
               <button onClick={() => setIsMobileMenuOpen(false)} className="w-8 h-8 bg-gray-100 rounded-full font-black text-gray-500">×</button>
            </div>

            {/* Mobile Location Selector */}
            <div className="mb-6 p-4 rounded-2xl bg-primary-50 border border-primary-100">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary-400">Deliver to</p>
                  <p className="text-sm font-bold text-primary-900 truncate">{deliveryAddress || 'Not set yet'}</p>
                </div>
              </div>
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Enter delivery address..."
                className="input-premium !rounded-xl !py-2.5 text-sm mb-2"
              />
              <button 
                onClick={() => { saveAddress(); }}
                className="btn-primary w-full !py-2 !text-xs !rounded-xl"
              >
                {deliveryAddress ? 'Update Address' : 'Set Address'}
              </button>
            </div>

            <nav className="flex flex-col gap-4">
               <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-700 hover:text-primary-600">Home</Link>
               <Link href="/category/spice" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-700 hover:text-primary-600">Shop Spices</Link>
               <Link href="/category/farm-products" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-700 hover:text-primary-600">Farm Direct</Link>
               <Link href="/our-story" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-700 hover:text-primary-600">Our Story</Link>
               <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-gray-700 hover:text-primary-600">Contact</Link>
               <div className="pt-6 mt-2 border-t border-gray-100">
                 {user ? (
                   <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full text-center">My Account</Link>
                 ) : (
                   <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="btn-primary w-full text-center">Login / Register</Link>
                 )}
               </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
