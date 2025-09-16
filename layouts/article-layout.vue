<template>
  <div class="layout">
    <slot name="hero">
      <ccm-hero
        v-if="hero"
        class="layout-hero"
        :background-color="hero.backgroundColor"
        :size="hero.size"
      >
        <hgroup>
          <p><ccm-button is="NuxtLink" to="/blog">Back to Blog</ccm-button></p>
          <span v-if="hero.brow">{{ hero.brow }}</span>
          <h1>{{ hero.title }}</h1>
          <p v-if="hero.tagline">{{ hero.tagline }}</p>
        </hgroup>
      </ccm-hero>
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