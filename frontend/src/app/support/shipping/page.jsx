'use client';
import Link from 'next/link';

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-primary-600 font-bold mb-8 hover:text-primary-800 transition-colors">
          <span className="text-xl leading-none -mt-1">←</span> Back
        </Link>
        <h1 className="font-display font-black text-4xl md:text-5xl text-primary-950 mb-10">Shipping Policy</h1>

        <div className="space-y-8 text-gray-600 font-medium">
          <section className="glass-panel p-8 rounded-[2rem] border border-gray-100 shadow-sm">
             <h2 className="font-display font-bold text-2xl text-gray-900 mb-4">Delivery Timelines</h2>
             <p className="mb-4">Since our products are organically sourced and freshly packed, we aim to dispatch all orders within 24-48 hours of confirmation.</p>
             <ul className="list-disc pl-5 space-y-2">
               <li><strong>Chennai & Local:</strong> 1-2 Business Days</li>
               <li><strong>Rest of Tamil Nadu:</strong> 2-4 Business Days</li>
               <li><strong>Rest of India:</strong> 4-7 Business Days</li>
             </ul>
          </section>
          
          <section className="glass-panel p-8 rounded-[2rem] border border-gray-100 shadow-sm">
             <h2 className="font-display font-bold text-2xl text-gray-900 mb-4">Shipping Charges</h2>
             <p className="mb-4">We offer <strong className="text-emerald-600">Free Shipping</strong> on all orders above ₹499 across India. For orders below this amount, a nominal flat shipping fee is added at checkout depending on the weight and location.</p>
          </section>
          
          <section className="glass-panel p-8 rounded-[2rem] border border-gray-100 shadow-sm">
             <h2 className="font-display font-bold text-2xl text-gray-900 mb-4">Tracking Your Harvest</h2>
             <p className="mb-4">Once your order is dispatched, you will receive a tracking link via email and WhatsApp. You can also view real-time updates through your <Link href="/account" className="text-primary-600 underline">Track Orders</Link> dashboard.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
