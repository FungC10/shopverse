import { CartItem } from './validation';

const CART_KEY = 'shopverse:cart';
const EMAIL_KEY = 'shopverse:email';

export type CartItemWithProduct = CartItem & {
  product?: {
    name: string;
    unitAmount: number;
    currency: string;
    imageUrl: string;
  };
};

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CART_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function setCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  const limited = items.slice(0, 20); // max 20 items
  localStorage.setItem(CART_KEY, JSON.stringify(limited));
}

export function addItem(productId: string, quantity: number = 1): void {
  const cart = getCart();
  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, 10);
  } else {
    cart.push({ productId, quantity: Math.min(quantity, 10) });
  }

  setCart(cart);
}

// Alias for backwards compatibility
export const addToCart = addItem;

export function updateQty(productId: string, quantity: number): void {
  const cart = getCart();
  const item = cart.find((item) => item.productId === productId);

  if (item) {
    if (quantity <= 0) {
      setCart(cart.filter((item) => item.productId !== productId));
    } else {
      item.quantity = Math.min(quantity, 10);
      setCart(cart);
    }
  }
}

// Alias for backwards compatibility
export const updateCartItem = updateQty;

export function removeItem(productId: string): void {
  const cart = getCart();
  setCart(cart.filter((item) => item.productId !== productId));
}

// Alias for backwards compatibility
export const removeFromCart = removeItem;

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_KEY);
}

export function total(
  items: CartItem[],
  products: Map<string, { unitAmount: number; currency: string }>
): number {
  return items.reduce((sum, item) => {
    const product = products.get(item.productId);
    if (product) {
      return sum + product.unitAmount * item.quantity;
    }
    return sum;
  }, 0);
}

export function getStoredEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function saveEmail(email: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EMAIL_KEY, email);
}

