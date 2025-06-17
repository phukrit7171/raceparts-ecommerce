// frontend/src/routes/+page.server.js
import { api } from '$lib/api';

/** @type {import('./$types').PageServerLoad} */
export async function load({ fetch }) {
    try {
        // Fetch products and categories in parallel
        const [productsRes, categoriesRes] = await Promise.all([
            api.get('/api/products?limit=50'),
            api.get('/api/products/categories')
        ]);

        const products = productsRes.data.data || [];
        const categories = categoriesRes.data.data || [];

        return {
            products,
            categories
        };
    } catch (error) {
        console.error('Error loading page data:', error);
        return {
            error: 'Could not load page data. Please try again later.',
            products: [],
            categories: []
        };
    }
}