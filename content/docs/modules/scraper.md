# Scraper Module

## Overview

The Scraper Module is a custom Nuxt module that provides intelligent web scraping capabilities for HTML pages, PDF documents, and YouTube videos. It automatically detects content types and applies appropriate extraction strategies.

**Location**: `modules/scraper/`
**Module Entry**: [modules/scraper/module.ts](../../../modules/scraper/module.ts)

## Features

- ✅ **Multi-format support**: HTML, PDF, YouTube
- ✅ **Automatic type detection**: Analyzes URL to determine content type
- ✅ **Metadata extraction**: Title, description, author, publish date, etc.
- ✅ **Confidence scoring**: Assigns confidence based on extraction quality
- ✅ **Supabase persistence**: Stores HTML, text, and metadata
- ✅ **Caching**: Configurable TTL for cached results
- ✅ **Browser engine support**: Puppeteer or Playwright
- ✅ **OCR support**: Optional OCR for image-heavy content

## Module Configuration

### Options

```typescript
interface ModuleOptions {
  browserEngine?: 'puppeteer' | 'playwright'  // Default: 'puppeteer'
  mode?: 'sync' | 'queue'                      // Default: 'sync'
  cacheTTL?: number                            // Default: 7 days (ms)
  secret?: string                              // API authentication
  ocr?: { enabled?: boolean }                  // Default: { enabled: true }
  returnHtmlDefault?: boolean                  // Default: true
  domainOverrides?: Record<string, unknown>    // Custom domain handlers
}
```

### Configuration in nuxt.config.ts

```typescript
export default defineNuxtConfig({
  modules: ['./modules/scraper'],
  runtimeConfig: {
    scraper: {
      secret: process.env.SCRAPER_SECRET,
      browserEngine: 'puppeteer',
      cacheTTL: 7 * 24 * 60 * 60 * 1000,  // 7 days
      ocr: { enabled: true }
    }
  }
})
```

## API Endpoints

The module auto-registers these endpoints:

### POST /api/scrape

Scrape a URL and return structured content.

**Request Body**:
```typescript
{
  url: string                    // Required: URL to scrape
  type?: 'auto' | 'html' | 'pdf' | 'youtube'  // Optional: force type
  options?: {
    timeoutMs?: number           // Request timeout
    preferBrowser?: boolean      // Force browser use
    languageHint?: string        // Expected language
    returnHtml?: boolean         // Include raw HTML
    force?: boolean              // Bypass cache
  }
}
```

**Response**:
```typescript
{
  id: string                     // Unique scrape ID
  type: 'html' | 'pdf' | 'youtube'
  url: string                    // Original URL
  normalizedUrl: string          // Cleaned URL
  canonicalUrl?: string          // Canonical URL from metadata
  ts: string                     // ISO timestamp
  status: 'ok' | 'blocked' | 'captcha' | 'error'
  confidence: number             // 0-1 confidence score
  confidenceFactors: string[]    // Factors affecting confidence
  content: {
    text: string                 // Extracted text
    html?: string                // Raw HTML (if requested)
  }
  metadata: {
    title?: string
    description?: string
    summary?: string
    author?: string
    publishDate?: string
    siteName?: string
    language?: string
    images?: string[]
    channelName?: string         // YouTube only
    tags?: string[]              // YouTube only
    durationSeconds?: number     // YouTube only
    transcripts?: Array<{        // YouTube only
      lang: string
      text: string
    }>
  }
  storage?: {
    htmlPath?: string            // Supabase storage path
    textPath?: string
    metaPath?: string
  }
  error?: {
    code: string
    message: string
  }
  debug?: {
    method: string
    attempts: Array<{ step: string; detail?: string }>
    toolsUsed: string[]
    notes?: string[]
  }
}
```

### PUT /api/scrape/:id

Update an existing scrape result (e.g., after manual edits).

**Request Body**: Same as POST response
**Response**: Updated ScrapeResult

## Composable: useScraper()

The module provides a composable for easy client-side scraping.

### Usage Example

```vue
<script setup>
import { useScraper } from '#imports'

const { scrape, isLoading, error } = useScraper()

async function handleScrape(url) {
  const result = await scrape(url, {
    type: 'auto',
    options: { returnHtml: true }
  })

  console.log('Title:', result.metadata.title)
  console.log('Text:', result.content.text)
}
</script>
```

### Composable API

```typescript
useScraper() => {
  scrape: (url: string, options?: ScrapeRequestOptions) => Promise<ScrapeResult>
  isLoading: Ref<boolean>
  error: Ref<Error | null>
}
```

## Content Type Detection

The scraper automatically detects content types based on URL patterns:

### HTML Pages
**Detection**: Default for http/https URLs
**Method**: Fetch with Puppeteer/Playwright or axios
**Extraction**:
- Parse HTML structure
- Extract Open Graph metadata
- Extract JSON-LD structured data
- Clean and extract main content text

### PDF Documents
**Detection**: URL ends with `.pdf` or Content-Type is `application/pdf`
**Method**: Download and parse with pdf-parse library
**Extraction**:
- Extract all text content
- Metadata from PDF properties
- No images or formatting preserved

### YouTube Videos
**Detection**: URL matches `youtube.com/watch` or `youtu.be/`
**Method**: YouTube API or yt-dlp
**Extraction**:
- Video metadata (title, channel, tags)
- Available transcripts (multiple languages)
- Duration, view count, publish date

## Confidence Scoring

Confidence is calculated based on:

1. **Metadata completeness** (40%):
   - Title present: +10%
   - Description present: +10%
   - Author present: +10%
   - Publish date present: +10%

2. **Content quality** (30%):
   - Text length > 100 chars: +10%
   - Text length > 500 chars: +10%
   - Text length > 2000 chars: +10%

3. **Extraction method** (30%):
   - Structured data available: +15%
   - Multiple metadata sources: +15%

**Result**: Score between 0 and 1

## Persistence with Supabase

When Supabase is configured, scraped content is stored:

### Storage Structure

```
bucket: scraper/
├── html/
│   └── {scrape-id}.html         # Raw HTML content
├── text/
│   └── {scrape-id}.txt          # Extracted text
└── metadata/
    └── {scrape-id}.json         # Metadata JSON
```

### Storage Behavior

- **Automatic**: Runs after successful scrape
- **Async**: Doesn't block response
- **Paths returned**: In `result.storage.*Path` fields
- **Retrieval**: Use Supabase client to fetch files

## Error Handling

### Status Codes

| Status | Description | When |
|--------|-------------|------|
| `ok` | Successful scrape | Content extracted successfully |
| `blocked` | Access denied | 403/401 HTTP status |
| `captcha` | CAPTCHA detected | Anti-bot protection triggered |
| `error` | Generic error | Network error, parsing failed, etc. |

### Error Response

When status is not `ok`:

```typescript
{
  status: 'error',
  error: {
    code: 'TIMEOUT' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'UNKNOWN',
    message: 'Human-readable error description'
  },
  // Partial data may still be present
  content: { text: '' },
  metadata: {}
}
```

## Advanced Features

### Domain Overrides

Configure custom handling for specific domains:

```typescript
// In module configuration
domainOverrides: {
  'twitter.com': {
    waitForSelector: '.tweet-text',
    scrollBehavior: 'infinite'
  },
  'linkedin.com': {
    requiresAuth: true
  }
}
```

*(Note: This feature is planned but not fully implemented yet)*

### Caching Strategy

- **Key**: Normalized URL
- **TTL**: Configurable (default 7 days)
- **Storage**: In-memory (production) or Redis (future)
- **Bypass**: Use `force: true` option

### Browser vs. HTTP Fetch

**HTTP Fetch (axios)**:
- Faster
- Lower resource usage
- Used for static pages

**Browser (Puppeteer)**:
- Handles JavaScript rendering
- Waits for dynamic content
- Used when `preferBrowser: true` or page requires JS

## Debugging

Enable debug mode by checking the `debug` field in responses:

```typescript
const result = await scrape(url)
if (result.debug) {
  console.log('Extraction method:', result.debug.method)
  console.log('Attempts:', result.debug.attempts)
  console.log('Tools used:', result.debug.toolsUsed)
  console.log('Notes:', result.debug.notes)
}
```

## Performance Considerations

### Scraping Speed

| Type | Avg Time | Notes |
|------|----------|-------|
| HTML (HTTP) | 1-3 sec | Fast for static pages |
| HTML (Browser) | 5-10 sec | Slower, renders JS |
| PDF | 2-5 sec | Depends on file size |
| YouTube | 3-6 sec | API call + transcript fetch |

### Resource Usage

- **Memory**: ~50-200 MB per browser instance
- **CPU**: High during PDF parsing
- **Network**: Depends on page size

### Optimization Tips

1. Use HTTP fetch when possible (avoid browser)
2. Enable caching for frequently accessed URLs
3. Set reasonable timeouts
4. Batch scraping operations
5. Consider queue mode for high volume

## Known Limitations

⚠️ **Current Limitations**:

- No JavaScript execution for HTTP fetch mode
- Limited CAPTCHA handling
- No proxy support
- No rate limiting per domain
- OCR not fully implemented
- Queue mode not implemented
- No distributed scraping

## Future Enhancements

Planned improvements:

- [ ] Queue mode with job management
- [ ] Distributed scraping support
- [ ] Better CAPTCHA solving integration
- [ ] Proxy rotation
- [ ] Per-domain rate limiting
- [ ] Screenshot capture
- [ ] Full OCR implementation
- [ ] Webhook notifications for async scrapes
- [ ] Scrape job history and analytics

## Example Use Cases

### Basic Scraping

```typescript
const { scrape } = useScraper()

// Scrape a blog post
const result = await scrape('https://example.com/article')
console.log(result.metadata.title)
console.log(result.content.text.substring(0, 200))
```

### PDF Scraping

```typescript
// Scrape a research paper
const result = await scrape('https://example.com/paper.pdf', {
  type: 'pdf'
})
console.log('Pages extracted:', result.content.text.length)
```

### YouTube Transcript

```typescript
// Get video transcript
const result = await scrape('https://www.youtube.com/watch?v=dQw4w9WgXcQ', {
  type: 'youtube'
})

if (result.metadata.transcripts) {
  const englishTranscript = result.metadata.transcripts.find(t => t.lang === 'en')
  console.log(englishTranscript.text)
}
```

### Force Fresh Scrape

```typescript
// Bypass cache
const result = await scrape(url, {
  options: { force: true }
})
```

## Testing

### Manual Testing

Use the test page at `/batch-test` or `/test` to scrape URLs via the UI.

### Programmatic Testing

```bash
# Run PDF scraping tests
npm run test:pdfs
```

Test script location: `scripts/run-pdf-scrapes.mjs`

## Related Documentation

- [**Persistence Module**](persistence) - How scraped data is stored
- [**API Endpoints**](../api/endpoints) - Complete API reference
- [**Architecture**](../architecture) - System overview
