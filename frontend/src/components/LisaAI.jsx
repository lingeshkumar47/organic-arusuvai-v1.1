'use client';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '../lib/supabase';

export default function LisaAI() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'lisa', type: 'text', text: '✨ Hi! I am Lisa AI, your guide to a pure, organic lifestyle. How can I help you today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [interactionStep, setInteractionStep] = useState('initial'); // 'initial', 'products-list', 'manual-input', 'waiting'
  const [manualQuery, setManualQuery] = useState('');
  const [showTooltip, setShowTooltip] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const handleOpenLisa = () => setIsOpen(true);
    window.addEventListener('open-lisa', handleOpenLisa);
    return () => window.removeEventListener('open-lisa', handleOpenLisa);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setShowTooltip(true);
      const hideTimer = setTimeout(() => setShowTooltip(false), 3000);
      const intervalTimer = setInterval(() => {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 3000);
      }, 120000); // 2 minutes
      return () => { clearTimeout(hideTimer); clearInterval(intervalTimer); };
    } else {
      setShowTooltip(false);
    }
  }, [isOpen]);

  useEffect(() => {
    supabase.from('products').select('id, name, slug').then(({data}) => {
       if (data) setProducts(data);
    });
  }, []);

  const options = [
    { label: 'Recipes 🍲', id: 'recipes' },
    { label: 'Health Tips 🧘‍♀️', id: 'health' },
    { label: 'Skincare ✨', id: 'skincare' },
    { label: 'Business hours 🏺', id: 'hours' }
  ];

  const handleInitialOption = (opt) => {
    setMessages(prev => [...prev, { sender: 'user', type: 'text', text: opt.label }]);
    setIsTyping(true);
    setInteractionStep('waiting');

    setTimeout(() => {
      let resp = "";
      if(opt.id === 'hours') resp = "Our team is here to help! 🕰️ Business Hours: 10:00 AM to 8:00 PM IST.";
      else resp = `I can definitely help with ${opt.label}! Please choose a product to get started.`;
      
      setMessages(prev => [
         ...prev, 
         { sender: 'lisa', type: 'text', text: resp }
      ]);
      setIsTyping(false);
      if(opt.id !== 'hours') setInteractionStep('products-list');
      else setInteractionStep('initial');
    }, 1000);
  };

  const handleProductSelect = async (prod) => {
    setMessages(prev => [...prev, { sender: 'user', type: 'text', text: `Tell me about ${prod.name}` }]);
    setIsTyping(true);
    setInteractionStep('waiting');

    try {
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: prod.name })
      });
      const data = await response.json();
      
      setMessages(prev => [
         ...prev, 
         { 
            sender: 'lisa', 
            type: 'product-resp', 
            data: { 
              text: data.content, 
              productSlug: prod.slug, 
              productName: prod.name 
            } 
         }
      ]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'lisa', type: 'text', text: "Apologies! My knowledge base is refreshing. Please try again in a moment." }]);
    } finally {
      setIsTyping(false);
      setInteractionStep('products-list');
    }
  };

  const submitManualQuery = (e) => {
    e.preventDefault();
    if (!manualQuery.trim()) return;
    setMessages(prev => [...prev, { sender: 'user', type: 'text', text: manualQuery }]);
    const query = manualQuery;
    setManualQuery('');
    handleProductSelect({ name: query, slug: 'all' }); // Use the logic above
  };

  const messagesEndRef = useRef(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="fixed bottom-6 left-6 z-[200] flex flex-col items-start pointer-events-none">
      {(!isOpen && showTooltip) && (
        <div className="bg-white px-5 py-2.5 rounded-2xl shadow-float mb-4 relative animate-fade-in-up border-2 border-primary-200 pointer-events-auto cursor-pointer group hover:scale-105 transition-transform" onClick={() => setIsOpen(true)}>
          <span className="text-sm font-black text-primary-900">✨ Ask Lisa for Recipes!</span>
          <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white rotate-45 border-r-2 border-b-2 border-primary-200"></div>
        </div>
      )}

      <div className={`bg-white w-[340px] sm:w-[400px] overflow-hidden transition-all duration-500 origin-bottom-left shadow-[0_30px_70px_-15px_rgba(0,0,0,0.4)] pointer-events-auto border border-gray-100 rounded-[2.5rem]
        ${isOpen ? 'scale-100 opacity-100 mb-6 h-[600px] flex flex-col' : 'scale-0 opacity-0 h-0 w-0 mb-0'}`}>
        
        <div className="bg-primary-950 p-5 flex justify-between items-center shrink-0 border-b-4 border-cta-500">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 flex items-center justify-center shrink-0">
                <img src="/images/LisaAI.svg" alt="Lisa AI" className="w-full h-full object-contain animate-wiggle" />
             </div>
             <div>
               <h4 className="font-display font-black text-lg text-white leading-tight">Lisa AI</h4>
               <span className="text-[9px] font-black tracking-widest text-cta-400 uppercase flex items-center gap-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-cta-500 animate-pulse" /> Expert Guide
               </span>
             </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors text-xl font-bold pb-1">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50 space-y-6 scroll-smooth custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
              {msg.sender === 'lisa' && (
                <div className="w-8 h-8 mr-2 shrink-0 self-end mb-1">
                   <img src="/images/LisaAI.svg" alt="Lisa" className="w-full h-full object-contain" />
                </div>
              )}
              <div className={`max-w-[85%] rounded-[1.5rem] p-4 text-[13px] shadow-sm
                ${msg.sender === 'user' ? 'bg-primary-600 text-white rounded-br-sm' : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'}`}>
                
                {msg.type === 'text' && <p className="whitespace-pre-wrap font-medium leading-relaxed">{msg.text}</p>}
                
                {msg.type === 'product-resp' && (
                  <div className="space-y-4">
                    <div className="prose prose-sm prose-primary max-w-none">
                       <p className="whitespace-pre-wrap font-medium leading-relaxed text-gray-700">{msg.data.text}</p>
                    </div>
                    <div className="pt-4 border-t border-gray-100">
                       <p className="text-[10px] font-black uppercase text-gray-400 mb-3 tracking-widest">Available in our Shop</p>
                       <Link 
                         href={`/product/${msg.data.productSlug}`} 
                         onClick={() => setIsOpen(false)}
                         className="btn-cta w-full !py-3 !px-4 !text-[11px] !rounded-xl text-center flex items-center justify-center gap-2 shadow-glow-cta"
                       >
                         🛒 Get Pure {msg.data.productName}
                       </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
                <div className="w-8 h-8 mr-2" />
                <div className="bg-white p-4 rounded-2xl flex gap-1 shadow-sm">
                   <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce" />
                   <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce delay-75" />
                   <div className="w-1.5 h-1.5 bg-primary-400 rounded-full animate-bounce delay-150" />
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          {interactionStep === 'initial' && (
             <div className="flex flex-wrap gap-2 justify-center">
                {options.map(opt => (
                   <button key={opt.id} onClick={() => handleInitialOption(opt)} className="bg-primary-50 hover:bg-primary-100 text-primary-800 text-[11px] font-bold px-3 py-2.5 rounded-xl transition-all border border-primary-100">
                      {opt.label}
                   </button>
                ))}
             </div>
          )}

          {interactionStep === 'products-list' && (
             <div className="space-y-3">
                <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto pr-1">
                   {products.map(p => (
                      <button key={p.id} onClick={() => handleProductSelect(p)} className="bg-white text-gray-700 text-[10px] font-bold px-3 py-2 rounded-lg border border-gray-200 hover:border-cta-400 truncate max-w-[140px]">
                         {p.name}
                      </button>
                   ))}
                </div>
                <button onClick={() => setInteractionStep('manual-input')} className="w-full text-center text-[10px] font-black text-primary-400 uppercase tracking-widest hover:text-primary-600">
                   Or type custom message ⌨️
                </button>
             </div>
          )}

          {interactionStep === 'manual-input' && (
             <form onSubmit={submitManualQuery} className="flex gap-2">
                <input 
                  type="text" 
                  value={manualQuery}
                  onChange={(e) => setManualQuery(e.target.value)}
                  placeholder="Ask for a recipe or benefit..."
                  className="flex-1 bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-3 focus:bg-white outline-none"
                  autoFocus
                />
                <button type="submit" className="w-12 h-12 bg-primary-600 rounded-xl text-white flex items-center justify-center shadow-lg">
                   ➤
                </button>
             </form>
          )}
        </div>
      </div>

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-[100px] h-[100px] flex items-center justify-center pointer-events-auto hover:scale-110 active:scale-95 transition-all duration-500 group relative"
        >
          <div className="absolute inset-0 bg-cta-400/20 rounded-full blur-2xl group-hover:bg-primary-400/30 animate-pulse" />
          <img src="/images/LisaAI.svg" alt="Lisa AI" className="w-full h-full object-contain relative z-10 animate-wiggle drop-shadow-xl" />
        </button>
      )}
    </div>
  );
}
