<template>
  <div class="layout">
    <ccm-topbar class="layout-topbar" />
    <main class="layout-main">
      <slot />
    </main>
    <ccm-footer class="layout-footer" />
  </div>
</template>

<script setup>
const route = useRoute()
const heroState = useState('hero', () => null)
const hero = computed(() => route.meta.hero || heroState.value)
</script>

<style>
.layout {
  min-height: 100svh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-columns: 1fr;
  grid-template-areas:
    "topbar"
    "main"
    "footer";
}

.layout-hero {
  grid-area: topbar;
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