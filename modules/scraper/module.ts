import { addImports, addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface ModuleOptions {
  browserEngine?: 'puppeteer' | 'playwright'
  mode?: 'sync' | 'queue'
  cacheTTL?: number
  secret?: string
  ocr?: { enabled?: boolean }
  returnHtmlDefault?: boolean
  domainOverrides?: Record<string, unknown>
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-scraper',
    configKey: 'scraper'
  },
  defaults: {
    browserEngine: 'puppeteer',
    mode: 'sync',
    cacheTTL: 7 * 24 * 60 * 60 * 1000,
    ocr: { enabled: true },
    returnHtmlDefault: true
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = resolve('./runtime')

    // Expose runtime config for server handler
    nuxt.options.runtimeConfig.scraper = {
      ...(nuxt.options.runtimeConfig.scraper as any),
      ...options
    }

    // API route (POST /api/scrape)
    addServerHandler({
      route: '/api/scrape',
      method: 'post',
      handler: resolve(runtimeDir, 'server/api/scrape.post')
    })

    addServerHandler({
      route: '/api/scrape/:id',
      method: 'put',
      handler: resolve(runtimeDir, 'server/api/scrape/[id].put')
    })

    // Composable auto-import
    addImports({
      name: 'useScraper',
      from: resolve(runtimeDir, 'composables/useScraper')
    })
  }
})
