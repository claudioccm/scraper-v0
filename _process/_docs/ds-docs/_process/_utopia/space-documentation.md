# Utopia Space Documentation

## Fluid Spacing Calculator

This tool helps you create responsive spacing scales that work harmoniously with your fluid type system. Using the same base values from the fluid type calculator, it generates a related fluid space system.

## How It Works

The space calculator uses your type scale settings to create a corresponding spacing scale. It generates:

1. **Individual space values** at different t-shirt sizes (3xs, 2xs, xs, s, m, l, xl, 2xl, 3xl)
2. **Space value pairs** for single steps and custom combinations
3. **CSS custom properties** using clamp() for fluid spacing

### Base Configuration

The tool inherits settings from your type scale:
- **Min viewport width**: Same as your type scale minimum
- **Max viewport width**: Same as your type scale maximum
- **Base space size**: Typically matches your base font size
- **Space scale ratio**: Usually matches or complements your type scale ratio

## Space Sizes (T-Shirt System)

The calculator uses a t-shirt sizing system for easy reference:

| Size | Multiplier | Purpose |
|------|------------|---------|
| 3xs | Very small | Fine details, borders |
| 2xs | Extra small | Small gaps, padding |
| xs | Small | Component spacing |
| s | Small/Medium | Standard spacing |
| m | Medium | Section spacing |
| l | Large | Major section breaks |
| xl | Extra large | Page sections |
| 2xl | 2X Large | Major layout breaks |
| 3xl | 3X Large | Page-level spacing |

## Space Value Pairs

### Single Step Pairs
These provide smooth transitions between adjacent sizes in your scale:

- 3xs → 2xs
- 2xs → xs
- xs → s
- s → m
- m → l
- l → xl
- xl → 2xl
- 2xl → 3xl

### Custom Step Pairs
For more dramatic spacing changes, you can create custom pairs that skip steps:

- s → l (skips medium)
- xs → xl (skips multiple steps)
- Any combination you need

## CSS Generator

The tool generates CSS custom properties for:

### Individual Space Values
```css
:root {
  --space-3xs: clamp(0.3125rem, 0.3125rem + 0vw, 0.3125rem);
  --space-2xs: clamp(0.5625rem, 0.5369rem + 0.1136vw, 0.625rem);
  --space-xs: clamp(0.875rem, 0.8494rem + 0.1136vw, 0.9375rem);
  --space-s: clamp(1.125rem, 1.0739rem + 0.2273vw, 1.25rem);
  --space-m: clamp(1.6875rem, 1.6108rem + 0.3409vw, 1.875rem);
  --space-l: clamp(2.25rem, 2.1477rem + 0.4545vw, 2.5rem);
  --space-xl: clamp(3.375rem, 3.2216rem + 0.6818vw, 3.75rem);
  --space-2xl: clamp(4.5rem, 4.2955rem + 0.9091vw, 5rem);
  --space-3xl: clamp(6.75rem, 6.4432rem + 1.3636vw, 7.5rem);
}
```

### One-Up Pairs
```css
:root {
  /* One-up pairs */
  --space-3xs-2xs: clamp(0.3125rem, 0.1847rem + 0.5682vw, 0.625rem);
  --space-2xs-xs: clamp(0.5625rem, 0.4091rem + 0.6818vw, 0.9375rem);
  --space-xs-s: clamp(0.875rem, 0.7216rem + 0.6818vw, 1.25rem);
  --space-s-m: clamp(1.125rem, 0.8182rem + 1.3636vw, 1.875rem);
  --space-m-l: clamp(1.6875rem, 1.3551rem + 1.4773vw, 2.5rem);
  --space-l-xl: clamp(2.25rem, 1.6364rem + 2.7273vw, 3.75rem);
  --space-xl-2xl: clamp(3.375rem, 2.7102rem + 2.9545vw, 5rem);
  --space-2xl-3xl: clamp(4.5rem, 3.2727rem + 5.4545vw, 7.5rem);
}
```

### Custom Pairs
```css
:root {
  /* Custom pairs */
  --space-s-l: clamp(1.125rem, 0.5625rem + 2.5vw, 2.5rem);
}
```

## How clamp() Works for Spacing

The `clamp()` function ensures your spacing scales smoothly:

1. **Minimum value**: The smallest space size
2. **Fluid calculation**: Scales with viewport width using `vw` units
3. **Maximum value**: The largest space size

Example: `clamp(0.3125rem, 0.3125rem + 0vw, 0.3125rem)`
- Minimum: 0.3125rem (5px)
- Fluid: 0.3125rem + 0vw (no scaling in this case)
- Maximum: 0.3125rem (5px)

## Customization Options

### Adding/Removing Sizes
- Add more t-shirt sizes as needed
- Remove sizes you don't use
- Customize multipliers for each size

### Viewport Widths
- Add additional breakpoints
- See how spacing changes at different viewport widths
- Customize the fluid behavior between breakpoints

### Scale Ratios
- Use the same ratio as your type scale for consistency
- Choose different ratios for spacing-only adjustments
- Create custom ratios for specific design needs

## Integration with Design Systems

### CSS Custom Properties
Use the generated variables throughout your CSS:

```css
.my-component {
  padding: var(--space-s);
  margin-bottom: var(--space-m);
  gap: var(--space-xs);
}
```

### Component Libraries
Apply spacing consistently across components:

```css
.button {
  padding: var(--space-s) var(--space-m);
}

.card {
  padding: var(--space-m);
  margin-bottom: var(--space-l);
}

.grid {
  gap: var(--space-l);
}
```

### Utility Classes
Create utility classes for rapid prototyping:

```css
.p-s { padding: var(--space-s); }
.p-m { padding: var(--space-m); }
.p-l { padding: var(--space-l); }

.mb-s { margin-bottom: var(--space-s); }
.mb-m { margin-bottom: var(--space-m); }
.mb-l { margin-bottom: var(--space-l); }

.gap-s { gap: var(--space-s); }
.gap-m { gap: var(--space-m); }
.gap-l { gap: var(--space-l); }
```

## Usage Examples

### Component Spacing
```css
.article-header {
  margin-bottom: var(--space-xl);
}

.article-content {
  margin-bottom: var(--space-l);
}

.article-footer {
  margin-top: var(--space-xl);
}
```

### Layout Spacing
```css
.main-layout {
  display: grid;
  gap: var(--space-2xl);
  padding: var(--space-l);
}
```

### Responsive Spacing
The clamp() function handles responsiveness automatically:

```css
/* Spacing that grows from 16px to 40px */
.custom-spacing {
  padding: var(--space-s-l);
}
```

## Best Practices

1. **Consistency**: Use the same base values as your type scale
2. **Hierarchy**: Establish clear relationships between space sizes
3. **Purpose**: Each size should have a clear use case
4. **Testing**: Check spacing at different viewport widths
5. **Documentation**: Document your space scale for your team

## Browser Support

The `clamp()` function is supported in all modern browsers:
- Chrome 79+
- Firefox 75+
- Safari 13.1+
- Edge 79+

For older browsers, consider:
- Using a PostCSS plugin to convert clamp()
- Providing static fallbacks
- Using JavaScript to polyfill fluid behavior

## Related Tools

- **Type Calculator**: Create fluid type scales that complement your spacing
- **Grid Calculator**: Build fluid grids using your type and space values
- **Clamp Calculator**: Generate individual fluid values for specific use cases

## Integration Workflow

1. **Set up your type scale** in the type calculator
2. **Configure your space scale** using the same parameters
3. **Generate CSS custom properties** for both type and space
4. **Apply consistently** across your components and layouts
5. **Test and iterate** at different viewport widths
6. **Document your system** for your team

This approach ensures your type and spacing work together harmoniously across all device sizes.
