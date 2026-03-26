/**
 * Cart Utility — localStorage-based CRUD with session awareness.
 *
 * Cart structure in localStorage (key: 'oa_cart'):
 * [
 *   {
 *     id: <product_id>,
 *     variantId: <variant_id>,
 *     name: <string>,
 *     variant: <variant_name>,
 *     price: <number>,
 *     mrp: <number>,
 *     qty: <number>,
 *     image: <string>,
 *     slug: <string>,
 *     stock: <number>
 *   }
 * ]
 *
 * On new browser session (no sessionStorage flag), the guest cart is cleared.
 * On login, guest cart merges into user cart.
 */

const CART_KEY = 'oa_cart';
const SESSION_FLAG = 'oa_session_active';

// --- Session management ---

/** Ensure a fresh guest session starts with an empty cart */
export function initCartSession() {
  if (typeof window === 'undefined') return;
  // sessionStorage flag lives for the tab/browser session only
  if (!window.sessionStorage.getItem(SESSION_FLAG)) {
    // New session detected — clear guest cart
    const user = window.localStorage.getItem('oa_cart_user');
    if (!user) {
      // Only clear if guest (no logged-in user's cart)
      window.localStorage.removeItem(CART_KEY);
    }
    window.sessionStorage.setItem(SESSION_FLAG, 'true');
  }
}

// --- Core CRUD ---

export function getCart() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(CART_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveCart(items) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  // Dispatch custom event so Header badge and other listeners update
  window.dispatchEvent(new Event('cart-updated'));
}

export function addToCart(item) {
  const cart = getCart();
  const existing = cart.find(
    c => c.id === item.id && c.variantId === item.variantId
  );
  if (existing) {
    existing.qty = Math.min(existing.qty + (item.qty || 1), item.stock || 999);
  } else {
    cart.push({
      id: item.id,
      variantId: item.variantId,
      name: item.name,
      variant: item.variant,
      price: item.price,
      mrp: item.mrp,
      qty: item.qty || 1,
      image: item.image,
      slug: item.slug,
      stock: item.stock || 999,
    });
  }
  saveCart(cart);
  return cart;
}

export function updateQty(id, variantId, newQty) {
  let cart = getCart();
  if (newQty <= 0) {
    cart = cart.filter(c => !(c.id === id && c.variantId === variantId));
  } else {
    const item = cart.find(c => c.id === id && c.variantId === variantId);
    if (item) item.qty = Math.min(newQty, item.stock || 999);
  }
  saveCart(cart);
  return cart;
}

export function removeFromCart(id, variantId) {
  const cart = getCart().filter(c => !(c.id === id && c.variantId === variantId));
  saveCart(cart);
  return cart;
}

export function clearCart() {
  saveCart([]);
}

export function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

export function getCartTotal() {
  const cart = getCart();
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalMrp = cart.reduce((sum, item) => sum + item.mrp * item.qty, 0);
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  return { total, totalMrp, discount: totalMrp - total, count, typesCount: cart.length };
}

// --- Auth merge logic ---

/** Call this on login to merge any guest items into the active cart */
export function mergeGuestCart() {
  // Guest cart is whatever is in localStorage at login time.
  // After login, mark the cart as belonging to the user so it persists.
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('oa_cart_user', 'true');
}

/** Call this on logout to reset cart ownership (next session will clear) */
export function detachCartUser() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('oa_cart_user');
}
