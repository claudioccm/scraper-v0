<template>
  <div>
    <h1>What We Do</h1>

    <section v-if="services && services.length > 0">
      <div>
        <div v-for="service in services" :key="service.path">
          <h2><NuxtLink :to="service.slug || service.path">{{ service.title }}</NuxtLink></h2>
          <div v-if="service.status">
            <span>{{ service.status }}</span>
          </div>
          <div>
            <p>Professional design services tailored for research and mission-driven organizations.</p>
          </div>
        </div>
      </div>
    </section>

    <section v-else>
      <p>No services found.</p>
    </section>
  </div>
</template>

<script setup>
const { data: services } = await useAsyncData('services', async () => {
  const servicesData = await queryCollection('services').all()
  // Sort manually since database-level sorting might not work reliably
  return servicesData.sort((a, b) => (a.title || '').localeCompare(b.title || ''))
})
</script>

<style scoped>

</style>


<!-- 
# From Insight to Impact

Your work is complex. You deal in groundbreaking research, nuanced policy, and ambitious social goals. The challenge is ensuring your digital presence communicates that value with the clarity and authority it deserves. We partner with you to bridge that gap.

Our approach is holistic, integrating strategy, design, and technology to build the digital experiences that advance knowledge and drive social impact. We translate your most complex ideas into clear, effective, and engaging platforms that serve your audience and achieve your mission.

## How We Can Help
-->