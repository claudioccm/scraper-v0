# Token Hierarchy
--base-level-variable: VALUE
--theme-level-variable: VALUE
--_component-level-variable: VALUE

``` ** inside the component - card.vue **
--_card-border-width: var(--theme-border-width, --base-border-width);
border-width: var(--_card-border-width);
```

# Color structure

## System
black, white, red, yellow, green, blue

### System Aliases: 
success, good = green
error, cancel, fail, bad = red
warning, attention = yellow
info = blue

## Tints and shades
--color-primary: hexCode
--color-primary-10-tint: colormix(var(--color-primary) 90%, var(--color-white) 10% );
--color-primary-10-shade: colormix(var(--color-primary) 90%, var(--color-black) 10% ); 

* Shades and tints in increments of 10.
* Extra shades and tints of 3%, 5% and 7%


