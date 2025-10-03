import { useRequestHeaders, useRuntimeConfig } from '#imports'
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

  return { scrape }
}
