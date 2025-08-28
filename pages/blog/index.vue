<template>
  <div>
    <h1>Blog</h1>
    <div v-for="post in blogPosts" :key="post._path">
      <NuxtLink :to="post.path">{{ post.title || post._path }}</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { data: blogPosts } = await useAsyncData('blog-posts', () => {
  return queryCollection('blog').all()
})
</script>

<style lang="scss" scoped>

</style>