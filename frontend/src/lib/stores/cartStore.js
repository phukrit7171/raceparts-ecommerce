// frontend/src/lib/stores/cartStore.js
import { writable } from 'svelte/store';

export const cartItems = writable([]);
export const cartCount = writable(0);
