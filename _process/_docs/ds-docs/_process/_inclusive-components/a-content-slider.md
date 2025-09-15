[skip to content](https://inclusive-components.design/a-content-slider/#main)

## Get the book!

The
[Inclusive Components book](http://book.inclusive-components.design/) is now available, with
**updated and improved** content and demos.


![book cover with the strap line, accessible web interfaces piece by piece](https://inclusive-components.design/assets/images/on-light.svg?v=89073ee017)

Carousels (or 'content sliders') are like men. They are not _literally_ all bad — some are even helpful and considerate. But I don't trust anyone unwilling to acknowledge a glaring pattern of awfulness. Also like men, I appreciate that many of you would rather just avoid dealing with carousels, but often don't have the choice. Hence this article.

Carousels don't have to be bad, but we have a culture of making them bad. It is usually the features of carousels, rather than the underlying concept that is at fault. As with many things _inclusive_, the right solution is often not what you do but what you don't do in the composition of the component.

Here, we shall be creating something that fulfills the basic _purpose_ of a carousel — to allow the traversal of content along a horizontal axis — without being too reverential about the characteristics of past implementations.

* * *

## Control

In the broadest terms, any inclusive component should be:

- Clear and easy to use
- Interoperable with different inputs and outputs
- Responsive and device agnostic
- Performant
- **Under the user's control**

That last point is one I have been considering a lot lately, and it's why I added _"Do not include third parties that compromise user privacy"_ to the [inclusive web design checklist](https://github.com/Heydon/inclusive-design-checklist). As well as nefarious activities, users should also be protected from unexpected or unsolicited ones. This is why WCAG prescribes the [**2.2.2 Pause, Stop, Hide**](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-focus-order.html) criterion, mandating the ability to cease unwanted animations. In carousel terms, we're talking about the ability to cease the automatic cycling of content 'slides' by providing a pause or stop button.

![Carousel with pause button in bottom right corner](https://inclusive-components.design/content/images/2017/11/pause-1.svg)

It's something, but I don't think it's good enough. You're not truly [giving control](http://inclusivedesignprinciples.org/#give-control), you're relinquishing it then handing it back later. For people with vestibular disorders for whom animations can cause nausea, by the time the pause button is located, the damage will have been done.

For this reason, I believe a truly inclusive carousel is one that never moves without the user's say-so. This is why I prefer the term 'content slider' — accepting that the operative slider is the user, not a script. [Carousels](https://en.wikipedia.org/wiki/Carousel) start and stop moving as they see fit.

Our slider will not slide except when _slid_. But how is sliding instigated?

## Multimodal interaction

'Multimodal' means _"can be operated in different ways"_. Supporting different modes of operation may sound like a lot of work, but browsers are multimodal by default. Unless you screw up, all interactive content can be operated by mouse, keyboard, and (where supported) touch.

By deferring to standard browser behavior, we can support multimodality in our content slider with very little effort.

### Horizontal scrolling

The simplest conceivable content slider is a region containing unwrapped content laid out on a horizontal axis, traversable by scrolling the region horizontally. The declaration `overflow-x: scroll` does the heavy lifting.

```
.slider {
  overflow-x: scroll;
}

.slider li {
  display: inline-block;
  white-space: nowrap;
}

```

Save for some margins and borders to improve the appearance of the slider, this is a serviceable MVP (Minimum Viable Product) for mouse users. They can scroll by pulling at a visible scrollbar, or by hovering over the slider and using trackpad gestures. And that animation is _smooth_ too, because it's the browser doing it, not a JavaScript function fired every five milliseconds.

![Slider container showing horizontal scrollbar and items overflowing invisibly, ready to be moved into view.](https://inclusive-components.design/content/images/2017/11/scroll.svg)

(Where no scrollbar is visible, [affordance](https://www.interaction-design.org/literature/topics/affordances) is not so obvious. Don't worry, I'll deal with that shortly.)

### Keyboard support

For mouse users on most platforms, hovering their cursor over the slider is enough to enable scrolling of the hovered element. For touch users, simply swiping left and right does the trick. This is the kind of effortless multimodality that makes the web great.

For those using the keyboard, only when the slider is focused can it be interacted with.

Under normal circumstances, most elements do not receive focus my default — only designated interactive elements such as links and `<button>` s. Elements that are _not_ interactive should not be directly focusable by the user and, if they are, it is a violation of **[WCAG 2.4.3 Focus Order](https://www.w3.org/TR/UNDERSTANDING-WCAG20/navigation-mechanisms-focus-order.html)**. The reason being that focus should precede activation, and if activation is not possible then why put the element in the user's hand?

To make our slider element focusable by the user, we need to add `tabindex="0"`. Since the (focused) element will now be announced in screen readers, we ought to give it a role and label, identifying it. In the demos to follow, we'll be using the slider to show artworks, so "gallery" seems apt.

```
<div role="region" aria-label="gallery" tabindex="0" aria-describedby="instructions">
   <!-- list of gallery pictures -->
</div>

```

The `region` role is fairly generic, but is suitable for sizable areas of content and its presence ensures that `aria-label` is supported correctly and announced. You can't just go putting `aria-label` on any inert `<div>` or `<span>`.

Now that focus is attainable, the standard behavior of being able to scroll the element using the left and right arrow keys is possible. We just need a focus style to show sighted users that the slider is actionable:

```
[aria-label="gallery"]:focus {
  outline: 4px solid DodgerBlue;
  outline-offset: -6px; /* compensates for 2px border */
}

```

CodePen Embed - Basic content slider

``` cm-s-default
<h1>Photomontages by Hanna Höch</h1>
<div role="region" aria-label="gallery" tabindex="0" aria-describedby="instructions">
  <ul>
    <li><img src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_Astronomy-and-Movement-Dada-250%C3%97190-mm-drawing-and-collage-1922.jpg" alt="Astronomy and Movement Dada"></li>
    <li><img src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_-Mother-watercolour-and-photograph-collage-on-grey-paper-41o%C3%9735o-mm-1925%E2%80%936.jpg" alt="Mother"></li>
    <li><img src="https://i.pinimg.com/originals/53/d9/e2/53d9e2cf92b05d3f7ddd903e5c91538a.jpg" alt="untitled"></li>
    <li><img src="https://d32dm0rphc51dk.cloudfront.net/WGpoh18Y3iHXoI9g7rHSBw/large.jpg" alt="The beautiful girl"></li>
  </ul>
</div>
```

``` cm-s-default
[aria-label="gallery"] {
  border: 2px solid;
  padding: 1rem;
  overflow-x: scroll;
}

[aria-label="gallery"]:focus {
  outline: 4px solid DodgerBlue;
  outline-offset: -6px;
}

[aria-label="gallery"] ul {
  white-space: nowrap;
}

[aria-label="gallery"] li {
  display: inline-block;
  margin-right: 1rem;
}

[aria-label="gallery"] img {
  max-height: 60vh;
}

/* just page styles */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  margin: 3rem auto;
  max-width: 40rem;
  padding: 1rem;
  color: #111;
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
}
```

[Run Pen](https://codepen.io/heydon/embed/XzzaKv?default-tab=result&theme-id=0)

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon).

[See more by @heydon on CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

This Pen doesn't use any external JavaScript resources.


[Standalone demo of the basic content slider](https://s.codepen.io/heydon/debug/XzzaKv).

## Affordance

There are already a couple of things that tell the user this is a slidable region: the focus style, and the fact that the right-most image is usually cut off, suggesting there is more to see.

Depending on how critical it is for users to see the hidden content, you may deem this enough — plus it keeps things terse code-wise. However, we could spell things out much more clearly. Inclusive design mantra: _If in doubt, spell it out_.

We can do this by creating an 'instructions' element after the slider to reveal messages depending on the state of the slider itself. For instance, we could reveal a `:hover` specific message of _"scroll for more"_. The adjacent sibling combinator ( `+`) transcribes the `:hover` style to the `.instructions` element.

```
#hover {
  display: none;
}

[aria-label="gallery"]:hover + .instructions #hover {
  display: block;
}

```

![Slider with scroll for more hint in bar below the container. Arrows point in both directions.](https://inclusive-components.design/content/images/2017/11/scroll_for_more.svg)

The `:focus` message can be done in much the same way. But we'll also want to associate this message to the slider region for people running screen readers. Whether or not the region is of interest to any one screen reader user is irrelevant. It gives more context as to what it is for _should_ it be appealing to them. And they know better what they're avoiding if not.

For this we can use our faithful `aria-describedby` property. We point it at the focus message element using its `id` as the value:

```
<div role="region" aria-label="gallery" tabindex="0" aria-describedby="focus">
  <!-- list of gallery pictures -->
</div>
<div class="instructions">
  <p id="hover">scroll for more</p>
  <p id="focus">use your arrow keys for more</p>
</div>

```

Now, when focusing the gallery slider, screen readers will announce something similar to _"gallery, region, use your arrow keys for more."_ As a further note on multimodality, be assured that screen reader users in "browse mode" (stepping through each element) will simply enter the region and traverse through each image in turn. In other words, the slider is multimodal even for screen reader users.

![Shows path of screen reader user in browse mode, into the slider and from one item to the next](https://inclusive-components.design/content/images/2017/11/path.svg)The path of a screen reader user in browse mode is much the same as a keyboard user's path given linked/interactive slides. In either case, the browser/reader will slide the container to bring the focused items into view.

### Hover and focus?

It's interesting sometimes what you find in testing. In my case, I noticed that when I both hovered _and_ focused the slider, both messages appeared. Of course.

As a refinement, I discovered I could concatenate the states ( `:hover:focus`) and reveal a message that addresses both use cases at once.

```
[aria-label="gallery"]:hover:focus + .instructions #hover-and-focus {
  display: block;
}

```

Using the general sibling combinator ( `~`) I was able to make sure the other two messages were hidden (otherwise I'd see all three!):

```
[aria-label="gallery"]:hover:focus + .instructions #hover-and-focus ~ * {
  display: none;
}

```

Try hovering, then clicking, the slider in this demo:

CodePen Embed - Basic slider with kbd/mouse affordances

``` cm-s-default
<svg style="display:none">
  <symbol id="arrow-left" viewBox="0 0 10 10">
    <path fill="currentColor" d="m9 4h-4v-2l-4 3 4 3v-2h4z"/>
  </symbol>
  <symbol id="arrow-right" viewBox="0 0 10 10">
    <path fill="currentColor" d="m1 4h4v-2l4 3-4 3v-2h-4z"/>
  </symbol>
</svg>
<h1>Photomontages by Hanna Höch</h1>
<div role="region" aria-label="gallery" tabindex="0" aria-describedby="instructions">
  <ul>
    <li><img src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_Astronomy-and-Movement-Dada-250%C3%97190-mm-drawing-and-collage-1922.jpg" alt="Astronomy and Movement Dada"></li>
    <li><img src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_-Mother-watercolour-and-photograph-collage-on-grey-paper-41o%C3%9735o-mm-1925%E2%80%936.jpg" alt="Mother"></li>
    <li><img src="https://i.pinimg.com/originals/53/d9/e2/53d9e2cf92b05d3f7ddd903e5c91538a.jpg" alt="untitled"></li>
    <li><img src="https://d32dm0rphc51dk.cloudfront.net/WGpoh18Y3iHXoI9g7rHSBw/large.jpg" alt="The beautiful girl"></li>
  </ul>
</div>
<div class="instructions">
  <p id="hover-and-focus">
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
    scroll or use your arrow keys for more
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></use></svg>
  </p>
  <p id="hover">
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
    scroll for more
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"></use></svg>
  </p>
  <p id="focus">
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
    use your arrow keys for more
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"></use></svg>
  </p>
</div>
```

``` cm-s-default
[aria-label="gallery"] {
  border: 2px solid;
  padding: 1rem;
  overflow-x: scroll;
}

[aria-label="gallery"]:focus {
  outline: 4px solid DodgerBlue;
  outline-offset: -6px;
}

[aria-label="gallery"] ul {
  white-space: nowrap;
}

[aria-label="gallery"] li {
  display: inline-block;
  margin-right: 1rem;
}

[aria-label="gallery"] img {
  max-height: 40vh;
}

.instructions p {
  padding: 1rem;
  text-align: center;
  color: #fefefe;
  background-color: #111;
}

#focus, #hover, #hover-and-focus {
  display: none;
}

[aria-label="gallery"]:focus + .instructions #focus,
[aria-label="gallery"]:hover + .instructions #hover {
  display: block;
}

[aria-label="gallery"]:hover + .instructions #hover + #focus {
  display: none;
}

[aria-label="gallery"]:hover:focus + .instructions #hover-and-focus {
  display: block;
}

[aria-label="gallery"]:hover:focus + .instructions #hover-and-focus ~ * {
  display: none;
}

.instructions svg {
  height: 1.5rem;
  width: 1.5rem;
  fill: #fff;
  vertical-align: -0.5rem;
}

/* just page styles */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  margin: 3rem auto;
  max-width: 40rem;
  padding: 1rem;
  color: #111;
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
}
```

[Run Pen](https://codepen.io/heydon/embed/MOoMox?default-tab=result&theme-id=0)

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon).

[See more by @heydon on CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

This Pen doesn't use any external JavaScript resources.


[Standalone version of the content slider with mouse and keyboard affordances/instructions](https://s.codepen.io/heydon/debug/MOoMox).

### Handling the touch case

So far the touch experience is poor: No instructions are provided by default and, when you start swiping, some devices show the focus message, unhelpfully referring to "arrow keys" which most likely don't exist.

Handling the touch interaction case means first detecting if the user is operating by touch.

Critically, we don't want to detect _touch support_ at a device level, because so many devices support touch alongside other input methods. Instead, we just want to know if the _user_ happens to be interacting by touch. This is possible by detecting a single `touchstart` event. Here's a tiny script (all the best scripts are!):

```
window.addEventListener('touchstart', function touched() {
  document.body.classList.add('touch')
  window.removeEventListener('touchstart', touched, false)
}, false)

```

All the script does is detect an initial `touchstart` event, use it to add a `class` to the `<body>` element, and remove the listener. With the `class` in place, we can reveal a "swipe for more" message:

```
.touch .instructions p {
  display: none !important;
}

.touch .instructions #touch {
  display: block !important;
}

```

( _Note:_ The `!important` markers are there because I have simplified the selectors for readability, reducing their specificity in the process.)

## Slides

Depending on your use case and content, you could just stop and call the slider good here, satisfied that we have something interoperable and multimodal that only uses about 100 bytes of JavaScript. That's the advantage of choosing to make something simple, from scratch, rather than depending on a one-size-fits-all library.

But so far our slider doesn't really do "slides", which typically take up the full width of their container. If we handle this responsively, folks can admire each artwork in isolation, across different viewports. It would also be nice to be able to add some captions, so we're going to use `<figure>` and `<figcaption>` from now on.

```
<li>
  <figure>
    <img src="[url]" alt="[description]">
    <figcaption>[Title of artwork]</figcaption>
  </figure>
</li>

```

Let's switch to Flexbox for layout.

```
[aria-label="gallery"] ul {
  display: flex;
}

[aria-label="gallery"] li {
  list-style: none;
  flex: 0 0 100%;
}

```

- Just `display: flex` is all we need on the container because `flex-wrap` defaults to `nowrap`
- The `100%` in the `flex` shorthand is the `flex-basis`, making each item take up 100% of the `<ul>` container.

I'm making the `<figure>` a flex context too, so that I can center each figure's contents along both the vertical and horizontal axes.

```
[aria-label="gallery"] figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 50vh;
}

```

That `50vh` value is the only fixed(ish) dimension I am using. It's to make sure the slider has a reasonable height, but fits within the viewport. For the image and `<figcaption>` to always fit within the container, we make the image scale proportionately, but compensate for the predictable height of the `<figcaption>`. For this we can use `calc`:

```
[aria-label="gallery"] figcaption {
  padding: 0.5rem;
  font-style: italic;
}

[aria-label="gallery"] img {
  max-width: 100%;
  max-height: calc(100% - 2rem);
  margin-top: 2rem;
}

```

![Shows how the calc function helps to compensate for the caption height and center the image in frame.](https://inclusive-components.design/content/images/2017/11/measurements-1.svg)

With a padding of `0.5rem`, the caption text becomes approximately `2rem` high. This is removed from the flexible image's height. A `margin-top` of `2rem` then re-centers the image.

CodePen Embed - Content slider with captions

``` cm-s-default
<svg style="display:none">
  <symbol id="arrow-left" viewBox="0 0 10 10">
    <path fill="currentColor" d="m9 4h-4v-2l-4 3 4 3v-2h4z"/>
  </symbol>
  <symbol id="arrow-right" viewBox="0 0 10 10">
    <path fill="currentColor" d="m1 4h4v-2l4 3-4 3v-2h-4z"/>
  </symbol>
</svg>
<h1>Photomontages by Hanna Höch</h1>
<div role="region" aria-label="gallery" tabindex="0" aria-describedby="instructions">
  <ul>
    <li>
      <figure>
        <img src="https://i.pinimg.com/originals/fe/61/b8/fe61b828c9490313681cda5257bae997.jpg" alt="two male figures in bathing costumes stand behind a wall on a cryptically doodled background">
        <figcaption>Heads of State</figcaption>
      </figure>
    </li>
    <li>
      <figure>
        <img src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_Astronomy-and-Movement-Dada-250%C3%97190-mm-drawing-and-collage-1922.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
        <figcaption>Astronomy and Movement Dada</figcaption>
      </figure>
    </li>
    <li>
      <figure>
        <img src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_-Mother-watercolour-and-photograph-collage-on-grey-paper-41o%C3%9735o-mm-1925%E2%80%936.jpg" alt="Strange portrait-like montage. The subject is rotund and wears a torturous looking mask.">
          <figcaption>Mother</figcaption>
      </figure>
    </li>
    <li>
      <figure>
        <img src="https://i.pinimg.com/originals/53/d9/e2/53d9e2cf92b05d3f7ddd903e5c91538a.jpg" alt="Reclining nude on a colourful bed, wearing a large, monster-like mask and spectacles">
        <figcaption>Untitled</figcaption>
      </figure>
    </li>
    <li>
      <figure>
        <img src="https://d32dm0rphc51dk.cloudfront.net/WGpoh18Y3iHXoI9g7rHSBw/large.jpg" alt="Photomontoge of female figures and automobile parts, featuing several instances of the BMW logo">
        <figcaption>The Beautiful Girl</figcaption>
      </figure>
    </li>
  </ul>
</div>
<div id="instructions">
  <p id="touch">
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
    swipe for more
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></svg>
  </p>
  <p id="hover">
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
    scroll for more
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></svg>
  </p>
  <p id="focus">
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
    use arrow keys for more
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></svg>
  </p>
  <p id="hover-and-focus">
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
    scroll or use arrow keys for more
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></svg>
  </p>
</div>
```

``` cm-s-default
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  margin: 3rem auto;
  max-width: 40rem;
  padding: 1rem;
  color: #111;
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
}

[aria-label="gallery"] {
  border: 2px solid;
  overflow-x: scroll;
}

[aria-label="gallery"]:focus {
  outline: 4px solid DodgerBlue;
  outline-offset: -6px;
}

[aria-label="gallery"] ul {
  display: flex;
}

[aria-label="gallery"] li {
  list-style: none;
  flex: 0 0 100%;
  padding: 2rem;
  text-align: center;
}

[aria-label="gallery"] figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 50vh;
}

[aria-label="gallery"] figcaption {
  padding: 0.5rem;
  font-style: italic;
}

[aria-label="gallery"] img {
  max-height: calc(100% - 2rem);
  max-width: 100%;
  margin-top: 2rem;
}

#instructions p {
  padding: 1rem;
  text-align: center;
  color: #fefefe;
  background-color: #111;
}

#focus, #hover, #hover-and-focus, #touch {
  display: none;
}

[aria-label="gallery"]:focus + #instructions #focus,
[aria-label="gallery"]:hover + #instructions #hover {
  display: block;
}

[aria-label="gallery"]:hover + #instructions #hover + #focus {
  display: none;
}

[aria-label="gallery"]:hover:focus + #instructions #hover,
[aria-label="gallery"]:hover:focus + #instructions #focus {
  display: none;
}

[aria-label="gallery"]:hover:focus + #instructions #hover-and-focus {
  display: block;
}

#instructions svg {
  height: 1.5rem;
  width: 1.5rem;
  fill: #fff;
  vertical-align: -0.5rem;
}

.touch #instructions p {
  display: none !important;
}

.touch #instructions #touch {
  display: block !important;
}
```

``` cm-s-default
window.addEventListener('touchstart', function touched() {
  document.body.classList.add('touch')
  window.removeEventListener('touchstart', touched, false)
}, false)
```

[Run Pen](https://codepen.io/heydon/embed/mqMvEY?default-tab=result&theme-id=0)

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon).

[See more by @heydon on CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

This Pen doesn't use any external JavaScript resources.


[Standalone demo of the content slider with captions](https://s.codepen.io/heydon/debug/mqMvEY).

## Performance and lazy loading

One of the most striking observations noted in the classic [shouldiuseacarousel.com](http://shouldiuseacarousel.com/) is that, of carousels that contain linked content, _"1% clicked a feature. Of those, 89% were the first position."_ Even for auto-rotating carousels, [the research](https://erikrunyon.com/2013/01/carousel-stats/) shows that the number of clicks on slides proceeding the initial slide drops off dramatically.

It is entirely likely that the first image in our content slider is the only one that most readers will ever see. In which case, we should treat it as the only image, and load subsequent images _if_ the user chooses to view them.

We can use `IntersectionObserver`, where supported, to load each image as each slide begins to scroll into view.

![First slide is loaded. Two slides to the right, and not visible in the container are not loaded yet.](https://inclusive-components.design/content/images/2017/11/loading.svg)

Here's the script, with notes to follow:

```
const slides = document.querySelectorAll('[aria-label="gallery"] li')

const observerSettings = {
  root: document.querySelector('[aria-label="gallery"]')
}

if ('IntersectionObserver' in window) {
  const callback = (slides, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        return
      }
      let img = entry.target.querySelector('img')
      img.setAttribute('src', img.dataset.src)
      observer.unobserve(entry.target)
    })
  }

  const observer = new IntersectionObserver(callback, observerSettings)
  slides.forEach(t => observer.observe(t))
} else {
  Array.prototype.forEach.call(slides, function (s) {
    let img = s.querySelector('img')
    img.setAttribute('src', img.getAttribute('data-src'))
  })
}

```

- In `observerSettings` we define the outer gallery element as the root. When `<li>` elements become visible within it, that's when we take action.
- We feature detect with `'IntersectionObserver' in window` and just load the images straight away if not. Sorry, old browser users, but that's the best we can offer here — at least you get the content.
- For each slide that intersects, we set its `src` from the dummy `data-src` attribute in typical lazy loading fashion.

Note that, so users do not see broken images on particularly slow networks, we provide a placeholder image as the original `src` value. This takes the form of a tiny SVG data URI:

```
src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E"

```

### No JavaScript

Currently, users with no JavaScript running are bereft of images because the `data-src`/ `src` switching cannot occur. The simplest solution seems to be to provide `<noscript>` tags containing the images with their true `src` values already in place.

```
<noscript>
  <img src="[url]" alt="[description]">
</noscript>

```

CodePen Embed - Content slider with intersection observer

``` cm-s-default
<svg style="display:none">
  <symbol id="arrow-left" viewBox="0 0 10 10">
    <path fill="currentColor" d="m9 4h-4v-2l-4 3 4 3v-2h4z"/>
  </symbol>
  <symbol id="arrow-right" viewBox="0 0 10 10">
    <path fill="currentColor" d="m1 4h4v-2l4 3-4 3v-2h-4z"/>
  </symbol>
</svg>
<h1>Photomontages by Hanna Höch</h1>
<div role="region" aria-label="gallery" tabindex="0" aria-describedby="instructions">
  <ul>
    <li>
      <figure>
        <img data-src="https://i.pinimg.com/originals/fe/61/b8/fe61b828c9490313681cda5257bae997.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="two male figures in bathing costumes stand behind a wall on a cryptically doodled background">
        <noscript>
          <img src="https://i.pinimg.com/originals/fe/61/b8/fe61b828c9490313681cda5257bae997.jpg" alt="two male figures in bathing costumes stand behind a wall on a cryptically doodled background">
        </noscript>
        <figcaption>Heads of State</figcaption>
      </figure>
    </li>
    <li>
      <figure>
        <img data-src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_Astronomy-and-Movement-Dada-250%C3%97190-mm-drawing-and-collage-1922.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
        <noscript>
          <img src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_Astronomy-and-Movement-Dada-250%C3%97190-mm-drawing-and-collage-1922.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
        </noscript>
        <figcaption>Astronomy and Movement Dada</figcaption>
      </figure>
    </li>
    <li>
      <figure>
        <img data-src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_-Mother-watercolour-and-photograph-collage-on-grey-paper-41o%C3%9735o-mm-1925%E2%80%936.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="Strange portrait-like montage. The subject is rotund and wears a torturous looking mask.">
        <noscript>
          <img src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_-Mother-watercolour-and-photograph-collage-on-grey-paper-41o%C3%9735o-mm-1925%E2%80%936.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
        </noscript>
        <figcaption>Mother</figcaption>
      </figure>
    </li>
    <li>
      <figure>
        <img data-src="https://i.pinimg.com/originals/53/d9/e2/53d9e2cf92b05d3f7ddd903e5c91538a.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="Reclining nude on a colourful bed, wearing a large, monster-like mask and spectacles">
        <noscript>
          <img src="https://i.pinimg.com/originals/53/d9/e2/53d9e2cf92b05d3f7ddd903e5c91538a.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
        </noscript>
        <figcaption>Untitled</figcaption>
      </figure>
    </li>
    <li>
      <figure>
        <img data-src="https://d32dm0rphc51dk.cloudfront.net/WGpoh18Y3iHXoI9g7rHSBw/large.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="Photomontoge of female figures and automobile parts, featuing several instances of the BMW logo">
        <noscript>
          <img src="https://d32dm0rphc51dk.cloudfront.net/WGpoh18Y3iHXoI9g7rHSBw/large.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
        </noscript>
        <figcaption>The Beautiful Girl</figcaption>
      </figure>
    </li>
  </ul>
</div>
<div id="instructions">
  <p id="touch">
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
    swipe for more
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></svg>
  </p>
  <p id="hover">
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
    scroll for more
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></svg>
  </p>
  <p id="focus">
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
    use your arrow keys for more
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></svg>
  </p>
  <p id="hover-and-focus">
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
    scroll or use arrow keys for more
    <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></svg>
  </p>
</div>
```

``` cm-s-default
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  margin: 3rem auto;
  max-width: 40rem;
  padding: 1rem;
  color: #111;
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
}

[aria-label="gallery"] {
  border: 2px solid;
  overflow-x: scroll;
  scroll-snap-type: mandatory;
  scroll-snap-points-x: repeat(100%);
}

[aria-label="gallery"]:focus {
  outline: 4px solid DodgerBlue;
  outline-offset: -6px;
}

[aria-label="gallery"] ul {
  display: flex;
}

[aria-label="gallery"] li {
  list-style: none;
  flex: 0 0 100%;
  padding: 2rem;
  height: 60vh;
}

[aria-label="gallery"] figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

[aria-label="gallery"] figcaption {
  padding: 0.5rem;
  font-style: italic;
}

[aria-label="gallery"] img {
  max-height: calc(100% - 2rem);
  margin-top: 2rem;
  max-width: 100%;
}

#instructions {
  position: relative;
}

#instructions p {
  padding: 1rem;
  text-align: center;
  color: #fefefe;
  background-color: #111;
}

#focus, #hover, #hover-and-focus, #touch {
  display: none;
}

[aria-label="gallery"]:focus + #instructions #focus,
[aria-label="gallery"]:hover + #instructions #hover {
  display: block;
}

[aria-label="gallery"]:hover + #instructions #hover + #focus {
  display: none;
}

[aria-label="gallery"]:hover:focus + #instructions #hover,
[aria-label="gallery"]:hover:focus + #instructions #focus {
  display: none;
}

[aria-label="gallery"]:hover:focus + #instructions #hover-and-focus {
  display: block;
}

#instructions svg {
  height: 1.5rem;
  width: 1.5rem;
  fill: #fff;
  vertical-align: -0.5rem;
}

.touch #instructions p {
  display: none !important;
}

.touch #instructions #touch {
  display: block !important;
}
```

``` cm-s-default
(function() {
  /* touch detection */
  window.addEventListener('touchstart', function touched() {
    document.body.classList.add('touch')
    window.removeEventListener('touchstart', touched, false)
  }, false)

  /* lazy loading */
  const slides = document.querySelectorAll('[aria-label="gallery"] li')

  const observerSettings = {
    root: document.querySelector('[aria-label="gallery"]')
  }

  if ('IntersectionObserver' in window) {
    const callback = (slides, observer) => {
      Array.prototype.forEach.call(slides, function(entry) {
        if (!entry.intersectionRatio > 0) {
          return
        }
        let img = entry.target.querySelector('img')
        img.setAttribute('src', img.dataset.src)
        observer.unobserve(entry.target)
      })
    }

    const observer = new IntersectionObserver(callback, observerSettings)
    Array.prototype.forEach.call(slides, t => observer.observe(t))
  } else {
    Array.prototype.forEach.call(slides, function (s) {
      let img = s.querySelector('img')
      img.setAttribute('src', img.getAttribute('data-src'))
    })
  }
})()
```

[Run Pen](https://codepen.io/heydon/embed/Ebwjyo?default-tab=result&theme-id=0)

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon).

[See more by @heydon on CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

This Pen doesn't use any external JavaScript resources.


[Standalone demo of the content slider with lazy loading](https://s.codepen.io/heydon/debug/Ebwjyo).

Since our slider is operable without JavaScript, we're pretty good. However, this only handles the 'no JavaScript' case — which is rare — and not the 'broken/failed JavaScript' case which is distressingly common. Rik Schennink has solved this problem by [placing a `mutationObserver` in the _head_ of the document](https://twitter.com/rikschennink/status/931256220303978496). [A demo is available](https://pqina.nl/lazy/) for this technique, which initially swaps `src` to `data-src` and, in testing, fairly reliably prevents the fetching of the image resources on first run.

## Previous and next buttons

Typical sliders have buttons on either side of them for moving backwards or forwards through the slides. This is a convention that might be worth embracing for two reasons:

- The mere presence of the buttons makes the slider more slider-like, increasing its affordance.
- The buttons allow the user to 'snap' slides into place. No more scrolling back and forth to get the desired slide centered exactly.

The trick is in building upon the functionality we've already designed, rather than replacing it. Our buttons should be aware of and able to respond to scrolling and swiping actions that may already have taken place.

By adapting our `IntersectionObserver` script, we can add and remove a `.visible` class to our slides:

```
slides.forEach(entry => {
  entry.target.classList.remove('visible')
  if (!entry.isIntersecting) {
    return
  }
  let img = entry.target.querySelector('img')
  if (img.dataset.src)  {
    img.setAttribute('src', img.dataset.src)
    img.removeAttribute('data-src')
  }
  entry.target.classList.add('visible')
})

```

Not only does this mean we'll find `class="visible"` on any slide that's 100% in view (such as the initial slide), but in the case that the user has scrolled to a position between two slides, they'll both carry that class.

![Slider in a state where two slides are partially showing. Each has the visible HTML class.](https://inclusive-components.design/content/images/2017/11/visible_classes-1.svg)

To move the correct slide fully into view when the user presses one of the buttons, we need to know just three things:

1. How wide the container is
2. How many slides there are
3. Which direction the user wants to go

If two slides are partially visible and the user presses 'next', we identify the requested slide as the second of the `.visible` node list. We then change the container's `scrollLeft` value based on the following formula:

**requested slide index ⨉ (container width / number of slides)**

Note the size of the previous and next buttons in the following demo. Optimized for easy touch interaction without hindering the desktop experience.

CodePen Embed - Content slider with buttons

``` cm-s-default
<svg style="display:none">
  <symbol id="arrow-left" viewBox="0 0 10 10">
    <path fill="currentColor" d="m9 4h-4v-2l-4 3 4 3v-2h4z"/>
  </symbol>
  <symbol id="arrow-right" viewBox="0 0 10 10">
    <path fill="currentColor" d="m1 4h4v-2l4 3-4 3v-2h-4z"/>
  </symbol>
</svg>
<h1>Photomontages by Hanna Höch</h1>
<div class="gallery">
  <div role="region" tabindex="0" aria-describedby="instructions" role="region" aria-label="gallery">
    <ul>
      <li>
        <figure>
          <img data-src="https://i.pinimg.com/originals/fe/61/b8/fe61b828c9490313681cda5257bae997.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="two male figures in bathing costumes stand behind a wall on a cryptically doodled background">
          <noscript>
            <img src="https://i.pinimg.com/originals/fe/61/b8/fe61b828c9490313681cda5257bae997.jpg" alt="two male figures in bathing costumes stand behind a wall on a cryptically doodled background">
          </noscript>
          <figcaption>Heads of State</figcaption>
        </figure>
      </li>
      <li>
        <figure>
          <img data-src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_Astronomy-and-Movement-Dada-250%C3%97190-mm-drawing-and-collage-1922.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
          <noscript>
            <img src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_Astronomy-and-Movement-Dada-250%C3%97190-mm-drawing-and-collage-1922.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
          </noscript>
          <figcaption>Astronomy and Movement Dada</figcaption>
        </figure>
      </li>
      <li>
        <figure>
          <img data-src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_-Mother-watercolour-and-photograph-collage-on-grey-paper-41o%C3%9735o-mm-1925%E2%80%936.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="Strange portrait-like montage. The subject is rotund and wears a torturous looking mask.">
          <noscript>
            <img src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_-Mother-watercolour-and-photograph-collage-on-grey-paper-41o%C3%9735o-mm-1925%E2%80%936.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
          </noscript>
          <figcaption>Mother</figcaption>
        </figure>
      </li>
      <li>
        <figure>
          <img data-src="https://i.pinimg.com/originals/53/d9/e2/53d9e2cf92b05d3f7ddd903e5c91538a.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="Reclining nude on a colourful bed, wearing a large, monster-like mask and spectacles">
          <noscript>
            <img src="https://i.pinimg.com/originals/53/d9/e2/53d9e2cf92b05d3f7ddd903e5c91538a.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
          </noscript>
          <figcaption>Untitled</figcaption>
        </figure>
      </li>
      <li>
        <figure>
          <img data-src="https://d32dm0rphc51dk.cloudfront.net/WGpoh18Y3iHXoI9g7rHSBw/large.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="Photomontoge of female figures and automobile parts, featuing several instances of the BMW logo">
          <noscript>
            <img src="https://d32dm0rphc51dk.cloudfront.net/WGpoh18Y3iHXoI9g7rHSBw/large.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
          </noscript>
          <figcaption>The Beautiful Girl</figcaption>
        </figure>
      </li>
    </ul>
  </div>
  <div id="instructions">
    <p id="touch">
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
      swipe for more
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></svg>
    </p>
    <p id="hover">
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
      scroll for more
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></use></svg>
    </p>
    <p id="focus">
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
      use your arrow keys for more
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"></use></svg>
    </p>
    <p id="hover-and-focus">
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
      scroll or use arrow keys for more
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"></use></svg>
    </p>
  </div>
</div>
```

``` cm-s-default
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  margin: 3rem auto;
  max-width: 40rem;
  padding: 1rem;
  color: #111;
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
}

[aria-label="gallery"] {
  border: 2px solid;
  overflow-x: scroll;
}

[aria-label="gallery"]:focus, [aria-label="gallery controls"] button:focus {
  outline: 4px solid DodgerBlue;
  outline-offset: -6px;
}

[aria-label="gallery controls"] button:focus {
  outline-offset: -4px;
}

[aria-label="gallery"] ul {
  display: flex;
}

[aria-label="gallery"] li {
  list-style: none;
  flex: 0 0 100%;
  padding: 2rem;
  height: 60vh;
}

[aria-label="gallery"] figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

[aria-label="gallery"] figcaption {
  padding: 0.5rem;
  font-style: italic;
  text-align: center;
}

[aria-label="gallery"] img {
  max-height: calc(100% - 2rem);
  max-width: 100%;
  margin-top: 2rem;
}

#instructions {
  position: relative;
}

#instructions p {
  padding: 1rem;
  text-align: center;
  color: #fefefe;
  background-color: #111;
}

#focus, #hover, #hover-and-focus, #touch {
  display: none;
}

[aria-label="gallery"]:focus + #instructions #focus,
[aria-label="gallery"]:hover + #instructions #hover {
  display: block;
}

[aria-label="gallery"]:hover + #instructions #hover + #focus {
  display: none;
}

[aria-label="gallery"]:hover:focus + #instructions #hover,
[aria-label="gallery"]:hover:focus + #instructions #focus {
  display: none;
}

[aria-label="gallery"]:hover:focus + #instructions #hover-and-focus {
  display: block;
}

#instructions svg {
  height: 1.5rem;
  width: 1.5rem;
  fill: #fff;
  vertical-align: -0.5rem;
}

.touch #instructions p {
  display: none !important;
}

.touch #instructions #touch {
  display: block !important;
}

.gallery {
  position: relative;
}

[aria-label="gallery controls"] li {
  list-style: none;
}

[aria-label="gallery controls"] button {
  position: absolute;
  top: 0;
  background: #111;
  color: #fff;
  border: 2px solid #111;
  border-radius: 0;
  width: 3rem;
  height: calc(60vh + 4px);
}

#previous {
  left: 0;
}

#next {
  right: 0;
}

button svg {
  width: 2rem;
  height: 2rem;
}
```

``` cm-s-default
(function() {
  /* touch detection */
  window.addEventListener('touchstart', function touched() {
    document.body.classList.add('touch')
    window.removeEventListener('touchstart', touched, false)
  }, false)

  /* lazy loading and button controls */
  const gallery = document.querySelector('[aria-label="gallery"]')
  const slides = gallery.querySelectorAll('li')
  const instructions = document.getElementById('instructions')

  const observerSettings = {
    root: gallery,
    rootMargin: '-10px'
  }

  if ('IntersectionObserver' in window) {
    const callback = (slides, observer) => {
      Array.prototype.forEach.call(slides, function(entry) {
        entry.target.classList.remove('visible')
        let img = entry.target.querySelector('img')
        img.setAttribute('tabindex', '-1')
        if (!entry.intersectionRatio > 0) {
          return
        }
        let img = entry.target.querySelector('img')
        if (img.dataset.src)  {
          img.setAttribute('src', img.dataset.src)
          img.removeAttribute('data-src')
        }
        entry.target.classList.add('visible')
        img.removeAttribute('tabindex', '-1')
      })
    }

    const observer = new IntersectionObserver(callback, observerSettings)
    Array.prototype.forEach.call(slides, t => observer.observe(t))

    const controls = document.createElement('ul')
    controls.setAttribute('aria-label', 'gallery controls')
    controls.innerHTML = `
    <li>
      <button id="previous" aria-label="previous">
        <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
      </button>
    </li>
    <li>
      <button id="next" aria-label="next">
        <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></svg>
      </button>
    </li>
    `

    instructions.parentNode.insertBefore(controls, instructions.nextElementSibling)
    instructions.parentNode.style.padding = '0 3rem'

    function scrollIt (slideToShow) {
      let scrollPos = Array.prototype.indexOf.call(slides, slideToShow) * (gallery.scrollWidth / slides.length)
      gallery.scrollLeft = scrollPos
    }

    function showSlide (dir, slides) {
      let visible = document.querySelectorAll('[aria-label="gallery"] .visible')
      let i = dir === 'previous' ? 0 : 1

      if (visible.length > 1) {
        scrollIt(visible[i])
      } else {
        let newSlide = i === 0 ? visible[0].previousElementSibling : visible[0].nextElementSibling
        if (newSlide) {
          scrollIt(newSlide)
        }
      }
    }

    controls.addEventListener('click', function (e) {
      showSlide(e.target.closest('button').id, slides)
    })

  } else {
    Array.prototype.forEach.call(slides, function (s) {
      let img = s.querySelector('img')
      img.setAttribute('src', img.getAttribute('data-src'))
    })
  }
})()
```

[Run Pen](https://codepen.io/heydon/embed/YEYqJJ?default-tab=result&theme-id=0)

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon).

[See more by @heydon on CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

This Pen doesn't use any external JavaScript resources.


[Standalone demo for the content slider with previous and next buttons](https://s.codepen.io/heydon/debug/YEYqJJ).

### Snap points

As [Michael Scharnagl](https://twitter.com/justmarkup) ‏ pointed out to me, some browsers — Safari and Firefox included — support a simple CSS method of snapping slides into place as you scroll or use your arrow keys. Since Safari doesn't support `IntersectionObserver`, this is one way to improve the UX for users of that browser. The following mess of proprietary and standard properties is what worked in our case.

```
[aria-label="gallery"] {
  -webkit-overflow-scrolling: touch;
  -webkit-scroll-snap-type: mandatory;
  -ms-scroll-snap-type: mandatory;
  scroll-snap-type: mandatory;
  -webkit-scroll-snap-points-x: repeat(100%);
  -ms-scroll-snap-points-x: repeat(100%);
  scroll-snap-points-x: repeat(100%);
}

```

Scroll snapping is supported in the [linked content demo still to come](https://s.codepen.io/heydon/debug/xPWOLp), if you're keen to try it out. Tip: the `repeat(100%)` part refers to the 100% width of each slide.

### Handling linked content

Focus order is currently very simple in our slider: The slider itself receives focus (for scrolling with the arrow keys), then each of the buttons is focused, in turn.

But what if the content of each slide were linked? After you focused the slider itself, the first slide would take focus, then each subsequent slide — no matter how many there are — and finally the button controls.

Not only is this a lot of focus steps to reach the buttons (or to leave the slider altogether) but we have another small problem: If the user has scrolled the region to view the third item, they would expect that item to be the one that receives focus next. Instead, the first item takes focus and the slider is slung back to the start, bringing that first item into view.

![Shows scroll direction to the right opposing focus directing which must go left to retrieve the first item.](https://inclusive-components.design/content/images/2017/11/scroll-focus-1.svg)

This is no disaster. In fact, items receiving focus being automatically brought into view, without JavaScript, stands us in good stead. Invisible content should never become focusable.

But where `IntersectionObserver` is supported and our button controls have been rendered, having only the currently visible item(s) in the focus order makes for a good enhancement. We can amend our script so that links in items that are not intersecting take `tabindex="-1"`, making them unfocusable. See the lines commented (1) and (2) in the following.

```
slides.forEach(entry => {
  entry.target.classList.remove('visible')
  let a = entry.target.querySelector('a')
  a.setAttribute('tabindex', '-1') // (1)
  if (!entry.isIntersecting) {
    return
  }
  let img = entry.target.querySelector('img')
  if (img.dataset.src)  {
    img.setAttribute('src', img.dataset.src)
    img.removeAttribute('data-src')
  }
   entry.target.classList.add('visible')
   a.removeAttribute('tabindex', '-1') // (2)
})

```

Simple. Now either one or two slides will gain focus, depending on how many are intersecting, and the button controls become quicker and easier to reach.

![Shows two slides either side of the slider, out of view. Each has tabindex minus one.](https://inclusive-components.design/content/images/2017/11/tabindex_minus_1.svg)

CodePen Embed - Content slider with linked content

``` cm-s-default
<svg style="display:none">
  <symbol id="arrow-left" viewBox="0 0 10 10">
    <path fill="currentColor" d="m9 4h-4v-2l-4 3 4 3v-2h4z"/>
  </symbol>
  <symbol id="arrow-right" viewBox="0 0 10 10">
    <path fill="currentColor" d="m1 4h4v-2l4 3-4 3v-2h-4z"/>
  </symbol>
</svg>
<h1>Photomontages by Hanna Höch</h1>
<div class="gallery">
  <div role="region" tabindex="0" aria-describedby="instructions" role="region" aria-label="gallery">
    <ul>
      <li>
        <a href="https://i.pinimg.com/originals/fe/61/b8/fe61b828c9490313681cda5257bae997.jpg">
          <figure>
            <img data-src="https://i.pinimg.com/originals/fe/61/b8/fe61b828c9490313681cda5257bae997.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="two male figures in bathing costumes stand behind a wall on a cryptically doodled background">
            <noscript>
              <img src="https://i.pinimg.com/originals/fe/61/b8/fe61b828c9490313681cda5257bae997.jpg" alt="two male figures in bathing costumes stand behind a wall on a cryptically doodled background">
            </noscript>
            <figcaption>Heads of State</figcaption>
          </figure>
        </a>
      </li>
      <li>
        <a href="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_Astronomy-and-Movement-Dada-250%C3%97190-mm-drawing-and-collage-1922.jpg">
          <figure>
            <img data-src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_Astronomy-and-Movement-Dada-250%C3%97190-mm-drawing-and-collage-1922.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
            <noscript>
              <img src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_Astronomy-and-Movement-Dada-250%C3%97190-mm-drawing-and-collage-1922.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
            </noscript>
            <figcaption>Astronomy and Movement Dada</figcaption>
          </figure>
        </a>
      </li>
      <li>
        <a href="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_-Mother-watercolour-and-photograph-collage-on-grey-paper-41o%C3%9735o-mm-1925%E2%80%936.jpg">
          <figure>
            <img data-src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_-Mother-watercolour-and-photograph-collage-on-grey-paper-41o%C3%9735o-mm-1925%E2%80%936.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="Strange portrait-like montage. The subject is rotund and wears a torturous looking mask.">
            <noscript>
              <img src="http://www.lypophrenia.com/wp-content/uploads/2011/01/Hannah-H%C3%B6ch_-Mother-watercolour-and-photograph-collage-on-grey-paper-41o%C3%9735o-mm-1925%E2%80%936.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
            </noscript>
            <figcaption>Mother</figcaption>
          </figure>
        </a>
      </li>
      <li>
        <a href="https://i.pinimg.com/originals/53/d9/e2/53d9e2cf92b05d3f7ddd903e5c91538a.jpg">
          <figure>
            <img data-src="https://i.pinimg.com/originals/53/d9/e2/53d9e2cf92b05d3f7ddd903e5c91538a.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="Reclining nude on a colourful bed, wearing a large, monster-like mask and spectacles">
            <noscript>
              <img src="https://i.pinimg.com/originals/53/d9/e2/53d9e2cf92b05d3f7ddd903e5c91538a.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
            </noscript>
            <figcaption>Untitled</figcaption>
          </figure>
        </a>
      </li>
      <li>
        <a href="https://d32dm0rphc51dk.cloudfront.net/WGpoh18Y3iHXoI9g7rHSBw/large.jpg">
          <figure>
            <img data-src="https://d32dm0rphc51dk.cloudfront.net/WGpoh18Y3iHXoI9g7rHSBw/large.jpg" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' /%3E" alt="Photomontoge of female figures and automobile parts, featuing several instances of the BMW logo">
            <noscript>
              <img src="https://d32dm0rphc51dk.cloudfront.net/WGpoh18Y3iHXoI9g7rHSBw/large.jpg" alt="stark photomontage with jagged edges and red, yellow, and blue shades">
            </noscript>
            <figcaption>The Beautiful Girl</figcaption>
          </figure>
        </a>
      </li>
    </ul>
  </div>
  <div id="instructions">
    <p id="touch">
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
      swipe for more
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></svg>
    </p>
    <p id="hover">
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
      scroll for more
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"></use></svg>
    </p>
    <p id="focus">
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
      use your arrow keys for more
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></use></svg>
    </p>
    <p id="hover-and-focus">
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>
      scroll or use arrow keys for more
      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></use></svg>
    </p>
  </div>
</div>
```

``` cm-s-default
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: sans-serif;
  margin: 3rem auto;
  max-width: 40rem;
  padding: 1rem;
  color: #111;
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
}

[aria-label="gallery"] {
  border: 2px solid;
  overflow-x: scroll;
  -webkit-overflow-scrolling: touch;
  -webkit-scroll-snap-type: mandatory;
  -ms-scroll-snap-type: mandatory;
  scroll-snap-type: mandatory;
  -webkit-scroll-snap-points-x: repeat(100%);
  -ms-scroll-snap-points-x: repeat(100%);
  scroll-snap-points-x: repeat(100%);
}

[aria-label="gallery"]:focus,
[aria-label="gallery controls"] button:focus,
[aria-label="gallery"] a:focus img {
  outline: 4px solid DodgerBlue;
  outline-offset: -6px;
}

[aria-label="gallery controls"] button:focus {
  outline-offset: -4px;
}

[aria-label="gallery"] ul {
  display: flex;
}

[aria-label="gallery"] li {
  list-style: none;
  flex: 0 0 100%;
  padding: 2rem;
  height: 60vh;
}

[aria-label="gallery"] figure {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

[aria-label="gallery"] a:focus {
  outline: none;
}

[aria-label="gallery"] figcaption {
  padding: 0.5rem;
  font-style: italic;
  text-align: center;
}

[aria-label="gallery"] img {
  min-height: 1px;
  min-width: 1px;
  max-height: calc(100% - 2rem);
  margin-top: 2rem;
  max-width: 100%;
}

#instructions {
  position: relative;
}

#instructions p {
  padding: 1rem;
  text-align: center;
  color: #fefefe;
  background-color: #111;
}

#focus, #hover, #hover-and-focus, #touch {
  display: none;
}

[aria-label="gallery"]:focus + #instructions #focus,
[aria-label="gallery"]:hover + #instructions #hover {
  display: block;
}

[aria-label="gallery"]:hover + #instructions #hover + #focus {
  display: none;
}

[aria-label="gallery"]:hover:focus + #instructions #hover,
[aria-label="gallery"]:hover:focus + #instructions #focus {
  display: none;
}

[aria-label="gallery"]:hover:focus + #instructions #hover-and-focus {
  display: block;
}

#instructions svg {
  height: 1.5rem;
  width: 1.5rem;
  fill: #fff;
  vertical-align: -0.5rem;
}

.touch #instructions p {
  display: none !important;
}

.touch #instructions #touch {
  display: block !important;
}

.gallery {
  position: relative;
}

[aria-label="gallery controls"] li {
  list-style: none;
}

[aria-label="gallery controls"] button {
  position: absolute;
  top: 0;
  background: #111;
  color: #fff;
  border: 2px solid #111;
  border-radius: 0;
  width: 3rem;
  height: calc(60vh + 4px);
}

#previous {
  left: 0;
}

#next {
  right: 0;
}

button svg {
  width: 2rem;
  height: 2rem;
}
```

``` cm-s-default
'use strict';

(function () {
  /* touch detection */
  window.addEventListener('touchstart', function touched() {
    document.body.classList.add('touch');
    window.removeEventListener('touchstart', touched, false);
  }, false);

  /* lazy loading and button controls */
  var gallery = document.querySelector('[aria-label="gallery"]');
  var slides = gallery.querySelectorAll('li');
  var instructions = document.getElementById('instructions');

  Array.prototype.forEach.call(slides, function (slide) {
    slide.querySelector('a').setAttribute('tabindex', '-1');
  });

  var observerSettings = {
    root: gallery,
    rootMargin: '-10px'
  };

  if ('IntersectionObserver' in window) {
    var scrollIt = function scrollIt(slideToShow) {
      var scrollPos = Array.prototype.indexOf.call(slides, slideToShow) * (gallery.scrollWidth / slides.length);
      gallery.scrollLeft = scrollPos;
    };

    var showSlide = function showSlide(dir, slides) {
      var visible = document.querySelectorAll('[aria-label="gallery"] .visible');
      var i = dir === 'previous' ? 0 : 1;

      if (visible.length > 1) {
        scrollIt(visible[i]);
      } else {
        var newSlide = i === 0 ? visible[0].previousElementSibling : visible[0].nextElementSibling;
        if (newSlide) {
          scrollIt(newSlide);
        }
      }
    };

    var callback = function callback(slides, observer) {
      Array.prototype.forEach.call(slides, function (entry) {
        entry.target.classList.remove('visible');
        var link = entry.target.querySelector('a');
        link.setAttribute('tabindex', '-1');
        if (!entry.intersectionRatio > 0) {
          return;
        }
        var img = entry.target.querySelector('img');
        console.log(img);
        if (img.dataset.src) {
          img.setAttribute('src', img.dataset.src);
          img.removeAttribute('data-src');
        }
        entry.target.classList.add('visible');
        link.removeAttribute('tabindex', '-1');
      });
    };

    var observer = new IntersectionObserver(callback, observerSettings);
    Array.prototype.forEach.call(slides, function (t) {
      return observer.observe(t);
    });

    var controls = document.createElement('ul');
    controls.setAttribute('aria-label', 'gallery controls');
    controls.innerHTML = '\n    <li><button type="button" id="previous" aria-label="previous">\n      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-left"></use></svg>\n    </button></li>\n    <li><button type="button" id="next" aria-label="next">\n      <svg aria-hidden="true" focusable="false"><use xlink:href="#arrow-right"/></svg>\n    </button></li>\n    ';
    instructions.parentNode.insertBefore(controls, instructions.nextElementSibling);
    instructions.parentNode.style.padding = '0 3rem';

    controls.addEventListener('click', function (e) {
      showSlide(e.target.closest('button').id, slides);
    });
  } else {
    Array.prototype.forEach.call(slides, function (s) {
      var img = s.querySelector('img');
      img.setAttribute('src', img.getAttribute('data-src'));
    });
  }
})();
```

[Run Pen](https://codepen.io/heydon/embed/xPWOLp?default-tab=result&theme-id=0)

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon).

[See more by @heydon on CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

This Pen doesn't use any external JavaScript resources.


[Standalone demo of the content slider with invisible linked items removed from focus](https://s.codepen.io/heydon/debug/xPWOLp).

The complete script for this content slider is approximately 1.7KB minified. The first result when searching for 'carousel plugin' using Google search is 41.9KB minified and uses incorrect WAI-ARIA attribution, in some cases hiding focusable content from screen reader software using `aria-hidden`. Beware the [fourth rule of ARIA use](https://www.w3.org/TR/using-aria/#fourth).

In this final demo, some provisions have been made for Edge and Internet Explorer:

- The code was compiled to ES5 syntax.
- A `flexbox` image scaling bug was suppressed by using `min-width: 1px` and `min-height: 1px` on the images.
- Initially, `tabindex="-1"` was set on each of the links. This is not necessary in other browsers; it is honored in the `InterSectionObserver` callback on first run.

Safari does not support `IntersectionObserver` yet, but [a polyfill is available](https://github.com/w3c/IntersectionObserver/tree/master/polyfill) for about 6KB gzipped. The slider works okay in Safari and other non-supporting browsers without it.

## Conclusion

Inclusive design is not about giving everyone the same experience. It's about give as many people as possible a decent experience. Our slider isn't the fanciest implementation out there, but that's just as well: it's the content that should be wowing people, not the interface, and Hanna Höch's epochal Dadaist photomontages are not to be upstaged. Making sure our content slider is responsive, lightweight, robust, and interoperable means a larger audience for a deserving artist.

In my conference talk [Writing Less Damned Code](https://vimeo.com/190834530), I introduce the concept of _unprogressive non-enhancement_ — the idea that the flow content from which we construct tab interfaces, carousels and similar, should often be left unreconstructed. No enhancement can be better than 'enhancement'. But, when used judiciously and with care, augmented presentations of content such as content sliders can be quite compelling ways of consuming information. There just better be a good, well-researched reason to take that leap.

### Checklist

- Use list markup to group the slides together. Then screen reader users in 'browse' mode can use list navigation shortcuts to traverse them.
- Provide a reasonable experience in HTML with CSS, then feature detect when enhancing with JavaScript.
- Don't preload content users are not likely to see. Defer until they perform an action to see it.
- Provide generous touch targets for touch users on mobile / small screens.
- If in doubt of a control's (or widget's) affordance, spell it out with instructions
- If you are a man and got past the first paragraph without being personally offended: Congratulations! You do not see men and women as competing teams.

[↩\\
 Back to components list](https://inclusive-components.design/#components)
