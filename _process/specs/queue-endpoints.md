# Spec: Queue Endpoints (Serverful Optional)

Status: Ready to implement
Owner: modules/scraper
Scope: In-process job queue for scraping when running serverful (Nitro node server).

## Goals
- Accept jobs without holding client connection.
- Track job state: pending, running, completed, failed.
- Keep implementation simple (in-memory); disabled in serverless.

## Endpoints

- `POST /api/scrape/queue`
  - Body: `{ url: string, type?: 'auto'|'html'|'pdf'|'youtube', options?: ScrapeRequestOptions }`
  - Returns: `{ jobId: string, status: 'pending' }`

- `GET /api/scrape/:jobId`
  - Returns: `{ jobId: string, status: 'pending'|'running'|'completed'|'failed', result?: ScrapeResult, error?: { code: string; message: string } }`

Auth: Same Bearer token as `/api/scrape`.

## Implementation

Add handlers when `scraper.mode === 'queue'` in `modules/scraper/module.ts`:
- `addServerHandler({ route: '/api/scrape/queue', method: 'post', handler: '.../server/api/scrape.queue.post' })`
- `addServerHandler({ route: '/api/scrape/:jobId', method: 'get', handler: '.../server/api/scrape.job.get' })`

Queue runtime at `modules/scraper/runtime/server/lib/queue.ts`:

```ts
import PQueue from 'p-queue'
type JobStatus = 'pending'|'running'|'completed'|'failed'

export interface JobRecord { id: string; status: JobStatus; result?: ScrapeResult; error?: { code: string; message: string }; createdAt: number; updatedAt: number }

export const queue = new PQueue({ concurrency: 2 })
const jobs = new Map<string, JobRecord>()
const TTL_MS = 60 * 60 * 1000 // 1h keep results in memory

export function submit(url: string, reqType: ScrapeType, options?: ScrapeRequestOptions): string { /* create id, set pending, queue.add(...) */ }
export function get(jobId: string): JobRecord | undefined { /* return record */ }
export function gc(): void { /* purge completed/failed > TTL */ }
```

Execution:
- In `submit`, create a `JobRecord` with status 'pending', then `queue.add(async () => { ... })` which updates status to 'running', invokes the same dispatcher used by `/api/scrape`, persists results (if enabled), sets 'completed' or 'failed'.
- Call `gc()` opportunistically on each API request to purge stale jobs.

Serverless behavior:
- If `mode!=='queue'`, `/api/scrape/queue` and `/api/scrape/:jobId` return 501 Not Implemented.

## Error Handling
- Job function catches and stores `{ code, message }`; status 'failed'.
- If process restarts, in-memory jobs are lost (documented limitation).

## Test Plan
- Submit → returns jobId; GET shows pending, then running, then completed.
- Forced error (invalid URL) → job fails; GET shows failed with error.
- Concurrency respected: with concurrency=2, third job stays pending until a slot frees.
- After TTL, completed job disappears from map.
