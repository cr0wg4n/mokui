# Usage

## Install
```
nub add -D mokui
```
One package, no runtime dependencies. `playwright` is an optional peer, only needed for the PNG renderer.

## Entry points
| Import | What it is | Needs a DOM |
|---|---|---|
| `mokui` | Registers the `<mk-*>` elements; exports `mount`, plus everything in `mokui/core` and `icons` | yes |
| `mokui/core` | `parse`, `compile`, `html`, `print`, `outline`, `cheatsheet`, `scale`, `MkError` | no (Node-safe) |
| `mokui/vite` | Vite plugin: `import page from './page.mk'` gives an HTML string | no |
| `mokui` CLI | `cheatsheet`, `outline`, `render` | no |

## Vite (any framework)
```ts
// vite.config.ts
import { mokui } from 'mokui/vite'
export default { plugins: [mokui()] }
```
```ts
import 'mokui'                  // registers the elements, once
import page from './login.mk'   // HTML string
```

### Vanilla
```ts
import { mount } from 'mokui'
mount(document.getElementById('app')!, 'stack g=md\n  text xl "Hi"')
```
`mount` makes the target a positioned CSS query container, so breakpoint attributes (`cols-md=3`) respond to its width and overlays cover it. Options: `mount(el, src, { theme: 'dark', open: ['invite'] })`.

### Vue
Tell Vue the tags are custom elements, then render the HTML or write the tags directly. See [examples/vue](../examples/vue).
```ts
vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('mk-') } } })
```
```vue
<div style="container-type: inline-size; position: relative; min-height: 520px" v-html="page" />
<mk-row g="md"><mk-icon n="home" /><mk-text s="lg">Hello</mk-text></mk-row>
```

### React 19
Custom elements work directly. See [examples/react](../examples/react).
```jsx
<div style={{ containerType: 'inline-size', position: 'relative', minHeight: 520 }} dangerouslySetInnerHTML={{ __html: page }} />
<mk-row g="md"><mk-icon n="home" /></mk-row>
```

### Angular, Svelte, others
Add `CUSTOM_ELEMENTS_SCHEMA` (Angular) or use the tags as-is (Svelte). Render the HTML string or write `<mk-*>` markup.

## Containers: queries and overlays
Rendering HTML yourself (instead of `mount`) needs a wrapper with `container-type: inline-size; position: relative`:
- Breakpoint attributes (`cols-md=3`, `dir-md=row`) respond to the width of the nearest query container, not the window.
- Modals and drawers are `position: absolute` and cover the nearest positioned ancestor, so give it room: `min-height: 520px` or more. `mount()` sets all of this for you. `<mk-frame>` is also a positioned container: put overlays inside a `frame` to draw them within a phone or tablet width.

## Interactions
Interactions are declared, not programmed. Name the target with `#name`, point at it from a trigger:
```
button primary opens=#invite "Invite"
modal #invite md "Invite teammate"
  input email label="Email" "name@company.com"
  row g=sm justify=end
    button ghost closes "Cancel"
    button primary closes "Send"
```
| Attribute | Effect |
|---|---|
| `opens=#name` | click opens the target |
| `toggles=#name` | click flips the target (sidebar, collapse, dropdown...) |
| `closes` | click closes the enclosing overlay |
| `closes=#name` | click closes that target |

Targets can be `modal`, `drawer`, `sidebar`, `dropdown`, `toast` or `collapse`. They start closed, except `sidebar`, which starts open (write `sidebar closed` to start collapsed). Add the `open` flag to draw something open from the start. A missing, duplicate or non-openable target is an error with a line number.

Built in, with no attributes needed:
- `dropdown`: first child is the trigger, then a `menu` of `item`s. Clicking the trigger toggles it; an item click or a click elsewhere closes it.
- `tabs`: children are `tab "Label"` panels; clicking a tab shows its panel (`active=2` picks the start tab). `tabs "A|B|C"` alone draws only a strip.
- `collapse "Title"`: click the title to expand.
- `tooltip "Hint"`: wraps one element, shows on hover.
- Escape closes the top modal or drawer; the backdrop and the x also close it.

State is only open, closed or selected, and a reload resets it. One click listener on the document handles everything, so interactions work inside Vue, React and shadow roots without wiring.

### Seeing every state
```
nub exec mokui outline mock.mk                    # lists interactions and states
nub exec mokui render mock.mk -o base.png
nub exec mokui render mock.mk -o invite.png --open invite
nub exec mokui render mock.mk -o menu.png --open more --theme dark
```
or `compile(src, { open: ['invite'] })` / `mount(el, src, { open: [...] })` in code.

## Themes
`theme=modern` (default), `theme=dark`, `theme=wire` on any element applies to that whole subtree, so a dark panel can sit in a light page. `mount(el, src, { theme })` and `render --theme` theme the whole mock. `wire` is the plain wireframe look for low-fidelity drafts. Every look is made of CSS variables, listed below, so a host can also set them directly.

## Theming variables
Override CSS custom properties anywhere above the mock. Scales:
| Variables | Controls | Defaults |
|---|---|---|
| `--mk-s-none..xl` | gap, padding | 0, 4, 8, 12, 16, 24 px |
| `--mk-f-xs..xl` | font size | 11, 13, 15, 18, 24 px |
| `--mk-z-xs..xl` | `w` / `h` | 24, 48, 96, 160, 240 px |
| `--mk-m-xs..xl` | `grid min=` | 80, 120, 200, 280, 400 px |
| `--mk-fg`, `--mk-bg`, `--mk-muted`, `--mk-line`, `--mk-fill` | text, background, secondary text, borders, subtle fill | modern: `#18181b`, `#fff`, `#71717a`, `#e4e4e7`, `#f4f4f5` |
| `--mk-accent`, `--mk-on-accent`, `--mk-danger` | primary buttons, checked states, active tab; text on accent; destructive | `#18181b`, `#fff`, `#dc2626` |
| `--mk-r`, `--mk-r-sm` | radius for containers, for controls | 12px, 8px |
| `--mk-shadow`, `--mk-shadow-lg`, `--mk-backdrop` | cards and fields, overlays, modal backdrop | soft shadows, 45% black |

The default accent is near-black on purpose: drafts should not look like a finished brand. Set `--mk-accent` (and `--mk-on-accent`) to try a color.

## CLI
```
nub exec mokui cheatsheet
nub exec mokui outline mock.mk
nub exec mokui render mock.mk -o mock.png -w 600 [--open name,name] [--theme dark|wire]
```
Reads stdin when the file is `-`. Errors print with line numbers and exit 1.

## Browser support
Evergreen browsers only: constructable stylesheets, container queries and shadow DOM are required.
