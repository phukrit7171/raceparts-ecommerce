// src/routes/search/+page.server.js
import { api } from '$lib/api';

export async function load({ url, fetch }) {
  const searchTerm = url.searchParams.get('q') || '';
  const res = await api.get(`/api/products?search=${searchTerm}`, { fetch });
  
  return { 
    products: res.data,
    searchTerm
  };
}