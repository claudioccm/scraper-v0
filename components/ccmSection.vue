<template>
  <section 
    class="ccm-section"
    :size="size"
    :full-width="fullWidth"
    :background-color="backgroundColor"
    :style="{
      '--_ccm-section-background-color': `var(--${backgroundColor})`,
      '--_ccm-section-padding-block': `var(--space-${size})`
    }"
    >

    <div :class="['ccm-section-container', { center: fullWidth === false }]">
      <slot />
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'l'
  },
  backgroundColor: {
    type: String,
    default: 'transparent'
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.ccm-section {
  --_ccm-section-padding-block: var(--space-l);
  --_ccm-section-background-color: transparent;
}

.ccm-section { 
  padding-block: var(--_ccm-section-padding-block);
  background-color: var(--_ccm-section-background-color); 
}
</style>