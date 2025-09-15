<template>
  <ccm-section>
    <div class="stack">
      <h2>UI Library</h2>
      <p>Component and utility documentation for our design system.</p>
    </div>
  </ccm-section>
  <ccm-section>
    <div class="grid" data-gap="s" data-min-width="l">
      <ccm-card
        v-for="doc in docs"
        :key="doc._path"
        :to="doc._path"
        size="s"
      >
        <h4>{{ doc.brow || 'Component' }}</h4>
        <h3>{{ doc.title || doc._path }}</h3>
        <p>{{ doc.description }}</p>
      </ccm-card>
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
</script>

<style scoped>

</style>


