<template>
  <ccm-master-grid>
    <ccm-topbar id="topbar" />
    <ccm-hero id="hero" />
    <slot />
    <ccm-footer id="footer" />
  </ccm-master-grid>
</template>

<style>
#topbar {
  grid-row: 1 / 2;
  z-index: 2;
}

#hero {
  grid-row: 1 / 5;
  z-index: 1;
}

</style> 