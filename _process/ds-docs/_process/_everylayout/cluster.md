# The Cluster (Inferred)

**Note:** The official documentation for The Cluster is part of the paid version of Every Layout. This documentation is inferred from its usage in the free "Composition" and other examples.

## The problem

How do you group a collection of items, like tags, keywords, or buttons, so they sit nicely together on a horizontal axis and wrap gracefully onto new lines when space runs out, all while maintaining consistent spacing?

Standard inline elements will wrap, but controlling their spacing without resorting to hacks can be tricky. You might apply `margin` to all items, but this can lead to uneven spacing on the edges of the container or inconsistent gaps between wrapped lines.

## The Inferred Solution

The Cluster layout primitive appears to solve this by creating a Flexbox-based context that handles the alignment and spacing of a group of child elements. It's ideal for creating tag clouds, button groups, and lists of categories.

The core idea is to use `display: flex` with `flex-wrap: wrap` and apply a `gap` (or a margin-based equivalent) to ensure consistent spacing both horizontally and vertically between all items, regardless of wrapping.

### Example CSS

A likely implementation of the Cluster would involve a simple but powerful CSS rule:

```css
.cluster {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space, 1rem); /* Use CSS Gap for consistent spacing */
  align-items: center; /* Vertically align items in case they have different heights */
}
```

This approach uses the `gap` property, which is the modern and preferred way to create space between flex items. It elegantly handles spacing on all sides without extra margin on the container's edges.

### The Negative Margin Trick (Alternative)

An older but still common alternative to `gap` is the "negative margin" technique. This would also be a plausible implementation for the Cluster.

```css
.cluster {
  display: flex;
  flex-wrap: wrap;
  margin: calc(var(--space, 1rem) / 2 * -1); /* Negative margin on the container */
}

.cluster > * {
  margin: calc(var(--space, 1rem) / 2); /* Positive margin on the children */
}
```
This technique makes the children appear to have a gap between them, while the negative margin on the parent container "pulls" the layout back into alignment, so there is no unwanted space on the outside edges.

## Use Cases

The Cluster is perfect for:

*   **Tag lists:** Displaying a set of tags or keywords.
*   **Button groups:** Grouping a series of actions together.
*   **Social media links:** A row of icons linking to different profiles.
*   **Category badges:** A list of categories associated with a blog post or product.

### Composition Example: Dialog Footer

In the "Composition" example for the dialog, the footer buttons are arranged using a Cluster. This ensures that the "Okay" and "Cancel" buttons are grouped together and properly spaced.

![The dialog is divided into its constituent layouts, made possible with the Cluster, Stack, Box, and Center layout primitives](https://every-layout.dev/images/illustrations/composition_dialog_primitives.svg)
