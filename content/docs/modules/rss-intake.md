# RSS Intake Module

## Overview

The RSS Intake Module automates the discovery and filtering of content from RSS feeds. It monitors feeds on a schedule, analyzes each item for relevance using AI, and creates suggestion cards for interesting content.

**Location**: `modules/rss-intake/`
**Module Entry**: [modules/rss-intake/module.ts](../../../modules/rss-intake/module.ts)

## Features

- ✅ **Automated RSS monitoring**: Scheduled feed checking
- ✅ **AI-powered relevance analysis**: Filter content based on custom prompts
- ✅ **Deduplication**: Avoid processing the same items twice
- ✅ **Integration with scraper**: Auto-scrape relevant items
- ✅ **Suggestion cards**: Create workflow cards for discovered content
- ✅ **Multiple feed support**: Monitor many feeds simultaneously
- ✅ **Custom prompts per feed**: Tailor relevance criteria

## How It Works

```
┌─────────────────────────────────────────────────────────────┐
│  1. Cron Scheduler (Daily 9:00 AM)                          │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  2. Fetch & Parse RSS Feeds                                 │
│     - Download XML                                           │
│     - Extract items (title, link, description, pubDate)     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  3. Deduplication                                            │
│     - Check processed GUIDs cache                           │
│     - Filter out already-seen items                         │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  4. Relevance Analysis (AI)                                 │
│     - Apply system + custom prompts                         │
│     - Score each item (0-1)                                 │
│     - Keep items above threshold                            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  5. Scrape Relevant Items                                   │
│     - POST /api/scrape for each URL                         │
│     - Extract full content & metadata                       │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│  6. Create Suggestion Cards                                 │
│     - Create workflow cards with source='rss-intake'        │
│     - Status: 'suggestion'                                  │
│     - Appear in /suggestions view                           │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

### RSS Feed Configuration File

**Location**: `modules/rss-intake/runtime/config.ts`

```typescript
export const rssIntakeConfig: RssIntakeConfig = {
  system_prompt: `You are a content relevance analyzer. Determine if RSS feed items are relevant to our interests.`,

  feeds: [
    {
      rss_feed_url: 'https://example.com/feed.xml',
      custom_prompt: 'Focus on AI and machine learning topics'
    },
    {
      rss_feed_url: 'https://another-blog.com/rss',
      custom_prompt: 'Interested in startup news and funding announcements'
    }
  ]
}
```

### Configuration Types

```typescript
interface RssIntakeConfig {
  system_prompt: string           // Base prompt for all feeds
  feeds: RssFeedConfig[]          // Array of feeds to monitor
}

interface RssFeedConfig {
  rss_feed_url: string            // RSS feed URL
  custom_prompt?: string          // Feed-specific relevance criteria
  system_prompt?: string          // Override global system prompt
}
```

### Enabling the Scheduler

By default, the scheduler is **disabled** in development.

**Enable via environment variable**:
```bash
RSS_SCHEDULER_ENABLED=true
```

**When enabled**:
- Runs daily at **9:00 AM** server time
- Processes all configured feeds
- Creates suggestion cards automatically

## API Endpoints

### POST /api/rss/check

Manually trigger RSS feed processing (bypasses scheduler).

**Request Body**:
```typescript
{
  feedUrl?: string    // Optional: check specific feed (otherwise all feeds)
}
```

**Response**:
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
      isRelevant: boolean
      score: number
      reason?: string
    }>
  }>
}
```

### GET /api/rss/suggestions

Get all suggestion cards created by RSS intake.

**Response**:
```typescript
{
  cards: WorkflowCard[]    // Cards with source='rss-intake'
}
```

## Core Components

### 1. Feed Parser

**Location**: `modules/rss-intake/runtime/server/lib/feedParser.ts`

**Responsibilities**:
- Fetch RSS/Atom feeds
- Parse XML to structured data
- Extract item metadata
- Handle feed format variations

**Usage**:
```typescript
import { parseFeed } from './feedParser'

const items = await parseFeed('https://example.com/feed.xml')
// Returns: RssFeedItem[]
```

### 2. Deduplication

**Location**: `modules/rss-intake/runtime/server/lib/deduplication.ts`

**Strategy**:
- Stores processed GUIDs per feed
- In-memory cache (globalThis)
- Tracks last check timestamp
- Prevents duplicate processing

**Cache Structure**:
```typescript
{
  [feedUrl: string]: {
    lastChecked: string           // ISO timestamp
    processedGuids: string[]      // Array of item GUIDs
  }
}
```

⚠️ **Note**: Cache is not persistent. Resets on server restart.

### 3. Relevance Analyzer

**Location**: `modules/rss-intake/runtime/server/lib/relevanceAnalyzer.ts`

**How it works**:
1. Combines system prompt + custom prompt
2. Sends item (title + description) to AI
3. AI responds with relevance judgment
4. Parses response to extract score & reason

**Response Format**:
```typescript
interface RelevanceResult {
  isRelevant: boolean    // true if score >= threshold (0.5)
  score: number          // 0-1 confidence score
  reason?: string        // Explanation from AI
}
```

**Threshold**: Items with score ≥ 0.5 are considered relevant

### 4. Processor

**Location**: `modules/rss-intake/runtime/server/lib/processor.ts`

**Main Functions**:

```typescript
// Process all configured feeds
async function processAllFeeds(): Promise<FeedProcessResult[]>

// Process a single feed
async function processFeed(
  feedUrl: string,
  customPrompt?: string
): Promise<FeedProcessResult>
```

**Processing Steps**:
1. Fetch and parse feed
2. Filter new items (deduplication)
3. Analyze relevance for each item
4. Return results with metadata

### 5. Scheduler

**Location**: `modules/rss-intake/runtime/server/lib/scheduler.ts`

**Configuration**:
- Uses `node-cron` for scheduling
- Default schedule: `0 9 * * *` (9:00 AM daily)
- Cron format: `minute hour day month dayOfWeek`

**Functions**:
```typescript
// Start the scheduler
startScheduler(callback: () => Promise<void>): void

// Stop the scheduler
stopScheduler(): void
```

**Callback**: Receives `processAllFeeds` function from module setup

## RSS Feed Item Structure

```typescript
interface RssFeedItem {
  guid: string          // Unique identifier
  title: string         // Item title
  link: string          // Item URL
  description?: string  // Item description/summary
  pubDate?: string      // Publication date (ISO format)
  author?: string       // Author name
}
```

## Workflow Integration

### Card Creation

When relevant items are found:

```typescript
const scrapeResult = await $fetch('/api/scrape', {
  method: 'POST',
  body: { url: item.link }
})

if (scrapeResult.status === 'ok') {
  createCard({
    result: scrapeResult,
    source: 'rss-intake'
  })
}
```

**Card Properties**:
- `status`: 'suggestion'
- `source`: 'rss-intake'
- `owner`: 'analyst'
- Contains full ScrapeResult from scraper

### Viewing Suggestions

Users can view RSS-generated suggestions at:
- **Route**: `/suggestions`
- **Filter**: Cards where `source === 'rss-intake'`

Analysts can:
- Review suggestions
- Edit metadata if needed
- Send to manager or archive

## Relevance Analysis Examples

### Example 1: Tech News Filter

```typescript
{
  system_prompt: `Analyze if this RSS item is relevant to enterprise technology.`,
  feeds: [{
    rss_feed_url: 'https://techcrunch.com/feed',
    custom_prompt: `
      We're interested in:
      - AI/ML product launches
      - Major funding rounds ($10M+)
      - Enterprise SaaS news

      Ignore:
      - Consumer app reviews
      - Gadget releases
      - Opinion pieces
    `
  }]
}
```

### Example 2: Industry Research

```typescript
{
  system_prompt: `Filter research papers relevant to our industry.`,
  feeds: [{
    rss_feed_url: 'https://arxiv.org/rss/cs.AI',
    custom_prompt: `
      Focus on:
      - Computer vision applications
      - Natural language processing
      - Papers with real-world implementations

      Score higher if:
      - From top institutions
      - Has code/datasets available
    `
  }]
}
```

## Performance Considerations

### Feed Processing Time

- **Single feed**: 2-10 seconds (depends on item count)
- **AI analysis**: ~1 second per item
- **Scraping**: 3-10 seconds per relevant item

**Bottleneck**: Relevance analysis (AI) and scraping

### Optimization Strategies

1. **Batch AI requests**: Analyze multiple items in one call
2. **Parallel processing**: Process multiple feeds concurrently
3. **Smart deduplication**: Skip recently checked feeds
4. **Selective scraping**: Only scrape high-score items
5. **Cache feed XML**: Avoid redundant downloads

### Resource Usage

- **Memory**: Feed cache grows with feeds/items
- **Network**: Downloads all feed XMLs daily
- **AI API**: One API call per new item

## Error Handling

### Feed Parsing Errors

If a feed fails to parse:
- Error logged to console
- Other feeds continue processing
- Failed feed skipped until next run

### Scraping Errors

If scraping fails for an item:
- Error logged with URL
- Item marked as processed (won't retry)
- Other items continue processing

### AI Analysis Errors

If relevance analysis fails:
- Item assumed not relevant (safe default)
- Error logged
- Processing continues

## Known Limitations

⚠️ **Current Limitations**:

- **In-memory cache**: Deduplication cache lost on restart
- **No feed history**: Can't review past analyses
- **No analytics**: No metrics on feed performance
- **Fixed schedule**: Can't configure different schedules per feed
- **Sequential processing**: Feeds processed one at a time
- **No retry logic**: Failed items not retried
- **No feed validation**: Doesn't validate feed URL before adding

## Future Enhancements

Planned improvements:

- [ ] Persistent deduplication (database)
- [ ] Feed analytics dashboard
- [ ] Custom schedules per feed
- [ ] Parallel feed processing
- [ ] Retry logic for failures
- [ ] Feed health monitoring
- [ ] Webhook notifications for new suggestions
- [ ] Manual relevance override
- [ ] Batch AI analysis (multiple items per call)
- [ ] Feed category/tagging system
- [ ] RSS discovery (suggest feeds based on interests)

## Debugging

### Enable Detailed Logging

Check console for logs during feed processing:

```
[RSS Intake] Module initialized
[RSS Scheduler] Starting scheduled RSS check...
[Feed Parser] Fetching: https://example.com/feed.xml
[Feed Parser] Found 15 items
[Deduplication] 12 new items (3 already processed)
[Relevance] Analyzing 12 items...
[Relevance] Item 1/12: relevant (score: 0.85)
[Relevance] Item 2/12: not relevant (score: 0.3)
...
[RSS Scheduler] Scheduled check completed
```

### Manual Testing

Trigger feed check manually via API:

```bash
curl -X POST http://localhost:3000/api/rss/check
```

Check suggestions:

```bash
curl http://localhost:3000/api/rss/suggestions
```

## Integration Examples

### Custom Feed Integration

```typescript
// In your code, manually process a feed
import { processFeed } from '~/modules/rss-intake/runtime/server/lib/processor'

const result = await processFeed(
  'https://custom-blog.com/feed.xml',
  'Focus on TypeScript and Nuxt.js content'
)

console.log(`Found ${result.relevantItems} relevant items`)
```

### Webhook Integration (Future)

```typescript
// When RSS finds relevant content, notify webhook
for (const item of relevantItems) {
  await $fetch('https://your-webhook.com/notify', {
    method: 'POST',
    body: {
      type: 'rss_suggestion',
      item: item,
      feedUrl: feedUrl
    }
  })
}
```

## Related Documentation

- [**Scraper Module**](scraper) - How content is scraped
- [**Workflow System**](../frontend/workflow) - How cards are managed
- [**Architecture**](../architecture) - System overview
- [**API Endpoints**](../api/endpoints) - Complete API reference
