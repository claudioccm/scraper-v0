import { createResolver, defineNuxtModule } from '@nuxt/kit'

export interface SupabasePersistenceOptions {
  url?: string
  key?: string
  bucket?: string
}

export default defineNuxtModule<SupabasePersistenceOptions>({
  meta: {
    name: 'scraper-persistence-supabase',
    configKey: 'scraperSupabase'
  },
  defaults: {
    bucket: 'scraper'
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const runtimeDir = resolve('./runtime')

    nuxt.options.build.transpile = nuxt.options.build.transpile || []
    nuxt.options.build.transpile.push(runtimeDir)

    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.scraperPersistence = runtimeConfig.scraperPersistence || {}
    const existing = runtimeConfig.scraperPersistence.supabase || {}
    runtimeConfig.scraperPersistence.supabase = {
      bucket: options.bucket ?? existing.bucket ?? 'scraper',
      url: options.url ?? existing.url,
      key: options.key ?? existing.key
    }

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.alias = nitroConfig.alias || {}
      nitroConfig.alias['#scraper-persistence-supabase'] = resolve(runtimeDir, 'server')
      nitroConfig.plugins = nitroConfig.plugins || []
      nitroConfig.plugins.push(resolve(runtimeDir, 'nitro-plugin'))
    })
  }
})
