<template>
  <ccm-section>
    <h2>Latest Blog Posts</h2>
    <div v-if="blogPosts && blogPosts.length > 0" class="stack">
      <ccm-card v-for="post in blogPosts.slice(0, 3)" :key="post.path" :to="post.path">
        <h4>{{ post.meta.brow }}</h4>
        <h3>{{ post.title }}</h3>
        <p>{{ post.meta.tagline }}</p>
      </ccm-card>
      <NuxtLink to="/blog">View all blog posts →</NuxtLink>
    </div>
    <p v-else>No blog posts found</p>
  </ccm-section>
</template>

<script setup>
definePageMeta({
  hero: {
    brow: '',
    title: 'We build systems',
    tagline: 'Strategy, design, and engineering.',
    backgroundColor: 'base-color-super-light',
    size: 'l',
    hideTopbar: false
  }
})

const blogPosts = content('blog', 'recency')
</script>

<style scoped>

</style>