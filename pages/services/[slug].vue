<template>
  <ccm-hero />
  
  <ccm-section>
    <div class="service | prose">
      <div v-if="service">
        <ContentRenderer :value="service" />
        <NuxtLink to="/services">← Back to Services</NuxtLink>
      </div>

      <div v-else>
        <h1>Service Not Found</h1>
        <p>Sorry, the requested service could not be found.</p>
        <NuxtLink to="/services">← Back to Services</NuxtLink>
      </div>
    </div>
  </ccm-section>
</template>

<script setup>
definePageMeta({
  layout: 'article-layout'
})


const route = useRoute()
const slug = route.params.slug

// Find the service by slug or path
const { data: service } = await useAsyncData(`service-${slug}`, async () => {
  const services = await queryCollection('services').all()

  // Try multiple ways to find the service
  let found = services.find(s => s.slug === `/services/${slug}`)
  if (!found) {
    // Try matching by path (filename without extension)
    found = services.find(s => s.path?.includes(slug))
  }
  if (!found) {
    // Try direct filename match
    found = services.find(s => s._file?.replace('.md', '') === slug)
  }

  return found
})

// Handle 404 if service not found
if (!service.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Service not found'
  })
}

// Set page title
useHead({
  title: service.value?.title || 'Service',
  meta: [
    {
      name: 'description',
      content: service.value?.description || 'Professional design services for research and mission-driven organizations'
    }
  ]
})
</script>

<style scoped>

</style>
