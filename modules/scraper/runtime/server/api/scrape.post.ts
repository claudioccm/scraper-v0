import { Buffer } from 'node:buffer'
import { inflateSync } from 'node:zlib'
import { defineEventHandler, readBody, getHeader, createError } from 'h3'
import { useRuntimeConfig } from '#imports'
import { ofetch } from 'ofetch'
import pdfParse from 'pdf-parse/lib/pdf-parse.js'
import type { PDFParseResult } from 'pdf-parse/lib/pdf-parse.js'
import { getConfigForHost, getSummaryConfig } from '../../config'
import type { ScraperFieldConfig } from '../../config.types'
import { findFreshByUrl, mapDbJoinedToScrapeResult, upsertResult } from '../lib/store'
import type { ScrapeRequest, ScrapeRequestOptions, ScrapeResult, ScrapeType } from '../../types'

const SUMMARY_CONFIG = getSummaryConfig()

interface TraceEntry {
  step: string
  detail?: string
}

interface Trace {
  setMethod(method: string): void
  attempt(step: string, detail?: string): void
  use(tool: string): void
  note(value: string): void
  finalize(): { method: string; attempts: TraceEntry[]; toolsUsed: string[]; notes: string[] }
}

export default defineEventHandler(async (event) => {
  const cfg = useRuntimeConfig() as any
  const secret: string | undefined = cfg?.scraper?.secret

  if (secret) {
    const auth = getHeader(event, 'authorization') || ''
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (token !== secret) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }
  }

  const body = (await readBody(event)) as Partial<ScrapeRequest> | undefined
  if (!body?.url) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url' })
  }

  const targetUrl = body.url.trim()
  const normalizedOriginalUrl = normaliseUrl(targetUrl)
  const trace = createTrace()

  const options: ScrapeRequestOptions = body.options ?? {}
  const includeHtmlPreference = resolveReturnHtml(options, cfg)
  const inferredType = detectTypeFromUrl(targetUrl)
  const scrapeType: ScrapeType = (body.type && body.type !== 'auto') ? body.type : inferredType

  const cacheTTL = Number(cfg?.scraper?.cacheTTL ?? 0)
  if (!options.force && cacheTTL > 0) {
    try {
      const cached = await findFreshByUrl(normalizedOriginalUrl, cacheTTL)
      if (cached) {
        trace.setMethod('cache-hit')
        trace.use('supabase:cache')
        const result = mapDbJoinedToScrapeResult(cached)
        if (!includeHtmlPreference && result.content) {
          result.content.html = undefined
        }
        attachDebug(result, trace, targetUrl)
        return result
      }
    } catch (cacheError: any) {
      trace.note(`cache lookup failed: ${cacheError?.message || 'error'}`)
    }
  }

  try {
    if (scrapeType === 'pdf') {
      trace.setMethod('pdf-basic')
      const { result } = await scrapePdf(targetUrl, normalizedOriginalUrl, options, trace)
      attachDebug(result, trace, targetUrl)
      await persistScrapeResult(result, { rawHtml: undefined, includeHtml: false }, trace)
      return result
    }

    trace.setMethod('html-http')
    const { result, rawHtml } = await scrapeHtml(targetUrl, normalizedOriginalUrl, options, cfg, trace, includeHtmlPreference)
    attachDebug(result, trace, targetUrl)
    await persistScrapeResult(result, { rawHtml, includeHtml: includeHtmlPreference }, trace)
    return result
  } catch (error: any) {
    trace.note(error?.message || 'Unexpected error')
    const message = error?.message || 'Scrape failed'
    const type: 'html' | 'pdf' = scrapeType === 'pdf' ? 'pdf' : 'html'
    const result = buildErrorResult(normalizedOriginalUrl, type, 'UNHANDLED_ERROR', message)
    attachDebug(result, trace, targetUrl)
    await persistScrapeResult(result, { rawHtml: undefined, includeHtml: false }, trace)
    return result
  }
})

async function scrapeHtml(
  targetUrl: string,
  normalizedUrl: string,
  options: ScrapeRequestOptions | undefined,
  cfg: any,
  trace: Trace,
  includeHtmlOverride?: boolean
): Promise<{ result: ScrapeResult; rawHtml?: string }> {
  trace.attempt('html:http-fetch', targetUrl)
  let fetchResponse: Awaited<ReturnType<typeof ofetch.raw>>

  try {
    fetchResponse = await ofetch.raw(targetUrl, {
      method: 'GET',
      headers: {
        'user-agent': cfg?.scraper?.userAgent || DEFAULT_USER_AGENT,
        accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow',
      timeout: options?.timeoutMs ?? 30_000,
      responseType: 'text'
    })
    trace.use('ofetch:http')
  } catch (error: any) {
    const message = error?.message || 'Failed to fetch target URL'
    const result = buildErrorResult(normalizedUrl, 'html', 'FETCH_FAILED', message)
    trace.note(message)
    return { result }
  }

  const contentType = fetchResponse.headers.get('content-type') || ''
  if (contentType.includes('application/pdf')) {
    trace.note('Content-Type application/pdf detected during HTML scrape path')
    return scrapePdf(targetUrl, normalizedUrl, options, trace)
  }

  if (!contentType.includes('text/html')) {
    const result = buildErrorResult(
      normalizedUrl,
      'html',
      'UNSUPPORTED_CONTENT_TYPE',
      `Unsupported content type: ${contentType || 'unknown'}`
    )
    trace.note(`Unsupported content type: ${contentType || 'unknown'}`)
    return { result }
  }

  const renderContext = await resolveHtml(fetchResponse, targetUrl, trace)
  if (renderContext.blocked) {
    const result = buildErrorResult(
      normalizedUrl,
      'html',
      renderContext.errorCode,
      renderContext.errorMessage
    )
    result.status = 'blocked'
    result.confidenceFactors.push('challenge_page_detected')
    return { result }
  }

  const { html, responseUrl } = renderContext
  const baseMetadata = extractMetadata(html, responseUrl)
  const text = extractReadableText(html)
  const configured = extractConfiguredFields(html, responseUrl)
  const summaryCandidate = configured.summary || baseMetadata.description || createSummaryFromText(text)
  const summary = sanitizeSummary(summaryCandidate)
  const canonicalUrl = baseMetadata.canonicalUrl
  const metadata = {
    title: configured.title || baseMetadata.title,
    description: baseMetadata.description,
    summary,
    author: configured.author || baseMetadata.author,
    publishDate: baseMetadata.publishDate,
    siteName: configured.publication || baseMetadata.siteName,
    language: baseMetadata.language,
    images: baseMetadata.images
  }

  const { confidence, factors } = scoreHtml(text, {
    title: metadata.title,
    description: metadata.description,
    canonicalUrl,
    language: metadata.language
  })

  const includeHtml = typeof includeHtmlOverride === 'boolean' ? includeHtmlOverride : resolveReturnHtml(options, cfg)

  const result: ScrapeResult = {
    id: (globalThis.crypto?.randomUUID?.() ?? createFallbackUuid()),
    type: 'html',
    url: targetUrl,
    normalizedUrl,
    canonicalUrl,
    ts: new Date().toISOString(),
    status: 'ok',
    confidence,
    confidenceFactors: factors,
    content: {
      text,
      html: includeHtml ? html : undefined
    },
    metadata: {
      title: metadata.title,
      description: metadata.description,
      summary: metadata.summary,
      summaryGuideline: SUMMARY_CONFIG.prompt,
      author: metadata.author,
      publishDate: metadata.publishDate,
      siteName: metadata.siteName,
      language: metadata.language,
      images: metadata.images.slice(0, 10)
    }
  }

  return { result, rawHtml: html }
}

async function scrapePdf(
  targetUrl: string,
  normalizedUrl: string,
  options: ScrapeRequestOptions | undefined,
  trace: Trace
): Promise<{ result: ScrapeResult; rawHtml?: string }> {
  trace.setMethod('pdf-basic')
  trace.attempt('pdf:http-fetch', targetUrl)

  let fetchResponse: Awaited<ReturnType<typeof ofetch.raw>>
  try {
    fetchResponse = await ofetch.raw(targetUrl, {
      method: 'GET',
      headers: {
        'user-agent': DEFAULT_USER_AGENT,
        accept: 'application/pdf'
      },
      redirect: 'follow',
      timeout: options?.timeoutMs ?? 45_000,
      responseType: 'arrayBuffer'
    })
    trace.use('ofetch:http')
  } catch (error: any) {
    const message = error?.message || 'Failed to download PDF'
    trace.note(message)
    return { result: buildErrorResult(normalizedUrl, 'pdf', 'FETCH_FAILED', message) }
  }

  const contentType = fetchResponse.headers.get('content-type') || ''
  if (!contentType.includes('application/pdf')) {
    trace.note(`Expected PDF but received ${contentType || 'unknown'}`)
    return {
      result: buildErrorResult(
        normalizedUrl,
        'pdf',
        'UNSUPPORTED_CONTENT_TYPE',
        `Expected application/pdf but received ${contentType || 'unknown'}`
      )
    }
  }

  const buffer = fetchResponse._data as ArrayBuffer
  trace.attempt('pdf:text-extraction', 'pdf-parse')
  let text = ''
  let pdfParsedMeta: PdfParsedMetadata | undefined

  try {
    const parsed = await pdfParse(Buffer.from(buffer))
    const cleanedText = cleanExtractedValue(parsed.text)
    if (cleanedText) {
      text = cleanedText
      trace.use('pdf:pdf-parse')
    }
    pdfParsedMeta = extractPdfMetadata(parsed)
  } catch (parseError: any) {
    trace.note(`pdf-parse failed: ${parseError?.message || 'error'}`)
  }

  if (!text) {
    trace.attempt('pdf:text-extraction', 'regex')
    text = extractTextFromPdfStreams(buffer)
    if (text) trace.use('pdf:regex-extract')
  }

  let fallback: ParsedJinaDocument | undefined

  if (!text || text.length < 120) {
    trace.note('PDF extraction yielded little or no text, attempting jina.ai proxy fallback')
    const jinaUrl = buildJinaProxyUrl(targetUrl)
    if (jinaUrl) {
      trace.attempt('pdf:fallback-jina', jinaUrl)
      try {
        const jinaResponse = await ofetch<string>(jinaUrl, {
          method: 'GET',
          responseType: 'text',
          headers: {
            'user-agent': DEFAULT_USER_AGENT
          },
          timeout: options?.timeoutMs ?? 45_000
        })
        fallback = parseJinaDocument(jinaResponse)
        const cleaned = fallback?.text || cleanExtractedValue(jinaResponse)
        if (cleaned) {
          text = cleaned
          trace.use('jina.ai-proxy')
        }
      } catch (fallbackError: any) {
        trace.note(`jina.ai fallback failed: ${fallbackError?.message || 'error'}`)
      }
    }
  }

  if (!text) {
    trace.note('PDF extraction returned no usable text')
    const result = buildErrorResult(normalizedUrl, 'pdf', 'EMPTY_CONTENT', 'PDF extraction returned no text')
    return { result }
  }

  if (text.length > MAX_PDF_TEXT_LENGTH) {
    text = `${text.slice(0, MAX_PDF_TEXT_LENGTH).trim()}…`
  }

  const summarySource = fallback?.summary || createSummaryFromText(text)
  const summary = sanitizeSummary(summarySource || createSummaryFromText(text))
  const titleCandidate = fallback?.title || pdfParsedMeta?.title || text.split(/\r?\n/).map((l) => l.trim()).find(Boolean)
  const publishDate = fallback?.publishedTime || pdfParsedMeta?.publishDate
  const author = fallback?.author || pdfParsedMeta?.author
  const confidencePayload = scorePdf(text)

  const result: ScrapeResult = {
    id: (globalThis.crypto?.randomUUID?.() ?? createFallbackUuid()),
    type: 'pdf',
    url: targetUrl,
    normalizedUrl,
    canonicalUrl: undefined,
    ts: new Date().toISOString(),
    status: 'ok',
    confidence: confidencePayload.confidence,
    confidenceFactors: confidencePayload.factors,
    content: {
      text
    },
    metadata: {
      title: titleCandidate,
      summary,
      description: summary,
      summaryGuideline: SUMMARY_CONFIG.prompt,
      siteName: fallback?.siteName || extractHostname(targetUrl),
      publishDate,
      author
    }
  }

  return { result }
}

async function persistScrapeResult(
  result: ScrapeResult,
  ctx: { rawHtml?: string; includeHtml: boolean },
  trace: Trace
) {
  if (!result) return

  const htmlSource = typeof ctx.rawHtml === 'string' ? ctx.rawHtml : result.content?.html
  const textSource = result.content?.text ?? ''

  try {
    const stored = await upsertResult(
      {
        url: result.url,
        normalizedUrl: result.normalizedUrl,
        canonicalUrl: result.canonicalUrl,
        ts: result.ts,
        type: result.type,
        status: result.status,
        confidence: result.confidence,
        title: result.metadata?.title,
        language: result.metadata?.language,
        siteName: result.metadata?.siteName,
        hasHtml: Boolean(htmlSource),
        errorCode: result.error?.code,
        errorMessage: result.error?.message
      },
      {
        html: htmlSource,
        text: textSource,
        meta: {
          metadata: result.metadata,
          confidenceFactors: result.confidenceFactors,
          debug: result.debug,
          storage: result.storage,
          error: result.error
        }
      },
      {
        forceHtmlStorage: Boolean(ctx.rawHtml && !ctx.includeHtml)
      }
    )

    if (stored.id) {
      result.id = stored.id
    }

    if (stored.paths) {
      result.storage = { ...(result.storage || {}), ...stored.paths }
    }

    if (stored.id) {
      trace.use('supabase:persist')
    }
  } catch (error: any) {
    trace.note(`persistence failed: ${error?.message || 'error'}`)
  }
}

function resolveReturnHtml(options: ScrapeRequestOptions | undefined, cfg: any) {
  const requestedReturnHtml = options?.returnHtml
  return typeof requestedReturnHtml === 'boolean'
    ? requestedReturnHtml
    : Boolean(cfg?.scraper?.returnHtmlDefault)
}

function attachDebug(result: ScrapeResult, trace: Trace, url: string) {
  const debug = trace.finalize()
  result.debug = debug
  try {
    console.info('[scraper]', JSON.stringify({ url, debug }))
  } catch {
    // ignore logging issues
  }
}

function detectTypeFromUrl(url: string): ScrapeType {
  const candidate = url.trim()

  if (/\.pdf($|[?#])/i.test(candidate)) return 'pdf'

  try {
    const parsed = new URL(candidate)
    const pathname = parsed.pathname.toLowerCase()

    if (pathname.includes('/pdf/')) return 'pdf'
    if (pathname.endsWith('/pdf')) return 'pdf'
    if (/\/bitstreams\/[^/]+\/content$/i.test(pathname)) return 'pdf'

    const lastSegment = pathname.split('/').pop() || ''
    if (!lastSegment.includes('.') && /(?:^|[-_])pdf(?:$|[-_])/i.test(lastSegment)) return 'pdf'

    for (const value of parsed.searchParams.values()) {
      const lowered = value.toLowerCase()
      if (lowered === 'pdf') return 'pdf'
      if (lowered.endsWith('.pdf')) return 'pdf'
      if (lowered.includes('/pdf/')) return 'pdf'
    }
  } catch {
    // ignore URL parsing errors and fall through to default
  }

  if (/\/pdf($|\/)/i.test(candidate)) return 'pdf'

  return 'html'
}

const DEFAULT_USER_AGENT = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  'AppleWebKit/537.36 (KHTML, like Gecko)',
  'Chrome/120.0.0.0 Safari/537.36'
].join(' ')

function buildErrorResult(url: string, type: 'html' | 'pdf', code: string, message: string): ScrapeResult {
  return {
    id: (globalThis.crypto?.randomUUID?.() ?? createFallbackUuid()),
    type,
    url,
    normalizedUrl: normaliseUrl(url),
    ts: new Date().toISOString(),
    status: 'error',
    confidence: 0,
    confidenceFactors: [],
    content: { text: '' },
    metadata: {},
    error: { code, message }
  }
}

function normaliseUrl(url: string): string {
  try {
    return new URL(url).toString()
  } catch {
    return url
  }
}

function extractMetadata(html: string, baseUrl: string) {
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
  const metaAuthor = matchMetaContent(html, ['name="author"', 'property="article:author"'])
  const metaSite = matchMetaContent(html, ['property="og:site_name"'])
  const metaDescription = matchMetaContent(html, ['name="description"', 'property="og:description"'])
  const metaLangMatch = html.match(/<html[^>]*lang="([^"]+)"/i)
  const canonicalMatch = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/i)
  const ogImageMatches = [...html.matchAll(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"[^>]*>/gi)].map((m) => m[1])

  return {
    title: titleMatch?.[1]?.trim() || undefined,
    description: metaDescription || undefined,
    author: metaAuthor || undefined,
    siteName: metaSite || undefined,
    publishDate: matchMetaContent(html, ['property="article:published_time"']) || undefined,
    language: metaLangMatch?.[1]?.trim() || undefined,
    canonicalUrl: canonicalMatch?.[1] ? resolveUrl(baseUrl, canonicalMatch[1]) : undefined,
    images: ogImageMatches
  }
}

function matchMetaContent(html: string, needles: string[]): string | null {
  for (const needle of needles) {
    const regex = new RegExp(`<meta[^>]*${needle}[^>]*content="([^"]+)"[^>]*>`, 'i')
    const match = html.match(regex)
    if (match?.[1]) return match[1].trim()
  }
  return null
}

function resolveUrl(base: string, relative: string): string | undefined {
  try {
    return new URL(relative, base).toString()
  } catch {
    return undefined
  }
}

function extractReadableText(html: string): string {
  const mainRegion = extractMainRegion(html)
  let cleaned = mainRegion.replace(/<script[\s\S]*?<\/script>/gi, ' ')
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, ' ')
  cleaned = cleaned.replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
  cleaned = cleaned.replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
  cleaned = cleaned.replace(/<[^>]+>/g, ' ')
  cleaned = cleaned.replace(/&nbsp;/gi, ' ')
  cleaned = cleaned.replace(/&amp;/gi, '&')
  cleaned = decodeHtmlEntities(cleaned)
  cleaned = stripWeirdCharacters(cleaned)
  cleaned = cleaned.replace(/\s+/g, ' ')
  return cleaned.trim()
}

function extractMainRegion(html: string): string {
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i)
  if (articleMatch?.[0]) return articleMatch[0]

  const mainMatch = html.match(/<main[\s\S]*?<\/main>/i)
  if (mainMatch?.[0]) return mainMatch[0]

  const bodyMatch = html.match(/<body[\s\S]*?<\/body>/i)
  if (bodyMatch?.[0]) return bodyMatch[0]

  return html
}

function scoreHtml(
  text: string,
  metadata: { title?: string | undefined; description?: string | undefined; canonicalUrl?: string | undefined; language?: string | undefined }
) {
  const factors: string[] = []
  let score = 0

  if (text.length >= 800) {
    score += 0.4
    factors.push('text_length>=800')
  } else if (text.length >= 200) {
    score += 0.2
    factors.push('text_length>=200')
  }

  if (metadata.title) {
    score += 0.2
    factors.push('title_present')
  }

  if (metadata.description) {
    score += 0.1
    factors.push('description_present')
  }

  if (metadata.canonicalUrl) {
    score += 0.1
    factors.push('canonical_present')
  }

  if (metadata.language) {
    score += 0.1
    factors.push('language_detected')
  }

  const confidence = Math.min(1, score)
  return { confidence, factors }
}

function scorePdf(text: string) {
  const factors: string[] = []
  let score = 0

  if (text.length >= 800) {
    score += 0.6
    factors.push('text_length>=800')
  } else if (text.length >= 200) {
    score += 0.3
    factors.push('text_length>=200')
  }

  const containsParagraphs = /\n\s*\n/.test(text)
  if (containsParagraphs) {
    score += 0.2
    factors.push('paragraph_structure')
  }

  const asciiRatio = text ? text.replace(/[^\x20-\x7E]+/g, '').length / text.length : 0
  if (asciiRatio > 0.7) {
    score += 0.2
    factors.push('mostly_readable_ascii')
  }

  return { confidence: Math.min(1, score), factors }
}

function createFallbackUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

async function resolveHtml(
  initialResponse: Awaited<ReturnType<typeof ofetch.raw>>,
  originalUrl: string,
  trace: Trace
) {
  const initialHtml = initialResponse._data as string
  const initialUrl = initialResponse.url || originalUrl

  if (!isChallengePage(initialHtml)) {
    return { html: initialHtml, responseUrl: initialUrl, blocked: false as const }
  }

  trace.note('Encountered challenge page, attempting AMP fallback')
  const fallbackUrls = buildFallbackUrls(originalUrl)
  for (const candidate of fallbackUrls) {
    trace.attempt('html:amp-fallback', candidate)
    try {
      const res = await ofetch.raw(candidate, {
        method: 'GET',
        headers: {
          'user-agent': DEFAULT_USER_AGENT,
          accept: 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9'
        },
        redirect: 'follow',
        responseType: 'text'
      })
      const html = res._data as string
      if (!isChallengePage(html)) {
        trace.use('amp-fallback')
        return { html, responseUrl: res.url || candidate, blocked: false as const }
      }
    } catch (error: any) {
      trace.note(`AMP fallback failed for ${candidate}: ${error?.message || 'error'}`)
    }
  }

  return {
    blocked: true as const,
    errorCode: 'BLOCKED',
    errorMessage: 'Blocked by upstream anti-bot challenge. Try manual review or browser mode.'
  }
}

function isChallengePage(html: string) {
  const lowered = html.toLowerCase()
  return lowered.includes('client_captcha') || lowered.includes('attempt to load the requested page')
}

function buildFallbackUrls(originalUrl: string) {
  const candidates = new Set<string>()
  try {
    const base = new URL(originalUrl)

    const ampQuery = new URL(base.toString())
    ampQuery.searchParams.set('outputType', 'amp')
    candidates.add(ampQuery.toString())

    const altQuery = new URL(base.toString())
    altQuery.searchParams.set('output', 'amp')
    candidates.add(altQuery.toString())

    if (!base.pathname.endsWith('/amp/') && !base.pathname.endsWith('/amp')) {
      const ampPath = new URL(base.toString())
      const trimmedPath = ampPath.pathname.endsWith('/') ? ampPath.pathname.slice(0, -1) : ampPath.pathname
      ampPath.pathname = `${trimmedPath}/amp/`
      candidates.add(ampPath.toString())
    }
  } catch {
    // ignore malformed urls
  }

  return [...candidates]
}

function extractConfiguredFields(html: string, responseUrl: string) {
  const hostname = safeHostname(responseUrl)
  const config = getConfigForHost(hostname)

  return {
    title: cleanExtractedValue(extractFromConfig(html, config.title)),
    summary: sanitizeSummary(extractFromConfig(html, config.summary)),
    author: cleanExtractedValue(extractFromConfig(html, config.author)),
    publication: cleanExtractedValue(extractFromConfig(html, config.publication))
  }
}

function safeHostname(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return '*'
  }
}

function extractFromConfig(html: string, config?: ScraperFieldConfig): string {
  if (!config) return ''

  const byName = matchMetaByAttr(html, 'name', config.metaNames)
  if (byName) return byName

  const byProperty = matchMetaByAttr(html, 'property', config.metaProperties)
  if (byProperty) return byProperty

  if (config.regexes) {
    for (const pattern of config.regexes) {
      try {
        const re = new RegExp(pattern, 'i')
        const match = re.exec(html)
        if (match) {
          const candidate = match[1] || match[0]
          const cleaned = cleanExtractedValue(candidate)
          if (cleaned) return cleaned
        }
      } catch {
        // ignore invalid regex
      }
    }
  }

  return ''
}

function matchMetaByAttr(html: string, attr: 'name' | 'property', values?: string[]) {
  if (!values?.length) return ''
  for (const value of values) {
    const escaped = escapeRegex(value)
    const re = new RegExp(`<meta[^>]*${attr}\s*=\s*"${escaped}"[^>]*content\s*=\s*"([^"]+)"[^>]*>`, 'i')
    const match = re.exec(html)
    if (match?.[1]) {
      const cleaned = cleanExtractedValue(match[1])
      if (cleaned) return cleaned
    }
  }
  return ''
}

function stripWeirdCharacters(value: string) {
  if (!value) return ''

  let buffer = ''
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index)

    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(index + 1)
      if (next >= 0xdc00 && next <= 0xdfff) {
        buffer += value[index] + value[index + 1]
        index += 1
      } else {
        buffer += ' '
      }
      continue
    }

    if (code >= 0xdc00 && code <= 0xdfff) {
      buffer += ' '
      continue
    }

    buffer += value[index]
  }

  let normalized = buffer
  try {
    normalized = buffer.normalize('NFKC')
  } catch {
    normalized = buffer
  }

  return normalized
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g, ' ')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/[\u2028\u2029]/g, ' ')
    .replace(/[\uE000-\uF8FF]/g, ' ')
    .replace(/\uFFFD/g, ' ')
}

function cleanExtractedValue(text: string) {
  if (!text) return ''
  const withoutTags = stripWeirdCharacters(text)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
  const withoutControl = stripWeirdCharacters(withoutTags)
  const decoded = stripWeirdCharacters(decodeHtmlEntities(withoutControl))
  return decoded.replace(/\s+/g, ' ').trim()
}

function sanitizeSummary(text: string) {
  const cleaned = cleanExtractedValue(text)
  if (!cleaned) return ''
  if (cleaned.length <= MAX_SUMMARY_LENGTH) return cleaned
  return `${cleaned.slice(0, MAX_SUMMARY_LENGTH - 1).trim()}…`
}

function createSummaryFromText(text: string) {
  if (!text) return ''
  const normalized = normalizeForSummary(text)
  const words = normalized.split(/\s+/).slice(0, SUMMARY_WORD_LIMIT)
  return sanitizeSummary(words.join(' '))
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

const MAX_SUMMARY_LENGTH = SUMMARY_CONFIG.maxLength
const SUMMARY_WORD_LIMIT = Math.max(60, Math.round(MAX_SUMMARY_LENGTH / 5))
const MAX_PDF_TEXT_LENGTH = 20000

interface PdfParsedMetadata {
  title?: string
  author?: string
  publishDate?: string
  keywords?: string
}

function extractPdfMetadata(parsed: PDFParseResult | undefined): PdfParsedMetadata | undefined {
  if (!parsed) return undefined

  const info = parsed.info || {}
  const metadata = parsed.metadata

  const title = firstNonEmpty(
    typeof info.Title === 'string' ? info.Title : undefined,
    metadata?.has('dc:title') ? metadata.get('dc:title') : undefined,
    metadata?.has('pdf:docinfo:title') ? metadata.get('pdf:docinfo:title') : undefined
  )

  const author = firstNonEmpty(
    typeof info.Author === 'string' ? info.Author : undefined,
    metadata?.has('dc:creator') ? metadata.get('dc:creator') : undefined,
    metadata?.has('pdf:docinfo:author') ? metadata.get('pdf:docinfo:author') : undefined
  )

  const keywords = firstNonEmpty(
    typeof (info as any).Keywords === 'string' ? (info as any).Keywords : undefined,
    metadata?.has('pdf:docinfo:keywords') ? metadata.get('pdf:docinfo:keywords') : undefined
  )

  const publishDate = parsePdfDate(
    (typeof info.CreationDate === 'string' && info.CreationDate) ||
      (typeof info.ModDate === 'string' && info.ModDate) ||
      (metadata?.has('xmp:CreateDate') ? metadata.get('xmp:CreateDate') : undefined)
  )

  const result: PdfParsedMetadata = {}
  if (title) result.title = title
  if (author) result.author = author
  if (keywords) result.keywords = keywords
  if (publishDate) result.publishDate = publishDate

  return Object.keys(result).length ? result : undefined
}

function parsePdfDate(value: string | undefined): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined

  const normalized = trimmed.startsWith('D:') ? trimmed.slice(2) : trimmed
  const cleaned = normalized.replace(/'/g, '')
  const match = /^(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?([Zz]|[+-]\d{2}(\d{2})?)?/.exec(cleaned)

  if (!match) {
    const fallback = new Date(trimmed)
    return Number.isNaN(fallback.getTime()) ? undefined : fallback.toISOString()
  }

  const [, year, month = '01', day = '01', hour = '00', minute = '00', second = '00', tzRaw] = match

  let offset = 'Z'
  if (tzRaw && tzRaw.toUpperCase() !== 'Z') {
    let valueOffset = tzRaw
    if (valueOffset.length === 3) {
      valueOffset = `${valueOffset[0]}${valueOffset.slice(1)}:00`
    } else if (valueOffset.length === 5) {
      valueOffset = `${valueOffset.slice(0, 3)}:${valueOffset.slice(3)}`
    }
    offset = valueOffset
  }

  const isoCandidate = `${year}-${month}-${day}T${hour}:${minute}:${second}${offset}`
  const parsedDate = new Date(isoCandidate)
  if (Number.isNaN(parsedDate.getTime())) return undefined
  return parsedDate.toISOString()
}

function firstNonEmpty(...candidates: Array<string | undefined | null>): string | undefined {
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue
    const cleaned = cleanExtractedValue(candidate)
    if (cleaned) return cleaned
  }
  return undefined
}

function decodeHtmlEntities(value: string) {
  if (!value) return ''
  const named: Record<string, string> = {
    amp: '&',
    nbsp: ' ',
    quot: '"',
    apos: '\'',
    rsquo: '’',
    lsquo: '‘',
    ldquo: '“',
    rdquo: '”',
    hellip: '…'
  }

  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      const code = parseInt(hex, 16)
      return Number.isFinite(code) ? String.fromCharCode(code) : ''
    })
    .replace(/&#(\d+);/g, (_, code) => {
      const num = parseInt(code, 10)
      return Number.isFinite(num) ? String.fromCharCode(num) : ''
    })
    .replace(/&(amp|nbsp|quot|apos|rsquo|lsquo|ldquo|rdquo|hellip);/gi, (_match, key: string) => {
      const resolved = named[key.toLowerCase() as keyof typeof named]
      return typeof resolved === 'string' ? resolved : ''
    })
}

function extractTextFromPdfStreams(buffer: ArrayBuffer): string {
  const raw = Buffer.from(buffer)
  const marker = raw.toString('latin1')
  const parts: string[] = []

  let cursor = 0
  while (cursor >= 0 && cursor < marker.length) {
    const streamIdx = marker.indexOf('stream', cursor)
    if (streamIdx === -1) break

    const dictStart = marker.lastIndexOf('<<', streamIdx)
    const dictEnd = marker.indexOf('>>', streamIdx)
    if (dictStart === -1 || dictEnd === -1) {
      cursor = streamIdx + 6
      continue
    }

    const dict = marker.slice(dictStart, dictEnd + 2)
    let dataStart = streamIdx + 'stream'.length
    if (marker[dataStart] === '\r' && marker[dataStart + 1] === '\n') dataStart += 2
    else if (marker[dataStart] === '\n') dataStart += 1

    const endIdx = marker.indexOf('endstream', dataStart)
    if (endIdx === -1) break

    let data = raw.slice(dataStart, endIdx)

    // trim trailing newline characters
    while (data.length && (data[data.length - 1] === 0x0d || data[data.length - 1] === 0x0a)) {
      data = data.slice(0, data.length - 1)
    }

    data = applyPdfFilters(dict, data)

    const streamContent = data.toString('latin1')
    const streamParts: string[] = []

    const simpleMatches = streamContent.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)\s*T[Jj]/g) || []
    for (const match of simpleMatches) {
      const inner = match.replace(/\s*T[Jj]$/, '')
      const textMatch = inner.match(/\(([^()\\]*(?:\\.[^()\\]*)*)\)/)
      if (textMatch?.[1]) streamParts.push(decodePdfString(textMatch[1]))
    }

    const arrayMatches = streamContent.match(/\[(.*?)\]\s*TJ/g) || []
    for (const arraySegment of arrayMatches) {
      const tokenRegex = /\(([^()\\]*(?:\\.[^()\\]*)*)\)|(-?\d+(?:\.\d+)?)/g
      let tokenMatch: RegExpExecArray | null
      while ((tokenMatch = tokenRegex.exec(arraySegment))) {
        if (tokenMatch[1] !== undefined) {
          streamParts.push(decodePdfString(tokenMatch[1]))
        } else if (tokenMatch[2] !== undefined) {
          const adjustment = Number.parseFloat(tokenMatch[2])
          if (Number.isFinite(adjustment) && adjustment > 0) {
            streamParts.push(' ')
          }
        }
      }
    }

    const streamText = streamParts.join('')
    if (streamText.trim()) parts.push(streamText)

    cursor = endIdx + 'endstream'.length
  }

  const joined = parts.join('\n').replace(/\s+\n/g, '\n')
  return cleanExtractedValue(joined)
}

function applyPdfFilters(dict: string, data: Buffer): Buffer {
  const hasFlate = /\/Filter\s*(\[[^\]]*\]|[^\s]+)/.exec(dict)
  if (!hasFlate) return data

  try {
    if (/\/FlateDecode/.test(hasFlate[0])) {
      return inflateSync(data)
    }
  } catch {
    // swallow inflate errors and return original data
  }

  return data
}

function decodePdfString(input: string): string {
  return input
    .replace(/\\([nrtbf\\/\(\)])/g, (_match, char) => {
      switch (char) {
        case 'n':
          return '\n'
        case 'r':
          return '\r'
        case 't':
          return '\t'
        case 'b':
          return '\b'
        case 'f':
          return '\f'
        case '(': {
          return '(';
        }
        case ')': {
          return ')';
        }
        case '\\':
          return '\\'
        case '/':
          return '/'
        default:
          return char
      }
    })
    .replace(/\\([0-7]{1,3})/g, (_match, oct) => {
      const value = parseInt(oct, 8)
      return Number.isFinite(value) ? String.fromCharCode(value) : ''
    })
}

function extractHostname(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return undefined
  }
}

function normalizeForSummary(text: string) {
  const keywords = ['Abstract', 'This', 'The', 'These', 'We', 'Our', 'In', 'For', 'By', 'With', 'However', 'Despite']
  let normalized = stripWeirdCharacters(text)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Za-z])(\d)/g, '$1 $2')
    .replace(/(\d)([A-Za-z])/g, '$1 $2')
    .replace(/[0000-001f007f]+/g, ' ')

  for (const word of keywords) {
    const pattern = new RegExp(`([a-z])(${word})`, 'g')
    normalized = normalized.replace(pattern, `$1 ${word}`)
  }

  return normalized
}

function buildJinaProxyUrl(url: string) {
  try {
    const encoded = encodeURI(url)
    if (encoded.startsWith('http://')) return `https://r.jina.ai/${encoded}`
    if (encoded.startsWith('https://')) return `https://r.jina.ai/${encoded}`
    return `https://r.jina.ai/https://${encoded}`
  } catch {
    return ''
  }
}

interface ParsedJinaDocument {
  title?: string
  summary?: string
  text?: string
  siteName?: string
  publishedTime?: string
  author?: string
}

function parseJinaDocument(raw: string): ParsedJinaDocument | undefined {
  if (!raw) return undefined

  const title = matchLine(raw, /^Title:\s*(.+)$/m)
  const site = matchLine(raw, /^URL Source:\s*(https?:\/\/[^\s]+)$/m)
  const author = matchLine(raw, /^Author:\s*(.+)$/m)
  const published = matchLine(raw, /^(?:Published Time|Updated Time|Date):\s*(.+)$/m)

  let markdown = ''
  const markdownMatch = raw.match(/Markdown Content:\s*([\s\S]+)/)
  if (markdownMatch?.[1]) {
    markdown = markdownMatch[1].trim()
  }

  const textSource = markdown || raw
  const text = cleanExtractedValue(textSource)

  const paragraphs = markdown
    ? markdown.split(/\n\s*\n/).map((p) => cleanExtractedValue(p)).filter(Boolean)
    : text.split(/\n/).map((p) => p.trim()).filter(Boolean)

  const summary = paragraphs.find((p) => p.length > 80) || paragraphs[0] || ''

  return {
    title,
    summary: sanitizeSummary(summary || text),
    text,
    siteName: site ? extractHostname(site) || undefined : undefined,
    publishedTime: published || undefined,
    author: author || undefined
  }
}

function createTrace(): Trace {
  let method = 'unknown'
  const attempts: TraceEntry[] = []
  const toolsUsed: string[] = []
  const notes: string[] = []

  return {
    setMethod(next) {
      method = next
    },
    attempt(step, detail) {
      attempts.push(detail ? { step, detail } : { step })
    },
    use(tool) {
      if (!toolsUsed.includes(tool)) toolsUsed.push(tool)
    },
    note(value) {
      if (value) notes.push(value)
    },
    finalize() {
      return { method, attempts, toolsUsed, notes }
    }
  }
}
