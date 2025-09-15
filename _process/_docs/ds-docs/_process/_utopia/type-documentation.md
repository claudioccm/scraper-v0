# Utopia Type Documentation

## Fluid Typography Calculator

This tool helps you create responsive type scales that scale smoothly between minimum and maximum viewport widths.

### Configuration Options

- **Min viewport width**: The smallest screen size to optimize for
- **Max viewport width**: The largest screen size to optimize for
- **Base font size**: The font size at your minimum viewport width
- **Type scale ratio**: The ratio between each step in your type scale (e.g., 1.2 for Major Third, 1.25 for Perfect Fourth)

### Common Type Scale Ratios

- Minor Third: 1.2
- Major Third: 1.25
- Perfect Fourth: 1.333
- Perfect Fifth: 1.5
- Golden Ratio: 1.618

## Calculated Font Sizes

The calculator generates a table of font size values in pixels for your type scales at the minimum and maximum viewport widths.

### Scale Steps
- Positive steps (larger text): 5, 4, 3, 2, 1
- Base step: 0
- Negative steps (smaller text): -1, -2

### Adding Viewport Widths
You can add additional viewport widths to see how your font sizes scale at different breakpoints.

## CSS Generator

The tool generates CSS custom properties (CSS variables) using the `clamp()` function for fluid typography.

### Example CSS Output

```css
/* @link https://utopia.fyi/type/calculator?c=360,18,1.2,1240,20,1.25,5,2,&s=0.75|0.5|0.25,1.5|2|3|4|6,s-l&g=s,l,xl,12 */

:root {
  --step--2: clamp(0.7813rem, 0.7736rem + 0.0341vw, 0.8rem);
  --step--1: clamp(0.9375rem, 0.9119rem + 0.1136vw, 1rem);
  --step-0: clamp(1.125rem, 1.0739rem + 0.2273vw, 1.25rem);
  --step-1: clamp(1.35rem, 1.2631rem + 0.3864vw, 1.5625rem);
  --step-2: clamp(1.62rem, 1.4837rem + 0.6057vw, 1.9531rem);
  --step-3: clamp(1.944rem, 1.7405rem + 0.9044vw, 2.4414rem);
  --step-4: clamp(2.3328rem, 2.0387rem + 1.3072vw, 3.0518rem);
  --step-5: clamp(2.7994rem, 2.384rem + 1.8461vw, 3.8147rem);
}
```

### How clamp() Works

The `clamp()` function takes three values:
1. **Minimum value**: The smallest size the text should be
2. **Preferred value**: A fluid value that scales with viewport width
3. **Maximum value**: The largest size the text should be

Example: `clamp(0.7813rem, 0.7736rem + 0.0341vw, 0.8rem)`
- Minimum: 0.7813rem (12.5px)
- Fluid calculation: 0.7736rem + 0.0341vw
- Maximum: 0.8rem (12.8px)

## Features

### Table View
Shows font sizes in a tabular format for easy reference.

### Graph View
Visual representation of how font sizes scale between viewport widths.

### Visualizer
Preview of your type scale at different viewport widths.

### Preview Mode
See how your type scale looks at a specific viewport width (e.g., 1920px).

## Usage Tips

1. **Start with a comfortable base size**: 16-18px is typically a good starting point
2. **Choose an appropriate scale ratio**: Major Third (1.25) or Perfect Fourth (1.333) work well for most projects
3. **Consider your content**: Make sure your smallest text remains readable on mobile devices
4. **Test across devices**: Use the preview feature to check your type scale at different viewport widths
5. **Integrate with your design system**: Use the generated CSS custom properties in your component library

## Browser Support

The `clamp()` function is supported in all modern browsers:
- Chrome 79+
- Firefox 75+
- Safari 13.1+
- Edge 79+

For older browsers, consider using a fallback or a PostCSS plugin that converts clamp() to more compatible syntax.

## Related Tools

- **Space Calculator**: Create fluid spacing scales that complement your type scale
- **Grid Calculator**: Build fluid grids using your type and space values
- **Clamp Calculator**: Generate individual fluid values for specific use cases
