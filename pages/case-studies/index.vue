<template>
  <ccm-section>
    <div class="stack">
      <ccm-card v-for="study in caseStudies" :key="study._path">
        <h4>{{ study.meta.brow }}</h4>
        <h3>{{ study.title || study._path }}</h3>
        <p>{{ study.meta.tagline }}</p>
      </ccm-card>
    </div>
  </ccm-section>
</template>

<script setup>
definePageMeta({
  hero: {
    brow: 'Case Studies',
    title: 'Case Studies',
    tagline: 'See our work',
    size: 'l',
    hideTopbar: false
  }
})

const { data: caseStudies } = await useAsyncData('case-studies', () => {
  return queryCollection('casestudies').all()
})
</script>

<style lang="scss" scoped>

</style>