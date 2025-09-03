<template>
  <ccm-section>
    <h2>Case Studies</h2>
    <div class="stack">
      <ccm-card v-for="study in caseStudies" :key="study._path">
        <NuxtLink :to="study.path">{{ study.title || study._path }}</NuxtLink>
      </ccm-card>
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