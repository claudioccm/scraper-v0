<template>
  <component
    :is="componentTag"
    class="button"
    :style="cssVars"
    :to="to"
    :href="href"
    :disabled="disabled"
    :aria-label="computedAriaLabel"
    :aria-pressed="computedAriaPressed"
    :aria-expanded="computedAriaExpanded"
    v-bind="$attrs"
    :variant="variant"
    :color="color"
    :size="size"
    :backgroundColor="backgroundColor"
  >
    <slot>{{ label }}</slot>
  </component>
</template>

<script setup>
import { computed, resolveComponent } from 'vue'

const props = defineProps({
  // Structural props
  is: { type: String, default: 'button' },
  to: { type: [String, Object], default: null },
  href: { type: String, default: null },

  // Visual props
  label: { type: String, default: 'Button' },
  size: { type: String, default: 'm' },
  color: { type: String, default: 'base' },
  backgroundColor: { type: String, default: 'transparent' },
  variant: { type: String, default: 'primary' },

  // Accessibility props
  ariaLabel: { type: String, default: null },
  isPressed: { type: Boolean, default: null },
  isExpanded: { type: Boolean, default: null },
  disabled: { type: Boolean, default: false }
})

const componentTag = computed(() => {
  if (props.to) return resolveComponent('NuxtLink')
  if (props.href) return 'a'
  return props.is
})

const cssVars = computed(() => ({
  // '--_button-padding-block': `var(--space-${props.size})`,
  // '--_button-padding-inline': `var(--space-${props.size})`,
  // '--_button-color': `var(--color-${props.color})`,
  // '--_button-background-color': `var(--${props.backgroundColor})`
}))

// Resolve the final URL (href or to)
const router = useRouter()
const resolvedHref = computed(() => {
  if (props.href) return props.href
  if (props.to) {
    if (typeof props.to === 'string') return props.to
    try {
      return router.resolve(props.to).href
    } catch {
      return null
    }
  }
  return null
})

function humanizeUrl(url) {
  try {
    const u = new URL(url, 'http://example.local')
    const path = u.pathname || ''
    const last = path.split('/').filter(Boolean).pop() || u.hostname || ''
    const text = decodeURIComponent((last || '').replace(/[-_]+/g, ' ').trim())
    if (!text) return 'link'
    return text.charAt(0).toUpperCase() + text.slice(1)
  } catch {
    const fallback = decodeURIComponent((url || '').replace(/[-_]+/g, ' ').trim())
    return fallback ? fallback.charAt(0).toUpperCase() + fallback.slice(1) : 'link'
  }
}

// Accessibility fallbacks
const computedAriaLabel = computed(() => {
  if (props.ariaLabel) return props.ariaLabel
  if (props.label) return props.label
  const url = resolvedHref.value
  return url ? `Go to ${humanizeUrl(url)}` : null
})

const computedAriaPressed = computed(() => {
  // Only set when explicitly provided; otherwise omit attribute
  return props.isPressed === null ? null : props.isPressed
})

const computedAriaExpanded = computed(() => {
  // Only set when explicitly provided; otherwise omit attribute
  return props.isExpanded === null ? null : props.isExpanded
})
</script>

<style>
.button {
  /* Structure */
  display: inline-block;
  zoom: 1;
  line-height: 1;
  white-space: nowrap;
  vertical-align: middle;
  text-align: center;
  cursor: pointer;
  -webkit-user-drag: none;
  user-select: none;
  box-sizing: border-box;
  text-decoration: none;
  align-self: self-start;
  justify-self: flex-start;
  border: var(--_button-border-width) var(--_button-border-style) var(--_button-border-color);
  cursor: pointer;
}

.button:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.button {
  --_button-border-width: 2px;
  --_button-border-style: solid;
  --_button-border-color: transparent;
  --_button-border-radius: 8px;
  --_button-font-family: var(--font-family-base);
  --_button-font-weight: var(--font-weight-bold);
  --_button-font-size: 100%;
  --_button-color: var(--_button-color);
  --_button-background-color: var(--_button-background-color);

  color: var(--_button-color);
  background-color: var(--_button-background-color);
  padding-block: var(--_button-padding-block);
  padding-inline: var(--_button-padding-inline);
  border-radius: var(--_button-border-radius, 8px);
  font-family: var(--_button-font-family);
  font-weight: var(--_button-font-weight);
  font-size: var(--_button-font-size, 100%);
  border-width: var(--_button-border-width);
  border-style: var(--_button-border-style);
  border-color: var(--_button-border-color);

  transition: all 0.2s ease-in-out;
}

.button:hover {
  background-color: color-mix(in srgb, var(--_button-color) 90%, black 10%);
  color: var(--_button-color);
  border-color: transparent;
  transform: scale(1.05);
}

/* Button size */
.button[size='s'] {
  --_button-font-size: var(--size--1);
  --_button-padding-block: calc(var(--space-3xs) - 1px) calc(var(--space-3xs) + 1px);
  --_button-padding-inline: var(--space-2xs);
}

.button[size='m'],
.button {
  --_button-font-size: var(--size-0);
  --_button-padding-block: calc(var(--space-xs) - 1px) calc(var(--space-xs) + 1px);
  --_button-padding-inline: var(--space-s);
}

.button[size='l'] {
  --_button-font-size: var(--size-1);
  --_button-padding-block: calc(var(--space-s) - 2px) calc(var(--space-s) + 2px);
  --_button-padding-inline: var(--space-m);
}

.button[size='xl'] {
  --_button-font-size: var(--size-2);
  --_button-padding-block: calc(var(--space-m) - 3px) calc(var(--space-m) + 3px);
  --_button-padding-inline: var(--space-l);
}

/* Variants */
.button[variant='primary'] {
  --_button-background-color: var(--_button-color);
  color: var(--color-white);
  border-color: var(--_button-border-color);
}

.button[data-variant='secondary'],
.button[variant='secondary'] {
  background-color: transparent;
  color: var(--_button-color);
  border-color: currentColor;
}

.button[variant='ghost'],
.button[variant='link'] {
  background-color: transparent;
  color: var(--_button-color);
  border-color: transparent;
}

.button[variant='ghost']:hover,
.button[variant='link']:hover {
  text-decoration: underline;
}

/* .button[variant='ghost']:hover,
.button[variant='link']:hover {
  background-color: color-mix(in srgb, var(--_button-color) 10%, transparent);
  color: var(--_button-color);
  border-color: transparent;
} */

.button[variant='unstyled'] { all: unset; }

.button[color='primary'] {
  --_button-color: var(--color-primary);
}
.button[color='secondary'] {
  --_button-color: var(--color-secondary);
}
.button[color='base'] {
  --_button-color: var(--color-base);
}
.button[color='accent'] {
  --_button-color: var(--color-accent);
}
.button[color='white'] {
  --_button-color: var(--color-white);
}
.button[color='success'] {
  --_button-color: var(--color-success);
}
.button[color='fail'] {
  --_button-color: var(--color-fail);
}
.button[color='warning'] {
  --_button-color: var(--color-warning);
}
.button[color='info'] {
  --_button-color: var(--color-info);
}


/* 
Colors (tokens)
- primary
- secondary
- tertiary
- accent
- white
- success
- fail
- warning
- info

Variants
- primary
- secondary
- link/ghost
- unstyled

Sizes (tokens)
- s
- m
- l
- xl

Icon 
- composability via main slot.
- treatment via :has()


*/
</style>