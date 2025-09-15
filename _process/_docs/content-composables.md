## Content Composables

A small set of helpers to make Nuxt Content streams dead-simple and consistent across the app.

### TLDR: Quick Usage

```vue
<script setup>
// Streams (lists)
const blog = content('blog', 'recency')            // sort by date desc
const alpha = content('blog', 'alphabetical')      // sort by title asc

// Single item
const post = contentOne('blog', { slug: 'my-post' })

// Advanced stream with filter + cache key
const selected = ref('')
const filtered = content('blog', {
  where: (d) => !selected.value || d.meta?.topic === selected.value,
  sort: { by: 'date', order: 'desc' },
  key: () => `blog:${selected.value}`
})
</script>

<template>
  <ul>
    <li v-for="p in blog" :key="p._path || p.path">{{ p.title }}</li>
  </ul>
</template>
```

### Quick Recipes

- Home page teaser list (recent 3):
```vue
<script setup>
const blog = content('blog', 'recency')
</script>

<template>
  <ccm-card v-for="post in blog.slice(0, 3)" :key="post._path" :to="post._path || post.path">
    <h4>{{ post.meta?.brow }}</h4>
    <h3>{{ post.title }}</h3>
    <p>{{ post.meta?.tagline }}</p>
  </ccm-card>
  <NuxtLink to="/blog">View all →</NuxtLink>
  <p v-if="!blog?.length">No posts</p>
</template>
```

- Blog index with topic filter:
```vue
<script setup>
const selected = ref('')
const blog = content('blog', {
  where: (d) => !selected.value || d.meta?.topic === selected.value,
  sort: { by: 'date', order: 'desc' },
  key: () => `blog:${selected.value}`
})
</script>
```

- Blog post page by slug:
```vue
<script setup>
const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
const post = contentOne('blog', { slug })
</script>
```

### Overview

- **Streams (lists):**
  - `useContentStream(source, optionsOrPreset)` → `{ data, pending, error }`
  - `getContent(source, optionsOrPreset)` → alias of `useContentStream`
  - `content(source, optionsOrPreset)` → returns just `data`

- **Single item:**
  - `useContentItem(source, { slug | path, ... })` → `{ data, pending, error }`
  - `getContentOne(source, { slug | path, ... })` → alias of `useContentItem`
  - `contentOne(source, { slug | path, ... })` → returns just `data`

Where `source` is either a collection name (e.g. `blog`) or a path (e.g. `/blog`).

---

### Main API (no aliases)

If you prefer not to use the `content`/`contentOne` sugar, use the base composables directly.

#### Stream examples

```vue
<script setup>
// Recent first
const { data: blogPosts } = useContentStream('blog', {
  sort: { by: 'date', order: 'desc' }
})

// Alphabetical
const { data: alpha } = useContentStream('blog', {
  sort: { by: 'title', order: 'asc' }
})

// Filter + limit + cache key tied to a reactive filter
const selected = ref('')
const { data: filtered } = useContentStream('blog', {
  where: (d) => !selected.value || d.meta?.topic === selected.value,
  sort: { by: 'date', order: 'desc' },
  limit: 6,
  key: () => `blog:${selected.value}`
})
</script>
```

#### Single item example

```vue
<script setup>
const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
const { data: post } = useContentItem('blog', { slug })
</script>
```

---

### Streams API

```ts
// composables/useContentStream.ts
export type Order = 'asc' | 'desc'
export type SortPreset = 'recency' | 'abc' | 'alphabetical'

export type WhereClause =
  | Record<string, unknown>
  | ((doc: Record<string, unknown>) => boolean)

export interface ContentStreamOptions {
  where?: WhereClause
  sort?: { by: string; order?: Order } | Array<{ by: string; order?: Order }>
  select?: string[]
  limit?: number
  includeDrafts?: boolean
  key?: string // cache key for useAsyncData
}
```

- **Presets** for `optionsOrPreset`:
  - `'recency'` → `{ sort: { by: 'date', order: 'desc' } }`
  - `'abc'` or `'alphabetical'` → `{ sort: { by: 'title', order: 'asc' } }`

#### Examples

```vue
<script setup>
// Recent first
const blog = content('blog', 'recency')

// Alphabetical
const postsAlpha = content('blog', 'alphabetical')

// Advanced options
const posts = content('blog', {
  where: { 'meta.topic': 'Designing for Policy & Research' },
  sort: [{ by: 'date', order: 'desc' }],
  select: ['title', 'meta', '_path', 'path', 'date'],
  limit: 6
})
</script>

<template>
  <ul>
    <li v-for="post in blog" :key="post._path || post.path">{{ post.title }}</li>
  </ul>
</template>
```

#### Behavior

- If `source` starts with `/` → uses `queryContent(source).find()`.
- Otherwise → uses `queryCollection(source).all()` and respects your `content.config.ts` collections.
- Drafts: items with `published === false` are excluded by default; set `includeDrafts: true` to include them.
- `select`: returns a trimmed object with the specified fields only.
- `limit`: slices the array after filters/sorts.

#### Reactivity notes

- `useAsyncData` caches by `key`. If your `where` or other options depend on reactive state, provide a `key` that includes those values so it refreshes.

```ts
const selected = ref('')
const blog = content('blog', {
  where: (d) => !selected.value || d.meta?.topic === selected.value,
  sort: { by: 'date', order: 'desc' },
  key: () => `blog:${selected.value}` // ensures refetch when filter changes
})
```

Alternatively, recreate the composable call inside a `watchEffect` or computed scope.

---

### Single Item API

```ts
// composables/useContentItem.ts
export interface ContentItemOptions {
  slug?: string
  path?: string
  pathBase?: string // used when source is a collection and only slug is provided
  select?: string[]
  includeDrafts?: boolean
  key?: string
}
```

Resolution rules:
- If `path` is provided, it is used as-is.
- If `slug` is provided:
  - When `source` is a path (e.g. `/blog`), resolves to `${source}/${slug}`.
  - When `source` is a collection (e.g. `blog`), resolves to `${pathBase || '/blog'}/${slug}`.
- If `source` itself is a full path (e.g. `/blog/my-post`), it is used.
- Fetches with `queryContent(path).findOne()` for path sources, or `queryCollection(source).path(path).first()` for collections.
- Drafts: if `published === false` and `includeDrafts` is not set, returns `null`.

#### Examples

```vue
<script setup>
// By slug in a collection
const post = contentOne('blog', { slug: '2025-08-27-modular-content-blueprint' })

// Explicit path
const postByPath = contentOne('/blog', { path: '/blog/2025-08-27-modular-content-blueprint' })

// Selected fields only
const postLite = contentOne('blog', {
  slug: '2025-08-27-modular-content-blueprint',
  select: ['title', 'description', '_path', 'date']
})
</script>

<template>
  <ContentRenderer v-if="post" :value="post" />
  <p v-else>Post not found</p>
  <!-- post is a Ref; access with post.value in <script setup> -->
</template>
```

---

### Aliases Summary

- **Streams**
  - **useContentStream(source, optionsOrPreset)**: Returns `{ data, pending, error }`.
  - **getContent(...)**: Exact alias of `useContentStream`.
  - **content(...)**: Returns only `data` (a `Ref` of array).

- **Single item**
  - **useContentItem(source, opts)**: Returns `{ data, pending, error }`.
  - **getContentOne(...)**: Exact alias of `useContentItem`.
  - **contentOne(...)**: Returns only `data` (a `Ref` of object | null).

---

### Tips & Gotchas

- **SSR/CSR**: Both helpers use `useAsyncData`, so they work SSR and hydrate on the client.
- **Keys & caching**: Stable `key`s avoid duplicate fetches. Include reactive filters in `key` when needed.
- **Sorting fields**: Presets assume `date` and `title` exist. If not guaranteed, provide a custom `sort`.
- **Selecting fields**: Prefer `select` for lists to minimize payloads and improve render perf.
- **Collections vs paths**: Prefer collections for typed schemas via `content.config.ts`. Paths are useful for ad‑hoc directories.

---

### Quick Recipes

- **Home page teaser list (recent 3):**
```vue
<script setup>
const blog = content('blog', 'recency')
</script>

<template>
  <ccm-card v-for="post in blog.slice(0, 3)" :key="post._path" :to="post._path || post.path">
    <h4>{{ post.meta?.brow }}</h4>
    <h3>{{ post.title }}</h3>
    <p>{{ post.meta?.tagline }}</p>
  </ccm-card>
  <NuxtLink to="/blog">View all →</NuxtLink>
  <p v-if="!blog?.length">No posts</p>
  </template>
```

- **Blog index with filter:**
```vue
<script setup>
const selected = ref('')
const blog = content('blog', {
  where: (d) => !selected.value || d.meta?.topic === selected.value,
  sort: { by: 'date', order: 'desc' },
  key: () => `blog:${selected.value}`
})
</script>
```

- **Blog post page by slug:**
```vue
<script setup>
const route = useRoute()
const slug = Array.isArray(route.params.slug) ? route.params.slug.join('/') : route.params.slug
const post = contentOne('blog', { slug })
</script>
```

---

### Contract (for LLMs)

- Exports:
  - `useContentStream(source: string, optionsOrPreset?: ContentStreamOptions | SortPreset)`
  - `getContent = useContentStream`
  - `content(source: string, optionsOrPreset?: ContentStreamOptions | SortPreset) => Ref<any[]>`
  - `useContentItem(source: string, options?: ContentItemOptions)`
  - `getContentOne = useContentItem`
  - `contentOne(source: string, options?: ContentItemOptions) => Ref<any | null>`

- Sort presets: `'recency' | 'abc' | 'alphabetical'`
- Drafts default excluded: item if `published === false` → filtered unless `includeDrafts: true`.
- Path resolution precedence: `path` > `slug`+`source`/`pathBase` > `source` if it is a full path.


