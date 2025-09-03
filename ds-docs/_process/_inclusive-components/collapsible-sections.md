[skip to content](https://inclusive-components.design/collapsible-sections/#main)

## Get the book!

The
[Inclusive Components book](http://book.inclusive-components.design/) is now available, with
**updated and improved** content and demos.


![book cover with the strap line, accessible web interfaces piece by piece](https://inclusive-components.design/assets/images/on-light.svg?v=89073ee017)

Collapsible sections are perhaps the most rudimentary of interactive design patterns on the web. All they do is let you toggle the visibility of content by clicking that content's label. Big whoop.

Although the interaction is simple, it's an interaction that [does not have a consistent native implementation across browsers](http://caniuse.com/#feat=details) — despite movement to standardize it. It is therefore a great "hello world" entry point into accessible interaction design using JavaScript and WAI-ARIA.

So why am I talking about it now, after covering more complex components? Because this article will focus on developer and author experience: we're going to make our collapsible regions web components, so they are easy to include as part of larger patterns and in content files.

* * *

As we did when approaching tab interfaces, it helps to consider what our component would be in the absence of JavaScript enhancement and why that enhancement actually makes things better. In this case, a collapsible section without JavaScript is simply a section. That is: a subheading introducing some content — prose, media, whatever.

```
<h2>My section</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras efficitur laoreet massa. Nam eu porta dolor. Vestibulum pulvinar lorem et nisl tempor lacinia.</p>
<p>Cras mi nisl, semper ut gravida sed, vulputate vel mauris. In dignissim aliquet fermentum. Donec arcu nunc, tempor sed nunc id, dapibus ornare dolor.</p>

```

One advantage of _collapsing_ the content is that the headings become adjacent elements, giving the user an overview of the content available without having to scroll nearly so much. Expanding the content is choosing to see it.

![Logform prose compressed into section headings/labels, leaving more space](https://inclusive-components.design/content/images/2017/10/compressed.svg)

Another advantage is that keyboard users do not have to step through all of the focusable elements on the page to get to where they want to go: Hidden content is not focusable.

## The adapted markup

Just attaching a click handler to the heading for the purposes of expanding the associated content is foolhardy, because it is not an interaction communicated to assistive software or achievable by keyboard. Instead, we need to adapt the markup by providing a standard button element.

```
<h2><button>My section</button></h2>
<div>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras efficitur laoreet massa. Nam eu porta dolor. Vestibulum pulvinar lorem et nisl tempor lacinia.</p>
  <p>Cras mi nisl, semper ut gravida sed, vulputate vel mauris. In dignissim aliquet fermentum. Donec arcu nunc, tempor sed nunc id, dapibus ornare dolor.</p>
</div>

```

( **Note:** I have wrapped the content in a `<div>`, in preparation for showing and hiding it using the script to follow.)

The button is provided as a child of the heading. This means that, when a screen reader user focuses the `<button>`, the button itself is identified but also the presence of its parent: _"My section, button, heading level 2"_ (or similar, depending on the screen reader).

![Speech bubble above collapsible section label reads my section, button, heading level 2](https://inclusive-components.design/content/images/2017/10/announcement_1-1.svg)

Had we instead _converted_ the heading into a button using ARIA's `role="button"` we would be overriding the heading semantics. Screen reader users would lose the heading as a structural and navigational cue.

In addition, we would have to custom code all of the browser behaviors `<button>` gives us for free, such as focus (see `tabindex` in the example below) and key bindings to actually activate our custom control.

```
<!-- DON'T do this -->
<h2 role="button" tabindex="0">My section</h2>

```

### State

Our component can be in one of two mutually exclusive states: collapsed or expanded. This state can be suggested visually, but also needs to be communicated non-visually. We can do this by applying `aria-expanded` to the button, initially in the `false` (collapsed) state. Accordingly, we need to hide the associated `<div>` — in this case, with `hidden`.

```
<h2><button aria-expanded="false">My section</button></h2>
<div hidden>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras efficitur laoreet massa. Nam eu porta dolor. Vestibulum pulvinar lorem et nisl tempor lacinia.</p>
  <p>Cras mi nisl, semper ut gravida sed, vulputate vel mauris. In dignissim aliquet fermentum. Donec arcu nunc, tempor sed nunc id, dapibus ornare dolor.</p>
</div>

```

Some make the mistake of placing `aria-expanded` on the _target_ element rather than the control itself. This is understandable since it is the content that actually switches state. But, if you think about it, this wouldn't be any good: the user would have to find the expanded content — which is only possible if it's actually expanded! — and then look around for an element that might control it. State is, therefore, communicated through the control that one uses to switch it.

#### Is that all the button ARIA?

Why yes. We don't need to add `role="button"` because the `<button>` element implicitly has that role (the ARIA role is just for imitating the native role). And unlike [menu buttons](https://inclusive-components.design/menus-menu-buttons/), we are not instigating an immediate change of context by moving focus. Therefore, `aria-haspopup` is not applicable.

Some folks add `aria-controls` and point it to the content container's `id`. Be warned that [`aria-controls` only works in JAWS](http://www.heydonworks.com/article/aria-controls-is-poop) at the time of writing. So long as the section's content follows the heading/button in the source order, it isn't needed. The user will (immediately) encounter the expanded content as they move down the page.

### Styling the button

We've created a situation wherein we've employed a button, but a button that should look like an enhanced version of the heading it populates. The most efficient way to do this is to eradicate any user agent and author styles for buttons, forcing this button to inherit from its heading parent.

```
h2 button {
  all: inherit;
}

```

Great, but now the button has no [affordance](https://www.interaction-design.org/literature/topics/affordances). It doesn't look like it can be activated. This is where, conventionally, a plus/minus symbol is incorporated. Plus indicates that the section can be expanded, and minus that it may be collapsed.

![The first illustration shows a plus sign and the speech bubble reads My section, button collapsed. The second illustration shows a minus sign and the bubble reads button expanded.](https://inclusive-components.design/content/images/2017/10/expanded_collapsed.svg)The text label and/or icon for a button should always show what pressing that button _will_ do,
 hence the minus sign in the expanded state indicating that the button will take the section content away.

The question is: how do we render the icon? The answer: as efficiently and accessibly as possible. Simple shapes such as rectangles ( `<rect>`) are a highly efficient way to create icons with SVG, so let's do that.

```
<svg viewBox="0 0 10 10">
  <rect height="8" width="2" y="1" x="4"/>
  <rect height="2" width="8" y="4" x="1"/>
</svg>

```

There, that's small enough to fit in a tweet. Since state is communicated via the `aria-expanded` attribute non-visually, we don't need this graphic to be screen reader accessible or interactive. In which case, we need to add a couple more attributes.

```
<button aria-expanded="false">
  My section
  <svg viewBox="0 0 10 10" aria-hidden="true" focusable="false">
    <rect class="vert" height="8" width="2" y="1" x="4" />
    <rect height="2" width="8" y="4" x="1" />
  </svg>
</button>

```

- `aria-hidden="true"` hides the SVG from screen readers and other assistive technologies
- `focusable="false"` addresses the issue that Internet Explorer/Edge make SVGs focusable by default

Note the class of "vert" for the rectangle that represents the vertical strut. We're going to target this with CSS to show and hide it depending on the state, transforming the icon between a plus and minus shape.

```
[aria-expanded="true"] .vert {
  display: none;
}

```

Tying state and its visual representation together is _a very good thing_. It ensures that state changes are communicated interoperably. Do not listen to those who advocate the absolute separation of HTML semantics and CSS styles. Form should follow function, and _directly_ is most reliable.

#### High contrast themes

One more thing: We can ensure the `<rect>` elements respect high contrast themes. By applying a `fill` of `currentColor` to the `<rect>` elements, they change color with the surrounding text when it is affected by the theme change.

```
[aria-expanded] rect {
  fill: currentColor;
}

```

To test high contrast themes against your design on Windows, search for **High contrast settings** and apply a theme from **Choose a theme**. Many high contrast themes invert colors to reduce light intensity. This helps folks who suffer migraines or photophobia as well as making elements clearer to those with vision impairments.

#### Why not use `<use>`?

If we had many collapsible regions on the page, reusing the same SVG `<pattern>` definition via [`<use>` elements](https://wearejh.com/inline-svg-use-element/) and `xlink:href` would reduce redundancy.

```
<button aria-expanded="false">
  My section
  <svg viewBox="0 0 10 10 aria-hidden="true" focusable="false">
    <use xlink:href="#plusminus"/>
  </svg>
</button>

```

Unfortunately, this would mean we could no longer target the specific `.vert` rectangle to show and hide it. By using little code to define each identical SVG, this is not a big problem in our case.

### A small script

Given the simplicity of the interaction and all the elements and semantics being in place, we need only write a very terse script:

```
(function() {
  const headings = document.querySelectorAll('h2')

  Array.prototype.forEach.call(headings, heading => {
    let btn = heading.querySelector('button')
    let target = heading.nextElementSibling

    btn.onclick = () => {
      let expanded = btn.getAttribute('aria-expanded') === 'true' || false

      btn.setAttribute('aria-expanded', !expanded)
      target.hidden = expanded
    }
  })
})()

```

Here's an accompanying [CodePen demo](https://codepen.io/heydon/pen/QqzRvQ/):

CodePen Embed - Collapsible sections

``` cm-s-default
<main>
  <h2>
    <button aria-expanded="false">
      Section 1
      <svg aria-hidden="true" focusable="false" viewBox="0 0 10 10">
        <rect class="vert" height="8" width="2" y="1" x="4"/>
        <rect height="2" width="8" y="4" x="1"/>
      </svg>
    </button>
  </h2>
  <div hidden>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque commodo purus quis mi cursus hendrerit eu eu metus. Aliquam aliquam arcu eget aliquet scelerisque. Pellentesque sodales turpis vitae venenatis vehicula.</p>
  </div>
  <h2>
    <button aria-expanded="false">
      Section 2
      <svg aria-hidden="true" focusable="false" viewBox="0 0 10 10">
        <rect class="vert" height="8" width="2" y="1" x="4"/>
        <rect height="2" width="8" y="4" x="1"/>
      </svg>
    </button>
  </h2>
  <div hidden>
    <p>Nullam tortor metus, tincidunt ut urna id, posuere placerat orci. Ut quis risus dictum risus facilisis imperdiet quis sed eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque commodo purus quis mi cursus hendrerit eu eu metus. Aliquam aliquam arcu eget aliquet scelerisque. Pellentesque sodales turpis vitae venenatis vehicula. Ut id porta velit. Ut eu dignissim dui, quis gravida est. Cras quis venenatis mauris, a bibendum enim. Sed at augue libero.</p>
  </div>
</main>
```

``` cm-s-default
body {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1em;
}

main {
  border-width: 2px 0;
  border-style: solid;
}

main h2 {
  margin: 0;
}

main > div + h2 {
  border-top: 2px solid;
}

h2 button {
  all: inherit;
  border: 0;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0.5em 0;
}

h2 button:focus svg {
  outline: 2px solid;
}

button svg {
  height: 1em;
  margin-left: 0.5em;
}

[aria-expanded="true"] .vert {
  display: none;
}

[aria-expanded] rect {
  fill: currentColor;
}

/* page styles */

html {
  font-family: Arial, sans-serif;
}

* {
  box-sizing: border-box;
}
```

``` cm-s-default
(function() {
  const headings = document.querySelectorAll('h2');

  Array.prototype.forEach.call(headings, h => {
    let btn = h.querySelector('button');
    let target = h.nextElementSibling;

    btn.onclick = () => {
      let expanded = btn.getAttribute('aria-expanded') === 'true';

      btn.setAttribute('aria-expanded', !expanded);
      target.hidden = expanded;
    }
  });
})()
```

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon).

[See more by @heydon on CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

This Pen doesn't use any external JavaScript resources.


### Progressive enhancement

The trouble with the above script is that it requires the HTML to be adapted manually for the collapsible sections to work. Implemented by an engineer as a component via a template/JSX, this is expected. However, for largely static sites like blogs there are two avoidable issues:

- If JavaScript is unavailable, there are interactive elements in the DOM that don't do anything, with semantics that therefore make no sense.
- The onus is on the author/editor to construct the complex HTML.

Instead, we can take basic prose input (say, written in markdown or in a WYSIWYG) and enhance it _after the fact_ with the script. This is quite trivial in jQuery given the `nextUntil` and `wrapAll` methods, but in plain JavaScript we need to do some iteration. Here's another CodePen that automatically adds the toggle button and groups the section content for toggling. It targets all `<h2>` s found in the `<main>` part of the page.

CodePen Embed - Collapsible sections PE

``` cm-s-default
<main>
  <h2>Section 1</h2>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque commodo purus quis mi cursus hendrerit eu eu metus. Aliquam aliquam arcu eget aliquet scelerisque. Pellentesque sodales turpis vitae venenatis vehicula.</p>
  <p>Ut id porta velit. Ut eu dignissim dui, quis gravida est. Cras quis venenatis mauris, a bibendum enim. Sed at augue libero. Nullam tortor metus, tincidunt ut urna id, posuere placerat orci. Ut quis risus dictum risus facilisis imperdiet quis sed eros.</p>
  <h2>Section 2</h2>
  <p>Nullam tortor metus, tincidunt ut urna id, posuere placerat orci.</p>
  <p>Ut quis risus dictum risus facilisis imperdiet quis sed eros. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
  <p>Quisque commodo purus quis mi cursus hendrerit eu eu metus. Aliquam aliquam arcu eget aliquet scelerisque. Pellentesque sodales turpis vitae venenatis vehicula. Ut id porta velit. Ut eu dignissim dui, quis gravida est. Cras quis venenatis mauris, a bibendum enim. Sed at augue libero.</p>
</main>
```

``` cm-s-default
body {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1em;
}

main {
  border-width: 2px 0;
  border-style: solid;
}

main h2 {
  margin: 0;
}

main > div + h2 {
  border-top: 2px solid;
}

h2 button {
  all: inherit;
  border: 0;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0.5em 0;
}

h2 button:focus svg {
  outline: 2px solid;
}

button svg {
  height: 1em;
  margin-left: 0.5em;
}

[aria-expanded="true"] .vert {
  display: none;
}

[aria-expanded] rect {
  fill: currentColor;
}

/* page styles */

html {
  font-family: Arial, sans-serif;
}

* {
  box-sizing: border-box;
}
```

``` cm-s-default
(function() {
  // Get all the <h2> headings
  const headings = document.querySelectorAll('main h2')

  Array.prototype.forEach.call(headings, heading => {
    // Give each <h2> a toggle button child
    // with the SVG plus/minus icon
    heading.innerHTML = `
      <button aria-expanded="false">
        ${heading.textContent}
        <svg aria-hidden="true" focusable="false" viewBox="0 0 10 10">
          <rect class="vert" height="8" width="2" y="1" x="4"/>
          <rect height="2" width="8" y="4" x="1"/>
        </svg>
      </button>
    `

    // Function to create a node list
    // of the content between this <h2> and the next
    const getContent = (elem) => {
      let elems = []
      while (elem.nextElementSibling && elem.nextElementSibling.tagName !== 'H2') {
        elems.push(elem.nextElementSibling)
        elem = elem.nextElementSibling
      }

      // Delete the old versions of the content nodes
      elems.forEach((node) => {
        node.parentNode.removeChild(node)
      })

      return elems
    }

    // Assign the contents to be expanded/collapsed (array)
    let contents = getContent(heading)

    // Create a wrapper element for `contents` and hide it
    let wrapper = document.createElement('div')
    wrapper.hidden = true

    // Add each element of `contents` to `wrapper`
    contents.forEach(node => {
      wrapper.appendChild(node)
    })

    // Add the wrapped content back into the DOM
    // after the heading
    heading.parentNode.insertBefore(wrapper, heading.nextElementSibling)

    // Assign the button
    let btn = heading.querySelector('button')

    btn.onclick = () => {
      // Cast the state as a boolean
      let expanded = btn.getAttribute('aria-expanded') === 'true' || false

      // Switch the state
      btn.setAttribute('aria-expanded', !expanded)
      // Switch the content's visibility
      wrapper.hidden = expanded
    }
  })
})()
```

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon).

[See more by @heydon on CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

This Pen doesn't use any external JavaScript resources.


Why write it in plain JavaScript? Because modern browsers support Web API methods very consistently now, and because small interactions should not depend on large libraries.

## A progressive web component

The last example meant we didn't have to think about our collapsible sections during editorial; they'd just appear automatically. But what we gained in convenience, we lost in control. Instead, what if there was a compromise wherein there was very little markup to write, but what we _did_ write let us choose which sections should be collapsible and what state they should be in on page load?

Web components could be the answer. Consider the following:

```
<toggle-section open="false">
  <h2>My section</h2>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras efficitur laoreet massa. Nam eu porta dolor. Vestibulum pulvinar lorem et nisl tempor lacinia.</p>
  <p>Cras mi nisl, semper ut gravida sed, vulputate vel mauris. In dignissim aliquet fermentum. Donec arcu nunc, tempor sed nunc id, dapibus ornare dolor.</p>
</toggle-section>

```

The custom element name is easy to remember, and the `open` attribute has obvious implications. Better still, where JavaScript is unavailable, this outer element is treated like a mere `<div>` and the collapsible section remains a simple section. No real harm done.

In fact, if we detect support for the `<template>` element and `attachShadow` within our script, the same fallback will be presented to browsers not supporting these features.

```
if ('content' in document.createElement('template')) {
  // Define the <template> for the web component

  if (document.head.attachShadow) {
    // Define the web component using the v1 syntax
  }
}

```

### The template

We could place a template element in the markup and reference it, or create one on the fly. I'm going to do the later.

```
tmpl.innerHTML = `
  <h2>
    <button aria-expanded="false">
      <svg aria-hidden="true" focusable="false" viewBox="0 0 10 10">
        <rect class="vert" height="8" width="2" y="1" x="4"/>
        <rect height="2" width="8" y="4" x="1"/>
      </svg>
    </button>
  </h2>
  <div class="content" hidden>
    <slot></slot>
  </div>
  <style>
    h2 {
      margin: 0;
    }

    h2 button {
      all: inherit;
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 0.5em 0;
     }

    button svg {
      height: 1em;
      margin-left: 0.5em;
    }

    [aria-expanded="true"] .vert {
      display: none;
    }

    [aria-expanded] rect {
      fill: currentColor;
    }
  </style>
`

```

This template content will become the Shadow DOM subtree for the component.

By styling the collapsible section from _within_ its own Shadow DOM, the styles do not affect elements in Light DOM (the standard, outer DOM). Not only that, but they are not applied unless the browser supports `<template>` and custom elements.

### Defining the component

Note the `<slot>` element in the template HTML, which is a window to our Light DOM. This makes it much easier to wrap the content provided by the author than in the [previous progressive enhancement demo](https://codepen.io/heydon/pen/gGNaoM).

Inside the component definition, `this.innerHTML` refers to this Light DOM content. We shall create a `shadowRoot` and populate it with the template's content. The Shadow DOM markup is instead found with `this.shadowRoot.innerHTML`.

```
class ToggleSection extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({ mode: 'open' })
    this.shadowRoot.appendChild(tmpl.content.cloneNode(true))
  }
}

```

![Diagram showing how the working web component is constructed from static content and a template into a combination of shadow and light DOM.](https://inclusive-components.design/content/images/2017/10/flow.svg)

With these references, we can move Light DOM to Shadow DOM. Which means we can repurpose the Light DOM `<h2>`'s label and eliminate the now superfluous element. It probably seems dirty doing this DOM manipulation — especially when you're used to simple, declarative (React) components. But it's what makes the web component progressive.

```
this.btn = this.shadowRoot.querySelector('h2 button')
var oldHeading = this.querySelector('h2')
var label = oldHeading.textContent
this.btn.innerHTML = label + this.btn.innerHTML
oldHeading.parentNode.removeChild(oldHeading)

```

Actually, we can do one better and support different introductory heading levels. Instead of targeting headings at all, we can just get the first element in the Light DOM. Making sure the first element is a heading would be a matter for editorial guidance. However, if it's not a heading, we can make good of any element — as I shall demonstrate.

```
var oldHeading = this.querySelector(':first-child')

```

Now we just need to make sure the _level_ for the Shadow DOM heading is faithful to the Light DOM original. I can query the `tagName` of the Light DOM heading and augment the Shadow DOM level with `aria-level` accordingly.

```
let level = parseInt(oldHeading.tagName.substr(1))
this.heading = this.shadowRoot.querySelector('h2')
if (level && level !== 2) {
  this.heading.setAttribute('aria-level', level)
}

```

The second character of `tagName` is parsed as an integer. If this is a true integer ( `NaN` is falsey) and isn't the `2` offered implicitly by `<h2>`, `aria-level` is applied. As a fallback, a non-heading element still gives up its `textContent` as the label for the extant Shadow DOM `<h2>`. This can be accompanied by a polite `console.warn`, advising developers to use a heading element as a preference.

```
if (!level) {
  console.warn('The first element inside each <toggle-section> should be a heading of an appropriate level.')
}

```

![The warning message, reading ](https://inclusive-components.design/content/images/2017/10/warn.png)

One advantage of using `aria-level` is that, in our case, it is not being used as a styling hook — so the appearance of the heading/button remains unchanged.

```
<h2 aria-level="3">
  <button aria-expanded="false">
    <svg aria-hidden="true" focusable="false" viewBox="0 0 10 10">
      <rect class="vert" height="8" width="2" y="1" x="4"/>
      <rect height="2" width="8" y="4" x="1"/>
    </svg>
  </button>
</h2>

```

If you wanted your collapsible section headings to reflect their level, you could include something like the following in your CSS.

```
toggle-section [aria-level="2"] {
  font-size: 2rem;
}

toggle-section [aria-level="3"] {
  font-size: 1.5rem;
}

/* etc */

```

#### The region role

Any content that is introduced by a heading is a _de facto_ (sub)section within the page. But, as I covered in [**A Todo List**](https://inclusive-components.design/a-todo-list/#headinglevel), you can create explicit sectional container elements in the form of `<section>`. You get the same effect by applying `role="region"` to an element, such as our custom `<toggle-section>` (which otherwise offers no such accessible semantics).

```
<toggle-section role="region">
  ...
</toggle-section>

```

Screen reader users are [more likely to traverse a document by heading than region](http://www.heydonworks.com/article/responses-to-the-screen-reader-strategy-survey) but many screen readers _do_ provide region shortcuts. Adding `role="region"` gives us quite a bit:

- It provides a fallback navigation cue for screen reader users where the Light DOM does not include a heading.
- It elicits the announcement of "region" when the screen reader user enters that section, which acts as a structural cue.
- It gives us a styling hook in the form `toggle-button[role="region"]`. This lets us add styles we only want to see if the script has run and web components are supported.

### Tethering `open` and `aria-expanded`

When the component's `open` value changes between `true` and `false` we want the appearance of the content to toggle. By harnessing `observedAttributes()` and `attributeChangedCallback()` we can do this _directly_. We place this code after the component's constructor:

```
static get observedAttributes() {
  return ['open']
}

attributeChangedCallback(name) {
  if (name === 'open') {
    this.switchState()
  }
}

```

- `observedAttributes()` takes an array of all the attributes on the parent `<toggle-section>` that we wish to watch
- `attributeChangedCallback(name)` lets us execute our `switchState()` function in the event of a change to `open`

The advantage here is that we can toggle state using a script that simply changes the `open` value, from outside the component. For _users_ to change the state, we can just flip `open` inside a click function:

```
this.btn.onclick = () => {
  this.setAttribute('open', this.getAttribute('open') === 'true' ? 'false' : 'true')
}

```

Since the `switchState()` function augments the `aria-expanded` value, we have tethered `open` to `aria-expanded`, making sure the state change is accessible.

```
this.switchState = () => {
  let expanded = this.getAttribute('open') === 'true' || false
  this.btn.setAttribute('aria-expanded', expanded)
  this.shadowRoot.querySelector('.content').hidden = !expanded
}

```

Here's the [CodePen for this version of the web component](https://codepen.io/heydon/pen/ZXdbxj/) with comments:

CodePen Embed - Collapsible section web component

``` cm-s-default
<main>
  <toggle-section open="false">
    <h2>Section 1</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam non lectus sit amet nunc facilisis molestie. Praesent quis libero et mauris facilisis dignissim at sed nisi.</p>
    <p>Nullam efficitur porttitor lectus, ac finibus nibh fermentum ac. Phasellus aliquam, nibh non efficitur pharetra, tellus diam posuere lectus, a consequat elit ex nec ligula.</p>
  </toggle-section>
  <toggle-section open="true">
    <h2>Section 2</h2>
    <p>Aliquam erat volutpat. Nulla facilisi. Nunc porttitor, elit non eleifend aliquam, est leo scelerisque nibh, nec faucibus odio urna ac nulla.</p>
    <p>Maecenas laoreet in metus eget convallis. Vivamus at eleifend felis. Proin non vehicula neque. Etiam eleifend sapien ut nulla malesuada, ac condimentum nisl efficitur.</p>
  </toggle-section>
</main>

```

``` cm-s-default
html {
  font-family: Arial, sans-serif;
}

body {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1em;
}

.controls {
 text-align: right;
 margin-bottom: 1em;
}

.controls li {
  display: inline;
}

button {
  background: #000;
  color: #fff;
  border: 0;
  font-size: 0.85rem;
  border-radius: 0.25rem;
}

/*
Custom elements are inline by default
*/
toggle-section {
  display: block;
}

/*
Only applies if script runs and
`role="region"` is added
*/
toggle-section[role="region"] {
  border-width: 2px 0;
  border-style: solid;
}

toggle-section[role="region"] + toggle-section {
  border-top: 0;
}
```

``` cm-s-default
(function() {
  // Check for <template> support
  if ('content' in document.createElement('template')) {
    const tmpl = document.createElement('template')

    // Create the web component's template
    // featuring a <slot> for the Light DOM content
    tmpl.innerHTML = `
      <h2>
        <button aria-expanded="false">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 10 10">
            <rect class="vert" height="8" width="2" y="1" x="4"/>
            <rect height="2" width="8" y="4" x="1"/>
          </svg>
        </button>
      </h2>
      <div class="content" hidden>
        <slot></slot>
      </div>
      <style>
        h2 {
          margin: 0;
        }

        h2 button {
          all: inherit;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 0.5em 0;
        }

        h2 button:focus svg {
          outline: 2px solid;
        }

        button svg {
          height: 1em;
          margin-left: 0.5em;
        }

        [aria-expanded="true"] .vert {
          display: none;
        }

        [aria-expanded] rect {
          fill: currentColor;
        }
      </style>
    `
    // Check for latest Shadow DOM syntax support
    if (document.head.attachShadow) {
      class ToggleSection extends HTMLElement {
        constructor() {
          super()

          // Make the host element a region
          this.setAttribute('role', 'region')

          // Create a `shadowRoot` and populate from template
          this.attachShadow({ mode: 'open' })
          this.shadowRoot.appendChild(tmpl.content.cloneNode(true))

          // Assign the toggle button
          this.btn = this.shadowRoot.querySelector('h2 button')

          // Get the first element in Light DOM
          // and cast its heading level (which should, but may not, exist)
          const oldHeading = this.querySelector(':first-child')
          let level = parseInt(oldHeading.tagName.substr(1))

          // Get the Shadow DOM <h2>
          this.heading = this.shadowRoot.querySelector('h2')

           // If there is no level, there is no heading.
          // Add a warning.
          if (!level) {
            console.warn('The first element inside each <toggle-section> should be a heading of an appropriate level.')
          }

          // If the level is a real integer and not 2
          // set `aria-level` accordingly
          if (level && level !== 2) {
            this.heading.setAttribute('aria-level', level)
          }

          // Add the Light DOM heading label to the innerHTML of the toggle button
          // and remove the now unwanted Light DOM heading
          this.btn.innerHTML = oldHeading.textContent + this.btn.innerHTML
          oldHeading.parentNode.removeChild(oldHeading)

          // The main state switching function
          this.switchState = () => {
            let expanded = this.getAttribute('open') === 'true' || false

            // Toggle `aria-expanded`
            this.btn.setAttribute('aria-expanded', expanded)
            // Toggle the `.content` element's visibility
            this.shadowRoot.querySelector('.content').hidden = !expanded
          }

          // Change the component's `open` attribute value on click
          // (which will, in turn, trigger switchState(), see below)
          this.btn.onclick = () => {
            this.setAttribute('open', this.getAttribute('open') === 'true' ? 'false' : 'true')
          }
        }

        // Identify just the `open` attribute as an observed attribute
        static get observedAttributes() {
          return ['open']
        }

        // When `open` changes value, execute switchState()
        attributeChangedCallback(name) {
          if (name === 'open') {
            this.switchState()
          }
        }
      }

      // Add our new custom element to the window for use
      window.customElements.define('toggle-section', ToggleSection)

      // Define the expand/collapse all template
      const buttons = document.createElement('div')
      buttons.innerHTML = `
        <ul class="controls" aria-label="section controls">
          <li><button id="expand">expand all</button></li>
          <li><button id="collapse">collapse all</button></li>
        </ul>
        `

      // Get the first `toggle-section` on the page
      // and all toggle sections as a node list
      const first = document.querySelector('toggle-section')
      const all = document.querySelectorAll('toggle-section')

      // Insert the button controls before the first <toggle-section>
      first.parentNode.insertBefore(buttons, first)

      // Place the click on the parent <ul>...
      buttons.addEventListener('click', (e) => {
        // ...then determine which button was the target
        let expand = e.target.id === 'expand' ? true : false

        // Iterate over the toggle sections to switch
        // each one's state uniformly
        Array.prototype.forEach.call(all, (t) => {
          t.setAttribute('open', expand)
        })
      })
    }
  }
})()
```

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon).

[See more by @heydon on CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

This Pen doesn't use any external JavaScript resources.


### Expand/collapse all

Since we toggle `<toggle-section>` elements via their `open` attribute, it's trivial to afford users an 'expand/collapse all' behavior. One advantage of such a provision is that users who have opened multiple sections independently can 'reset' to an initial, compact state for a better overview of the content. By the same token, users who find fiddling with interactive elements distracting or tiresome can revert to scrolling through open sections.

It's tempting to implement 'expand/collapse all' as a single toggle button. But we don't know how many sections will initially be in either state. Nor do we know, at any given time, how many sections the user has opened or closed manually.

Instead, we should group two alternative controls.

```
<ul class="controls" aria-label="section controls">
  <li><button id="expand">expand all</button></li>
  <li><button id="collapse">collapse all</button></li>
</ul>

```

It's important to group related controls together, and lists are the standard markup for doing so. See also: the lists of navigation links discussed in [**Menus & Menu Buttons**](https://inclusive-components.design/menus-menu-buttons/). Lists and list items tell screen reader users when they are interacting with related elements and how many of these elements there are.

Some compound ARIA widgets have their own grouping mechanisms, like `role="menu"` grouping `role="menuitem"` elements or `role="tablist"` grouping `role="tab"` elements. Our use case does not suit either of these paradigms, and a simple labeled list suffices.

Because `<ul>` is implicitly a 'group' element, many assistive technologies will acknowledge a group label provided to it using `aria-label`. In VoiceOver, when a user enters the list and focuses the button, they will hear _"expand all, button, list, section controls, two items"_.

Note that using `aria-label` only provides a non-visual label. This is acceptable if the purpose of the buttons can be gleaned visually through other cues such as layout. In this case, the proximity of the buttons to the sections probably suffices, but testing should be undertaken.

![Diagram shows that the two buttons are are grouped under the label, section controls.](https://inclusive-components.design/content/images/2017/10/section_controls.svg)

### Tracking the URL

One final refinement.

Conventionally, and in the absence of JavaScript enhancement, users are able to follow and share links to specific page sections by their `hash`. This is expected, and part of the generic UX of the web.

Most parsers add `id` attributes for this purpose to heading elements. As the heading element for a target section in our enhanced interface may be inside a collapsed/unfocusable section, we need to open that to reveal the content and move focus to it. The `connectedCallback()` lifecycle lets us do this when the component is ready. It's like `DOMContentLoaded` but for web components.

```
connectedCallback() {
  if (window.location.hash.substr(1) === this.heading.id) {
    this.setAttribute('open', 'true')
    this.btn.focus()
  }
}

```

Note that we focus the button inside the component's heading. This takes keyboard users to the pertinent component ready for interaction. In screen readers, the parent heading level will be announced along with the button label.

Further to this, we should be updating the `hash` each time the user opens successive sections. Then they can share the specific URL without needing to dig into dev tools (if they know how!) to copy/paste the heading's `id`. Let's use `pushState` to dynamically change the URL without reloading the page:

```
this.btn.onclick = () => {
  let open = this.getAttribute('open') === 'true' || false
  this.setAttribute('open', open ? 'false' : 'true')

  if (this.heading.id && !open) {
    history.pushState(null, null, '#' + this.heading.id)
  }
}

```

Here's [a demo with the `hash` tracking capability added](https://codepen.io/heydon/pen/ZXgqKG/):

CodePen Embed - Collapsible section web component /w hashes

``` cm-s-default
<main>
  <toggle-section open="false">
    <h2 id="section-1">Section 1</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam non lectus sit amet nunc facilisis molestie. Praesent quis libero et mauris facilisis dignissim at sed nisi.</p>
    <p>Nullam efficitur porttitor lectus, ac finibus nibh fermentum ac. Phasellus aliquam, nibh non efficitur pharetra, tellus diam posuere lectus, a consequat elit ex nec ligula.</p>
  </toggle-section>
  <toggle-section open="true">
    <h2 id="section-2">Section 2</h2>
    <p>Aliquam erat volutpat. Nulla facilisi. Nunc porttitor, elit non eleifend aliquam, est leo scelerisque nibh, nec faucibus odio urna ac nulla.</p>
    <p>Maecenas laoreet in metus eget convallis. Vivamus at eleifend felis. Proin non vehicula neque. Etiam eleifend sapien ut nulla malesuada, ac condimentum nisl efficitur.</p>
  </toggle-section>
</main>

```

``` cm-s-default
html {
  font-family: Arial, sans-serif;
}

body {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1em;
}

.controls {
 text-align: right;
 margin-bottom: 1em;
}

.controls li {
  display: inline;
}

button {
  background: #000;
  color: #fff;
  border: 0;
  font-size: 0.85rem;
  border-radius: 0.25rem;
}

/*
Custom elements are inline by default
*/
toggle-section {
  display: block;
}

/*
Only applies if script runs and
`role="region"` is added
*/
toggle-section[role="region"] {
  border-width: 2px 0;
  border-style: solid;
}

toggle-section[role="region"] + toggle-section {
  border-top: 0;
}
```

``` cm-s-default
(function() {
  // Check for <template> support
  if ('content' in document.createElement('template')) {
    const tmpl = document.createElement('template')

    // Create the web component's template
    // featuring a <slot> for the Light DOM content
    tmpl.innerHTML = `
      <h2>
        <button aria-expanded="false">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 10 10">
            <rect class="vert" height="8" width="2" y="1" x="4"/>
            <rect height="2" width="8" y="4" x="1"/>
          </svg>
        </button>
      </h2>
      <div class="content" hidden>
        <slot></slot>
      </div>
      <style>
        h2 {
          margin: 0;
        }

        h2 button {
          all: inherit;
          box-sizing: border-box;
          display: flex;
          justify-content: space-between;
          width: 100%;
          padding: 0.5em 0;
        }

        h2 button:focus svg {
          outline: 2px solid;
        }

        button svg {
          height: 1em;
          margin-left: 0.5em;
        }

        [aria-expanded="true"] .vert {
          display: none;
        }

        [aria-expanded] rect {
          fill: currentColor;
        }
      </style>
    `
    // Check for latest Shadow DOM syntax support
    if (document.head.attachShadow) {
      class ToggleSection extends HTMLElement {
        constructor() {
          super()

          // Make the host element a region
          this.setAttribute('role', 'region')

          // Create a `shadowRoot` and populate from template
          this.attachShadow({ mode: 'open' })
          this.shadowRoot.appendChild(tmpl.content.cloneNode(true))

          // Assign the toggle button
          this.btn = this.shadowRoot.querySelector('h2 button')

          // Get the first element in Light DOM
          const oldHeading = this.querySelector(':first-child')
          // and cast its heading level (which should, but may not, exist)
          let level = parseInt(oldHeading.tagName.substr(1))
          // Then take its `id` (may be null)
          let id = oldHeading.id

          // Get the Shadow DOM <h2>
          this.heading = this.shadowRoot.querySelector('h2')

          // If `id` exists, apply it
          if (id) {
            this.heading.id = id
          }

          // If there is no level, there is no heading.
          // Add a warning.
          if (!level) {
            console.warn('The first element inside each <toggle-section> should be a heading of an appropriate level.')
          }

          // If the level is a real integer but not 2
          // set `aria-level` accordingly
          if (level && level !== 2) {
            this.heading.setAttribute('aria-level', level)
          }

          // Add the Light DOM heading label to the innerHTML of the toggle button
          // and remove the now unwanted Light DOM heading
          this.btn.innerHTML = oldHeading.textContent + this.btn.innerHTML
          oldHeading.parentNode.removeChild(oldHeading)

          // The main state switching function
          this.switchState = () => {
            let expanded = this.getAttribute('open') === 'true' || false

            // Toggle `aria-expanded`
            this.btn.setAttribute('aria-expanded', expanded)
            // Toggle the `.content` element's visibility
            this.shadowRoot.querySelector('.content').hidden = !expanded
          }

          this.btn.onclick = () => {
            // Change the component's `open` attribute value on click
            let open = this.getAttribute('open') === 'true' || false
            this.setAttribute('open', open ? 'false' : 'true')

            // Update the hash if the collapsible section's
            // heading has an `id` and we are opening, not closing
            if (this.heading.id && !open) {
              history.pushState(null, null, '#' + this.heading.id)
            }
          }
        }

        connectedCallback() {
          if (window.location.hash.substr(1) === this.heading.id) {
            this.setAttribute('open', 'true')
            this.btn.focus()
          }
        }

        // Identify just the `open` attribute as an observed attribute
        static get observedAttributes() {
          return ['open']
        }

        // When `open` changes value, execute switchState()
        attributeChangedCallback(name) {
          if (name === 'open') {
            this.switchState()
          }
        }
      }

      // Add our new custom element to the window for use
      window.customElements.define('toggle-section', ToggleSection)

      // Define the expand/collapse all template
      const buttons = document.createElement('div')
      buttons.innerHTML = `
        <ul class="controls" aria-label="section controls">
          <li><button id="expand">expand all</button></li>
          <li><button id="collapse">collapse all</button></li>
        </ul>
        `

      // Get the first `toggle-section` on the page
      // and all toggle sections as a node list
      const first = document.querySelector('toggle-section')
      const all = document.querySelectorAll('toggle-section')

      // Insert the button controls before the first <toggle-section>
      first.parentNode.insertBefore(buttons, first)

      // Place the click on the parent <ul>...
      buttons.addEventListener('click', (e) => {
        // ...then determine which button was the target
        let expand = e.target.id === 'expand' ? true : false

        // Iterate over the toggle sections to switch
        // each one's state uniformly
        Array.prototype.forEach.call(all, (t) => {
          t.setAttribute('open', expand)
        })
      })
    }
  }
})()
```

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon).

[See more by @heydon on CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

This Pen doesn't use any external JavaScript resources.


## Conclusion

Your role as an interface designer and developer (yes, you can be both at the same time) is to serve the needs of the people receiving your content and using your functionality. These needs encompass both those of 'end users' and fellow contributors. The product should of course be accessible and performant, but maintaining and expanding the product should be possible without esoteric technical knowledge.

Whether implemented through web components or not, progressive enhancement not only ensures the interface is well-structured and robust. As we've seen here, it can also simplify the editorial process. This makes developing the application and its content more inclusive.

### Checklist

- Don't depend on large libraries for small interactions, unless the library in question is likely to be used for multiple other interactive enhancements.
- Do not override important element roles. See [the second rule of ARIA use](https://www.w3.org/TR/using-aria/#second).
- Support high contrast themes in your SVG icons with `currentColor`.
- If the content is already otherwise static, there is a good case for basing your web component on progressive enhancement.
- Do please come up with more descriptive labels for your sections than "Section 1", "Section 2" etc. Those are just placeholders!

[↩\\
 Back to components list](https://inclusive-components.design/#components)
