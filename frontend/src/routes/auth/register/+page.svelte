<!-- frontend/src/routes/auth/register/+page.svelte -->
<script>
    import { goto } from '$app/navigation';
    import api from '$lib/api.js';
    import Swal from 'sweetalert2';

    let userData = {
        first_name: '',
        last_name: '',
        email: '',
        password: ''
    };
    let isLoading = false;

    async function handleRegister() {
        isLoading = true;
        try {
            const response = await api.post('/api/auth/register', userData);

            if (response.data.success) {
                Swal.fire({
                    title: 'Registration Successful!',
                    text: 'You have been registered and logged in.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                await goto('/');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
            Swal.fire({
                title: 'Registration Error',
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
                    <h2 class="text-center mb-4">Register</h2>
                    <form on:submit|preventDefault={handleRegister}>
                         <div class="row">
                            <div class="col-md-6 mb-3">
                                <label for="firstName" class="form-label">First Name</label>
                                <input type="text" class="form-control" id="firstName" bind:value={userData.first_name} required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label for="lastName" class="form-label">Last Name</label>
                                <input type="text" class="form-control" id="lastName" bind:value={userData.last_name} required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="email" class="form-label">Email address</label>
                            <input type="email" class="form-control" id="email" bind:value={userData.email} required>
                        </div>
                        <div class="mb-3">
                            <label for="password" class="form-label">Password</label>
                            <input type="password" class="form-control" id="password" bind:value={userData.password} required minlength="6">
                        </div>
                        <button type="submit" class="btn btn-primary w-100" disabled={isLoading}>
                            {#if isLoading}
                                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Registering...
                            {:else}
                                Register
                            {/if}
                        </button>
                    </form>
                    <div class="text-center mt-3">
                        <p>Already have an account? <a href="/auth/login">Login here</a></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>