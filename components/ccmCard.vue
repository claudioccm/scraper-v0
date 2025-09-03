<template>
  <div class="ccm-card">
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.ccm-card {
  padding: var(--space-s);
  border: 2px solid red;
}
</style>