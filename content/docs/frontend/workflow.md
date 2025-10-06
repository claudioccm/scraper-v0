# Workflow System

## Overview

The Workflow System manages the lifecycle of content cards from discovery through review and archival. It implements a dual-role system with **Analysts** and **Managers**, each with distinct responsibilities and views.

## Card Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Card Creation                             │
│  • Manual (Analyst submits URL)                             │
│  • Automated (RSS Intake finds relevant content)            │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                  Analyst Zone                                │
│  Status: 'draft' | 'needs_review'                           │
│  • Review scraped content                                    │
│  • Edit metadata (title, summary, etc.)                     │
│  • Send to manager when ready                               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                  Manager Zone                                │
│  Status: 'manager_review'                                   │
│  • Review analyst submissions                               │
│  • Decide: Shortlist, Save, or Archive                     │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│                  Final States                                │
│  • 'shortlisted' - Important content                        │
│  • 'saved_for_later' - Deferred for future review          │
│  • 'archived' - Not relevant or processed                   │
└─────────────────────────────────────────────────────────────┘
```

## Card Status Types

```typescript
type CardStatus =
  | 'suggestion'        // RSS auto-generated, needs review
  | 'draft'            // Analyst created, in progress
  | 'needs_review'     // Analyst edited, needs final check
  | 'manager_review'   // Sent to manager for decision
  | 'shortlisted'      // Manager marked as important
  | 'saved_for_later'  // Manager deferred decision
  | 'archived'         // Manager archived
```

### Status Ownership

| Status | Owner | Location |
|--------|-------|----------|
| `suggestion` | `analyst` | `/suggestions` |
| `draft` | `analyst` | `/analyst` |
| `needs_review` | `analyst` | `/analyst` |
| `manager_review` | `manager` | `/manager` |
| `shortlisted` | `manager` | `/shortlist` |
| `saved_for_later` | `manager` | `/saved` |
| `archived` | `manager` | `/archive` |

## Workflow Card Structure

```typescript
interface WorkflowCard {
  id: string                    // UUID
  result: ScrapeResult          // Complete scrape data
  status: CardStatus            // Current status
  createdAt: string             // ISO timestamp
  updatedAt: string             // ISO timestamp
  owner: CardOwnerRole          // 'analyst' | 'manager' | 'rss-intake'
  source: CardOwnerRole         // Who created it
  history: StatusHistoryEntry[] // Audit trail
}
```

### Status History

Each status change is tracked:

```typescript
interface StatusHistoryEntry {
  at: string           // ISO timestamp
  status: CardStatus   // New status
  actor: CardOwnerRole // Who made the change
  note?: string        // Optional note
}
```

**Example history**:
```typescript
[
  {
    at: '2025-10-06T10:00:00Z',
    status: 'draft',
    actor: 'analyst'
  },
  {
    at: '2025-10-06T11:30:00Z',
    status: 'manager_review',
    actor: 'analyst',
    note: 'Ready for review'
  },
  {
    at: '2025-10-06T14:15:00Z',
    status: 'shortlisted',
    actor: 'manager',
    note: 'Excellent find, high priority'
  }
]
```

## Analyst Workflow

### Page: `/analyst`

**Purpose**: Submit URLs, review scraped content, send cards to manager

### Features

1. **URL Submission**
   - Textarea for multiple URLs (one per line)
   - Batch scraping (processes all URLs)
   - Real-time progress tracking
   - Auto-creates 'draft' cards

2. **Card Management**
   - View all draft and needs_review cards
   - Edit metadata inline
   - Preview scraped content
   - Send to manager

3. **Scraping Progress**
   - Shows: Queued → Running → Card ready
   - Displays errors if scraping fails
   - Updates in real-time

### User Flow

```
1. Analyst pastes URLs
         ↓
2. Clicks "Scrape links"
         ↓
3. System scrapes each URL
         ↓
4. Cards appear in "My cards" section
         ↓
5. Analyst reviews & optionally edits
         ↓
6. Clicks "Send to manager"
         ↓
7. Card status → 'manager_review'
         ↓
8. Card moves to "Sent to manager" section
```

### Code Example

**Location**: [pages/analyst/index.vue](../../../pages/analyst/index.vue)

```vue
<script setup>
const { scrape } = useScraper()
const { createCard, updateCard } = useWorkflowCards()

async function submitLinks() {
  const urls = parseLinks(linksInput.value)

  for (const url of urls) {
    // Scrape URL
    const result = await scrape(url)

    // Create draft card
    await createCard(result, 'analyst')
  }
}

async function handleApprove(card) {
  // Send to manager
  await updateCard(card.id, {
    actor: 'analyst',
    status: 'manager_review'
  })
}
</script>
```

## Manager Workflow

### Page: `/manager`

**Purpose**: Review analyst submissions, make final decisions

### Features

1. **Review Queue**
   - All cards with status 'manager_review'
   - Sorted by update time (newest first)
   - View scraped content and metadata

2. **Decision Actions**
   - **Shortlist**: Mark as high priority
   - **Save for Later**: Defer decision
   - **Archive**: Not relevant

3. **Organized Views**
   - `/shortlist` - Important content
   - `/saved` - Deferred items
   - `/archive` - Archived content

### User Flow

```
1. Manager opens /manager page
         ↓
2. Reviews cards in queue
         ↓
3. Reads content, checks metadata
         ↓
4. Makes decision:
   - Shortlist (important)
   - Save for later (maybe)
   - Archive (not relevant)
         ↓
5. Card moves to appropriate view
```

### Code Example

**Location**: [pages/manager/index.vue](../../../pages/manager/index.vue)

```vue
<script setup>
const { updateCard } = useWorkflowCards()

async function handleShortlist(card) {
  await updateCard(card.id, {
    actor: 'manager',
    status: 'shortlisted'
  })
}

async function handleSaveForLater(card) {
  await updateCard(card.id, {
    actor: 'manager',
    status: 'saved_for_later'
  })
}

async function handleArchive(card) {
  await updateCard(card.id, {
    actor: 'manager',
    status: 'archived'
  })
}
</script>
```

## RSS Suggestions Workflow

### Page: `/suggestions`

**Purpose**: Review automatically discovered content from RSS feeds

### Features

1. **Auto-Generated Cards**
   - Cards created by RSS Intake module
   - Source: 'rss-intake'
   - Status: 'suggestion'

2. **Analyst Actions**
   - Review relevance
   - Edit if needed
   - Send to manager or archive

### User Flow

```
1. RSS scheduler finds relevant content
         ↓
2. System creates 'suggestion' cards
         ↓
3. Analyst reviews suggestions
         ↓
4. Analyst can:
   - Send to manager (becomes 'manager_review')
   - Archive (not relevant)
```

## Storage & State Management

### Current Implementation

**Location**: [server/utils/cardWorkflow.ts](../../../server/utils/cardWorkflow.ts)

**Storage**: In-memory Map on globalThis

```typescript
interface WorkflowStore {
  cards: Map<string, WorkflowCard>
}

const STORE_KEY = '__workflow_card_store__'
```

⚠️ **Important**: Cards are **not persisted** to database

**Implications**:
- Server restart = data loss
- Not suitable for production
- Need database migration

### Server API Functions

```typescript
// List all cards
export function listCards(): WorkflowCard[]

// Get single card
export function getCard(id: string): WorkflowCard | undefined

// Create new card
export function createCard(payload: CreateWorkflowCardPayload): WorkflowCard

// Update card status/content
export function updateCard(id: string, payload: UpdateWorkflowCardPayload): WorkflowCard
```

## Composable: useWorkflowCards()

**Location**: `composables/useWorkflowCards.ts`

### Usage

```vue
<script setup>
const {
  cards,          // Ref<WorkflowCard[]>
  isLoading,      // Ref<boolean>
  isSaving,       // Ref<boolean>
  error,          // Ref<Error | null>
  fetchCards,     // (filters?) => Promise<void>
  createCard,     // (result, source) => Promise<WorkflowCard>
  updateCard      // (id, payload) => Promise<WorkflowCard>
} = useWorkflowCards()

// Fetch cards for analyst
await fetchCards({ role: 'analyst' })

// Create a card
const card = await createCard(scrapeResult, 'analyst')

// Update status
await updateCard(card.id, {
  actor: 'analyst',
  status: 'manager_review'
})
</script>
```

## Status Transition Rules

### Valid Transitions

| From | To | Actor | Notes |
|------|-----|-------|-------|
| `suggestion` | `manager_review` | analyst | RSS suggestion approved |
| `suggestion` | `archived` | analyst | Not relevant |
| `draft` | `manager_review` | analyst | Ready for review |
| `draft` | `archived` | analyst | Analyst discards |
| `needs_review` | `manager_review` | analyst | After edits |
| `manager_review` | `shortlisted` | manager | High priority |
| `manager_review` | `saved_for_later` | manager | Defer decision |
| `manager_review` | `archived` | manager | Not relevant |
| `saved_for_later` | `shortlisted` | manager | Promoted |
| `saved_for_later` | `archived` | manager | Discarded |

### Owner Changes

Status changes trigger owner reassignment:

```typescript
function resolveOwnerFromStatus(status: CardStatus): CardOwnerRole {
  if (ANALYST_STATUSES.has(status)) return 'analyst'
  if (MANAGER_STATUSES.has(status)) return 'manager'
  return 'analyst'
}
```

## Seed Data

For development, demo cards are auto-created:

**Location**: [server/utils/cardWorkflow.ts:114-171](../../../server/utils/cardWorkflow.ts#L114-L171)

```typescript
export function seedWorkflowCards(): void {
  // Creates 4 demo cards:
  // 1. Draft (analyst)
  // 2. Needs review (analyst)
  // 3. Manager review (manager)
  // 4. Shortlisted (manager)
}
```

Seeds run on server startup if no cards exist.

## Card Display Component

**Component**: `ScrapeResultCard.vue`
**Location**: [components/scraper/ScrapeResultCard.vue](../../../components/scraper/ScrapeResultCard.vue)

### Props

```typescript
{
  heading: string              // Card title
  headingLevel: string         // h1, h2, h3, etc.
  subheading: string          // URL or subtitle
  result?: ScrapeResult       // Scraped content
  requestStatus: string       // 'queued' | 'running' | 'done'
  isBusy: boolean            // Show loading state
  approveLabel: string       // Button text
}
```

### Events

```typescript
@edit-save="(updated) => {}"   // User edited metadata
@approve="() => {}"            // User clicked approve
@archive="() => {}"            // User clicked archive
```

### Features

- Inline editing of metadata
- Expandable content preview
- Confidence score display
- Status indicators
- Action buttons (approve, archive)

## Future Enhancements

### Planned Features

- [ ] **Database persistence**: Migrate from in-memory to Supabase
- [ ] **User authentication**: Multi-user support
- [ ] **Comments/notes**: Annotate cards
- [ ] **Tags/categories**: Organize content
- [ ] **Search/filter**: Find cards by criteria
- [ ] **Export**: CSV, JSON export
- [ ] **Notifications**: Alert manager of new submissions
- [ ] **Analytics**: Card processing metrics
- [ ] **Batch actions**: Select multiple cards
- [ ] **Custom workflows**: Configurable status flows

### Database Schema (Planned)

```sql
CREATE TABLE workflow_cards (
  id UUID PRIMARY KEY,
  scrape_result_id UUID REFERENCES scrape_results(id),
  status VARCHAR(50) NOT NULL,
  owner VARCHAR(50) NOT NULL,
  source VARCHAR(50) NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE status_history (
  id UUID PRIMARY KEY,
  card_id UUID REFERENCES workflow_cards(id),
  status VARCHAR(50) NOT NULL,
  actor VARCHAR(50) NOT NULL,
  note TEXT,
  created_at TIMESTAMP NOT NULL
);

CREATE TABLE scrape_results (
  id UUID PRIMARY KEY,
  url TEXT NOT NULL,
  type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  content JSONB NOT NULL,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL
);
```

## Best Practices

### For Analysts

1. **Review before sending**: Check metadata accuracy
2. **Edit summaries**: Make them concise and informative
3. **Verify sources**: Ensure content is from credible sources
4. **Batch submissions**: Submit related URLs together

### For Managers

1. **Regular review**: Check queue daily
2. **Clear decisions**: Don't leave cards in review long
3. **Use saved**: For items needing more research
4. **Archive liberally**: Keep queues clean

### For Developers

1. **Validate status transitions**: Check allowed transitions
2. **Update history**: Always log status changes
3. **Handle errors**: API calls can fail
4. **Test state changes**: Verify cards move correctly

## Troubleshooting

### Cards Not Appearing

1. Check status filter matches card status
2. Verify card creation succeeded (check API response)
3. Refresh page (state may be stale)

### Status Changes Not Working

1. Check actor matches allowed transition
2. Verify updateCard was called with correct payload
3. Check browser console for errors

### Cards Disappeared After Restart

⚠️ **Expected behavior** - cards stored in memory

**Solution**: Implement database persistence

## Related Documentation

- [**Pages Documentation**](pages) - All available pages
- [**Components**](components) - UI component library
- [**API Endpoints**](../api/endpoints) - Server API reference
- [**Scraper Module**](../modules/scraper) - Content scraping
