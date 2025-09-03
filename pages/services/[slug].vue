<template>
  <div>
    <div v-if="service">
      <h1>{{ service.title }}</h1>

      <div v-if="service.status">
        <span>{{ service.status }}</span>
      </div>

      <!-- Service Content -->
      <div>
        <ContentRenderer :value="service" />
      </div>

      <!-- Back to Services -->
      <div>
        <NuxtLink to="/services">← Back to Services</NuxtLink>
      </div>
    </div>

    <div v-else>
      <h1>Service Not Found</h1>
      <p>Sorry, the requested service could not be found.</p>
      <NuxtLink to="/services">← Back to Services</NuxtLink>
    </div>
  </div>
</template>

<script setup>
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
.service-meta {
  margin: 1rem 0 2rem 0;
}

.status-draft {
  background-color: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: uppercase;
  display: inline-block;
}

.service-content {
  max-width: 65ch;
  margin: 0 auto;
  line-height: 1.6;
}

.service-content :deep(h1) {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #1f2937;
}

.service-content :deep(h2) {
  font-size: 1.875rem;
  margin: 2rem 0 1rem 0;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.service-content :deep(h3) {
  font-size: 1.5rem;
  margin: 1.5rem 0 0.75rem 0;
  color: #374151;
}

.service-content :deep(p) {
  margin-bottom: 1rem;
  color: #4b5563;
}

.service-content :deep(ul) {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.service-content :deep(li) {
  margin-bottom: 0.5rem;
  color: #4b5563;
}

.service-content :deep(strong) {
  font-weight: 600;
  color: #1f2937;
}

.back-link {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.back-link a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.back-link a:hover {
  text-decoration: underline;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #1f2937;
  text-align: center;
}

@media (max-width: 768px) {
  h1 {
    font-size: 2.25rem;
  }

  .service-content {
    max-width: 100%;
    padding: 0 1rem;
  }
}
</style>
