<script>
  import { goto } from '$app/navigation';
  import api from '$lib/api.js';
  import { user } from '$lib/stores/auth.js';
  import Swal from 'sweetalert2';

  let email = '';
  let password = '';
  let loading = false;

  async function login() {
    loading = true;
    try {
      const res = await api.post('/auth/login', { email, password });
      user.set(res.data.user);
      Swal.fire({
        title: 'Logged In',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      goto('/');
    } catch (error) {
      Swal.fire(
        'Login Error', 
        error.response?.data?.message || 'An error occurred during login.', 
        'error'
      );
    } finally {
      loading = false;
    }
  }
</script>

<form on:submit|preventDefault={login}>
  <div class="mb-3">
    <label for="email">Email</label>
    <input id="email" type="email" bind:value={email} class="form-control" required />
  </div>
  <div class="mb-3">
    <label for="password">Password</label>
    <input id="password" type="password" bind:value={password} class="form-control" required />
  </div>
  <button class="btn btn-primary" disabled={loading}>
    {loading ? 'Logging in...' : 'Login'}
  </button>
</form>
