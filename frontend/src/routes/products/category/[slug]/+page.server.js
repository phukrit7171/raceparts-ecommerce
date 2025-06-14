// src/routes/products/category/[slug]/+page.server.js
import { api } from '$lib/api';

export async function load({ params, fetch }) {
  const [categoryRes, productsRes] = await Promise.all([
    api.get(`/api/products/categories/${params.slug}`, { fetch }),
    api.get(`/api/products?category=${params.slug}`, { fetch })
  ]);

  return {
    category: categoryRes.data,
    products: productsRes.data
  };
}