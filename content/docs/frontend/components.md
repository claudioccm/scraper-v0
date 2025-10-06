# Components

## Overview

The application uses a component-based architecture with Vue 3 Composition API. All components follow the `ccm` (custom component) prefix naming convention.

**Location**: `components/`

## Component Auto-Import

Components are automatically imported without path prefix:

```vue
<!-- No import needed -->
<template>
  <ccm-button>Click me</ccm-button>
</template>
```

**Configuration**: [nuxt.config.ts:64-66](../../nuxt.config.ts#L64-L66)

## Layout Components

### ccmMasterGrid

**File**: [components/ccmMasterGrid.vue](../../components/ccmMasterGrid.vue)

**Purpose**: 12-column responsive CSS Grid layout system

**Usage**:
```vue
<ccm-master-grid>
  <div class="col-span-12">Full width</div>
  <div class="col-span-6">Half width</div>
</ccm-master-grid>
```

**Grid Structure**:
- 12 columns
- Responsive breakpoints (321px, 769px)
- CSS custom properties for gaps and gutters

**CSS Classes**:
- `.col-span-1` to `.col-span-12` - Column spanning
- `.col-start-1` to `.col-start-12` - Column positioning

---

### ccmTopbar

**File**: [components/ccmTopbar.vue](../../components/ccmTopbar.vue)

**Purpose**: Main navigation header

**Features**:
- Logo/brand area
- Primary navigation links
- Responsive hamburger menu (future)
- Sticky positioning (optional)

**Slots**:
- `logo` - Custom logo content
- `nav` - Custom navigation items
- `actions` - Action buttons (e.g., login)

**Example**:
```vue
<ccm-topbar>
  <template #logo>
    <NuxtLink to="/">My App</NuxtLink>
  </template>
  <template #nav>
    <NuxtLink to="/analyst">Analyst</NuxtLink>
    <NuxtLink to="/manager">Manager</NuxtLink>
  </template>
</ccm-topbar>
```

---

### ccmFooter

**File**: [components/ccmFooter.vue](../../components/ccmFooter.vue)

**Purpose**: Site footer with links

**Features**:
- Documentation link
- Copyright/credits
- Social links (future)

**Customization**:
- Edit directly for project-specific links

---

### ccmSection

**File**: [components/ccmSection.vue](../../components/ccmSection.vue)

**Purpose**: Content section wrapper

**Features**:
- Consistent spacing
- Optional background variants
- Max-width container

**Props**:
```typescript
{
  variant?: 'default' | 'accent' | 'muted'
  padded?: boolean
  narrow?: boolean
}
```

**Example**:
```vue
<ccm-section variant="accent" padded>
  <h2>Section Title</h2>
  <p>Section content...</p>
</ccm-section>
```

---

## UI Components

### ccmButton

**File**: [components/ccmButton.vue](../../components/ccmButton.vue)

**Purpose**: Customizable button component

**Props**:
```typescript
{
  is?: 'button' | 'a' | 'NuxtLink'
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  color?: 'primary' | 'danger' | 'success' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}
```

**Examples**:
```vue
<!-- Primary button -->
<ccm-button variant="primary" color="primary">
  Submit
</ccm-button>

<!-- Link styled as button -->
<ccm-button is="NuxtLink" to="/analyst" variant="outline">
  Go to Analyst
</ccm-button>

<!-- Loading state -->
<ccm-button :loading="isSubmitting">
  Save
</ccm-button>

<!-- Ghost button (minimal style) -->
<ccm-button variant="ghost" @click="handleCancel">
  Cancel
</ccm-button>
```

**Variants**:
- `primary` - Filled, high emphasis
- `secondary` - Filled, medium emphasis
- `outline` - Border, low emphasis
- `ghost` - No border/background, minimal

**Colors**:
- `primary` - Brand color
- `danger` - Red (destructive actions)
- `success` - Green (positive actions)
- `neutral` - Gray (neutral actions)

---

### ccmChip

**File**: [components/ccmChip.vue](../../components/ccmChip.vue)

**Purpose**: Small label/badge component

**Props**:
```typescript
{
  variant?: 'filled' | 'outline'
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  size?: 'sm' | 'md'
  removable?: boolean
}
```

**Events**:
- `@remove` - When removable chip is clicked

**Example**:
```vue
<ccm-chip color="success" variant="filled">
  Active
</ccm-chip>

<ccm-chip color="primary" removable @remove="handleRemove">
  Tag name
</ccm-chip>
```

---

### ccmCard

**File**: [components/ccmCard.vue](../../components/ccmCard.vue)

**Purpose**: Generic card container

**Props**:
```typescript
{
  padded?: boolean
  hoverable?: boolean
  clickable?: boolean
}
```

**Slots**:
- `header` - Card header content
- `default` - Card body
- `footer` - Card footer

**Example**:
```vue
<ccm-card padded hoverable>
  <template #header>
    <h3>Card Title</h3>
  </template>

  <p>Card content goes here...</p>

  <template #footer>
    <ccm-button>Action</ccm-button>
  </template>
</ccm-card>
```

---

## Content Components

### ccmHero

**File**: [components/ccmHero.vue](../../components/ccmHero.vue)

**Purpose**: Hero section for pages

**Props**:
```typescript
{
  title: string
  subtitle?: string
  backgroundImage?: string
  height?: 'sm' | 'md' | 'lg' | 'xl'
}
```

**Example**:
```vue
<ccm-hero
  title="Welcome to Scraper"
  subtitle="Intelligent content curation platform"
  height="lg"
>
  <ccm-button variant="primary">Get Started</ccm-button>
</ccm-hero>
```

---

### ccmPostHero

**File**: [components/ccmPostHero.vue](../../components/ccmPostHero.vue)

**Purpose**: Blog post hero with metadata

**Props**:
```typescript
{
  title: string
  date?: string
  author?: string
  readTime?: string
  coverImage?: string
}
```

**Example**:
```vue
<ccm-post-hero
  title="My Blog Post"
  date="2025-10-06"
  author="John Doe"
  read-time="5 min read"
/>
```

---

### ccmByLine

**File**: [components/ccmByLine.vue](../../components/ccmByLine.vue)

**Purpose**: Author byline with metadata

**Props**:
```typescript
{
  author: string
  date?: string
  readTime?: string
  avatarUrl?: string
}
```

**Example**:
```vue
<ccm-by-line
  author="Jane Smith"
  date="Oct 6, 2025"
  read-time="3 min"
/>
```

---

## Scraper Components

### ScrapeResultCard

**File**: [components/scraper/ScrapeResultCard.vue](../../components/scraper/ScrapeResultCard.vue)

**Purpose**: Display and edit scraped content cards

**Props**:
```typescript
{
  heading: string
  headingLevel?: 'h1' | 'h2' | 'h3' | 'h4'
  subheading?: string
  result?: ScrapeResult
  requestStatus?: 'queued' | 'running' | 'done' | 'error'
  isBusy?: boolean
  queuedMessage?: string
  runningMessage?: string
  approveLabel?: string
}
```

**Events**:
```typescript
@edit-save="(updatedResult: ScrapeResult) => void"
@approve="() => void"
@archive="() => void"
```

**Features**:
- Inline metadata editing
- Expandable content preview
- Confidence score display
- Status indicators
- Loading states

**Example**:
```vue
<ScrapeResultCard
  :heading="card.result.metadata.title"
  heading-level="h3"
  :subheading="card.result.url"
  :result="card.result"
  request-status="done"
  approve-label="Send to Manager"
  @edit-save="handleSave"
  @approve="handleApprove"
/>
```

**Edit Mode**:
- Click "Edit" to enable editing
- Modify title, summary, author, etc.
- Click "Save" to persist changes
- Emits `@edit-save` with updated result

---

## Nuxt Content Components

### Content-Specific Components

**Location**: `components/content/`

These components are used within Markdown content:

#### Callout

**File**: [components/content/Callout.vue](../../components/content/Callout.vue)

**Purpose**: Highlighted callout boxes in content

**Usage in Markdown**:
```md
::callout{type="info"}
This is an info callout
::

::callout{type="warning"}
⚠️ Warning message
::
```

**Types**:
- `info` - Blue info box
- `warning` - Yellow warning box
- `danger` - Red danger box
- `success` - Green success box

---

#### proseSection

**File**: [components/content/proseSection.vue](../../components/content/proseSection.vue)

**Purpose**: Styled section wrapper for prose content

---

#### proseHgroup

**File**: [components/content/proseHgroup.vue](../../components/content/proseHgroup.vue)

**Purpose**: Heading group with subtitle

**Usage in Markdown**:
```md
::prose-hgroup
# Main Heading
## Subtitle
::
```

---

#### tldrSection

**File**: [components/content/tldrSection.vue](../../components/content/tldrSection.vue)

**Purpose**: TL;DR summary box

**Usage in Markdown**:
```md
::tldr-section
Key points in bullet form
::
```

---

#### ctaSignup

**File**: [components/content/ctaSignup.vue](../../components/content/ctaSignup.vue)

**Purpose**: Call-to-action signup form

**Usage in Markdown**:
```md
::cta-signup
Sign up for updates
::
```

---

## Component Patterns

### Composition API

All components use Vue 3 Composition API:

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  title: string
}>()

const emit = defineEmits<{
  (e: 'click', value: string): void
}>()

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>
```

### TypeScript Props

Define props with TypeScript:

```typescript
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})
```

### Slots

Using named slots:

```vue
<template>
  <div class="card">
    <header v-if="$slots.header">
      <slot name="header" />
    </header>
    <div class="body">
      <slot />
    </div>
  </div>
</template>
```

## Styling Approach

### Scoped Styles

Components use scoped CSS:

```vue
<style scoped>
.button {
  padding: 0.5rem 1rem;
  border-radius: var(--border-radius-m);
}
</style>
```

### CSS Custom Properties

Use design tokens:

```css
.button {
  background: var(--color-primary);
  padding: var(--space-s);
  border-radius: var(--border-radius-m);
}
```

### CSS Layers

Respect layer hierarchy:

```css
@layer utils {
  .text-primary {
    color: var(--color-primary);
  }
}
```

## Component Development

### Creating New Components

1. Create file in `components/ccm[Name].vue`
2. Use Composition API
3. Define TypeScript props/emits
4. Add scoped styles
5. Document with JSDoc comments

**Template**:
```vue
<script setup lang="ts">
/**
 * Brief component description
 * @example
 * <ccm-my-component title="Hello" />
 */

interface Props {
  title: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="my-component">
    {{ title }}
  </div>
</template>

<style scoped>
.my-component {
  /* styles */
}
</style>
```

## Testing Components (Future)

Planned testing setup:

```typescript
import { mount } from '@vue/test-utils'
import ccmButton from '~/components/ccmButton.vue'

describe('ccmButton', () => {
  it('renders text', () => {
    const wrapper = mount(ccmButton, {
      slots: { default: 'Click me' }
    })
    expect(wrapper.text()).toBe('Click me')
  })
})
```

## Accessibility

### ARIA Attributes

```vue
<button
  :aria-label="ariaLabel"
  :aria-disabled="disabled"
  role="button"
>
  Click
</button>
```

### Keyboard Navigation

```vue
<div
  tabindex="0"
  @keydown.enter="handleClick"
  @keydown.space.prevent="handleClick"
>
  Interactive element
</div>
```

## Related Documentation

- [**Pages**](pages) - Page components
- [**Workflow System**](workflow) - Card workflow components
- [**CSS Architecture**](../architecture#css-architecture) - Styling system
- [**CLAUDE.md**](../../CLAUDE.md) - Component conventions
