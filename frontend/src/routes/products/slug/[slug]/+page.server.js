import api from '$lib/api';

export async function load({ params }) {
  try {
    // Try fetching by slug or UUID
    let res = await api.get(`/api/products/${params.slug}`);
    if (res.data.success) {
      return { product: res.data.data };
    } else {
      // If first attempt fails, assume params.slug might be a UUID and try a different approach if backend supports it
      res = await api.get(`/api/products/uuid/${params.slug}`);
      if (res.data.success) {
        return { product: res.data.data };
      } else {
        throw new Error('Product not found or API error');
      }
    }
  } catch (error) {
    // Return a default or error state if the product fetch fails
    return { product: null, error: 'Could not load product data' };
  }
}
