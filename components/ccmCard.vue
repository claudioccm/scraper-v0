<template>
 
  <component
    :is="isLink ? 'NuxtLink' : 'div'"
    class="ccm-card"
    v-bind="wrapperAttrs"
    :style="{
      '--_card-padding': `var(--space-${size})`,
      '--_card-background-color': `var(--${backgroundColor})`
    }"
    >
  
    <div class="ccm-card__text">
      <slot />
      <span v-if="isLink" :id="ctaId" class="visually-hidden" aria-hidden="true">{{ ctaText }}</span>
    </div>

    <slot name="image">
      <img class="ccm-card__image" v-if="image" :src="image" :alt="imageAlt || ''" />
      <div v-else class="ccm-card__image" aria-hidden="true"></div>
    </slot>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: {
    type: String,
    required: false
  },
  title: {
    type: String,
    required: false
  },
  image: {
    type: String,
    required: false
  },
  imageAlt: {
    type: String,
    required: false
  },
  size: {
    type: String,
    default: 'l'
  },
  backgroundColor: {
    type: String,
    default: 'color-primary-tint-20'
  },
  ctaText: {
    type: String,
    default: 'Read more'
  }
})

const isLink = computed(() => Boolean(props.to))

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}

const baseForId = computed(() => props.title || props.to || 'card')
const ctaId = computed(() => `desc-${slugify(baseForId.value)}`)

const wrapperAttrs = computed(() => {
  const attrs = {}
  if (isLink.value) {
    attrs.to = props.to
    attrs['aria-describedby'] = ctaId.value
  }
  return attrs
})
</script>

<style scoped>
.ccm-card {
  --_card-padding: var(--space-l);
  --_card-border-radius: var(--border-radius-l);
  --_card-gap: var(--space-m);
  --_card-background-color: var(--color-primary-tint-20);
  --_card-border-width: 2px;
  --_card-border-style: solid;
  --_card-color: var(--color-primary-tint-80);
}

.ccm-card {
  display: flex;
  flex-direction: column;
  border: var(--_card-border-width) var(--_card-border-style) var(--_card-color);
  border-radius: var(--_card-border-radius);
  gap: var(--_card-gap);
  text-decoration: none;
  color: var(--_card-color);
}

.ccm-card__text {
  flex: 1;
  padding: 0 var(--_card-padding) var(--_card-padding);
}

.ccm-card__image {
  order: -1;
  padding: var(--_card-padding);
  background-color: var(--_card-background-color);
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: var(--_card-border-radius);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

</style>