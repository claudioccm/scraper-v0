<template>
  <div>
    <ccm-topbar />
    <hgroup>
      <span v-if="brow">{{ brow }}</span>
      <h1>{{ title }}</h1>
      <p v-if="tagline">{{ tagline }}</p>
    </hgroup>
  </div>
</template>

<script setup>
const props = defineProps({
  brow: {
    type: String,
    default: 'Brow'
  },
  title: {
    type: String,
    default: 'Hero'
  },
  tagline: {
    type: String,
    default: 'Tagline'
  }
})
</script>

<style scoped>

</style>