<!-- frontend/src/routes/+page.svelte -->
<script>
    /** @type {import('./$types').PageData} */
    export let data;

    // This is a clean way to handle the data prop from the server load function.
    const products = data.products || [];
    const error = data.error;
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
        <div class="row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center">
            
            {#if error}
                <div class="alert alert-danger w-100 text-center">{error}</div>
            {:else if products.length > 0}
                <!-- Loop through each product and render a card -->
                {#each products as product}
                    <div class="col mb-5">
                        <div class="card h-100">
                            <!-- Product image-->
                            <img class="card-img-top" src="https://dummyimage.com/450x300/dee2e6/6c757d.jpg" alt={product.name} />
                            <!-- Product details-->
                            <div class="card-body p-4">
                                <div class="text-center">
                                    <!-- Product name-->
                                    <h5 class="fw-bolder">{product.name}</h5>
                                    <!-- Product price-->
                                    THB {product.price}
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
            {:else}
                 <p>No products found.</p>
            {/if}

        </div>
    </div>
</section>