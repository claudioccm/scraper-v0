# Scraper Module – Implementation Spec (v0)

This spec defines a serverless‑friendly, text‑first scraper module for Nuxt 3. It implements HTML, PDF, and YouTube extraction with best‑effort anti‑bot handling, Supabase persistence, and a composable/UI API. Defaults reflect your answers; where unspecified, pragmatic defaults are chosen to enable immediate implementation.

## Overview

- Purpose: Single‑URL scraping to extract core content and metadata from HTML, PDFs, and YouTube. Text is prioritized; optional image URLs surfaced. No paid services.
- Mode: Serverless‑first (sync per request). UI may submit multiple URLs as separate requests.
- Anti‑bot: Best‑effort stealth; no proxies; do not obey robots.txt; bail out quickly on CAPTCHAs/blocks.
- Storage: Supabase (Postgres + optional Storage bucket). Keep latest snapshot only.
- Observability: JSON logs; no metrics/alerts for v0.

## Nuxt Module Shape

- Module: Registers Nitro endpoints and exposes a composable.
- Endpoints:
  - POST `/api/scrape` → Synchronous scrape of a single URL.
  - (Optional serverful only) POST `/api/scrape/queue`, GET `/api/scrape/:jobId` using in‑process queue.
- Composable: `useScraper().scrape(url, options)` → calls `/api/scrape`.
- Config (nuxt.config): `scraper: { browserEngine, mode, cacheTTL, secret, supabase, ocr, returnHtmlDefault }`.
- Packaging: Local module at `modules/scraper`.

## Input

Body for `/api/scrape`:

```ts
type ScrapeType = 'auto' | 'html' | 'pdf' | 'youtube'

interface ScrapeRequest {
  url: string
  type?: ScrapeType // default 'auto'
  options?: {
    timeoutMs?: number // default 30000
    preferBrowser?: boolean // default false (try HTTP first)
    languageHint?: string // e.g., 'en'
    returnHtml?: boolean // default true
    force?: boolean // default false (bypass cache)
  }
}
```

Single URL only (batch handled by UI).

## Output

```ts
interface ScrapeResult {
  id: string
  type: 'html' | 'pdf' | 'youtube'
  url: string
  normalizedUrl: string
  canonicalUrl?: string
  ts: string // ISO timestamp
  status: 'ok' | 'blocked' | 'captcha' | 'error'
  confidence: number // 0..1
  confidenceFactors: string[]
  content: {
    text: string
    html?: string // optional snapshot when returnHtml=true and available
  }
  metadata: {
    title?: string
    author?: string
    publishDate?: string
    siteName?: string
    language?: string
    images?: string[]
    // YouTube extras (when type='youtube')
    channelName?: string
    tags?: string[]
    durationSeconds?: number
    transcripts?: Array<{ lang: string; text: string }>
  }
  storage?: {
    htmlPath?: string
    textPath?: string
    metaPath?: string
  }
  error?: { code: string; message: string }
}
```

## Type Detection & Routing

- `youtube`: Match `youtube.com`/`youtu.be` → YouTube extractor.
- `pdf`: URL ends with `.pdf` or `Content-Type: application/pdf`.
- `html`: Default.

## HTML Strategy

- Fetch: Use `undici` HTTP first. If likely JS‑rendered or low content density, fallback to headless browser.
- Browser (serverless default): `puppeteer-core` + `@sparticuz/chromium` with realistic UA/viewport/locale; small random delays; no proxies.
- Parse: `jsdom` + `@mozilla/readability` for main content; collect OpenGraph/meta; `franc` for language.
- Keep: cleaned `text` + optional full `html` snapshot; image URLs optional via config.
- Canonicalize: resolve `<link rel="canonical">`; normalize URLs (normalize-url); normalize internal links.
- Domain overrides: optional per‑domain selector hooks via module config map.

## PDF Strategy

- Fetch: HTTP GET; do not persist bytes; store original URL only.
- Extract: `pdf-parse` for text + metadata. If too little text, run OCR with `tesseract.js` (auto language; fallback `eng`).
- Output: full text only (no layout blocks); include basic metadata when available.

## YouTube Strategy

- No downloads.
- Prefer `youtubei.js` for metadata; fall back to `ytdl-core` and `youtube-transcript` if needed.
- Return title, description, tags, channel name, publish date, duration, and transcripts (auto/manual when available).

## Confidence Scoring (0–1)

- HTML:
  - +0.35 text length ≥ 800 chars and good density
  - +0.20 reasonable title present
  - +0.15 high‑confidence language detection
  - +0.15 canonical URL present
  - +0.15 readability main/body ratio ≥ 0.35
- PDF:
  - +0.6 text length ≥ 800 chars (or OCR success)
  - +0.2 metadata present (title/author/pages)
  - +0.2 language detected
- YouTube:
  - +0.5 transcript present and ≥ 2000 chars
  - +0.3 metadata complete (title/desc/tags)
  - +0.2 language detected
- Clamp to [0,1]; include `confidenceFactors`.

## Anti‑Bot & CAPTCHA

- Do not obey `robots.txt`.
- No proxies. Stealth via UA/viewport/locale; minor random delays.
- CAPTCHA detection heuristics (reCAPTCHA/hCaptcha frames/selectors). On detection: `status='captcha'` and return.
- If blocked or heavy challenges persist within `timeoutMs`, set `status='blocked'`.

## Idempotency & Cache

- Key: normalized URL (store canonical when present). Optionally include type in key.
- Cache: TTL default 7 days. If cached and `force=false`, return cached.
- Hash: `SHA‑256(text)` stored for internal comparison; only latest version retained.

## Storage (Supabase)

- Postgres tables (recommend):

```sql
create table if not exists scrape_results (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  normalized_url text not null unique,
  canonical_url text,
  ts timestamptz not null default now(),
  type text not null,
  status text not null,
  confidence double precision not null,
  title text,
  language text,
  site_name text,
  content_hash text,
  has_html boolean not null default false,
  error_code text,
  error_message text
);

create table if not exists scrape_blobs (
  result_id uuid references scrape_results(id) on delete cascade,
  kind text not null check (kind in ('html','text','meta')),
  path text,
  content text,
  primary key (result_id, kind)
);
```

- Supabase Storage (optional for large HTML): bucket `scraper/` with per‑result folder; then store `path` in `scrape_blobs` (leave `content` NULL).

## Queueing (Optional)

- Serverless default: synchronous only.
- Serverful/Nitro: in‑process `p-queue` with `concurrency=2`; expose `/api/scrape/queue` and `/api/scrape/:jobId`.

## Config (nuxt.config)

```ts
export default defineNuxtConfig({
  modules: [
    // './modules/scraper'
  ],
  scraper: {
    browserEngine: 'puppeteer', // 'puppeteer' | 'playwright'
    mode: 'sync',               // 'sync' | 'queue'
    cacheTTL: 7 * 24 * 60 * 60 * 1000,
    secret: process.env.SCRAPER_SECRET,
    supabase: {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_SERVICE_KEY
    },
    ocr: { enabled: true },
    returnHtmlDefault: true,
    domainOverrides: {
      // 'example.com': { selectors: { title: 'h1', content: '#article' } }
    }
  }
})
```

## Security

- Require Bearer token: `Authorization: Bearer <secret>` for endpoints. If `secret` unset → endpoints are public (not recommended).
- UI should call a server proxy that injects the token.

## Dependencies

- Core: `undici`, `normalize-url`, `jsdom`, `@mozilla/readability`, `franc`, `sanitize-html`, `p-queue`
- Browser (serverless): `puppeteer-core`, `@sparticuz/chromium`
- Serverful alt: `playwright`
- PDF: `pdf-parse`, `tesseract.js`
- YouTube: `youtubei.js` (preferred), fallback: `ytdl-core`, `youtube-transcript`
- Storage: `@supabase/supabase-js`

## Non‑Goals (v0)

- No site crawling/sitemaps, no proxies, no paid APIs, no retries/backoff, no comments scraping, no screenshots/tracing, no alerts/metrics dashboards.

## Open Decisions (defaults assumed if not changed)

- Serverless target: choose Vercel/Netlify/AWS later; defaults stay serverless‑compatible.
- Browser engine default: `puppeteer-core + @sparticuz/chromium`.
- Cache TTL default 7 days; can override per project.
- YouTube extractor: `youtubei.js` preferred to avoid binaries.

---

My plan is to set up a generic web scraper

- I want to leverage existing tools. 
- I want to avoid paid solutions.
- I'm OK with setting up multple free tools to work in tandem or 
- I want it to be a Nuxt Module or Composable that I can add to different Nuxt Projects. 
- I want to be able to scrape:
  - HTML pages
  - Pages that are blocked by AI blockers and Captchas
  - PDFs
  - Videos (mainly youtube)

---

## Goals & Scope

Primary goal: archive text only, or also media assets (images/audio/subtitles)? Mainly Text. We could have an image(url) config. 

Success criteria: what output proves a scrape “worked” (e.g., article text + title + URL + timestamp + source HTML)? The Scraper needs to have a confidence score. It can be done by the scraper itself, based on key metrics, or by an LLM that can compare both data points. The Key metrics seem to be easier and quicker to implement for now. We could log this more complex scoring system for a future iteration. 

Target depth: single URLs, site sections, or full-site crawls/sitemaps?
We can assume that the scraper will be triggered by a single URL, and the objective is to extract the core content of that page/pdf/video

Supported domains: any notable high-priority sites we should validate first?
Youtube for videos

Robots.txt: respect by default (recommended), or allow override per-domain?
Completely ignore. We want to be able to bulldoze those. 

## Runtime & Deployment

Where will it run: Node server (Nuxt Nitro), serverless (Vercel/Netlify), container/VM? Either Nuxt Nitro or serverless. We need to find a sweetspot between implementation complexity and server complexity. My preference is to run these things Serverless. 

Allowed dependencies: are browser binaries (Playwright Chromium) acceptable in prod? Yes. There is a ChromeDevTools mcp that seems to work too. I don't know which one is better. The bottom line is if it works it works. I'd like to avoid paid scraping services, but any open source/free services/packages are good to go. 

OS/CPU constraints we must support (Linux-only ok)? Nope

Concurrency limits and memory budget (e.g., 512MB/1GB)? I don't know what this means. 

Is Redis (for queueing/rate limits) available, or prefer in-process queue?
Queueing is good. 

## Anti-Bot Strategy

Rendering engine: Playwright preferred? (best balance for JS-rendered pages)
See "Allowed Dependencies Answer"

Fingerprinting/stealth: OK to use stealth plugins and realistic fingerprints? idk what this means. 

Proxies: allowed? Any existing proxies/Tor, or none (best-effort without)?
Best effort without

CAPTCHA policy: manual human-in-the-loop fallback acceptable? Strictly avoid solving? Try to bypass automatically if not, inform that the url failed because of Captcha

Blocker tolerance: acceptable failure rate for hard-protected pages?
Try to scrape blocked pages. If it can't in a decent timeframe, just fail, and inform user. 


## Inputs & API

How will you trigger scrapes: server API endpoint (POST /api/scrape), CLI, or both? We will have an interface/form submission for that.

Input format: single URL, batch of URLs, or crawl config (seed + rules)?
Users will be able to submit multiple URLs, but these can be treated at the interface level. The Scraper module can assume it will receive a single url as input. Unless this is a stupid strategy. I'm open to discussion here. 

Per-request options: userAgent, language, viewport, proxy, JavaScript enable, max time, retries? I'm not sure what this entails. 

Output format: JSON schema you want returned/stored (fields)?
The module will return a standard JSON schema. We could provide the ability to configure this output schema on a per project basis. Something like, adding the JSON structure as an optional config for the module. 


Idempotency: dedupe by normalized URL and content hash?
yes, dedupe by normalized url. Log all urls ever scraped. 
Need to be able to turn that on and off, but testing and edge cases.


## Extraction Rules

Default extraction: Mozilla Readability for main content + metadata?
Can be, I'm not sure. 

Selector overrides per site (domain rules) needed?


Keep full HTML snapshot and a cleaned text version?
yes.

Link normalization and canonical URL resolution desired?
yes.

Language detection and basic cleanup (whitespace, boilerplate) included?
yes.

## Crawling & Scheduling

Crawler needed now or phase 2? If now: breadth/depth, same-domain only? Idk. Not sure we will ever need it. 

Rate limiting per-domain (req/min) and global concurrency? No

Retry/backoff policy (e.g., 3 tries, expo backoff)? No

Scheduling: cron jobs inside Nuxt (Nitro tasks) or external scheduler?
External Scheduler

Sitemap/robots parsing included?
No

## Storage & Caching

Storage target: filesystem, SQLite, Postgres, or bring-your-own?
Supabase.

Cache policy: store successful responses (HTML/PDF bytes) and TTL?
Not sure. Advise

Versioning: keep previous snapshots or only latest?
Ignore versioning

Indexing: do you want simple keyword search later (SQLite FTS5)?
No

File structure if filesystem: base dir + domain/yyyymmdd/slug?

## PDFs & OCR

PDFs: parse text with pdf-parse + metadata OK?
Yes. 

OCR for scanned PDFs/images: include tesseract.js (slower, but free)?
Yes. 

Keep original PDF bytes for reprocessing? Just save the url for the PDF, so we can access it if needed. 

Multipage PDF handling: per-page text + layout blocks or just full text?
full text


## Videos (YouTube)

What to extract: metadata (title/desc/tags), captions/transcript, comments, or video files? metadata (title/desc/tags), captions/transcript,

Downloading video files: allowed or avoid (ToS concerns)? If download, yt-dlp is best. NO

Transcripts: OK to use yt-dlp to pull autogenerated/manual captions when available? Yes

No paid APIs: confirm we won’t use YouTube Data API (needs key), prefer scraping/yt-dlp. If it is free, we can use API keys, otherwise, no. 


## Compliance & Ethics

Default stance: obey robots.txt + rate limits, no bypass of paywalls/CAPTCHAs? DO NOT OBEY. Attempt bypass. 

Do you need a “research mode” toggle that relaxes constraints with explicit consent? NO

Audit log of fetch parameters and decisions (robots, delay, retries)?
NO

PII handling: any redaction or filtering needed?
NO

## Observability & Ops

Logging level and sink: console only or file logs; JSON logs?
JSON Logs

Metrics: counts of success/fail, per-domain block rates, avg latency?
IDK

Tracing/screenshots on failures (saved to disk) helpful?
NO

Alerting: any notification on persistent failures (email/slack later)?
NO

## Nuxt Integration

Packaging: Nuxt 3 module that registers Nitro server endpoints + composable client? YES

Composable shape: useScraper().scrape(url, options) and useScraper().status(jobId)? Sure

Config via nuxt.config with runtime env overrides? Sure

Multi-project reuse: publish as private workspace package or local module path? Local


Route protection: auth or IP-allowlist for /api/scrape? idk, advise

If you prefer quick defaults, I can assume:

Playwright + stealth, Readability extraction, JSON output, filesystem storage, optional Redis, manual CAPTCHA fallback, robots-respecting by default with per-domain overrides, yt-dlp for YouTube metadata/transcripts (no downloads), pdf-parse + optional Tesseract OCR, and a Nuxt module exposing /api/scrape, plus a simple composable.

I like your defaults. Use them if my answers are not solid enough.
