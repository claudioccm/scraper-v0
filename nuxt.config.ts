import { config as loadEnv } from 'dotenv'

loadEnv()

const scraperSecret = process.env.SCRAPER_SECRET
const publicScraperSecret = process.env.NUXT_PUBLIC_SCRAPER_SECRET || scraperSecret
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || 'scraper'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxt/content',
    './modules/persistence-supabase',
    './modules/scraper'
  ],
  runtimeConfig: {
    scraper: {
      secret: scraperSecret
    },
    scraperPersistence: {
      supabase: {
        url: supabaseUrl,
        key: supabaseKey,
        bucket: supabaseBucket
      }
    },
    public: {
      scraper: {
        secret: publicScraperSecret
      }
    }
  },
  app: {
    head: {
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },],
      link: [
        // google icons
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" },
      ],
      script: [],
    }
  },
  css: [
    'public/css/styles.css'
  ],
  build: {
    transpile: ['vue-carousel'],
  },
  vite: {
  },
  plugins: [
    
  ],
  ssr: true,
  experimental: {
    clientFallback: true
  },
  components: [
    { path: '~/components', pathPrefix: false }
  ],
})
