<template>
  <div class="layout">
    <slot name="hero">

    </slot>
    <main class="layout-main">
      <slot />
    </main>
    <ccm-footer class="layout-footer" />
  </div>
</template>

<script setup>
</script>

<style>
.layout {
  min-height: 100svh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr;
  grid-template-areas:
    "hero"
    "main"
    "footer";
}

.layout-hero {
  grid-area: hero;
  background-color: #eee;
}

.layout-main {
  grid-area: main;
}

.layout-footer {
  grid-area: footer;
  background-color: #eee;

}
</style>