'use client';
import Link from 'next/link';

export default function Proprietorship() {
  return (
    <div className="min-h-screen bg-white pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-2 text-primary-600 font-bold mb-8 hover:text-primary-800 transition-colors">
          <span className="text-xl leading-none -mt-1">←</span> Back
        </Link>
        <div className="text-center mb-16">
          <div className="w-24 h-24 mx-auto border-4 border-orange-200 bg-orange-50 rounded-3xl flex items-center justify-center p-2 shadow-2xl shadow-orange-100 mb-8 overflow-hidden">
             <span className="text-4xl">👩‍💼</span>
          </div>
          <h1 className="font-display font-black text-5xl md:text-6xl text-primary-950 tracking-tight leading-none mb-6">Sole Proprietorship</h1>
          <p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
            Organic Arusuvai is legally registered and owned as a Sole Proprietorship by Mrs. Sangeetha K.
          </p>
        </div>

        <div className="prose prose-lg mx-auto text-gray-600 space-y-8">
          <p>
            <strong>Organic Arusuvai</strong> stands as a shining example of women entrepreneurship and dedication to authentic traditional foods. As a sole proprietorship, the enterprise is completely driven by the vision, passion, and uncompromising quality standards established by <strong>Mrs. Sangeetha K</strong>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
            <div className="bg-orange-50 p-8 rounded-[2rem] border border-orange-100">
              <h3 className="font-display font-black text-orange-900 text-xl mb-3">Our Vision</h3>
              <p className="text-sm font-medium text-orange-800 leading-relaxed">
                To bring the purest, unadulterated heirloom spices and traditional food products straight from our ancestral farms to modern kitchens across India.
              </p>
            </div>
            <div className="bg-primary-50 p-8 rounded-[2rem] border border-primary-100">
              <h3 className="font-display font-black text-primary-900 text-xl mb-3">Legal Entity</h3>
              <p className="text-sm font-medium text-primary-800 leading-relaxed">
                Registered under the Indian Government's MSME framework and fully compliant with all local business and taxation laws under the stewardship of Mrs. Sangeetha.
              </p>
            </div>
          </div>

          <p>
            Operating from Nanganallur, Chennai, Tamil Nadu, Organic Arusuvai guarantees personal accountability. When you buy from us, you aren't buying from a faceless corporation, but directly supporting a passionate local enterprise dedicated to your well-being.
          </p>
        </div>
      </div>
    </div>
  );
}
