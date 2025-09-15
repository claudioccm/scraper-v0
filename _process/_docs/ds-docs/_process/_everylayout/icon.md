# The Icon (Inferred)

**Note:** The official documentation for The Icon is part of the paid version of Every Layout. This documentation is inferred from common web development practices for creating accessible and flexible icon systems.

## The problem

You need a consistent and reliable way to display icons alongside text. The icons should scale with the text size, align correctly with the text, and have consistent spacing. Using icon fonts can have accessibility issues, and image-based icons don't scale well.

The ideal solution is a component that uses SVG for its scalability and accessibility benefits, and provides simple props to control its appearance and relationship with adjacent text.

## The Inferred Solution

The Icon component is a small, inline-level primitive for displaying SVG icons. It is designed to be used within a line of text, like a character, and to inherit the color of the surrounding text.

### Example CSS

A plausible implementation for the Icon component would focus on sizing and alignment:

```css
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  vertical-align: middle;
  fill: currentColor; /* Inherit text color */
}

.icon-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5em; /* Spacing between icon and text */
}
```

### How It Works

1.  **`display: inline-block`**: This allows the icon to sit within the flow of text while also allowing `width` and `height` to be set.
2.  **`width: 1em` and `height: 1em`**: Using the `em` unit is crucial. It sizes the icon relative to the `font-size` of its parent element. If you increase the text size, the icon will scale up proportionally.
3.  **`vertical-align: middle`**: This helps to vertically align the icon with the text. The exact value might need to be adjusted depending on the font and the icon's design.
4.  **`fill: currentColor`**: This is a powerful feature for SVGs. It makes the icon's fill color the same as the `color` of the parent text. This is great for theming and hover effects.
5.  **`.icon-text` wrapper**: A common pattern is to use a wrapper element with `display: inline-flex` and `align-items: center` to get perfect alignment and spacing between the icon and its label. The `gap` property provides a consistent space.

### SVG Best Practices

*   **Inline SVG vs. Sprite Sheet:** Icons can be embedded directly in the HTML (inline SVG) or referenced from an SVG sprite sheet. Sprite sheets are generally more performant as the icons can be cached by the browser.
*   **Accessibility:**
    *   If the icon is purely decorative, it should have `aria-hidden="true"`.
    *   If the icon is interactive (e.g., inside a button with no text), it should have a descriptive `aria-label` on the button and a `<title>` element inside the SVG.

## Use Cases

The Icon component is perfect for:

*   **Buttons:** Adding a visual cue to a button's text label.
*   **Links:** Indicating an external link or a file download.
*   **Lists:** Using icons as bullet points in a list.
*   **Alerts and Notifications:** Displaying an icon to indicate the type of message (e.g., success, warning, error).
