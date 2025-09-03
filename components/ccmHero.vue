<template>
  <header class="ccm-hero" :background-color="backgroundColor" :size="size">
    <div class="ccm-hero-container | center">
      <ccm-topbar />
      <hgroup>
        <span v-if="brow">{{ brow }}</span>
        <h1>{{ title }}</h1>
        <p v-if="tagline">{{ tagline }}</p>
      </hgroup>  
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
  }
})
</script>

<style scoped>
.ccm-hero {
  --_ccm-hero-padding-block: var(--space-l);
  --_ccm-hero-background-color: transparent;
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

.ccm-hero[background-color="base-color"]                  { --_ccm-hero-background-color: var(--base-color); }
.ccm-hero[background-color="base-color-light"]            { --_ccm-hero-background-color: var(--base-color-light); }
.ccm-hero[background-color="base-color-super-light"]      { --_ccm-hero-background-color: var(--base-color-super-light); }

.ccm-hero[background-color="primary-color"]               { --_ccm-hero-background-color: var(--primary-color); }
.ccm-hero[background-color="primary-color-light"]         { --_ccm-hero-background-color: var(--primary-color-light); }
.ccm-hero[background-color="primary-color-super-light"]   { --_ccm-hero-background-color: var(--primary-color-super-light); }

.ccm-hero[background-color="secondary-color"]             { --_ccm-hero-background-color: var(--secondary-color); }
.ccm-hero[background-color="secondary-color-light"]       { --_ccm-hero-background-color: var(--secondary-color-light); }
.ccm-hero[background-color="secondary-color-super-light"] { --_ccm-hero-background-color: var(--secondary-color-super-light); }

.ccm-hero[background-color="accent-color"]                { --_ccm-hero-background-color: var(--accent-color); }
.ccm-hero[background-color="accent-color-light"]          { --_ccm-hero-background-color: var(--accent-color-light); }
.ccm-hero[background-color="accent-color-super-light"]    { --_ccm-hero-background-color: var(--accent-color-super-light); }

.ccm-hero[background-color="white-color"]                 { --_ccm-hero-background-color: var(--white-color); }

.ccm-hero[background-color="black-color"]                 { --_ccm-hero-background-color: var(--black-color); }
.ccm-hero[background-color="black-color-light"]           { --_ccm-hero-background-color: var(--black-color-light); }
.ccm-hero[background-color="black-color-super-light"]     { --_ccm-hero-background-color: var(--black-color-super-light); }

.ccm-hero[background-color="success-color"]               { --_ccm-hero-background-color: var(--success-color); }
.ccm-hero[background-color="success-color-light"]         { --_ccm-hero-background-color: var(--success-color-light); }
.ccm-hero[background-color="success-color-super-light"]   { --_ccm-hero-background-color: var(--success-color-super-light); }

.ccm-hero[background-color="fail-color"]                  { --_ccm-hero-background-color: var(--fail-color); }
.ccm-hero[background-color="fail-color-light"]            { --_ccm-hero-background-color: var(--fail-color-light); }
.ccm-hero[background-color="fail-color-super-light"]      { --_ccm-hero-background-color: var(--fail-color-super-light); }
</style>