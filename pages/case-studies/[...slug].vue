<template>
  <ccm-section full-width>
    <div class="case-study | prose-layout | prose">
      
      <slot name="hero">
      
        <ccm-post-hero 
          class="post-hero"
          :title="caseStudy.title" 
          :brow="caseStudy.meta.brow" 
          :date="caseStudy.meta.date" 
          :author="caseStudy.meta.author" 
          :tags="caseStudy.meta.tags" 
          :tagline="caseStudy.meta.tagline"
          />
      
        </slot>
    
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
</script>

<style scoped>

</style>