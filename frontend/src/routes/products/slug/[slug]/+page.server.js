import api from '$lib/api';

export async function load({ params, setHeaders }) {
  try {
    const { slug } = params;
    const res = await api.get(`/api/products/slug/${slug}`);

    if (res.data && res.data.success) {
      // Cache the product page for better performance
      setHeaders({
        'cache-control': 'public, max-age=3600' // Cache for 1 hour
      });
      return { product: res.data.data };
    } else {
      // Handle cases where the API returns an error (e.g., product not found)
      return {
        product: null,
        error: res.data.message || 'Could not load product data. The product may not exist.'
      };
    }
  } catch (error) {
    // Handle network errors or other exceptions during the API call
    const errorMessage = error.response?.data?.message || 'A server error occurred while fetching the product.';
    return { product: null, error: errorMessage };
  }
}
