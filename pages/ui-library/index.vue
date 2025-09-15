<template>
  <ccm-section>
    <div class="stack">
      <h2>UI Library</h2>
      <p>Component and utility documentation for our design system.</p>
    </div>
  </ccm-section>
  <ccm-section>
    <div class="stack" data-space="l">
      <section v-for="section in sections" :key="section.title" class="stack">
        <h3>{{ section.title }}</h3>
        <div class="grid" data-gap="s" data-min-width="l">
          <ccm-card
            v-for="doc in section.items"
            :key="doc._path"
            :to="doc._path"
            size="s"
          >
            <h4>{{ doc.brow || section.title }}</h4>
            <h3>{{ doc.title || doc._path }}</h3>
            <p>{{ doc.description }}</p>
          </ccm-card>
        </div>
      </section>
    </div>
  </ccm-section>
</template>

<script setup>
definePageMeta({
  hero: {
    brow: 'Documentation',
    title: 'UI Library',
    tagline: 'Authoritative component and utility docs',
    size: 'l',
    hideTopbar: false
  }
})

const { data: docs } = await useAsyncData('uilibrary-index', () => {
  return queryCollection('uilibrary').where({ published: true }).order('order').all()
})

const sections = computed(() => {
  const all = docs.value || []
  const utilities = all.filter(d => d._path?.includes('/ui-library/utilities/'))
  const components = all.filter(d => d._path?.includes('/ui-library/components/'))
  const foundations = all.filter(d => d._path?.includes('/ui-library/foundations/'))
  const patterns = all.filter(d => d._path?.includes('/ui-library/patterns/'))
  const guides = all.filter(d => d._path?.includes('/ui-library/guides/'))
  return [
    { title: 'Utilities', items: utilities },
    { title: 'Components', items: components },
    { title: 'Foundations', items: foundations },
    { title: 'Patterns', items: patterns },
    { title: 'Guides', items: guides }
  ].filter(s => s.items.length)
})
</script>

<style scoped>

</style>


