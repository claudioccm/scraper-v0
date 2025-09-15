<template>
  <div class="topbar | cluster">
    <h1 class="topbar__title | h3">
      <slot name="logo"><nuxt-link to="/">ccm.design</nuxt-link></slot>
    </h1>
    <nav class="margin-left:auto">
      <ul class="menu | cluster">
        <li><nuxt-link class="menu__item" to="/">Home</nuxt-link></li>
        <li><nuxt-link class="menu__item" to="/blog">Insights</nuxt-link></li>
        <li><nuxt-link class="menu__item" to="/test">Test</nuxt-link></li>
      </ul>
    </nav>
  </div>
</template>

<script setup>

</script>

<style scoped>
.topbar__title {
  padding-block: var(--space-xs);
  * { text-decoration: none; }
}

.menu__item {
  color: var(--color-base);
  text-decoration: none;

  &:hover { text-decoration: underline; }
}

li:not(:first-child) .menu__item { padding-inline-start: var(--space-xs); 
}
</style>