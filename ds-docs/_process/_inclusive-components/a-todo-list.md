## Get the book!

The
[Inclusive Components book](http://book.inclusive-components.design/) is now available, with
**updated and improved** content and demos.


![book cover with the strap line, accessible web interfaces piece by piece](https://inclusive-components.design/assets/images/on-light.svg?v=89073ee017)

According to tradition, each new javascript framework is put through its paces in the implementation of a simple todo list app: an app for creating and deleting todo list entries. The first Angular.js example I ever read was a todo list. Adding and removing items from todo lists demonstrates the immediacy of the single-page application view/model relationship.

[TodoMVC](http://todomvc.com/) compares and contrasts todo app implementations of popular MV\* frameworks including Vue.js, Angular.js, and Ember.js. As a developer researching technology for a new project, it enables you to find the most intuitive and ergonomic choice for your needs.

The inclusive design of a todo list interface is, however, framework agnostic. Your user doesn't care if it's made with Backbone or React; they just need the end product to be accessible and easy to use. Unfortunately, each of the identical implementations in [TodoMVC](http://todomvc.com/) have some shortcomings. Most notably, the delete functionality only appears on hover, making it an entirely inaccessible feature by keyboard.

In this article, I'll be building an integrated todo list component from the ground up. But what you learn doesn't have to apply _just_ to todo lists — we're really exploring how to make the basic creation and deletion of content inclusive.

* * *

Unlike the simple, single element [toggle buttons](https://inclusive-components.club/toggle-button/) of the previous article, managed lists have a few moving parts. This is what we're going to make:

![A bold heading reading "My Todo List" introduces three todo list items on separate lines. These each have a check box to their left and a bin icon to their right. Underneath them is a text field with a placeholder of "E.g. Adopt an owl" and an Add button. The first todo list item’s checkbox is checked and its text (pick up kids from school) is crossed out to show that it is done.](https://inclusive-components.design/content/images/2017/04/todo_list.svg)

## The heading

A great deal of usability is about labels. The `<label>` element provides labels to form fields, of course. But simple text nodes provided to buttons and links are also labels: they tell you what those elements do when you press them.

Headings too are labels, giving names to the sections (regions, areas, modules) that make up an interface. Whether you are creating a static document, like a blog post, or an interactive single-page application, each major section in the content of that page should almost certainly be introduced by a heading. Our todo list's name, "My Todo List" in this case, should be marked up accordingly.

```
<h1>My Todo List</h1>

```

It's a very _on the nose_ way of demarcating an interface, but on the nose is good. We don't want our users having to do any detective work to know what it is they're dealing with.

### Heading level

Determining the correct level for the heading is often considered a question of importance, but it's actually a question of _belonging_. If our todo list is the sole content within the `<main>` content of the page, it should be level 1, as in the previous example. There's nothing surrounding it, so it's at the highest level in terms of depth.

If, instead, the todo list is provided as supplementary content, it should have a level which reflects that. For example, if the page is about planning a holiday, a "Things to pack" todo list may be provided as a supplementary tool.

- Plan for my trip ( `<h1>`)



  - Places to get drunk ( `<h2>`)



    - Bars ( `<h3>`)
    - Clubs ( `<h3>`)
  - Things to pack (todo list) ( `<h2>`)

In the above example, both "Bars" and "Clubs" belong to "Places to get drunk", which belongs to "Plan for my trip". That's three levels of belonging, hence the `<h3>` s.

Even if you feel that your packing todo list is less important than establishing which bars are good to visit, it's still on the same _level_ in terms of belonging, so it must have the same heading level.

As well as establishing a good visual hierarchy, the structure described by logically nested sections gives screen reader users a good feel for the page. Headings are also harnessed as navigational tools by screen readers. For example, in JAWS, the `2` key will take you to the next section labeled by an `<h2>` heading. The generic `h` key will take you to the next heading of any level.

## The list

I talk about the virtues of lists in _[Inclusive Design Patterns](https://shop.smashingmagazine.com/products/inclusive-design-patterns)_. Alongside headings, lists help to give pages structure. Without headings or lists, pages are featureless and monotonous, making them very difficult to unpick both visually and non-visually.

Not all lists need to be bullet lists, showing a `list-style`, but there should be some visual indication that the items within the list are similar or equivalent; that they belong together. Non-visually, using the `<ul>` or `<ol>` container means the list is identified when encountered and its items are enumerated. For our three-item todo list, screen readers should announce something like, _"list of three items"_.

A todo list is, as the name suggests, a list. Since our particular todo list component makes no assertions about priority, an unordered list is fine. Here's the structure for a static version of our todo list (the adding, deleting, and checking functionality has not yet been added):

```
<section aria-labelledby="todos-label">
  <h1 id="todos-label">My Todo List</h1>
  <ul>
    <li>
      Pick up kids from school
    </li>
    <li>
      Learn Haskell
    </li>
    <li>
      Sleep
    </li>
  </ul>
</section>

```

### Empty state

Empty states are an aspect of UI design which you [neglect at your peril](https://techcrunch.com/2015/11/22/the-most-overlooked-aspect-of-ux-design-could-be-the-most-important/). Inclusive design has to take user lifecycles into consideration, and some of your most vulnerable users are new ones. To them your interface is unfamiliar and, without carefully leading them by the hand, that unfamiliarity can be off-putting.

With our heading and "add" input present it may be obvious to some how to proceed, even without example todo items or instructions present. But your interface may be less familiar and more complex than this simple todo list, so let's add an empty state anyway — for practice.

![](https://inclusive-components.design/content/images/2017/04/todo_list_empty-2.svg)

#### Revealing the empty state

It's quite possible, of course, to use our data to determine whether the empty state should be present. In Vue.js, we might use a `v-if` block:

```
<div class="empty-state" v-if="!todos.length">
  <p>Either you've done everything already or there are still things to add to your list. Add your first todo &#x2193;</p>
</div>

```

But all the state information we need is actually already in the DOM, meaning all we need in order to switch between showing the list and showing the empty-state is CSS.

```
.empty-state, ul:empty {
  display: none;
}

ul:empty + .empty-state {
  display: block;
}

```

This is more efficient because we don't have to query the data or change the markup. It's also screen reader accessible: `display: none` makes sure the element in question is hidden both visually and from screen reader software.

All pseudo-classes pertain to implicit states. The `:empty` pseudo-class means the element is in an empty state; `:checked` means it's in a checked state; `:first-child` means it's positioned at the start of a set. The more you leverage these, the less DOM manipulation is required to add and change state with JavaScript.

## Adding a todo item

We've come this far without discussing the adding of todos. Let's do that now. Beneath the list (or empty state if the list is empty) is a text input and "add" button:

![A text input with 'e g adopt an owl' placeholder with an 'add' button to its right](https://inclusive-components.design/content/images/2017/04/add_todo.svg)

### Form or no form?

It's quite valid in HTML to provide an `<input>` control outside of a `<form>` element. The `<input>` will not succeed in providing data to the server without the help of JavaScript, but that's not a problem in an application using XHR.

But do `<form>` elements provide anything to users? When users of screen readers like JAWS or NVDA encounter a `<form>` element, they are automatically entered into a special interaction mode variously called "forms mode" or "application mode". In this mode, some keystrokes that would otherwise be used as special shortcuts are switched off, allowing the user to interact with the form fields fully.

Fortunately, most input types — including `type="text"` here — trigger forms mode themselves, on focus. For instance, if I were to type `h` in the pictured input, it would enter "h" into the field, rather than navigating me to the nearest heading element.

The real reason we need a `<form>` element is because we want to allow users to submit on `Enter`, and this only works reliably where a `<form>` contains the input upon which `Enter` is being pressed. The presence of the `<form>` is not just for code organization, or semantics, but affects browser behavior.

```
<form>
  <input type="text" placeholder="E.g. Adopt an owl">
  <button type="submit">Add</button>
</form>

```

( **Note:** [Léonie Watson](https://twitter.com/LeonieWatson) reports that `range` inputs are non-functional in Firefox + JAWS unless a `<form>` is employed or forms mode is entered manually, by the user.)

### Labeling

Can you spot the deliberate mistake in the above code snippet? The answer is: I haven't provided a label. Only a `placeholder` is provided and placeholders are intended for supplementary information only, such as the "adopt an owl" suggestion.

Placeholders are not reliable as labeling methods in assistive technologies, so another method must be provided. The question is: should that label be visible, or only accessible by screen reader?

In _almost_ all cases, a visible label should be placed above or to the left of the input. Part of the reason for this is that placeholders disappear on focus and can be eradicated by autocomplete behavior, meaning sighted users lose their labels. Filling out information or correcting autocompleted information becomes guesswork.

![An unlabeled field. The user has forgotten what they are doing and just entered 'erm'.](https://inclusive-components.design/content/images/2017/04/erm.svg)

However, ours is a bit of a special case because the "add" label for the adjacent button is quite sufficient. Those looking at the form know what the input does thanks to the button alone.

**All inputs should have labels**, because screen reader users don't know to look ahead in the source to see if the submit button they've yet to reach gives them any clues about the form's purpose. But simple input/submit button pairs like this and search regions can get away without _visible_ labels. That is, so long as the submit button's label is sufficiently descriptive.

![Three examples of the described pattern. The first, fom our todo list, uses an add label for the submit button and is fine. The second example for a search form uses a submit button with search as the label and is also acceptable. The third example has a submit button with just submit as the label and is not advised.](https://inclusive-components.design/content/images/2017/04/button_label_examples.svg)In addition, make sure forms with multiple fields have visible labels for each field. Otherwise the user does not know which field is for what.

There are a number of ways to provide an invisible label to the input for screen reader users. One of the simpler and least verbose is `aria-label`. In the following example, "Write a new todo item" is the value. It's a bit more descriptive than just "add", which also helps to differentiate it from the button label, avoiding confusion when focus is moved between the two elements.

```
<form>
  <input type="text" aria-label="Write a new todo item" placeholder="E.g. Adopt an owl">
  <button type="submit">Add</button>
</form>

```

### Submission behavior

One of the advantages of using a `<form>` with a button of the `submit` `type` is that the user can submit by the button directly, or by hitting `Enter`. Even users who do not rely exclusively on the keyboard to operate the interface may like to hit `Enter` because it's quicker. What makes interaction possible for some, makes it better for others. That’s inclusion.

If the user tries to submit an invalid entry we need to stop them. By disabling the `<button>` until the input is valid, submission by click or by `Enter` is suppressed. In fact, the `type="submit"` button stops being focusable by keyboard. In addition, we provide `aria-invalid="true"` to the input. Screen readers will tell their users the input is invalid, letting them know they need to change it.

```
<form>
  <input type="text" aria-invalid="true" aria-label="Write a new todo item" placeholder="E.g. Adopt an owl">
  <button type="submit" disabled>Add</button>
</form>

```

### Feedback

The deal with human-computer interaction is that when one party does something, the other party should respond. It's only polite. For most users, the response on the part of the computer to adding an item is implicit: they simply see the item being added to the page. If it's possible to _animate_ the appearance of the new item, all the better: Some movement means its arrival is less likely to be missed.

For users who are not sighted or are not using the interface visually, nothing would seem to happen. They remain focused on the input, which offers nothing new to be announced in screen reader software. Silence.

Moving focus to another part of the page — the newly added todo, say — would cause that element to be announced. But we don't want to move the user's focus because they might want to forge ahead writing more todos. Instead we can use a live region.

#### The feedback live region

Live regions are elements that tell screen readers to announce their contents _whenever those contents change_. With a live region, we can make screen readers talk to their users without making those users perform any action (such as moving focus).

Basic live regions are defined by `role="status"` or the equivalent `aria-live="polite"`. To maximize compatibility with different screen readers, you should use both. It may feel redundant, but it increases your audience.

```
<div role="status" aria-live="polite">
  <!-- add content to hear it spoken -->
</div>

```

On the submit event, I can simply append the feedback to the live region and it will be immediately announced to the screen reader user.

```
var todoName = document.querySelector('[type="text"]').value;

function addedFeedback(todoName) {
  let liveRegion = document.querySelector('[role="status"]');
  liveRegion.textContent = `${todoName} added.`;
}

// example usage
addedFeedback(todoName);

```

One of the simplest ways to make your web application more accessible is to wrap your status messages in a live region. Then, when they appear visually, they are also announced to screen reader users.

![Adopt an owl added status message. White text on green background prefixed by a tick icon](https://inclusive-components.design/content/images/2017/04/adopt_status-1.svg)It's conventional to color code status messages. This "success" message is green, for example. But it's important to not rely on color, lest you let down color blind users. Hence, a supplemental tick icon is provided.

Inclusion is all about different users getting an **equivalent experience**, not necessarily the same experience. Sometimes what works for one user is meaningless, redundant, or obstructive to another.

In this case, the status message is not really needed visually because the item can be seen joining the list. In fact, adding the item to the list and revealing a status message at the same time would be to pull the user's attention in two directions. In other words: the visible appending of the item and the announcement of " \[item name\] added" are already equivalent.

In which case, we can hide this particular messaging system from view, with a `vh` (visually hidden) class.

```
<div role="status" aria-live="polite" class="vh">
  <!-- add content to hear it spoken -->
</div>

```

## Checking off todo items

Checking off and deleting todo list items are distinct actions. Unlike in the previous [toggle button](https://inclusive-components.club/toggle-button/) post, this time checkboxes feel like the semantically correct way to activate and deactivate. You don't _press_ or _switch off_ todo items; you _check them off_.

Luckily, checkboxes let us do that with ease — the behavior comes out-of-the-box. We just need to remember to label each instance. When iterating over the checkbox data, we can write unique values to each `for`/ `id` pairing using a for loop's current index and string interpolation. Here’s how it can be done in Vue.js:

```
<ul>
  <li v-for="(todo, index) in todos">
    <input type="checkbox" :id="`todo-${index}`" v-model="todo.done">
    <label :for="`todo-${index}`">{{todo.name}}</label>
  </li>
</ul>

```

( **Note:** In this example, we imagine that each todo has a `done` property, hence `v-model="todo.done"` which automatically checks the checkbox where it evaluates as true.)

### The line-through style

Making robust and accessible components is easy when you use semantic elements as they were intended. In my version, I just add a minor enhancement: a `line-through` style for checked items. This is applied to the `<label>` via the `:checked` state using an adjacent sibling combinator.

```
:checked + label {
  text-decoration: line-through;
}

```

Once again, I'm leveraging implicit state to affect style. No need for adding and removing `class="crossed-out"` or similar.

( **Note:** If you want to style the checkbox controls themselves, [WTF Forms](http://wtfforms.com/) gives guidance on doing so without having to create custom elements. In the [demo](https://codepen.io/heydon/pen/VpVNKW) at the end of this article, I use a proxy `.tick` `<span>` to do something similar.)

## Deleting todo items

Checking off and deleting todo list items are distinct actions. Because sometimes you want to see which items you've done, and sometimes you add todo items to your list that you didn't mean to, or which become non-applicable.

The functionality to delete todos can be provided via a simple button. No need for any special state information — the label tells us everything we need to know. Of course, if the button uses an icon image or font glyph in place of an interpretable text node, an auxiliary label should be provided.

```
<button aria-label="delete">
  &times;
</button>

```

In fact, let's be more specific and include the todo item's name. It's always better to provide labels which make sense in isolation. Your JavaScript framework of choice should provide a templating facility to achieve this. In my choice, Vue.js, it looks like this:

```
<button :aria-label="`delete ${todo.name}`">
  &times;
</button>

```

In this example, `&times;` is used to represent a cross symbol. Were it not for the `aria-label` overriding it, the label would be announced as "times" or "multiplication" depending on the screen reader in question.

### Focus management

When a user clicks the delete button for a todo item, the todo item — including the checkbox, the label, and **the delete button itself** — will be remove from the DOM. This raises an interesting problem: what happens to focus when you delete the currently focused element?

![The first picture shows the Learn Haskell todo item's bin icon/delete button focused with a blue ring. The second picture shows that todo item removed from the list and focus is nowhere to be seen.](https://inclusive-components.design/content/images/2017/04/focus_destroyed.svg)

Unless you're careful, the answer is _something very annoying_ for keyboard users, including screen reader users.

The truth is, browsers don't know where to place focus when it has been destroyed in this way. Some maintain a sort of "ghost" focus where the item used to exist, while others jump to focus the next focusable element. Some flip out completely and default to focusing the outer document — meaning keyboard users have to crawl through the DOM back to where the removed element was.

For a consistent experience between users, we need to be deliberate and `focus()` an appropriate element, but which one?

One option is to focus the first checkbox of the list. Not only will this announce the checkbox's label and state, but also the total number of list items remaining: one fewer than a moment ago. All useful context.

```
document.querySelector('ul input').focus();

```

( **Note:** `querySelector` returns the _first_ element that matches the selector. In our case: the first checkbox in the todo list.)

But what if we just deleted the last todo item in our list and had returned to the empty state? There's no checkbox we can focus. Let's try something else. Instead, I want to do two things:

1. Focus the region's "My Todo List" heading
2. Use the live region already instated to provide some feedback

You should never make non-interactive elements like headings focusable by users because the expectation is that, if they're focusable, they should actually _do_ something. When I’m testing an interface and there are such elements, I would therefore fail it under [WCAG 2.4.3 Focus Order](https://www.w3.org/TR/WCAG20/#navigation-mechanisms-focus-order).

However, sometimes you need to direct a user to a certain part of the page, via a script. In order to move a user to a heading and have it announced, you need to do two things:

1. Provide that heading with `tabindex="-1"`
2. Focus it using the `focus()` method in your script

```
<h1 tabindex="-1">My Todo List</h1>

```

The `-1` value's purpose is twofold: it makes elements unfocusable by users (including normally focusable elements) but makes them focusable by JavaScript. In practice, we can move a user to an inert element without it becoming a "tab stop" (an element that can be moved to via the `Tab` key) among focusable elements within the page.

In addition, focusing the heading will announce its text, role, level, and (in some screen readers) contextual information such as "region". At the very least, you should hear _"My Todo List, heading, level 2"_. Because it is in focus, pressing tab will step the user back inside the list and onto the first checkbox. In effect, we're saying, _"now that you've deleted that list item, here's the list again."_

#### The feedback

Arguably, we've provided enough information for the user and placed them in a perfect position to continue. But it's always better to be explicit. Since we've already have a live region instated, why not use that to tell them the item has been successfully removed?

```
function deletedFeedback(todoName) {
  let liveRegion = document.querySelector('[role="status"]');
  liveRegion.textContent = `${todoName} deleted.`;
}

// example usage
deletedFeedback(todoName);

```

I appreciate that you probably wouldn't be writing this in vanilla JavaScript, but this is basically how it would work.

Now, because we've used `role="status"` ( `aria-live="polite"`), something neat happens in supporting screen readers: _"My Todo List, heading, level 2"_ is read first, followed by _" \[todo item name\] deleted"_.

That's because _polite_ live regions wait until the interface and the user have settled before making themselves known. Had I used `role="alert"` ( `aria-live="assertive"`), the status message would override (or partially override) the focus-invoked heading announcement. Instead, the user knows both where they are, and that what they've tried to do has succeeded.

## Working demo

I've created a [codePen page](https://codepen.io/heydon/pen/VpVNKW/) to demonstrate the techniques in this post. It uses Vue.js, but could have been created with any JavaScript framework. It's offered for testing with different screen reader and browser combinations.

CodePen Embed - Vue.js TODO List

``` cm-s-default
<svg style="display: none">
  <symbol id="bin-icon" height="50" width="50" viewBox="0 0 50 50">
   <path style="fill:#000" d="m20.651 2.3339c-.73869 0-1.3312.59326-1.3312 1.3296v2.5177h-6.3634c-.73887 0-1.3314.59331-1.3314 1.3295v1.1888c0 .73639.59249 1.3289 1.3312 1.3289h7.6948 8.8798 7.6948c.73869 0 1.3312-.59249 1.3312-1.3289v-1.1888c0-.73639-.59249-1.3296-1.3312-1.3296h-6.3634v-2.5177c0-.73639-.59249-1.3296-1.3312-1.3296h-8.8798zm-5.6786 11.897c-1.7775 0-3.2704 1.4889-3.2704 3.274v27.647c0 1.7775 1.4928 3.2704 3.2704 3.2704h20.783c1.7775 0 3.2704-1.4928 3.2704-3.2704v-27.647c0-1.7852-1.4928-3.274-3.2704-3.274h-20.783zm1.839 3.4895h1.1696c.73869 0 1.3389.60018 1.3389 1.3466v24.247c0 .74638-.60018 1.3389-1.3389 1.3389h-1.1696c-.73869 0-1.3389-.59249-1.3389-1.3389v-24.247c0-.74638.60018-1.3466 1.3389-1.3466zm7.6948 0h1.1696c.73869 0 1.3389.60018 1.3389 1.3466v24.247c0 .74638-.60018 1.3389-1.3389 1.3389h-1.1696c-.73869 0-1.3389-.59249-1.3389-1.3389v-24.247c0-.74638.60018-1.3466 1.3389-1.3466zm7.6948 0h1.1696c.73869 0 1.3389.60018 1.3389 1.3466v24.247c0 .74638-.60018 1.3389-1.3389 1.3389h-1.1696c-.73869 0-1.3389-.59249-1.3389-1.3389v-24.247c0-.74638.60018-1.3466 1.3389-1.3466z"/>
  </symbol>
</svg>

<section id="component" aria-labelledby="todos-label">
  <p class="smaller">This is a demo from <a href="https://inclusive-components.design/a-todo-list/">A Todo List</a>, published on <strong>Inclusive Components</strong>.</p>
  <h1 id="todos-label" tabindex="-1">My TODO List</h1>
  <ul>
    <li v-for="(todo, index) in todos">
      <input type="checkbox" :id="`todo-${index}`" v-model="todo.done" class="vh">
      <label :for="`todo-${index}`">
        <span class="tick"></span>
        <span class="text">{{todo.name}}</span>
      </label>
      <button @click="remove(index, todo.name)" :aria-label="`delete ${todo.name}`">
        <svg><use xlink:href="#bin-icon"></use></svg>
      </button>
    </li>
  </ul>
  <div class="empty-state">
    <p>Either you've done everything already or there are still things to add to your list. Add your first todo &#x2193;</p>
  </div>
  <form @submit="add">
    <label for="add" class="vh">
      Write a new todo item
    </label>
    <input type="text" id="add" v-model="workingName" placeholder="E.g. Adopt an owl" :aria-invalid="validity">
    <button type="submit" :disabled="validity">Add</button>
  </form>
  <div role="status" class="vh">
    {{feedback}}
  </div>
</section>
```

``` cm-s-default
* {
  font-size: inherit;
  font-family: inherit;
  margin: 0;
}

html {
  font-size: calc(1em + 1vw);
  font-family: sans-serif;
  margin: 1rem;
}

body {
  max-width: 20rem;
  margin: 0;
  padding: 1rem;
}

h1 {
  margin-top: 0;
  font-size: 1.25rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

ul:empty, .empty-state {
  display: none;
}

ul:empty + .empty-state {
  display: block;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tick {
  display: inline-block;
  width: 0.66rem;
  height: 0.66rem;
  border: 0.125rem solid;
  margin-right: 0.25rem;
  border-radius: 0.125rem;
}

[type="checkbox"]:checked +  label .tick {
  background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgaGVpZ2h0PSI1MCIgd2lkdGg9IjUwIiB2ZXJzaW9uPSIxLjEiIHhtbG5zOmNjPSJodHRwOi8vY3JlYXRpdmVjb21tb25zLm9yZy9ucyMiIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgdmlld0JveD0iMCAwIDUwLjAwMDAwMSA1MC4wMDAwMDEiPiA8ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgwIC0xMDAyLjQpIj4gIDxyZWN0IHN0eWxlPSJzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlOiMxYTFhMWE7c3Ryb2tlLXdpZHRoOjMuNDQ1MztzdHJva2UtbGluZWNhcDpyb3VuZDtmaWxsOiMxYTFhMWEiIHRyYW5zZm9ybT0ibWF0cml4KC44ODc1OSAuNDYwNjQgLS40NTEyNyAuODkyMzkgMCAwKSIgcnk9IjEuMTUwNCIgaGVpZ2h0PSIzMS42OTEiIHdpZHRoPSI1Ljk5MyIgeT0iODgyLjcxIiB4PSI0ODcuMTkiLz4gIDxyZWN0IHN0eWxlPSJzdHJva2UtbGluZWpvaW46cm91bmQ7c3Ryb2tlOiMxYTFhMWE7c3Ryb2tlLXdpZHRoOjMuMTM5MjtzdHJva2UtbGluZWNhcDpyb3VuZDtmaWxsOiMxYTFhMWEiIHRyYW5zZm9ybT0icm90YXRlKDI3LjA4NSkiIHJ5PSIuOTExNjkiIGhlaWdodD0iNi4yNzgyIiB3aWR0aD0iMTguODM1IiB5PSI5MTEuMjIiIHg9IjQ3OC42MiIvPiA8L2c+PC9zdmc+);
  background-repeat: none;
  background-position: center;
  background-size: 100%;
}

[type="checkbox"]:checked + label .text {
  text-decoration: line-through;
}

li label {
  flex: 2;
}

li + li {
  margin-top: 0.55rem;
}

button {
  margin: 0;
  line-height: 1;
  border: 0;
}

li button {
  border: 0;
  padding: 0;
  background: 0;
}

button svg {
  width: 1.125em;
  height: 1.125em;
}

form {
  margin-top: 1rem;
  display: flex;
}

input, [type="submit"] {
  border: 0.125rem solid;
  border-radius: 0.125rem;
  line-height: 1;
}

[type="text"] {
  flex: 3;
  margin-right: 0.25rem;
}

[type="submit"] {
  background: #000;
  color: #fff;
  padding: 0.25rem 0.5rem;
  border: 2px solid #000;
}

[type="submit"][disabled] {
  opacity: 0.33;
}

::-webkit-input-placeholder {
  color: #444;
  font-style: italic;
}
::-moz-placeholder {
  color: #444;
  font-style: italic;
}
:-ms-input-placeholder {
  color: #444;
  font-style: italic;
}
:-moz-placeholder {
  color: #444;
  font-style: italic;
}

input:focus, button:focus, [type="checkbox"]:focus + label .tick {
  outline: none;
  box-shadow: 0 0 0 0.125rem #2a7fff;
}

[tabindex="-1"]:focus {
  outline: none;
}

.vh {
  position: absolute !important;
  clip: rect(1px, 1px, 1px, 1px);
  padding:0 !important;
  border:0 !important;
  height: 1px !important;
  width: 1px !important;
  overflow: hidden;
}

.smaller {
  font-size: 0.75rem;
}
```

``` cm-s-default
var app = new Vue({
  el: '#component',
  data: {
    todos: [\
     {\
       name: 'Pick up kids from school',\
       done: true\
     },\
     {\
       name: 'Learn Haskell',\
       done: false\
     },\
     {\
       name: 'Sleep',\
       done: false\
     }\
    ],
    workingName: '',
    feedback: ''
  },
  methods: {
    add(e) {
      e.preventDefault();
      this.todos.push({
        name: this.workingName,
        done: false
      });
      this.feedback = `${this.workingName} added`;
      this.workingName = '';
    },
    remove(index, name) {
      this.todos.splice(index, 1);
      document.getElementById('todos-label').focus();
      this.feedback = `${name} deleted`;
    }
  },
  computed: {
    validity() {
      return this.workingName.trim() === '';
    }
  }
});
```

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon)

### External CSS

This Pen doesn't use any external CSS resources.


### External JavaScript

1. [https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.17/vue.min.js](https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.17/vue.min.js)

## Conclusion

Counting semantic structure, labeling, iconography, focus management and feedback, there's quite a lot to consider when creating an inclusive todo list component. If that makes inclusive design seem dauntingly complex, consider the following:

1. This is new stuff. Don't worry, it'll become second nature soon enough.
2. Everything you've learned here is applicable to a wide range of content management components, and many other components.
3. You only need to build a rock solid component once. Then it can be reused indefinitely.

### Checklist

- Give every major component, like this one, a well-written heading.
- Only provide "screen reader only" input labels if something else labels the input visually. Placeholders don't count.
- When you remove a focused element from the DOM, focus an appropriate nearby element with `focus()`.
- Consider the wording of empty states carefully. They introduce new users to your functionality.

[↩\\
 Back to components list](https://inclusive-components.design/#components)
