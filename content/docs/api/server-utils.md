# Server Utils

## Overview

Server-side utility functions and helpers used across the application.

**Location**: `server/utils/`

## Card Workflow Utilities

### File: cardWorkflow.ts

**Location**: [server/utils/cardWorkflow.ts](../../../server/utils/cardWorkflow.ts)

**Purpose**: Workflow card CRUD operations and state management

### Functions

#### listCards()

Get all workflow cards, sorted by update time.

```typescript
function listCards(): WorkflowCard[]
```

**Returns**: Array of all cards, newest first

**Example**:
```typescript
export default defineEventHandler((event) => {
  const cards = listCards()
  return { cards }
})
```

---

#### getCard(id)

Get a single card by ID.

```typescript
function getCard(id: string): WorkflowCard | undefined
```

**Parameters**:
- `id` - Card UUID

**Returns**: Card object or undefined if not found

**Example**:
```typescript
const card = getCard('abc-123')
if (!card) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Card not found'
  })
}
```

---

#### createCard(payload)

Create a new workflow card.

```typescript
function createCard(payload: CreateWorkflowCardPayload): WorkflowCard
```

**Parameters**:
```typescript
interface CreateWorkflowCardPayload {
  result: ScrapeResult         // Complete scrape result
  source: CardOwnerRole        // 'analyst' | 'manager' | 'rss-intake'
}
```

**Returns**: Newly created card with:
- Generated UUID
- Status based on source ('draft' for analyst, 'manager_review' for manager)
- Automatic owner assignment
- Initial history entry
- Timestamps

**Example**:
```typescript
const card = createCard({
  result: scrapeResult,
  source: 'analyst'
})

// Card will have:
// - id: random UUID
// - status: 'draft'
// - owner: 'analyst'
// - createdAt/updatedAt: current timestamp
```

---

#### updateCard(id, payload)

Update an existing card.

```typescript
function updateCard(
  id: string,
  payload: UpdateWorkflowCardPayload
): WorkflowCard
```

**Parameters**:
```typescript
interface UpdateWorkflowCardPayload {
  status?: CardStatus          // New status
  owner?: CardOwnerRole        // New owner (usually auto-set)
  result?: ScrapeResult        // Updated content
  note?: string                // Status change note
  actor: CardOwnerRole         // Required: who made change
}
```

**Returns**: Updated card

**Behavior**:
- If status changes: adds history entry, updates owner
- If result changes: updates card content
- Updates `updatedAt` timestamp
- Returns unchanged card if no actual changes

**Example**:
```typescript
const updated = updateCard('abc-123', {
  actor: 'analyst',
  status: 'manager_review',
  note: 'Ready for review'
})

// History will include new entry:
// {
//   at: '2025-10-06T12:00:00Z',
//   status: 'manager_review',
//   actor: 'analyst',
//   note: 'Ready for review'
// }
```

---

#### seedWorkflowCards()

Create demo cards for development.

```typescript
function seedWorkflowCards(): void
```

**Behavior**:
- Runs automatically on server startup
- Only seeds if no cards exist
- Creates 4 demo cards with different statuses

**Cards Created**:
1. Draft (analyst)
2. Needs review (analyst)
3. Manager review (manager)
4. Shortlisted (manager)

**Example**:
```typescript
// Called automatically in:
// server/utils/cardWorkflow.ts (line 237)
seedWorkflowCards()
```

---

### Helper Functions

#### resolveOwnerFromStatus(status)

Determine owner based on card status.

```typescript
function resolveOwnerFromStatus(status: CardStatus): CardOwnerRole
```

**Logic**:
```typescript
const ANALYST_STATUSES = new Set(['suggestion', 'draft', 'needs_review'])
const MANAGER_STATUSES = new Set(['manager_review', 'shortlisted', 'saved_for_later', 'archived'])

if (ANALYST_STATUSES.has(status)) return 'analyst'
if (MANAGER_STATUSES.has(status)) return 'manager'
return 'analyst'  // Default
```

---

#### buildSeedCard(options)

Internal helper to build seed cards.

```typescript
function buildSeedCard(options: SeedCardOptions): WorkflowCard
```

**Used by**: `seedWorkflowCards()`

---

### Storage Implementation

**Current**: In-memory Map on globalThis

```typescript
interface WorkflowStore {
  cards: Map<string, WorkflowCard>
}

const STORE_KEY = '__workflow_card_store__'

type GlobalWithStore = typeof globalThis & {
  [STORE_KEY]?: WorkflowStore
}

function getStore(): WorkflowStore {
  const g = globalThis as GlobalWithStore
  if (!g[STORE_KEY]) {
    g[STORE_KEY] = { cards: new Map() }
  }
  return g[STORE_KEY]!
}
```

**Implications**:
- ✅ Fast in-memory operations
- ✅ No database setup needed
- ❌ Data lost on server restart
- ❌ Not suitable for production
- ❌ Can't scale across multiple servers

---

## Future Utilities (Planned)

### Database Utilities

Planned database helpers:

```typescript
// server/utils/db.ts

export async function getSupabaseClient() {
  const config = useRuntimeConfig()
  return createClient(
    config.scraperPersistence.supabase.url,
    config.scraperPersistence.supabase.key
  )
}

export async function queryCards(filters: CardFilters) {
  const supabase = await getSupabaseClient()
  const { data, error } = await supabase
    .from('workflow_cards')
    .select('*')
    .match(filters)

  if (error) throw error
  return data
}
```

---

### Authentication Utilities

Planned auth helpers:

```typescript
// server/utils/auth.ts

export async function validateToken(token: string) {
  // Verify JWT or session token
}

export async function requireAuth(event: H3Event) {
  const token = getRequestHeader(event, 'authorization')
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }
  return validateToken(token)
}
```

---

### Validation Utilities

Planned input validation:

```typescript
// server/utils/validation.ts

export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function validateCardStatus(status: string): status is CardStatus {
  const validStatuses: CardStatus[] = [
    'suggestion',
    'draft',
    'needs_review',
    'manager_review',
    'shortlisted',
    'saved_for_later',
    'archived'
  ]
  return validStatuses.includes(status as CardStatus)
}
```

---

### Logging Utilities

Planned structured logging:

```typescript
// server/utils/logger.ts

export const logger = {
  info: (message: string, meta?: object) => {
    console.log(JSON.stringify({ level: 'info', message, ...meta }))
  },
  error: (message: string, error?: Error) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack
    }))
  },
  warn: (message: string, meta?: object) => {
    console.warn(JSON.stringify({ level: 'warn', message, ...meta }))
  }
}
```

---

### Error Handling Utilities

Planned error handlers:

```typescript
// server/utils/errors.ts

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public statusMessage: string,
    public data?: any
  ) {
    super(statusMessage)
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return createError({
      statusCode: error.statusCode,
      statusMessage: error.statusMessage,
      data: error.data
    })
  }

  return createError({
    statusCode: 500,
    statusMessage: 'Internal server error'
  })
}
```

---

## Nitro Utilities

Built-in Nitro helpers available in server routes:

### Event Handlers

```typescript
export default defineEventHandler(async (event) => {
  // Get query params
  const query = getQuery(event)

  // Get request body
  const body = await readBody(event)

  // Get headers
  const auth = getRequestHeader(event, 'authorization')

  // Set response headers
  setResponseHeader(event, 'Content-Type', 'application/json')

  // Set response status
  setResponseStatus(event, 201)

  return { success: true }
})
```

### Error Creation

```typescript
throw createError({
  statusCode: 400,
  statusMessage: 'Invalid input',
  data: { field: 'url', error: 'Required' }
})
```

### Route Parameters

```typescript
// In /api/cards/[id].patch.ts
export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  return { id }
})
```

---

## Testing Utilities (Future)

Planned test helpers:

```typescript
// server/utils/testing.ts

export function createMockEvent(options: {
  method?: string
  path?: string
  body?: any
  headers?: Record<string, string>
}): H3Event {
  // Create mock H3Event for testing
}

export async function testApiRoute(
  handler: EventHandler,
  options: MockEventOptions
) {
  const event = createMockEvent(options)
  return await handler(event)
}
```

---

## Best Practices

### Using Server Utils

1. **Import from `~/server/utils/`**:
```typescript
import { listCards, createCard } from '~/server/utils/cardWorkflow'
```

2. **Error Handling**:
```typescript
try {
  const card = getCard(id)
  if (!card) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
} catch (error) {
  throw createError({ statusCode: 500, statusMessage: 'Server error' })
}
```

3. **Type Safety**:
```typescript
import type { WorkflowCard } from '~/types/workflow-card'

function processCard(card: WorkflowCard) {
  // TypeScript ensures type safety
}
```

4. **Validation**:
```typescript
const card = getCard(id)
if (!card) {
  throw createError({ statusCode: 404 })
}

// Now TypeScript knows card is not undefined
console.log(card.status)
```

---

## Related Documentation

- [**API Endpoints**](endpoints) - HTTP API reference
- [**Workflow System**](../frontend/workflow) - Card workflow
- [**Architecture**](../architecture) - System design
- [**Scraper Module**](../modules/scraper) - Scraping utilities
