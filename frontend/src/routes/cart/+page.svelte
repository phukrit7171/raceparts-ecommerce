<script>
  import { cart, cartTotal, cartItems } from '$lib/stores/cart.js';
  import api from '$lib/api.js';
  import Swal from 'sweetalert2';
  import AuthGuard from '$lib/components/AuthGuard.svelte';

  let loading = false;
  
  async function updateQuantity(item, newQuantity) {
    if (newQuantity < 1) return removeItem(item.id);
    
    try {
      loading = true;
      // Optimistic update
      cart.update(c => {
        const items = c.items.map(i => 
          i.id === item.id ? {...i, quantity: newQuantity} : i
        );
        return { items };
      });
      
      const res = await api.patch(`/api/cart/${item.id}`, { quantity: newQuantity });
      cart.set({ items: res.data.items });
    } catch (error) {
      Swal.fire('Error', 'Failed to update quantity', 'error');
      // Revert on error
      cart.update(c => {
        const items = c.items.map(i => 
          i.id === item.id ? {...i, quantity: item.quantity} : i
        );
        return { items };
      });
    } finally {
      loading = false;
    }
  }

  async function removeItem(id) {
    try {
      loading = true;
      // Optimistic removal
      cart.update(c => ({
        items: c.items.filter(item => item.id !== id)
      }));
      
      await api.delete(`/api/cart/${id}`);
    } catch (error) {
      Swal.fire('Error', 'Failed to remove item', 'error');
      // Revert on error by refetching
      fetchCart();
    } finally {
      loading = false;
    }
  }

  async function fetchCart() {
    try {
      loading = true;
      const res = await api.get('/api/cart');
      cart.set({ items: res.data.items });
    } catch (error) {
      Swal.fire('Error', 'Failed to load cart', 'error');
    } finally {
      loading = false;
    }
  }
</script>

<AuthGuard>
  <h2>Your Cart</h2>
  
  {#if loading}
    <div class="text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
  {:else if $cartItems.length === 0}
    <p>Your cart is empty.</p>
  {:else}
    <div class="row">
      {#each $cartItems as item (item.id)}
        <div class="col-md-6 mb-3">
          <div class="card">
            <div class="card-body">
              <div class="d-flex justify-content-between">
              <div>
                <h5>{item.product?.name ?? 'Product Name'}</h5>
                <p>${(item.product?.price ? item.product.price.toFixed(2) : '0.00')}</p>
              </div>
              <div>
                <img 
                  src={item.product?.images?.[0] || '/placeholder.jpg'} 
                  alt={item.product?.name ?? 'Product image'} 
                  class="img-thumbnail" 
                  style="max-width: 80px;"
                />
              </div>
              </div>
              
              <div class="d-flex align-items-center mt-2">
                <button 
                  class="btn btn-outline-secondary btn-sm" 
                  on:click={() => updateQuantity(item, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >-</button>
                
                <span class="mx-2">{item.quantity}</span>
                
                <button 
                  class="btn btn-outline-secondary btn-sm" 
                  on:click={() => updateQuantity(item, item.quantity + 1)}
                >+</button>
                
                <button 
                  class="btn btn-danger btn-sm ms-2" 
                  on:click={() => removeItem(item.id)}
                >
                  Remove
                </button>
              </div>
              
              <div class="mt-2 text-end">
                <strong>${(item.product?.price ? (item.product.price * item.quantity).toFixed(2) : '0.00')}</strong>
              </div>
            </div>
          </div>
        </div>
      {/each}
    </div>
    
    <div class="card mt-3">
      <div class="card-body">
        <h4 class="d-flex justify-content-between">
          <span>Total:</span>
          <span>${$cartTotal.toFixed(2)}</span>
        </h4>
        <a href="/payment" class="btn btn-primary w-100 mt-2">Proceed to Checkout</a>
      </div>
    </div>
  {/if}
</AuthGuard>
