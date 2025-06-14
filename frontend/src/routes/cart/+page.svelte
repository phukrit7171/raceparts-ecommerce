<!-- frontend/src/routes/cart/+page.svelte -->
<script>
    import { cartItems, cartCount } from '$lib/stores/cartStore.js';
    import api from '$lib/api.js';
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';

    let subtotal = 0;
    let isLoading = false;

    // Reactive statement to calculate subtotal whenever the cart items change
    $: {
        if ($cartItems && $cartItems.length > 0) {
            subtotal = $cartItems.reduce((sum, item) => sum + item.quantity * item.Product.price, 0);
        } else {
            subtotal = 0;
        }
    }

    async function updateQuantity(itemId, newQuantity) {
        if (newQuantity < 1) {
            return removeItem(itemId);
        }
        try {
            await api.patch(`/api/cart/${itemId}`, { quantity: newQuantity });
            // Update the store for instant UI feedback
            $cartItems = $cartItems.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            );
            $cartCount = $cartItems.reduce((sum, item) => sum + item.quantity, 0);
        } catch (error) {
            Swal.fire('Error', 'Could not update item quantity.', 'error');
        }
    }

    async function removeItem(itemId) {
        try {
            await api.delete(`/api/cart/${itemId}`);
            const removedItem = $cartItems.find(item => item.id === itemId);
            // Update the store for instant UI feedback
            $cartItems = $cartItems.filter(item => item.id !== itemId);
            $cartCount -= removedItem.quantity;
        } catch (error) {
            Swal.fire('Error', 'Could not remove item from cart.', 'error');
        }
    }

    async function handleCheckout() {
        isLoading = true;
        Swal.fire({
            title: 'Redirecting to Checkout',
            text: 'Please wait while we prepare your secure payment page.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await api.post('/api/payment/create-checkout-session', {
                // Pass the browser's origin so Stripe can redirect back correctly
                origin: window.location.origin 
            });

            if (response.data.url) {
                // Redirect the user to the Stripe Checkout page
                window.location.href = response.data.url;
            }
        } catch (error) {
            Swal.fire('Checkout Error', 'Could not initiate the checkout process. Please try again.', 'error');
        } finally {
            // This might not be reached if redirect is successful
            isLoading = false; 
        }
    }
</script>

<div class="container py-5">
    <h1 class="mb-4">Your Shopping Cart</h1>

    {#if $cartItems && $cartItems.length > 0}
        <div class="row">
            <!-- Cart Items -->
            <div class="col-lg-8">
                {#each $cartItems as item (item.id)}
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="d-flex justify-content-between">
                                <div class="d-flex flex-row align-items-center">
                                    <div>
                                        <img src="https://dummyimage.com/100x100/dee2e6/6c757d.jpg" class="img-fluid rounded-3" alt={item.Product.name} style="width: 65px;">
                                    </div>
                                    <div class="ms-3">
                                        <h5>{item.Product.name}</h5>
                                        <p class="small mb-0">Product Slug: {item.Product.slug}</p>
                                    </div>
                                </div>
                                <div class="d-flex flex-row align-items-center">
                                    <div style="width: 100px;">
                                        <input type="number" min="1" class="form-control form-control-sm text-center" value={item.quantity} on:change={(e) => updateQuantity(item.id, parseInt(e.target.value))} />
                                    </div>
                                    <div style="width: 100px;" class="ms-4">
                                        <h5 class="mb-0">${(item.Product.price * item.quantity).toFixed(2)}</h5>
                                    </div>
                                    <button on:click={() => removeItem(item.id)} class="btn btn-link text-danger ms-2"><i class="fas fa-trash fa-lg"></i>X</button>
                                </div>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>

            <!-- Cart Summary -->
            <div class="col-lg-4">
                <div class="card bg-primary text-white rounded-3">
                    <div class="card-body">
                        <h5 class="card-title">Cart Summary</h5>
                        <hr>
                        <div class="d-flex justify-content-between mb-4">
                            <p class="mb-2">Subtotal</p>
                            <p class="mb-2">${subtotal.toFixed(2)}</p>
                        </div>

                        <button type="button" class="btn btn-info btn-block btn-lg w-100" on:click={handleCheckout} disabled={isLoading}>
                            <div class="d-flex justify-content-between">
                                <span>Checkout</span>
                                <span>${subtotal.toFixed(2)} <i class="fas fa-long-arrow-alt-right ms-2"></i></span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    {:else}
        <div class="text-center py-5">
            <h2>Your cart is empty.</h2>
            <p>Looks like you haven't added any parts yet!</p>
            <a href="/" class="btn btn-primary mt-3">Start Shopping</a>
        </div>
    {/if}
</div>