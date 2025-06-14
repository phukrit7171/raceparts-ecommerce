<!-- frontend/src/routes/checkout/success/+page.svelte -->
<script>
    import { page } from '$app/stores';
    import { onMount } from 'svelte';
    import { cartItems, cartCount } from '$lib/stores/cartStore.js';

    const sessionId = $page.url.searchParams.get('session_id');

    // When this page loads, the order is complete.
    // We should clear the cart in our frontend store for a clean state.
    onMount(() => {
        $cartItems = [];
        $cartCount = 0;
    });

</script>
<div class="container py-5 text-center">
    <div class="card mx-auto" style="max-width: 500px;">
        <div class="card-body p-5">
            <h1 class="text-success">✓</h1>
            <h2>Payment Successful!</h2>
            <p class="lead">Thank you for your order.</p>
            <p>Your parts are on the way. You can view your order details in your profile.</p>
            {#if sessionId}
                <p class="small text-muted">Stripe Session ID: {sessionId}</p>
            {/if}
            <hr>
            <a href="/orders" class="btn btn-primary">View My Orders</a>
            <a href="/" class="btn btn-outline-secondary ms-2">Continue Shopping</a>
        </div>
    </div>
</div>