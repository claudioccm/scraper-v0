<template>
  <div>
    <ContentRenderer v-if="post" :value="post" />
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

<style lang="scss" scoped>

</style>