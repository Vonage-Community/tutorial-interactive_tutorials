---
title: What are Web Components?
description: What are Web Components?
---

Web Components are reusable custom elements that you create with the combination of the following Web Technologies.

- <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements" target="_blank">Custom Elements</a> : This defines your custom element's name with what it does. Must have a "-".

- <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM" target="_blank">Shadow DOM</a> : This provides encaspulation for your Web Component so that styles and element ID's don't clash with the application using it. You can change a Web Component's styling using <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascading_variables/Using_custom_properties" target="_blank">CSS Variable / Custom Properties</a> and <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/::part">::part</a>.

- <a href="https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots" target="_blank">HTML templates</a> : Any markup placed between < template >  < /template > are ignored by the browser until you want to use it.

Sometimes, your Web Component's template can get complex, so a library can be used. For the Vonage Video API Web Components, I went with <a href="https://lit.dev/" target="_blank">lit</a>. You can see a list of some different libaries on <a href="https://webcomponents.dev/new" target="_blank">WebComponents.dev (no longer maintained)</a>.
