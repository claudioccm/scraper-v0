# RSS Intake Module Specification

## Overview

An automated RSS aggregator module that monitors multiple RSS feeds, analyzes new posts for relevance using configurable criteria, and automatically suggests relevant articles to analysts.

## User Story

**As an analyst**, I want the system to automatically discover and suggest relevant articles from trusted sources, so I can quickly identify important content without manually checking multiple websites.

### Example Use Case

We monitor 10 websites that publish AI innovation content. Our focus is "Responsible AI and AI Ethics." The system:

1. Checks RSS feeds daily
2. Analyzes new posts against our criteria
3. Auto-scrapes relevant articles
4. Creates workflow cards with status "suggestion"
5. Analysts review suggestions and promote to their workflow

---

## Core Requirements

### 1. Feed Registration & Configuration

**Feed Config Structure** (`config/rss-feeds.yaml`):

```yaml
system_prompt: "Responsible AI and AI Ethics"  # Global filter criteria

feeds:
  - rss_feed_url: "https://example.com/feed.xml"
    # Uses global system_prompt

  - rss_feed_url: "https://example2.com/rss"
    custom_prompt: "Impact of crypto in policy implementation"
    # Extends: "Responsible AI AND crypto policy"

  - rss_feed_url: "https://example3.com/feed"
    system_prompt: "Open Data and Migration"
    # Overrides: ignores global, uses this only
```

**Prompt Logic**:
- **No custom/system_prompt at feed level** → use global `system_prompt`
- **`custom_prompt`** → combine with global (AND logic)
- **`system_prompt` at feed level** → replace global entirely

**MVP**: Manual YAML editing only. Future: UI for feed management.

### 2. RSS Feed Processing

**Feed Format Support**:
- RSS 2.0
- Atom 1.0

**Polling Schedule**:
- Daily automatic check (built-in scheduler)
- Manual trigger endpoint: `POST /api/rss/check` (for testing)

**Post Deduplication**:
- Track processed post GUIDs/URLs
- Store in local JSON cache initially
- Migrate to Supabase when persistence module ready

### 3. Relevance Analysis

**Analysis Flow**:
1. Fetch RSS feed items
2. Extract: title, description/summary, link, pubDate
3. Send to LLM: "Does this match: [criteria]?"
4. LLM returns: **Relevance Score (0-100)**
5. If score ≥ threshold (e.g., 70):
   - Call scraper module to get full article
   - Create workflow card with status "suggestion"

**LLM Integration**:
- **MVP**: Use basic relevance check (even without LLM, use keyword matching)
- **Future**: Full multi-provider LLM system (see Future Features)

### 4. Suggestion Cards

**Workflow Integration**:
- Add new status: `'suggestion'` to `CardStatus` type
- Cards created with:
  - `status: 'suggestion'`
  - `source: 'rss-intake'`
  - `owner: 'analyst'` (default)

**Analyst Actions**:
- Review `/suggestions` page
- Promote to their workflow (status → `'draft'` or `'needs_review'`)
- Or move to manager's queue

### 5. Error Handling

**Feed Failures**:
- Log errors silently
- Store error state per feed (optional)
- Skip to next feed
- **Future**: Email/dashboard notifications

---

## Technical Architecture

### Module Structure

```
modules/rss-intake/
├── module.ts                 # Nuxt module definition
├── runtime/
│   ├── config.ts            # Load YAML config
│   ├── types.ts             # TypeScript interfaces
│   ├── composables/
│   │   └── useRssIntake.ts  # Client-side composable
│   └── server/
│       ├── api/
│       │   ├── rss/
│       │   │   ├── check.post.ts      # Manual trigger
│       │   │   └── suggestions.get.ts # List suggestions
│       ├── lib/
│       │   ├── feedParser.ts          # Parse RSS/Atom
│       │   ├── relevanceAnalyzer.ts   # LLM/keyword analysis
│       │   ├── deduplication.ts       # Track processed posts
│       │   └── scheduler.ts           # Daily cron job
```

### Data Flow

```
[RSS Feed] → [Daily Scheduler]
    ↓
[Feed Parser] → Extract items
    ↓
[Dedup Check] → Filter new posts only
    ↓
[Relevance Analyzer] → Score against criteria
    ↓
[Scraper Module] → Get full article (if relevant)
    ↓
[Workflow Cards] → Create "suggestion" status card
    ↓
[Analyst Reviews] → `/suggestions` page
```

### Storage

**Config**: `config/rss-feeds.yaml`

**Processed Posts Cache**: `data/rss-processed-posts.json`
```json
{
  "https://example.com/feed.xml": {
    "lastChecked": "2025-10-05T10:00:00Z",
    "processedGuids": [
      "post-guid-123",
      "post-guid-456"
    ]
  }
}
```

**Suggestions**: Use existing workflow cards system with new status

---

## Future Features

### 1. Multi-Provider LLM Configuration

**Config File**: `config/llm-providers.yaml`

```yaml
providers:
  - name: "openai-gpt4"
    type: "openai"
    api_key_env: "OPENAI_API_KEY"
    model: "gpt-4o-mini"
    cost_per_1k: 0.0015

  - name: "anthropic-claude"
    type: "anthropic"
    api_key_env: "ANTHROPIC_API_KEY"
    model: "claude-3-5-haiku-20241022"
    cost_per_1k: 0.001

  - name: "deepseek-chat"
    type: "openai-compatible"
    api_endpoint: "https://api.deepseek.com/v1"
    api_key_env: "DEEPSEEK_API_KEY"
    model: "deepseek-chat"
    cost_per_1k: 0.0003

  - name: "google-gemini"
    type: "google"
    api_key_env: "GOOGLE_API_KEY"
    model: "gemini-1.5-flash"
    cost_per_1k: 0.0005

  - name: "ollama-llama"
    type: "ollama"
    api_endpoint: "http://localhost:11434"
    model: "llama3.2"
    cost_per_1k: 0  # Local/free

default_provider: "deepseek-chat"  # Use cheap option by default
fallback_provider: "ollama-llama"  # If API fails, use local
```

**Features**:
- Cost-aware routing (prefer cheaper models)
- Automatic fallback on failure
- Support for local models (Ollama)
- Custom API endpoints for compatible providers

### 2. Enhanced Feed Management UI

- Visual feed list (read-only initially)
- Add/edit/delete feeds via UI
- Per-feed statistics (posts found, relevance rate)
- Test feed URL before saving

### 3. Advanced Relevance Analysis

**Multi-Factor Scoring**:
- LLM relevance score (60% weight)
- Keyword matching (20% weight)
- Source credibility score (10% weight)
- Recency boost (10% weight)

**Configurable Thresholds**:
```yaml
relevance_threshold: 70  # Minimum score to suggest
max_suggestions_per_day: 20  # Rate limiting
```

### 4. Notification System

- Dashboard widget: "X new suggestions"
- Email digest: Daily summary of suggestions
- Slack/Teams integration
- Browser notifications

### 5. Feed Analytics

- Track suggestion acceptance rate
- Identify most valuable feeds
- Auto-disable low-performing feeds
- Topic clustering (which themes appear most)

### 6. User Authentication & Personalization

- Per-user feed subscriptions
- Custom system prompts per user
- Personal suggestion queues
- Collaborative filtering (suggest based on team interests)

### 7. RSS Discovery

**Auto-detect RSS from website URLs**:
- Check common paths: `/feed`, `/rss`, `/feed.xml`, `/atom.xml`
- Parse HTML for `<link rel="alternate" type="application/rss+xml">`
- Suggest RSS URL to user for confirmation

### 8. Advanced Deduplication

- Content similarity detection (not just GUID)
- Cross-feed deduplication
- Detect republished content
- Merge duplicate suggestions

### 9. Content Enrichment

- Extract additional metadata (images, videos)
- Auto-tag articles (categories, entities)
- Sentiment analysis
- Readability scoring

### 10. Export & Integration

- Export suggestions as CSV/JSON
- Webhook integration for external systems
- API for third-party tools
- RSS feed of suggestions (meta!)

---

## Implementation Phases

### Phase 1 (MVP)
- Basic RSS/Atom parsing
- YAML config file
- Simple keyword-based relevance (no LLM)
- Manual deduplication check
- Daily cron job
- Create "suggestion" status cards
- `/suggestions` page

### Phase 2 (Enhanced)
- Multi-provider LLM integration
- Relevance scoring with LLM
- Supabase persistence
- Feed management UI (read-only)
- Basic analytics

### Phase 3 (Advanced)
- Full feed CRUD UI
- Multi-factor relevance scoring
- Notification system
- Auto RSS discovery
- Advanced deduplication

### Phase 4 (Enterprise)
- User authentication & personalization
- Team collaboration features
- Advanced analytics & ML
- Third-party integrations

---

## Success Metrics

**MVP Success**:
- [ ] Successfully parse 10+ RSS feeds daily
- [ ] Create suggestion cards automatically
- [ ] Zero duplicate suggestions
- [ ] Analyst can promote suggestions to workflow

**Long-term Success**:
- 70%+ of suggested articles are marked relevant by analysts
- 50%+ reduction in manual article discovery time
- 90%+ uptime for RSS checks
- <5min latency from publish to suggestion

---

## Related Documentation

- [Scraper LLM Analysis](../_process/docs/scraper-llm-analysis.md) - Current scraper implementation details
- [Workflow Cards System](../../types/workflow-card.ts) - Card status types
- [Scraper Module](../../modules/scraper/) - Article scraping system
