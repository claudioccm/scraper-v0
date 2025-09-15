# The Grid (Inferred)

**Note:** The official documentation for The Grid is part of the paid version of Every Layout. This documentation is inferred from external resources, common CSS grid techniques, and the principles of the Every Layout system.

## The problem

You need to arrange a series of items into a responsive grid. The number of columns should adapt to the available container width, not the viewport size. A fixed number of columns (e.g., a 12-column grid) is often too rigid and leads to complex, breakpoint-heavy CSS.

The ideal solution is a grid that automatically adjusts the number of columns to fit its container, ensuring that the grid items are never too narrow or too wide.

## The Inferred Solution

The Grid component is a layout primitive that creates a responsive grid of items. It uses modern CSS Grid layout features to automatically handle the number of columns and the wrapping of items.

The key is to define a minimum item size. The grid will then fit as many columns of at least that size as possible into the container. When the container shrinks, the number of columns decreases, and the items wrap onto new rows.

### Example CSS

A likely implementation for the Grid component would use the `auto-fit` and `minmax()` functions in the `grid-template-columns` property:

```css
.grid {
  display: grid;
  gap: var(--space, 1rem);
  grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-item-width, 15rem), 1fr));
}
```

### How It Works

1.  **`display: grid`**: This establishes the grid formatting context.
2.  **`gap`**: This creates consistent spacing between all grid items, both horizontally and vertically.
3.  **`grid-template-columns: repeat(auto-fit, minmax(var(--grid-min-item-width, 15rem), 1fr))`**: This is the core of the responsive behavior.
    *   **`repeat(auto-fit, ...)`**: This tells the grid to create as many columns as will fit into the available space. `auto-fit` will expand the grid items to fill the remaining space, which is usually the desired behavior.
    *   **`minmax(var(--grid-min-item-width, 15rem), 1fr)`**: This defines the size of each column.
        *   `var(--grid-min-item-width, 15rem)` sets a minimum width for the grid items. They will not shrink below this size.
        *   `1fr` allows the grid items to grow and fill any remaining space in the container, ensuring the grid is always flush with the edges.

This combination creates a powerful, intrinsically responsive grid that doesn't need any `@media` queries to adapt its layout.

## Use Cases

The Grid component is perfect for:

*   **Card Layouts:** Displaying a collection of cards for blog posts, products, or case studies.
*   **Image Galleries:** Creating a responsive gallery of images.
*   **Feature Lists:** Showcasing a set of features with icons and text in a grid format.
*   **Team Member Profiles:** Arranging photos and information for a team in a grid.
