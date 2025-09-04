# 9. Testing Requirements

## Component Test Template

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

## Testing Best Practices

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
