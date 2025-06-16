<script>
  import { cart } from '$lib/stores/cart.js';
  import api from '$lib/api.js';
  import Swal from 'sweetalert2';

  async function updateQuantity(item, newQuantity) {
    try {
      const res = await api.put(`/api/cart/${item.id}`, { quantity: newQuantity });
      if (res.data.success) {
        cart.set(res.data.data);
        Swal.fire({
          title: 'Quantity Updated',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false
        });
      } else {
        Swal.fire('Update Failed', res.data.message || 'Could not update quantity.', 'error');
      }
    } catch (error) {
      Swal.fire('Update Error', 'An error occurred while updating quantity.', 'error');
    }
  }
</script>

<h2>Your Cart</h2>
{#if $cart.items.length === 0}
  <p>Your cart is empty.</p>
{:else}
  <div class="row">
    {#each $cart.items as item}
      <div class="col-md-6">
        <div class="card mb-3">
          <div class="card-body">
            <h5>{item.product.name}</h5>
            <p>${item.product.price}</p>
            <input type="number" bind:value={item.quantity} min="1" on:change={() => updateQuantity(item, item.quantity)} />
          </div>
        </div>
      </div>
    {/each}
  </div>
  <h4>Total: ${$cart.totalPrice}</h4>
  <a href="/payment" class="btn btn-success">Proceed to Checkout</a>
{/if}
