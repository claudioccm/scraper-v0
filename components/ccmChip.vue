<template>
  <component
    :is="componentTag"
    class="chip"
    :style="cssVars"
    :data-status="normalizedStatus || null"
    :aria-label="computedAriaLabel"
    v-bind="$attrs"
  >
    <slot>{{ label }}</slot>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  is: { type: String, default: 'span' },
  label: { type: String, default: 'Chip' },
  status: { type: String, default: null },
  color: { type: String, default: 'base' },
  ariaLabel: { type: String, default: null }
})

const componentTag = computed(() => props.is || 'span')
const normalizedStatus = computed(() => props.status ? props.status.trim().toLowerCase() : null)
const normalizedColor = computed(() => props.color ? props.color.trim().toLowerCase() : null)

// Map status values to their semantic color tokens so they can drive CSS variables.
const STATUS_TOKENS = {
  success: { color: '--color-success', background: '--color-success-tint-10' },
  warning: { color: '--color-warning', background: '--color-warning-tint-10' },
  fail: { color: '--color-fail', background: '--color-fail-tint-10' }
}

const statusVars = computed(() => {
  const statusKey = normalizedStatus.value
  const token = statusKey ? STATUS_TOKENS[statusKey] : null
  if (!token) return {}

  const tokenColor = `var(${token.color}, var(--color-base))`
  const tokenBackground = `var(${token.background}, color-mix(in srgb, ${tokenColor} 10%, white 90%))`

  return {
    '--_chip-color': tokenColor,
    '--_chip-background-color': tokenBackground
  }
})

const colorVars = computed(() => {
  const colorKey = normalizedColor.value
  if (!colorKey) return {}

  const colorVar = `var(--color-${colorKey}, var(--color-base))`
  const bgVar = `var(--color-${colorKey}-tint-10, color-mix(in srgb, ${colorVar} 10%, white 90%))`

  return {
    '--_chip-color': colorVar,
    '--_chip-background-color': bgVar
  }
})

const cssVars = computed(() => ({
  ...colorVars.value,
  ...statusVars.value
}))

const computedAriaLabel = computed(() => props.ariaLabel || (props.label !== 'Chip' ? props.label : null))
</script>

<style>
.chip {
  --_chip-color: var(--color-base);
  --_chip-background-color: var(--color-base-tint-10, color-mix(in srgb, var(--color-base) 10%, white 90%));
  --_chip-font-size: var(--size--1, 0.875rem);
  --_chip-font-weight: 600;
  --_chip-padding-block: calc(var(--space-3xs) - 2px);
  --_chip-padding-inline: var(--space-2xs);
  --_chip-radius: 999px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4xs, 0.25rem);
  padding-block: var(--_chip-padding-block);
  padding-inline: var(--_chip-padding-inline);
  background-color: var(--_chip-background-color);
  color: var(--_chip-color);
  font-family: var(--font-family-base, inherit);
  font-size: var(--_chip-font-size);
  font-weight: var(--_chip-font-weight);
  line-height: 1.2;
  border-radius: var(--_chip-radius);
  border: 1px solid color-mix(in srgb, var(--_chip-color) 30%, transparent);
  white-space: nowrap;
}

.chip:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--_chip-color) 70%, transparent);
  outline-offset: 2px;
}
</style>
