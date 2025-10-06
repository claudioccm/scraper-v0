# API Endpoints

## Overview

Complete reference for all server API endpoints. The API is built on Nitro (Nuxt's server engine) and follows REST conventions.

**Base URL**: `http://localhost:3000/api` (development)

## Authentication

Currently **no authentication** is implemented. All endpoints are publicly accessible.

⚠️ **Production**: Implement authentication before deployment.

## Endpoint Categories

- [Scraping API](#scraping-api) - Content scraping operations
- [RSS API](#rss-api) - RSS feed management
- [Cards API](#cards-api) - Workflow card management
- [Contact API](#contact-api) - Contact form submission

---

## Scraping API

### POST /api/scrape

Scrape a URL and extract content.

**Request**:
```http
POST /api/scrape
Content-Type: application/json

{
  "url": "https://example.com/article",
  "type": "auto",
  "options": {
    "returnHtml": true,
    "force": false
  }
}
```

**Request Body**:
```typescript
{
  url: string                    // Required: URL to scrape
  type?: 'auto' | 'html' | 'pdf' | 'youtube'  // Optional: content type
  options?: {
    timeoutMs?: number           // Request timeout (ms)
    preferBrowser?: boolean      // Force browser use
    languageHint?: string        // Expected language (e.g., 'en')
    returnHtml?: boolean         // Include raw HTML
    force?: boolean              // Bypass cache
  }
}
```

**Response** (200 OK):
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
    htmlPath?: string            // Supabase path
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

**Error Responses**:

```http
400 Bad Request
{
  "statusCode": 400,
  "statusMessage": "URL is required"
}

500 Internal Server Error
{
  "statusCode": 500,
  "statusMessage": "Scraping failed",
  "data": {
    "error": "Detailed error message"
  }
}
```

**Examples**:

```bash
# Basic scrape
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/article"}'

# Force fresh scrape with HTML
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "options": {
      "force": true,
      "returnHtml": true
    }
  }'

# Scrape PDF
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/document.pdf",
    "type": "pdf"
  }'

# Scrape YouTube video
curl -X POST http://localhost:3000/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "type": "youtube"
  }'
```

---

### PUT /api/scrape/:id

Update an existing scrape result (used for edited content).

**Request**:
```http
PUT /api/scrape/abc-123
Content-Type: application/json

{
  "id": "abc-123",
  "type": "html",
  "url": "https://example.com",
  "normalizedUrl": "https://example.com",
  "ts": "2025-10-06T10:00:00Z",
  "status": "ok",
  "confidence": 0.85,
  "confidenceFactors": [],
  "content": {
    "text": "Updated content..."
  },
  "metadata": {
    "title": "Updated Title",
    "summary": "Updated summary..."
  }
}
```

**Request Body**: Complete ScrapeResult object

**Response** (200 OK): Same as POST /api/scrape

**Use Case**: Update card metadata after analyst edits

---

## RSS API

### POST /api/rss/check

Manually trigger RSS feed processing.

**Request**:
```http
POST /api/rss/check
Content-Type: application/json

{
  "feedUrl": "https://example.com/feed.xml"
}
```

**Request Body**:
```typescript
{
  feedUrl?: string    // Optional: specific feed (otherwise all feeds)
}
```

**Response** (200 OK):
```typescript
{
  results: Array<{
    feedUrl: string
    totalItems: number
    newItems: number
    relevantItems: number
    processedItems: Array<{
      guid: string
      title: string
      link: string
      description?: string
      isRelevant: boolean
      score: number
      reason?: string
    }>
  }>
}
```

**Example**:

```bash
# Check all feeds
curl -X POST http://localhost:3000/api/rss/check \
  -H "Content-Type: application/json"

# Check specific feed
curl -X POST http://localhost:3000/api/rss/check \
  -H "Content-Type: application/json" \
  -d '{"feedUrl": "https://example.com/feed.xml"}'
```

---

### GET /api/rss/suggestions

Get all RSS-generated suggestion cards.

**Request**:
```http
GET /api/rss/suggestions
```

**Response** (200 OK):
```typescript
{
  cards: WorkflowCard[]    // Cards with source='rss-intake'
}
```

**Example**:

```bash
curl http://localhost:3000/api/rss/suggestions
```

---

## Cards API

### GET /api/cards

List all workflow cards with optional filtering.

**Request**:
```http
GET /api/cards?status=draft&owner=analyst
```

**Query Parameters**:
```typescript
{
  status?: CardStatus          // Filter by status
  owner?: CardOwnerRole        // Filter by owner
  source?: CardOwnerRole       // Filter by source
  limit?: number               // Limit results
  offset?: number              // Pagination offset
}
```

**Response** (200 OK):
```typescript
{
  cards: WorkflowCard[]
}
```

**WorkflowCard Structure**:
```typescript
{
  id: string
  result: ScrapeResult         // Complete scrape data
  status: CardStatus
  createdAt: string
  updatedAt: string
  owner: CardOwnerRole
  source: CardOwnerRole
  history: Array<{
    at: string
    status: CardStatus
    actor: CardOwnerRole
    note?: string
  }>
}
```

**Examples**:

```bash
# Get all cards
curl http://localhost:3000/api/cards

# Get analyst's draft cards
curl http://localhost:3000/api/cards?status=draft&owner=analyst

# Get cards in manager review
curl http://localhost:3000/api/cards?status=manager_review
```

---

### POST /api/cards

Create a new workflow card.

**Request**:
```http
POST /api/cards
Content-Type: application/json

{
  "result": { /* ScrapeResult */ },
  "source": "analyst"
}
```

**Request Body**:
```typescript
{
  result: ScrapeResult         // Complete scrape result
  source: CardOwnerRole        // 'analyst' | 'manager' | 'rss-intake'
}
```

**Response** (201 Created):
```typescript
{
  card: WorkflowCard           // Newly created card
}
```

**Example**:

```bash
curl -X POST http://localhost:3000/api/cards \
  -H "Content-Type: application/json" \
  -d '{
    "result": {
      "id": "abc-123",
      "type": "html",
      "url": "https://example.com",
      "status": "ok",
      "confidence": 0.8,
      "content": { "text": "..." },
      "metadata": { "title": "Example" }
    },
    "source": "analyst"
  }'
```

---

### PATCH /api/cards/:id

Update a card's status, owner, or result.

**Request**:
```http
PATCH /api/cards/abc-123
Content-Type: application/json

{
  "status": "manager_review",
  "actor": "analyst",
  "note": "Ready for review"
}
```

**Request Body**:
```typescript
{
  status?: CardStatus          // New status
  owner?: CardOwnerRole        // New owner (usually auto-set)
  result?: ScrapeResult        // Updated content
  note?: string                // Status change note
  actor: CardOwnerRole         // Required: who made the change
}
```

**Response** (200 OK):
```typescript
{
  card: WorkflowCard           // Updated card
}
```

**Examples**:

```bash
# Change status
curl -X PATCH http://localhost:3000/api/cards/abc-123 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "manager_review",
    "actor": "analyst"
  }'

# Update content
curl -X PATCH http://localhost:3000/api/cards/abc-123 \
  -H "Content-Type: application/json" \
  -d '{
    "result": { /* updated ScrapeResult */ },
    "actor": "analyst"
  }'
```

---

## Contact API

### POST /api/contact

Submit a contact form.

**Request**:
```http
POST /api/contact
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello, I have a question..."
}
```

**Request Body**:
```typescript
{
  name: string
  email: string
  message: string
  subject?: string
}
```

**Response** (200 OK):
```typescript
{
  success: true,
  message: "Message received"
}
```

**Example**:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello!"
  }'
```

---

## Error Handling

### Standard Error Format

All errors follow this structure:

```typescript
{
  statusCode: number
  statusMessage: string
  data?: {
    error?: string
    details?: any
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful request |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input |
| 404 | Not Found | Resource doesn't exist |
| 500 | Internal Server Error | Server error |

### Error Examples

**400 - Bad Request**:
```json
{
  "statusCode": 400,
  "statusMessage": "Invalid URL format"
}
```

**404 - Not Found**:
```json
{
  "statusCode": 404,
  "statusMessage": "Card not found"
}
```

**500 - Server Error**:
```json
{
  "statusCode": 500,
  "statusMessage": "Scraping failed",
  "data": {
    "error": "Timeout after 30000ms"
  }
}
```

---

## Rate Limiting (Future)

Planned rate limiting:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1633024800
```

**Limits** (planned):
- 100 requests per minute per IP
- 1000 requests per hour per IP

---

## CORS Configuration

**Current**: All origins allowed (development)

**Production**: Configure specific origins

```typescript
// Future: nuxt.config.ts
nitro: {
  cors: {
    origin: ['https://your-domain.com'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  }
}
```

---

## Webhook Events (Future)

Planned webhook support:

### POST /api/webhooks/scrape

Receive webhook after async scrape completes.

```json
{
  "event": "scrape.completed",
  "data": {
    "id": "abc-123",
    "status": "ok",
    "url": "https://example.com"
  }
}
```

---

## API Versioning (Future)

Planned versioning strategy:

```
/api/v1/scrape
/api/v2/scrape
```

Currently all endpoints are unversioned.

---

## SDK/Client Libraries (Future)

Planned client libraries:

```typescript
// JavaScript/TypeScript
import { ScraperClient } from '@scraper-v0/client'

const client = new ScraperClient({
  baseUrl: 'https://api.scraper-v0.com',
  apiKey: 'your-api-key'
})

const result = await client.scrape('https://example.com')
```

---

## Postman Collection

Import this collection to test the API:

```json
{
  "info": {
    "name": "Scraper-v0 API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Scrape URL",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/api/scrape",
        "body": {
          "mode": "raw",
          "raw": "{\"url\": \"https://example.com\"}"
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000"
    }
  ]
}
```

---

## OpenAPI Specification (Future)

Planned OpenAPI 3.0 spec generation for auto-documentation.

---

## Related Documentation

- [**Scraper Module**](../modules/scraper) - Scraping implementation
- [**RSS Intake Module**](../modules/rss-intake) - RSS processing
- [**Workflow System**](../frontend/workflow) - Card management
- [**Architecture**](../architecture) - API architecture
