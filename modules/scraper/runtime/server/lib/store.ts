import { Buffer } from 'node:buffer'
import { createHash } from 'node:crypto'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#imports'
import type { ScrapeResult } from '../../types'

export interface StoreConfig {
  url: string
  key: string
  bucket?: string
}

export interface StoredPaths {
  htmlPath?: string
  textPath?: string
  metaPath?: string
}

export interface DbRow {
  id: string
  url: string
  normalizedUrl: string
  canonicalUrl?: string | null
  ts: string
  type: string
  status: string
  confidence: number
  title?: string | null
  language?: string | null
  siteName?: string | null
  contentHash?: string | null
  hasHtml: boolean
  errorCode?: string | null
  errorMessage?: string | null
}

export type BlobKind = 'html' | 'text' | 'meta'

export interface DbBlob {
  resultId: string
  kind: BlobKind
  path: string | null
  content: string | null
}

export interface DbJoined extends DbRow {
  blobs: DbBlob[]
}

type SupabaseScrapeRow = {
  id: string
  url: string
  normalized_url: string
  canonical_url: string | null
  ts: string
  type: string
  status: string
  confidence: number
  title: string | null
  language: string | null
  site_name: string | null
  content_hash: string | null
  has_html: boolean
  error_code: string | null
  error_message: string | null
  scrape_blobs?: Array<{
    kind: BlobKind
    path: string | null
    content: string | null
  }>
}

interface PersistResult {
  id: string
  paths?: StoredPaths
}

let cachedClient: SupabaseClient | null = null
let cachedConfigKey = ''
let warnedMissingCredentials = false

export async function upsertResult(
  meta: Partial<DbRow>,
  blobs?: { html?: string; text?: string; meta?: any },
  options?: { forceHtmlStorage?: boolean; forceTextStorage?: boolean; forceMetaStorage?: boolean }
): Promise<PersistResult> {
  const client = getClient()
  if (!client) {
    warnMissingCredentials()
    return { id: meta.id || '' }
  }

  const config = resolveConfig()
  if (!config) {
    warnMissingCredentials()
    return { id: meta.id || '' }
  }

  if (!meta.url || !meta.normalizedUrl || !meta.type || !meta.status || typeof meta.confidence !== 'number') {
    throw new Error('Missing required fields for upsertResult')
  }

  const textPayload = typeof blobs?.text === 'string' ? blobs.text : ''
  const contentHash = meta.contentHash || (textPayload ? sha256(textPayload) : null)
  const hasHtml = Boolean(meta.hasHtml ?? blobs?.html)

  const rowPayload = sanitizeRowPayload({
    url: meta.url,
    normalized_url: meta.normalizedUrl,
    canonical_url: meta.canonicalUrl ?? null,
    ts: meta.ts || new Date().toISOString(),
    type: meta.type,
    status: meta.status,
    confidence: meta.confidence,
    title: meta.title ?? null,
    language: meta.language ?? null,
    site_name: meta.siteName ?? null,
    content_hash: contentHash,
    has_html: hasHtml,
    error_code: meta.errorCode ?? null,
    error_message: meta.errorMessage ?? null
  })

  const { data: upserted, error: upsertError } = await client
    .from('scrape_results')
    .upsert(rowPayload, { onConflict: 'normalized_url' })
    .select()
    .single()

  if (upsertError) {
    throw upsertError
  }

  const resultId = upserted?.id
  if (!resultId) {
    throw new Error('Supabase upsert did not return an id')
  }

  const storedPaths: StoredPaths = {}

  if (blobs) {
    const blobRecords: DbBlob[] = []

    if (typeof blobs.html === 'string') {
      const { record, path } = await prepareBlob(client, config, resultId, 'html', blobs.html, {
        forceStorage: options?.forceHtmlStorage
      })
      blobRecords.push(record)
      if (path) storedPaths.htmlPath = path
    }

    if (typeof blobs.text === 'string') {
      const { record, path } = await prepareBlob(client, config, resultId, 'text', blobs.text, {
        forceStorage: options?.forceTextStorage
      })
      blobRecords.push(record)
      if (path) storedPaths.textPath = path
    }

    if (typeof blobs.meta !== 'undefined') {
      const metaPayload = typeof blobs.meta === 'string' ? blobs.meta : JSON.stringify(blobs.meta)
      const { record, path } = await prepareBlob(client, config, resultId, 'meta', metaPayload, {
        forceStorage: options?.forceMetaStorage
      })
      blobRecords.push(record)
      if (path) storedPaths.metaPath = path
    }

    if (blobRecords.length) {
      const { error: blobError } = await client
        .from('scrape_blobs')
        .upsert(blobRecords.map((blob) => ({
          result_id: blob.resultId,
          kind: blob.kind,
          path: blob.path,
          content: blob.content
        })), { onConflict: 'result_id,kind' })

      if (blobError) {
        throw blobError
      }
    }
  }

  return { id: resultId, paths: storedPaths }
}

export async function findFreshByUrl(normalizedUrl: string, ttlMs: number): Promise<DbJoined | null> {
  if (!ttlMs || ttlMs <= 0) return null

  const client = getClient()
  if (!client) {
    warnMissingCredentials()
    return null
  }

  const threshold = new Date(Date.now() - ttlMs).toISOString()

  const { data, error } = await client
    .from('scrape_results')
    .select(
      `
        id,
        url,
        normalized_url,
        canonical_url,
        ts,
        type,
        status,
        confidence,
        title,
        language,
        site_name,
        content_hash,
        has_html,
        error_code,
        error_message,
        scrape_blobs(kind,path,content)
      `
    )
    .eq('normalized_url', normalizedUrl)
    .gt('ts', threshold)
    .order('ts', { ascending: false })
    .limit(1)

  if (error) {
    throw error
  }

  if (!data || !data.length) return null

  const row = data[0] as SupabaseScrapeRow

  return {
    id: row.id,
    url: row.url,
    normalizedUrl: row.normalized_url,
    canonicalUrl: row.canonical_url,
    ts: row.ts,
    type: row.type,
    status: row.status,
    confidence: row.confidence,
    title: row.title,
    language: row.language,
    siteName: row.site_name,
    contentHash: row.content_hash,
    hasHtml: row.has_html,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    blobs: (row.scrape_blobs || []).map((blob) => ({
      resultId: row.id,
      kind: blob.kind,
      path: blob.path,
      content: blob.content
    }))
  }
}

export function mapDbJoinedToScrapeResult(row: DbJoined): ScrapeResult {
  const textBlob = row.blobs.find((blob) => blob.kind === 'text')
  const htmlBlob = row.blobs.find((blob) => blob.kind === 'html')
  const metaBlob = row.blobs.find((blob) => blob.kind === 'meta')

  let parsedMeta: any = null
  if (metaBlob?.content) {
    try {
      parsedMeta = JSON.parse(metaBlob.content)
    } catch {
      parsedMeta = null
    }
  }

  const metadata = (parsedMeta?.metadata || {}) as ScrapeResult['metadata']

  const result: ScrapeResult = {
    id: row.id,
    type: row.type as any,
    url: row.url,
    normalizedUrl: row.normalizedUrl,
    canonicalUrl: row.canonicalUrl ?? undefined,
    ts: row.ts,
    status: row.status as any,
    confidence: row.confidence,
    confidenceFactors: parsedMeta?.confidenceFactors || [],
    content: {
      text: textBlob?.content || '',
      html: htmlBlob?.content || undefined
    },
    metadata: metadata,
    storage: {
      htmlPath: htmlBlob?.path || undefined,
      textPath: textBlob?.path || undefined,
      metaPath: metaBlob?.path || undefined
    },
    error: row.errorCode || row.errorMessage
      ? { code: row.errorCode || 'DB_ERROR', message: row.errorMessage || 'Stored error' }
      : undefined,
    debug: parsedMeta?.debug
  }

  return result
}

function sanitizeRowPayload<T extends Record<string, any>>(row: T): T {
  const cleaned = { ...row }
  for (const key of Object.keys(cleaned)) {
    if (cleaned[key] === undefined) cleaned[key] = null
  }
  return cleaned
}

async function prepareBlob(
  client: SupabaseClient,
  config: StoreConfig,
  resultId: string,
  kind: BlobKind,
  payload: string,
  opts?: { forceStorage?: boolean }
): Promise<{ record: DbBlob; path?: string }> {
  const value = payload
  const limits: Record<BlobKind, number> = { html: 200_000, text: 1_000_000, meta: 1_000_000 }
  const limit = limits[kind]
  const shouldUseStorage = Boolean(opts?.forceStorage) || value.length > limit

  if (shouldUseStorage && config.bucket) {
    const path = buildStoragePath(resultId, kind)
    const contentType = kind === 'html' ? 'text/html' : kind === 'text' ? 'text/plain' : 'application/json'
    const { error } = await client.storage.from(config.bucket).upload(path, Buffer.from(value, 'utf-8'), {
      cacheControl: '3600',
      upsert: true,
      contentType
    })

    if (!error) {
      return { record: { resultId, kind, path, content: null }, path }
    }
  }

  return { record: { resultId, kind, path: null, content: value } }
}

function buildStoragePath(resultId: string, kind: BlobKind) {
  switch (kind) {
    case 'html':
      return `scraper/${resultId}/index.html`
    case 'text':
      return `scraper/${resultId}/content.txt`
    case 'meta':
      return `scraper/${resultId}/meta.json`
    default:
      return `scraper/${resultId}/${kind}`
  }
}

function sha256(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function getClient(): SupabaseClient | null {
  const config = resolveConfig()
  if (!config?.url || !config?.key) return null

  const configKey = `${config.url}:${config.key}`
  if (cachedClient && cachedConfigKey === configKey) {
    return cachedClient
  }

  cachedClient = createClient(config.url, config.key, {
    auth: {
      persistSession: false
    }
  })
  cachedConfigKey = configKey
  return cachedClient
}

function resolveConfig(): StoreConfig | null {
  const cfg = useRuntimeConfig() as any
  const supabase = cfg?.scraper?.supabase || cfg?.scraperSupabase
  if (!supabase?.url || !supabase?.key) return null
  return {
    url: supabase.url,
    key: supabase.key,
    bucket: supabase.bucket || 'scraper'
  }
}

function warnMissingCredentials() {
  if (warnedMissingCredentials) return
  warnedMissingCredentials = true
  console.warn('[scraper] Supabase credentials missing; persistence disabled.')
}
