<template>
  <ccm-section full-width>
    <div class="prose-layout | prose">
      <ContentRenderer v-if="doc" :value="doc" class="prose" />
      <div v-else>
        <h1>Document not found</h1>
        <NuxtLink to="/ui-library">← Back to UI Library</NuxtLink>
      </div>
    </div>
  </ccm-section>
</template>

<script setup>
definePageMeta({
  layout: 'article-layout'
})

const route = useRoute()
const { data: doc } = await useAsyncData(`uilib-${route.params.slug}`, () => {
  return queryCollection('uilibrary').path(`/ui-library/${route.params.slug}`).first()
})

useHead({
  title: doc.value?.title || 'UI Library',
  meta: [
    { name: 'description', content: doc.value?.description || 'Component and utility documentation' }
  ]
})

const heroState = useState('hero', () => null)
if (doc.value?.hero) {
  heroState.value = {
    brow: doc.value.hero.brow || 'UI Library',
    title: doc.value.hero.title || doc.value.title,
    tagline: doc.value.hero.tagline || doc.value.description,
    backgroundColor: doc.value.hero.backgroundColor || 'transparent',
    size: doc.value.hero.size || 'l',
    hideTopbar: doc.value.hero.hideTopbar === true
  }
} else {
  heroState.value = {
    brow: 'UI Library',
    title: doc.value?.title || 'Documentation',
    tagline: doc.value?.description,
    backgroundColor: 'transparent',
    size: 'l',
    hideTopbar: false
  }
}
</script>

<style scoped>

</style>


