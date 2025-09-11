<template>
  <component
    class="button"
    :is="componentTag"
    v-bind="linkProps"
    :variant="visual"
    :color="color"
    :size="size"
    :icon-before="iconBefore"
    :icon-after="iconAfter"
    :label="label"
    :value="value"
    :disabled="disabled"
  >
    <slot>{{label}}</slot>
  </component>
</template>

<script setup>
  import { toRefs, defineProps, computed, resolveComponent } from 'vue';
  
  const props = defineProps({
    is: {
      type: String,
      default: 'button'
    },
    to: {
      type: [String, Object],
      default: null
    },
    href: {
      type: String,
      default: null
    },
    target: {
      type: String,
      default: null
    },
    rel: {
      type: String,
      default: null
    },
    external: {
      type: Boolean,
      default: undefined
    },
    replace: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: 'label'
    },
    value: {
      type: String,
      default: 'value'
    },
    size: {
      type: String,
      default: 'm'
    },
    color: {
      type: String,
      default: 'base'
    },
    iconBefore: {
      type: String,
      default: null
    },
    iconAfter: {
      type: String,
      default: null
    },
    disabled: {
      type: Boolean,
      default: false
    },
  });

  const { value, label, size, color, iconBefore, iconAfter } = toRefs(props)

  const NuxtLink = resolveComponent('NuxtLink')

  const isAbsolute = (url) => typeof url === 'string' && /^(https?:)?\/\//.test(url)

  const componentTag = computed(() => {
    if (props.to) return NuxtLink
    if (props.href) return 'a'
    return props.is || 'button'
  })

  const linkProps = computed(() => {
    if (props.to) {
      const external = props.external ?? (typeof props.to === 'string' && isAbsolute(props.to))
      return {
        to: props.to,
        external,
        replace: props.replace,
        target: props.target || (external ? '_blank' : null),
        rel: props.rel || (external ? 'noopener noreferrer' : null)
      }
    }
    if (props.href) {
      return {
        href: props.href,
        target: props.target,
        rel: props.rel
      }
    }
    return { type: 'button' }
  })

</script>

<style>
/* 
  This file contains the structural rules for the button system. 
  Any visual configuration should be made on the button-visuals.css file.
  It is very unlikely that anyone will need to edits file for customization purposes. 
*/

.button {
  /* Structure */
  display: inline-block;
  zoom: 1;
  line-height: 1;
  white-space: nowrap;
  vertical-align: middle;
  text-align: center;
  cursor: pointer;
  -webkit-user-drag: none;
  user-select: none;
  box-sizing: border-box;
  font-size: 100%;
  text-decoration: none;
  align-self: self-start;
  justify-self: flex-start;
  
  font-family: var(--_button-font-family, sans-serif); /* Fallback to sans-serif */
  font-weight: var(--_button-font-weight);
  letter-spacing: var(--_button-letter-spacing);
}

/* 
  This file contains the css rules for the button system. 
  Most of the visual configurations can be made through the variables. (Lines 13-21)
  Many of these configurations have fallbacks values. 
*/

.button {
  /* Required Values */
  --_button-text-color:        hsla(var(--_button-text-hsl), 1);
  --_button-padding-block:     var(--space-2xs);
  --_button-padding-inline:    var(--space-s);

  --_button-color: var(--color-base);
  
  /* Optional Values */
  --_button-border-radius: var(--border-radius-s, 0);    /* Fallback to 0 */
  --_button-border-color:  var(--_button-color);             /* Fallback to 1px */
  --_button-border-width:  var(--base-border-width, 2px);   /* Fallback to 1px */
  --_button-border-style:  var(--base-border-style, solid); /* Fallback to solid */
  --_button-font-weight:   var(--font-weight, 400);         /* Fallback to 400 */
  --_button-font-size:     100%;
  --_button-icon-color:    var(--_button-text-color);
}

.button[data-color="base"],
.button[color="base"] { 
  --_button-color: var(--color-base);
}

.button[data-color="primary"],
.button[color="primary"] { 
  --_button-color: var(--color-primary);

}

.button[data-size="s"],
.button[size="s"] {
  --_button-padding-block: var(--s-2);
  --_button-padding-inline: var(--s0);
  --_button-font-size: 75%; 
}

.button[data-size="l"],
.button[size="l"] {
  --_button-padding-block: var(--s0);
  --_button-padding-inline: var(--s2);
  --_button-font-size: 120%;
}

.button[data-size="xl"],
.button[size="xl"] {
  --_button-padding-block: var(--s0);
  --_button-padding-inline: var(--s2);
  --_button-font-size: 150%;
}

.button {
  color: var(--_button-text-color, var(--_button-color));
  background-color: var(--_button-background-color);
  
  padding: var(--_button-padding-block) var(--_button-padding-inline);
  
  border-radius: var(--_button-border-radius, 0);
  border-width: var(--_button-border-width, 1px);
  border-style: var(--_button-border-style, solid);
  border-color: var(--_button-border-color);
  
  font-family: var(--_button-font-family);
  font-weight: var(--_button-font-weight, 400);
  font-size: var(--_button-font-size, 100%);
}


.button[data-variant="primary"],
.button[variant="primary"] {
  color: white;
  border-width: var(--_button-border-width, 0);
  border-style: var(--_button-border-style, solid);
  border-color: hsla(var(--_button-hsl), 1);
  --_button-background-color: var(--_button-color);
}


/* 
Colors
- primary
- secondary
- tertiary
- accent
- white
- success
- fail
- warning
- info

Variants
- primary
- secondary
- link/ghost
- unstyled

Sizes
- s
- m
- l
- xl

Icon 
- composability via main slot.
- treatment via :has()


*/


</style>