export interface RssFeedConfig {
  rss_feed_url: string
  custom_prompt?: string
  system_prompt?: string
}

export interface RssIntakeConfig {
  system_prompt: string
  feeds: RssFeedConfig[]
}

export interface RssFeedItem {
  guid: string
  title: string
  link: string
  description?: string
  pubDate?: string
  author?: string
}

export interface ProcessedFeedCache {
  [feedUrl: string]: {
    lastChecked: string
    processedGuids: string[]
  }
}

export interface RelevanceResult {
  isRelevant: boolean
  score: number
  reason?: string
}
