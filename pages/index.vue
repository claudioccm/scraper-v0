<template>
  <ccm-section>
    <h2>Latest Blog Posts</h2>
    <div v-if="blogPosts && blogPosts.length > 0">
      <div v-for="post in blogPosts.slice(0, 3)" :key="post.path">
        <h3><NuxtLink :to="post.path">{{ post.title }}</NuxtLink></h3>
        <p v-if="post.description">{{ post.description }}</p>
        <small>{{ post.date ? new Date(post.date).toLocaleDateString() : 'No date' }}</small>
      </div>
      <NuxtLink to="/blog">View all blog posts →</NuxtLink>
    </div>
    <p v-else>No blog posts found</p>
  </ccm-section>

  <ccm-section background-color="base-color-light">
    <h2>Case Studies</h2>
    <div v-if="caseStudies && caseStudies.length > 0">
      <div v-for="study in caseStudies.slice(0, 3)" :key="study.path">
        <h3><NuxtLink :to="study.path">{{ study.title }}</NuxtLink></h3>
        <p v-if="study.description">{{ study.description }}</p>
      </div>
      <NuxtLink to="/case-studies">View all case studies →</NuxtLink>
    </div>
    <p v-else>No case studies found</p>
  </ccm-section>
</template>

<script setup>

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