// frontend/src/routes/admin/+page.server.js
import api from '$lib/api.js';

export async function load({ request }) {
    try {
        const cookie = request.headers.get('cookie') || '';
        const response = await api.get('/api/admin/check', {
            headers: { Cookie: cookie }
        });
        
        if (!response.data.success) {
            return {
                status: 403,
                error: 'Access denied to admin panel'
            };
        }
        
        return {
            adminData: response.data
        };
    } catch (error) {
        return {
            status: 500,
            error: 'Failed to verify admin access'
        };
    }
}
