# The Reel (Inferred)

**Note:** The official documentation for The Reel is part of the paid version of Every Layout. This documentation is heavily inspired by the implementation and explanation provided at [cu.harrycresswell.com](https://cu.harrycresswell.com/compositions/reel/), which in turn is inspired by Every Layout.

## The problem

You have a collection of items that should be displayed in a single horizontal track, but there isn't enough space to show them all at once. You want to create a horizontally scrolling container, or a "reel," to present this content without forcing a vertical layout or wrapping.

This pattern is common for image galleries, product carousels, or lists of related articles.

## The Inferred Solution

The Reel component creates a horizontally scrolling container for a series of items. It uses Flexbox to lay out the items in a single row and enables horizontal scrolling when the content overflows. It can also be enhanced with CSS scroll snap for a better user experience.

### Example CSS

A possible implementation of the Reel component could look like this:

```css
.reel {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-color: #ccc #eee; /* Light and dark parts of the scrollbar */
}

.reel > * {
  flex-shrink: 0;
}

.reel > * + * {
  margin-left: var(--space, 1rem);
}

.reel-with-snap {
  scroll-snap-type: x mandatory;
}

.reel-with-snap > * {
  scroll-snap-align: start;
}
```

### How It Works

1.  **`display: flex`**: This arranges the child elements in a horizontal line.
2.  **`overflow-x: auto`**: This is the key to the horizontal scrolling. It shows a scrollbar only when the content overflows the container's width.
3.  **`overflow-y: hidden`**: This prevents any unwanted vertical scrolling.
4.  **`flex-shrink: 0` on children**: This ensures that the items in the reel do not shrink to fit the container, which is what allows them to overflow and create the scrolling effect.
5.  **`margin-left` on adjacent siblings**: This creates a consistent gap between the items in the reel.
6.  **Scroll Snap (Optional)**: By adding a class like `.reel-with-snap`, you can enable CSS scroll snapping.
    *   `scroll-snap-type: x mandatory`: This tells the container to snap on the horizontal axis.
    *   `scroll-snap-align: start`: This tells the child elements to snap to the start of the container.

## Use Cases

The Reel component is ideal for:

*   **Image Galleries:** Creating a horizontally scrollable gallery of images.
*   **Product Carousels:** Showcasing a list of products that users can scroll through.
*   **Related Content:** Displaying a list of related articles or videos at the end of a post.
*   **"Sausage" Links:** A common pattern for a list of filter tags or categories.
