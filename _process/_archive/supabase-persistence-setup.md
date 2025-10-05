# Supabase Persistence Setup

This note captures everything we need to wire the scraper persistence layer to Supabase.

## 1. Supabase credentials

We operate the scraper persistence with the **service role** key because we need to bypass RLS for the upsert logic. Gather the following values from the Supabase dashboard and store them in 1Password:

- Project URL (e.g. `https://<project>.supabase.co`)
- Service role key (`Service role` under Project settings → API)
- Personal access token (already available in `.env` as `SUPABASE_ACCESS_TOKEN`) – only needed for CLI automation.

## 2. Environment variables

Add the following to `.env` (or your preferred secrets store):

```bash
# Scraper API guard
NUXT_PUBLIC_SCRAPER_SECRET="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dW5tbHB1a2V1YWx6cHdpb2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDAwMDMsImV4cCI6MjA3NTA3NjAwM30.J6xaFE6_q4b0H31vmmFgfC6wl-dgzUkN4kqjEctjEAw"
SCRAPER_SECRET="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dW5tbHB1a2V1YWx6cHdpb2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1MDAwMDMsImV4cCI6MjA3NTA3NjAwM30.J6xaFE6_q4b0H31vmmFgfC6wl-dgzUkN4kqjEctjEAw"

# Supabase service credentials (server-only)
SUPABASE_URL="https://ytunmlpukeualzpwiofk.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0dW5tbHB1a2V1YWx6cHdpb2ZrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTUwMDAwMywiZXhwIjoyMDc1MDc2MDAzfQ.3DMIXy159ejSB90OP-ss8FHQq0q5lJ4NZm8RlfPaOyM"
SUPABASE_STORAGE_BUCKET="scraper" # optional override if we rename the bucket
```

> NOTE: The existing `SUPABASE_ACCESS_TOKEN` can stay – it is not consumed directly by the app but is useful for local CLI access. The new `SCRAPER_SECRET` should match the value we expose publicly via `NUXT_PUBLIC_SCRAPER_SECRET` so the composable can send the Authorization header that the server handler expects.

## 3. nuxt.config.ts wiring

Extend the `runtimeConfig` section so the scraper module receives the credentials without exposing the service key to the client:

```ts
runtimeConfig: {
  scraper: {
    secret: process.env.SCRAPER_SECRET,
    supabase: {
      url: process.env.SUPABASE_URL,
      key: process.env.SUPABASE_SERVICE_ROLE_KEY,
      bucket: process.env.SUPABASE_STORAGE_BUCKET || 'scraper'
    }
  },
  public: {
    scraper: {
      secret: process.env.NUXT_PUBLIC_SCRAPER_SECRET
    }
  }
}
```

Once this is in place, the server will automatically persist scrape results when the credentials are present. If any value is missing, the scraper falls back to in-memory results and logs a warning.

## 4. Database schema

Run the following SQL in Supabase (SQL Editor → run once). It creates the tables the persistence layer expects:

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

No additional RLS policies are required because the server uses the service role key.

## 5. Storage bucket

If the `scraper` bucket does not already exist, create it under **Storage → Buckets**. The persistence layer automatically falls back to Postgres storage, but large HTML payloads (>200 KB) and oversized text/meta payloads (>1 MB) will be written to Storage when the bucket is present.

## 6. Verification checklist

1. `nuxt.config.ts` updated with the runtime config snippet above.
2. `.env` (or deployment secrets) filled with the Supabase URL, service role key, bucket name, and scraper secret.
3. Supabase tables exist (run the SQL once).
4. Storage bucket `scraper/` present.
5. Trigger a test scrape (`/test` page) and confirm new rows appear in `scrape_results` and `scrape_blobs`.

With these pieces in place, the scraper module will read/write Supabase seamlessly, including manual edits saved from the UI.
