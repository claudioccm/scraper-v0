<template>
  <div>
    <h1>Case Studies</h1>
    <div v-for="study in caseStudies" :key="study._path">
      <NuxtLink :to="study.path">{{ study.title || study._path }}</NuxtLink>
    </div>
  </div>
</template>

<script setup>
const { data: caseStudies } = await useAsyncData('case-studies', () => {
  return queryCollection('casestudies').all()
})
</script>

<style lang="scss" scoped>

</style>