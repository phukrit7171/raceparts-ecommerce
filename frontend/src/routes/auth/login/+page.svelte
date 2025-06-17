<script>
  import { goto } from "$app/navigation";
  import api from "$lib/api.js";
  import { user } from "$lib/stores/auth.js";
  import Swal from "sweetalert2";

  let email = "";
  let password = "";
  let loading = false;

  async function login() {
    loading = true;
    try {
      const res = await api.post("/api/auth/login", { email, password });
      user.set(res.data.user);
      Swal.fire({
        title: "Logged In",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      goto("/");
    } catch (error) {
      Swal.fire(
        "Login Error",
        error.response?.data?.message || "An error occurred during login.",
        "error"
      );
    } finally {
      loading = false;
    }
  }
</script>

<div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
  <div class="card shadow-sm" style="width: 100%; max-width: 400px;">
    <div class="card-body p-4">
      <div class="text-center mb-4">
        <h1 class="h3 mb-1">Welcome back</h1>
        <p class="text-muted">Sign in to your account to continue</p>
      </div>
      
      <form on:submit|preventDefault={login} class="needs-validation" novalidate>
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
          <div class="d-flex justify-content-between align-items-center mb-1">
            <label for="password" class="form-label">Password</label>
            <!-- Uncomment if you want to add forgot password link -->
            <!-- <a href="/forgot-password" class="text-decoration-none small">Forgot password?</a> -->
          </div>
          <input
            id="password"
            type="password"
            bind:value={password}
            class="form-control form-control-lg"
            placeholder="Enter your password"
            required
          />
        </div>
        
        <button class="btn btn-primary btn-lg w-100 mb-3" disabled={loading}>
          {#if loading}
            <span class="d-flex align-items-center justify-content-center gap-2">
              <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Signing in...
            </span>
          {:else}
            Sign In
          {/if}
        </button>
      </form>
      
      <p class="text-center text-muted mt-4 mb-0">
        Don't have an account? <a href="/auth/register" class="text-decoration-none">Sign up</a>
      </p>
    </div>
  </div>
</div>
