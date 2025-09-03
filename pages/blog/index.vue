<template>
  <ccm-section>
    <h2>Insights on Design, Data, and Social Impact</h2>
    <p>Welcome to our thinking space. Here, we share our expertise on the craft of designing for policy and research, creating effective knowledge products, and the nuances of ethical technology. Our goal is to provide value upfront, sharing what we've learned from our work with leading global organizations.</p>
    
    <pre>
      [Filter/Sort Component: "Designing for Policy & Research," "The Craft of Knowledge Products," "Ethical Technology & Social Impact"]
      [Article Grid Component: Displays a grid of all migrated articles, filterable by the pillars above. Each card should show the article title, a brief excerpt, and the publication date.]
    </pre>
    
    <div v-for="post in blogPosts" :key="post._path">
      <NuxtLink :to="post.path">{{ post.title || post._path }}</NuxtLink>
    </div>
  </ccm-section>
  <ccm-section>
    <h2>Subscribe to Our Insights</h2>
    <p>Get the latest analysis and design thinking from our team, delivered straight to your inbox. We share practical advice for organizations looking to increase their impact.</p> 

    <pre>
      [Newsletter Signup Form Component]
    </pre>
  </ccm-section>
</template>

<script setup>
const { data: blogPosts } = await useAsyncData('blog-posts', () => {
  return queryCollection('blog').all()
})
</script>

<style scoped>

</style>

<!-- 
---
title: Insights
slug: /insights
status: done
---

# 



---
## Content Pillars



---



---



 -->