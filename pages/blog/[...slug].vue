<template>
  <ccm-section full-width>
  <div class="blog-post | prose-layout | prose">
    <ContentRenderer v-if="post" :value="post" class="post-main-content | prose" />
    <div v-else>
      <h1>Post not found</h1>
        <NuxtLink to="/blog">← Back to Blog</NuxtLink>
      </div>
    </div>
  </ccm-section>
</template>

<script setup>
definePageMeta({
  layout: 'article-layout'
})


const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
const post = contentOne('blog', { slug })

// Set page title
useHead({
  title: post.value?.title || 'Blog Post',
  meta: [
    { name: 'description', content: post.value?.description || 'Blog post description' }
  ]
})

// Provide hero data from content front-matter (if present) to layout via shared state
const heroState = useState('hero', () => null)
if (post.value?.hero) {
  heroState.value = {
    brow: post.value.hero.brow || 'Service',
    title: post.value.hero.title || post.value.title,
    tagline: post.value.hero.tagline || post.value.description,
    backgroundColor: post.value.hero.backgroundColor || 'transparent',
    size: post.value.hero.size || 'l',
    hideTopbar: post.value.hero.hideTopbar === true
  }
} else {
  // Default hero from content basics
  heroState.value = {
    brow: 'Blog',
    title: post.value.title,
    tagline: post.value.description,
    backgroundColor: 'transparent',
    size: 'l',
    hideTopbar: false
  }
}

</script>

<style>

</style>