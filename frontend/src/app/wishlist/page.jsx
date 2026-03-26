'use client';
import Link from 'next/link';
import ProductCard from '../../components/ProductCard';

const wishlistItems = [
  { id: 6, slug: 'cold-pressed-coconut-oil', name: 'Cold Pressed Coconut Oil', price: 349, mrp: 449, category: 'Cold Pressed Oils', rating: 4.9, reviews: 89, image: '🥥' },
  { id: 5, slug: 'organic-black-pepper', name: 'Organic Black Pepper', price: 199, mrp: 279, category: 'Spices', rating: 4.9, reviews: 145, image: '⚫' },
];

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600">Home</Link><span>›</span>
            <span className="text-gray-800 font-medium">Wishlist ({wishlistItems.length})</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-6">My Wishlist ❤️</h1>
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {wishlistItems.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-20">
            <span className="text-6xl block mb-4">❤️</span>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save products you love for later</p>
            <Link href="/category/all" className="btn-primary">Browse Products</Link>
          </div>
        )}
      </div>
    </div>
  );
}
