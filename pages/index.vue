<template>
  <ccm-section>
    <div class="stack">
      <h2>Latest Blog Posts</h2>
      <div v-if="blogPosts && blogPosts.length > 0" class="grid" data-gap="s" data-min-width="l">
        <ccm-card v-for="post in blogPosts.slice(0, 3)" :key="post.path" :to="post.path">
          <h4>{{ post.meta.brow }}</h4>
          <h3>{{ post.title }}</h3>
          <p>{{ post.meta.tagline }}</p>
          
          <template #action>
            <div class="test">
              <ccm-button :to="post.path">Read post</ccm-button>
            </div>
          </template>
        </ccm-card>
        <ccm-button to="/blog" variant="primary" color="primary">View all blog posts</ccm-button>
      </div>
      <p v-else>No blog posts found</p>
    </div>

  </ccm-section>
</template>

<script setup>
definePageMeta({
  hero: {
    brow: 'Hero Brow',
    title: 'Hero Title',
    tagline: 'Hero Tagline',
    backgroundColor: 'color-primary-tint-20',
    size: 'l',
  }
})

const blogPosts = content('blog', 'recency')
</script>

<style scoped>
.test {
  display: flex;
  justify-content: stretch;
  width: 100%;
}
</style>