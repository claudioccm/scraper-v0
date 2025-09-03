<template>
  <div>
    <h1>Blog</h1>
    <div v-for="post in blogPosts" :key="post._path">
      <NuxtLink :to="post.path">{{ post.title || post._path }}</NuxtLink>
    </div>
  </div>
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

# Insights on Design, Data, and Social Impact

Welcome to our thinking space. Here, we share our expertise on the craft of designing for policy and research, creating effective knowledge products, and the nuances of ethical technology. Our goal is to provide value upfront, sharing what we've learned from our work with leading global organizations.

---
## Content Pillars

[Filter/Sort Component: "Designing for Policy & Research," "The Craft of Knowledge Products," "Ethical Technology & Social Impact"]

---

[Article Grid Component: Displays a grid of all migrated articles, filterable by the pillars above. Each card should show the article title, a brief excerpt, and the publication date.]

---

## Subscribe to Our Insights

Get the latest analysis and design thinking from our team, delivered straight to your inbox. We share practical advice for organizations looking to increase their impact.

[Newsletter Signup Form Component]

 -->