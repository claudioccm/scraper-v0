# Spec: Scraper Handlers (HTML, PDF, YouTube)

Status: Ready to implement
Owner: modules/scraper
Scope: Implement single-URL scraping for HTML, PDF, and YouTube.

## Goals
- Extract high-quality text and metadata for a single URL.
- Prioritize static HTTP fetch; fallback to browser for JS-heavy pages.
- Detect and report CAPTCHA/blocks quickly.
- No paid services; serverless-friendly defaults.

## Contracts

- Entry point (server route): `modules/scraper/runtime/server/api/scrape.post.ts` calls dispatcher.
- Dispatcher: `scrape(url, reqType, options, ctx) -> Promise<ScrapeResult>`
- Type detection:
  - `detectType(url, contentType?) -> 'html' | 'pdf' | 'youtube'`
- Handlers:
  - `scrapeHtml(url, options, ctx) -> Promise<ScrapeResult>`
  - `scrapePdf(url, options, ctx) -> Promise<ScrapeResult>`
  - `scrapeYouTube(url, options, ctx) -> Promise<ScrapeResult>`
- Shared utilities (server-only):
  - `normalizeUrl(input) -> string`
  - `fetchHttp(url, headers, timeoutMs) -> { status, headers, bodyText, bodyBytes }`
  - `launchBrowser(ctx) -> Promise<{ browser, page }>` (puppeteer-core + @sparticuz/chromium default)
  - `extractHtml(html, baseUrl) -> { text, html, metadata, images, canonical }` (jsdom + Readability)
  - `detectCaptchaOrBlock(document|html, response) -> 'captcha'|'blocked'|null`
  - `scoreHtml/pdf/youtube(result) -> { score, factors[] }`

Place utilities under `modules/scraper/runtime/server/lib/`:
- `normalize.ts`, `http.ts`, `browser.ts`, `extract-html.ts`, `captcha.ts`, `pdf.ts`, `youtube.ts`, `score.ts`.

## Inputs

- `ScrapeRequest`:
  - `url` (required)
  - `type` ('auto' | 'html' | 'pdf' | 'youtube') default 'auto'
  - `options`:
    - `timeoutMs` default 30000
    - `preferBrowser` default false
    - `languageHint?` e.g. 'en'
    - `returnHtml` default true
    - `force` default false (bypass cache, handled elsewhere)

## Outputs

- `ScrapeResult` as defined in `modules/scraper/runtime/types.ts`.
- `status` values: 'ok' | 'captcha' | 'blocked' | 'error'.
- `error.code` values: 'TIMEOUT' | 'CAPTCHA' | 'BLOCKED' | 'FETCH_ERROR' | 'PARSE_ERROR' | 'UNSUPPORTED'.

## Detection

- YouTube: host matches `youtube.com`, `m.youtube.com`, `youtu.be`.
- PDF: URL ends with `.pdf` OR HTTP HEAD/GET `content-type` begins `application/pdf`.
- HTML: default.

## HTML Handler

Algorithm:
1) Normalize URL.
2) Prepare HTTP headers: realistic `User-Agent`, `Accept-Language` (from languageHint or locale), `Accept` for HTML.
3) HTTP attempt:
   - `GET` with `undici`, follow redirects, timeout `timeoutMs`.
   - If `status` 403/429/503 or common block headers (e.g., `server: cloudflare`, `x-akamai-*`), mark as potentially blocked.
   - Run `extractHtml(html, baseUrl)`:
     - jsdom parse; Mozilla Readability for main content.
     - Collect `<title>`, `og:*`, `twitter:*`, `<meta name="author">`.
     - Resolve `<link rel="canonical">` absolute.
     - Gather main images (`og:image`, article content first <img> srcs) when enabled.
   - Heuristics for sufficiency:
     - readability text length >= 800 OR
     - text density (textChars / totalDOMTextChars) >= 0.35.
   - If insufficient OR `preferBrowser` true OR `detectCaptchaOrBlock` indicates issues → fallback to browser.
4) Browser attempt (Puppeteer):
   - Launch Chromium from `@sparticuz/chromium` if serverless; otherwise Playwright when configured.
   - Set UA/viewport/timezone/locale; randomize minor viewport values.
   - `page.goto(url, { waitUntil: 'networkidle2', timeout: timeoutMs })`; fallback to `domcontentloaded` if timeout.
   - Early CAPTCHA/Block check: look for known selectors/keywords (reCAPTCHA iframe, hcaptcha, "verify you are human", Cloudflare challenge).
   - Grab `document.documentElement.outerHTML`.
   - Repeat extraction as in HTTP attempt.
5) Build `ScrapeResult`:
   - `status`: 'ok' unless CAPTCHA/blocked/failed.
   - `metadata.language`: detect via `franc` on text (or languageHint if provided).
   - Score via `scoreHtml`.
6) Errors:
   - Timeout → 'TIMEOUT'; Block page patterns w/o content → 'BLOCKED'; CAPTCHA → 'CAPTCHA'; Other network errors → 'FETCH_ERROR'; Extraction failure → 'PARSE_ERROR'.

Edge Cases:
- Infinite scroll: rely on initial render; do not scroll/load more in v0.
- AMP pages: follow canonical if present.
- International sites: respect languageHint for `Accept-Language`.
- Encodings: rely on `undici` auto-decoding; if no `charset`, use `iconv-lite` fallback if needed (optional).

## PDF Handler

Algorithm:
1) Normalize URL.
2) HTTP `GET` with `Accept: application/pdf` and `timeoutMs`. Do not store bytes.
3) `pdf-parse` on buffer → text + metadata (title, author, pages).
4) If text length < 200 chars (likely scanned):
   - Run `tesseract.js` OCR with auto language (or languageHint) and per-page concat.
   - Set a higher timeout guard (still bounded by request `timeoutMs`).
5) Compose result with `content.text` as full text; metadata from PDF when available.
6) Score via `scorePdf`.
7) Errors: 'FETCH_ERROR' (4xx/5xx/network), 'PARSE_ERROR' (pdf-parse), 'TIMEOUT'.

Constraints:
- No binary storage; store only original URL.
- OCR enabled via config `ocr.enabled`; if disabled and no text, return with low confidence.

## YouTube Handler

Algorithm:
1) Normalize URL and extract video ID (handle `youtu.be`, `watch?v=`, `shorts/`).
2) Fetch metadata:
   - Prefer `youtubei.js` (Innertube) to get title, description, tags, channel, publish date, duration.
   - Fallback to `ytdl-core` basicInfo if youtubei.js fails.
3) Transcripts:
   - Try `youtubei.js` captions; else use `youtube-transcript` to fetch auto/manual captions.
   - Merge segments into a single `text` per language; choose primary language: match `languageHint` or the longest transcript.
4) Compose result:
   - `content.text` = transcript (primary language) or description if no transcript.
   - `metadata.tags`, `channelName`, `durationSeconds`.
5) Score via `scoreYouTube`.
6) Errors: 'UNSUPPORTED' if no video id; 'FETCH_ERROR' on network; 'PARSE_ERROR' on transcript merge; 'TIMEOUT' if request budget exceeded.

Constraints:
- No video/audio downloads.
- No YouTube Data API.

## CAPTCHA/Block Detection Heuristics

- Selectors: `iframe[src*="recaptcha"]`, `.g-recaptcha`, `.h-captcha`, `#challenge-form`, `form[action*="/challenge"]`.
- Text patterns (case-insensitive): 'verify you are human', 'enable javascript to view', 'checking your browser before', 'unusual traffic'.
- Headers/status: 429/403; `server: cloudflare`; `cf-ray` present; `x-akamai-*` present.
- Return earliest signal: prefer 'captcha' over 'blocked'.

## Non-Goals v0
- No scrolling or SPA route waits beyond initial render.
- No proxies; no paid solvers.
- No site-specific rule packs beyond optional overrides map.

## Test Plan (Unit/Integration)
- HTML static: known static article page yields text >= 1000 chars; high confidence; no browser used unless forced.
- HTML dynamic: page requiring JS renders text after browser; http path too-short triggers fallback.
- CAPTCHA page: detect and return status 'captcha'.
- Blocked page: 403/429 returns 'blocked'.
- PDF text: parsed text exists; OCR not triggered.
- PDF scanned: minimal text → OCR path executed (behind feature flag in tests).
- YouTube: title present; transcript concatenated; confidence reflects transcript length.

---

Implementation notes should follow the config and types in `_process/specs/scraper.md` and `modules/scraper/runtime/types.ts`.
