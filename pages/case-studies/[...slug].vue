<template>
  <div>
    <ContentRenderer v-if="caseStudy" :value="caseStudy" />
    <div v-else>
      <h1>Case Study not found</h1>
      <NuxtLink to="/case-studies">← Back to Case Studies</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const { data: caseStudy } = await useAsyncData(`case-study-${route.params.slug}`, () => {
  return queryCollection('casestudies').path(`/case-studies/${route.params.slug}`).first()
})
</script>

<style lang="scss" scoped>

</style>