<template>
  <ccm-section>
    <h2>Default Section</h2>
    <p>This is the default <code>ccm-section</code> with no props.</p>
  </ccm-section>

  <ccm-section color="primary">
    <h2>Primary Color Section</h2>
    <p>This section uses <code>color="primary"</code> for a primary palette background.</p>
  </ccm-section>

  <ccm-section color="secondary">
    <h2>Secondary Color Section</h2>
    <p>This section uses <code>color="secondary"</code> for a secondary palette background.</p>
  </ccm-section>

  <ccm-section color="accent" :elevated="true">
    <h2>Accent Color, Elevated</h2>
    <p>This section uses <code>color="accent"</code> and <code>:elevated="true"</code> for a raised accent look.</p>
  </ccm-section>

  <ccm-section color="white" border>
    <h2>White Section with Border</h2>
    <p>This section uses <code>color="white"</code> and <code>border</code> for a card-like appearance.</p>
  </ccm-section>
</template>

<script setup>

</script>

<style scoped>

</style>