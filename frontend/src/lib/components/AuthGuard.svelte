<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { user } from '$lib/stores/auth.js';
  import Swal from 'sweetalert2';

  export let redirectTo = '/auth/login';

  onMount(async () => {
    // Wait for initial user state to load
    const unsubscribe = user.subscribe(async ($user) => {
      if ($user === null) {
        Swal.fire({
          title: 'Authentication Required',
          text: 'You need to be logged in to access this page',
          icon: 'warning',
          timer: 2000,
          showConfirmButton: false
        });
        await goto(redirectTo);
      }
    });

    return () => unsubscribe();
  });
</script>

<slot />
