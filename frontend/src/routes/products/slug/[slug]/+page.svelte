<!-- frontend/src/routes/products/slug/[slug]/+page.svelte -->
<script>
    import Swal from 'sweetalert2';

    /** @type {import('./$types').PageData} */
    export let data;
    const { product } = data;

    function handleAddToCart() {
        // We will implement this later
        Swal.fire({
            title: 'Coming Soon!',
            text: 'Add to cart functionality will be implemented soon.',
            icon: 'info'
        });
    }
</script>

{#if product}
    <!-- Product section-->
    <section class="py-5">
        <div class="container px-4 px-lg-5 my-5">
            <div class="row gx-4 gx-lg-5 align-items-center">
                <div class="col-md-6">
                    <img class="card-img-top mb-5 mb-md-0" src="https://dummyimage.com/600x700/dee2e6/6c757d.jpg" alt={product.name} />
                </div>
                <div class="col-md-6">
                    <div class="small mb-1">SKU: BST-498</div>
                    <h1 class="display-5 fw-bolder">{product.name}</h1>
                    <div class="fs-5 mb-5">
                        <!-- <span class="text-decoration-line-through">$45.00</span> -->
                        <span>${product.price}</span>
                    </div>
                    <p class="lead">{product.description}</p>
                    <div class="d-flex">
                        <input class="form-control text-center me-3" id="inputQuantity" type="num" value="1" style="max-width: 3rem" />
                        <button class="btn btn-outline-dark flex-shrink-0" type="button" on:click={handleAddToCart}>
                            <i class="bi-cart-fill me-1"></i>
                            Add to cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </section>
{:else}
    <section class="py-5 text-center">
        <h2 class="text-danger">Product Not Found</h2>
        <p>{data.error || 'The product you are looking for does not exist.'}</p>
        <a href="/" class="btn btn-primary">Go to Homepage</a>
    </section>
{/if}

<!-- Related items section-->
<section class="py-5 bg-light">
    <!-- We can add related products here later -->
</section>