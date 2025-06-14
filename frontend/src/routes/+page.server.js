// frontend/src/routes/+page.server.js
import api from '$lib/api';

export async function load() {
    console.log('[Homepage Server] Loading products...');
    try {
        const response = await api.get('/api/products');
        
        if (response.status === 200 && response.data.success) {
             console.log('[Homepage Server] API call successful. Returning products.');
            return {
                products: response.data.data,
                pagination: response.data.pagination
            };
        }
        
        console.error('[Homepage Server] API returned a non-successful response:', response.data);
        return { products: [], error: 'Failed to load products.' };

    } catch (error) {
        console.error('[Homepage Server] CRITICAL: Could not fetch products from API.', error.message);
        return {
            products: [],
            error: 'Could not connect to the server. Is it running?'
        };
    }
}