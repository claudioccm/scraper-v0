import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ProcessedFeedCache, RssFeedItem } from '../../types'

const CACHE_PATH = resolve(process.cwd(), 'data/rss-processed-posts.json')

export function loadProcessedCache(): ProcessedFeedCache {
  if (!existsSync(CACHE_PATH)) {
    return {}
  }

  try {
    const content = readFileSync(CACHE_PATH, 'utf-8')
    return JSON.parse(content)
  } catch (error: any) {
    console.error('[RSS Dedup] Error loading cache:', error.message)
    return {}
  }
}

export function saveProcessedCache(cache: ProcessedFeedCache): void {
  try {
    writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2), 'utf-8')
  } catch (error: any) {
    console.error('[RSS Dedup] Error saving cache:', error.message)
  }
}

export function filterNewItems(feedUrl: string, items: RssFeedItem[]): RssFeedItem[] {
  const cache = loadProcessedCache()
  const feedCache = cache[feedUrl]

  if (!feedCache) {
    return items
  }

  const processedGuids = new Set(feedCache.processedGuids)
  return items.filter(item => !processedGuids.has(item.guid))
}

export function markAsProcessed(feedUrl: string, items: RssFeedItem[]): void {
  const cache = loadProcessedCache()

  if (!cache[feedUrl]) {
    cache[feedUrl] = {
      lastChecked: new Date().toISOString(),
      processedGuids: []
    }
  }

  const guids = items.map(item => item.guid)
  cache[feedUrl].processedGuids.push(...guids)
  cache[feedUrl].lastChecked = new Date().toISOString()

  // Keep only last 1000 GUIDs per feed to prevent unbounded growth
  if (cache[feedUrl].processedGuids.length > 1000) {
    cache[feedUrl].processedGuids = cache[feedUrl].processedGuids.slice(-1000)
  }

  saveProcessedCache(cache)
}

export function getLastChecked(feedUrl: string): string | undefined {
  const cache = loadProcessedCache()
  return cache[feedUrl]?.lastChecked
}
