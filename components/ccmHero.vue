<template>
  <header 
    class="ccm-hero" 
    :background-color="backgroundColor" 
    :size="size" 
    :hide-top="hideTop" 
    :hide-bottom="hideBottom" 
    :variant="variant"
    :style="{
      '--_ccm-hero-background-color': `var(--${backgroundColor})`
    }"
    >
    
    <div class="ccm-hero__top" v-if="!hideTop">
      <slot name="top">
        <ccm-topbar class="ccm-hero__top | center"/>
      </slot>
    </div>
    
    <div class="ccm-hero__main | center">
      <slot>
        <hgroup>
          <span v-if="brow">{{ brow }}</span>
          <h1>{{ title }}</h1>
          <p v-if="tagline">{{ tagline }}</p>
        </hgroup>  
      </slot>
    </div>
    
    <div class="ccm-hero__bottom | center">
      <slot name="bottom" />
    </div>

  </header>
</template>

<script setup>
const props = defineProps({
  brow: {
    type: String,
    default: 'Brow'
  },
  title: {
    type: String,
    default: 'Hero'
  },
  tagline: {
    type: String,
    default: 'Tagline'
  },
  backgroundColor: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'l'
  },
  hideTop: {
    type: Boolean,
    default: false
  },
  hideBottom: {
    type: Boolean,
    default: true
  },
  variant: {
    type: String,
    default: 'default'
  }
})
</script>

<style scoped>
.ccm-hero {
  --_ccm-hero-padding-block: var(--space-l);
  --_ccm-hero-background-color: var(--color-primary-tint-20);
}

.ccm-hero {
  background-color: var(--_ccm-hero-background-color);
  aspect-ratio: 16/7;
  display: flex;
  flex-direction: column;

  * { width: 100%; }
}

.ccm-hero__main {
  display: flex;
  padding-block: var(--_ccm-hero-padding-block);
  align-items: center;
  flex: 1;
}

.ccm-hero__main {
  text-wrap: balance;
}

.ccm-hero__bottom {
  padding-bottom: var(--_ccm-hero-padding-block);
}

.ccm-hero[hide-top="true"] .ccm-hero__top { display: none; }
.ccm-hero[hide-bottom="true"] .ccm-hero__bottom { display: none; }

.ccm-hero[variant="minimal"] { aspect-ratio: unset; }

</style>