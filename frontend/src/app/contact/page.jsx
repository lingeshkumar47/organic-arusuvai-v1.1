export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Contact Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 lg:mb-24 animate-fade-in-up">
           <span className="text-6xl drop-shadow-sm mb-6 inline-block">👋</span>
           <h1 className="font-display font-black text-5xl md:text-6xl text-primary-900 tracking-tight leading-tight mb-4">
             Let's start a <br />conversation.
           </h1>
           <p className="text-lg text-gray-500 font-medium">
             Questions about our Kodaikanal harvest? Interested in bulk cardamom orders? We're here to help you.
           </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
           
           {/* Form Section */}
           <div className="w-full lg:w-3/5 bg-white p-8 sm:p-12 rounded-[3.5rem] shadow-float border border-gray-100 animate-fade-in-up delay-100">
             <h2 className="font-display font-black text-3xl text-primary-900 tracking-tight mb-8">Send a Message</h2>
             
             <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">First Name</label>
                     <input placeholder="Jane" className="input-premium bg-gray-50" />
                   </div>
                   <div>
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Last Name</label>
                     <input placeholder="Appleseed" className="input-premium bg-gray-50" />
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">Email Address</label>
                   <input type="email" placeholder="jane@example.com" className="input-premium bg-gray-50" />
                </div>
                
                <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2 px-1">How can we help?</label>
                   <textarea rows={5} placeholder="I want to know more about..." className="input-premium bg-gray-50 resize-none py-4" />
                </div>
                
                <button type="button" className="btn-primary w-full !text-lg !py-4.5 !rounded-2xl shadow-glow">
                   Send Inquiry
                </button>
             </form>
           </div>

           {/* Direct Contact Blocks */}
           <div className="w-full lg:w-2/5 space-y-6 animate-fade-in-up delay-200">
             
             <div className="glass-panel p-8 md:p-10 rounded-[3rem] bg-cta-500 relative overflow-hidden text-center hover:scale-105 transition-transform duration-500 shadow-float z-0">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-[60px] pointer-events-none" />
                
                <div className="text-6xl mb-6 relative z-10 animate-float">💬</div>
                <h3 className="font-display font-black text-3xl text-primary-950 mb-4 relative z-10 tracking-tight">Direct Support</h3>
                <p className="text-primary-900 font-bold mb-8 relative z-10 px-4 leading-relaxed">
                  Skip the form. Chat directly with our farm coordinators on WhatsApp.
                </p>
                <a href="https://wa.me/918220351497" target="_blank" rel="noreferrer" className="btn-glass !w-full !rounded-2xl !bg-white !text-cta-600 border-none shadow-sm relative z-10">
                   WhatsApp Us
                </a>
             </div>

             <div className="glass-panel p-8 md:p-10 rounded-[3rem] bg-primary-900 relative overflow-hidden text-center hover:scale-105 transition-transform duration-500 shadow-float z-0">
                <div className="text-5xl mb-6 relative z-10 opacity-80">✉️</div>
                <h3 className="font-display font-black text-3xl text-white mb-4 relative z-10 tracking-tight">Email Desk</h3>
                <p className="text-primary-100/80 font-medium mb-8 relative z-10 px-4 leading-relaxed text-sm">
                  Prefer formal inquiries or B2B proposals? Drop us an email.
                </p>
                <a href="mailto:organic.arusuvai@gmail.com" className="text-lg font-bold text-cta-400 hover:text-white transition-colors relative z-10">
                   organic.arusuvai@gmail.com
                </a>
             </div>

           </div>

        </div>
      </div>
    </div>
  );
}
