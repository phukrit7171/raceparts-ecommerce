import { writable } from 'svelte/store';
import api from '../api.js';
import { browser } from '$app/environment';

// Create in-memory user store (no persistent storage)
export const user = writable(null);

export async function fetchUser() {
  try {
    const res = await api.get('/auth/me');
    user.set(res.data);
    return res.data;
  } catch (err) {
    user.set(null);
    throw err;
  }
}

// Initialize user on store load in browser
if (browser) {
  fetchUser().catch(() => console.log("Not authenticated"));
}
