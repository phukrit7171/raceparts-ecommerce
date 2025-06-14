// frontend/src/routes/+layout.server.js
import api from '$lib/api.js';

export async function load({ request }) {
    try {
        const cookie = request.headers.get('cookie') || '';
        const userResponse = await api.get('/api/auth/me', {
            headers: { Cookie: cookie }
        });
        
        if (userResponse.data.success) {
            const user = userResponse.data.user;

            const cartResponse = await api.get('/api/cart', {
                 headers: { Cookie: cookie }
            });

            if (cartResponse.data.success) {
                return {
                    user: user,
                    cart: cartResponse.data.data.items || []
                };
            }
        }
    } catch (error) {
        // This is expected if the user is not logged in.
    }
    
    return { user: null, cart: [] };
}