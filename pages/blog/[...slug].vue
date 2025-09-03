<template>
  <ccm-section full-width>
  <div class="blog-post | prose-layout | prose">
    <slot name="hero">
      <ccm-post-hero 
        class="post-hero"
        :title="post.title" 
        :brow="post.meta.brow" 
        :date="post.meta.date" 
        :author="post.meta.author" 
        :tags="post.meta.tags" 
        :tagline="post.meta.tagline"
        />
      <!-- <pre>{{ post }}</pre> -->
    </slot>

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
const { data: post } = await useAsyncData(`blog-${route.params.slug}`, () => {
  return queryCollection('blog').path(`/blog/${route.params.slug}`).first()
})

// Set page title
useHead({
  title: post.value?.title || 'Blog Post',
  meta: [
    { name: 'description', content: post.value?.description || 'Blog post description' }
  ]
})


</script>

<style>

</style>