'use client';
import Link from 'next/link';

const orderData = {
  id: 'OA-1041',
  date: 'Mar 22, 2026',
  total: 349,
  status: 'out_for_delivery',
  payment: 'Razorpay • UPI',
  items: [
    { name: 'Cold Pressed Coconut Oil', variant: '1L', qty: 1, price: 349, image: '🥥' },
  ],
  address: { name: 'Arun Kumar', phone: '+91 98765 43210', line: '45 T Nagar, Chennai 600017, Tamil Nadu' },
  timeline: [
    { status: 'Order Placed', time: 'Mar 22, 10:30 AM', done: true, icon: '📦' },
    { status: 'Order Confirmed', time: 'Mar 22, 10:32 AM', done: true, icon: '✅' },
    { status: 'Processing', time: 'Mar 22, 11:00 AM', done: true, icon: '⚙️' },
    { status: 'Out for Delivery', time: 'Mar 22, 2:15 PM', done: true, icon: '🚚', current: true },
    { status: 'Delivered', time: 'Expected by 5:00 PM', done: false, icon: '🎉' },
  ],
};

export default function OrderTrackingPage({ params }) {
  const order = orderData;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-primary-600">Home</Link><span>›</span>
            <Link href="/account" className="hover:text-primary-600">My Orders</Link><span>›</span>
            <span className="text-gray-800 font-medium">{order.id}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">Order {order.id}</h1>
            <p className="text-sm text-gray-500">Placed on {order.date}</p>
          </div>
          <span className="text-sm px-4 py-2 rounded-full font-medium bg-blue-100 text-blue-700">
            🚚 Out for Delivery
          </span>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          <h2 className="font-display font-semibold text-gray-900 mb-6">📍 Order Tracking</h2>
          <div className="relative">
            {order.timeline.map((step, i) => (
              <div key={i} className="flex gap-4 relative pb-8 last:pb-0">
                {/* Line */}
                {i < order.timeline.length - 1 && (
                  <div className={`absolute left-[19px] top-10 w-0.5 h-full ${step.done ? 'bg-primary-400' : 'bg-gray-200'}`} />
                )}
                {/* Circle */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 z-10 border-2
                  ${step.current ? 'border-primary-500 bg-primary-100 animate-pulse-gentle' : step.done ? 'border-primary-500 bg-primary-50' : 'border-gray-200 bg-gray-50'}`}>
                  {step.icon}
                </div>
                <div className="pt-1.5">
                  <p className={`font-medium ${step.current ? 'text-primary-700' : step.done ? 'text-gray-800' : 'text-gray-400'}`}>{step.status}</p>
                  <p className={`text-sm ${step.done ? 'text-gray-500' : 'text-gray-400'}`}>{step.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display font-semibold text-gray-900 mb-4">📦 Items</h2>
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">{item.image}</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.variant} × {item.qty}</p>
                </div>
                <span className="font-semibold text-gray-700">₹{item.price}</span>
              </div>
            ))}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <span className="text-gray-500">Total</span>
              <span className="text-lg font-bold text-primary-700">₹{order.total}</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Paid via {order.payment}</p>
          </div>

          {/* Delivery Address */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-display font-semibold text-gray-900 mb-4">📍 Delivery Address</h2>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-800">{order.address.name}</p>
              <p className="text-gray-600">{order.address.line}</p>
              <p className="text-gray-600">📞 {order.address.phone}</p>
            </div>

            <div className="mt-6 bg-primary-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🚚</span>
                <p className="font-medium text-primary-800">Estimated Delivery</p>
              </div>
              <p className="text-primary-700 font-semibold text-lg">Today, by 5:00 PM</p>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-5 flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800">Need help with this order?</p>
            <p className="text-sm text-gray-500">Contact our support team</p>
          </div>
          <a href="https://wa.me/919876543210" className="btn-primary text-sm !py-2">💬 Chat on WhatsApp</a>
        </div>
      </div>
    </div>
  );
}
