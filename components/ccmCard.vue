<template>
  <nuxt-link 
    class="ccm-card" 
    :to="to" 
    :aria-label="title" 
    :aria-describedby="ctaId" 
    :image="image"
    :style="{
      '--_card-padding': `var(--space-${size})`,
      '--_card-background-color': `var(--${backgroundColor})`
    }"
    >
    
  <slot name="image">
    <img class="ccm-card__image" v-if="image" :src="image" :alt="title" />
    <div v-else class="ccm-card__image"></div>
  </slot>

  <div class="ccm-card__text">
    <slot />
  </div>

  <span class="ccm-card__action" aria-hidden="true" :id="ctaId">
    <slot name="action">{{ action }}</slot>
  </span>
    
  </nuxt-link>
</template>

<script setup>
import { computed } from 'vue'
import { useSlugify } from '~/composables/useSlugify'

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
  size: {
    type: String,
    default: 'l'
  },
  backgroundColor: {
    type: String,
    default: 'color-primary-tint-20'
  }
})

const isLink = computed(() => Boolean(props.to))

const { slugify } = useSlugify()

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
  --_card-color: var(--color-base-tint-80);
  --_card-border-width: 2px;
  --_card-border-style: solid;
}


.ccm-card {
  display: flex;
  flex-direction: column;
  border: var(--_card-border-width) var(--_card-border-style) var(--_card-color);
  overflow: hidden;
  gap: var(--_card-gap);
  text-decoration: none;
  color: var(--_card-color);
  border-radius: var(--_card-border-radius);
}

.ccm-card * {
  cursor: pointer;
}

.ccm-card__text {
  flex: 1;
  padding: 0 var(--_card-padding) var(--_card-padding);
}

.ccm-card__image {
  padding: var(--_card-padding);
  background-color: var(--_card-background-color);
  width: 100%;
  aspect-ratio: 16/9;
}

.ccm-card__action {
  padding: var(--_card-padding);
}
</style>