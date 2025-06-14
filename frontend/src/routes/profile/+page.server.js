// src/routes/profile/+page.server.js
import { api } from '$lib/api';

export async function load({ fetch }) {
  try {
    const res = await api.get('/api/auth/me', { fetch });
    return { user: res.data };
  } catch (error) {
    throw error;
  }
}