<!-- src/routes/profile/+page.svelte -->
<script>
  export let data;
</script>

<div class="container py-5">
  <h1 class="mb-4">Your Profile</h1>
  <div class="row">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Personal Information</h5>
          <p><strong>Name:</strong> {data.user.name}</p>
          <p><strong>Email:</strong> {data.user.email}</p>
        </div>
      </div>
    </div>
  </div>
</div>