<!-- src/routes/orders/+page.svelte -->
<script>
  export let data;
</script>

<div class="container py-5">
  <h1 class="mb-4">Order History</h1>
  {#if data.orders.length}
    <div class="list-group">
      {#each data.orders as order}
        <a href="/orders/{order.id}" class="list-group-item list-group-item-action">
          <div class="d-flex w-100 justify-content-between">
            <h5 class="mb-1">Order #{order.id}</h5>
            <small>{new Date(order.createdAt).toLocaleDateString()}</small>
          </div>
          <p class="mb-1">Total: ${order.totalPrice}</p>
        </a>
      {/each}
    </div>
  {:else}
    <p>You have no orders yet.</p>
  {/if}
</div>