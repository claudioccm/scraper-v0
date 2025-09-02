<template>
  <div>
    <h1>Home</h1>

    <section>
      <h2>Latest Blog Posts</h2>
      <div v-if="blogPosts && blogPosts.length > 0">
        <div v-for="post in blogPosts.slice(0, 3)" :key="post.path" class="post-preview">
          <h3><NuxtLink :to="post.path">{{ post.title }}</NuxtLink></h3>
          <p v-if="post.description">{{ post.description }}</p>
          <small>{{ post.date ? new Date(post.date).toLocaleDateString() : 'No date' }}</small>
        </div>
        <NuxtLink to="/blog" class="see-more">View all blog posts →</NuxtLink>
      </div>
      <p v-else>No blog posts found</p>
    </section>

    <section>
      <h2>Case Studies</h2>
      <div v-if="caseStudies && caseStudies.length > 0">
        <div v-for="study in caseStudies.slice(0, 3)" :key="study.path" class="case-study-preview">
          <h3><NuxtLink :to="study.path">{{ study.title }}</NuxtLink></h3>
          <p v-if="study.description">{{ study.description }}</p>
        </div>
        <NuxtLink to="/case-studies" class="see-more">View all case studies →</NuxtLink>
      </div>
      <p v-else>No case studies found</p>
    </section>
  </div>
</template>

<script setup>
const { data: blogPosts } = await useAsyncData('home-blog-posts', () => {
  return queryCollection('blog')
    .where('published', '=', true)
    .order('date', 'DESC')
    .all()
})

const { data: caseStudies } = await useAsyncData('home-case-studies', () => {
  return queryCollection('case-studies')
    .order('title', 'ASC')
    .all()
})
</script>

<style lang="scss" scoped>
.post-preview, .case-study-preview {
  border: 1px solid #e5e7eb;
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;

  h3 {
    margin: 0 0 0.5rem 0;

    a {
      text-decoration: none;
      color: #1f2937;

      &:hover {
        color: #3b82f6;
      }
    }
  }

  p {
    margin: 0.5rem 0;
    color: #6b7280;
  }

  small {
    color: #9ca3af;
    font-size: 0.875rem;
  }
}

.see-more {
  display: inline-block;
  margin-top: 1rem;
  color: #3b82f6;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

section {
  margin: 2rem 0;

  h2 {
    color: #1f2937;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0.5rem;
  }
}
</style>