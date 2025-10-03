Nuxt Scraper Module (skeleton)

This is a local Nuxt 3 module that exposes a server endpoint to scrape a single URL and a composable to call it from the app. It’s scaffolded per the spec in `_process/specs/scraper.md`.

How to enable

1) Register the module in `nuxt.config.ts`:

   modules: [
     './modules/scraper'
   ],

2) Add config (minimum is a secret to protect the route):

   scraper: {
     secret: process.env.SCRAPER_SECRET
   }

3) Use the composable in pages/components:

   const { scrape } = useScraper()
   const result = await scrape('https://example.com/article')

The endpoint `/api/scrape` currently returns NOT_IMPLEMENTED; it’s a safe placeholder to wire UI and auth. Implementors can follow the spec to add HTML/PDF/YouTube handlers, storage, and confidence scoring.

