import { createError, defineEventHandler, getHeader, readBody } from 'h3'
import { useRuntimeConfig } from '#imports'
import type { ScrapeResult } from '../../../types'
import { getScraperPersistence, hasScraperPersistence } from '../../lib/persistence'

interface EditPayload extends Partial<ScrapeResult> {
  includeHtml?: boolean
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

  const id = event.context.params?.id
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id parameter' })
  }

  const body = (await readBody(event)) as EditPayload | undefined
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Missing payload' })
  }

  if (body.id && body.id !== id) {
    throw createError({ statusCode: 400, statusMessage: 'Mismatched id in payload' })
  }

  const url = body.url?.trim()
  const normalizedUrl = (body.normalizedUrl || normaliseUrl(url || '')).trim()

  if (!url || !normalizedUrl) {
    throw createError({ statusCode: 400, statusMessage: 'Missing url or normalizedUrl' })
  }

  const text = body.content?.text
  if (typeof text !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing content text' })
  }

  const now = new Date().toISOString()
  const htmlSource = typeof body.content?.html === 'string' ? body.content.html : undefined
  const includeHtml = Boolean(body.includeHtml ?? Boolean(htmlSource))
  const hasHtml = Boolean(htmlSource || body.storage?.htmlPath)
  const persistence = getScraperPersistence()

  try {
    const stored = await persistence.upsertResult(
      {
        url,
        normalizedUrl,
        canonicalUrl: body.canonicalUrl,
        ts: now,
        type: body.type || 'html',
        status: body.status || 'ok',
        confidence: typeof body.confidence === 'number' ? body.confidence : 0,
        title: body.metadata?.title,
        language: body.metadata?.language,
        siteName: body.metadata?.siteName,
        hasHtml,
        errorCode: body.error?.code,
        errorMessage: body.error?.message
      },
      {
        html: htmlSource,
        text,
        meta: {
          metadata: body.metadata,
          confidenceFactors: body.confidenceFactors,
          debug: body.debug,
          storage: body.storage,
          error: body.error
        }
      },
      {
        forceHtmlStorage: Boolean(htmlSource && !includeHtml)
      }
    )

    const updated: ScrapeResult = {
      ...(body as ScrapeResult),
      id: stored.id || body.id || id,
      url,
      normalizedUrl,
      ts: now,
      content: {
        ...(body.content || { text: '' }),
        text,
        html: includeHtml ? htmlSource ?? body.content?.html : body.content?.html
      },
      metadata: { ...(body.metadata || {}) },
      storage: { ...(body.storage || {}), ...(stored.paths || {}) }
    }

    return updated
  } catch (error: any) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to persist edit',
      data: {
        code: 'DB_ERROR',
        message: error?.message || (hasScraperPersistence() ? 'Persistence failed' : 'Persistence provider unavailable')
      }
    })
  }
})

function normaliseUrl(url: string): string {
  if (!url) return ''
  try {
    return new URL(url).toString()
  } catch {
    return url
  }
}
