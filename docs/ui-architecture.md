# ccm-website-7 Frontend Architecture Document

## Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-09-04 | 1.0 | Initial frontend architecture document | Winston (Architect AI) |
| 2025-09-04 | 1.1 | Updated to reflect expanded documentation structure | Winston (Architect AI) |

---

## 1. Template and Framework Selection

This project uses **Nuxt 3.16.2** with **Vue 3.5.13** as the established frontend framework. The architecture analysis reveals:

**Current Template Status**: Existing Nuxt 3 project with established patterns rather than a starter template scenario.

**Key Architecture Decisions:**
- **Framework**: Nuxt 3 over vanilla Vue, gaining SSR capabilities, file-based routing, and auto-imports
- **Content Management**: Nuxt Content for file-based CMS with automatic routing
- **State Management**: Pinia configured for reactive state management
- **Styling**: CSS Layer methodology with custom CSS architecture
- **Components**: Custom component system with `ccm` prefix for consistent naming
- **Build Tool**: Vite integration via Nuxt for fast development and optimized bundling

---

## 2. Frontend Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Framework | Nuxt.js | 3.16.2 | Full-stack Vue framework with SSR/SSG | Provides file-based routing, auto-imports, SEO capabilities, and content management integration |
| UI Library | Vue.js | 3.5.13 | Reactive UI framework | Modern composition API, excellent TypeScript support, lightweight |
| State Management | Pinia | 3.0.2 | Vue state management | Official Vue store, TypeScript-first, devtools integration |
| Routing | Nuxt Router | Built-in | File-based routing system | Automatic route generation, nested layouts, middleware support |
| Build Tool | Vite | Built-in | Fast development and build tool | Lightning-fast HMR, ES modules, optimized bundling |
| Styling | CSS Layers + Custom Properties + PostCSS | Native CSS | Layered CSS architecture with PostCSS processing | Maintainable cascade control, modern CSS features, no runtime dependencies |
| Testing | @nuxt/test-utils + Vitest | 3.17.2 | Nuxt-specific testing utilities | Framework-aware testing, component isolation |
| Component Library | Custom (ccm prefix) | Custom | Project-specific components | Tailored to project needs, consistent naming |
| Form Handling | Native Vue | Built-in | Vue's reactive form handling | Composition API reactivity, no additional dependencies |
| Animation | CSS + Vue Transitions | Native | CSS-based animations with Vue | Performance-first, no JavaScript animation libraries |
| Dev Tools | Nuxt DevTools + ESLint | Latest | Development experience tools | Debugging, linting, and development workflow |

---

## 3. Project Structure

```
ccm-website-7/
├── .nuxt/                     # Auto-generated Nuxt files (ignored)
├── .output/                   # Build output directory
├── .bmad-core/               # BMAD agent configurations
├── assets/                   # Source assets (images, fonts, etc.)
├── components/               # Auto-imported Vue components
│   ├── content/              # Nuxt Content prose components
│   │   ├── proseHgroup.vue   # Content heading groups
│   │   ├── Callout.vue       # Content callouts
│   │   └── proseSection.vue  # Content sections
│   └── ccm*.vue             # Project-specific components (ccm prefix)
├── composables/             # Auto-imported composition functions
├── content/                 # Markdown content files (CMS)
│   ├── index.md            # Homepage content
│   └── [subdirectories]/   # Content organization
├── docs/                   # Project documentation
│   ├── architecture/       # Architecture documentation
│   ├── brief/              # Project brief (sharded)
│   ├── prd/               # Product requirements
│   ├── stories/           # User stories
│   ├── ui-architecture/    # UI architecture documentation (sharded)
│   ├── accessibility-standards.md
│   ├── components-spec.md
│   ├── documentation-standards.md
│   └── seo-optimization.md
├── ds-docs/               # Design system documentation
├── layouts/               # Nuxt layout components
│   └── default.vue        # Main application layout
├── middleware/            # Route middleware
├── pages/                 # File-based routing (if needed)
├── plugins/               # Nuxt plugins
├── public/                # Static assets served at root
│   ├── css/              # CSS architecture
│   │   ├── base/         # Reset, typography, layout
│   │   ├── vars/         # CSS custom properties
│   │   ├── utils/        # Utility classes
│   │   └── components/   # Component-specific styles
│   └── images/           # Static images
├── server/                # Server-side code (API routes)
├── stores/                # Pinia store modules
├── types/                 # TypeScript type definitions
├── utils/                 # Auto-imported utility functions
├── nuxt.config.ts         # Nuxt configuration
├── package.json           # Dependencies and scripts
└── tsconfig.json          # TypeScript configuration
```

**Key Architecture Decisions:**
- **Auto-import Strategy**: Components, composables, and utils are auto-imported without path prefixes
- **Content-Driven**: Content directory serves as the primary CMS with automatic routing
- **CSS Architecture**: Sophisticated layer-based CSS organization in public/css/
- **Component Naming**: Consistent `ccm` prefix for project-specific components
- **Documentation Focus**: Multiple documentation directories for different purposes
- **Type Safety**: Dedicated types directory for TypeScript definitions

**AI Tool Guidance:**
- New components go in `components/` with `ccm` prefix
- Content files in `content/` automatically become routes
- CSS follows layer methodology in `public/css/`
- Store modules in `stores/` follow Pinia patterns
- Types in `types/` for shared interfaces
- Follow documentation standards in `docs/documentation-standards.md`
- Implement accessibility requirements from `docs/accessibility-standards.md`
- Apply SEO optimization from `docs/seo-optimization.md`

---

## 4. Component Standards

### Component Template

```typescript
<template>
  <component
    :is="componentEl"
    :class="componentClasses"
    v-bind="$attrs"
  >
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'

interface Props {
  // Core props
  label?: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'link'
  size?: 's' | 'm' | 'l' | 'xl'
  color?: 'base' | 'primary' | 'secondary' | 'tertiary' | 'accent'
  
  // State props
  disabled?: boolean
  hidden?: boolean
  unstyled?: boolean
  
  // Layout props
  fullWidth?: boolean
  mobile?: string
  
  // Element type
  el?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  variant: 'secondary',
  size: 'm',
  color: 'base',
  disabled: false,
  hidden: false,
  unstyled: false,
  fullWidth: false,
  el: 'button'
})

const attrs = useAttrs()

const componentEl = computed(() => {
  if (attrs.href) return 'a'
  if (attrs.to) return 'NuxtLink'  
  if (props.disabled) return 'span'
  return props.el
})

const componentClasses = computed(() => [
  'ccm-component-name',
  {
    [`ccm-component-name--${props.variant}`]: props.variant,
    [`ccm-component-name--${props.size}`]: props.size,
    'ccm-component-name--full-width': props.fullWidth,
    'ccm-component-name--hidden': props.hidden,
    'ccm-component-name--unstyled': props.unstyled
  }
])
</script>

<style>
/* Component styles go in global CSS files using PostCSS */
/* Leverage your existing CSS layer methodology */
/* No <style scoped> needed - use your established CSS architecture */
</style>
```

### Naming Conventions

**Key Patterns Established:**

- **Component Files**: `ccm[ComponentName].vue` (PascalCase after prefix)
- **Component Names**: Use `ccm` prefix consistently
- **Props**: Use descriptive camelCase names (`fullWidth`, `iconBefore`, `iconAfter`)
- **CSS Classes**: Use component name as base class (`button` in your case)
- **CSS Variables**: Use `--_component-property` pattern with underscore prefix
- **Attribute Binding**: Support both `data-*` and direct attribute patterns
- **Colors**: Standardized color palette (`base`, `primary`, `secondary`, `tertiary`, `accent`, `white`, `success`, `cancel`, `warning`)
- **Sizes**: Standard size scale (`s`, `m`, `l`, `xl`)
- **Variants**: Semantic variant names (`primary`, `secondary`, `ghost`, `link`, `unstyled`)
- **Documentation**: Follow standards defined in `docs/documentation-standards.md` for LLM optimization
- **Component Specifications**: Detailed specs available in `docs/components-spec.md`

**Architecture Decisions:**
- **Dynamic Component Rendering**: Uses `<component :is>` for flexible element types
- **CSS Custom Properties**: Leverages CSS variables for theming and customization
- **Composition API**: Uses `<script setup>` syntax with TypeScript
- **Global CSS Architecture**: Mix of component styles in global CSS layer system
- **Material Icons**: Integration with Google Material Symbols font
- **Accessibility-First**: WCAG 2.1 AA compliance as defined in accessibility standards
- **SEO-Optimized**: Components designed for search engine optimization
- **White-Label Ready**: Complete theming flexibility for multiple brands

---

## 5. State Management

### Store Structure

```
stores/
├── index.ts                    # Store registration and exports
├── auth.ts                     # Authentication state
├── ui.ts                       # UI state (modals, loading, etc.)
├── content.ts                  # Content/CMS state
└── [feature]/                  # Feature-specific stores
    ├── index.ts
    └── types.ts
```

### Enhanced State Management Template

```typescript
import { defineStore } from 'pinia'
import { ref, computed, watchEffect } from 'vue'

interface ComponentState {
  id: string
  name: string
  isActive: boolean
  metadata?: Record<string, any>
  updatedAt?: Date
}

export const useComponentStore = defineStore('component', () => {
  // State (normalized for complex relationships)
  const items = ref<Record<string, ComponentState>>({})
  const itemIds = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentItemId = ref<string | null>(null)

  // Getters
  const itemsList = computed(() => 
    itemIds.value.map(id => items.value[id]).filter(Boolean)
  )
  
  const activeItems = computed(() => 
    itemIds.value
      .map(id => items.value[id])
      .filter(item => item?.isActive)
  )
  
  const currentItem = computed(() => 
    currentItemId.value ? items.value[currentItemId.value] : null
  )
  
  const itemCount = computed(() => itemIds.value.length)
  const hasError = computed(() => error.value !== null)

  // SSR-safe initialization
  const initialize = () => {
    if (process.client && !itemIds.value.length) {
      const cached = localStorage.getItem('component-state')
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          items.value = parsed.items || {}
          itemIds.value = parsed.itemIds || []
        } catch (err) {
          console.warn('Failed to restore cached state:', err)
        }
      }
    }
  }

  // Auto-save to localStorage (client-side only)
  watchEffect(() => {
    if (process.client) {
      const state = {
        items: items.value,
        itemIds: itemIds.value
      }
      localStorage.setItem('component-state', JSON.stringify(state))
    }
  })

  // Actions
  const setItems = (newItems: ComponentState[]) => {
    const normalized = newItems.reduce((acc, item) => {
      acc[item.id] = item
      return acc
    }, {} as Record<string, ComponentState>)
    
    items.value = normalized
    itemIds.value = newItems.map(item => item.id)
    error.value = null
  }

  const addItem = (item: ComponentState) => {
    items.value[item.id] = item
    if (!itemIds.value.includes(item.id)) {
      itemIds.value.push(item.id)
    }
  }

  const removeItem = (id: string) => {
    delete items.value[id]
    const index = itemIds.value.indexOf(id)
    if (index > -1) {
      itemIds.value.splice(index, 1)
    }
  }

  const updateItem = (id: string, updates: Partial<ComponentState>) => {
    const item = items.value[id]
    if (item) {
      items.value[id] = { ...item, ...updates, updatedAt: new Date() }
    }
  }

  // Enhanced async actions with error handling
  const fetchItems = async (): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await $fetch<ComponentState[]>('/api/components')
      setItems(response)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items')
      console.error('Failed to fetch items:', err)
    } finally {
      setLoading(false)
    }
  }

  // Optimistic updates
  const updateItemOptimistically = async (id: string, updates: Partial<ComponentState>) => {
    const original = items.value[id]
    if (!original) return
    
    // Apply optimistic update
    updateItem(id, updates)
    
    try {
      await $fetch(`/api/components/${id}`, {
        method: 'PATCH',
        body: updates
      })
    } catch (err) {
      // Rollback on failure
      items.value[id] = original
      setError('Update failed, changes reverted')
    }
  }

  const setLoading = (isLoading: boolean) => {
    loading.value = isLoading
  }

  const setError = (errorMessage: string | null) => {
    error.value = errorMessage
  }

  const clearState = () => {
    items.value = {}
    itemIds.value = []
    loading.value = false
    error.value = null
    currentItemId.value = null
  }

  // Return store interface
  return {
    // State
    items: readonly(items),
    itemIds: readonly(itemIds),
    loading: readonly(loading),
    error: readonly(error),
    currentItemId: readonly(currentItemId),
    
    // Getters
    itemsList,
    activeItems,
    currentItem,
    itemCount,
    hasError,
    
    // Actions
    initialize,
    setItems,
    addItem,
    removeItem,
    updateItem,
    fetchItems,
    updateItemOptimistically,
    setLoading,
    setError,
    clearState
  }
})

// Type exports for use in components
export type { ComponentState }
```

**Key Patterns:**
- **Composition API Stores**: Uses `defineStore` with setup syntax following best practices
- **TypeScript First**: Full type safety with interfaces and proper exports
- **Normalized State**: Uses normalized state pattern for complex data relationships
- **Readonly State**: Exposes readonly refs to prevent direct mutation
- **Computed Getters**: Reactive derived state with optimal performance
- **SSR-Safe Initialization**: Handles client-side storage without SSR conflicts
- **Optimistic Updates**: Better UX with immediate feedback and rollback on failure
- **Auto-persistence**: Automatic localStorage syncing for user preferences

---

## 6. API Integration

### Enhanced Service Template

```typescript
import type { FetchOptions } from 'ofetch'

interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
}

// Enhanced API service with Nuxt integration
export class ApiService {
  private baseURL: string
  private version: string
  
  constructor(baseURL: string = '/api', version: string = 'v1') {
    this.baseURL = baseURL
    this.version = version
  }

  private get versionedURL() {
    return `${this.baseURL}/${this.version}`
  }

  // Nuxt-integrated request with caching and offline support
  private async request<T>(
    endpoint: string, 
    options: FetchOptions = {}
  ): Promise<ApiResponse<T>> {
    // Check online status
    const isOnline = useOnline?.() ?? ref(true)
    if (!isOnline.value) {
      throw createError({ 
        statusCode: 503, 
        statusMessage: 'Service unavailable - offline' 
      })
    }

    try {
      const response = await $fetch<ApiResponse<T>>(`${this.versionedURL}${endpoint}`, {
        ...options,
        onRequestError({ error }) {
          console.error('Request error:', error)
          throw createError({
            statusCode: 0,
            statusMessage: 'Network error occurred'
          })
        },
        onResponseError({ response }) {
          console.error('Response error:', response.status, response.statusText)
          throw createError({
            statusCode: response.status,
            statusMessage: `API error: ${response.status}`
          })
        }
      })
      
      return response
    } catch (error) {
      if (error instanceof Error || error.statusCode) {
        throw error
      }
      throw createError({
        statusCode: 500,
        statusMessage: 'Unknown API error'
      })
    }
  }

  // Enhanced methods with Nuxt data fetching integration
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      params
    })
  }

  // Nuxt-optimized data fetching method
  useGet<T>(key: string, endpoint: string, params?: Record<string, any>) {
    return useLazyAsyncData(key, () => this.get<T>(endpoint, params), {
      server: false, // Client-side for dynamic content
      transform: (response: ApiResponse<T>) => response.data,
      default: () => null as T
    })
  }

  // Paginated requests with caching
  usePaginated<T>(
    key: string,
    endpoint: string, 
    page: number = 1, 
    limit: number = 10,
    params?: Record<string, any>
  ) {
    const cacheKey = `${key}-p${page}-l${limit}-${JSON.stringify(params)}`
    return useLazyAsyncData(cacheKey, () => 
      this.request<T[]>(endpoint, {
        method: 'GET',
        params: { page, limit, ...params }
      }), {
      server: false,
      default: () => ({ data: [], pagination: { page, limit, total: 0, totalPages: 0 } })
    })
  }

  // Standard CRUD operations
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data
    })
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE'
    })
  }
}

// Component-specific API service with Nuxt integration
export class ComponentApiService extends ApiService {
  constructor(version: string = 'v1') {
    super('/api/components', version)
  }

  // Nuxt-optimized data fetching
  useComponents(params?: { active?: boolean; search?: string }) {
    const key = `components-${JSON.stringify(params || {})}`
    return this.useGet<ComponentState[]>(key, '/', params)
  }

  useComponent(id: string) {
    return this.useGet<ComponentState>(`component-${id}`, `/${id}`)
  }

  usePaginatedComponents(page: number = 1, limit: number = 10, params?: any) {
    return this.usePaginated<ComponentState>('components', '/', page, limit, params)
  }

  // Real-time ready methods
  async subscribeToUpdates(callback: (data: ComponentState) => void): Promise<() => void> {
    // Future WebSocket/SSE implementation
    if (process.client && 'WebSocket' in window) {
      // Implementation would go here
      console.log('WebSocket subscription ready for implementation')
    }
    return () => {} // Unsubscribe function
  }

  // CRUD operations
  async createComponent(data: Omit<ComponentState, 'id'>): Promise<ApiResponse<ComponentState>> {
    return this.post<ComponentState>('/', data)
  }

  async updateComponent(id: string, data: Partial<ComponentState>): Promise<ApiResponse<ComponentState>> {
    return this.patch<ComponentState>(`/${id}`, data)
  }

  async deleteComponent(id: string): Promise<ApiResponse<null>> {
    return this.delete<null>(`/${id}`)
  }
}

// Export singleton instance
export const componentApi = new ComponentApiService()

// Simple composable for quick usage
export const useComponentApi = () => componentApi
```

### Enhanced API Client Configuration

```typescript
// plugins/api.client.ts
export default defineNuxtPlugin(() => {
  // Create enhanced $fetch instance
  const apiFetch = $fetch.create({
    baseURL: useRuntimeConfig().public.apiBase || '/api',
    
    // Request interceptor with version and auth support
    onRequest({ request, options }) {
      // Add version header for API evolution
      options.headers = {
        ...options.headers,
        'API-Version': 'v1',
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }

      // Add authentication if available
      const nuxtApp = useNuxtApp()
      if (nuxtApp.$auth?.token) {
        options.headers.Authorization = `Bearer ${nuxtApp.$auth.token}`
      }
    },
    
    // Enhanced error handling
    onResponseError({ request, response, options }) {
      // Handle authentication errors
      if (response.status === 401) {
        const nuxtApp = useNuxtApp()
        nuxtApp.$auth?.logout()
        navigateTo('/login')
        return
      }
      
      // Handle rate limiting
      if (response.status === 429) {
        throw createError({
          statusCode: 429,
          statusMessage: 'Too many requests - please slow down'
        })
      }
      
      // Handle API versioning errors
      if (response.status === 410) {
        throw createError({
          statusCode: 410,
          statusMessage: 'API version no longer supported'
        })
      }
      
      // Generic error handling
      const errorMessage = response._data?.message || `HTTP ${response.status}`
      throw createError({
        statusCode: response.status,
        statusMessage: errorMessage,
        data: response._data
      })
    }
  })

  // Make enhanced fetch available globally
  return {
    provide: {
      apiFetch
    }
  }
})
```

**Key Architecture Decisions:**
- **$fetch over Axios**: Uses Nuxt's built-in $fetch (ofetch) instead of Axios for better SSR compatibility and smaller bundle size
- **Class-based Services**: Organized, reusable API service pattern with inheritance
- **TypeScript First**: Full type safety with proper interface definitions and generic methods
- **Error Handling**: Comprehensive error handling with user-friendly messages and proper error boundaries
- **Authentication Ready**: Plugin structure supports token-based auth with automatic retry logic
- **SSR Compatible**: All API calls work seamlessly with Nuxt's SSR/hydration cycle
- **Caching Strategy**: Leverages Nuxt's built-in `useLazyAsyncData` for optimal caching
- **Offline Support**: Graceful degradation when network is unavailable
- **Versioning Support**: Built-in API versioning for future evolution

---

## 7. Routing

### Route Configuration

```typescript
// nuxt.config.ts - Enhanced routing configuration
export default defineNuxtConfig({
  // ... existing config
  
  // Enhanced routing options
  router: {
    options: {
      scrollBehaviorType: 'smooth',
      hashMode: false,
      strict: true
    }
  },
  
  // Content-driven routing
  content: {
    // Custom route generation for content
    sources: {
      content: {
        driver: 'fs',
        prefix: '/content',
        base: resolve(__dirname, 'content')
      }
    },
    navigation: {
      fields: ['title', 'description', 'published', 'tags']
    }
  },
  
  // Route rules for different content types
  routeRules: {
    // Homepage pre-rendered at build time
    '/': { prerender: true },
    
    // Blog posts generated on-demand and cached
    '/blog/**': { 
      ssr: true,
      headers: { 'cache-control': 's-maxage=31536000' }
    },
    
    // Admin routes are SPA only
    '/admin/**': { ssr: false },
    
    // API routes
    '/api/**': { cors: true, headers: { 'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE' } }
  }
})
```

### Route Protection & Navigation Guards

```typescript
// middleware/auth.ts
export default defineNuxtRouteMiddleware((to) => {
  const { $auth } = useNuxtApp()
  
  if (!$auth?.isAuthenticated) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication required'
    })
  }
})

// middleware/role.ts
export default defineNuxtRouteMiddleware((to) => {
  const { $auth } = useNuxtApp()
  const requiredRole = to.meta.requiresRole as string
  
  if (requiredRole && !$auth?.hasRole(requiredRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Insufficient permissions'
    })
  }
})

// pages/admin/index.vue - Protected route example
<script setup>
definePageMeta({
  middleware: ['auth', 'role'],
  requiresRole: 'admin',
  layout: 'admin'
})
</script>
```

### Dynamic Route Generation

```typescript
// composables/useNavigation.ts
export const useNavigation = () => {
  // Get structured navigation from Nuxt Content
  const { data: navigation } = useAsyncData('navigation', () => 
    fetchContentNavigation()
  )
  
  // Enhanced navigation with breadcrumbs
  const getBreadcrumbs = (path: string) => {
    const segments = path.split('/').filter(Boolean)
    return segments.map((segment, index) => ({
      title: segment.charAt(0).toUpperCase() + segment.slice(1),
      path: '/' + segments.slice(0, index + 1).join('/'),
      isActive: index === segments.length - 1
    }))
  }
  
  // Get related content
  const getRelatedContent = async (currentPath: string, limit: number = 5) => {
    const { data } = await queryContent()
      .where({ _path: { $ne: currentPath } })
      .only(['title', '_path', 'description', 'tags'])
      .limit(limit)
      .find()
    
    return data
  }
  
  return {
    navigation: readonly(navigation),
    getBreadcrumbs,
    getRelatedContent
  }
}

// pages/[...slug].vue - Dynamic content routing
<template>
  <div>
    <ccmBreadcrumbs :items="breadcrumbs" />
    <ContentDoc :path="$route.path" />
    <ccmRelatedContent :items="relatedContent" />
  </div>
</template>

<script setup>
const route = useRoute()
const { getBreadcrumbs, getRelatedContent } = useNavigation()

// Generate breadcrumbs
const breadcrumbs = computed(() => getBreadcrumbs(route.path))

// Load related content
const { data: relatedContent } = await useAsyncData(
  `related-${route.path}`,
  () => getRelatedContent(route.path)
)

// SEO meta
useHead({
  title: () => `${route.params.slug} | Your Site`,
  meta: [
    { name: 'description', content: 'Dynamic content description' }
  ]
})
</script>
```

**Key Architecture Decisions:**
- **File-based Routing**: Leverages Nuxt's automatic route generation from content files and page directory
- **Content-Driven**: Routes automatically generated from Markdown files in content directory
- **Middleware Layers**: Authentication and authorization at route level with composable patterns
- **Route Rules**: Different rendering strategies per route type (SSR, SPA, static)
- **SEO Optimized**: Automatic meta tag generation and structured navigation for search engines
- **Progressive Enhancement**: Routes work with and without JavaScript enabled

---

## 8. Styling Guidelines

### Styling Approach

Your project uses a **PostCSS + CSS Layers** approach with a well-organized architecture:

**Layer Hierarchy (from lowest to highest specificity):**
1. **reset** - CSS normalization and resets
2. **defaults** - Base typography, fonts, and CSS custom properties
3. **components** - Component-specific styles
4. **utils** - Utility classes for spacing, colors
5. **overrides** - Final overrides and exceptions

**Key Benefits:**
- **Predictable Cascade**: Layer order prevents specificity wars
- **PostCSS Processing**: Modern CSS features with broad browser support
- **CSS Custom Properties**: Dynamic theming and component customization
- **No Build Dependencies**: Pure CSS approach, no Sass/Less/Styled-components complexity
- **Performance**: No runtime CSS-in-JS overhead

### Global Theme Variables

```css
/* public/css/vars/theme-system.css */
:root {
  /* Color System - HSL for better manipulation */
  --base-hsl: 220, 13%, 18%;
  --base-color: hsl(var(--base-hsl));
  
  --primary-hsl: 214, 84%, 56%;
  --primary-color: hsl(var(--primary-hsl));
  
  --secondary-hsl: 45, 100%, 51%;
  --secondary-color: hsl(var(--secondary-hsl));
  
  --tertiary-hsl: 342, 75%, 51%;
  --tertiary-color: hsl(var(--tertiary-hsl));
  
  --accent-hsl: 159, 64%, 52%;
  --accent-color: hsl(var(--accent-hsl));
  
  --white-hsl: 0, 0%, 100%;
  --white-color: hsl(var(--white-hsl));
  
  /* Semantic Colors */
  --success-hsl: 142, 76%, 36%;
  --success-color: hsl(var(--success-hsl));
  
  --warning-hsl: 38, 92%, 50%;
  --warning-color: hsl(var(--warning-hsl));
  
  --error-hsl: 0, 84%, 60%;
  --error-color: hsl(var(--error-hsl));
  
  /* Typography Scale - Fluid responsive */
  --font-size-xs: clamp(0.694rem, 0.12vw + 0.669rem, 0.75rem);
  --font-size-s: clamp(0.833rem, 0.23vw + 0.787rem, 0.938rem);
  --font-size-m: clamp(1rem, 0.4vw + 0.925rem, 1.175rem);
  --font-size-l: clamp(1.2rem, 0.63vw + 1.088rem, 1.469rem);
  --font-size-xl: clamp(1.44rem, 0.96vw + 1.275rem, 1.836rem);
  --font-size-xxl: clamp(1.728rem, 1.42vw + 1.491rem, 2.295rem);
  
  /* Spacing Scale - Modular scale based on 1rem */
  --space-3xs: clamp(0.25rem, 0.1vw + 0.225rem, 0.3125rem);
  --space-2xs: clamp(0.5rem, 0.2vw + 0.45rem, 0.625rem);
  --space-xs: clamp(0.75rem, 0.3vw + 0.675rem, 0.9375rem);
  --space-s: clamp(1rem, 0.4vw + 0.9rem, 1.25rem);
  --space-m: clamp(1.5rem, 0.6vw + 1.35rem, 1.875rem);
  --space-l: clamp(2rem, 0.8vw + 1.8rem, 2.5rem);
  --space-xl: clamp(3rem, 1.2vw + 2.7rem, 3.75rem);
  --space-2xl: clamp(4rem, 1.6vw + 3.6rem, 5rem);
  --space-3xl: clamp(6rem, 2.4vw + 5.4rem, 7.5rem);
  
  /* Layout and Grid */
  --content-max-width: 75rem;
  --content-padding: var(--space-m);
  --border-radius-s: 0.25rem;
  --border-radius-m: 0.5rem;
  --border-radius-l: 1rem;
  
  /* Shadows - Layered depth system */
  --shadow-s: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-m: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12);
  --shadow-l: 0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10);
  --shadow-xl: 0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05);
  
  /* Interactive States */
  --focus-ring: 0 0 0 3px hsl(var(--primary-hsl), 0.3);
  --transition-fast: 150ms ease-out;
  --transition-base: 250ms ease-out;
  --transition-slow: 350ms ease-out;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  :root {
    --base-hsl: 220, 13%, 82%;
    --base-color: hsl(var(--base-hsl));
    
    /* Adjust other colors for dark mode */
    --primary-hsl: 214, 84%, 65%;
    --secondary-hsl: 45, 100%, 60%;
    
    /* Invert shadows for dark backgrounds */
    --shadow-s: 0 1px 3px rgba(0, 0, 0, 0.24), 0 1px 2px rgba(0, 0, 0, 0.48);
    --shadow-m: 0 3px 6px rgba(0, 0, 0, 0.30), 0 2px 4px rgba(0, 0, 0, 0.24);
  }
}

/* High contrast preference */
@media (prefers-contrast: high) {
  :root {
    --primary-hsl: 214, 100%, 50%;
    --secondary-hsl: 45, 100%, 40%;
    --border-width: 2px;
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0ms;
    --transition-base: 0ms;
    --transition-slow: 0ms;
  }
  
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Future Implementation Notes

**Stakeholder-Driven Enhancements for Future Iterations:**

```css
/* FUTURE: Designer-friendly utilities (public/css/utils/design-utils.css) */
@layer utils {
  /* Debug utilities for designers */
  .debug-grid { outline: 1px solid red; }
  .debug-spacing { background: rgba(255, 0, 0, 0.1); }
  .design-mode { border: 2px dashed var(--accent-color); }
  
  /* Rapid prototyping utilities */
  .prototype-spacing-xs { padding: var(--space-xs); }
  .prototype-spacing-s { padding: var(--space-s); }
  .prototype-spacing-m { padding: var(--space-m); }
}

/* FUTURE: Content editor overrides (public/css/content-overrides.css) */
@layer overrides {
  .content-special .prose h1 {
    --_heading-color: var(--accent-color);
    --_heading-size: var(--font-size-xxl);
  }
  
  .content-wide { --_content-max-width: 90rem; }
  .content-narrow { --_content-max-width: 45rem; }
}

/* FUTURE: Component-specific custom property patterns */
.ccm-complex-component {
  /* Establish local component variables */
  --_component-bg: var(--surface-color, var(--base-color));
  --_component-text: var(--on-surface-color, var(--white-color));
  --_component-radius: var(--border-radius-m);
}
```

**Stakeholder Action Items for Future Iterations:**

- **📋 For Designers**: Create interactive style guide with live CSS custom property editing capabilities
- **⚙️ For Developers**: Implement CSS layer validation tools and ESLint rules for consistent token usage
- **📊 For PMs**: Establish design review process including automated token consistency checks
- **🔧 For DevOps**: Add CSS build optimization pipeline with critical CSS extraction
- **📝 For Content Team**: Document content style override patterns and CMS integration guidelines

**Architecture Highlights:**
- **HSL Color System**: Easier manipulation for variants and opacity changes
- **Fluid Typography**: `clamp()` for responsive text scaling across all devices
- **Modular Spacing**: Consistent scale across all components and layouts
- **Accessibility First**: Respects user preferences (dark mode, contrast, motion)
- **CSS Custom Properties**: Runtime theming without JavaScript dependencies
- **Layer Organization**: Predictable specificity without `!important` usage
- **PostCSS Integration**: Modern CSS features with automatic fallbacks for older browsers

---

## 9. Testing Requirements

### Component Test Template

```typescript
// tests/components/ccmButton.test.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import ccmButton from '~/components/ccmButton.vue'

// Mock Nuxt composables
mockNuxtImport('useNuxtApp', () => {
  return () => ({
    $router: { push: vi.fn() }
  })
})

describe('ccmButton', () => {
  it('renders button with default props', () => {
    const wrapper = mount(ccmButton, {
      props: {
        label: 'Test Button'
      }
    })
    
    expect(wrapper.text()).toContain('Test Button')
    expect(wrapper.find('button').exists()).toBe(true)
  })

  it('renders as NuxtLink when "to" prop is provided', () => {
    const wrapper = mount(ccmButton, {
      props: {
        label: 'Link Button'
      },
      attrs: {
        to: '/test-page'
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a :to="to"><slot /></a>',
            props: ['to']
          }
        }
      }
    })
    
    expect(wrapper.find('a').exists()).toBe(true)
  })

  it('applies correct CSS classes based on props', () => {
    const wrapper = mount(ccmButton, {
      props: {
        label: 'Styled Button',
        variant: 'primary',
        size: 'l',
        color: 'accent'
      }
    })
    
    const button = wrapper.find('button')
    expect(button.attributes('variant')).toBe('primary')
    expect(button.attributes('size')).toBe('l')
    expect(button.attributes('color')).toBe('accent')
  })

  it('handles click events', async () => {
    const wrapper = mount(ccmButton, {
      props: {
        label: 'Click Me'
      }
    })
    
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('is disabled when disabled prop is true', () => {
    const wrapper = mount(ccmButton, {
      props: {
        label: 'Disabled Button'
      },
      attrs: {
        disabled: true
      }
    })
    
    expect(wrapper.find('span').exists()).toBe(true) // Renders as span when disabled
  })

  it('supports icon display', () => {
    const wrapper = mount(ccmButton, {
      props: {
        label: 'Icon Button',
        iconBefore: 'home',
        iconAfter: 'arrow_forward'
      }
    })
    
    const button = wrapper.find('button')
    expect(button.attributes('icon-before')).toBe('home')
    expect(button.attributes('icon-after')).toBe('arrow_forward')
  })
})

// Integration test with Pinia store
describe('ccmButton with store integration', () => {
  it('interacts with store correctly', async () => {
    const { $pinia } = useNuxtApp()
    const store = useComponentStore($pinia)
    
    const wrapper = mount(ccmButton, {
      props: {
        label: 'Store Button',
        value: 'test-component'
      }
    })
    
    await wrapper.find('button').trigger('click')
    
    // Assert store state changes
    expect(store.currentItemId).toBe('test-component')
  })
})
```

### Testing Best Practices

**Comprehensive Testing Strategy:**

1. **Unit Tests**: Test individual components in isolation using Vitest + Vue Test Utils
2. **Integration Tests**: Test component interactions with stores, composables, and APIs  
3. **E2E Tests**: Test critical user flows using Playwright (recommended for Nuxt 3)
4. **Visual Regression Tests**: Test component visual consistency across changes
5. **Accessibility Tests**: Test keyboard navigation, screen reader compatibility, WCAG compliance
6. **Performance Tests**: Test component render performance and memory usage

**Test Structure Guidelines:**
- **Arrange-Act-Assert Pattern**: Clear test organization with setup, action, and verification
- **Mock External Dependencies**: API calls, router navigation, authentication, third-party services
- **Test User Interactions**: Click events, form submissions, keyboard navigation, touch gestures  
- **Accessibility Testing**: Screen reader compatibility, keyboard-only navigation, ARIA attributes
- **Edge Case Coverage**: Error states, loading states, empty states, offline scenarios
- **Cross-Browser Validation**: Test critical paths across Chrome, Firefox, Safari, Edge

**Testing Configuration:**
```typescript
// vitest.config.ts
import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    setupFiles: ['./tests/setup.ts']
  }
})

// tests/setup.ts
import { vi } from 'vitest'

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks()
})

// Mock Material Symbols font for tests
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    fontFamily: 'Material Symbols Outlined'
  })
})
```

---

## 10. Environment Configuration

### Required Environment Variables

```bash
# .env.example - Template for all environments

# =============================================================================
# APPLICATION CONFIGURATION
# =============================================================================

# Application URL (used for SSR, meta tags, and API calls)
NUXT_PUBLIC_APP_URL=http://localhost:3000

# App environment (development, staging, production)
NUXT_ENV=development

# =============================================================================
# API CONFIGURATION  
# =============================================================================

# API base URL for server-side calls
NUXT_API_BASE_URL=http://localhost:3000/api

# Public API base URL for client-side calls  
NUXT_PUBLIC_API_BASE_URL=/api

# API version for versioned endpoints
NUXT_PUBLIC_API_VERSION=v1

# API rate limiting (requests per minute)
NUXT_API_RATE_LIMIT=60

# =============================================================================
# CONTENT MANAGEMENT
# =============================================================================

# Nuxt Content configuration
NUXT_CONTENT_BASE_URL=/content

# Enable content indexing for search
NUXT_PUBLIC_CONTENT_SEARCH_ENABLED=true

# Content cache TTL in seconds (3600 = 1 hour)
NUXT_CONTENT_CACHE_TTL=3600

# =============================================================================
# THIRD-PARTY INTEGRATIONS
# =============================================================================

# Google Analytics Measurement ID
NUXT_PUBLIC_GOOGLE_ANALYTICS_ID=

# Vimeo API configuration (for video components)
NUXT_PUBLIC_VIMEO_API_KEY=
NUXT_VIMEO_CLIENT_SECRET=

# YouTube API configuration  
NUXT_PUBLIC_YOUTUBE_API_KEY=

# =============================================================================
# SECURITY CONFIGURATION
# =============================================================================

# JWT secret for authentication (generate with: openssl rand -base64 32)
NUXT_JWT_SECRET=

# Session secret for server-side sessions
NUXT_SESSION_SECRET=

# CORS allowed origins (comma-separated)
NUXT_CORS_ORIGINS=http://localhost:3000

# Content Security Policy nonce
NUXT_CSP_NONCE=

# =============================================================================
# DATABASE & CACHE (if applicable)
# =============================================================================

# Database connection string
NUXT_DATABASE_URL=

# Redis URL for caching/sessions
NUXT_REDIS_URL=

# =============================================================================
# EMAIL & NOTIFICATIONS  
# =============================================================================

# Email service configuration
NUXT_EMAIL_SERVICE_API_KEY=
NUXT_EMAIL_FROM_ADDRESS=noreply@yoursite.com

# =============================================================================
# MONITORING & ANALYTICS
# =============================================================================

# Error tracking (Sentry, Bugsnag, etc.)
NUXT_PUBLIC_SENTRY_DSN=

# Performance monitoring
NUXT_PUBLIC_PERFORMANCE_MONITORING=false

# =============================================================================
# DEVELOPMENT & DEBUGGING
# =============================================================================

# Enable detailed error reporting in development
NUXT_DEBUG=false

# Enable Vue DevTools in production builds
NUXT_PUBLIC_VUE_DEVTOOLS=false

# Log level (silent, error, warn, info, debug, trace)
NUXT_LOG_LEVEL=info
```

### Environment Management Utilities

```typescript
// utils/env.ts
interface EnvironmentConfig {
  isDevelopment: boolean
  isProduction: boolean
  isTest: boolean
  apiUrl: string
  appUrl: string
  logLevel: string
}

export const useEnvironment = (): EnvironmentConfig => {
  const config = useRuntimeConfig()
  
  return {
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production', 
    isTest: process.env.NODE_ENV === 'test',
    apiUrl: config.public.apiBaseUrl,
    appUrl: config.public.appUrl,
    logLevel: process.env.NUXT_LOG_LEVEL || 'info'
  }
}

// Composable for feature flags
export const useFeatureFlags = () => {
  const config = useRuntimeConfig()
  
  return {
    contentSearchEnabled: config.public.contentSearchEnabled,
    performanceMonitoring: config.public.performanceMonitoring,
    analyticsEnabled: !!config.public.googleAnalyticsId,
    errorTrackingEnabled: !!config.public.sentryDsn
  }
}

// Environment validation utility
export const validateEnvironment = () => {
  const requiredEnvVars = [
    'NUXT_PUBLIC_APP_URL',
    'NUXT_JWT_SECRET'
  ]
  
  const missingVars = requiredEnvVars.filter(
    envVar => !process.env[envVar]
  )
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    )
  }
}
```

**Key Conventions:**
- **`NUXT_`** prefix for server-side only variables
- **`NUXT_PUBLIC_`** prefix for client-accessible variables  
- **Validation on startup** to catch configuration issues early
- **Environment-specific overrides** in nuxt.config.ts
- **Feature flags** for progressive rollouts and A/B testing
- **Security by default** - secrets never exposed to client

---

## 11. Frontend Developer Standards

### Critical Coding Rules

#### **Universal Rules:**

1. **NEVER use `any` type in TypeScript** - Always define proper interfaces
2. **NEVER mutate props directly** - Use `v-model` or emit events for data flow
3. **NEVER import from `/node_modules` directly** - Use auto-imports or proper module paths
4. **NEVER use `!important` in CSS** - Leverage CSS layers and specificity properly
5. **NEVER commit secrets** - Use environment variables and `.env.local` for sensitive data
6. **NEVER use `innerHTML` or `v-html` with user content** - Risk of XSS attacks
7. **NEVER skip accessibility attributes** - Include ARIA labels, semantic HTML, focus management

#### **Nuxt 3 Specific Rules:**

8. **NEVER use `document` or `window` without `process.client` check** - SSR compatibility
9. **NEVER import Vue functions unnecessarily** - Use Nuxt's auto-imports (`ref`, `computed`, `reactive`)
10. **NEVER use `asyncData` or `fetch`** - Use `useAsyncData` or `useLazyAsyncData` instead
11. **NEVER call composables outside setup()** - Move to component setup or plugin
12. **NEVER use `this.$` syntax** - Use Composition API patterns instead
13. **NEVER ignore hydration mismatches** - Check SSR vs client rendering consistency
14. **NEVER use `nuxtApp.hook` in components** - Use plugins or middleware for app-level hooks

#### **Component Architecture Rules:**

15. **ALWAYS prefix components with `ccm`** - Follow established naming convention
16. **ALWAYS use `defineProps<Interface>()` with TypeScript** - Type-safe props definition  
17. **ALWAYS emit events instead of calling parent methods** - Maintain component boundaries
18. **ALWAYS use CSS custom properties for theming** - Leverage the established design token system
19. **ALWAYS handle loading and error states** - User experience consistency
20. **ALWAYS use `readonly()` for exposed store state** - Prevent direct mutations

#### **Performance Rules:**

21. **NEVER load all content at once** - Use pagination, lazy loading, and virtual scrolling
22. **NEVER import large libraries in components** - Use dynamic imports or plugins
23. **NEVER use watchers for computed values** - Use `computed()` instead of `watch()`
24. **NEVER forget to cleanup event listeners** - Use `onUnmounted()` for cleanup
25. **ALWAYS use `useLazyAsyncData` for non-critical data** - Better initial page load

#### **CSS Layer Rules:**

26. **NEVER add styles outside the layer system** - Maintain cascade predictability
27. **NEVER use scoped styles with CSS layers** - Conflicts with global layer methodology  
28. **ALWAYS use CSS custom properties for component variants** - Follow established patterns
29. **ALWAYS test dark mode and high contrast** - Respect user preferences
30. **NEVER hardcode colors, spacing, or typography** - Use design tokens

### Quick Reference

#### **Development Commands:**
```bash
# Start development server
npm run dev

# Build for production  
npm run build

# Preview production build
npm run preview

# Generate static site
npm run generate

# Run tests
npm test

# Type checking (if configured)
npm run typecheck

# Linting (using Nuxt ESLint)
npx eslint .
```

#### **Key Import Patterns:**
```typescript
// ✅ CORRECT - Auto-imported composables
const route = useRoute()
const router = useRouter() 
const config = useRuntimeConfig()
const { data } = await useLazyAsyncData('key', fetcher)

// ✅ CORRECT - Component imports (auto-imported)
// Just use <ccmButton> in template

// ✅ CORRECT - Store imports
const store = useComponentStore()

// ✅ CORRECT - Type imports
import type { ComponentState } from '~/types/component'

// ❌ WRONG - Manual Vue imports (auto-imported)
import { ref, computed } from 'vue'

// ❌ WRONG - Direct node_modules imports
import axios from 'axios' // Use $fetch instead
```

#### **Project-Specific Patterns:**

**Component Creation Pattern:**
```vue
<template>
  <component :is="elementType" :class="classes" v-bind="$attrs">
    <slot />
  </component>
</template>

<script setup lang="ts">
// 1. Define props interface
interface Props {
  variant?: 'primary' | 'secondary'
  size?: 's' | 'm' | 'l'
}

// 2. Define props with defaults
const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'm'
})

// 3. Computed properties for dynamic behavior
const elementType = computed(() => {
  // Logic for dynamic element type
})

const classes = computed(() => [
  'ccm-component-name',
  `ccm-component-name--${props.variant}`,
  `ccm-component-name--${props.size}`
])
</script>
```

**Store Usage Pattern:**
```typescript
// In component
const store = useComponentStore()

// ✅ CORRECT - Use store getters
const items = store.activeItems

// ✅ CORRECT - Use store actions  
await store.fetchItems()

// ❌ WRONG - Direct state mutation
store.items.push(newItem) // Use store.addItem() instead
```

**CSS Custom Property Pattern:**
```css
.ccm-component-name {
  /* Define local custom properties */
  --_component-bg: var(--surface-color, var(--base-color));
  --_component-text: var(--on-surface-color, var(--white-color));
  
  /* Apply to properties */
  background-color: var(--_component-bg);
  color: var(--_component-text);
}
```

---

## Summary

This Frontend Architecture Document establishes a comprehensive foundation for the **ccm-website-7** project using **Nuxt 3 + Vue 3** with sophisticated CSS Layer methodology. 

**Key Architectural Strengths:**
- **Modern Framework Stack**: Nuxt 3 with Vue 3 Composition API and TypeScript
- **Content-Driven Approach**: Nuxt Content for seamless content management
- **Advanced CSS Architecture**: CSS Layers with PostCSS for maintainable styling
- **Performance Optimized**: SSR/SSG capabilities with smart caching strategies
- **Developer Experience**: Auto-imports, type safety, and comprehensive tooling
- **Future-Proof Design**: Extensible patterns for scaling team and features
- **Accessibility Compliant**: WCAG 2.1 AA standards integration
- **SEO Optimized**: Search engine performance built-in
- **LLM Ready**: Documentation optimized for AI consumption and generation

**Implementation Ready**: All sections include practical templates, examples, and established patterns that align with your existing codebase architecture.

**Related Documentation:**
- **Project Brief**: Complete project overview in `docs/brief/`
- **Component Specifications**: Detailed component specs in `docs/components-spec.md`
- **Accessibility Standards**: WCAG compliance guide in `docs/accessibility-standards.md`
- **Documentation Standards**: LLM-optimized docs in `docs/documentation-standards.md`
- **SEO Optimization**: Search engine standards in `docs/seo-optimization.md`

**Next Steps**: This document serves as the definitive guide for AI tools, developers, and stakeholders working on the frontend architecture of your project.

---

🏗️ **Document Generated by Winston, Architect Agent**  
*Holistic System Architect & Full-Stack Technical Leader*