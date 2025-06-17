<script>
  import { goto } from "$app/navigation";
  import api from '$lib/api.js';
  import { user } from '$lib/stores/auth.js';
  import Swal from 'sweetalert2';

  let name = '';
  let email = '';
  let password = '';
  let loading = false;

  async function register() {
    loading = true;
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      if (res.data.success) {
        user.set(res.data.user);
        await Swal.fire({
          title: 'Registration Successful!',
          text: 'You have been successfully registered.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        goto('/');
      } else {
        Swal.fire('Registration Failed', res.data.message || 'Could not register. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Swal.fire('Registration Error', 'An error occurred during registration. Please try again.', 'error');
    } finally {
      loading = false;
    }
  }
</script>

<div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
  <div class="card shadow-sm" style="width: 100%; max-width: 400px;">
    <div class="card-body p-4">
      <div class="text-center mb-4">
        <h1 class="h3 mb-1">Create an account</h1>
        <p class="text-muted">Sign up to get started</p>
      </div>
      
      <form on:submit|preventDefault={register} class="needs-validation" novalidate>
        <div class="mb-3">
          <label for="name" class="form-label">Full Name</label>
          <input
            id="name"
            type="text"
            bind:value={name}
            class="form-control form-control-lg"
            placeholder="Enter your full name"
            required
          />
        </div>
        
        <div class="mb-3">
          <label for="email" class="form-label">Email Address</label>
          <input
            id="email"
            type="email"
            bind:value={email}
            class="form-control form-control-lg"
            placeholder="Enter your email"
            required
          />
        </div>
        
        <div class="mb-4">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            type="password"
            bind:value={password}
            class="form-control form-control-lg"
            placeholder="Create a password"
            required
          />
        </div>
        
        <button class="btn btn-primary btn-lg w-100 mb-3" disabled={loading}>
          {#if loading}
            <span class="d-flex align-items-center justify-content-center gap-2">
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Creating account...
            </span>
          {:else}
            Sign Up
          {/if}
        </button>
      </form>
      
      <p class="text-center text-muted mt-4 mb-0">
        Already have an account? <a href="/auth/login" class="text-decoration-none">Sign in</a>
      </p>
    </div>
  </div>
</div>
