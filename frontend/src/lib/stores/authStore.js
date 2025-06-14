// frontend/src/lib/stores/authStore.js
import { writable } from 'svelte/store';

// The store will hold the user object if logged in, otherwise null.
export const user = writable(null);