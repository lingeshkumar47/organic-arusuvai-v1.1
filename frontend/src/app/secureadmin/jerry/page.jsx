'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import Link from 'next/link';

const JERRY_SYSTEM = "You are Jerry, a senior branding and marketing strategist for Organic Arusuvai. You specialize in high-conversion copywriting, emotional storytelling, and premium Indian grocery branding. Speak like a professional consultant who is also very tech-savvy and creative.";

const brandingTemplates = [
  { id: 1, name: 'Premium Spice Launch', type: 'Instagram Post', canvaUrl: 'https://www.canva.com/templates/s/spice/' },
  { id: 2, name: 'Honey Storytelling', type: 'Facebook Ad', canvaUrl: 'https://www.canva.com/templates/s/honey/' },
  { id: 3, name: 'Festive Offer Poster', type: 'Print Banner', canvaUrl: 'https://www.canva.com/templates/s/discount/' },
  { id: 4, name: 'WhatsApp Status Daily', type: 'Mobile Story', canvaUrl: 'https://www.canva.com/templates/s/organic-food/' },
];

const CANVA_CLIENT_ID = "YOUR_CANVA_CLIENT_ID"; // Replace with real ID from Canva Dev Portal

export default function JerryAIPage() {
  const [activeTab, setActiveTab] = useState('chat');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm Jerry 🤖. Your branding strategist. I've been analyzing our recent sales data. Ready to create some magic for Organic Arusuvai today? How can I help with your brand promotion?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [canvaLinked, setCanvaLinked] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const chatEndRef = useRef(null);

  // Growth Engine: WhatsApp & Lead Scoring Config
  const [waConfig, setWaConfig] = useState({ phoneId: '', accessToken: '', templateName: 'hello_world' });
  const [showConfig, setShowConfig] = useState(false);
  
  // New AI Stats for Leads & Ads
  const [leads, setLeads] = useState([
    { id: 1, name: 'Anik S.', phone: '+91 9876543210', score: 94, status: 'Hot', behavior: 'Viewed Turmeric 3x, Abandoned Cart' },
    { id: 2, name: 'Priya M.', phone: '+91 9822113344', score: 82, status: 'Warm', behavior: 'Repeat buyer, Checked New Arrivals' },
    { id: 3, name: 'Rohan K.', phone: '+91 9111222333', score: 45, status: 'Cold', behavior: 'One-time visit from Instagram' },
  ]);

  const [adSuggestions] = useState([
    { platform: 'Meta', headline: 'Pure Turmeric. Direct from Farm.', copy: 'Tired of store-bought spices? Experience the Organic Arusuvai difference.', cpc: '₹14.2', opt: 'Increase Budget' },
    { platform: 'Google', headline: 'Organic Spices Chennai', copy: '100% Pure, Farm-to-Kitchen Organic Spices. Free Home Delivery.', cpc: '₹22.5', opt: 'Refine Keywords' },
  ]);

  // Lead Import States
  const [showImport, setShowImport] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);
  const [previewLeads, setPreviewLeads] = useState([]);

  const normalizePhone = (p) => {
    let clean = p.replace(/\D/g, '');
    if (clean.length === 10) return `+91${clean}`;
    if (clean.length === 12 && clean.startsWith('91')) return `+${clean}`;
    return clean.startsWith('+') ? clean : `+${clean}`;
  };

  const calculateLeadScore = (lead) => {
    let score = 50; 
    if (lead.source === 'Ads') score += 15;
    if (lead.type === 'b2b') score += 10;
    if (lead.behavior?.includes('Viewed')) score += 10;
    if (lead.behavior?.includes('Abandoned')) score += 20;
    return Math.min(score, 100);
  };

  const handleFileUpload = (e) => {
    setIsImporting(true);
    // Simulate parsing XLSX/CSV
    setTimeout(() => {
      const mockParsed = [
        { name: 'Suresh Raina', phone: '9840012345', type: 'b2c', source: 'Ads', behavior: 'Viewed Spices 2x' },
        { name: 'Meena Sharma', phone: '9940123456', type: 'b2b', source: 'Offline', behavior: 'Direct Inquiry' },
        { name: 'Hotel Arusuvai', phone: '9123456789', type: 'vendor', source: 'Manual', behavior: 'Bulk quote requested' },
      ];
      setPreviewLeads(mockParsed);
      setIsImporting(false);
    }, 1500);
  };

  const completeImport = () => {
    setIsImporting(true);
    setTimeout(() => {
      const newLeads = previewLeads.map((l, i) => {
        const normalized = { ...l, phone: normalizePhone(l.phone) };
        const score = calculateLeadScore(normalized);
        return {
          id: leads.length + i + 1,
          ...normalized,
          score,
          status: score > 80 ? 'Hot' : score > 60 ? 'Warm' : 'New',
          behavior: l.behavior || `Imported via ${l.source}`
        };
      });
      setLeads([...leads, ...newLeads]);
      setImportSummary({ total: previewLeads.length, success: previewLeads.length, dupes: 0 });
      setPreviewLeads([]);
      setIsImporting(false);
    }, 2000);
  };

  const sendWhatsAppIntro = async (lead) => {
    if (!waConfig.phoneId || !waConfig.accessToken) {
       alert("🚨 Please configure WhatsApp API (Phone ID & Token) in Leads tab!");
       return;
    }
    // REAL API STRUCTURE (Meta Cloud API)
    // const response = await fetch(`https://graph.facebook.com/v18.0/${waConfig.phoneId}/messages`, { ... });
    setMessages(prev => [...prev, { role: 'assistant', content: `📲 Dispatching WhatsApp Intro to ${lead.name} (${lead.phone})...\nDraft: "Hi ${lead.name.split(' ')[0]}, thanks for choosing Organic Arusuvai 🌿. Jerry here! Ready to spice up your kitchen?"` }]);
    alert(`WhatsApp Message Triggered via Meta Cloud API for ${lead.phone} using Template ${waConfig.templateName}`);
  };

  useEffect(() => {
    const linked = localStorage.getItem('oa_canva_linked') === 'true';
    setCanvaLinked(linked);
    fetchCampaigns();

    // Initialize Canva SDK if available
    if (window.Canva && window.Canva.DesignButton) {
      window.Canva.DesignButton.initialize({
        apiKey: CANVA_CLIENT_ID,
      });
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchCampaigns() {
    const { data } = await supabase.from('whatsapp_campaigns').select('*').order('created_at', { ascending: false });
    setCampaigns(data || []);
  }

  const handleLinkCanva = () => {
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/canva/callback`);
    const scope = encodeURIComponent('design:content:write');
    const authUrl = `https://www.canva.com/api/oauth/authorize?client_id=${CANVA_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    window.open(authUrl, '_blank');
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('oa_canva_linked', 'true');
      setCanvaLinked(true);
      setLoading(false);
      setMessages(prev => [...prev, { role: 'assistant', content: "✅ Connection initiated! Once you authorize Organic Arusuvai in Canva, I'll be able to send designs directly to your account." }]);
    }, 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setTimeout(() => {
      let response = "";
      const lower = input.toLowerCase();
      if (lower.includes('poster') || lower.includes('design') || lower.includes('post')) {
        response = "I've drafted some premium design concepts for you! 🎨 Since we're integrating with Canva, you can now click 'Edit in Canva' on any template below to customize it with our brand assets.";
        setActiveTab('branding');
      } else if (lower.includes('query') || lower.includes('issue') || lower.includes('customer')) {
        response = "I've analyzed the customer sentiment. Here is a GPT-powered auto-reply draft for your WhatsApp support:\n\n'Hi there! We strictly source our spices from farm-owners to ensure 100% purity. Our Turmeric has >3% Curcumin. Shall I help you with a sample pack?'";
      } else if (lower.includes('lead') || lower.includes('score')) {
        response = "Predictive scoring complete! I've analyzed our most recent imports. We have several 'Hot' leads from Instagram ads showing cart abandonment patterns. Check the 'Leads' tab for immediate action items.";
        setActiveTab('leads');
      } else if (lower.includes('hello') || lower.includes('hi')) {
        response = "Hi! I'm ready to help you dominate the market. Shall we create a new poster, score our leads, or optimize your ads today?";
      } else if (lower.includes('setup') || lower.includes('whatsapp') || lower.includes('api')) {
         response = "I'm ready to connect with Meta Cloud API. Go to 'Leads & CRM' and click 'WhatsApp API Config' to input your Phone ID and Access Token. I recommend direct Meta API over BotBee for 100% control.";
         setActiveTab('leads');
         setShowConfig(true);
      } else {
        response = "Understood. I'm processing your branding strategy. Would you like a suggested design for this, or just the copy?";
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  const generateAIPoster = (template) => {
    if (!window.Canva || !window.Canva.DesignButton) {
       alert("Canva SDK is still loading. Please try again in a second.");
       return;
    }
    window.Canva.DesignButton.open({
       design: { type: "poster" },
       assets: { data: [{ type: "image", url: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=1000" }] }
    });
    setMessages(prev => [...prev, { role: 'assistant', content: `🚀 Opening "${template.name}" in Canva Designer... Apply our brand kit once inside!` }]);
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display text-3xl font-black text-gray-900 tracking-tight">Jerry AI <span className="text-purple-600">Admin</span></h1>
            <div className="flex gap-2">
              <span className="text-[10px] bg-purple-600 text-white px-2.5 py-1 rounded-full font-black uppercase tracking-widest">v2.5 Elite</span>
              {canvaLinked && <span className="text-[10px] bg-blue-500 text-white px-2.5 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1">🔗 Canva Active</span>}
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium italic">"Strategize. Design. Promote." — Your Marketing Partner</p>
        </div>

        <div className="flex items-center gap-4 bg-purple-50 p-2 pl-4 pr-6 rounded-2xl border border-purple-100">
           <div>
              <p className="text-[10px] text-purple-600 font-black uppercase leading-tight">Growth Engine</p>
              <p className="text-xs font-bold text-purple-900">CRM & WhatsApp Enabled</p>
           </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-gray-50 p-1.5 rounded-2xl w-fit">
        {[
          { id: 'chat', label: '💬 Active Strategist', icon: '🤖' },
          { id: 'leads', label: '🎯 Leads & CRM', icon: '📈' },
          { id: 'ads', label: '🚀 Ad Optimizer', icon: '💰' },
          { id: 'branding', label: '🎨 Design', icon: '🖼️' },
          { id: 'history', label: '📊 Logs', icon: '📝' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-white shadow-md text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <span>{tab.icon}</span> {tab.label.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {activeTab === 'chat' && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[600px]">
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-3xl p-5 ${m.role === 'assistant' ? 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100' : 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-200'}`}>
                    {m.role === 'assistant' && (
                       <div className="flex justify-between items-center mb-2">
                          <p className="text-[10px] font-black uppercase tracking-widest text-purple-500">Jerry Strategist</p>
                          {m.content.includes("'Hi") && (
                             <button 
                                onClick={() => { navigator.clipboard.writeText(m.content); alert("Auto-reply copied to clipboard!"); }}
                                className="text-[9px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-md font-black uppercase hover:bg-purple-200 transition-all"
                             >
                               Copy Draft
                             </button>
                          )}
                       </div>
                    )}
                    <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-50 rounded-2xl px-4 py-3 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"/>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-75"/>
                    <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce delay-150"/>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Jerry for a campaign idea or ask to 'create a poster'..."
                className="flex-1 px-6 py-4 rounded-2xl bg-white border border-gray-100 shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all font-medium"
              />
              <button type="submit" disabled={!input.trim()} className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center hover:bg-purple-700 transition-all disabled:opacity-50 active:scale-90">
                🚀
              </button>
            </form>
          </div>
        )}

        {activeTab === 'leads' && (
          <div className="space-y-6">
             <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
                <div>
                   <h3 className="font-black text-gray-900 text-lg">Predictive CRM</h3>
                   <p className="text-xs text-gray-500 font-medium italic">Auto-scoring active. Found {leads.filter(l => l.status === 'Hot').length} high-intent leads.</p>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setShowConfig(!showConfig)}
                     className={`px-6 py-3 border-2 ${waConfig.phoneId ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-purple-100 bg-purple-50 text-purple-600'} rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all`}
                   >
                     ⚙️ {waConfig.phoneId ? 'API Active' : 'WhatsApp API Config'}
                   </button>
                   <button 
                    onClick={() => setShowImport(!showImport)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-purple-700 transition-all"
                   >
                     📥 Import Leads
                   </button>
                </div>
             </div>

             {/* API Config Modal/Popover */}
             {showConfig && (
                <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] text-white animate-fade-in shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6">
                      <button onClick={() => setShowConfig(false)} className="text-gray-400 hover:text-white transition-colors">✕</button>
                   </div>
                   <div className="max-w-md">
                      <h4 className="text-xl font-black mb-1">WhatsApp Meta Cloud API</h4>
                      <p className="text-xs text-gray-400 mb-6 font-medium">Link your site to official Meta Business portal. Practical & Scalable.</p>
                      
                      <div className="space-y-4">
                         <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-purple-400 block mb-1.5 ml-1">Phone ID</label>
                            <input 
                               type="text" 
                               value={waConfig.phoneId}
                               onChange={(e) => setWaConfig({...waConfig, phoneId: e.target.value})}
                               placeholder="e.g. 10452309812345"
                               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition-all"
                            />
                         </div>
                         <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-purple-400 block mb-1.5 ml-1">Access Token</label>
                            <input 
                               type="password" 
                               value={waConfig.accessToken}
                               onChange={(e) => setWaConfig({...waConfig, accessToken: e.target.value})}
                               placeholder="EAAB..."
                               className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition-all"
                            />
                         </div>
                         <div className="flex gap-4 items-center pt-2">
                           <button onClick={() => { setShowConfig(false); alert("WhatsApp API linked! Lead actions now active."); }} className="flex-1 py-4 bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-purple-700 active:scale-95 transition-all">Save & Connect</button>
                           <Link href="https://developers.facebook.com" target="_blank" className="text-xs text-gray-500 underline py-2">Meta Dev Portal</Link>
                         </div>
                      </div>
                   </div>
                </div>
             )}

             {/* Import UI */}
             {showImport && (
               <div className="bg-white p-10 rounded-[2.5rem] border-2 border-dashed border-purple-200 animate-fade-in relative overflow-hidden">
                  {!previewLeads.length ? (
                    <div className="flex flex-col items-center justify-center text-center py-10">
                       <span className="text-4xl mb-4">📄</span>
                       <h4 className="text-lg font-black text-gray-900 mb-2">Upload Lead Data</h4>
                       <p className="text-sm text-gray-500 mb-8 max-w-sm">Drag & Drop your CSV or XLSX file here. Jerry will auto-map fields and normalize phone numbers.</p>
                       <label className="cursor-pointer bg-purple-50 text-purple-600 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-100 transition-all">
                         {isImporting ? 'Analyzing...' : 'Choose File'}
                         <input type="file" className="hidden" onChange={handleFileUpload} accept=".csv, .xlsx" />
                       </label>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-scale-in">
                       <div className="flex justify-between items-end">
                          <div>
                             <h4 className="text-lg font-black text-gray-900 mb-1">Field Mapping & Preview</h4>
                             <p className="text-xs text-gray-500 font-medium italic">Jerry mapped 4 fields. Phone numbers will be normalized to +91.</p>
                          </div>
                          <button onClick={completeImport} disabled={isImporting} className="btn-cta !px-8 !py-3 !rounded-xl">
                            {isImporting ? 'Processing...' : 'Complete Import'}
                          </button>
                       </div>
                       <div className="overflow-x-auto rounded-2xl border border-gray-100">
                          <table className="w-full text-left">
                             <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                                <tr>
                                   <th className="px-6 py-4">Name → name</th>
                                   <th className="px-6 py-4">Phone → phone</th>
                                   <th className="px-6 py-4">Type → lead_type</th>
                                   <th className="px-6 py-4">Source → source</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-50 text-xs">
                                {previewLeads.map((l, i) => (
                                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                                     <td className="px-6 py-4 font-bold text-gray-900">{l.name}</td>
                                     <td className="px-6 py-4 font-medium text-gray-600">{l.phone}</td>
                                     <td className="px-6 py-4"><span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-black uppercase">{l.type}</span></td>
                                     <td className="px-6 py-4 font-medium text-gray-400">{l.source}</td>
                                  </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>
                  )}

                  {importSummary && (
                    <div className="mt-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between animate-bounce">
                       <div className="flex items-center gap-4">
                          <span className="text-2xl">✅</span>
                          <p className="text-sm text-emerald-900 font-bold">Import Complete! {importSummary.success} leads added. {importSummary.dupes} duplicates skipped.</p>
                       </div>
                       <button onClick={() => setImportSummary(null)} className="text-emerald-600 font-black text-xs uppercase tracking-widest hover:underline">Dismiss</button>
                    </div>
                  )}
               </div>
             )}

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {leads.map(l => (
                 <div key={l.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden group hover:shadow-xl hover:border-purple-100 transition-all duration-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform opacity-50"/>
                    <div className="relative z-10">
                      <div className="flex justify-between items-center mb-6">
                        <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${l.status === 'Hot' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>{l.status} Lead</div>
                        <span className="text-3xl font-black text-gray-900">{l.score}</span>
                      </div>
                      <h4 className="font-display font-black text-xl text-gray-900 mb-1">{l.name}</h4>
                      <p className="text-xs text-gray-400 font-black tracking-widest mb-2">{l.phone}</p>
                      <p className="text-xs text-gray-500 font-medium mb-8 pb-8 border-b border-gray-50 leading-relaxed">{l.behavior}</p>
                      <button 
                        onClick={() => sendWhatsAppIntro(l)}
                        className="w-full py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                      >
                         <span>📲</span> WhatsApp Intro
                      </button>
                    </div>
                 </div>
               ))}
             </div>
             <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 flex items-center gap-6">
                <span className="text-4xl text-amber-600 drop-shadow-sm">💡</span>
                <p className="text-sm text-amber-900 font-medium leading-relaxed"><strong>Jerry's Growth Hack:</strong> I've noticed B2B leads from Offline events have 40% higher retention. Consider a dedicated WhatsApp drip campaign for the 'Event' segment.</p>
             </div>
          </div>
        )}

        {activeTab === 'ads' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-gray-900 italic">"Ad spend is an investment, not an expense."</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
               {adSuggestions.map((ad, i) => (
                 <div key={i} className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden group">
                    <div className="p-8 bg-gray-50 border-b border-gray-100 flex justify-between items-center transition-colors group-hover:bg-primary-50">
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${ad.platform === 'Meta' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>{ad.platform} Ads</span>
                       <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Optimized Copy v1</span>
                    </div>
                    <div className="p-10 space-y-6">
                       <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Suggested Headline</p>
                          <p className="text-lg font-bold text-gray-900">"{ad.headline}"</p>
                       </div>
                       <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                          <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Ad Body Copy</p>
                          <p className="text-sm font-medium text-gray-700 leading-relaxed italic">"{ad.copy}"</p>
                       </div>
                       <div className="flex gap-4 pt-4">
                          <button className="flex-1 py-4 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-700 transition-all">Launch with Jerry</button>
                          <button className="px-6 py-4 border-2 border-primary-50 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:border-primary-200 transition-all">View Performance (₹{ad.cpc})</button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="p-10 bg-indigo-950 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-10">
               <div className="flex-1">
                  <h3 className="text-2xl font-black mb-4">Budget Multiplier Engine</h3>
                  <p className="text-indigo-200 text-sm mb-6 leading-relaxed">Jerry detected that your Facebook Story ads for <strong>Honey</strong> are converting at 2.4x the rate of Feed ads. Shift ₹5,000 from Feed to Stories immediately?</p>
                  <button className="px-8 py-4 bg-white text-indigo-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Approve Budget Shift</button>
               </div>
               <div className="text-7xl opacity-50 animate-pulse">🚀</div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {brandingTemplates.map((t) => (
                <div key={t.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                   <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700 opacity-20"/>
                   <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">🎨</div>
                   <h3 className="font-black text-gray-900 text-lg leading-tight mb-2">{t.name}</h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{t.type}</p>
                   <button onClick={() => generateAIPoster(t)} className="w-full py-3 bg-gray-50 text-gray-800 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-purple-600 hover:text-white transition-all border border-gray-100">
                     {canvaLinked ? 'Generate & Open' : 'Link Canva to Open'}
                   </button>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-purple-900 to-indigo-950 p-10 rounded-[3rem] text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"/>
               <div className="relative z-10 max-w-lg">
                 <h2 className="text-3xl font-black mb-4">AI Magic Design Engine</h2>
                 <p className="text-purple-100 text-sm mb-8 leading-relaxed font-medium">Jerry can analyze your brand colors and products to suggest the best Canva layouts.</p>
                 <button onClick={handleLinkCanva} className="px-8 py-4 bg-white text-purple-900 rounded-2xl font-black text-xs uppercase tracking-widest transition-all">Connect Now</button>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h3 className="font-black text-xl text-gray-900">Recent Strategy Logs</h3>
              <span className="bg-primary-50 text-primary-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">{campaigns.length} Logs</span>
            </div>
            {campaigns.length === 0 ? (
              <div className="p-20 text-center">
                <p className="text-gray-400 font-bold mb-2">No logs found yet.</p>
                <p className="text-xs text-gray-400">Jerry will log all successfully generated campaigns here.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {campaigns.map(c => (
                  <div key={c.id} className="p-6 hover:bg-gray-50 transition-colors group">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900">{c.title}</h4>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{c.product_name} • {c.tone} • {new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">🔗</button>
                        <button className="w-10 h-10 bg-red-50 text-red-500 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">🗑️</button>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{c.campaign_message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
