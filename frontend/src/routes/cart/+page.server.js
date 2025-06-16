import api from '$lib/api';

export async function load() {
  try {
    const res = await api.get('/api/cart');
    if (res.data.success) {
      return { cart: res.data.data };
    } else {
      return { cart: { items: [], totalPrice: 0 } };
    }
  } catch (error) {
    // Handle unauthorized or other errors by returning an empty cart
    return { cart: { items: [], totalPrice: 0 } };
  }
}
