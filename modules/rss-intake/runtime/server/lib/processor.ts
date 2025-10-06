import { loadRssConfig, getPromptForFeed } from '../../config'
import { parseFeed } from './feedParser'
import { filterNewItems, markAsProcessed } from './deduplication'
import { analyzeRelevance } from './relevanceAnalyzer'
import type { RssFeedItem } from '../../types'

export interface ProcessingResult {
  feedUrl: string
  totalItems: number
  newItems: number
  relevantItems: number
  processedItems: RssFeedItem[]
  errors: string[]
}

export async function processAllFeeds(): Promise<ProcessingResult[]> {
  const config = loadRssConfig()
  const results: ProcessingResult[] = []

  console.log(`[RSS Intake] Starting feed check for ${config.feeds.length} feeds...`)

  for (const feed of config.feeds) {
    try {
      const result = await processSingleFeed(feed.rss_feed_url)
      results.push(result)
    } catch (error: any) {
      console.error(`[RSS Intake] Error processing feed ${feed.rss_feed_url}:`, error.message)
      results.push({
        feedUrl: feed.rss_feed_url,
        totalItems: 0,
        newItems: 0,
        relevantItems: 0,
        processedItems: [],
        errors: [error.message]
      })
    }
  }

  console.log(`[RSS Intake] Completed feed check. ${results.reduce((sum, r) => sum + r.relevantItems, 0)} relevant items found.`)
  return results
}

export async function processSingleFeed(feedUrl: string): Promise<ProcessingResult> {
  const errors: string[] = []

  try {
    // 1. Parse feed
    const allItems = await parseFeed(feedUrl)
    console.log(`[RSS Intake] Parsed ${allItems.length} items from ${feedUrl}`)

    // 2. Filter out already processed items
    const newItems = filterNewItems(feedUrl, allItems)
    console.log(`[RSS Intake] Found ${newItems.length} new items`)

    if (newItems.length === 0) {
      return {
        feedUrl,
        totalItems: allItems.length,
        newItems: 0,
        relevantItems: 0,
        processedItems: [],
        errors
      }
    }

    // 3. Analyze relevance
    const criteria = getPromptForFeed(feedUrl)
    const relevantItems: RssFeedItem[] = []

    for (const item of newItems) {
      const result = analyzeRelevance(item, criteria)
      if (result.isRelevant) {
        relevantItems.push(item)
        console.log(`[RSS Intake] ✓ Relevant: "${item.title}" (score: ${result.score})`)
      } else {
        console.log(`[RSS Intake] ✗ Not relevant: "${item.title}" (score: ${result.score})`)
      }
    }

    // 4. Mark all new items as processed (both relevant and irrelevant)
    markAsProcessed(feedUrl, newItems)

    return {
      feedUrl,
      totalItems: allItems.length,
      newItems: newItems.length,
      relevantItems: relevantItems.length,
      processedItems: relevantItems,
      errors
    }
  } catch (error: any) {
    errors.push(error.message)
    throw error
  }
}
