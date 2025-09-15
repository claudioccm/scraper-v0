# The Cover

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

All that remains is to ensure there is space between the (up to) three child elements where the `min-block-size` threshold has been breached.

![The header and footer elements have small margins. As the principal (centered) element grows, these margins keep the elements apart.](https://every-layout.dev/images/illustrations/cover_min_space.svg)

Currently, the `auto` margins simply collapse down to nothing. Since we can’t enter `auto` into a `calc()` function to adapt the margin ( `calc(auto + 1rem)` is invalid), the best we can do is to add `margin` to the header and footer elements contextually.

```css
.cover > * {
  margin-block: 1rem;
}

.cover > h1 {
  margin-block: auto;
}

.cover > :first-child:not(h1) {
  margin-block-start: 0;
}

.cover > :last-child:not(h1) {
  margin-block-end: 0;
}
```

Note, the use of [the cascade, specificity](https://piccalil.li/tutorial/css-specifity-and-the-cascade/) and negation to target the correct elements. First, we apply top and bottom margins to all the children, using a universal child selector. We then override this for the to-be-centered ( `h1`) element to achieve the `auto` margins. Finally, we use the `:not()` function to remove extraneous margin from the top and bottom elements _only_ if they are _not_ the centered element. If there is a centered element and a footer element, but no header element, the centered element will be the `:first-child` and must retain `margin-block-start: auto`.

### Shorthands

Notice how we use `margin-block: 1rem` and not `margin: 1rem 0`. The reason is that _this component_ only cares about the vertical margins to achieve its layout. By making the inline (horizontal in the default writing mode) margins `0`, we might be unduly undoing styles applied or inherited by an ancestor component.

Only set what you need to set.

Now it is safe to add spacing around the inside of the **Cover** container using `padding`. Whether there are one, two or three elements present, spacing now remains _symmetrical_, and our component modular without styling intervention.

```css
.cover {
  padding: 1rem;
  min-block-size: 100vh;
}
```

The `min-block-size` is set to `100vh`, so that the element _covers_ 100% of the viewport's height (hence the name). However, there's no reason why the `min-block-size` cannot be set to another value. `100vh` is considered a _sensible default_, and is the default value for the `minHeight` prop in the [custom element implementation](https://every-layout.dev/layouts/cover/#the-component) to come.

### Horizontal centering

So far I've not tackled horizontal centering, and that's quite deliberate. Layout components should try to solve just one problem—and the modular centering problem is a peculiar one. The [**Center** layout](https://every-layout.dev/layouts/center) handles horizontal centering and can be used in composition with the **Cover**. You might wrap the **Cover** in a **Center** or make a **Center** one or more of its children. It's all about [_composition_](https://every-layout.dev/rudiments/composition).

## Use cases

A typical use for the **Cover** would be to create the “above the fold” introductory content for a web page. In the following demo, a nested [**Cluster** element](https://every-layout.dev/layouts/cluster) is used to lay out the logo and navigation menu. In this case, a utility class ( `.text-align\:center`) is used to horizontally center the `<h1>` and footer elements.

It might be that you treat each section of the page as a **Cover**, and use the Intersection Observer API to animate aspects of the cover as it comes into view. A simple implementation is provided below (where the `data-visible` attribute is added as the element comes into view).

```js
if ('IntersectionObserver' in window) {
  const targets = Array.from(document.querySelectorAll('cover-l'));
  targets.forEach(t => t.setAttribute('data-observe', ''));
  const callback = (entries, observer) => {
    entries.forEach(entry => {
      entry.target.setAttribute('data-visible', entry.isIntersecting);
    });
  };

  const observer = new IntersectionObserver(callback);
  targets.forEach(t => observer.observe(t));
}
```

## The component

A custom element implementation of the **Cover** is provided for download. Consult the API and examples to follow for more information.

### Props API

The following props (attributes) will cause the **Cover** component to re-render when altered. They can be altered by hand—in browser developer tools—or as the subjects of inherited application state.

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| centered | `string` | `"h1"` | A simple selector such an element or class selector, representing the centered (main) element in the cover |
| space | `string` | `"var(--s1)"` | The minimum space between and around all of the child elements |
| minHeight | `string` | `"100vh"` | The minimum height (block-size) for the **Cover** |
| noPad | `boolean` | `false` | Whether the spacing is also applied as padding to the container element |

### Examples

#### Basic

Just a centered element (an `<h1>`) with no header or footer companions. The context/parent adopts the default `min-height` of `100vh`.

```html
<cover-l>
  <h1>Welcome!</h1>
</cover-l>
```

### One `<h1>` per page

For reasons of accessible document structure, there should only be one `<h1>` element per page. This is the page’s main heading to screen reader users. If you add several successive `<cover-l>` s, all but the first should have an `<h2>` to indicate it is a _subsection_ in the document structure.
