<template>
  <ccm-section full-width>
    <div class="case-study | prose-layout | prose">      
      <ContentRenderer v-if="caseStudy" :value="caseStudy" />
      <div v-else>
        <h1>Case Study not found</h1>
        <NuxtLink to="/case-studies">← Back to Case Studies</NuxtLink>
      </div>
    </div>
  </ccm-section>
</template>

<script setup>
definePageMeta({
  layout: 'article-layout'
})

const route = useRoute()
const { data: caseStudy } = await useAsyncData(`case-study-${route.params.slug}`, () => {
  return queryCollection('casestudies').path(`/case-studies/${route.params.slug}`).first()
})

// Provide hero data from content front-matter (if present) to layout via shared state
const heroState = useState('hero', () => null)
if (caseStudy.value?.hero) {
  heroState.value = {
    brow: caseStudy.value.hero.brow || 'Service',
    title: caseStudy.value.hero.title || caseStudy.value.title,
    tagline: caseStudy.value.hero.tagline || caseStudy.value.description,
    backgroundColor: caseStudy.value.hero.backgroundColor || 'transparent',
    size: caseStudy.value.hero.size || 'l',
    hideTopbar: caseStudy.value.hero.hideTopbar === true
  }
} else {
  // Default hero from content basics
  heroState.value = {
    brow: 'Case Study',
    title: caseStudy.value.title,
    tagline: caseStudy.value.description,
    backgroundColor: 'transparent',
    size: 'l',
    hideTopbar: false
  }
}
</script>

<style scoped>

</style>