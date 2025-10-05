import type { ScrapeResult } from '../../types'

export interface PersistenceStoredPaths {
  htmlPath?: string
  textPath?: string
  metaPath?: string
}

export interface PersistenceMeta {
  id?: string
  url?: string
  normalizedUrl?: string
  canonicalUrl?: string | null
  ts?: string
  type?: string
  status?: string
  confidence?: number
  title?: string | null
  language?: string | null
  siteName?: string | null
  contentHash?: string | null
  hasHtml?: boolean
  errorCode?: string | null
  errorMessage?: string | null
}

export interface PersistenceBlobs {
  html?: string
  text?: string
  meta?: any
}

export interface PersistenceOptions {
  forceHtmlStorage?: boolean
  forceTextStorage?: boolean
  forceMetaStorage?: boolean
}

export interface PersistenceResult {
  id: string
  paths?: PersistenceStoredPaths
}

export interface ScraperPersistence {
  upsertResult(meta: PersistenceMeta, blobs?: PersistenceBlobs, options?: PersistenceOptions): Promise<PersistenceResult>
  findFreshByUrl(normalizedUrl: string, ttlMs: number): Promise<ScrapeResult | null>
}

let provider: ScraperPersistence | null = null
let warnedMissingProvider = false

const disabledPersistence: ScraperPersistence = {
  async upsertResult(meta) {
    warnNoProvider()
    return { id: meta.id || '' }
  },
  async findFreshByUrl() {
    warnNoProvider()
    return null
  }
}

export function registerScraperPersistence(instance: ScraperPersistence) {
  provider = instance
}

export function getScraperPersistence(): ScraperPersistence {
  return provider || disabledPersistence
}

export function hasScraperPersistence(): boolean {
  return provider !== null
}

function warnNoProvider() {
  if (warnedMissingProvider) return
  warnedMissingProvider = true
  console.warn('[scraper] Persistence provider missing; persistence disabled.')
}
