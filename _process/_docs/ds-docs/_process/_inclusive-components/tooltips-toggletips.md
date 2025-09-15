## Get the book!

The
[Inclusive Components book](http://book.inclusive-components.design/) is now available, with
**updated and improved** content and demos.


![book cover with the strap line, accessible web interfaces piece by piece](https://inclusive-components.design/assets/images/on-light.svg?v=89073ee017)

Tooltips — affectionately misnomered as "tootlips" by my friend [Steve](https://twitter.com/stevefaulkner) — are a precariously longstanding interface pattern. Literally "tips for tools", they are little bubbles of information that clarify the purpose of otherwise ambiguous controls/tools. A common example is a control that is only represented by a cryptic icon, the meaning of which the user has yet to learn.

When and how these bubbles transpire is apparently up for debate, since I've encountered many a tooltip and they all seem to behave slightly differently. I've come to the conclusion that these numerous implementations fall into two distinct groups: true tooltips, and a pattern I'm hesitantly calling the "toggletip", coined by the aforementioned Steve in some [research and experimentation](https://www.paciellogroup.com/blog/2016/01/simple-standalone-toggletip-widget-pattern/) he did not long ago.

Inclusive design is often about providing the user with the right tool for the job, and the right kind of tooltip to go with that tool. In this article, I'll be looking at situations which might call for a tooltip or else a toggletip, and formulating inclusive implementations for each.

* * *

## The `title` attribute

We can't talk about tooltips without bringing up the `title` attribute: the HTML standard for providing contextual information bubbles. The Paciello Group blog pulls no punches in describing the `title` attribute's contribution to web interfaces:

> "If you want to hide content from mobile and tablet users as well as assistive tech users and keyboard only users, use the `title` attribute." — [The Paciello Group blog](https://www.paciellogroup.com/blog/2013/01/using-the-html-title-attribute-updated/)

That's _pretty bad_ in terms of inclusion. In fact, the only place I can think of where the `title` attribute works reliably in screen reader software is on form elements like `<input>` s. Even then, touch and keyboard users won't get to see the `title` message appear. In short: just provide a clearly worded, permanently visible label.

![An input with a big, clear, permanent label is marked good. An input with a tiny title revealed on hover is not.](https://inclusive-components.design/content/images/2017/07/tooltips_inputs-2.svg)

I'm a big supporter of using standard HTML elements and attributes wherever they're available. It's the most efficient and performant way to build usable web interfaces. But, despite being a specification mainstay, the `title` attribute really isn't fit for purpose.

Then again, we've yet to define that purpose. What _should_ tooltips be used for? And even if we can design them to be usable by the many, do we need them at all?

## A case for tooltips

As we already established, tooltips are for clarification; they are for providing _missing_ information. But why should that information be missing in the first place? As I wrote in [Inclusive Design Patterns](https://shop.smashingmagazine.com/products/inclusive-design-patterns), icons can accelerate the understanding of an interface, and help to internationalize it. But icons provided in isolation are always in danger of completely confounding a user — because they don't _spell anything out_. To users who don't recognize or can't decipher the icon, information is missing.

Most of the time, you should simply be providing text alongside icons. Like the perma-visible field labels I just mentioned, textual labels are the most straightforward way of labeling things and they're automatically screen reader accessible if provided as real text (not images of text).

The usual excuse for _not_ providing textual labels is, "there's no space". And there likely isn't, if you set out not to include textual labels in the first place. If you treat them as important from the beginning, you will find a way.

![Left example has four labels next to one another on the same line, meaning the text has to be small. Right example puts them 2 by 2, leaving more space for bigger text.](https://inclusive-components.design/content/images/2017/07/text_layouts-1.svg)There's always room for text if you make it, but some configurations leave more space for text than others.

Tooltips are a last resort, where space really is at a premium — perhaps due to the sheer number of controls, like in the toolbar for a WYSIWYG editor. So, how would we go about designing them to be as inclusive as possible?

## Inclusive tooltips

The first thing to get right is making the text in the tooltip accessible to assistive technologies. There are a couple of different methods for associating the tooltip to the focused control, and we choose between them based on the specific role of that tooltip: Is the tooltip there to provide a primary label or an auxiliary clarification?

A notifications control with a tooltip reading "Notifications" treats the tooltip as a primary label. Alternatively, a tooltip that reads "View notifications and manage settings" is supplementary.

![The left example says notifications and has the caption primary label. The right example has the longer view notifications and manage settings text and is captioned auxiliary description.](https://inclusive-components.design/content/images/2017/07/primary_or_auxiliary.svg)

### Tooltip as primary label

To associate one element with another as its primary label, you can use `aria-labelledby`. The relationship is forged by the `aria-labelledby` and `id` attributes sharing the same value.

```
<button class="notifications" aria-labelledby="notifications-label">
  <svg><use xlink:href="#notifications-icon"></use></svg>
</button>
<div role="tooltip" id="notifications-label">Notifications</div>

```

- Note the use of the `tooltip` role. In practical terms, all this role offers is an assurance that `aria-describedby` works reliably where supported. As Léonie Watson writes, [ARIA labels and descriptions sometimes don't work with all elements](https://www.paciellogroup.com/blog/2017/07/short-note-on-aria-label-aria-labelledby-and-aria-describedby/) unless you incorporate an appropriate role. In this case, the most important role is the implicit button role of the subject `<button>` element, but `role="tooltip"` may extend support for this labeling method in some software.
- Whatever text content is in the linked SVG, it won't be read out. The `aria-labelledby` association _supersedes_ the text content of the button as the label.

To a screen reader — and its user — the above is now functionally similar to using a simple text label, like this:

```
<button class="notifications">Notifications</button>

```

The tooltip text is available on focus, just as it would be on hover for sighted users. In fact, if all text appeared only on hover, a sighted mouse user's experience of an interface would be somewhat analogous to that of a blind screen reader user.

#### Redundant tooltips

All the time as an interface design consultant, I see people providing `title` attributes to links with identical text nodes.

```
<a href="/some/path" title="Heydon's special page">Heydon's special page</a>

```

Since the text node is already perfectly visible, this is completely redundant. It doesn't even add anything for screen readers except — in some cases — repetition.

#### Including notification count

What if the notifications button showed a count of unread notifications, as these things often do (I'm thinking, of course, of Twitter)?

![The count appears in a circle partly covering the icon.](https://inclusive-components.design/content/images/2017/07/notification_count-1.svg)

Fortunately, `aria-labelledby` can accept multiple, space separated `id` s.

```
<button class="notifications" aria-labelledby="notifications-count notifications-label">
  <svg><use xlink:href="#notifications-icon"></use></svg>
  <span id="notifications-count">3</span>
</button>
<div role="tooltip" id="notifications-label">Notifications</div>

```

Despite the `#notifications-count` element appearing inside the `<button>`, it does not form the label by itself: It forms the first part of the label as the first `id` listed in the `aria-labelledby` value. It is placed where it is so that the designer can take advantage of relative and absolute positioning to arrange the element visually.

To screen reader users, the label is now "3 notifications". This succinctly acts as both a current count of notifications and a reminder that this is the notifications control.

### Tooltip as auxiliary description

Now let's try setting up the tooltip as a supplementary description, which is the archetypal form. Like `<input>` placeholders, tooltips should be for added information and clarification.

Some interactive elements may have accessible descriptions, but all interactive elements need accessible labels. If we're using `aria-describedby` to connect the tooltip text, we'll need another method for providing the "Notifications" label. Instead of `aria-labelledby` we can add a visually hidden span to the button's text node, alongside the existing "3" counter.

```
<button class="notifications" aria-describedby="notifications-desc">
  <svg><use xlink:href="#notifications-icon"></use></svg>
  <span id="notifications-count">3</span>
  <span class="visually-hidden">Notifications</span>
</button>
<div role="tooltip" id="notifications-desc">View and manage notifications settings</div>

```

The `visually-hidden` class corresponds to some special CSS we've discussed before on Inclusive Components. It hides the `<span>` visually without stopping it from being read out in screen readers.

```
.visually-hidden {
  clip-path: inset(100%);
  clip: rect(1px, 1px, 1px, 1px);
  height: 1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

```

The prescribed behavior of `aria-describedby` is to be announced as the last piece of information for the control, after the label and role. In this case: _"Notifications button… View and manage notifications settings"_ (most screen readers will leave a pause before the description).

### Interaction

To improve upon the notoriously awful `title` attribute, our custom tooltips should appear on focus as well as hover. By supplying the tooltip in an element adjacent to the button, we can do this with just CSS:

```
[role="tooltip"] {
  display: none;
}

button:hover + [role="tooltip"],
button:focus + [role="tooltip"] {
  display: block;
}

```

However, we may need to wrap the button and tooltip in a container element for positioning purposes:

```
.button-and-tooltip {
  position: relative;
}

[role="tooltip"] {
  position: absolute;
  /* left/top/right/bottom values as required */
}

```

## Touch interaction

So far this simply doesn't work so well for touch screen users because the focus and active states happen simultaneously. In practice, this means you'll see the tooltip, but only as the button is being pressed.

How _much_ of a problem this is depends on the nature of the app to which the control belongs. How bad is it if the user presses the control without really knowing what it does the first time? How easily can they recover?

There are other things you could try, of course. One might be to suppress the button's action on the first press so it _just_ shows the tooltip that time around. You could take this "tutorial mode" idea further still and show the tooltips as inline text for newcomers, but streamline the interface to just show icons for established users. By then, they should have learned what the icons represent.

![Left example for a new user has icons with text labels. Right example for an established user has just icons](https://inclusive-components.design/content/images/2017/07/new_established.svg)In either case, the landing screen for each of the options should have a clear ( `<h1>`) heading with the same wording as the labels. Then at least the user knows where the icon took them upon arrival.

This would be to do away with tooltips altogether, which is probably for the best anyway. However, the tooltip's sister component — the toggletip — can work for mouse, keyboard _and_ touch users.

## Inclusive toggletips

Toggletips are like tooltips in the sense that they can provide supplementary or clarifying information. However, they differ by making the control itself supplementary: toggletips exist to reveal information balloons, and serve no other purpose.

Often they take the form of little "i" icons:

![A round I icon disclosing a message that describes what notifications are.](https://inclusive-components.design/content/images/2017/07/i-1.svg)

To work by touch just as well as by mouse or keyboard, toggletips are revealed by click rather than by hover and focus. Crucially, this means the `aria-describedby` association is no longer appropriate. Why? Because a screen reader user would have access to the information before pressing the button, so pressing it would appear not to do anything. Technically, they have _access_ to the information, making the control "accessible" — but the control simply wouldn't make sense. In other words, it's a user experience issue more than a strict accessibility one, but it's important.

### Toggletips with live regions

The trick is to make screen readers announce the information after the click event. This is a perfect use case for a [live region](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions). We can supply an empty live region, and populate it with the toggletip "bubble" when it is invoked. This will both make the bubble appear visually and cause the live region to announce the tooltip's information.

To follow is the markup with the live region unpopulated. Note the `.tooltip-container` element, which is provided to help positioning. This element would have `position: relative`, allowing for absolutely positioning the generated `.toggletip-bubble` element nearby.

```
<span class="tooltip-container">
  <button type="button" aria-label="more info" data-toggletip-content="This clarifies whatever needs clarifying">i</button>
  <span role="status"></span>
</span>

```

Note the `type="button"` attribution which is to stop some browsers mistaking the button as a submit button when placed inside forms. Here is the markup with the live region populated (after the toggletip button is clicked):

```
<span class="tooltip-container">
  <button type="button" aria-label="more info" data-toggletip-content="This clarifies whatever needs clarifying">i</button>
  <span role="status">
    <span class="toggletip-bubble">This clarifies whatever needs clarifying</span>
  </span>
</span>

```

The accompanying script and codePen, with notes to follow:

```
(function() {
  // Get all the toggletip buttons
  var toggletips = document.querySelectorAll('[data-toggletip-content]');

  // Iterate over them
  Array.prototype.forEach.call(toggletips, function (toggletip) {
    // Get the message from the data-content element
    var message = toggletip.getAttribute('data-toggletip-content');

    // Get the live region element
    var liveRegion = toggletip.nextElementSibling;

    // Toggle the message
    toggletip.addEventListener('click', function () {
        liveRegion.innerHTML = '';
        window.setTimeout(function() {
          liveRegion.innerHTML = '<span class="toggletip-bubble">'+ message +'</span>';
        }, 100);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (toggletip !== e.target) {
        liveRegion.innerHTML = '';
      }
    });

    // Remove toggletip on ESC
    toggletip.addEventListener('keydown', function(e) {
      if ((e.keyCode || e.which) === 27)
      liveRegion.innerHTML = '';
    });
  });
}());

```

CodePen Embed - Toogletip

``` cm-s-default
<span class="toggletip-container">
  <button type="button" aria-label="more info" data-toggletip-content="This clarifies whatever needs clarifying">i</button>
  <span role="status"></span>
</span>
```

``` cm-s-default
.toggletip-container {
  position: relative;
  display: inline-block;
}

/* the bubble element, added inside the toggletip live region */

.toggletip-bubble {
  display: inline-block;
  position: absolute;
  left: 100%;
  top: 0;
  width: 10em;
  padding: 0.5rem;
  background: #000;
  color: #fff;
}

button {
  width: 2em;
  height: 2em;
  border-radius: 50%;
  border: 0;
  background: #000;
  font-family: serif;
  font-weight: bold;
  color: #fff;
}

button:focus {
  outline: none;
  box-shadow: 0 0 0 0.25rem skyBlue;
}

/* boilerplate; nothing really to see here */

html {
  font-size: 150%;
  font-family: sans-serif;
}

* {
  font-size: inherit;
}
```

``` cm-s-default
(function() {
  // Get all the toggletip buttons
  var toggletips = document.querySelectorAll('[data-toggletip-content]');

  // Iterate over them
  Array.prototype.forEach.call(toggletips, function (toggletip) {
    // Get the message from the data-content element
    var message = toggletip.getAttribute('data-toggletip-content');

    // Get the live region element
    var liveRegion = toggletip.nextElementSibling;

    // Toggle the message
    toggletip.addEventListener('click', function () {
        liveRegion.innerHTML = '';
        window.setTimeout(function() {
          liveRegion.innerHTML = '<span class="toggletip-bubble">'+ message +'</span>';
        }, 100);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (toggletip !== e.target) {
        liveRegion.innerHTML = '';
      }
    });

    // Remove toggletip on ESC
    toggletip.addEventListener('keydown', function(e) {
      if ((e.keyCode || e.which) === 27)
      liveRegion.innerHTML = '';
    });

    // Remove on blur
    toggletip.addEventListener('blur', function (e) {
      liveRegion.innerHTML = '';
    });
  });
}());
```

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

This Pen doesn't use any external JavaScript resources.


#### Notes

- Our button is not a toggle button — at least, not in the usual sense. Instead of clicking the button showing or hiding the bubble, it only shows it. Hiding the bubble is achieved by unfocusing the button, mouse clicking away from the button or pressing escape.
- When the button is clicked for a second (or third, fourth etc.) time, the live region is repopulated after a discreet interval, re-announcing the content in screen readers. This is simpler and more intuitive than implementing toggle states (a "message in on" state makes little sense, especially once it has already been read out).
- The "discreet interval" (see last item) is implemented using `setTimeout`. Without it, some setups are not able to register the repopulation of the live region and do not re-announce the contents.
- The `role="tooltip"` attribution is not applicable since we are using `role="status"` for the live region.

#### Progressively enhancing `title`

As discussed, the `title` attribute is _really_ flaky. But it _does_ at least provide an accessible label to some assistive technologies, available when the button is focused. We could provide the bubble content via `title` and use this to build the `data-toggletip-content` attribute on page load. Our script's initial hook now becomes the boolean `data-toggletip`:

```
<button data-toggletip aria-label="more info" title="This clarifies whatever needs clarifying">i</button>

```

In the script, we need to take the value from `title` to build `data-tooltip-content`, then destroy `title` because we don't need it and it might still appear / get announced if left festering.

```
var toggletips = document.querySelectorAll('[data-toggletip][title]');

Array.prototype.forEach(toggletips, function (toggletip) {
  var message = toggletip.getAttribute('title');
  toggletip.setAttribute('data-tooltip-content', message);
  toggletip.removeAttribute('title');
});

```

#### Better progressive enhancement

A button that doesn't do anything and happens to have a title attribute isn't really a very good baseline. Instead, I would recommend displaying the toggletip's content inline and then enhancing by creating the toggletip button dynamically.

Here's another codePen, which progressively enhances a simple paragraph into a toggletip:

CodePen Embed - Toggletip from paragraph

``` cm-s-default
<p data-toggletip>
  This clarifies whatever needs clarifying.
</p>
```

``` cm-s-default
.toggletip-container {
  position: relative;
  display: inline-block;
}

/* the bubble element, added inside the toggletip live region */

.toggletip-bubble {
  display: inline-block;
  position: absolute;
  left: 100%;
  top: 0;
  width: 10em;
  padding: 0.5rem;
  background: #000;
  color: #fff;
}

/* boilerplate; nothing really to see here */

html {
  font-size: 150%;
  font-family: sans-serif;
}

* {
  font-size: inherit;
}

button {
  width: 2em;
  height: 2em;
  border-radius: 50%;
  border: 0;
  background: #000;
  font-family: serif;
  font-weight: bold;
  color: #fff;
}
```

``` cm-s-default
(function() {
  // Get all the toggletip buttons
  var toggletipTexts = document.querySelectorAll('[data-toggletip]');

  // Iterate over them
  Array.prototype.forEach.call(toggletipTexts, function(toggletipText) {
    // Create the container element
    var container = document.createElement('span');
    container.setAttribute('class', 'toggletip-container');

    // Put it before the original element in the DOM
    toggletipText.parentNode.insertBefore(container, toggletipText);

    // Create the button element
    var toggletip = document.createElement('button');
    toggletip.setAttribute('type', 'button');
    toggletip.setAttribute('aria-label', 'more info');
    toggletip.setAttribute('data-toggletip-content', toggletipText.textContent);
    toggletip.textContent = 'i';

    // Place the button element in the container
    container.appendChild(toggletip);

    // Create the live region
    var liveRegion = document.createElement('span');
    liveRegion.setAttribute('role', 'status');

    // Place the live region in the container
    container.appendChild(liveRegion);

    // Remove the original element
    toggletipText.parentNode.removeChild(toggletipText);

    // Build `data-tooltip-content`
    var message = toggletip.getAttribute('data-toggletip-content');
    toggletip.setAttribute('data-toggletip-content', message);
    toggletip.removeAttribute('title');

    // Get the message from the data-content element
    var message = toggletip.getAttribute('data-toggletip-content');

    // Get the live region element
    var liveRegion = toggletip.nextElementSibling;

    // Toggle the message
    toggletip.addEventListener('click', function() {
        liveRegion.innerHTML = '';
        window.setTimeout(function() {
          liveRegion.innerHTML = '<span class="toggletip-bubble">'+ message +'</span>';
        }, 100);
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (toggletip !== e.target) {
        liveRegion.innerHTML = '';
      }
    });

    // Remove toggletip on ESC
    toggletip.addEventListener('keydown', function(e) {
      if ((e.keyCode || e.which) === 27)
      liveRegion.innerHTML = '';
    });

    // Remove on blur
    toggletip.addEventListener('blur', function (e) {
      liveRegion.innerHTML = '';
    });
  });
}());
```

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

This Pen doesn't use any external JavaScript resources.


## Tests and error messages

Something I haven't talked about on Inclusive Components is writing tests, so let's do a little of that here. Don't worry, I don't mean unit tests.

If our toggletip component is to belong to a design system, it may be borrowed and used by lots of different people. By writing tests and including warnings, we can try to ensure it isn't being used improperly.

A toggletip button that isn't a `<button>` provides a deceptive role to assistive technologies and is not focusable by keyboard (unless it's another, inappropriate focusable element like a hyperlink). In our script, we can detect the element `nodeName` and return an error message if it is not `BUTTON`. We use `return` to stop the remainder of the IIFE (Immediately Invoked Function Expression) from executing.

```
if (toggletip.nodeName !== 'BUTTON') {
  console.error('Toggletip buttons need to be <button> elements.')
  return;
}

```

![The error message screenshot form developer tools](https://inclusive-components.design/content/images/2017/07/error_message.png)

### CSS tests and error messages

In [Inclusive Design Patterns](https://shop.smashingmagazine.com/products/inclusive-design-patterns) I write about creating deliberate visual regressions to highlight code errors, and providing error messages in the developer tools CSS inspector.

The error we caught with JavaScript earlier can be caught using the CSS selector `[data-tooltip]:not(button)`. We can highlight the erroneous element with a red outline, and provide an error message using the made-up `ERROR` property:

```
[data-tooltip]:not(button) {
  outline: red solid 0.5em;
  ERROR: Toggletip buttons need to be <button> elements.
}

```

Despite being an invalid property, the `ERROR` will appear in dev tools when the element is inspected.

![A red outline appears around the icon](https://inclusive-components.design/content/images/2017/07/red_outline.svg)The clear red outline shows there is an error present and guides the developer's DOM inspector cursor.

## Conclusion

Most of the time, tooltips shouldn't be needed if you provide clear textual labeling and familiar iconography. Most of the time toggletips are a complex way of providing information that could just be part of the document's prose content. But I see each of these components all the time in auditing websites, so I wanted to provide some guidance on how to make the most of them.

### Checklist

- If you have space, don't use tooltips or toggletips. Just provide clear labels and sufficient body text.
- If it's a tooltip you are looking to use, decide whether the tip's content should be provided as the label or description and choose ARIA properties accordingly.
- Don't rely on `title` attributes. They are not keyboard accessible and are not supported in many screen reader setups.
- Don't describe toggletips with `aria-describedby`. It makes the subject button non-functional to screen reader users.
- Don't put interactive content such as close and confirm buttons or links in tooltips or toggletips. This is the job of more complex menu and dialog components.

_With thanks to [@backwardok](https://twitter.com/backwardok) who spotted I'd created a repetitive label by using a text node for the same element's ARIA description. Whoops!_

 [↩\\
 Back to components list](https://inclusive-components.design/#components) 
