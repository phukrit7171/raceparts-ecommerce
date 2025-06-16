<script>
  import { fade } from 'svelte/transition';
</script>

<div in:fade class="container py-5">
  <h1>About RaceParts</h1>
  <div class="row mt-4">
    <div class="col-md-6">
      <h3>Our Story</h3>
      <p>
        RaceParts has been providing high-performance auto parts since 2010. 
        We specialize in hard-to-find components for racing enthusiasts and professional mechanics.
      </p>
    </div>
    <div class="col-md-6">
      <h3>Our Mission</h3>
      <p>
        To deliver top-quality racing parts with fast shipping and exceptional customer service. 
        We source directly from manufacturers to ensure authenticity and competitive pricing.
      </p>
    </div>
  </div>
  
  <div class="mt-5">
    <h3>Contact Us</h3>
    <p>Email: support@raceparts.com</p>
    <p>Phone: 1-800-RACEPARTS</p>
    <p>Address: 123 Performance Drive, Speedway, IN 46222</p>
  </div>
</div>
