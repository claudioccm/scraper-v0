# Tokens
- Spaces and Sizes will follow [utopia.fyi](https://utopia.fyi/) system
- Colors will follow 

# Base
- reset.css is done. It follows https://cube.fyi/ global.css
- fonts.css is a simple configuration file for external font import. 
- typography.css is done. Simple file that defines most of the baseline typoegraphic styels. We can revise/expand later.
- everylayout.css is done. It defines most of the https://every-layout.dev/ helper classes. 

## Utils
- utilities are done. We can revise/expand later.

# Components
Component Organization and Composability will follow https://atomicdesign.bradfrost.com/chapter-1/



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


