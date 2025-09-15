## Get the book!

The
[Inclusive Components book](http://book.inclusive-components.design/) is now available, with
**updated and improved** content and demos.


![book cover with the strap line, accessible web interfaces piece by piece](https://inclusive-components.design/assets/images/on-light.svg?v=89073ee017)

My mantra for building web interfaces is, "if it can't be done efficiently, don't do it at all." In fact, I've preached about [writing less damned code](https://vimeo.com/190834530) around the UK, Europe, and China. If a feature can only be achieved by taking a significant performance hit, the net effect is negative and the feature should be abandoned. That's how critical performance is on the web.

Offering users choices over the display of your interface is friendly, so long as it isn't intrusive. It helps to satisfy the [Offer choice](http://inclusivedesignprinciples.org/#offer-choice) inclusive design principle. _However_, choices such as theme options are nice-to-haves and should only be implemented if it's possible to do so efficiently.

Typically, alternative themes are offered as separate stylesheets that can be switched between using JavaScript. In some cases they represent a performance issue (because an override theme requires loading a lot of additional CSS) and in most cases they represent a maintenance issue (because separate stylesheets have to be kept up to date as the site is further developed).

One of the few types of alternative theme that adds real value to users is a low light intensity "night mode" theme. Not only is it easier on the eyes when reading in the dark, but it also reduces the likelihood of migraine and the irritation of other light sensitivity disorders. As a migraine sufferer, I'm interested!

In this article, I'll be covering how to make an efficient and portable React component that allows users to switch a default light theme into "dark mode" and persist this setting using the `localStorage` API.

* * *

Given a light theme (predominantly dark text on light backgrounds) the most efficient course of action is not to provide a completely alternative stylesheet, but to augment the existing styles directly, as tersely as possible. Fortunately, CSS provides the `filter` property, which allow you to invert colors. Although this property is often associated with image elements, it can be used on any elements, including the root `<html>` element:

```
:root {
   filter: invert(100%);
}

```

( **Note:** Some browsers support `invert()` as a shorthand, but not all, so write out `100%` for better support.)

The only trouble is that `filter` can only invert _stated_ colors. Therefore, if the element has no background color, the text will invert but the implicit (white) background will remain the same. The result? Light text on a light background.

This is easily fixed by stating a light `background-color`.

```
:root {
   background-color: #fefefe;
   filter: invert(100%);
}

```

But we may still run into problems with child elements that also have no stated background color. This is where CSS's `inherit` keyword comes in handy.

```
:root {
   background-color: #fefefe;
   filter: invert(100%);
}

* {
   background-color: inherit;
}

```

On first impression, this may seems like a lot of power we're wielding, but never fear: the `*` selector is very low specificity, meaning it only provides a `background-color` to elements for which one isn't already stated. In practice, `#fefefe` is just a fallback.

## Preserving raster images

While we are intent on inverting the theme, we're probably not going to want to invert raster images or videos, otherwise the design will become filled with spooky looking negatives. The trick here is to double-invert `<img/>` tags. The selector I'm using excludes SVG images, because — typically presented as flat color diagrams — they should invert successfully and pleasantly.

```
:root {
   background-color: #fefefe;
   filter: invert(100%);
}

* {
   background-color: inherit;
}

img:not([src*=".svg"]), video {
   filter: invert(100%);
}

```

Clocking in at 153 bytes uncompressed, that's dark theme support pretty much taken care of. If you're not convinced, here's the CSS applied to some popular news sites:

![The Boston Globe and The Independent, mostly in black with light text](https://inclusive-components.design/content/images/2017/09/dark_set_1-min.png)The Boston Globe and The Independent![The New York Times and Private Eye, mostly in black with white text](https://inclusive-components.design/content/images/2017/09/dark_set_2-min.png)The New York Times and Private Eye

## The theme switch component

Since the switch between light (default) and dark (inverted) themes is just an on/off, we can use something simple like the [toggle buttons](https://inclusive-components.design/toggle-button/) we explored in an earlier article. However, this time we'll implement the toggle button as part of a [React](https://react-cn.github.io/react/index.html) component. There are a few reasons for this:

- Maximum reusability between the React-based projects many of you are used to working in
- Ability to take advantage of React's `props` and `defaultProps`
- Some people think frameworks like React and Angular preclude you from writing accessible HTML somehow, and that falsehood needs to die

We're also going to incorporate some progressive enhancement, only showing the component if the browser supports `filter: invert(100%)`.

### Setting up

If you don't already have a setup for React development, you can create one easily using `create-react-app`.

```
npm i -g create-react-app
create-react-app theme-switch
cd theme-switch
npm start

```

The boilerplate app will now be running at `localhost:3000`. In the new `theme-switch` project, our component will be called **ThemeSwitch** and will be included in `App.js`'s render function as `<ThemeSwitch/>`.

```
class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to React</h2>
        </div>
        <p className="App-intro">
          To get started, edit {gfm-js-extract-pre-1} and save to reload.
        </p>
        <ThemeSwitch/>
      </div>
    );
  }
}

```

( **Note:** I'm being lazy and leaving the boilerplate in. To really test the theme switcher, include it alongside a bunch of styled content pulled in from another project. You can include CSS in `App.css`.)

Don't forget to import the **ThemeSwitch** component at the top of this `App.js` file:

```
import ThemeSwitch from './components/ThemeSwitch'

```

### The skeleton component file

As implied by the path in that last import line, we'll be working on a file called `ThemeSwitch.js`, placed in a new "components" folder, so you'll need to create both the folder and the file. The skeleton for **ThemeSwitch** looks like this:

```
import React, { Component } from 'react';

class ThemeSwitch extends Component {
  render() {
    // The component's markup, in JSX
  }
}

export default ThemeSwitch;

```

The rendered markup for the switch, imagined in a default/inactive state, would look like this (notes to follow):

```
<div>
   <button aria-pressed="false">
      dark theme:
      <span aria-hidden="true">off</span>
   </button>
   <style media="none">
      html { filter: invert(100%); background: #fefefe }
      * { background-color: inherit }
      img:not([src*=".svg"]), video { filter: invert(100%) }
   </style>
</div>

```

- Not all toggle buttons are created the same. In this case, we're using `aria-pressed` to toggle accessible state and an explicit "on"/"off" for sighted users. So that the "on" or "off" part is not read out to contradict the state, it is suppressed from assistive technologies with `aria-hidden`. Screen reader users will hear "dark theme toggle button, not pressed" or "dark theme toggle button, pressed" or similar.
- The CSS is so terse, we're going to provide it as an embedded stylesheet. This is set to `media="none"` — or `media="screen"` when the dark theme is activated

This markup will get very messy shortly, as we convert it to JSX.

### Switching state

Our component will be stateful, allowing the user to toggle the dark theme between inactive and active. First we initialize the state on the component's constructor:

```
constructor(props) {
   super(props);

   this.state = {
      active: 'false'
   };
}

```

To bring things to life, a helper function called `isActive()` is included, along with a `toggle()` function that actually toggles the state:

```
  isActive = () => this.state.active;

  toggle = () => {
    this.setState({
      active: !this.isActive()
    });
  }

```

( **Note:** Arrow functions implicitly return single statements, hence the tersity of the `isActive()` function.)

In the render function for the component, we can use `isActive()` to switch the `aria-pressed` value, the button text, and the value of the stylesheet's `media` attribute:

```
return (
  <div>
    <button aria-pressed={this.isActive()} onClick={this.toggle}>
      dark theme:
      <span aria-hidden="true">{this.isActive() ? 'on' : 'off'}</span>
    </Button>
    <style media={this.isActive() ? 'screen' : 'none'}>
      {this.css}
    </style>
  </div>
);

```

![The two states of the toggle button. When it has aria-pressed false, the text reads dark theme off. When it has aria-pressed true, the text reads dark theme on.](https://inclusive-components.design/content/images/2017/09/off_on_themer-1.svg)Of course, when the dark theme is on,
 the button itself is also inverted.

Note the `{this.css}` part. JSX doesn't support embedding CSS directly, so we have to save it to a variable and enter it here dynamically. In the constructor:

```
this.css = `
html { filter: invert(100%); background: #fefefe; }
* { background-color: inherit }
img:not([src*=".svg"]), video { filter: invert(100%) }`;

```

#### Overcoming browser issues

Unfortunately, just switching between `media="none"` and `media="screen"` does not apply the styles to the page in all browsers. To force a repaint, it turns out we have to rewrite the text content of the `<style>` tag. The easiest way I found of doing this was to incorporate the `trim()` method. Curiously, this only seemed to be needed in Chrome.

```
{this.isActive() ? this.css.trim() : this.css}

```

### Persisting the theme preference

To persist the user's choice of theme, we can use `localStorage` and React lifecycle methods. First, I'll set an alias for `localStorage` on the constructor. This suppresses linting errors produced when calling `localStorage` directly.

```
this.store = typeof localStorage === 'undefined' ? null : localStorage;

```

Using the `componentDidMount` method, I can fetch and apply the saved setting after the component mounts to the page. The expression defaults the value to 'false' if the storage item is yet to be created.

```
componentDidMount() {
  if (this.store) {
    this.setState({
      active: this.store.getItem('ThemeSwitch') || false
    });
  }
}

```

Because state is managed asynchronously in React, it's not reliable to simply save a changed state after it has been augmented. Instead, I need to use the `componentDidUpdate` method:

```
componentDidUpdate() {
  if (this.store) {
    this.store.setItem('ThemeSwitch', this.state.active);
  }
}

```

### Hiding from unsupporting browsers

Some browsers are yet to support `filter: invert(100%)`. For those browsers, we will hide our theme switch altogether. It's better that it is not available than it is available and doesn't work. With a special `invertSupported` function, we can query support to set a `supported` state.

If you've ever used [Modernizr](https://modernizr.com/) you might have used a similar CSS property/value test. However, we don't want to use Modernizr because we don't want our component to rely on any dependencies unless completely necessary.

```
invertSupported (property, value) {
  var prop = property + ':',
      el = document.createElement('test'),
      mStyle = el.style;
  el.style.cssText = prop + value;
  return mStyle[property];
}

componentDidMount() {
  if (this.store) {
    this.setState({
      supported: this.invertSupported('filter', 'invert(100%)'),
      active: this.store.getItem('ThemeSwitch') || false
    });
  }
}

```

This can be used in our JSX to hide the component interface using the `hidden` property where support returns false:

```
<div hidden={!this.state.supported}>
  <!-- component contents here -->
</div>

```

In modern browsers, the `hidden` property will hide the component from assistive technologies and make it unfocusable by keyboard. To make sure older browsers have the same behavior, include the following in your stylesheet:

```
[hidden] {
  display: none;
}

```

Alternatively, you can refuse to render the component contents to the page at all, by returning `null`.

```
render() {
  if (!this.supported) {
    return null;
  }

  return (
    <div>
      <button aria-pressed={this.state.active} onClick={this.toggle}>
        inverted theme: <span aria-hidden="true">{this.state.active ? 'on' : 'off'}</span>
      </button>
      <style media={this.state.active ? 'screen' : 'none'}>
        {this.state.active ? this.css.trim() : this.css}
      </style>
    </div>
  );
}

```

#### Windows High Contrast Mode

Windows users are offered a number of high contrast themes at the operating system level — some light-on-dark like our inverted theme. In addition to supplying our theme switcher feature, it's important to make sure WHCM is supported as well as possible. Here are some tips:

- Do not use background images as content. Not only will this invert the images in our inverted dark theme, but they'll be eliminated entirely in most Windows high contrast themes. Provide salient, non-decorative images in `<img/>` tags with descriptive `alt` text values
- For inline SVG icons, use the `currentColor` value for fill and stroke.
This way, the icon color will change along with the surrounding text color when the high contrast theme is activated.
- If you need to detect WHCM to make special amendments, you can use the following media query:

```
@media (-ms-high-contrast: active) {
  /* WHCM-specific code here */
}
```

### The `preserveRasters` prop

Props (component properties) are the standard way to make components configurable. A configurable component can be used in a greater variety of situations and projects and is therefore more inclusive.

In our case, why don't we make it so that the implementor has a choice over whether raster images are indeed preserved, or if they're inverted with everything else. I'll create a `preserveRasters` prop that takes "true" or "false" values. Here's how it looks on our component:

```
<ThemeSwitch preserveRasters={false} />

```

I can query this prop in the formulation of the CSS string, and only re-invert images if its value is "true":

```
this.css = `
  html { filter: invert(100%); background: #fefefe; }
  * { background-color: inherit }
  ${this.props.preserveRasters === 'true' ? `img:not([src*=".svg"]), video { filter: invert(100%) }` : ``}`;

```

( **Note:** It's quite possible, though slightly ugly, to use ternaries during string interpolation in this way.)

#### The default value

To make the component more robust and offer the implementor the option of omitting the prop attribute, we can also supply a `defaultProp`. The following can be supplied after the component class definition:

```
ThemeSwitch.defaultProps = { preserveRasters: true }

```

### Installing the component

A version of [this component](https://github.com/Heydon/react-theme-switch) is available on NPM:

```
npm i --save react-theme-switch

```

In addition, a plain JavaScript version, based on a checkbox element, is available to play with in the following [codePen](https://codepen.io/heydon/pen/Vzyrre):

CodePen Embed - Theme color inverter with filter

``` cm-s-default
<style id="inverter" media="none">
  html { background-color: #eee; filter: invert(100%) }
  * { background-color: inherit }
  img:not([src*=".svg"]), [style*="url("] { filter: invert(100%) }
</style>
<div class="wrap">
  <label class="button">
    <input type="checkbox" id="themer">
    Dark theme: <span aria-hidden="true"></span>
  </label>
  <h1>Lorem ipsum</h1>

  <p>Vestibulum sit amet ipsum lacus. Aliquam nisl enim&hellip; tristique tempus placerat at, posuere in lectus. Suspendisse potenti cras molestie, risus a enim convallis vitae luctus libero lacinia. Nulla vel magna sit amet dui <a href='#'>lobortis</a> commodo vitae vel nulla. Nunc iaculis risus vel orci ornare dignissim sed vitae nulla. Aliquam tincidunt velit sit amet <a href='#'>ante hendrerit</a> tempus. Sed dapibus, lectus sit amet adipiscing egestas, mauris est viverra nibh, iaculis pretium sem orci aliquet mauris. </p>
  <div class="box">
  <p>Nunc iaculis risus vel orci ornare dignissim sed vitae nulla. Vestibulum sit amet ipsum lacus… Suspendisse potenti. Nulla auctor eleifend 23rd of May turpis consequat pharetra.</p>
  </div>
  <p>Sed dapibus, lectus sit amet adipiscing egestas, mauris est viverra nibh, <a href='#'>iaculis pretium</a> sem orci aliquet mauris. Maecenas sit <em>amet tellus</em> nec mi gravida posuere non <a href='#'>pretium magna</a>. Curabitur consectetur; faucibus nisl ac varius. Sed dapibus, lectus sit amet adipiscing egestas, mauris est viverra nibh, iaculis pretium sem orci aliquet mauris. Nulla lobortis tempus commodo. </p>
  <h2>Curabitur consectetur</h2>
  <p>Nulla lobortis tempus commodo? Suspendisse potenti. Sed dapibus, lectus sit amet adipiscing egestas, mauris est viverra nibh (iaculis pretium sem orci aliquet mauris). Suspendisse potenti H<sub>2</sub>0. </p>
  <ul>
    <li>Sed dapibus, lectus sit amet adipiscing egestas</li>
    <li>Sed dapibus, lectus sit amet adipiscing egestas</li>
    <li>Vestibulum sit amet ipsum lacus</li>
  </ul>
  <p>Donec tempus tempus tellus, ac lacinia turpis mattis ac! Cras molestie risus a enim convallis vitae luctus libero lacinia. Donec et nisi dictum <a href='#'>felis sollicitudin</a> congue. Cras molestie risus a <q cite='http://www.heydonworks.com'>enim convallis vitae</q> luctus libero lacinia. Fusce ac sodales magna &hellip; Suspendisse potenti. Vestibulum sit amet ipsum lacus&hellip; Suspendisse <em>potenti</em>. Nunc iaculis risus vel &#8216;Orci Ornare&#8217; dignissim sed vitae nulla. </p>
  <h2>Purus lectus venenatis urna</h2>
  <p>Cras molestie risus a <q cite='http://www.heydonworks.com'>enim convallis vitae</q> luctus libero lacinia. Donec tempus tempus tellus, ac lacinia turpis mattis ac. Duis sagittis, est sit amet gravida tristique, purus lectus venenatis urna, id &#8216;molestie&#8217; magna risus ut nunc. Nulla auctor eleifend 23<sup>rd</sup> of May turpis consequat pharetra. Nulla auctor eleifend turpis consequat pharetra: </p>
  <img src="http://talesandtails.com/wp-content/uploads/2013/01/Greyhound-Soul-copy-800x491.jpg" alt="greyhound laying down">
  <p>Duis sagittis, est sit amet gravida tristique, purus lectus venenatis urna, id molestie magna risus ut nunc. Lorem ipsum dolor sit amet, &mdash; consectetur adipiscing &mdash; elit. Nunc iaculis risus vel orci ornare dignissim sed vitae nulla. Vestibulum sit amet ipsum lacus&hellip; Suspendisse potenti. Nulla auctor eleifend 23<sup>rd</sup> of May turpis consequat pharetra. </p>
  <p>Nulla lobortis tempus commodo? Nulla lobortis tempus <strong>commodo</strong>. Fusce ac sodales <code>.generate()</code> magna. Donec tempus tempus tellus, ac lacinia turpis mattis ac. Maecenas sit <q cite='http://www.heydonworks.com'>amet tellus nec mi gravida posuere</q> non pretium magna. Nunc iaculis risus vel &#8216;Orci Ornare&#8217; dignissim sed vitae nulla. Nulla vel magna sit &mdash; amet dui lobortis commodo &mdash; vitae vel nulla. </p>
  <img src="https://www.gnu.org/graphics/official%20gnu.svg" alt="GNU official logo in SVG">
</div>

```

``` cm-s-default
html {
  font-family: sans-serif;
  line-height: 1.5;
  color: #222;
  height: 100%;
}

.wrap {
  margin: 0;
  max-width: 40rem;
  margin: 0 auto;
  padding: 1.5rem;
}

* {
  margin: 0;
  color: inherit;
}

* + *:not(li):not(body) {
  margin-top: 1.5rem;
}

img {
  max-width: 100%;
  height: auto;
}

.box {
  padding: 1.5rem;
  border: 2px solid;
  background-color: #ccc;
}

.button {
  background: #000;
  padding: 0.5rem 1.5rem;
  color: #fff;
  border-radius: 0.25rem;
}

.button [type="checkbox"] {
  position: absolute;
  left: -9999px;
}

.button [type="checkbox"] + span::before {
  content: 'off';
}

.button [type="checkbox"]:checked + span::before {
  content: 'on';
}
```

``` cm-s-default
var checkbox = document.getElementById('themer');
var invertor = document.getElementById('inverter');

checkbox.addEventListener('change', function () {
  // Triggers repaint in most browsers:
  invertor.setAttribute('media', this.checked ? 'screen' : 'none');
  // Forces repaint in Chrome:
  invertor.textContent = invertor.textContent.trim();
});
```

[![](https://assets.codepen.io/t-1/user-default-avatar.jpg?fit=crop&format=auto&height=256&version=0&width=256)](https://codepen.io/heydon)

This Pen is owned by [Heydon](https://codepen.io/heydon) on [CodePen](https://codepen.io/heydon)

### Placement

The only thing left to do is decide where you're going to put the component in the document. As a rule of thumb, utilities like theme options should be found in a landmark region — just not the `<main>` region, because the screen reader user expects this content to change between pages. The `<header>` ( `role="banner"`) or `<footer>` ( `role="contentinfo"`) are both acceptable.

The switch should appear in the same place on all pages so that, once the user has located it once, they can easily find it again. Take note of the [Be consistent](http://inclusivedesignprinciples.org/#be-consistent) inclusive design principle, which applies here.

## Checklist

- Only implement nice-to-have features if the performance hit is minimal and the resulting interface does not increase significantly in complexity
- Only provide interfaces for supported features. Use feature detection.
- Use semantic HTML in your React components — they'll still work!
- Use props to make your components more configurable and reusable

[↩\\
 Back to components list](https://inclusive-components.design/#components)
