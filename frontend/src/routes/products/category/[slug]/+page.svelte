<!-- src/routes/products/category/[slug]/+page.svelte -->
<script>
  export let data;
</script>

<div class="container py-5">
  <h1 class="mb-4">Category: {data.category.name}</h1>
  <div class="row g-4">
    {#each data.products as product}
      <div class="col-md-4">
        <ProductCard {product} />
      </div>
    {/each}
  </div>
</div>