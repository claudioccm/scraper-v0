## Get the book!

The
[Inclusive Components book](http://book.inclusive-components.design/) is now available, with
**updated and improved** content and demos.


![book cover with the strap line, accessible web interfaces piece by piece](https://inclusive-components.design/assets/images/on-light.svg?v=89073ee017)

Some things are either on or off and, when those things aren't on
(or off), they are invariably off (or on). The concept is so rudimentary
that I've only complicated it by trying to explain it, yet on/off
switches (or toggle buttons) are not all alike. Although their purpose
is simple, their applications and forms vary greatly.

In this inaugural post, I'll be exploring what it takes to make
toggle buttons inclusive. As with any component, there's no one way to
go about this, especially when such controls are examined under
different contexts. However, there's certainly plenty to forget to do or
to otherwise screw up, so let's try to avoid any of that.

* * *

## Changing state

If a web application did not change according to the instructions of
its user, the resulting experience would be altogether unsatisfactory.
Nevertheless, the luxury of being able to make web documents augment
themselves instantaneously, without recourse to a page refresh, has not
always been present.

Unfortunately, somewhere along the way we decided that accessible web
pages were only those where very little happened — static documents,
designed purely to be read. Accordingly, we made little effort to make
the richer, _stateful_ experiences of web applications inclusive.

A popular misconception has been that screen readers _don't understand_
JavaScript. Not only is this entirely untrue — all major screen readers
react to changes in the DOM as they occur — but basic state changes,
communicated both visually and to assistive technology software, do not
necessarily depend on JavaScript to take place anyway.

## Checkboxes and radio buttons

Form elements are the primitives of interactive web pages and, where
we're not employing them directly, we should be paying close attention
to how they behave. Their handling of state changes have established
usability conventions we would be foolish to ignore.

Arguably, an out-of-the-box input of the `checkbox` type
is a perfectly serviceable on/off switch all its own. Where labelled
correctly, it has all the fundamental ingredients of an accessible
control: it's screen reader and keyboard accessible between platforms
and devices, and it communicates its change of state ( _checked_ to _unchecked_ or vice versa) without needing to rebuild the entire document.

In the following example, a checkbox serves as the toggle for an email notifications setting.

```
<input type="checkbox" id="notify" name="notify" value="on">
<label for="notify">Notify by email</label>

```

![The notify my email control with checkbox checked](https://inclusive-components.design/content/images/2017/03/checkbox.svg)

Screen reader software is fairly uniform in its interpretation of this control. On focusing the control (moving to it using the `Tab` key) something similar to, _"Notify by email, checkbox, unchecked"_ will be announced. That's the label, role, and state information all present.

On checking the checkbox, most screen reader software will announce
the changed state, "checked" (sometimes repeating the label and role
information too), immediately. Without JavaScript, we've handled state
and screen reader software is able to feed back to the user.

In this case, the on/off part of the switch is not communicated by
the label but the state. Instead, the label is for identifying the thing
that we are turning off or on. Should research show that users benefit
from a more explicit on/off metaphor, a radio button group can be
employed.

```
<fieldset>
  <legend>Notify by email</legend>
  <input type="radio" id="notify-on" name="notify" value="on" checked>
  <label for="notify-on">on</label>
  <input type="radio" id="notify-off" name="notify" value="off">
  <label for="notify-off">off</label>
</fieldset>

```

![Fieldset with notify by email group label (legend) and radio buttons labeled on and off. The on one is selected.](https://inclusive-components.design/content/images/2017/03/radio.svg)

Group labels are a powerful tool. As their name suggests, they can
provide a single label to related (grouped) items. In this case, the `<fieldset>` group element works together with the `<legend>` element to provide the group label "Notify by email" to the pair of radio buttons. These buttons are made a pair by sharing a `name`
attribute value, which makes it possible to toggle between them using
your arrow keys. HTML semantics don't just add information but also
affect behavior.

In the Windows screen readers JAWS and NVDA, when the user focuses
the first control, the group label is prepended to that control's
individual label and the grouped radio buttons are enumerated. In NVDA,
the term "grouping" is appended to make things more explicit. In the
above example, focusing the first (checked by default) radio button
elicits, _"Notify by email, grouping, on radio button, checked, one of two"_.

Now, even though the checked state (announced as "selected" in some
screen readers) is still being toggled, what we're really allowing the
user to do it switch between "on" and "off". Those are the two possible _lexical states_, if you will, for the composite control.

### This doesn't quite feel right

Both the checkbox and radio button implementations are tenable as
on/off controls. They are, after all, accessible by mouse, touch,
keyboard, and assistive technology software across different devices,
browsers, and operating systems.

But accessibility is only a part of inclusive design. These controls also have to _make sense_ to users; they have to play an unambiguous role within the interface.

The trouble with using form elements is their longstanding
association with the collection of data. That is, checkboxes and radio
buttons are established as controls for designating _values_. When a user checks a checkbox, they may just be switching a state, but they may _suspect_ they are also choosing a value for submission.

Whether you're a sighted user looking at a checkbox, a screen reader
user listening to its identity being announced, or both, its etymology
is problematic. We expect toggle buttons to be buttons, but checkboxes
and radio buttons are really inputs.

## A true toggle button

Sometimes we use `<button>` elements to submit forms. To be fully compliant and reliable these buttons should take the `type` value of `submit`.

```
<button type="submit">Send</button>

```

But these are only one variety of button, covering one use case. In truth, `<button>` elements can be used for all sorts of things, and not just in association with forms. They're just _buttons_. We remind ourselves of this by giving them the `type` value of `button`.

```
<button type="button">Send</button>

```

The generic button is your go-to element for changing anything within
the interface (using JavaScript and without reloading the page) except
one's location within and between documents, which is the purview of
links.

Next to links, buttons should be the interactive element you use most
prolifically in web applications. They come prepackaged with the
"button" role and are keyboard and screen reader accessible by default.
Unlike some form elements, they are also trivial to style.

So how do we make a `<button>` a toggle button? It's
a case of using WAI-ARIA as a progressive enhancement. WAI-ARIA offers
states that are not available in basic HTML, such as the _pressed_
state. Imagine a power switch for a computer. When it's pressed — or
pushed in — that denotes the computer is in its "on" state. When it's
unpressed — poking out — the computer must be off.

```
<button type="button" aria-pressed="true">
  Notify by email
</button>

```

WAI-ARIA state attributes like `aria-pressed` behave like booleans but, unlike standard HTML state attributes like `checked` they must have an explicit value of `true` or `false`. Just adding `aria-pressed` is not reliable. Also, the absence of the attribute would mean the _unpressed_ state would not be communicated (a button without the attribute is just a generic button).

You can use this control inside a form, or outside, depending on your needs. But if you do use it inside a form, the `type="button"` part is important. If it's not there, some browsers will default to an implicit `type="submit"` and try to submit the form. You don't have to use `event.preventDefault()` on `type="button"` controls to suppress form submission.

Switching the state from `true` (on) to `false` (off) can be done via a simple click handler. Since we are using a `<button>`, this event type can be triggered with a mouse click, a press of either the `Space` or `Enter` keys, or by tapping the button through a touch screen. Being responsive to each of these actions is something built into `<button>` elements as standard. If you consult the [HTMLButtonElement](https://developer.mozilla.org/en/docs/Web/API/HTMLButtonElement) interface, you'll see that other properties, such as `disabled`, are also supported out-of-the-box. Where `<button>` elements are not used, these behaviors have to be emulated with bespoke scripting.

```
const toggle = document.querySelector('[aria-pressed]');

toggle.addEventListener('click', (e) => {
  let pressed = e.target.getAttribute('aria-pressed') === 'true';
  e.target.setAttribute('aria-pressed', String(!pressed));
});

```

### A clearer state

An interesting thing happens when a button with the `aria-pressed`
state is encountered by some screen readers: it is identified as a
"toggle button" or, in some cases, "push button". The presence of the
state attribute changes the button's identity.

When focusing the example button with `aria-pressed="true"` using NVDA, the screen reader announces, _"Notify by email, toggle button, pressed"_.
The "pressed" state is more apt than "checked", plus we eschew the form data input connotations. When the button is clicked,
immediate feedback is offered in the form of _"not pressed"_.

### Styling

The HTML we construct is an important part of the design work we do
and the things we create for the web. I'm a strong believer in doing
HTML First Prototyping™, making sure there's a solid foundation for the
styled and branded product.

In the case of our toggle button, this foundation includes the
semantics and behavior to make the button interoperable with various
input (e.g. voice activation software) and output (e.g. screen reader)
devices. That's possible using HTML, but CSS is needed to make the
control understandable visually.

Form should follow function, which is simple to achieve in CSS:
everything in our HTML that makes our simple toggle button function can
also be used to give it form.

- `<button>` → `button` element selector
- `aria-pressed="true"` → `[aria-pressed="true"]` attribute selector

In a consistent and, therefore, easy to understand interface, buttons
should share a certain look. Buttons should all look like buttons. So,
our basic toggle button styles should probably inherit from the `button` element block:

```
/* For example... */
button {
  color: white;
  background-color: #000;
  border-radius: 0.5rem;
  padding: 1em 2em;
}

```

There are a number of ways we could visually denote "pressed". Interpreted literally, we might make the button look _pressed in_ using some inset `box-shadow`. Let's employ an attribute selector for this:

```
[aria-pressed="true"] {
  box-shadow: inset 0 0 0 0.15rem #000,
              inset 0.25em 0.25em 0 #fff;
}

```

To complete the pressed/unpressed metaphor, we can use some positioning and `box-shadow` to make the unpressed button "poke out". This block should appear above the `[aria-prressed="true"]` block in the cascade.

```
[aria-pressed] {
  position: relative;
  top: -0.25rem;
  left: -0.25rem;
  box-shadow: 0.125em 0.125em 0 #fff,
              0.25em 0.25em #000;
}

```

![Left button, sticking out, is labeled aria-pressed equals false. Right button, visually depressed, is labelled aria-pressed equals true.](https://inclusive-components.design/content/images/2017/03/pressed_unpressed.svg)

( **Note:** This styling method is offered just as one idea. You may find that something more explicit, like the use of "on"/"off" labels in an example to follow, is better understood by more users.)

#### Focus styles

It's important buttons, along with _all_ interactive
components, have focus styles. Otherwise people navigating by keyboard
cannot see which element is in their control and ready to be operated.

The best focus styles do not affect layout (the interface shouldn't
jiggle around distractingly when moving between elements). Typically,
one would use `outline`, but `outline` only ever draws a box in most browsers. To fit a focus style around the curved corners of our button, a `box-shadow` is better. Since we are using `box-shadow` already, we have to be a bit careful: note the two comma-separated `box-shadow` styles in the pressed-and-also-focused state.

```
/* Remove the default outline and
add the outset shadow */
[aria-pressed]:focus {
  outline: none;
  box-shadow: 0 0 0 0.25rem yellow;
}

/* Make sure both the inset and
outset shadow are present */
[aria-pressed="true"]:focus {
  box-shadow: 0 0 0 0.25rem yellow,
              inset 0 0 0 0.15rem #000,
              inset 0.25em 0.25em 0 #fff;
}

```

## Changing labels

The previous toggle button design has a self-contained, unique label
and differentiates between its two states using a change in attribution
which elicits a style. What if we wanted to create a button that changes
its label from "on" to "off" or "play" to "pause"?

It's perfectly easy to do this in JavaScript, but there are a couple of things we need to be careful about.

1. If the _label_ changes, what happens with the state?
2. If the label is just "on" or "off" ("play" or "pause"; "active" or "inactive") how do we know what the button actually controls?

In the previous toggle button example, the label described _what_
would be on or off. Where the "what" part is not consistent, confusion
quickly ensues: once "off"/unpressed has become "on"/pressed, I have to
unpress the "on" button to turn the "off" button back on. What?

As a rule of thumb, you should never change pressed state and label
together. If the label changes, the button has already changed state in a
sense, just not via explicit WAI-ARIA state management.

In the following example, just the label changes.

```
const button = document.querySelector('button');

button.addEventListener('click', (e) => {
  let text = e.target.textContent === 'Play' ? 'Pause' : 'Play';
  e.target.textContent = text;
});

```

The problem with this method is that the label change is not
announced as it happens. That is, when you click the play button,
feedback equivalent to "pressed" is absent. Instead, you have to
unfocus and refocus the button manually to hear that it has changed. Not
an issue for sighted users, but less ergonomic for blind screen reader
users.

Play/pause buttons usually switch between a play symbol (a triangle on its side) and a pause symbol (two vertical lines). We _could_ do this while keeping a consistent non-visual label and changing state.

```
<!-- Paused state -->
<button type="button" aria-pressed="false" aria-label="play">
  &#x25b6;
</button>

<-- Playing state -->
<button type="button" aria-pressed="true" aria-label="play">
  &#x23f8;
</button>

```

Because `aria-label` overrides the unicode symbol text node, the paused button is announced as something similar to, _"Play button, not pressed"_ and the playing button as , _"Play button, pressed"_.

This works pretty well, except for where voice recognition and
activation is concerned. In voice recognition software, you typically
need to identify buttons by vocalizing their labels. And if a user sees a
pause symbol, their first inclination is to say "pause", not "play". For this reason, switching the label rather than the state is more robust here.

![Three implementation examples. The first just changes label from play to pause and is okay. The second keeps the play label and changes state, which is incorrect because the pause button cannot be identified with voice recognition. The third changes label and state so the button becomes a pause button which is pressed, which is incorrect. Only use one of the first two implementations.](https://inclusive-components.design/content/images/2017/03/play_pause.svg)Never change label and state at the same time. In this example, that would result in a paused button in the pressed state.
Since the video or audio would be playing at this point, the lexical
"pause" state cannot be also be considered "pressed" on "on".

### Auxiliary labeling

In some circumstances, we may want to provide on/off switches which
actually read "on/off". The trick with these is making sure there is a
clear association between each toggle switch and a respective,
auxiliary label.

Imagine the email notification setting is grouped alongside other
similar settings in a list. Each list item contains a description of the
setting followed by an on/off switch. The on/off switch uses the terms
"on" and "off" as part of its design. Some `<span>` elements are provided for styling.

```
<h2>Notifications</h2>
<ul>
  <li>
    Notify by email
    <button>
      <span>on</span>
      <span>off</span>
    </button>
  </li>
  <li>
    Notify by SMS
    <button>
      <span>on</span>
      <span>off</span>
    </button>
  </li>
  <li>
    Notify by fax
    <button>
      <span>on</span>
      <span>off</span>
    </button>
  </li>
  <li>
    Notify by smoke signal
    <button>
      <span>on</span>
      <span>off</span>
    </button>
  </li>
</ul>

```

![A list of notifications settings with associated buttons reading with either on or off highlighted, depending on the state](https://inclusive-components.design/content/images/2017/03/notifications.svg)

The virtue of lists is that, both visually and non-visually, they
group items together, showing they are related. Not only does this help
comprehension, but lists also provide navigational shortcuts in some
screen readers. For example, JAWS provides the `L` (list) and `I` (list item) quick keys for moving between and through lists.

Each 'label' and button is associated by belonging to a common list
item. However, not providing an explicit, unique label is dangerous
territory — especially where voice recognition is concerned. Using `aria-labelledby`, we can associate each button with the list's text:

```
<h2>Notifications</h2>
<ul>
  <li>
    <span id="notify-email">Notify by email</span>
    <button aria-labelledby="notify-email">
      <span>on</span>
      <span>off</span>
    </button>
  </li>
  <li>
    <span id="notify-sms">Notify by SMS</span>
    <button aria-labelledby="notify-sms">
      <span>on</span>
      <span>off</span>
    </button>
  </li>
  <li>
    <span id="notify-fax">Notify by fax</span>
    <button aria-labelledby="notify-fax">
      <span>on</span>
      <span>off</span>
    </button>
  </li>
  <li>
    <span id="notify-smoke">Notify by smoke signal</span>
    <button aria-labelledby="notify-smoke">
      <span>on</span>
      <span>off</span>
    </button>
  </li>
</ul>

```

Each `aria-labelledby` value matches the appropriate span `id`, forming the association and giving the button its unique label. It works much like a `<label>` element's `for` attribute identifying a field's `id`.

#### The switch role

Importantly, the ARIA label overrides each button's textual content, meaning we can once again employ `aria-pressed` to communicate state. However, since these buttons are explicitly "on/off" switches, we can instead use the [WAI-ARIA switch role](https://www.w3.org/TR/wai-aria-1.1/#switch), which communicates state via `aria-checked`.

```
<h2>Notifications</h2>
<ul>
  <li>
    <span id="notify-email">Notify by email</span>
    <button role="switch" aria-checked="true" aria-labelledby="notify-email">
      <span>on</span>
      <span>off</span>
    </button>
  </li>
  <li>
    <span id="notify-sms">Notify by SMS</span>
    <button role="switch" aria-checked="true" aria-labelledby="notify-sms">
      <span>on</span>
      <span>off</span>
    </button>
  </li>
  <li>
    <span id="notify-fax">Notify by fax</span>
    <button role="switch" aria-checked="false" aria-labelledby="notify-fax">
      <span>on</span>
      <span>off</span>
    </button>
  </li>
  <li>
    <span id="notify-smoke">Notify by smoke signal</span>
    <button role="switch" aria-checked="false" aria-labelledby="notify-smoke">
      <span>on</span>
      <span>off</span>
    </button>
  </li>
</ul>

```

How you would style the active state is quite up to you, but I'd personally save on writing class attributes to the `<span>` s with JavaScript. Instead, I'd write some CSS using pseudo classes to target the relevant span dependent on the state.

```
[role="switch"][aria-checked="true"] :first-child,
[role="switch"][aria-checked="false"] :last-child {
  background: #000;
  color: #fff;
}

```

#### Traversing the settings

Now let's talk about navigating through this settings section using two different strategies: by `Tab` key (jumping between focusable elements only) and browsing by screen reader (moving through each element).

Even when navigating by `Tab` key, it's not only the
identity and state of the interactive elements you are focusing that
will be announced in screen readers. For example, when you focus the
first `<button>`, you'll hear that it is a _switch_ with the label "Notify by email", in its _on_ state. "Switch" is the role and `aria-checked="true"` is vocalized as "on" where this role is present.

But in most screen readers you'll also be told you've entered a list
of four items and that you're on the first item — useful contextual
information that works a bit like the group labelling I covered earlier
in this post.

Importantly, because we have used `aria-labelledby` to associate the adjacent text to the button as its label, that is also available when navigating in this mode.

When browsing from item to item (for example, by pressing the down
key when the NVDA screen reader is running), everything you encounter is
announced, including the heading ( _"Notifications, heading level two"_). Of course, browsing in this fashion, _"Notify by email"_
is announced on its own as well as in association with the adjacent
button. This is somewhat repetitive, but makes sense: "Here's the
setting name, and here's the on/off switch for the setting of this
name."

How explicitly you need to associate controls to the things they
control is a finer point of UX design and worth considering. In this
case we've preserved our classic on/off switches for sighted users,
without confusing or misleading either blind or sighted screen reader
users no matter which keyboard interaction mode they are using. It's
pretty robust.

## Conclusion

How you design and implement your toggle buttons is quite up to you,
but I hope you'll remember this post when it comes to adding this
particular component to your pattern library. There's no reason why
toggle buttons — or any interface component for that matter — should
marginalize the number of people they often do.

You can take the basics explored here and add all sorts of design
nuances, including animation. It's just important to lay a solid
foundation first.

### Checklist

- Use form elements such as checkboxes for on/off toggles if you are certain the user won't believe they are for submitting data.
- Use `<button>` elements, not links, with `aria-pressed` or `aria-checked`.
- Don't change label and state together.
- When using visual "on" and "off" text labels (or similar) you can override these with a unique label via `aria-labelledby`.
- Be careful to make sure the contrast level between the button's text and background color meets WCAG 2.0 requirements.

[↩\\
 Back to components list](https://inclusive-components.design/#components)
