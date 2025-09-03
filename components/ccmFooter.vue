<template>
  <footer class="ccm-footer" :background-color="backgroundColor" :size="size">
    <div class="ccm-footer-container | center">
      <h1>Footer</h1>
      <ccm-by-line />
    </div>
  </footer>
</template>

<script setup>

const props = defineProps({
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
.ccm-footer {
  --_ccm-footer-padding-block: var(--space-l);
  --_ccm-footer-background-color: transparent;
}

.ccm-footer {
  padding-block: var(--_ccm-footer-padding-block);
  background-color: var(--_ccm-footer-background-color);
}

.ccm-footer[size="xs"]  { --_ccm-footer-padding-block: var(--space-xs);  }
.ccm-footer[size="s"]   { --_ccm-footer-padding-block: var(--space-s);   }
.ccm-footer[size="m"]   { --_ccm-footer-padding-block: var(--space-m);   }
.ccm-footer[size="l"]   { --_ccm-footer-padding-block: var(--space-l);   }
.ccm-footer[size="xl"]  { --_ccm-footer-padding-block: var(--space-xl);  }
.ccm-footer[size="2xl"] { --_ccm-footer-padding-block: var(--space-2xl); }
.ccm-footer[size="3xl"] { --_ccm-footer-padding-block: var(--space-3xl); }

.ccm-footer[background-color="base-color"]                  { --_ccm-footer-background-color: var(--base-color); }
.ccm-footer[background-color="base-color-light"]            { --_ccm-footer-background-color: var(--base-color-light); }
.ccm-footer[background-color="base-color-super-light"]      { --_ccm-footer-background-color: var(--base-color-super-light); }

.ccm-footer[background-color="primary-color"]               { --_ccm-footer-background-color: var(--primary-color); }
.ccm-footer[background-color="primary-color-light"]         { --_ccm-footer-background-color: var(--primary-color-light); }
.ccm-footer[background-color="primary-color-super-light"]   { --_ccm-footer-background-color: var(--primary-color-super-light); }

.ccm-footer[background-color="secondary-color"]             { --_ccm-footer-background-color: var(--secondary-color); }
.ccm-footer[background-color="secondary-color-light"]       { --_ccm-footer-background-color: var(--secondary-color-light); }
.ccm-footer[background-color="secondary-color-super-light"] { --_ccm-footer-background-color: var(--secondary-color-super-light); }

.ccm-footer[background-color="accent-color"]                { --_ccm-footer-background-color: var(--accent-color); }
.ccm-footer[background-color="accent-color-light"]          { --_ccm-footer-background-color: var(--accent-color-light); }
.ccm-footer[background-color="accent-color-super-light"]    { --_ccm-footer-background-color: var(--accent-color-super-light); }

.ccm-footer[background-color="white-color"]                 { --_ccm-footer-background-color: var(--white-color); }

.ccm-footer[background-color="black-color"]                 { --_ccm-footer-background-color: var(--black-color); }
.ccm-footer[background-color="black-color-light"]           { --_ccm-footer-background-color: var(--black-color-light); }
.ccm-footer[background-color="black-color-super-light"]     { --_ccm-footer-background-color: var(--black-color-super-light); }

</style>