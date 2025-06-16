<script>
  export let data;
  import { addToCart } from '$lib/stores/cart.js';
  import Swal from 'sweetalert2';
  import { fade } from 'svelte/transition';
  
  // Format price as currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };
  
  // Loading state for add to cart button
  let adding = false;
</script>

{#if data.product}
  <div class="row">
    <div class="col-md-6">
      <img 
        src={data.product.images?.[0] || '/placeholder.jpg'} 
        alt={data.product.name} 
        class="img-fluid"
        style="max-height: 400px; object-fit: contain;"
        on:error={(e) => e.target.src = '/placeholder.jpg'}
      />
    </div>
    <div class="col-md-6">
      <h2>{data.product.name}</h2>
      <p class="fs-4">{formatPrice(data.product.price)}</p>
      <button 
        class="btn btn-success" 
        on:click={async () => {
          adding = true;
          await addToCart(data.product);
          adding = false;
        }}
        disabled={adding}
      >
        {adding ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  </div>
{:else if data.error}
  <div class="alert alert-danger" role="alert" in:fade>
    {data.error} The product identifier might not match. Please ensure the URL is correct or return to the homepage to select a product.
  </div>
{:else}
  <div class="d-flex justify-content-center align-items-center" style="height: 300px;">
    <div class="spinner-border text-primary" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
{/if}
