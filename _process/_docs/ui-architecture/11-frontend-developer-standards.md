# 11. Frontend Developer Standards

## Critical Coding Rules

### **Universal Rules:**

1. **NEVER use `any` type in TypeScript** - Always define proper interfaces
2. **NEVER mutate props directly** - Use `v-model` or emit events for data flow
3. **NEVER import from `/node_modules` directly** - Use auto-imports or proper module paths
4. **NEVER use `!important` in CSS** - Leverage CSS layers and specificity properly
5. **NEVER commit secrets** - Use environment variables and `.env.local` for sensitive data
6. **NEVER use `innerHTML` or `v-html` with user content** - Risk of XSS attacks
7. **NEVER skip accessibility attributes** - Include ARIA labels, semantic HTML, focus management

### **Nuxt 3 Specific Rules:**

8. **NEVER use `document` or `window` without `process.client` check** - SSR compatibility
9. **NEVER import Vue functions unnecessarily** - Use Nuxt's auto-imports (`ref`, `computed`, `reactive`)
10. **NEVER use `asyncData` or `fetch`** - Use `useAsyncData` or `useLazyAsyncData` instead
11. **NEVER call composables outside setup()** - Move to component setup or plugin
12. **NEVER use `this.$` syntax** - Use Composition API patterns instead
13. **NEVER ignore hydration mismatches** - Check SSR vs client rendering consistency
14. **NEVER use `nuxtApp.hook` in components** - Use plugins or middleware for app-level hooks

### **Component Architecture Rules:**

15. **ALWAYS prefix components with `ccm`** - Follow established naming convention
16. **ALWAYS use `defineProps<Interface>()` with TypeScript** - Type-safe props definition  
17. **ALWAYS emit events instead of calling parent methods** - Maintain component boundaries
18. **ALWAYS use CSS custom properties for theming** - Leverage the established design token system
19. **ALWAYS handle loading and error states** - User experience consistency
20. **ALWAYS use `readonly()` for exposed store state** - Prevent direct mutations

### **Performance Rules:**

21. **NEVER load all content at once** - Use pagination, lazy loading, and virtual scrolling
22. **NEVER import large libraries in components** - Use dynamic imports or plugins
23. **NEVER use watchers for computed values** - Use `computed()` instead of `watch()`
24. **NEVER forget to cleanup event listeners** - Use `onUnmounted()` for cleanup
25. **ALWAYS use `useLazyAsyncData` for non-critical data** - Better initial page load

### **CSS Layer Rules:**

26. **NEVER add styles outside the layer system** - Maintain cascade predictability
27. **NEVER use scoped styles with CSS layers** - Conflicts with global layer methodology  
28. **ALWAYS use CSS custom properties for component variants** - Follow established patterns
29. **ALWAYS test dark mode and high contrast** - Respect user preferences
30. **NEVER hardcode colors, spacing, or typography** - Use design tokens

## Quick Reference

### **Development Commands:**
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

### **Key Import Patterns:**
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

### **Project-Specific Patterns:**

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
