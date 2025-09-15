# The Center (Derived from The Cover)

## The problem

For years, there was consternation about how hard it was to horizontally and vertically center something with CSS. It was used by detractors of CSS as a kind of exemplary “proof” of its shortcomings.

The truth is, there are numerous ways to center content with CSS. However, there are only so many ways you can do it without fear of overflows, overlaps, or other such breakages. For example, we could use `relative` positioning and a `transform` to vertically center an element within a parent:

```css
.parent {
  /* ↓ Give the parent the height of the viewport */
  block-size: 100vh;
}

.parent > .child {
  position: relative;
  /* ↓ Push the element down 50% of the parent */
  inset-block-start: 50%;
  /* ↓ Then adjust it by 50% of its own height */
  transform: translateY(-50%);
}
```

What’s neat about this is the `translateY(-50%)` part, which compensates for the height of the element itself—no matter what that height is. What’s less than neat is the top and bottom overflow produced when the child element's content makes it taller than the parent. We have not, so far, designed the layout to tolerate dynamic content.

![On the left, the child element is shorter than the container, so fits in its vertical center. On the right, it is taller. It is still central, but breaches the top and bottom edges of the parent and overflows.](https://every-layout.dev/images/illustrations/cover_transform_problem.svg)

Perhaps the most robust method is to combine Flexbox’s `justify-content: center` (horizontal) and `align-items: center` (vertical).

```css
.centered {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

### Proper handling of height

Just applying the Flexbox CSS will not, on its own, have a visible effect on vertical centering because, by default, the `.centered` element’s height is determined by the height of its content (implicitly, `block-size: auto`). This is something sometimes referred to as _intrinsic sizing_, and is covered in more detail in the [**Sidebar** layout](https://every-layout.dev/layouts/sidebar) documentation.

Setting a fixed height—as in the unreliable `transform` example from before—would be foolhardy: we don’t know ahead of time how much content there will be, or how much vertical space it will take up. In other words, there’s nothing stopping overflow from happening.

![On the left, the child element is in the vertical center of the 100vh high parent. On the right, the element is taller than 100vh and breaches the bottom edge to overflow.](https://every-layout.dev/images/illustrations/cover_fixed_height.svg)

Instead, we can set a `min-block-size` ( `min-height` in the `horizontal-tb` writing mode). This way, the element will expand vertically to accommodate the content, wherever the natural ( `auto`) height happens to be more than the `min-block-size`. Where this happens, the provision of some vertical padding ensures the centered content does not meet the edges.

![On the left, the child element is not as tall as the parent’s min-height, so appears in the vertical center. On the right, the parent element has grown past its min-height to accommodate a taller child.](https://every-layout.dev/images/illustrations/cover_min_height.svg)

### Box sizing

To ensure the parent element retains a height of `100vh`, despite the additional padding, a `box-sizing: border-box` value must be applied. Where it is not, the padding is _added_ to the total height.

The `box-sizing: border-box` is so desirable, it is usually applied to all elements in a global declaration block. The use of the `*` (universal) selector means all elements are affected.

```css
* {
  box-sizing: border-box;
  /* other global styles */
}
```

This is perfectly serviceable where only one centered element is in contention. But we have a habit of wanting to include other elements, above and below the centered one. Perhaps it's a close button in the top right, or a “read more” indicator in the bottom center. In any case, I need to handle these cases in a modular fashion, and without producing breakages.

## The solution

What I need is a layout component that can handle vertically centered content (under a `min-block-size` threshold) and can accommodate top/header and bottom/footer elements. To make the component truly _composable_ I should be able to add and remove these elements in the HTML without having to _also_ adapt the CSS. It should be modular, and therefore not a coding imposition on content editors.

The **Cover** component is a Flexbox context with `flex-direction: column`. This declaration means child elements are laid out vertically rather than horizontally. In other words, the 'flow direction' of the Flexbox formatting context is returned to that of a standard block element.

```css
.cover {
  display: flex;
  flex-direction: column;
}
```

The **Cover** has one _principal_ element that should always gravitate towards the center. In addition, it can have one top/header element and/or one bottom/footer element.

![Each of the four possible configurations. In each case, the principal element is in the center.](https://every-layout.dev/images/illustrations/cover_configurations.svg)

How do we manage all these cases without having to adapt the CSS? First, we give the centered element ( `h1` in the example, but it can be any element) `auto` margins. This can be done in one declaration using `margin-block`:

```css
.cover {
  display: flex;
  flex-direction: column;
}

.cover > h1 {
  margin-block: auto;
}
```

These _push_ the element away from anything above and below it, moving it into the center of the available space. Critically, it will _push off_ the inside edge of a parent _or_ the top/bottom edge of a sibling element.

![On the left, vertical auto margins place the child element in the exact vertical center. On the right, a header element is in place. The centered element is in the vertical center of the available space](https://every-layout.dev/images/illustrations/cover_auto_margins.svg)

Image caption: Note that, in the right-hand configuration, the centered element is in the vertical center of the _available_ space.

### Horizontal centering

So far I've not tackled horizontal centering, and that's quite deliberate. Layout components should try to solve just one problem—and the modular centering problem is a peculiar one. The [**Center** layout](https://every-layout.dev/layouts/center) handles horizontal centering and can be used in composition with the **Cover**. You might wrap the **Cover** in a **Center** or make a **Center** one or more of its children. It's all about [_composition_](https://every-layout.dev/rudiments/composition).
