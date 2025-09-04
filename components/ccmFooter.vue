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
  --_ccm-footer-background-color: var(--color-primary-tint-20);
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

</style>