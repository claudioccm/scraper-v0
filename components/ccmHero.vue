<template>
  <header class="ccm-hero" :background-color="backgroundColor" :size="size" :hide-topbar="hideTopbar" >
    <div class="ccm-hero-container | center">
      <ccm-topbar v-if="!hideTopbar" />
      <slot>
        <hgroup>
          <span v-if="brow">{{ brow }}</span>
          <h1>{{ title }}</h1>
          <p v-if="tagline">{{ tagline }}</p>
        </hgroup>  
      </slot>
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
    default: 'transparent'
  },
  size: {
    type: String,
    default: 'l'
  },
  hideTopbar: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.ccm-hero {
  --_ccm-hero-padding-block: var(--space-l);
  --_ccm-hero-background-color: var(--color-primary-tint-20);
}

.ccm-hero {
  padding-block: var(--_ccm-hero-padding-block);
  background-color: var(--_ccm-hero-background-color);
}

.ccm-hero[size="xs"]  { --_ccm-hero-padding-block: var(--space-xs);  }
.ccm-hero[size="s"]   { --_ccm-hero-padding-block: var(--space-s);   }
.ccm-hero[size="m"]   { --_ccm-hero-padding-block: var(--space-m);   }
.ccm-hero[size="l"]   { --_ccm-hero-padding-block: var(--space-l);   }
.ccm-hero[size="xl"]  { --_ccm-hero-padding-block: var(--space-xl);  }
.ccm-hero[size="2xl"] { --_ccm-hero-padding-block: var(--space-2xl); }
.ccm-hero[size="3xl"] { --_ccm-hero-padding-block: var(--space-3xl); }
</style>