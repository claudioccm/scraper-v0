[skip to content](https://inclusive-components.design/notifications/#main)

## Get the book!

The
[Inclusive Components book](http://book.inclusive-components.design/) is now available, with
**updated and improved** content and demos.


![book cover with the strap line, accessible web interfaces piece by piece](https://inclusive-components.design/assets/images/on-light.svg?v=89073ee017)

The key difference between a website and a web app is… highly contested. On the whole, I'd say the more links there are, the more site-like, and the more buttons, the more app-like. If it includes a page with a form, it's probably a kind of site. If it essentially _is_ a form, you might call it an app. In any case, your web 'product' is really just interactive content, consumed and transmitted by an app we call a 'browser'.

One thing that certainly makes a web page _feel_ more like a desktop app is statefulness. Web pages that undergo changes as you are operating them are something quite unlike web pages that just load and unload as you click hyperlinks.

Sometimes the user might instigate a change in state. Sometimes another user might affect the app remotely, in real time. Occasionally, the app might be subject to environmental and time-based events independent of user interaction. In each case, it's important users are kept abreast of changing state, which is a question of notifying them.

In this article, I'll be looking at notification components and how they can increase confidence in the use of web applications, in an inclusive way.

* * *

## Drawing attention

One of the biggest challenges in creating usable interfaces is knowing when to draw attention to something. Over-sharing may be considered a nuisance, but under-sharing might make the user feel they are missing critical information. This makes some hesitant, even where there is really nothing they "need to know" at the time.

Then there's the _how_. Broadly speaking, there are two kinds of messages which need two different approaches to be accessible:

1. Messages asking users to take action
2. _Just FYI_ messages

Typically, a message asking a user to do something would form the content of a dialog window (or inline disclosure), and be accompanied by a choice of action buttons. Because the keyboard operator will need to access those buttons, focus must be moved into the dialog.

For the purpose of this article, what I mean by "notification" is a message that just lets you know what's going on. This may be so you can choose to take action later, or it may be to assure you of an event having taken place already.

In screen reader and keyboard accessibility terms, it's important that focus is _not_ moved to such messages. If there is nothing to be done with the tool, you don't put the tool in the person's hand. Despite this, moving focus has endured as a 'best practice'. Why? Because focusing an element has, traditionally, been the most reliable way to get that element and its contents announced in screen readers.

![Shows focus being moved to a notification, triggering announcement in the screen reader](https://inclusive-components.design/content/images/2018/02/illustration1.svg)"Okay great. But where am I? What do I do now?"

Fortunately, we have live regions to help us break this habit.

## Live regions 101

We've used live regions before on Inclusive Components, but I'm going to take the time to give you a broad overview here.

A live region is just a container element that sets a perimeter around 'live' content: content that will be announced — by screen reader software — without user interaction, under certain conditions. By default, a live region will announce anything that is added or changed inside it.

Somewhat perplexingly, there are two equivalent APIs for live regions: the `aria-live` attribute and live region ARIA roles. In most cases, you will want to use one of `role="status"` or `aria-live="polite"`. Using both simultaneously maximizes compatibility with different browser and assistive technology pairings:

```
<div role="status" aria-live="polite">
</div>

```

Adding "Take a short break!" to this live region (as illustrated below) will trigger announcement immediately after the text node is inserted. It doesn't have to be a text node; it can be any markup.

```
<div role="status" aria-live="polite">
  Take a short break!
</div>

```

Now the "Take a short break!" message's arrival in the interface can be seen and heard simultaneously, creating a parity between the visual and (screen reader assisted) aural experience. It is not the _same_ experience, but it is a [_comparable_](http://inclusivedesignprinciples.org/#provide-comparable-experience) one: it serves the same purpose.

And everyone should take a periodic screen break.

### Invisible live regions

Sometimes, to create an overall comparable experience, a little extra aural information may be needed as a supplement. For example, when a user clicks an 'add to cart' button, the interface's response may be to animate the product moving into the cart. A direct translation of this may be a whooshing and clunking sound, but I suspect a visually hidden live region stating "product added successfully" (or similar) would be a lot clearer.

![A packet of quinoa dog sweets is dragged onto the shopping cart symbol, triggering the readout of 'Quinoa dog sweets added to cart' as it is added](https://inclusive-components.design/content/images/2018/02/illustration2.svg)

Adding a live region to a page already containing the content you wish to be announced is not reliable. There should be at least some time between the live region being appended to the DOM and the content being appended to the live region.

For simply making screen readers "say things" alongside events in your scripts, I have [created a small module](https://github.com/Heydon/on-demand-live-region). Here's a hypothetical instantiation, using default settings:

```
const liveRegion = new OnDemandLiveRegion()

liveRegion.say('Take a short break!')

```

Since the script creates hidden ARIA live regions and populates them on the fly, it makes communicating to screen readers procedurally trivial. However, in most cases — and in the case of status messages especially — we want to be communicating to _users_. Not users running screen readers or users _not_ running screen readers; just users. Live regions make it easy to communicate through visual and aural channels simultaneously.

## A chat application

In a chat application (something like Slack, say, where most everything happens in real time) there are a number of opportunities for status messages. For example:

- Users coming online
- Users being added to channels
- Users replying to your messages
- Users 'reacting' to your messages

All of these types of messages coming in all the time is going to quickly become distracting and irritating, especially in their aural form. You can avert your eyes, but not your ears.

We would need to do a couple of things to make the experience more tolerable:

- Restrict messages only to suitable contexts and situations
- Give the user control over messaging verbosity

### Restricting messages to contexts

Something I noticed recently while running a screen reader on one browser tab was that I could hear live regions rattling off updates from another open tab, not visible to me. The only solution was to close down the hidden tab. Not ideal, because I would have liked to switch back and forth between them.

![Two browser tabs, with one in the foreground corresponding to the open page. The unselected tab has 'bla bla bla' being read out.](https://inclusive-components.design/content/images/2018/02/illustration3.svg)

For a sighted user, unseen is unknown. It doesn't matter if the messages keep getting displayed. But, for screen reader users (blind or otherwise), we need to silence output for hidden tabs. We can do this by querying `document.hidden` within the `visibilitychange` event from the [Page Visibility API](https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API) and switching the live region between active and inactive. Inactive live regions take `role="none"` and/or `aria-live="off"`.

Here's how that would work:

```
const notifications = document.getElementById('notifications');

document.addEventListener('visibilitychange', () => {
  let setting = document.hidden ? ['none', 'off'] : ['status', 'polite'];

  notification.setAttribute('role', setting[0]);
  notification.setAttribute('aria-live', setting[1]);
});

```

#### Your setup may vary

It's worth noting that some combinations of screen reader software and browser automatically silence at least some types of live region for hidden or unfocused tabs and windows. However, you can't rely on all your users having these setups and — where they don't — the experience is very off-putting.

#### Conversations

Even when inside the open tab for the chat application, you won't want to be inundated by a flurry of any and all notifications. Visually, it could get irritating; aurally it almost _certainly_ will.

Knowing when to notify the user is a question of determining what activity they are currently engaged in. For example, users probably aren't interested in the messages of users not posting in the current thread, or the arrival online of users they have no history of engaging with in the past.

On the other hand, if the user is focused on the text input for a thread and a new message pops in, they're probably going to want to know about it. In this case, the message would just appear if you're a sighted user. For a blind screen reader user, you make the new message its own notification with a live region.

The `aria-relevant` attribute controls which kinds of changes to the live region are considered worthy of readout. In this case, only newly added messages are really of interest so we set `aria-relevant="additions"` on the parent element for the message stream.

![Messages appear above a text input labeled your message. The messages are in a container with aria-relevant equals additions applied to it. The input is focused.](https://inclusive-components.design/content/images/2018/02/illustration4.svg)When the new mesage, in grey,
 appears, only its contents — and not the contents of the other messages — are announced in screen readers.

Removed or edited messages would not be re-announced, but edited messages _should_ remain discoverable. Hence, the markup for messages should be well-formed and semantically clear, using a list ( `<ul>`) structure to group them together.

```
<h1>Self care chat</h1>
<div role="status" aria-live="polite" aria-relevant="additions">
  <ul class="messages">
    <li>
      <h2>Heydon, <small>22 minutes ago</small>:</h2>
      <p>Take a screen break. It's been 15 hours.</p>
    </li>
    <li>
      <h2>Heydon:</h2>
      <p>Oh, I guess you are already.</p>
    </li>
  </ul>
<div>
<form>
   <label for="message">Your message</label>
   <textarea id="message"></textarea>
   <button type="submit">Post</button>
</form>

```

When that last item is appended to the master list, screen reader users hear "Heydon: Oh, I guess you are already." Arguably, you should append each message with the word 'message' to differentiate messages from other notifications. We'll come to those shortly.

One refinement might be that, if the screen reader user is _not_ focused on the text input they should only hear a new message being announced if it addresses them directly — using an "@", say. We're not depriving these users; we're just not interrupting them during a different task, unless it's a specific 'hey I need you'.

## Flash messages

Flash messages — little colored strips of text that appear above the 'action' of the page — are often employed to keep users abreast of changing state. A single ARIA live region will suffice for these non-actionable notifications.

I'll come to how these should be designed shortly, but first we need to make sure they can be switched off. The first thing I do when I install an app like Skype is switch off the notification sounds, and for good reason.

### The settings screen

Designing a page that houses application settings does not require a feat of engineering. It's just headings, subheadings, and form controls. But, through lack of care, you can botch the information architecture and terminology.

"General" and "Content" don't really mean anything as category names, for example. And hiding what you subjectively consider 'advanced' settings behind a tiny, hard to locate link doesn't help either.

Word everything descriptively, and structure everything logically. Use standard form controls such as checkboxes, radio buttons, and sliders. The settings screen [gives users control](http://inclusivedesignprinciples.org/#give-control) over how they use the application; don't make it an afterthought.

#### Headings inside legends

When structuring (long) forms, it often helps to group related controls together inside `<fieldset>` elements. Then `<legend>` elements can be employed to provide 'group labels'. These are announced when screen reader users enter the fieldset and focus the first control. They give contextual information.

`<legend>` s tend to supplant headings, because otherwise you'd be labeling sections of the form twice. The trouble is, headings have their own advantages for screen reader navigation.

Fortunately, [a recent change to the HTML spec](http://w3c.github.io/html/sec-forms.html#the-legend-element) now allows you to author pages with headings inside your `<legend>` s: the best of both worlds. Here's the sort of structure, we should be going for:

![An h1 of settings followed by two sections: Change your password and Notifications, each introduced by h2 headings inside legends and grouped by fieldset containers.](https://inclusive-components.design/content/images/2018/02/illustration5_small.svg)

Note that turning off a notification type would mean it no longer occurs visually or aurally (in screen reader output). It's likely that certain notifications would be much less desirable to many screen reader users, and they're more likely to turn them off. But everyone has the _same_ control and can make decisions for themselves. We're not making assumptions for them.

### Differentiating message types

Our singular live region may play host to a variety of notification types. Basic information will probably be most common, but there may be warnings, errors, and messages of congratulation — perhaps the user can earn awards for being a helpful member of the community.

The general rule is that **any part of an interface differentiated only by style and not content will be inaccessible**. Things like shape, color, position are just not enough on their own to define something inclusively. In this case, the MVP for differentiating messages is therefore to preface with terms like "Error:", "Info:", "Congratulations:" or whatever is suitable. A bold style is typical.

![Three different message types. A message starting 'congratulations' in green, a message starting 'error' in red and a message starting 'info' in blue.](https://inclusive-components.design/content/images/2018/02/illustration10.svg)

Should you wish to supplant the text with icons you'll have to be careful they are visually comprehensible, include alternative text for screen reader users, and are still visible where Windows High Contrast Mode is running.

Try an optimized, inline SVG with a `fill` set to `currentColor` to honor high contrast mode. For alternative text, `aria-label` is not recommended because it is not picked up by translation services like Google's. The same, unfortunately, applies to any text ( `<title>` or `<text>`, say) _inside_ SVGs. The best we can do is insert some [visually hidden](https://www.w3.org/WAI/tutorials/fundamentals/hiding/#content-that-should-only-be-hidden-visually) text just for assistive software. It's ugly markup, but it works.

```
<div role="status" aria-live="polite">
  <div class="message award">
    <p>
      <strong>
        <svg viewBox="0 0 20 20" focusable="false">
          <use xlink:href="#star"></use>
        </svg>
        <span class="visually-hidden">Congratulations!</span>
      </strong>
      You've been awarded 6 fake internet points
    </p>
  </div>
</div>

```

![An empty dotted outline indicates the invisible span that reads ](https://inclusive-components.design/content/images/2018/02/illustration8.svg)The hidden span would of course be completely invisible. The outline is shown here just to indicate its whereabouts.

### Dismissing notifications

Working as a design consultant, I often see notification messages include little "✖️" buttons to dismiss them.

![Notification with a cross symbol/button to its right hand side.](https://inclusive-components.design/content/images/2018/02/illustration9.svg)

While I always want to applaud efforts to put users in control of the interface, I'm not so sure in this case. I just don't think the ability to manually dismiss notifications is important enough to _bother_ users with; it's not something worth encountering or having to think about. (There's also the issue of managing focus when the close button is removed from the DOM after being pressed, as covered in [A Todo List](https://inclusive-components.design/a-todo-list/)).

Instead, it's better the messages just disappear by themselves — after an appropriate amount of time. Here's a small script that lets you create notifications regions by type ('error', 'award', or 'info', say) and inject/remove notification messages after a chosen amount of time.

```
function Notifier(type, regionEl, duration) {
  this.regionEl = regionEl;
  this.duration = duration || 10000;
  this.type = type || 'info';
}

Notifier.prototype.notify = function(message) {
  let note = document.createElement('p');

  note.innerHTML = `
    <svg viewBox="0 0 20 20" focusable="false">
      <use xlink:href="#${this.type}"></use>
    </svg>
    <span class="visually-hidden">${this.type}:</span>
    ${message}
  `;

  this.regionEl.appendChild(note);

  window.setTimeout(() => {
    this.regionEl.removeChild(note)
  }, this.duration);
}

const infoNotifications = new Notifier(
  'info',
  document.getElementById('notifications'),
  5000
);

infoNotifications.notify('Heydon666 has joined this group.');

```

( **Note:** The 'type' string is used both for the inline SVG reference and as the alternative text for the icon.)

But what if the user misses notifications come and go? Not a problem. Notifications should only refer to things that are discoverable elsewhere in the updated interface.

A couple of examples: If the notification refers to **@Heydon666** coming online, you'll be able to discover they're around because they have appeared in the list of active users, or have their status updated. For the 'awards' example, the interface should keep track in the user's profile page. A chronology of awards is typical.

![List of awards by date.](https://inclusive-components.design/content/images/2018/02/illustration7_small.svg)

## Conclusion

Thanks to the marvelous "you add it, I say it" nature of ARIA live regions, the technical implementation of inclusive notification could hardly be simpler. That leaves you to perfect the clarity of form and language.

The biggest and most important task actually has nothing to do with the notification component itself. It's all in the structure and presentation of the permanent history into which each notification message only offers a fleeting glimpse. As ever, structuring content is paramount, even where it pertains to dynamic events inside realtime web applications.

### Checklist

- Don't use [`aria-atomic="true"`](http://juicystudio.com/article/wai-aria_live-regions_updated.php) unless you want all the contents of a live region announced whenever there's any change within it.
- Be judicious in your use of visually hidden live regions. Most content should be seen _and_ heard.
- Distinguish parts of your interface in content or with content and style, but never just with style.
- Do not announce everything that changes on the page. A very popular carousel plugin that shall remain nameless announces the arrival of each slide as it comes into view. A huge irritant, and only comparable to a sighted user's experience if the carousel is set to track their eye movements and always remain at the center of their gaze.
- Be _very_ wary of [Desktop notifications](https://developer.mozilla.org/en-US/docs/Web/API/notification) for your site. I have never come across a site for which I wanted these needy and obstructive messages to be permitted.

[↩\\
 Back to components list](https://inclusive-components.design/#components)
