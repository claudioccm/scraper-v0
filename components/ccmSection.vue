<template>
  <section class="ccm-section" :size="size" :background-color="backgroundColor" :full-width="fullWidth">
    <div :class="['ccm-section-container', { center: fullWidth === false }]">
      <slot />
    </div>
  </section>
</template>

<script setup>
const props = defineProps({
  size: {
    type: String,
    default: 'l'
  },
  backgroundColor: {
    type: String,
    default: 'transparent'
  },
  fullWidth: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.ccm-section {
  --_ccm-section-padding-block: var(--space-l);
  --_ccm-section-background-color: transparent;
}

.ccm-section { 
  padding-block: var(--_ccm-section-padding-block);
  background-color: var(--_ccm-section-background-color); 
}

.ccm-section[size="xs"]  { --_ccm-section-padding-block: var(--space-xs);  }
.ccm-section[size="s"]   { --_ccm-section-padding-block: var(--space-s);   }
.ccm-section[size="m"]   { --_ccm-section-padding-block: var(--space-m);   }
.ccm-section[size="l"]   { --_ccm-section-padding-block: var(--space-l);   }
.ccm-section[size="xl"]  { --_ccm-section-padding-block: var(--space-xl);  }
.ccm-section[size="2xl"] { --_ccm-section-padding-block: var(--space-2xl); }
.ccm-section[size="3xl"] { --_ccm-section-padding-block: var(--space-3xl); }

.ccm-section[background-color="base-color"]                  { --_ccm-section-background-color: var(--base-color); }
.ccm-section[background-color="base-color-light"]            { --_ccm-section-background-color: var(--base-color-light); }
.ccm-section[background-color="base-color-super-light"]      { --_ccm-section-background-color: var(--base-color-super-light); }

.ccm-section[background-color="primary-color"]               { --_ccm-section-background-color: var(--primary-color); }
.ccm-section[background-color="primary-color-light"]         { --_ccm-section-background-color: var(--primary-color-light); }
.ccm-section[background-color="primary-color-super-light"]   { --_ccm-section-background-color: var(--primary-color-super-light); }

.ccm-section[background-color="secondary-color"]             { --_ccm-section-background-color: var(--secondary-color); }
.ccm-section[background-color="secondary-color-light"]       { --_ccm-section-background-color: var(--secondary-color-light); }
.ccm-section[background-color="secondary-color-super-light"] { --_ccm-section-background-color: var(--secondary-color-super-light); }

.ccm-section[background-color="accent-color"]                { --_ccm-section-background-color: var(--accent-color); }
.ccm-section[background-color="accent-color-light"]          { --_ccm-section-background-color: var(--accent-color-light); }
.ccm-section[background-color="accent-color-super-light"]    { --_ccm-section-background-color: var(--accent-color-super-light); }

.ccm-section[background-color="white-color"]                 { --_ccm-section-background-color: var(--white-color); }

.ccm-section[background-color="black-color"]                 { --_ccm-section-background-color: var(--black-color); }
.ccm-section[background-color="black-color-light"]           { --_ccm-section-background-color: var(--black-color-light); }
.ccm-section[background-color="black-color-super-light"]     { --_ccm-section-background-color: var(--black-color-super-light); }




</style>