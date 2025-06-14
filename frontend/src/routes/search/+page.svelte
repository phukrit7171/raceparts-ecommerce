<!-- src/routes/search/+page.svelte -->
<script>
  export let data;
  let searchTerm = data.searchTerm;

  $: filteredProducts = data.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
</script>

<div class="container py-5">
  <h1 class="mb-4">Search Results for "{searchTerm}"</h1>
  <div class="row g-4">
    {#if filteredProducts.length}
      {#each filteredProducts as product}
        <div class="col-md-4">
          <!-- Reuse product card component -->
          <ProductCard {product} />
        </div>
      {/each}
    {:else}
      <p>No products found matching your search.</p>
    {/if}
  </div>
</div>