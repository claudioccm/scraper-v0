# The Frame (Inferred)

**Note:** The official documentation for The Frame is part of the paid version of Every Layout. This documentation is inferred from common web development patterns and the principles of the Every Layout system.

## The problem

You need to display media, like an image or a video, inside a container that maintains a specific aspect ratio (e.g., 16:9, 4:3, 1:1) as it resizes. If you just set the width of the media to `100%`, its height will adjust correctly, but the space it occupies will only be determined after the media has loaded, which can cause content to jump around on the page (layout shift).

The goal is to create a container that reserves the correct amount of space for the media before it loads, preventing layout shift and ensuring a smooth user experience.

## The Inferred Solution

The Frame component is a layout primitive that creates a container for embedded media, forcing it to maintain a consistent aspect ratio. This is a classic CSS technique often referred to as the "padding-top hack."

By setting the height of the container to zero and using `padding-top` or `padding-bottom` with a percentage value, you can create a box whose height is a precise ratio of its width. The content (the image or video) is then absolutely positioned to fill this padded box.

### Example CSS

A plausible implementation of the Frame component would look something like this:

```css
.frame {
  position: relative;
  display: block;
  height: 0;
  padding-bottom: var(--aspect-ratio, 56.25%); /* Default to 16:9 */
  overflow: hidden;
}

.frame > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* Ensures the content covers the frame */
}
```

### How It Works

1.  **`position: relative` on `.frame`**: Establishes a positioning context for the child element.
2.  **`height: 0` and `padding-bottom: 56.25%`**: This is the core of the trick. The percentage padding is calculated based on the container's *width*. So, a `padding-bottom` of `56.25%` results in a height that is 56.25% of the width, which is a perfect 16:9 aspect ratio (9 / 16 = 0.5625).
3.  **`position: absolute` on the child**: The child element (`> *`) is taken out of the normal document flow and positioned within the frame.
4.  **`width: 100%` and `height: 100%`**: This makes the child element fill the container completely.
5.  **`object-fit: cover`**: This is a useful addition to ensure that media like images will cover the entire frame without being stretched or distorted.

### Common Aspect Ratios

You can easily set different aspect ratios by changing the `--aspect-ratio` custom property (or the `padding-bottom` value):

*   **16:9** (widescreen): `56.25%`
*   **4:3** (standard): `75%`
*   **1:1** (square): `100%`
*   **3:2**: `66.66%`
*   **2:1**: `50%`

## Use Cases

The Frame component is perfect for:

*   **Responsive Video Embeds:** Ensuring YouTube or Vimeo embeds maintain their aspect ratio.
*   **Hero Images:** Creating a hero section with an image that scales correctly.
*   **Product Images:** Displaying product photos in a consistent and visually appealing way.
*   **Portfolio Thumbnails:** Creating a uniform grid of portfolio items.
