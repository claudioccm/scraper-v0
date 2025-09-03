import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: {
        published: 'boolean'
      }
    }),
    casestudies: defineCollection({
      type: 'page',
      source: 'case-studies/*.md',
      schema: {
        published: 'boolean'
      }
    }),
    services: defineCollection({
      type: 'page',
      source: 'services/*.md'
    })
  }
})
