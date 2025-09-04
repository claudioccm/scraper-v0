<template>
  <nuxt-link class="ccm-card" :to="to">
    <slot />
  </nuxt-link>
</template>

<script setup>
const props = defineProps({
  to: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.ccm-card {
  display: block;
  padding: var(--space-s);
  border: 2px solid var(--color-primary-tint-20);
}
</style>