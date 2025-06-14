// frontend/src/routes/products/slug/[slug]/+page.server.js
import api from '$lib/api.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
    // params.slug contains the value from the URL, e.g., "eibach-springs"
    console.log(`[Frontend] Loading single product with slug: ${params.slug}`);
    try {
        const response = await api.get(`/api/products/slug/${params.slug}`);
        return {
            product: response.data.data
        };
    } catch (error) {
        console.error(`Failed to load product ${params.slug}:`, error);
        // You can handle errors more gracefully here, e.g., by returning a status code
        return {
            product: null,
            error: 'Could not fetch product.'
        };
    }
}