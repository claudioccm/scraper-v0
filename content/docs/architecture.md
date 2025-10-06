# System Architecture

## High-Level Overview

Scraper-v0 is built on **Nuxt 3**, leveraging its full-stack capabilities with custom modules for domain-specific functionality. The architecture follows a modular, layered approach.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
│                  (Vue 3 Components + Pages)                  │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Composables Layer                          │
│        (useScraper, useWorkflowCards, etc.)                 │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│                  (Nitro Server Routes)                       │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic                            │
│              (Nuxt Modules + Server Utils)                   │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                   Data/External Layer                        │
│              (Supabase, RSS Feeds, Web Sources)             │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Nuxt Application Core

**Location**: Root configuration
**Key File**: [nuxt.config.ts](../../nuxt.config.ts)

**Responsibilities**:
- Application bootstrapping
- Module registration
- Runtime configuration management
- SSR/CSR settings

**Configuration Highlights**:
- SSR enabled with experimental client fallback
- Three custom modules registered
- Runtime config for secrets and API keys
- Nuxt Content module for documentation

### 2. Custom Modules

The application extends Nuxt with three custom modules:

#### Scraper Module
**Location**: `modules/scraper/`
**Entry**: [modules/scraper/module.ts](../../modules/scraper/module.ts)

Provides web scraping capabilities as a Nuxt module.

**Features**:
- Auto-registers `/api/scrape` POST endpoint
- Auto-registers `/api/scrape/:id` PUT endpoint
- Exports `useScraper()` composable
- Supports HTML, PDF, and YouTube scraping

#### RSS Intake Module
**Location**: `modules/rss-intake/`
**Entry**: [modules/rss-intake/module.ts](../../modules/rss-intake/module.ts)

Handles automated RSS feed monitoring and relevance analysis.

**Features**:
- Registers `/api/rss/check` POST endpoint
- Registers `/api/rss/suggestions` GET endpoint
- Starts cron scheduler on Nuxt ready hook (if enabled)
- Integrates with scraper for discovered content

#### Persistence Module (Supabase)
**Location**: `modules/persistence-supabase/`
**Entry**: [modules/persistence-supabase/module.ts](../../modules/persistence-supabase/module.ts)

Integrates Supabase for data persistence.

**Features**:
- Configures Supabase client with runtime config
- Provides storage for scraped content (HTML, text, metadata)
- Registers Nitro plugin for server-side access

### 3. API Layer

**Location**: `server/api/`
**Runtime**: Nitro (Nuxt's server engine)

API endpoints are organized by feature:

```
server/api/
├── cards/
│   ├── index.get.ts      # List all cards
│   ├── index.post.ts     # Create new card
│   └── [id].patch.ts     # Update card status/content
├── scrape (from module)  # Registered by scraper module
│   ├── POST /api/scrape
│   └── PUT /api/scrape/:id
└── rss/ (from module)    # Registered by RSS module
    ├── POST /api/rss/check
    └── GET /api/rss/suggestions
```

### 4. Frontend Architecture

#### Pages
**Location**: `pages/`

Route structure:
- `/` - Home page
- `/analyst` - Analyst workflow view
- `/manager` - Manager workflow view
- `/suggestions` - RSS-generated suggestions
- `/archive` - Archived content
- `/saved` - Saved for later
- `/shortlist` - Shortlisted items

#### Components
**Location**: `components/`

Component naming convention: `ccm` prefix (custom component)

**Key Components**:
- `ccmMasterGrid.vue` - 12-column responsive grid system
- `ccmTopbar.vue` - Navigation header
- `ccmFooter.vue` - Footer with documentation link
- `ScrapeResultCard.vue` - Displays scraped content with edit capabilities
- Content components for Nuxt Content rendering

#### Composables
**Location**: `composables/`

Reusable logic:
- `useScraper()` - Scraping operations
- `useWorkflowCards()` - Card CRUD operations

### 5. State Management

**Current Approach**: In-memory state with global store pattern

**Location**: `server/utils/cardWorkflow.ts`

Cards are stored in a `Map` on the Node.js global object. This is **not persistent** across server restarts.

**Card Workflow States**:
```
Analyst States: 'suggestion' | 'draft' | 'needs_review'
Manager States: 'manager_review' | 'shortlisted' | 'saved_for_later' | 'archived'
```

⚠️ **Future Enhancement**: Migrate to database persistence

### 6. CSS Architecture

**Location**: `public/css/`

Uses CSS `@layer` methodology:

```
@layer reset      - CSS resets and normalization
@layer defaults   - Base typography, fonts, layout
@layer utils      - Utility classes (colors, spacing)
@layer overrides  - Component-specific overrides
```

**Structure**:
```
public/css/
├── styles.css           # Main entry point
├── base/
│   ├── reset.css
│   ├── fonts.css
│   ├── typography.css
│   └── layout.css
├── vars/
│   ├── colors.css
│   ├── spacing.css
│   └── variables.css
└── utils/
    ├── color-utils.css
    └── spacing-utils.css
```

## Data Flow

### Scraping Workflow

```
1. User submits URL via /analyst page
                ↓
2. Frontend calls POST /api/scrape
                ↓
3. Scraper module determines content type (HTML/PDF/YouTube)
                ↓
4. Content scraped using appropriate method
                ↓
5. Metadata extracted and confidence calculated
                ↓
6. Content stored in Supabase (if configured)
                ↓
7. ScrapeResult returned to frontend
                ↓
8. Card created via POST /api/cards
                ↓
9. Card stored in memory (globalThis Map)
                ↓
10. Card displayed in analyst view
```

### RSS Intake Workflow

```
1. Cron scheduler triggers (daily at 9:00 AM)
                ↓
2. processAllFeeds() called
                ↓
3. For each RSS feed:
   a. Fetch and parse feed
   b. Check for new items (deduplication)
   c. Analyze relevance with AI
   d. Filter relevant items
                ↓
4. For each relevant item:
   a. Scrape URL via POST /api/scrape
   b. Create suggestion card
                ↓
5. Cards appear in /suggestions page
```

### Card Status Transitions

```
Analyst Actions:
draft → manager_review (send to manager)
needs_review → manager_review (send after edits)

Manager Actions:
manager_review → shortlisted (important content)
manager_review → saved_for_later (defer decision)
manager_review → archived (not relevant)

RSS Intake:
(auto-creates) → suggestion (analyst can review)
```

## Configuration System

### Runtime Config
**Location**: `nuxt.config.ts`

Two config scopes:
1. **Server-only** (`runtimeConfig`): Secrets, API keys
2. **Public** (`runtimeConfig.public`): Client-accessible values

### Module Options
Each module accepts configuration:

```typescript
// Scraper module options
{
  browserEngine: 'puppeteer' | 'playwright',
  mode: 'sync' | 'queue',
  cacheTTL: number,
  ocr: { enabled: boolean },
  returnHtmlDefault: boolean
}

// RSS Intake module
{
  system_prompt: string,
  feeds: [{ rss_feed_url: string, custom_prompt?: string }]
}

// Persistence module
{
  url: string,
  key: string,
  bucket: string
}
```

## External Dependencies

### Runtime Dependencies
- `@supabase/supabase-js` - Database and storage
- `axios` - HTTP client for RSS fetching
- `puppeteer` - Headless browser for scraping (alternative: playwright)
- `pdf-parse` - PDF text extraction
- `js-yaml` - YAML parsing for config
- `node-cron` - Scheduled task execution
- `date-fns` - Date utilities

### Development Dependencies
- `@nuxt/vite-builder` - Fast builds with Vite
- `postcss` - CSS processing
- TypeScript type definitions

## Security Considerations

### Current State
⚠️ **No authentication implemented**

### Recommendations for Production
1. Add authentication middleware
2. Secure API endpoints with auth tokens
3. Validate all user inputs
4. Implement rate limiting
5. Use HTTPS only
6. Rotate secrets regularly
7. Implement CORS properly

## Performance Characteristics

### Scraping Performance
- Synchronous by default (blocks until complete)
- Configurable timeout (default varies by type)
- Caching with configurable TTL (default: 7 days)

### Memory Usage
- Cards stored in-memory (not scalable long-term)
- Each scrape result includes full HTML (if enabled)
- RSS feed cache in memory

### Scalability Notes
Current architecture is suitable for:
- ✅ Single server deployment
- ✅ Low-to-moderate traffic
- ✅ Small-to-medium content volume

Not suitable for:
- ❌ Distributed deployments (in-memory state)
- ❌ High-concurrency scraping
- ❌ Large-scale RSS monitoring (100+ feeds)

## Technology Decisions

### Why Nuxt 3?
- Full-stack framework (frontend + API)
- Vue 3 with Composition API
- Auto-imports for DX
- Module system for extensibility
- Nitro server for edge deployment potential

### Why Supabase?
- Managed PostgreSQL
- Built-in storage
- Simple REST API
- Good developer experience

### Why In-Memory State?
- Fast prototyping
- No database schema needed initially
- Easy to migrate later

### Why Client-Side Rendering?
- Simplified deployment
- No SSR complexity for now
- Can enable later if needed

## Deployment Architecture (Future)

Planned deployment model:

```
┌─────────────────────────────────────┐
│         CDN (Static Assets)         │
└─────────────────────────────────────┘
                │
┌─────────────────────────────────────┐
│      Nuxt Server (Nitro Runtime)    │
│  ┌──────────┐  ┌─────────────┐     │
│  │   API    │  │   Cron      │     │
│  │  Routes  │  │  Scheduler  │     │
│  └──────────┘  └─────────────┘     │
└─────────────────────────────────────┘
                │
┌─────────────────────────────────────┐
│          Supabase Cloud             │
│  ┌──────────┐  ┌─────────────┐     │
│  │ Database │  │   Storage   │     │
│  └──────────┘  └─────────────┘     │
└─────────────────────────────────────┘
```

Deployment options being considered:
- Vercel (easiest for Nuxt)
- Netlify (with edge functions)
- Self-hosted (Docker + Node.js)
- Railway/Render (managed hosting)
