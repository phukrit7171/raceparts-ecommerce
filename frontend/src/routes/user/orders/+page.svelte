<script>
  import { orders } from './+page.server';
</script>

<h2>My Orders</h2>
<ul class="list-group">
  {#each orders as order}
    <li class="list-group-item">
      Order ID: {order.id} | Total: ${order.totalPrice}
    </li>
  {/each}
</ul>