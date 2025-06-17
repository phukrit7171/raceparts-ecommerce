<script>
  import { filters, resetFilters } from '$lib/stores/filter.js';
  import { fade } from 'svelte/transition';
  import api from '$lib/api.js';

  let products = [];
  let categories = [];
  let loading = true;
  let error = null;

  // Load products and categories
  async function loadProducts() {
    loading = true;
    error = null;
    
    try {
      // Get current filter values
      let currentFilters;
      const unsubscribe = filters.subscribe(filters => {
        currentFilters = filters;
      });
      unsubscribe(); // Immediately unsubscribe after getting the value
      
      // Build query params
      const params = new URLSearchParams();
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.category) params.append('category', currentFilters.category);
      if (currentFilters.minPrice) params.append('minPrice', currentFilters.minPrice);
      if (currentFilters.maxPrice) params.append('maxPrice', currentFilters.maxPrice);
      if (currentFilters.sortBy) params.append('sort', currentFilters.sortBy);
      if (currentFilters.sortOrder) params.append('order', currentFilters.sortOrder);
      
      // Fetch products
      const res = await api.get(`/api/products?${params.toString()}`);
      products = res.data.data;
      
      // Fetch categories if not already loaded
      if (categories.length === 0) {
        const catRes = await api.get('/api/products/categories');
        categories = catRes.data.data;
      }
    } catch (err) {
      // Show backend error message if available
      if (err.response && err.response.data && err.response.data.message) {
        error = 'Failed to load products: ' + err.response.data.message;
      } else {
        error = 'Failed to load products';
      }
      // Log the full error and response for debugging
      console.error('Product load error:', err);
      if (err.response) {
        console.error('Backend response:', err.response);
      }
    } finally {
      loading = false;
    }
  }

  // Initialize on mount
  import { onMount } from 'svelte';
  onMount(() => {
    loadProducts();
  });
  
  // Reload products when filters change
  filters.subscribe(() => {
    loadProducts();
  });
</script>

<div class="container py-4">
  <h1>Shop All Products</h1>
  
  <div class="row mt-4">
    <!-- Filter sidebar -->
    <div class="col-md-3">
      <div class="card mb-4">
        <div class="card-header bg-light">
          <h5 class="mb-0">Filters</h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <label class="form-label">Search</label>
            <input type="text" class="form-control" bind:value={$filters.search}>
          </div>
          <div class="mb-3">
            <label class="form-label">Category</label>
            <select class="form-select" bind:value={$filters.category}>
              <option value="">All Categories</option>
              {#each categories as category}
                <option value={category.slug}>{category.name}</option>
              {/each}
            </select>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Price Range</label>
            <div class="row">
              <div class="col">
                <input type="number" class="form-control" placeholder="Min" bind:value={$filters.minPrice}>
              </div>
              <div class="col">
                <input type="number" class="form-control" placeholder="Max" bind:value={$filters.maxPrice}>
              </div>
            </div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Sort By</label>
            <select class="form-select" bind:value={$filters.sortBy}>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="createdAt">Newest</option>
            </select>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Sort Order</label>
            <select class="form-select" bind:value={$filters.sortOrder}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
          
          <button class="btn btn-outline-secondary w-100" on:click={resetFilters}>
            Reset Filters
          </button>
        </div>
      </div>
    </div>
    
    <!-- Product list -->
    <div class="col-md-9">
      {#if loading}
        <div class="d-flex justify-content-center align-items-center" style="height: 300px;">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      {:else if error}
        <div class="alert alert-danger" role="alert" in:fade>
          {error}
        </div>
      {:else if products.length === 0}
        <div class="alert alert-info" role="alert" in:fade>
          No products found matching your filters.
        </div>
      {:else}
        <div class="row row-cols-1 row-cols-md-3 g-4">
          {#each products as product}
            <div class="col">
              <div class="card h-100">
                <img 
                  src={product.images?.[0] || '/placeholder.jpg'} 
                  class="card-img-top" 
                  alt={product.name}
                  style="height: 200px; object-fit: cover;"
                >
                <div class="card-body">
                  <h5 class="card-title">{product.name}</h5>
                  <p class="card-text">${product.price}</p>
                  <a href={`/products/slug/${product.slug}`} class="btn btn-primary">
                    View Details
                  </a>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</div>
