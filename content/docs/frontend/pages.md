# Pages & Routes

## Overview

All application pages and their routing structure. The app uses Nuxt's file-based routing with pages automatically creating routes.

## Page Structure

```
pages/
├── index.vue               # Home page (/)
├── analyst/
│   └── index.vue          # Analyst workflow (/analyst)
├── manager/
│   └── index.vue          # Manager workflow (/manager)
├── suggestions/
│   └── index.vue          # RSS suggestions (/suggestions)
├── shortlist/
│   └── index.vue          # Shortlisted items (/shortlist)
├── saved/
│   └── index.vue          # Saved for later (/saved)
├── archive/
│   └── index.vue          # Archived items (/archive)
├── blog/                  # Blog section
│   ├── index.vue          # Blog home (/blog)
│   └── [slug].vue         # Blog post (/blog/:slug)
├── ui-library/            # Component showcase
│   ├── index.vue          # UI library home (/ui-library)
│   └── [slug].vue         # Component docs (/ui-library/:slug)
├── test.vue               # Testing page (/test)
└── batch-test.vue         # Batch scraping test (/batch-test)
```

## Route Definitions

### `/` - Home Page

**File**: [pages/index.vue](../../pages/index.vue)

**Purpose**: Landing page with project introduction

**Features**:
- Project overview
- Navigation to main sections
- Links to documentation

**Layout**: Uses default layout

---

### `/analyst` - Analyst Workflow

**File**: [pages/analyst/index.vue](../../pages/analyst/index.vue)

**Purpose**: Analyst's primary workspace for content curation

**Features**:
- URL submission form (batch scraping)
- Real-time scraping progress
- Draft and needs_review cards
- Inline metadata editing
- Send to manager functionality

**State**:
- Loads cards with `status: 'draft' | 'needs_review'`
- Filters by `owner: 'analyst'`

**Composables Used**:
- `useScraper()` - For scraping URLs
- `useWorkflowCards()` - For card management

**Key Sections**:
1. **URL Input Form**: Textarea for multiple URLs
2. **Scraping Progress**: Live status updates
3. **My Cards**: Active draft/review cards
4. **Sent to Manager**: Cards in manager review

---

### `/manager` - Manager Workflow

**File**: [pages/manager/index.vue](../../pages/manager/index.vue)

**Purpose**: Manager's review queue and decision-making interface

**Features**:
- Review queue (manager_review cards)
- Decision actions (shortlist, save, archive)
- Card content preview
- Metadata display

**State**:
- Loads cards with `status: 'manager_review'`
- Filters by `owner: 'manager'`

**Actions**:
- **Shortlist**: Move to `/shortlist`
- **Save for Later**: Move to `/saved`
- **Archive**: Move to `/archive`

**Composables Used**:
- `useWorkflowCards()` - For card management

---

### `/suggestions` - RSS Suggestions

**File**: [pages/suggestions/index.vue](../../pages/suggestions/index.vue)

**Purpose**: Review automatically discovered content from RSS feeds

**Features**:
- Display RSS-generated cards
- Source badge showing 'rss-intake'
- Analyst actions (approve, archive)

**State**:
- Loads cards with `source: 'rss-intake'`
- Status typically: `'suggestion'`

**User Flow**:
- Analyst reviews auto-discovered content
- Can send to manager or archive

---

### `/shortlist` - Shortlisted Items

**File**: [pages/shortlist/index.vue](../../pages/shortlist/index.vue)

**Purpose**: High-priority content marked by manager

**Features**:
- Display shortlisted cards
- Manager can promote to other states
- Read-only content view

**State**:
- Loads cards with `status: 'shortlisted'`

**Typical Actions**:
- Move to archive (if no longer relevant)
- Export or share (future feature)

---

### `/saved` - Saved for Later

**File**: [pages/saved/index.vue](../../pages/saved/index.vue)

**Purpose**: Items deferred for future review

**Features**:
- Display saved cards
- Manager can revisit and decide
- Option to shortlist or archive

**State**:
- Loads cards with `status: 'saved_for_later'`

**Typical Actions**:
- Promote to shortlist
- Archive if no longer needed

---

### `/archive` - Archived Items

**File**: [pages/archive/index.vue](../../pages/archive/index.vue)

**Purpose**: Historical archive of processed content

**Features**:
- Display archived cards
- Read-only view
- Search/filter (future)

**State**:
- Loads cards with `status: 'archived'`

**Typical Actions**:
- View only
- Restore (future feature)

---

### `/blog` - Blog Section

**File**: [pages/blog/index.vue](../../pages/blog/index.vue)

**Purpose**: Blog home page listing all posts

**Features**:
- List all blog posts
- Post previews with metadata
- Powered by Nuxt Content

**Content Source**: `content/blog/*.md`

**Dynamic Route**: `/blog/:slug`
- **File**: [pages/blog/[slug].vue](../../pages/blog/[slug].vue)
- Renders individual blog posts from Markdown

---

### `/ui-library` - Component Showcase

**File**: [pages/ui-library/index.vue](../../pages/ui-library/index.vue)

**Purpose**: Documentation and showcase for UI components

**Features**:
- Component gallery
- Live examples
- Usage documentation

**Content Source**: `content/ui-library/*.md`

**Dynamic Route**: `/ui-library/:slug`
- **File**: [pages/ui-library/[slug].vue](../../pages/ui-library/[slug].vue)
- Component-specific documentation

---

### `/test` - Testing Page

**File**: [pages/test.vue](../../pages/test.vue)

**Purpose**: Development testing and debugging

**Features**:
- Test scraper functionality
- Debug API calls
- UI component testing

**Status**: Development only (remove in production)

---

### `/batch-test` - Batch Scraping Test

**File**: [pages/batch-test.vue](../../pages/batch-test.vue)

**Purpose**: Test batch scraping operations

**Features**:
- Submit multiple URLs
- Monitor concurrent scrapes
- Performance testing

**Status**: Development only (remove in production)

---

## Content-Based Routes

Routes automatically generated by Nuxt Content:

### Documentation Routes

**Pattern**: `/docs/*`
**Source**: `content/docs/`

Auto-generated routes:
- `/docs` - Documentation home
- `/docs/overview` - Project overview
- `/docs/setup` - Setup guide
- `/docs/architecture` - Architecture docs
- `/docs/modules/scraper` - Scraper module
- `/docs/modules/rss-intake` - RSS module
- `/docs/modules/persistence` - Persistence module
- And more...

## Navigation

### Header Navigation

**Component**: `ccmTopbar.vue`

Main navigation links:
- Home (`/`)
- Analyst (`/analyst`)
- Manager (`/manager`)
- Suggestions (`/suggestions`)
- Blog (`/blog`)

### Footer Navigation

**Component**: `ccmFooter.vue`

Links:
- Documentation (`/docs`)
- UI Library (`/ui-library`)
- Archive (`/archive`)

## Route Guards (Future)

Planned authentication guards:

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useUser()

  if (!user.value && to.path !== '/login') {
    return navigateTo('/login')
  }
})
```

## Page Layouts

### Default Layout

**File**: `layouts/default.vue`
**Used by**: All pages (default)

**Structure**:
```vue
<template>
  <ccm-master-grid>
    <ccm-topbar />
    <slot />  <!-- Page content -->
    <ccm-footer />
  </ccm-master-grid>
</template>
```

### Custom Layouts (Future)

Potential custom layouts:
- `layouts/minimal.vue` - No header/footer
- `layouts/print.vue` - Print-optimized
- `layouts/admin.vue` - Admin dashboard

## Dynamic Routing

### Blog Posts

```
Route: /blog/my-first-post
File: content/blog/my-first-post.md
Template: pages/blog/[slug].vue
```

### UI Library Components

```
Route: /ui-library/buttons
File: content/ui-library/buttons.md
Template: pages/ui-library/[slug].vue
```

## SEO & Meta Tags

### Per-Page Meta

```vue
<script setup>
useHead({
  title: 'Analyst Workflow - Scraper',
  meta: [
    { name: 'description', content: 'Analyst workspace for content curation' }
  ]
})
</script>
```

### Global Meta

**File**: `nuxt.config.ts`

```typescript
app: {
  head: {
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/...' }
    ]
  }
}
```

## Error Pages (Future)

Planned error pages:
- `error.vue` - Global error page
- `404.vue` - Not found page
- `500.vue` - Server error page

## Page Transitions (Future)

Planned page transitions:

```vue
<template>
  <NuxtPage :transition="{
    name: 'page',
    mode: 'out-in'
  }" />
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.3s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>
```

## Loading States

### Page-Level Loading

```vue
<script setup>
const { data, pending } = await useAsyncData('cards', () =>
  $fetch('/api/cards')
)
</script>

<template>
  <div v-if="pending">Loading...</div>
  <div v-else>{{ data }}</div>
</template>
```

## Performance Optimization

### Lazy Loading

Pages are automatically code-split by Nuxt.

### Prefetching

```vue
<NuxtLink prefetch to="/analyst">
  Go to Analyst
</NuxtLink>
```

## Sitemap (Future)

Planned sitemap generation:

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  sitemap: {
    hostname: 'https://your-domain.com',
    routes: async () => {
      // Generate dynamic routes
    }
  }
})
```

## Route Naming Convention

| Route Pattern | Purpose |
|--------------|---------|
| `/` | Landing/Home pages |
| `/[workflow]` | Workflow pages (analyst, manager) |
| `/[collection]` | Card collections (suggestions, shortlist, etc.) |
| `/[resource]` | Content pages (blog, docs) |
| `/[resource]/[slug]` | Individual content items |

## Future Routes

Planned additions:
- `/login` - User authentication
- `/settings` - User preferences
- `/analytics` - Usage analytics
- `/export` - Data export tools
- `/admin` - Admin dashboard
- `/api-docs` - API documentation

## Related Documentation

- [**Workflow System**](workflow) - Card workflow details
- [**Components**](components) - UI component library
- [**API Endpoints**](../api/endpoints) - Server API
- [**Architecture**](../architecture) - System overview
