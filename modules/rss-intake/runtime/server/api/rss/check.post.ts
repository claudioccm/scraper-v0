import { defineEventHandler } from 'h3'
import { processAllFeeds } from '../../lib/processor'
import { createCard } from '~/server/utils/cardWorkflow'
import type { ScrapeResult } from '~/modules/scraper/runtime/types'

export default defineEventHandler(async (event) => {
  console.log('[RSS Check API] Manual RSS check triggered')

  try {
    const results = await processAllFeeds()

    // For each relevant item, scrape it and create a suggestion card
    let suggestionsCreated = 0

    for (const feedResult of results) {
      for (const item of feedResult.processedItems) {
        try {
          // Call the scraper to get full article content
          const scrapeResult = await $fetch<ScrapeResult>('/api/scrape', {
            method: 'POST',
            body: {
              url: item.link
            }
          })

          if (scrapeResult.status === 'ok') {
            // Create workflow card with 'suggestion' status
            createCard({
              result: scrapeResult,
              source: 'rss-intake'
            })
            suggestionsCreated++
            console.log(`[RSS Check API] Created suggestion card for: ${item.title}`)
          } else {
            console.warn(`[RSS Check API] Scrape failed for ${item.link}:`, scrapeResult.error)
          }
        } catch (scrapeError: any) {
          console.error(`[RSS Check API] Error scraping ${item.link}:`, scrapeError.message)
        }
      }
    }

    const totalRelevant = results.reduce((sum, r) => sum + r.relevantItems, 0)

    return {
      success: true,
      message: `Processed ${results.length} feeds, found ${totalRelevant} relevant items, created ${suggestionsCreated} suggestions`,
      results: results.map(r => ({
        feedUrl: r.feedUrl,
        totalItems: r.totalItems,
        newItems: r.newItems,
        relevantItems: r.relevantItems,
        errors: r.errors
      }))
    }
  } catch (error: any) {
    console.error('[RSS Check API] Error:', error)
    return {
      success: false,
      message: error.message,
      results: []
    }
  }
})
