<template>
  <div class="blog-post | prose-layout | prose">
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

    <ContentRenderer v-if="post" :value="post" class="post-main-content | prose" />
    
    <div v-else>
      <h1>Post not found</h1>
      <NuxtLink to="/blog">← Back to Blog</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: post } = await useAsyncData(`blog-${route.params.slug}`, () => {
  return queryCollection('blog').path(`/blog/${route.params.slug}`).first()
})
</script>

<style>
.prose-layout {
  --padding-inline: 1rem;
  --content-max-width: 70ch;
}

.prose-layout {
  

}

.post-hero > .content,
.prose-section > .content {
  margin-inline: auto;
  max-width: var(--content-max-width);
  padding-inline: var(--space-xs);
  box-sizing: content-box;
}
</style>