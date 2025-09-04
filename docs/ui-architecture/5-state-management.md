# 5. State Management

## Store Structure

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

## Enhanced State Management Template

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
