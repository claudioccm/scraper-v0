<template>
  <ccm-section>
    <div class="stack">
    <h3>Colors</h3>  
    <div class="cluster">
      <ccm-button variant="secondary" color="primary">Primary</ccm-button>
      <ccm-button variant="secondary" color="secondary">Secondary</ccm-button>
      <ccm-button variant="secondary" color="base">Base</ccm-button>
      <ccm-button variant="secondary" color="accent">Accent</ccm-button>
      <ccm-button variant="secondary" color="white">White</ccm-button>
      <ccm-button variant="secondary" color="success">Success</ccm-button>
      <ccm-button variant="secondary" color="fail">Fail</ccm-button>
      <ccm-button variant="secondary" color="warning">Warning</ccm-button>
      <ccm-button variant="secondary" color="info">Info</ccm-button>
    </div>
    <div class="cluster">
      <ccm-button variant="primary" color="primary">Primary</ccm-button>
      <ccm-button variant="primary" color="secondary">Secondary</ccm-button>
      <ccm-button variant="primary" color="base">Base</ccm-button>
      <ccm-button variant="primary" color="accent">Accent</ccm-button>
      <ccm-button variant="primary" color="white">White</ccm-button>
      <ccm-button variant="primary" color="success">Success</ccm-button>
      <ccm-button variant="primary" color="fail">Fail</ccm-button>
      <ccm-button variant="primary" color="warning">Warning</ccm-button>
      <ccm-button variant="primary" color="info">Info</ccm-button>
    </div>
  
    <h4>Sizes</h4>
      <div class="cluster">
        <ccm-button variant="secondary" color="secondary" size="s">Small Secondary</ccm-button>
        <ccm-button variant="secondary" color="secondary" size="m">Medium Secondary</ccm-button>
        <ccm-button variant="secondary" color="secondary" size="l">Large Secondary</ccm-button>
        <ccm-button variant="secondary" color="secondary" size="xl">Extra Large Secondary</ccm-button>
      </div>

      <h3>Primary</h3>
      <div class="cluster">
        <ccm-button variant="primary" color="primary" size="s">Small Primary</ccm-button>
        <ccm-button variant="primary" color="primary" size="m">Medium Primary</ccm-button>
        <ccm-button variant="primary" color="primary" size="l">Large Primary</ccm-button>
        <ccm-button variant="primary" color="primary" size="xl">Extra Large Primary</ccm-button>
      </div>

      <h3>Ghost and Link</h3>
      <div class="cluster">
        <ccm-button variant="ghost" color="ghost" size="s">Small Ghost</ccm-button>
        <ccm-button variant="ghost" color="ghost" size="m">Medium Ghost</ccm-button>
        <ccm-button variant="ghost" color="ghost" size="l">Large Ghost</ccm-button>
        <ccm-button variant="ghost" color="ghost" size="xl">Extra Large Ghost</ccm-button>
      </div>

      <h3>Unstyled</h3>
      <div class="cluster">
        <ccm-button variant="unstyled" color="unstyled" size="s">Small Unstyled</ccm-button>
        <ccm-button variant="unstyled" color="unstyled" size="m">Medium Unstyled</ccm-button>
        <ccm-button variant="unstyled" color="unstyled" size="l">Large Unstyled</ccm-button>
        <ccm-button variant="unstyled" color="unstyled" size="xl">Extra Large Unstyled</ccm-button>
      </div>
    </div>
    
  </ccm-section>
  <ccm-section>
    <h2>Default Section</h2>
    <p>This is the default <code>ccm-section</code> with no props.</p>
  </ccm-section>

  <ccm-section size="m" background-color="primary">
    <h2>Primary Color Section</h2>
    <p>This section uses <code>color="primary"</code> for a primary palette background.</p>
  </ccm-section>

  <ccm-section size="s" background-color="secondary">
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
definePageMeta({
  layout: 'default'
})

definePageMeta({
  hero: {
    brow: 'Test',
    title: 'Test',
    tagline: 'Test'
  }
})


</script>

<style scoped>
.button-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-m);
}
</style>