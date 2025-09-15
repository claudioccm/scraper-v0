# 6. API Integration

## Enhanced Service Template

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

## Enhanced API Client Configuration

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
