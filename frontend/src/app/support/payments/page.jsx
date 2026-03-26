'use client';
import Link from 'next/link';

export default function PaymentsPolicy() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-primary-600 font-bold mb-8 hover:text-primary-800 transition-colors">
          <span className="text-xl leading-none -mt-1">←</span> Back
        </Link>
        <h1 className="font-display font-black text-4xl md:text-5xl text-primary-950 mb-10">Secure Payments</h1>

        <div className="space-y-8 text-gray-600 font-medium">
          <section className="glass-panel p-8 rounded-[2rem] border border-gray-100 shadow-sm">
             <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-6">🔒</div>
             <h2 className="font-display font-bold text-2xl text-gray-900 mb-4">100% SSL Encrypted</h2>
             <p className="mb-4">Your security is our top priority. Organic Arusuvai's checkout mechanism uses robust SSL encryption to ensure that your financial data is never exposed or logged.</p>
          </section>
          
          <section className="glass-panel p-8 rounded-[2rem] border border-gray-100 shadow-sm">
             <h2 className="font-display font-bold text-2xl text-gray-900 mb-4">Payment Methods Accepted</h2>
             <ul className="list-disc pl-5 space-y-4">
               <li><strong>UPI Checkout:</strong> The fastest way to pay using trusted apps (GPay, PhonePe, Paytm).</li>
               <li><strong>Cards & Netbanking:</strong> Securely handled via Razorpay Gateway. We support all leading credit/debit cards, wallets, and internet banking options.</li>
               <li><strong>Cash on Delivery (COD):</strong> Pay only when the purity reaches your doorstep!</li>
             </ul>
          </section>

          <section className="p-6 bg-red-50 text-red-800 rounded-2xl">
             <p className="text-sm font-bold">Please note: We will never call you asking for OTPs, CVVs, or PINs. If you receive a suspicious call claiming to be us, report it immediately to our contact email.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
