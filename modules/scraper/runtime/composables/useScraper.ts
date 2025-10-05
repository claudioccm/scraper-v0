import { useRuntimeConfig } from '#imports'
import type { ScrapeRequestOptions, ScrapeResult } from '../types'

export const useScraper = () => {
  const cfg = useRuntimeConfig() as any

  async function scrape(url: string, options?: ScrapeRequestOptions): Promise<ScrapeResult> {
    const headers: Record<string, string> = {}
    const secret = cfg?.public?.scraper?.secret
    if (secret) headers['authorization'] = `Bearer ${secret}`

    return await $fetch<ScrapeResult>('/api/scrape', {
      method: 'POST',
      headers,
      body: { url, options }
    })
  }

  async function update(result: ScrapeResult, options?: { includeHtml?: boolean }): Promise<ScrapeResult> {
    if (!result?.id) {
      throw new Error('Scrape result id is required for updates')
    }

    const headers: Record<string, string> = {}
    const secret = cfg?.public?.scraper?.secret
    if (secret) headers['authorization'] = `Bearer ${secret}`

    const includeHtml = options?.includeHtml ?? Boolean(result.content?.html)

    return await $fetch<ScrapeResult>(`/api/scrape/${result.id}`, {
      method: 'PUT',
      headers,
      body: { ...result, includeHtml }
    })
  }

  return { scrape, update }
}
