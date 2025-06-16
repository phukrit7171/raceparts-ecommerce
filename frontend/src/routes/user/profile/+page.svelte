<script>
  import { user } from './+page.server';
</script>

<h2>My Profile</h2>
<form>
  <div class="mb-3">
    <label for="name">Name</label>
    <input id="name" type="text" class="form-control" bind:value={user.name} />
  </div>
  <div class="mb-3">
    <label for="email">Email</label>
    <input id="email" type="email" class="form-control" bind:value={user.email} />
  </div>
  <button class="btn btn-primary">Save Changes</button>
</form>