<script>
  import api from '$lib/api.js';
  import { user } from '$lib/stores/auth.js';
  import Swal from 'sweetalert2';

  let name = '';
  let email = '';
  let password = '';

  async function register() {
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      if (res.data.success) {
        user.set(res.data.user);
        Swal.fire({
          title: 'Registered Successfully',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        window.location.href = '/';
      } else {
        Swal.fire('Registration Failed', res.data.message || 'Could not register.', 'error');
      }
    } catch (error) {
      Swal.fire('Registration Error', 'An error occurred during registration.', 'error');
    }
  }
</script>

<form on:submit|preventDefault={register}>
  <div class="mb-3">
    <label for="name">Name</label>
    <input id="name" type="text" bind:value={name} class="form-control" required />
  </div>
  <div class="mb-3">
    <label for="email">Email</label>
    <input id="email" type="email" bind:value={email} class="form-control" required />
  </div>
  <div class="mb-3">
    <label for="password">Password</label>
    <input id="password" type="password" bind:value={password} class="form-control" required />
  </div>
  <button class="btn btn-success">Register</button>
</form>
