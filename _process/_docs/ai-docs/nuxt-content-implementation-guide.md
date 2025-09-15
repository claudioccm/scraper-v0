# Nuxt Content Implementation Guide for Nuxt 3

> **Comprehensive guide to implementing Nuxt Content v3 in Nuxt 3 projects**
>
> *Based on official Nuxt Content documentation (299 code snippets from Context7)*
> *Last updated: December 2024*

## Table of Contents

1. [Installation & Basic Setup](#1-installation--basic-setup)
2. [Collection Configuration](#2-collection-configuration)
3. [Query Patterns & Best Practices](#3-query-patterns--best-practices)
4. [Server-Side Usage](#4-server-side-usage)
5. [Advanced Features](#5-advanced-features)
6. [Markdown with Vue Components (MDC)](#6-markdown-with-vue-components-mdc)
7. [Preview Mode & Studio Integration](#7-preview-mode--studio-integration)
8. [Best Practices](#8-best-practices)
9. [Migration from v2 to v3](#9-migration-from-v2-to-v3)
10. [Common Issues & Troubleshooting](#10-common-issues--troubleshooting)

---

## 1. Installation & Basic Setup

### Installation

```bash
npm install @nuxt/content
```

### Module Registration

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/content'],
  content: {
    // Basic configuration
    preview: {
      api: 'https://api.nuxt.studio' // For preview mode
    }
  }
})
```

### Content Directory Structure

```
content/
├── blog/
│   ├── first-post.md
│   └── second-post.md
├── caseStudies/
│   ├── project-alpha.md
│   └── project-beta.md
└── index.md
```

---

## 2. Collection Configuration

### Basic Collection Definition

```typescript
// content.config.ts
import { defineContentConfig, defineCollection } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/*.md'
    }),
    caseStudies: defineCollection({
      type: 'page',
      source: 'caseStudies/*.md'
    })
  }
})
```

### Advanced Collection Configuration

```typescript
// content.config.ts
import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: {
        include: '**',
        exclude: ['**/.*'], // Ignore dot files
        prefix: '/docs'
      },
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        published: z.boolean().default(true),
        date: z.date(),
        readingTime: z.number().optional()
      })
    }),

    authors: defineCollection({
      type: 'data',
      source: 'authors/*.yml',
      schema: z.object({
        name: z.string(),
        email: z.string(),
        avatar: z.string().optional()
      })
    })
  }
})
```

### Collection Types

- **`page`**: Content that maps to routes (blog posts, documentation)
- **`data`**: Structured data not directly accessible via URL (authors, categories)

---

## 3. Query Patterns & Best Practices

### Basic Querying

```vue
<script setup lang="ts">
// Get single item by path
const { data: post } = await useAsyncData('post', () => {
  return queryCollection('blog').path('/first-post').first()
})

// Get all items
const { data: posts } = await useAsyncData('posts', () => {
  return queryCollection('blog').all()
})

// Get filtered items
const { data: publishedPosts } = await useAsyncData('published', () => {
  return queryCollection('blog')
    .where('published', '=', true)
    .order('date', 'DESC')
    .all()
})
</script>
```

### Advanced Filtering & Sorting

```vue
<script setup lang="ts">
// Complex filtering with AND/OR conditions
const { data: featuredPosts } = await useAsyncData('featured', () => {
  return queryCollection('blog')
    .where('published', '=', true)
    .andWhere(query =>
      query.where('featured', '=', true)
           .where('priority', '>', 5)
    )
    .order('date', 'DESC')
    .limit(10)
    .all()
})

// Select specific fields only (performance optimization)
const { data: postTitles } = await useAsyncData('titles', () => {
  return queryCollection('blog')
    .select('title', 'path', 'date')
    .all()
})

// Pagination
const { data: paginatedPosts } = await useAsyncData('page-1', () => {
  return queryCollection('blog')
    .skip(10)  // Skip first 10 items
    .limit(10) // Get next 10 items
    .all()
})
</script>
```

### Navigation & Surroundings

```vue
<script setup lang="ts">
// Generate navigation tree
const { data: navigation } = await useAsyncData('nav', () => {
  return queryCollectionNavigation('docs')
    .where('published', '=', true)
    .order('title', 'ASC')
})

// Get surrounding items (previous/next posts)
const { data: surroundings } = await useAsyncData('surround', () => {
  return queryCollectionItemSurroundings('blog', '/first-post', {
    before: 1,
    after: 1,
    fields: ['title', 'description']
  })
})

// Search sections for full-text search
const { data: sections } = await useAsyncData('search-sections', () => {
  return queryCollectionSearchSections('docs', {
    ignoredTags: ['code'] // Ignore code blocks in search
  })
})
</script>
```

### Template Usage

```vue
<template>
  <!-- Display posts -->
  <div v-for="post in posts" :key="post.path">
    <h2>{{ post.title }}</h2>
    <p>{{ post.description }}</p>
    <NuxtLink :to="post.path">Read more</NuxtLink>
  </div>

  <!-- Display navigation -->
  <nav v-if="navigation">
    <ul>
      <li v-for="item in navigation" :key="item.path">
        <NuxtLink :to="item.path">{{ item.title }}</NuxtLink>
      </li>
    </ul>
  </nav>

  <!-- Display surroundings -->
  <div class="pagination">
    <NuxtLink v-if="surroundings?.[0]" :to="surroundings[0].path">
      ← {{ surroundings[0].title }}
    </NuxtLink>
    <NuxtLink v-if="surroundings?.[1]" :to="surroundings[1].path">
      {{ surroundings[1].title }} →
    </NuxtLink>
  </div>
</template>
```

---

## 4. Server-Side Usage

### API Routes

```typescript
// server/api/posts.get.ts
export default eventHandler(async (event) => {
  const posts = await queryCollection(event, 'blog')
    .where('published', '=', true)
    .order('date', 'DESC')
    .all()

  return posts
})

// server/api/posts/[slug].get.ts
export default eventHandler(async (event) => {
  const { slug } = getRouterParams(event)
  const post = await queryCollection(event, 'blog')
    .path(`/blog/${slug}`)
    .first()

  if (!post) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found'
    })
  }

  return post
})
```

### Server Nitro Routes

```typescript
// server/routes/sitemap.xml.get.ts
export default eventHandler(async (event) => {
  const posts = await queryCollection(event, 'blog')
    .where('published', '=', true)
    .select('path', 'date')
    .all()

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${posts.map(post => `
  <url>
    <loc>https://yoursite.com${post.path}</loc>
    <lastmod>${post.date?.toISOString()}</lastmod>
  </url>`).join('')}
</urlset>`

  setHeader(event, 'content-type', 'application/xml')
  return sitemap
})
```

### Server-Side TypeScript Configuration

```json
// server/tsconfig.json
{
  "extends": "../.nuxt/tsconfig.server.json"
}
```

---

## 5. Advanced Features

### Custom Transformers

```typescript
// server/transformers/reading-time.ts
import { defineTransformer } from '@nuxt/content'

export default defineTransformer({
  name: 'reading-time',
  extensions: ['.md'],
  transform(file) {
    const wordsPerMinute = 200
    const text = file.body || ''
    const wordCount = text.split(/\s+/).length
    const readingTime = Math.ceil(wordCount / wordsPerMinute)

    return {
      ...file,
      readingTime
    }
  }
})

// Register transformer in nuxt.config.ts
export default defineNuxtConfig({
  content: {
    build: {
      transformers: [
        '~/server/transformers/reading-time'
      ]
    }
  }
})
```

### Hooks for Content Processing

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  hooks: {
    'content:file:beforeParse'(ctx) {
      // Modify content before parsing
      // Example: Replace brand names
      ctx.file.body = ctx.file.body.replace(/react/gi, 'Vue')
    },

    'content:file:afterParse'(ctx) {
      // Add metadata after parsing
      const words = ctx.file.body?.split(/\s+/).length || 0
      ctx.content.wordCount = words
      ctx.content.readingTime = Math.ceil(words / 200)

      // Add excerpt if not present
      if (!ctx.content.excerpt && ctx.content.body?.children) {
        const firstParagraph = ctx.content.body.children
          .find(child => child.tag === 'p')
        if (firstParagraph) {
          ctx.content.excerpt = firstParagraph.children
            .map(child => child.value || '')
            .join('')
            .slice(0, 160) + '...'
        }
      }
    },

    'content:collection:beforeInsert'(documents, collection) {
      // Modify documents before insertion
      return documents.map(doc => ({
        ...doc,
        collection: collection.name
      }))
    }
  }
})
```

### Database Configurations

```typescript
// nuxt.config.ts

// SQLite (default)
export default defineNuxtConfig({
  content: {
    database: {
      type: 'sqlite',
      filename: 'custom.db' // Optional custom filename
    }
  }
})

// PostgreSQL
export default defineNuxtConfig({
  content: {
    database: {
      type: 'postgres',
      url: process.env.POSTGRES_URL,
      // Additional pg options...
    }
  }
})

// LibSQL/Turso
export default defineNuxtConfig({
  content: {
    database: {
      type: 'libsql',
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    }
  }
})

// Cloudflare D1
export default defineNuxtConfig({
  content: {
    database: {
      type: 'd1',
      bindingName: 'DB'
    }
  }
})

// For serverless platforms (Vercel, Netlify)
export default defineNuxtConfig({
  content: {
    database: {
      type: 'sqlite',
      filename: '/tmp/contents.sqlite' // Writeable tmp directory
    }
  }
})
```

### Custom Query Plugins

```typescript
// server/plugins/version-query.ts
import { defineQueryPlugin } from '#imports'

export default defineQueryPlugin({
  name: 'version',
  queries: {
    version: params => {
      return v => {
        params.version = v
      }
    }
  },
  execute: (data, params) => {
    if (params.version) {
      return data.filter(item =>
        item.version === params.version ||
        item.tags?.includes(params.version)
      )
    }
    return data
  }
})

// Register plugin in nuxt.config.ts
export default defineNuxtConfig({
  content: {
    query: {
      plugins: ['~/server/plugins/version-query']
    }
  }
})

// Usage
const posts = await queryCollection('blog')
  .version('v3.0')
  .find()
```

---

## 6. Markdown with Vue Components (MDC)

### Using Components in Markdown

```markdown
---
title: My Blog Post
description: A post with Vue components
published: true
date: 2024-01-15
---

# Welcome to my blog

::alert{type="info"}
  This is a custom alert component!
::

Here's a button: ::button{href="/contact"} Contact Us ::

## Code Example

```vue
<script setup>
const count = ref(0)
</script>

<template>
  <button @click="count++">
    Count: {{ count }}
  </button>
</template>
```

::hero
  #title
  My Hero Title

  #subtitle
  This is a subtitle

  #cta
  ::button{href="/get-started"}
    Get Started
  ::
::

<!-- Tables -->
| Feature | Status |
|---------|--------|
| ✅ Basic | Done |
| 🚧 Advanced | In Progress |
| ❌ Complex | Not Started |
```

### Custom MDC Components

```vue
<!-- components/content/Alert.vue -->
<template>
  <div :class="`alert alert-${type}`">
    <div class="alert-icon">
      <UIcon :name="iconMap[type]" />
    </div>
    <div class="alert-content">
      <slot />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'warning', 'error', 'success'].includes(value)
  }
})

const iconMap = {
  info: 'i-heroicons-information-circle',
  warning: 'i-heroicons-exclamation-triangle',
  error: 'i-heroicons-x-circle',
  success: 'i-heroicons-check-circle'
}
</script>

<style scoped>
.alert {
  @apply p-4 rounded-lg border;
}

.alert-info {
  @apply bg-blue-50 border-blue-200 text-blue-800;
}

.alert-warning {
  @apply bg-yellow-50 border-yellow-200 text-yellow-800;
}

.alert-error {
  @apply bg-red-50 border-red-200 text-red-800;
}

.alert-success {
  @apply bg-green-50 border-green-200 text-green-800;
}

.alert-icon {
  @apply mr-3;
}
</style>
```

```vue
<!-- components/content/Hero.vue -->
<template>
  <section class="hero">
    <div class="hero-container">
      <h1 class="hero-title" v-if="$slots.title">
        <slot name="title" />
      </h1>

      <p class="hero-subtitle" v-if="$slots.subtitle">
        <slot name="subtitle" />
      </p>

      <div class="hero-cta" v-if="$slots.cta">
        <slot name="cta" />
      </div>
    </div>
  </section>
</template>

<script setup>
// Props for customization
defineProps({
  background: {
    type: String,
    default: 'gradient'
  },
  size: {
    type: String,
    default: 'large',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})
</script>
```

### Prose Components (Typography Customization)

```vue
<!-- components/content/ProseA.vue -->
<template>
  <NuxtLink
    :to="to"
    :external="isExternal"
    class="prose-link"
    :class="{ 'external-link': isExternal }"
  >
    <slot />
    <UIcon
      v-if="isExternal"
      name="i-heroicons-arrow-up-right"
      class="external-icon"
    />
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  href: String
})

const isExternal = computed(() => {
  if (!props.href) return false
  return props.href.startsWith('http') || props.href.startsWith('//')
})

const to = computed(() => {
  if (!props.href) return '#'
  return isExternal.value ? props.href : props.href
})
</script>
```

### Component Aliases

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  content: {
    renderer: {
      alias: {
        // Replace default components
        p: 'MyCustomParagraph',
        a: 'MyCustomLink',
        code: 'MyCustomCode',

        // Add shortcuts
        'alert-info': 'Alert',
        'btn': 'UButton'
      }
    }
  }
})
```

---

## 7. Preview Mode & Studio Integration

### Enable Preview Mode

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  content: {
    preview: {
      api: 'https://api.nuxt.studio',
      dev: true, // Enable in development
      gitInfo: {
        name: 'your-repo',
        owner: 'your-username',
        url: 'https://github.com/your-username/your-repo'
      }
    }
  }
})
```

### Preview Route Handler

```typescript
// server/api/_content/preview.get.ts
export default eventHandler(async (event) => {
  const { token, path } = getQuery(event)

  // Verify preview token (implement your own logic)
  if (!isValidPreviewToken(token)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid preview token'
    })
  }

  // Return draft content
  const content = await queryCollection(event, 'blog')
    .path(path)
    .first()

  if (!content) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Content not found'
    })
  }

  return content
})
```

### Studio Configuration Schema

```typescript
// nuxt.schema.ts
import { defineNuxtSchema, field, group } from '@nuxt/content/preview'

export default defineNuxtSchema({
  appConfig: {
    site: group({
      title: 'Site Settings',
      description: 'Global site configuration',
      icon: 'i-heroicons-globe-alt',
      fields: {
        name: field({
          type: 'string',
          title: 'Site Name',
          description: 'The name of your website',
          default: 'My Website'
        }),
        description: field({
          type: 'string',
          title: 'Site Description',
          description: 'Brief description of your website'
        }),
        theme: field({
          type: 'string',
          title: 'Theme',
          description: 'Site theme',
          required: ['light', 'dark', 'auto'],
          default: 'auto'
        })
      }
    }),

    ui: group({
      title: 'UI Configuration',
      description: 'User interface settings',
      icon: 'i-heroicons-paint-brush',
      fields: {
        primary: field({
          type: 'string',
          title: 'Primary Color',
          required: ['blue', 'green', 'red', 'purple'],
          default: 'blue'
        }),
        radius: field({
          type: 'string',
          title: 'Border Radius',
          required: ['none', 'sm', 'md', 'lg', 'full'],
          default: 'md'
        })
      }
    })
  }
})
```

---

## 8. Best Practices

### Performance Optimization

```vue
<script setup lang="ts">
// ✅ Good: Select only needed fields
const { data: posts } = await useAsyncData('posts', () => {
  return queryCollection('blog')
    .select('title', 'path', 'date', 'description')
    .limit(10)
    .all()
})

// ✅ Good: Use proper caching keys
const route = useRoute()
const { data: post } = await useAsyncData(`post-${route.path}`, () => {
  return queryCollection('blog').path(route.path).first()
})

// ✅ Good: Count for pagination
const { data: totalCount } = await useAsyncData('total-posts', () => {
  return queryCollection('blog').count()
})

// ❌ Bad: Selecting all fields when only title is needed
const { data: posts } = await useAsyncData('posts', () => {
  return queryCollection('blog').all() // Returns full content
})
</script>
```

### Error Handling

```vue
<script setup lang="ts">
// With error handling
const { data: post, error, pending } = await useAsyncData('post', () => {
  return queryCollection('blog').path(route.path).first()
})

// Handle loading state
if (pending) {
  return <div>Loading...</div>
}

// Handle error state
if (error) {
  return <div>Error: {error.message}</div>
}

// Handle not found
if (!post) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Post not found'
  })
}
</script>

<template>
  <div>
    <ContentRenderer v-if="post" :value="post" />

    <!-- 404 fallback -->
    <div v-else class="not-found">
      <h1>Post Not Found</h1>
      <p>The post you're looking for doesn't exist.</p>
      <NuxtLink to="/blog">← Back to Blog</NuxtLink>
    </div>
  </div>
</template>
```

### TypeScript Integration

```typescript
// types/content.ts
export interface BlogPost {
  title: string
  description?: string
  published: boolean
  date: Date
  path: string
  body: any
  readingTime?: number
  tags?: string[]
}

export interface Author {
  name: string
  email: string
  avatar?: string
  bio?: string
}

// In your component
const { data: posts } = await useAsyncData<BlogPost[]>('posts', () => {
  return queryCollection('blog')
    .where('published', '=', true)
    .all()
})

const { data: author } = await useAsyncData<Author>('author', () => {
  return queryCollection('authors')
    .where('email', '=', 'john@example.com')
    .first()
})
```

### Content Organization

```
content/
├── _meta.yml          # Navigation metadata
├── index.md           # Homepage
├── about.md           # About page

├── blog/
│   ├── _meta.yml      # Blog navigation
│   ├── index.md       # Blog listing page
│   ├── first-post.md
│   ├── second-post.md
│   └── categories/
│       ├── tech.md
│       └── design.md

├── docs/
│   ├── _meta.yml      # Docs navigation
│   ├── index.md
│   ├── 1.getting-started/
│   │   ├── index.md
│   │   ├── installation.md
│   │   └── configuration.md
│   └── 2.api-reference/
│       ├── index.md
│       └── query-collection.md

├── authors/
│   ├── john.yml
│   └── jane.yml

└── pages/             # Flat pages
    ├── privacy.md
    ├── terms.md
    └── contact.md
```

---

## 9. Migration from v2 to v3

### Key Changes Summary

| v2 | v3 |
|----|----|
| `queryContent()` | `queryCollection()` |
| `queryContent('/path').findOne()` | `queryCollection('collection').path('/path').first()` |
| `queryContent().find()` | `queryCollection('collection').all()` |
| `queryContent().only(['title'])` | `queryCollection('collection').select('title')` |
| `fetchContentNavigation()` | `queryCollectionNavigation()` |
| Auto-discovered collections | Explicit `content.config.ts` |

### Migration Steps

1. **Install v3**:
   ```bash
   npm install @nuxt/content@^3
   ```

2. **Create content.config.ts**:
   ```typescript
   // content.config.ts
   import { defineContentConfig, defineCollection } from '@nuxt/content'

   export default defineContentConfig({
     collections: {
       blog: defineCollection({
         type: 'page',
         source: 'blog/**/*.md'
       }),
       docs: defineCollection({
         type: 'page',
         source: 'docs/**/*.md'
       })
     }
   })
   ```

3. **Update Queries**:
   ```typescript
   // v2 → v3 Migration Examples

   // OLD (v2)
   const posts = await queryContent('blog').find()
   const post = await queryContent('/blog/my-post').findOne()
   const nav = await fetchContentNavigation()

   // NEW (v3)
   const posts = await queryCollection('blog').all()
   const post = await queryCollection('blog').path('/blog/my-post').first()
   const nav = await queryCollectionNavigation('blog')
   ```

4. **Update Filtering**:
   ```typescript
   // OLD (v2)
   const posts = await queryContent()
     .where({ category: { $in: ['tech', 'design'] } })
     .find()

   // NEW (v3)
   const posts = await queryCollection('blog')
     .where('category', 'IN', ['tech', 'design'])
     .all()
   ```

5. **Update Path Filtering**:
   ```typescript
   // OLD (v2)
   const posts = await queryContent()
     .where({ path: /\/blog\/.*/ })
     .find()

   // NEW (v3)
   const posts = await queryCollection('blog')
     .where('path', 'LIKE', '/blog/%')
     .all()
   ```

### Breaking Changes

- **Collection Names**: Must be valid JavaScript identifiers (no hyphens)
- **Query API**: Completely rewritten with SQL-like syntax
- **Navigation**: `fetchContentNavigation()` → `queryCollectionNavigation()`
- **Schemas**: New Zod-based schema validation
- **File Watching**: Improved but different configuration

---

## 10. Common Issues & Troubleshooting

### Collection Name Issues

```bash
# ❌ Invalid: Hyphens not allowed in collection names
content/case-studies/  # Error: Invalid collection name

# ✅ Valid: Use camelCase
content/caseStudies/   # ✓ Valid collection name
```

### Auto-Import Issues

```typescript
// If auto-imports don't work, try these solutions:

// 1. Restart dev server
npm run dev

// 2. Clear cache
npx nuxi cleanup && npm run dev

// 3. Explicit import (temporary fix)
import { queryCollection } from '#imports'

// 4. Check nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/content'] // Make sure this is present
})
```

### Type Errors

```json
// server/tsconfig.json - Required for server-side usage
{
  "extends": "../.nuxt/tsconfig.server.json"
}
```

### Content Not Found

```typescript
// Add error handling for missing content
const { data: post } = await useAsyncData('post', () => {
  return queryCollection('blog').path(route.path).first()
})

// In template
<template>
  <ContentRenderer v-if="post" :value="post" />
  <div v-else>
    <h1>Content Not Found</h1>
    <NuxtLink to="/blog">← Back to Blog</NuxtLink>
  </div>
</template>
```

### Database Issues

```typescript
// For serverless platforms, use /tmp directory
export default defineNuxtConfig({
  content: {
    database: {
      type: 'sqlite',
      filename: '/tmp/contents.sqlite'
    }
  }
})

// For PostgreSQL
export default defineNuxtConfig({
  content: {
    database: {
      type: 'postgres',
      url: process.env.POSTGRES_URL
    }
  }
})
```

### Markdown Rendering Issues

```typescript
// Configure markdown processing
export default defineNuxtConfig({
  content: {
    build: {
      markdown: {
        // Enable/disable features
        toc: {
          depth: 3,
          searchDepth: 2
        },

        // Configure remark plugins
        remarkPlugins: {
          'remark-emoji': {
            emoticon: true
          },
          'remark-gfm': true // GitHub Flavored Markdown
        },

        // Configure rehype plugins
        rehypePlugins: {
          'rehype-highlight': {
            theme: 'github-dark'
          }
        }
      }
    }
  }
})
```

### Performance Issues

```typescript
// Optimize with selective field loading
const { data: posts } = await useAsyncData('posts', () => {
  return queryCollection('blog')
    .select('title', 'path', 'date') // Only load needed fields
    .limit(10) // Limit results
    .all()
})

// Use count for pagination metadata
const { data: total } = await useAsyncData('total', () => {
  return queryCollection('blog').count()
})
```

### Hot Reload Issues

```typescript
// Configure content watcher
export default defineNuxtConfig({
  content: {
    watch: {
      enabled: true,
      port: 4000,
      showURL: false
    }
  }
})
```

---

## Quick Reference

### Most Common Queries

```typescript
// Get all posts
const posts = await queryCollection('blog').all()

// Get single post by path
const post = await queryCollection('blog').path('/my-post').first()

// Get filtered posts
const publishedPosts = await queryCollection('blog')
  .where('published', '=', true)
  .order('date', 'DESC')
  .all()

// Get navigation
const nav = await queryCollectionNavigation('docs')

// Get surrounding items
const surroundings = await queryCollectionItemSurroundings('blog', '/current-post')
```

### Template Patterns

```vue
<template>
  <!-- List items -->
  <div v-for="item in items" :key="item.path">
    <h2>{{ item.title }}</h2>
    <p>{{ item.description }}</p>
    <NuxtLink :to="item.path">Read more</NuxtLink>
  </div>

  <!-- Render content -->
  <ContentRenderer :value="content" />

  <!-- Navigation -->
  <nav>
    <ul v-if="navigation">
      <li v-for="item in navigation" :key="item.path">
        <NuxtLink :to="item.path">{{ item.title }}</NuxtLink>
      </li>
    </ul>
  </nav>
</template>
```

---

## Resources

- [Official Nuxt Content Documentation](https://content.nuxt.com)
- [Nuxt Studio](https://nuxt.studio) - Visual CMS
- [Nuxt Content Examples](https://github.com/nuxt/content/tree/main/examples)
- [Nuxt Content GitHub](https://github.com/nuxt/content)

---

*This guide is based on the official Nuxt Content v3 documentation and includes practical examples for real-world implementation scenarios.*
