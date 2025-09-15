# 7. Routing

## Route Configuration

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

## Route Protection & Navigation Guards

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

## Dynamic Route Generation

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
