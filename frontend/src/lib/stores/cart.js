import { writable, derived } from 'svelte/store';
import api from '$lib/api.js';
import Swal from 'sweetalert2';
import { browser } from '$app/environment';

// Helper function to normalize cart items
const normalizeCartItem = (item) => {
  // Standardize property names
  const product = item.product || item.Product || {};
  const quantity = item.quantity || 1;
  const id = item.id || product.id;
  
  return {
    id,
    product: {
      id: product.id,
      name: product.name,
      price: product.price,
      // Add other necessary product properties
    },
    quantity
  };
};

// Initialize cart with only items array
export const cart = writable({ items: [] });

// Only persist to localStorage in browser
if (browser) {
  // Initialize from localStorage with normalization
  const storedCart = localStorage.getItem('cart');
  if (storedCart) {
    try {
      const parsed = JSON.parse(storedCart);
      const normalizedItems = parsed.items ? parsed.items.map(normalizeCartItem) : [];
      cart.set({ items: normalizedItems });
    } catch (e) {
      console.error('Error parsing cart from localStorage:', e);
      cart.set({ items: [] });
    }
  }
  
  // Subscribe to cart changes
  cart.subscribe(value => {
    localStorage.setItem('cart', JSON.stringify(value));
  });
}

// Derived stores
export const cartItems = derived(cart, $cart => $cart.items);
export const cartCount = derived(cart, $cart => 
  $cart.items.reduce((total, item) => total + item.quantity, 0)
);
export const cartTotal = derived(cart, $cart =>
  $cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
);

// Helper functions
export async function fetchCart() {
  try {
    const res = await api.get('/api/cart');
    // Check if response has items array or is the cart object
    if (Array.isArray(res.data.items)) {
      const normalizedItems = res.data.items.map(normalizeCartItem);
      cart.set({ items: normalizedItems });
    } else {
      // Handle case where response is the entire cart object
      const normalizedItems = res.data.map(normalizeCartItem);
      cart.set({ items: normalizedItems });
    }
  } catch (err) {
    console.error('Error fetching cart:', err);
    cart.set({ items: [] });
  }
}

export async function addToCart(product) {
  try {
    const res = await api.post('/api/cart', { 
      productId: product.id, 
      quantity: 1 
    });
    
    // Handle different response formats
    let itemsArray;
    if (Array.isArray(res.data.items)) {
      itemsArray = res.data.items;
    } else if (Array.isArray(res.data)) {
      itemsArray = res.data;
    } else {
      throw new Error('Invalid cart response format');
    }
    
    const normalizedItems = itemsArray.map(normalizeCartItem);
    cart.set({ items: normalizedItems });
    
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
