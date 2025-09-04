<template>
  <div class="layout">
    <slot name="hero">
      <ccm-hero
        v-if="hero"
        class="layout-hero"
        
        :brow="hero.brow"
        :title="hero.title"
        :tagline="hero.tagline"
        :background-color="hero.backgroundColor || 'base-color'"
        :size="hero.size || 'l'"
        :hide-topbar="hero.hideTopbar === true"
      />
    </slot>
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