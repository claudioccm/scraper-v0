<template>
  <div class="ccm-post-hero full-width" :title="title" :brow="brow" :date="date" :author="author" :tags="tags" :tagline="tagline">
    <div class="content">
      <NuxtLink to="/blog">Back to Blog</NuxtLink>
      <h4>{{ brow }}</h4>
      <h1>{{ title }}</h1>
      <h3>{{ tagline }}</h3>
      <p>Published {{ formatDate(date, 'MMM d, yyyy') }} by {{ author }}</p>
      <p>
        Tags:
        <span v-for="(tag, i) in tags" :key="tag">
          <NuxtLink :to="`/blog/tag/${encodeURIComponent(tag)}`">{{ tag }}</NuxtLink><span v-if="i < tags.length - 1">, </span>
        </span>
      </p>  
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  brow: {
    type: String,
    default: 'Insight'
  },
  date: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  tags: {
    type: Array,
    required: true
  },
  tagline: {
    type: String,
    required: true
  }
})
</script>

<style scoped>
.ccm-post-hero {
  background-color: var(--primary-color);
  padding-block: var(--space-xl);
}
</style>