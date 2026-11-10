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
`mount` makes the target a CSS query container, so breakpoint attributes (`cols-md=3`) respond to its width.

### Vue
Tell Vue the tags are custom elements, then render the HTML or write the tags directly. See [examples/vue](../examples/vue).
```ts
vue({ template: { compilerOptions: { isCustomElement: (t) => t.startsWith('mk-') } } })
```
```vue
<div style="container-type: inline-size" v-html="page" />
<mk-row g="md"><mk-icon n="home" /><mk-text s="lg">Hello</mk-text></mk-row>
```

### React 19
Custom elements work directly. See [examples/react](../examples/react).
```jsx
<div style={{ containerType: 'inline-size' }} dangerouslySetInnerHTML={{ __html: page }} />
<mk-row g="md"><mk-icon n="home" /></mk-row>
```

### Angular, Svelte, others
Add `CUSTOM_ELEMENTS_SCHEMA` (Angular) or use the tags as-is (Svelte). Render the HTML string or write `<mk-*>` markup.

## Container queries need a container
Breakpoint attributes (`cols-md=3`, `dir-md=row`) respond to the width of the nearest query container, not the window. `mount()` and `<mk-frame>` are containers. When rendering HTML yourself, put `container-type: inline-size` on a wrapper.

## Theming
Override CSS custom properties anywhere above the mock. Scales:
| Variables | Controls | Defaults |
|---|---|---|
| `--mk-s-none..xl` | gap, padding | 0, 4, 8, 12, 16, 24 px |
| `--mk-f-xs..xl` | font size | 11, 13, 15, 18, 24 px |
| `--mk-z-xs..xl` | `w` / `h` | 24, 48, 96, 160, 240 px |
| `--mk-m-xs..xl` | `grid min=` | 80, 120, 200, 280, 400 px |
| `--mk-fg`, `--mk-bg`, `--mk-muted`, `--mk-line`, `--mk-fill`, `--mk-r` | colors, radius | `#222`, `#fff`, `#777`, `#bbb`, `#f2f2f2`, 6px |

## CLI
```
nub exec mokui cheatsheet
nub exec mokui outline mock.mk
nub exec mokui render mock.mk -o mock.png -w 600
```
Reads stdin when the file is `-`. Errors print with line numbers and exit 1.

## Browser support
Evergreen browsers only: constructable stylesheets, container queries and shadow DOM are required.
