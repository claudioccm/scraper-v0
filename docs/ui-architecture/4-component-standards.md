# 4. Component Standards

## Component Template

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

## Naming Conventions

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

**Architecture Decisions:**
- **Dynamic Component Rendering**: Uses `<component :is>` for flexible element types
- **CSS Custom Properties**: Leverages CSS variables for theming and customization
- **Composition API**: Uses `<script setup>` syntax with TypeScript
- **Global CSS Architecture**: Mix of component styles in global CSS layer system
- **Material Icons**: Integration with Google Material Symbols font

---
