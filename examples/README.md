# Examples

The same six screens in three places: the playground, a Vue app and a React app.

| Folder | What it is |
|---|---|
| `screens/*.mk` | The shared sources: `showcase` (a full app), `analytics`, `forms`, `mobile`, `landing`, `gallery`. `screens/index.json` lists their ids and labels. |
| `vue/` | A Vue 3 app. Each `.mk` file is imported through the `mokui/vite` plugin as an HTML string and injected with `v-html`. |
| `react/` | The same app in React 19, using `dangerouslySetInnerHTML`. |
| `../playground/` | The live editor. It imports the same files with `?raw` so you can edit the DSL. |

Each app has a toolbar to pick the screen, the theme (`modern`, `dark`, `wire`), the accent (13 colors), the radius, the font and the container width. The playground has a full **theme editor** instead: base, accent swatches and a free color, radius, font, an option to tint surfaces from the accent, and a live JSON theme file you can edit, copy as JSON or as CSS, and reload (it is saved in `localStorage`). Everything on the screens is clickable (modals, drawers, sidebar, dropdowns, popovers, tabs, collapse, toast), because one document-level listener handles the declared interactions inside markup injected by the framework.

Under the screen there is a section that Mokui cannot show on its own: **framework state driving Mokui elements**. Plain `<mk-*>` tags are written in the framework's template, bound to framework state (a range input sets `value` on `<mk-progress>` and `<mk-rating>`, a click handler on `<mk-button>` increments a counter, clicking a `<mk-chip>` removes it from an array).

## Run
```
nub run build                      # the apps import the built package
cd examples/vue   && nub install && nub run build && nub exec vite preview
cd examples/react && nub install && nub run build && nub exec vite preview
```
Or `nub exec vite` in either folder for a dev server (`server.fs.allow` is set so the shared screens can be read).

## Notes for your own app
- Vue needs `isCustomElement: (t) => t.startsWith('mk-')` in the template compiler options.
- Boolean attributes: in Vue write `x`, in React write `x=""` (React 19 does not reflect `true` on custom elements). To switch one off, bind `undefined`.
- Give the container `container-type: inline-size; position: relative` so breakpoints and overlays work (see docs/USAGE.md).
