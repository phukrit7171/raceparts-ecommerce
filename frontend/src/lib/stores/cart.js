import { writable, derived } from 'svelte/store';
import api from '$lib/api.js';
import Swal from 'sweetalert2';
import { browser } from '$app/environment';

// Initialize cart
export const cart = writable({ items: [], totalPrice: 0 });

// Only persist to localStorage in browser
if (browser) {
  // Initialize from localStorage if available
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    cart.set(JSON.parse(storedCart));
  }
  
  // Subscribe to cart changes
  cart.subscribe(value => {
    localStorage.setItem('cart', JSON.stringify(value));
  });
}

// Derived stores
export const cartItems = derived(cart, ($c) => $c.items);
export const cartCount = derived(cart, ($c) =>
  $c.items.reduce((s, i) => s + i.quantity, 0)
);

// Re-export helper functions
export async function fetchCart() {
  try {
    const res = await api.get('/api/cart');
    cart.set(res.data);
  } catch (err) {
    cart.set({ items: [], totalPrice: 0 });
  }
}

export async function addToCart(product) {
  try {
    const res = await api.post('/api/cart', { productId: product.id, quantity: 1 });
    cart.set(res.data);
    
    // Show success feedback
    Swal.fire({
      title: 'Added to Cart!',
      text: `${product.name} has been added to your cart.`,
      icon: 'success',
      timer: 1500,
      showConfirmButton: false
    });
    
    return true;
  } catch (error) {
    console.error('Error adding to cart:', error);
    Swal.fire('Error', 'Could not add item to cart. Please try again.', 'error');
    return false;
  }
}
