<template>
  <div class="by-line | subgrid">
    <div class="by-line__content | cluster">
      <span>© {{ new Date().getFullYear() }} GovLab</span>
      <a href="#" split-left>by ccm.design</a>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>

/* By Line Layout - SubGrid */

.by-line {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: full-start / full-end;
  font-size: var(--size--2);
  padding-block: var(--space-l) var(--space-s);
}

.by-line__content {
  grid-column: content-start / content-end;
  --_cluster-space: var(--space-xs);
}
</style>
