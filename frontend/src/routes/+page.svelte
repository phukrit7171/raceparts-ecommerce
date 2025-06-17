<!-- frontend/src/routes/+page.svelte -->
<script>
    /** @type {import('./$types').PageData} */
    export let data;

    // Data from server load function, reactive to changes
    $: products = data.products || [];
    $: categories = data.categories || [];
    $: error = data.error;

    // Function to group products by category
    function groupProductsByCategory(prods) {
        const grouped = new Map();
        
        if (!prods || prods.length === 0) {
            return grouped;
        }

        // Create an 'All' category
        grouped.set('All', [...prods]);
        
        // Group by category
        prods.forEach(product => {
            const categoryName = product.category?.name || 'Uncategorized';
            if (!grouped.has(categoryName)) {
                grouped.set(categoryName, []);
            }
            grouped.get(categoryName).push(product);
        });
        
        return grouped;
    }
    
    // Reactive statement to group products whenever the products data changes
    $: groupedProducts = groupProductsByCategory(products);
</script>

<!-- Header-->
<header class="bg-dark py-5">
    <div class="container px-4 px-lg-5 my-5">
        <div class="text-center text-white">
            <h1 class="display-4 fw-bolder">RaceParts Performance</h1>
            <p class="lead fw-normal text-white-50 mb-0">Your Source for High-Quality Automotive Accessories</p>
        </div>
    </div>
</header>

<!-- Section-->
<section class="py-5">
    <div class="container px-4 px-lg-5 mt-5">
        {#if error}
            <div class="alert alert-danger w-100 text-center">{error}</div>
        {:else if products && products.length > 0}
            {#each Array.from(groupedProducts.entries()) as [category, categoryProducts]}
                {#if categoryProducts.length > 0}
                    <div class="mb-5">
                        <h2 class="fw-bolder mb-4">{category} <small class="text-muted">({categoryProducts.length} items)</small></h2>
                        <div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4">
                            {#each categoryProducts as product}
                                <div class="col mb-5">
                                    <div class="card h-100">
                                        <!-- Product image-->
                                        <img 
                                            class="card-img-top" 
                                            src={product.images && product.images.length > 0 ? product.images[0] : "https://dummyimage.com/450x300/dee2e6/6c757d.jpg"} 
                                            alt={product.name} 
                                            style="height: 200px; object-fit: cover;"
                                        />
                                        <!-- Product details-->
                                        <div class="card-body p-4">
                                            <div class="text-center">
                                                <!-- Product name-->
                                                <h5 class="fw-bolder">{product.name}</h5>
                                                <!-- Product price-->
                                                <div>THB {product.price?.toLocaleString()}</div>
                                                {#if product.category?.name}
                                                    <small class="text-muted">{product.category.name}</small>
                                                {/if}
                                            </div>
                                        </div>
                                        <!-- Product actions-->
                                        <div class="card-footer p-4 pt-0 border-top-0 bg-transparent">
                                            <div class="text-center">
                                                <a class="btn btn-outline-dark mt-auto" href="/products/slug/{product.slug}">View options</a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                        {#if category !== 'All'}
                            <div class="text-end mb-5">
                                <a href="/products?category={category.toLowerCase().replace(/\s+/g, '-')}" class="btn btn-link">
                                    View all in {category} →
                                </a>
                            </div>
                        {/if}
                    </div>
                {/if}
            {/each}
        {:else}
            <div class="text-center py-5">
                <p>No products found in any category.</p>
                <a href="/products" class="btn btn-primary">Browse All Products</a>
            </div>
        {/if}
    </div>
</section>
