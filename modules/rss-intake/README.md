# RSS Intake Module

Automated RSS feed monitoring and article suggestion system for the scraper application.

## Overview

The RSS Intake module monitors configured RSS/Atom feeds, analyzes new posts for relevance using keyword matching, and automatically creates workflow cards with "suggestion" status for articles that match your criteria.

## Features

- ✅ RSS 2.0 and Atom 1.0 feed parsing
- ✅ Keyword-based relevance analysis
- ✅ Two-tiered prompt system (global + per-feed)
- ✅ Automatic deduplication
- ✅ Daily scheduled checks (9:00 AM)
- ✅ Manual trigger via API
- ✅ Integration with existing workflow cards
- ✅ Dedicated `/suggestions` page

## Quick Start

### 1. Configure Feeds

Edit `config/rss-feeds.yaml`:

```yaml
system_prompt: "Responsible AI and AI Ethics"

feeds:
  - rss_feed_url: "https://techcrunch.com/tag/artificial-intelligence/feed/"

  - rss_feed_url: "https://example.com/ai/feed/"
    custom_prompt: "Healthcare applications"
    # Combined: "Responsible AI AND Healthcare applications"

  - rss_feed_url: "https://example.com/data/feed/"
    system_prompt: "Open Data Policy"
    # Replaces global prompt entirely
```

### 2. Enable Scheduler (Optional)

Set environment variable to enable daily automatic checks:

```bash
RSS_SCHEDULER_ENABLED=true
```

By default, the scheduler only runs if this is set to `true`. You can always trigger checks manually via the API.

### 3. Use the System

**Via UI:**
1. Navigate to `/suggestions`
2. Click "Check feeds now" to manually trigger RSS check
3. Review suggested articles
4. Click "Add to my workflow" to promote suggestions to draft status

**Via API:**
```bash
# Trigger RSS check
curl -X POST http://localhost:3000/api/rss/check

# Get suggestions
curl http://localhost:3000/api/rss/suggestions
```

## How It Works

### 1. Feed Processing Flow

```
RSS Feed → Parse → Dedup → Relevance Analysis → Scrape → Create Card
```

1. **Parse**: Extract items from RSS/Atom feed
2. **Dedup**: Filter out already-processed items (tracked in `data/rss-processed-posts.json`)
3. **Relevance**: Score against criteria using keyword matching
4. **Scrape**: If relevant (score ≥ 70), scrape full article via scraper module
5. **Create Card**: Generate workflow card with `status: 'suggestion'`

### 2. Relevance Analysis (MVP)

Current implementation uses simple keyword matching:

- Extract keywords from criteria (split by AND, OR, commas, or spaces)
- Search for keywords in item title + description
- Calculate score: `(matches / total_keywords) * 100`
- Relevant if score ≥ 70

**Example:**
```yaml
system_prompt: "AI Ethics Healthcare"
```
- Keywords: ["AI", "Ethics", "Healthcare"]
- Article title: "New AI Ethics Guidelines for Healthcare Providers"
- Matches: 3/3 = 100% → Relevant ✅

### 3. Prompt System

**Global prompt** (`system_prompt`):
- Applied to all feeds by default

**Per-feed `custom_prompt`**:
- Extends global: `"{global} AND {custom}"`
- Example: `"AI Ethics AND Healthcare"`

**Per-feed `system_prompt`**:
- Replaces global entirely
- Use for feeds with different focus areas

### 4. Deduplication

Processed items are tracked in `data/rss-processed-posts.json`:

```json
{
  "https://example.com/feed": {
    "lastChecked": "2025-10-05T10:00:00Z",
    "processedGuids": ["item-123", "item-456"]
  }
}
```

- Keeps last 1000 GUIDs per feed (prevents unbounded growth)
- New items = not in `processedGuids`
- ALL new items marked as processed (both relevant and irrelevant)

### 5. Scheduling

**Automatic (Daily at 9:00 AM)**:
- Requires `RSS_SCHEDULER_ENABLED=true`
- Uses node-cron
- Runs feed check → scrape → create suggestions

**Manual**:
- API: `POST /api/rss/check`
- UI: "Check feeds now" button on `/suggestions`

## API Reference

### `POST /api/rss/check`

Manually trigger RSS feed check.

**Response:**
```json
{
  "success": true,
  "message": "Processed 3 feeds, found 5 relevant items, created 5 suggestions",
  "results": [
    {
      "feedUrl": "https://example.com/feed",
      "totalItems": 10,
      "newItems": 3,
      "relevantItems": 2,
      "errors": []
    }
  ]
}
```

### `GET /api/rss/suggestions`

Get all suggestion cards.

**Response:**
```json
{
  "cards": [
    {
      "id": "uuid",
      "status": "suggestion",
      "source": "rss-intake",
      "result": { /* ScrapeResult */ },
      "createdAt": "2025-10-05T10:00:00Z"
    }
  ]
}
```

## File Structure

```
modules/rss-intake/
├── module.ts                          # Nuxt module definition
├── runtime/
│   ├── config.ts                     # YAML config loader
│   ├── types.ts                      # TypeScript types
│   └── server/
│       ├── api/
│       │   └── rss/
│       │       ├── check.post.ts     # Manual trigger endpoint
│       │       └── suggestions.get.ts # List suggestions
│       └── lib/
│           ├── feedParser.ts         # RSS/Atom parser
│           ├── relevanceAnalyzer.ts  # Keyword matching
│           ├── deduplication.ts      # Track processed items
│           ├── processor.ts          # Main feed processing
│           └── scheduler.ts          # Cron scheduler

config/
└── rss-feeds.yaml                    # Feed configuration

data/
└── rss-processed-posts.json          # Processed items cache (gitignored)

pages/
└── suggestions/
    └── index.vue                     # Suggestions UI
```

## Configuration

### Environment Variables

- `RSS_SCHEDULER_ENABLED`: Set to `"true"` to enable daily automatic checks (default: disabled)

### YAML Config (`config/rss-feeds.yaml`)

```yaml
system_prompt: string  # Global relevance criteria

feeds:
  - rss_feed_url: string       # Required
    custom_prompt?: string     # Optional: extends global
    system_prompt?: string     # Optional: replaces global
```

## Workflow Integration

### Card Statuses

New status added: `'suggestion'`

Cards flow:
```
suggestion → draft → needs_review → manager_review → shortlisted/saved/archived
```

### Card Ownership

- Suggestions owned by `'analyst'` (can be promoted to draft)
- Source tracked as `'rss-intake'` (instead of 'analyst' or 'manager')

## Troubleshooting

### No suggestions appearing

1. **Check config**: Verify `config/rss-feeds.yaml` exists and has valid feeds
2. **Check criteria**: Ensure `system_prompt` has relevant keywords
3. **Lower threshold**: Edit `relevanceAnalyzer.ts` to reduce `RELEVANCE_THRESHOLD` (currently 70)
4. **Check logs**: Look for parsing/scraping errors in console
5. **Verify dedup**: Check `data/rss-processed-posts.json` - items might already be processed

### Feeds not checking automatically

1. **Enable scheduler**: Set `RSS_SCHEDULER_ENABLED=true`
2. **Check time**: Scheduler runs at 9:00 AM daily
3. **Manual trigger**: Use API or UI button to test immediately

### Feed parsing errors

- Verify feed URL is accessible
- Check feed format (RSS 2.0 or Atom)
- Test with curl: `curl https://example.com/feed`

## Future Enhancements

See [_process/specs/rss-intake.md](../../_process/specs/rss-intake.md) for planned features:

- LLM-based relevance analysis (OpenAI, Anthropic, DeepSeek, etc.)
- Multi-factor scoring (keywords + source credibility + recency)
- Feed management UI
- Notifications (email, Slack, dashboard)
- Auto RSS discovery from URLs
- Advanced analytics

## Development

**Add a new feed parser:**
1. Extend `feedParser.ts` with new format detection
2. Add parser function (e.g., `parseJsonFeed()`)
3. Update `detectFeedType()` and `parseFeed()`

**Customize relevance logic:**
1. Edit `relevanceAnalyzer.ts`
2. Modify `analyzeRelevance()` function
3. Adjust `RELEVANCE_THRESHOLD` constant

**Add LLM integration:**
1. Create `modules/llm-provider` (see spec)
2. Update `relevanceAnalyzer.ts` to call LLM
3. Add API keys to `.env`
