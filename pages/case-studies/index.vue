<template>
  <ccm-section>
    <h2>Case Studies</h2>
    <div v-for="study in caseStudies" :key="study._path">
      <NuxtLink :to="study.path">{{ study.title || study._path }}</NuxtLink>
    </div>
  </ccm-section>
</template>

<script setup>
const { data: caseStudies } = await useAsyncData('case-studies', () => {
  return queryCollection('casestudies').all()
})
</script>

<style lang="scss" scoped>

</style>