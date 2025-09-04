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

  <ccm-section>
    <h2>Case Studies</h2>
    <div v-if="caseStudies && caseStudies.length > 0" class="stack">
      <ccm-card v-for="study in caseStudies.slice(0, 3)" :key="study.path" :to="study.path">
        <h4>{{ study.meta.brow }}</h4>
        <h3>{{ study.title }}</h3>
        <p>{{ study.meta.tagline }}</p>
      </ccm-card>
      <NuxtLink to="/case-studies">View all case studies →</NuxtLink>
    </div>
    <p v-else>No case studies found</p>
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

const { data: blogPosts } = await useAsyncData('home-blog-posts', async () => {
  const posts = await queryCollection('blog').all()
  // Since published field parsing is broken, just show all posts for now
  return posts.sort((a, b) => new Date(b.date || '1970-01-01') - new Date(a.date || '1970-01-01'))
})

const { data: caseStudies } = await useAsyncData('home-case-studies', async () => {
  const studies = await queryCollection('casestudies').all()
  // Sort manually since database queries aren't working
  return studies.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
})
</script>

<style scoped>

</style>