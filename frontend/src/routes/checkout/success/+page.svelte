<script>
  import { onMount } from 'svelte';
  import Swal from 'sweetalert2';
  import { cart } from '$lib/stores/cart.js';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';

  onMount(async () => {
    if (!browser) return;
    
    // Clear the cart after successful payment
    cart.set([]);
    
    // Show success message
    await Swal.fire({
      title: 'Payment Successful!',
      text: 'Your order has been placed successfully.',
      icon: 'success',
      confirmButtonText: 'Continue Shopping'
    });
    
    // Redirect to home page
    goto('/');
  });
</script>

<div class="success-container">
  <h1>Thank You for Your Purchase!</h1>
  <p>Your payment was processed successfully. You will receive an order confirmation email shortly.</p>
  <p>Redirecting to homepage...</p>
</div>

<style>
  .success-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    text-align: center;
  }
  
  h1 {
    color: #28a745;
    margin-bottom: 1rem;
  }
</style>
