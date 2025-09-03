import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md',
      schema: z.object({
        published: z.boolean().default(true)
      })
    }),
    casestudies: defineCollection({
      type: 'page',
      source: 'case-studies/*.md',
      schema: z.object({
        published: z.boolean().default(true)
      })
    }),
    services: defineCollection({
      type: 'page',
      source: 'services/*.md',
      schema: z.object({
        // Adding a basic schema for services as well
        status: z.string().optional()
      })
    })
  }
})
