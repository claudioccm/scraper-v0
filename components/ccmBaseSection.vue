<template>
  <section class="base-section | subgrid" :background-color="backgroundColor" >
    <slot />
  </section>
</template>

<script setup>
const props = defineProps({
  backgroundColor: {
    type: String,
    default: 'white'
  },

  
})
</script>

<style scoped>
.base-section {
  grid-column: full-start / full-end; /* Grid template columns are defined by the .subgrid class, and grid-column attr. */
  display: grid;
  grid-template-columns: subgrid;
}

.base-section > * {
  grid-column: content-start / content-end; /* Grid template columns are defined by the .subgrid class, and grid-column attr. */
}

.base-section {
  padding-block: var(--base-padding-block);
}



[background-color="white-gray"] {
  background: linear-gradient(to bottom, white 50%, #f5f5f5 50%);
}

[background-color="gray-white"] {
  background: linear-gradient(to bottom, #f5f5f5 50%, white 50%);
}

[background-color="gray"] {
  background-color: #f5f5f5;
}

[background-color="white"] {
  background-color: var(--white-color);
}

[background-color="base"] {
  background-color: var(--base-color);
}

[background-color="primary"] {
  background-color: var(--primary-color);
}

[background-color="secondary"] {
  background-color: var(--secondary-color);
}



</style>