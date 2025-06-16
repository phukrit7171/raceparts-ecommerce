<script>
  import { onMount } from 'svelte';
  import api from '$lib/api.js';
  import Swal from 'sweetalert2';
  import { browser } from '$app/environment';

  onMount(async () => {
    if (!browser) return;
    
    try {
      const res = await api.post('/api/payment/create-checkout-session', {
        origin: window.location.origin
      });
      
      if (res.data.success && res.data.url) {
        window.location.href = res.data.url;
      } else {
        Swal.fire('Payment Error', 'Could not create checkout session.', 'error');
      }
    } catch (error) {
      Swal.fire('Payment Error', 'An error occurred while processing payment.', 'error');
    }
  });
</script>

<div class="payment-processing">
  <h2>Processing Payment...</h2>
  <p>Please wait while we redirect you to the secure payment gateway.</p>
</div>

<style>
  .payment-processing {
    text-align: center;
    padding: 2rem;
  }
</style>
