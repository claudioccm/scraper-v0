# Custom Components Guide for Nuxt Content

## Overview

This guide demonstrates how to create and use custom Vue components within Nuxt Content markdown files using MDC (Markdown with Vue Components) syntax.

## Sample Components

### 1. Callout Component

A simple notification component with one attribute example.

#### Usage Example

**Basic Callout:**
```markdown
::callout{type="info"}
This is a simple informational message.
::
```

### 2. Feature Card Component

A flexible card component for highlighting features, services, or content sections.

#### Usage Examples

**Basic Feature Card:**
```markdown
::feature-card{title="Fast Performance" icon="i-heroicons-bolt"}
Lightning-fast loading times with optimized assets and modern web standards.
::

```

**Horizontal Layout with Image:**
```markdown
::feature-card{title="Visual Design" icon="i-heroicons-paint-brush" layout="horizontal" image="/images/design-tools.jpg"}
Our design system provides consistent visual language across all platforms and devices.
::

```

**Compact Card with Badge:**
```markdown
::feature-card{title="New Feature" icon="i-heroicons-star" compact=true badge="Beta"}
This exciting new feature is now available in beta for early adopters.
::

```

**Card with Subtitle and Actions:**
```markdown
::feature-card{title="Advanced Analytics" subtitle="Track your performance" icon="i-heroicons-chart-bar"}
Get detailed insights into your website's performance with our comprehensive analytics dashboard.

#actions
::button{href="/analytics"} View Dashboard ::
::button{href="/docs/analytics" variant="outline"} Learn More ::
::
```

**Card with Custom Icon Slot:**
```markdown
::feature-card{title="Custom Integration" subtitle="Build your own solutions"}

#icon
:heroicons-wrench-screwdriver:

Create custom integrations tailored to your specific business needs.
::

```

## Component API Reference

### Callout Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | String | `'info'` | Component type (example attribute) |

### Callout Slots

| Slot | Description |
|------|-------------|
| `default` | Main content of the callout |

### Feature Card Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | String | `''` | Card title |
| `subtitle` | String | `''` | Optional subtitle |
| `icon` | String | `''` | Icon name |
| `iconClass` | String | `'w-6 h-6'` | Icon CSS classes |
| `image` | String | `''` | Image source URL |
| `imageAlt` | String | `''` | Image alt text |
| `badge` | String | `''` | Badge/label text |
| `layout` | String | `'vertical'` | Layout: `vertical`, `horizontal` |
| `hover` | Boolean | `true` | Enable hover effects |
| `compact` | Boolean | `false` | Use compact styling |

### Feature Card Slots

| Slot | Description |
|------|-------------|
| `default` | Main content of the card |
| `header` | Custom header content (replaces title section) |
| `icon` | Custom icon content |
| `media` | Custom media content (replaces image) |
| `footer` | Custom footer content |
| `actions` | Action buttons or links |

## Advanced Usage Patterns

### Conditional Rendering

```markdown
::callout{type="warning" title="Browser Support"}
This feature requires a modern browser with ES6 support.

{{ $doc.browserRequirements || 'No specific requirements noted.' }}
::
```

### Data Binding

```markdown
---
features:
  - name: "Fast"
    icon: "bolt"
    description: "Lightning fast"
  - name: "Secure"
    icon: "shield"
    description: "Bank-level security"
---

# Our Features

{{ $doc.features.map(feature => `
::feature-card{title="${feature.name}" icon="i-heroicons-${feature.icon}"}
${feature.description}
::
`).join('') }}
```

### Interactive Components

```markdown
::callout{type="info" title="Live Demo"}

#actions
:button{@click="showDemo = !showDemo" :label="showDemo ? 'Hide Demo' : 'Show Demo'"}

{{ showDemo ? '🎉 Demo is visible!' : 'Click the button to see the demo.' }}
::
```

## Component File Structure

```
components/
├── content/
│   ├── Callout.vue       # Alert/notification component
│   ├── FeatureCard.vue   # Feature highlight card
│   └── ...               # Other custom components
```

## Best Practices

### 1. Component Naming
- Use PascalCase for component names
- Keep names descriptive but concise
- Follow Vue.js naming conventions

### 2. Props Design
- Provide sensible defaults
- Use TypeScript for better DX
- Include prop validation where appropriate
- Document all props in component comments

### 3. Slot Usage
- Use named slots for complex layouts
- Provide fallback content for optional slots
- Document slot purposes clearly

### 4. Styling
- Use scoped styles to avoid conflicts
- Leverage CSS custom properties for theming
- Include responsive design considerations
- Use CSS-in-JS or utility classes for consistency

### 5. Performance
- Use `v-memo` for expensive operations
- Implement lazy loading for heavy components
- Optimize re-renders with computed properties

## Example: Complete Case Study

See `content/case-studies/project-alpha.md` for a comprehensive example of using multiple custom components in a real case study.

## Integration with Nuxt UI

These components work seamlessly with Nuxt UI components:

```markdown
::callout{type="info" title="Nuxt UI Integration"}

#actions
:UButton{label="Primary Action" color="primary"}
:UButton{label="Secondary" variant="outline"}
::
```

## Troubleshooting

### Common Issues

1. **Component Not Found**: Ensure component files are in `components/content/`
2. **Props Not Working**: Check prop names and types match component definition
3. **Styling Issues**: Verify scoped styles aren't conflicting
4. **Slot Content**: Make sure slot syntax is correct (`#slot-name` or default content)

### Debug Tips

```vue
<!-- Add debug information -->
<script setup>
const componentData = {
  type: 'info',
  title: 'Debug Info',
  props: $props,
  slots: $slots
}
</script>

<!-- Display debug info -->
<pre>{{ JSON.stringify(componentData, null, 2) }}</pre>
```

## Migration from v2

If migrating from Nuxt Content v2:

1. **Update Component Location**: Move from `components/` to `components/content/`
2. **Update Import Paths**: Remove explicit imports (auto-imported now)
3. **Update Prop Syntax**: Use new MDC syntax for props
4. **Update Slot Syntax**: Use `#slot-name` instead of `v-slot:slot-name`

This guide provides a solid foundation for creating custom components in Nuxt Content. Experiment with different combinations and create components that match your design system!
