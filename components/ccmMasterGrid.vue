<template>
  <div>
    <slot>
      <div v-for="i in 47" :key="i">
        <p>Aux Card</p>
      </div>
    </slot>
  </div>
</template>

<script>
export default {
  name: 'Teste'
}
</script>

<style scoped>
.master-grid {
  box-sizing: content-box;
  display: grid;
  grid-template-columns: [full-start] minmax(auto, var(--space-xs-m)) [content-start] 1fr 1fr 1fr [col1] 1fr 1fr 1fr [col2] 1fr 1fr 1fr [col3] 1fr 1fr 1fr [content-end] minmax(auto, var(--space-xs-m)) [full-end];
  grid-auto-rows: auto;
  gap: var(--base-gutter);
}

.aux-card {
  grid-column: span 12;
}

@media (min-width: 321px) and (max-width: 768px) {
  .aux-card {
    grid-column: span 6;
  }
}

@media (min-width: 769px) {
  .aux-card {
    grid-column: span 3;
  }
}
</style>
