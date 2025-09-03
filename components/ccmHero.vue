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
  brow: String,
  title: {
    type: String,
    default: 'Welcome'
  },
  tagline: String
})
</script>

<style scoped>

</style>