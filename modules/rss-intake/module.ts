import { defineNuxtModule, createResolver, addServerHandler } from '@nuxt/kit'
import { startScheduler } from './runtime/server/lib/scheduler'
import { processAllFeeds } from './runtime/server/lib/processor'
import { createCard } from '~/server/utils/cardWorkflow'

export default defineNuxtModule({
  meta: {
    name: 'rss-intake',
    configKey: 'rssIntake'
  },
  setup(_options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Add server API routes
    addServerHandler({
      route: '/api/rss/check',
      handler: resolver.resolve('./runtime/server/api/rss/check.post')
    })

    addServerHandler({
      route: '/api/rss/suggestions',
      handler: resolver.resolve('./runtime/server/api/rss/suggestions.get')
    })

    // Start scheduler on Nuxt ready (server-side only)
    nuxt.hook('ready', () => {
      if (nuxt.options.dev || process.env.NODE_ENV !== 'production') {
        console.log('[RSS Intake] Module initialized')
      }

      // Only start scheduler in production or if explicitly enabled
      if (process.env.RSS_SCHEDULER_ENABLED === 'true') {
        startScheduler(async () => {
          try {
            const results = await processAllFeeds()

            // Create suggestion cards for relevant items
            for (const feedResult of results) {
              for (const item of feedResult.processedItems) {
                try {
                  const scrapeResult = await $fetch('/api/scrape', {
                    method: 'POST',
                    body: { url: item.link }
                  })

                  if (scrapeResult.status === 'ok') {
                    createCard({
                      result: scrapeResult,
                      source: 'rss-intake'
                    })
                  }
                } catch (error: any) {
                  console.error(`[RSS Scheduler] Error scraping ${item.link}:`, error.message)
                }
              }
            }
          } catch (error: any) {
            console.error('[RSS Scheduler] Feed processing failed:', error.message)
          }
        })
      }
    })
  }
})
