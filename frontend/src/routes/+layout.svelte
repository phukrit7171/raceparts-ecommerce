<!-- frontend/src/routes/+layout.svelte -->

<script>
    import { onMount } from 'svelte';
    import Swal from 'sweetalert2';
import { cartItems, cartCount } from '$lib/stores/cart.js';
import { user } from '$lib/stores/auth.js';
import { cart } from '$lib/stores/cart.js';
    import 'bootstrap/dist/css/bootstrap.min.css';
    import '$lib/styles/template.css';
    import api from '$lib/api.js';

    /** @type {import('./$types').LayoutData} */
    export let data;

    $: {
        if (data?.user) {
            user.set(data.user);
        }
        if (data?.cart) {
            const total = data.cart.reduce((sum, item) => {
                const price = item.product?.price ?? item.Product?.price ?? item.price ?? 0;
                return sum + price * (item.quantity ?? 1);
            }, 0);
            cart.set({ items: data.cart, totalPrice: total });
        }
    }
    
    onMount(async () => {
        try {
            await import('bootstrap/dist/js/bootstrap.bundle.min.js');
        } catch (e) {
            console.error("Could not load Bootstrap JS", e);
        }
    });

    import { goto } from '$app/navigation';

    async function handleLogout() {
        try {
            await api.post('/api/auth/logout');
            user.set(null);
            cart.set({ items: [], totalPrice: 0 });
            Swal.fire({
                title: 'Logged Out',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false
            });
            // Navigate to home page without full reload
            goto('/');
        } catch (error) {
            Swal.fire('Logout Error', 'Could not log out.', 'error');
        }
    }
</script>

<div class="d-flex flex-column min-vh-100">
    <!-- Navigation-->
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container px-4 px-lg-5">
            <a class="navbar-brand" href="/">RaceParts</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
                    <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
                    <li class="nav-item"><a class="nav-link" href="/about">About</a></li>
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" id="navbarDropdown" href="/#" aria-current="page" role="button" data-bs-toggle="dropdown" aria-expanded="false">Shop</a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><a class="dropdown-item" href="/products">All Products</a></li>
                            <li><hr class="dropdown-divider" /></li>
                            <li><a class="dropdown-item" href="/products/popular">Popular Items</a></li>
                            <li><a class="dropdown-item" href="/products/new">New Arrivals</a></li>
                        </ul>
                    </li>
                </ul>
                <div class="d-flex align-items-center">
                    <a class="btn btn-outline-dark me-2" href="/cart">
                        <i class="bi-cart-fill me-1"></i>
                        Cart
                        <span class="badge bg-dark text-white ms-1 rounded-pill">{$cartCount}</span>
                    </a>
                    {#if $user}
                        <div class="dropdown">
                            <button class="btn btn-outline-primary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                               Welcome, {$user.first_name}
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><a class="dropdown-item" href="/profile">My Profile</a></li>
                                <li><a class="dropdown-item" href="/orders">My Orders</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><button class="dropdown-item" type="button" on:click={handleLogout}>Logout</button></li>
                            </ul>
                        </div>
                    {:else}
                        <a href="/auth/login" class="btn btn-primary">Login</a>
                    {/if}
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content Area -->
    <main class="flex-grow-1">
        <slot />
    </main>

    <!-- Footer-->
    <footer class="py-5 bg-dark mt-auto">
        <div class="container"><p class="m-0 text-center text-white">Copyright © RaceParts 2025</p></div>
    </footer>
</div>
