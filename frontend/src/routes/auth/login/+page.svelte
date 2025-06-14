<!-- frontend/src/routes/auth/login/+page.svelte -->
<script>
    import { goto } from '$app/navigation';
    import api from '$lib/api.js';
    import Swal from 'sweetalert2';

    let email = '';
    let password = '';
    let isLoading = false;

    async function handleLogin() {
        isLoading = true;
        try {
            const response = await api.post('/api/auth/login', {
                email,
                password
            });

            if (response.data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'You have been logged in.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                // Redirect to the homepage after successful login
                await goto('/'); 
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
            Swal.fire({
                title: 'Login Error',
                text: errorMessage,
                icon: 'error'
            });
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
            <div class="card shadow">
                <div class="card-body p-4 p-md-5">
                    <h2 class="text-center mb-4">Login</h2>
                    <form on:submit|preventDefault={handleLogin}>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email address</label>
                            <input type="email" class="form-control" id="email" bind:value={email} required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" bind:value={password} required>
                        </div>
                        <button type="submit" class="btn btn-primary w-100" disabled={isLoading}>
                            {#if isLoading}
                                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Logging in...
                            {:else}
                                Login
                            {/if}
                        </button>
                    </form>
                    <div class="text-center mt-3">
                        <p>Don't have an account? <a href="/auth/register">Register here</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>