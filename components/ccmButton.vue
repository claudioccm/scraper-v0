<template>
  <component 
    class="button" 
    :is="componentEl"
    :mobile="mobile"
    :unstyled="unstyled"
    :hidden="hidden"
    :variant="visual"
    :color="color"
    :size="size"
    :icon-before="iconBefore"
    :icon-after="iconAfter"
    :label="label"
    :value="value"
    :fullWidth="fullWidth"
  >
    <slot>{{label}}</slot>
  </component>
</template>

<script setup>
  import { toRefs, computed, defineProps } from 'vue';
  
  const props = defineProps({
    label: {
      type: String,
      default: ''
    },
    value: {
      type: String,
      default: 'value'
    },
    hidden: {
      type: Boolean,
      default: false
    },
    unstyled: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    },
    mobile: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    },
    color: {
      type: String,
      default: ''
    },
    visual: {
      type: String,
      default: 'secondary'
    },
    iconBefore: {
      type: String,
      default: null
    },
    iconAfter: {
      type: String,
      default: null
    },
    el: {
      type: String,
      default: 'button'
    },
  });

  const { el, value, label, hidden, unstyled, mobile, size, color, visual, iconBefore, iconAfter, fullWidth } = toRefs(props)

const defaultEl = computed(() => {
  if (attrs.href) return 'a'
  if (attrs.disabled) return 'span'
  if (attrs.to) return 'NuxtLink'
  return 'button'
})

const componentEl = computed(() => el.value || defaultEl.value)

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

.button:focus { outline: 0; }

/* Firefox: Get rid of the inner focus border */
.button::-moz-focus-inner {
  padding: 0;
  border: 0;
}

.button[disabled],
.button[disabled]:hover,
.button[disabled]:focus,
.button[disabled]:active {
  filter: alpha(opacity=40);
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
  pointer-events: none;
}

.button[hidden] { display: none; }

.button[unstyled] {
  background-color: transparent;
  border-color: transparent;
}

.button[fullWidth="true"],
.button[data-fullWidth="true"] {
  align-self: stretch;
  justify-self: stretch;
}



/* 
  This file contains the css rules for the button system. 
  Most of the visual configurations can be made through the variables. (Lines 13-21)
  Many of these configurations have fallbacks values. 
*/

.button {
  /* Required Values */
  --_button-color-prop:        v-bind(color);
  --_button-hsl:               var(--_button-color-prop, --base-hsl);
  --_button-text-hsl:          var(--_button-hsl);
  --_button-color:             hsla(var(--_button-hsl), 1);
  --_button-text-color:        hsla(var(--_button-text-hsl), 1);
  --_button-padding-block:     var(--base-padding-block);
  --_button-padding-inline:    var(--base-padding-inline);

  /* Optional Values */
  --_button-border-radius: var(--border-radius-m, 0);    /* Fallback to 0 */
  --_button-border-color:  var(--_button-color);             /* Fallback to 1px */
  --_button-border-width:  var(--base-border-width, 2px);   /* Fallback to 1px */
  --_button-border-style:  var(--base-border-style, solid); /* Fallback to solid */
  --_button-font-weight:   var(--font-weight, 400);         /* Fallback to 400 */
  --_button-font-size:     100%;
  --_button-icon-color:    var(--_button-text-color);
}

.button[data-color="base"],
.button[color="base"] { 
  --_button-hsl: var(--base-hsl); 
  --_button-text-color: var(--base-color); 
}

.button[data-color="primary"],
.button[color="primary"] { 
  --_button-hsl: var(--primary-hsl); 
  --_button-text-color: var(--primary-color); 
}

.button[data-color="secondary"],
.button[color="secondary"] { 
  --_button-hsl: var(--secondary-hsl); 
  --_button-text-color: var(--secondary-color); 
}

.button[data-color="tertiary"],
.button[color="tertiary"] { 
  --_button-hsl: var(--tertiary-hsl); 
  --_button-text-color: var(--tertiary-color); 
}

.button[data-color="accent"],
.button[color="accent"] { 
  --_button-hsl: var(--accent-hsl);
  --_button-text-color: var(--accent-color);
}

.button[data-color="white"], 
.button[color="white"] { 
  --_button-hsl: var(--white-hsl);
  --_button-text-color: var(--white-color);
}

.button[data-color="success"],
.button[color="success"] { 
  --_button-hsl: var(--green-hsl); 
  --_button-text-color: var(--green-color);
}

.button[data-color="cancel"],
.button[data-color="fail"],
.button[color="cancel"],
.button[color="fail"] { 
  --_button-hsl: var(--red-hsl);
  --_button-text-color: var(--red-color);
}

.button[data-color="warning"],
.button[color="warning"] { 
  --_button-hsl: var(--yellow-hsl);
  --_button-text-color: var(--yellow-color);
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

.button[data-size="full-width"],
.button[size="full-width"] { width: 100%; }

.button {
  color: var(--_button-text-color);
  background-color: transparent; /* This might be an issue */

  padding: var(--_button-padding-block) var(--_button-padding-inline);
  
  border-radius: var(--_button-border-radius, 0);
  border-width: var(--_button-border-width, 1px);
  border-style: var(--_button-border-style, solid);
  border-color: var(--_button-border-color);
  
  font-family: var(--_button-font-family);
  font-weight: var(--_button-font-weight, 400);
  font-size: var(--_button-font-size, 100%);
}

.button:hover { background-image: linear-gradient(hsla(var(--_button-hsl), 0.05), hsla(var(--_button-hsl), 0.05)); }

.button:active {
  background-image: linear-gradient(hsla(var(--_button-hsl), 0.15), hsla(var(--_button-hsl), 0.15));
  border-color: hsla(var(--_button-color), 1);
}
  
.button:focus { box-shadow: var(--_focus-effect); }

.button[data-variant="primary"],
.button[variant="primary"] {
    color: white;
    border-width: var(--_button-border-width, 0);
    border-style: var(--_button-border-style, solid);
    border-color: hsla(var(--_button-hsl), 1);
    background-color: hsla(var(--_button-hsl), 1);
}

.button[data-variant="primary"]:hover,
.button[data-variant="primary"]:focus,
.button[variant="primary"]:hover,
.button[variant="primary"]:focus { background-image: linear-gradient(hsla(0,0%,0%, 0.15), hsla(0,0%,0%, 0.25)); }

.button[data-variant="secondary"],
.button[variant="secondary"] {
  background-color: transparent;
  color: var(--_button-text-color);
  border-width: var(--_button-border-width, 1px);
  border-style: var(--_button-border-style, solid);
  border-color: hsla(var(--_button-hsl), 1);
}

.button[data-variant="secondary"]:hover,
.button[data-variant="secondary"]:focus,
.button[variant="secondary"]:hover,
.button[variant="secondary"]:focus { background-image: linear-gradient(hsla(var(--_button-hsl), 0.1), hsla(var(--_button-hsl), 0.1)); }

.button[data-variant="unstyled"],
.button[variant="unstyled"],
.button[data-variant="ghost"],
.button[variant="ghost"] { 
  color: hsla(var(--_button-hsl), 1); 
  border-width: var(--_button-border-width, 0);
  border-style: var(--_button-border-style, solid);
  border-color: transparent;
}

.button[data-variant="link"],
.button[variant="link"] { 
  color: hsla(var(--_button-hsl), 1); 
  border-width: var(--_button-border-width, 0);
  border-style: var(--_button-border-style, solid);
  border-color: transparent;
  padding-inline: var(--space-xs);
}

@media (max-width: 36em) {
  .button[data-mobile="wide"],
  .button[mobile="wide"] { width: 100%; }
}

.button[data-icon-before],
.button[data-icon-after], 
.button[icon-before],
.button[icon-after] {
  display: inline-flex;
  align-items: center;
  
}

.button[data-icon-before]:before,
.button[data-icon-after]:after,  
.button[icon-before]:before { content: attr(icon-before); }
.button[icon-after]:after  { content: attr(icon-after); }

.button[data-icon-before]:before,
.button[data-icon-after]:after,
.button[icon-before]:before,
.button[icon-after]:after {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;  /* Preferred icon size */
  font-size: calc(var(--_button-font-size) * 1.5);
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
  color: var(--_button-icon-color); 

  /* Support for all WebKit browsers. */
  -webkit-font-smoothing: antialiased;
  /* Support for Safari and Chrome. */
  text-rendering: optimizeLegibility;

  /* Support for Firefox. */
  -moz-osx-font-smoothing: grayscale;

  /* Support for IE. */
  font-feature-settings: 'liga';
}

.button[data-icon-before]:before,
.button[icon-before]:before { margin-right: var(--space-xs); }

.button[data-icon-after]:after,
.button[icon-after]:after   { margin-left: var(--space-m); }

.button[data-icon-before]:empty:before,
.button[icon-before]:empty:before { margin-right: 0; }

.button[data-icon-after]:empty:after,
.button[icon-after]:empty:after   { margin-left: 0; }

.button[data-icon-before]:empty,
.button[icon-before]:empty,
.button[data-icon-after]:empty,
.button[icon-after]:empty { padding: var(--_button-padding-block) var(--_button-padding-inline); }

.button[data-variant="primary"][data-icon-before]:before,
.button[variant="primary"][icon-before]:before,
.button[data-variant="primary"][data-icon-after]:after,
.button[variant="primary"][icon-after]:after { 
  --_button-icon-color: var(--white-color);   
}

</style>