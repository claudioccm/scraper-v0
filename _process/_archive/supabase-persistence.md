# Spec: Supabase Persistence & Storage

Status: Ready to implement
Owner: modules/scraper
Scope: Persist scrape metadata and content to Supabase (Postgres + optional Storage).

## Goals
- Idempotent storage keyed by normalized URL.
- Keep latest snapshot only; store content in Postgres or Storage depending on size.
- Server-only usage of service role key; no client exposure.

## Schema

Use/align with the tables defined in `_process/specs/scraper.md`.

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

- Supabase Storage (optional): bucket `scraper/` for large HTML. Folder: `scraper/{result_id}/index.html` etc.

## Client Initialization

- Create a small server-only client wrapper at `modules/scraper/runtime/server/lib/store.ts`:

```ts
interface StoreConfig {
  url: string
  key: string // service role key (server only)
  bucket?: string // 'scraper'
}

export interface StoredPaths { htmlPath?: string; textPath?: string; metaPath?: string }

export async function upsertResult(meta: Partial<DbRow>, blobs?: { html?: string; text?: string; meta?: any }): Promise<{ id: string; paths?: StoredPaths }>
export async function findFreshByUrl(normalizedUrl: string, ttlMs: number): Promise<DbJoined | null>
```

- Read config from `useRuntimeConfig().scraper.supabase`.
- Never expose service key in `public` runtime config.

## Upsert Flow

1) Dedupe key: `normalized_url` (and optionally `type`).
2) Compute `content_hash = sha256(content.text)`.
3) If row exists:
   - Update mutable columns: `ts`, `status`, `confidence`, `title`, `language`, `site_name`, `content_hash`, `has_html`, `error_*`.
   - Replace `scrape_blobs` rows for kinds provided.
4) If row missing: insert new, then insert blobs.
5) Blob storage policy:
   - If `html.length > 200_000` or `returnHtml=false`, push HTML to Storage (path in `path`, `content` NULL).
   - For `text` and `meta`, prefer Postgres `content` unless >1MB, then Storage.

## Fetch (Cache Lookup)

- `findFreshByUrl(normalizedUrl, ttlMs)`:
  - SELECT from `scrape_results` where `normalized_url` matches and `ts > now() - ttlMs`.
  - JOIN `scrape_blobs` to assemble HTML/text/meta, resolving Storage if `path` set (optional in v0: skip fetching Storage, just return paths).

## Security & Credentials

- Store `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` in server runtime only.
- Validate they are present when persistence is enabled; otherwise, operate in memory-only mode (return result without persistence) and log a warning.
- Validate route auth using `scraper.secret` before any DB calls.

## Error Handling

- Database errors → return 502 with `error.code='DB_ERROR'` and message truncated.
- Storage failures → still persist `scrape_results`; mark missing blob kinds with `path=null` and `content=null`; include warning in logs.

## Idempotency & Concurrency

- `normalized_url` unique prevents duplicates.
- Use `upsert`/`on conflict` on `normalized_url` to avoid race conditions.

## Test Plan

- Insert new result with small HTML/text/meta → rows created; `scrape_blobs.content` populated.
- Insert with large HTML → HTML written to Storage; `path` populated; `has_html=true`.
- Update existing → metadata changed; blob kinds replaced; previous Storage object overwritten.
- Cache lookup hits within TTL; misses after TTL.
- Missing credentials → persistence skipped with console warning.
