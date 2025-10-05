# Spec: Confidence Scoring & Caching

Status: Ready to implement
Owner: modules/scraper
Scope: Compute confidence scores and implement cache lookup policy.

## Goals
- Deterministic, explainable confidence scores per content type.
- Cache by normalized URL with TTL and force-bypass.

## Confidence Scoring

Implement in `modules/scraper/runtime/server/lib/score.ts`:

```ts
export function scoreHtml(input: { text: string; title?: string; canonical?: string; bodyChars?: number; mainChars?: number; langConfidence?: number }): { score: number; factors: string[] }
export function scorePdf(input: { text: string; meta?: { title?: string; author?: string; pages?: number }; langConfidence?: number }): { score: number; factors: string[] }
export function scoreYouTube(input: { transcript?: string; meta?: { title?: string; description?: string; tags?: string[] } ; langConfidence?: number }): { score: number; factors: string[] }
```

Weights (sum clamp 0..1):

- HTML:
  - +0.35 if `text.length >= 800`
  - +0.20 if title present with 10..120 chars
  - +0.15 if `langConfidence >= 0.7`
  - +0.15 if canonical present
  - +0.15 if `mainChars/bodyChars >= 0.35`

- PDF:
  - +0.6 if `text.length >= 800` (or OCR succeeded)
  - +0.2 if metadata present (`title` or `author` or `pages>0`)
  - +0.2 if `langConfidence >= 0.7`

- YouTube:
  - +0.5 if `transcript.length >= 2000`
  - +0.3 if metadata complete (title present and description >= 160, or tags>=3)
  - +0.2 if `langConfidence >= 0.7`

Return `factors` strings like `"len>=800"`, `"title-ok"`, `"lang>=0.7"`, `"canonical"`, `"readability>=0.35"`, etc.

Language detection:
- Use `franc` on main text. Map `franc` confidence roughly to 0..1 (normalize by score/maximum).
- Allow `languageHint` to override output language when specified, but do not boost score unless detection matches.

## Caching

Policy:
- Cache key: `{normalizedUrl}:{type|'auto'→resolvedType}`.
- TTL: `nuxt.config.scraper.cacheTTL` (default 7 days).
- Behavior:
  - If `force=true`, bypass cache and fetch fresh; persist new snapshot.
  - If cached row exists and fresh (ts within TTL): return cached result (optionally omitting large HTML content unless `returnHtml` requested).
  - If cached row exists but stale: proceed to fetch fresh and replace.

Implementation:
- Add `modules/scraper/runtime/server/lib/cache.ts` with small wrappers over store:

```ts
export async function getCached(normalizedUrl: string, resolvedType: string, ttlMs: number): Promise<ScrapeResult | null>
export async function setCached(result: ScrapeResult): Promise<void>
```

- Use database timestamps for staleness check: `ts > now()-ttlMs`.
- No memory cache in serverless. Optionally, if `mode==='queue'` (serverful), add ephemeral LRU for 5 minutes to reduce DB hits.

Serialization:
- When returning cached results, honor `returnHtml` flag: include `content.html` only if requested and available (may require fetch from Storage; can defer to caller with `storage.htmlPath`).

## Error Handling
- Cache lookup errors should not fail the request: log and continue to fresh fetch.
- Ensure `force=true` bypasses both read and write blockers (still persist).

## Test Plan
- Fresh miss → scrape executes; result persisted; subsequent request within TTL returns cached.
- Force flag → always recompute and persist; cached value updated.
- TTL expiry → miss, fetch new.
- HTML `returnHtml=false` → cached response omits html; `returnHtml=true` returns html or storage path.
