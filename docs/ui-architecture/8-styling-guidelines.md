# 8. Styling Guidelines

## Styling Approach

Your project uses a **PostCSS + CSS Layers** approach with a well-organized architecture:

**Layer Hierarchy (from lowest to highest specificity):**
1. **reset** - CSS normalization and resets
2. **defaults** - Base typography, fonts, and CSS custom properties
3. **components** - Component-specific styles
4. **utils** - Utility classes for spacing, colors
5. **overrides** - Final overrides and exceptions

**Key Benefits:**
- **Predictable Cascade**: Layer order prevents specificity wars
- **PostCSS Processing**: Modern CSS features with broad browser support
- **CSS Custom Properties**: Dynamic theming and component customization
- **No Build Dependencies**: Pure CSS approach, no Sass/Less/Styled-components complexity
- **Performance**: No runtime CSS-in-JS overhead

## Global Theme Variables

```css
/* public/css/vars/theme-system.css */
:root {
  /* Color System - HSL for better manipulation */
  --base-hsl: 220, 13%, 18%;
  --base-color: hsl(var(--base-hsl));
  
  --primary-hsl: 214, 84%, 56%;
  --primary-color: hsl(var(--primary-hsl));
  
  --secondary-hsl: 45, 100%, 51%;
  --secondary-color: hsl(var(--secondary-hsl));
  
  --tertiary-hsl: 342, 75%, 51%;
  --tertiary-color: hsl(var(--tertiary-hsl));
  
  --accent-hsl: 159, 64%, 52%;
  --accent-color: hsl(var(--accent-hsl));
  
  --white-hsl: 0, 0%, 100%;
  --white-color: hsl(var(--white-hsl));
  
  /* Semantic Colors */
  --success-hsl: 142, 76%, 36%;
  --success-color: hsl(var(--success-hsl));
  
  --warning-hsl: 38, 92%, 50%;
  --warning-color: hsl(var(--warning-hsl));
  
  --error-hsl: 0, 84%, 60%;
  --error-color: hsl(var(--error-hsl));
  
  /* Typography Scale - Fluid responsive */
  --font-size-xs: clamp(0.694rem, 0.12vw + 0.669rem, 0.75rem);
  --font-size-s: clamp(0.833rem, 0.23vw + 0.787rem, 0.938rem);
  --font-size-m: clamp(1rem, 0.4vw + 0.925rem, 1.175rem);
  --font-size-l: clamp(1.2rem, 0.63vw + 1.088rem, 1.469rem);
  --font-size-xl: clamp(1.44rem, 0.96vw + 1.275rem, 1.836rem);
  --font-size-xxl: clamp(1.728rem, 1.42vw + 1.491rem, 2.295rem);
  
  /* Spacing Scale - Modular scale based on 1rem */
  --space-3xs: clamp(0.25rem, 0.1vw + 0.225rem, 0.3125rem);
  --space-2xs: clamp(0.5rem, 0.2vw + 0.45rem, 0.625rem);
  --space-xs: clamp(0.75rem, 0.3vw + 0.675rem, 0.9375rem);
  --space-s: clamp(1rem, 0.4vw + 0.9rem, 1.25rem);
  --space-m: clamp(1.5rem, 0.6vw + 1.35rem, 1.875rem);
  --space-l: clamp(2rem, 0.8vw + 1.8rem, 2.5rem);
  --space-xl: clamp(3rem, 1.2vw + 2.7rem, 3.75rem);
  --space-2xl: clamp(4rem, 1.6vw + 3.6rem, 5rem);
  --space-3xl: clamp(6rem, 2.4vw + 5.4rem, 7.5rem);
  
  /* Layout and Grid */
  --content-max-width: 75rem;
  --content-padding: var(--space-m);
  --border-radius-s: 0.25rem;
  --border-radius-m: 0.5rem;
  --border-radius-l: 1rem;
  
  /* Shadows - Layered depth system */
  --shadow-s: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  --shadow-m: 0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12);
  --shadow-l: 0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10);
  --shadow-xl: 0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05);
  
  /* Interactive States */
  --focus-ring: 0 0 0 3px hsl(var(--primary-hsl), 0.3);
  --transition-fast: 150ms ease-out;
  --transition-base: 250ms ease-out;
  --transition-slow: 350ms ease-out;
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  :root {
    --base-hsl: 220, 13%, 82%;
    --base-color: hsl(var(--base-hsl));
    
    /* Adjust other colors for dark mode */
    --primary-hsl: 214, 84%, 65%;
    --secondary-hsl: 45, 100%, 60%;
    
    /* Invert shadows for dark backgrounds */
    --shadow-s: 0 1px 3px rgba(0, 0, 0, 0.24), 0 1px 2px rgba(0, 0, 0, 0.48);
    --shadow-m: 0 3px 6px rgba(0, 0, 0, 0.30), 0 2px 4px rgba(0, 0, 0, 0.24);
  }
}

/* High contrast preference */
@media (prefers-contrast: high) {
  :root {
    --primary-hsl: 214, 100%, 50%;
    --secondary-hsl: 45, 100%, 40%;
    --border-width: 2px;
  }
}

/* Reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0ms;
    --transition-base: 0ms;
    --transition-slow: 0ms;
  }
  
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Future Implementation Notes

**Stakeholder-Driven Enhancements for Future Iterations:**

```css
/* FUTURE: Designer-friendly utilities (public/css/utils/design-utils.css) */
@layer utils {
  /* Debug utilities for designers */
  .debug-grid { outline: 1px solid red; }
  .debug-spacing { background: rgba(255, 0, 0, 0.1); }
  .design-mode { border: 2px dashed var(--accent-color); }
  
  /* Rapid prototyping utilities */
  .prototype-spacing-xs { padding: var(--space-xs); }
  .prototype-spacing-s { padding: var(--space-s); }
  .prototype-spacing-m { padding: var(--space-m); }
}

/* FUTURE: Content editor overrides (public/css/content-overrides.css) */
@layer overrides {
  .content-special .prose h1 {
    --_heading-color: var(--accent-color);
    --_heading-size: var(--font-size-xxl);
  }
  
  .content-wide { --_content-max-width: 90rem; }
  .content-narrow { --_content-max-width: 45rem; }
}

/* FUTURE: Component-specific custom property patterns */
.ccm-complex-component {
  /* Establish local component variables */
  --_component-bg: var(--surface-color, var(--base-color));
  --_component-text: var(--on-surface-color, var(--white-color));
  --_component-radius: var(--border-radius-m);
}
```

**Stakeholder Action Items for Future Iterations:**

- **📋 For Designers**: Create interactive style guide with live CSS custom property editing capabilities
- **⚙️ For Developers**: Implement CSS layer validation tools and ESLint rules for consistent token usage
- **📊 For PMs**: Establish design review process including automated token consistency checks
- **🔧 For DevOps**: Add CSS build optimization pipeline with critical CSS extraction
- **📝 For Content Team**: Document content style override patterns and CMS integration guidelines

**Architecture Highlights:**
- **HSL Color System**: Easier manipulation for variants and opacity changes
- **Fluid Typography**: `clamp()` for responsive text scaling across all devices
- **Modular Spacing**: Consistent scale across all components and layouts
- **Accessibility First**: Respects user preferences (dark mode, contrast, motion)
- **CSS Custom Properties**: Runtime theming without JavaScript dependencies
- **Layer Organization**: Predictable specificity without `!important` usage
- **PostCSS Integration**: Modern CSS features with automatic fallbacks for older browsers

---
