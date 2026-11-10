# Testing

How Mokui is tested, what each layer proves, and what is not covered. Run everything with `nub run test`.

## Layout

| Project | Where | Environment | Purpose |
|---|---|---|---|
| `unit` | `tests/unit/` | happy-dom | Pure logic: parser, validation, recipes, printing, outline, cheat sheet, eval scoring. |
| `browser` | `tests/browser/` | real headless Chromium via Playwright | Anything that depends on real CSS: computed styles, shadow DOM, container queries, geometry. |
| `e2e` | `tests/e2e/` | Node + Playwright | Built artifacts: the CLI, PNG rendering, Vue and React consumer apps, tree-shaking. |

All three are Vitest projects defined in `vite.config.ts`. The e2e project builds the package and both example apps once in a global setup (`tests/e2e/global-setup.ts`) before any e2e file runs.

### Why separate environments
happy-dom and jsdom do not compute styles from shadow-root `adoptedStyleSheets` and have no container queries, so they cannot verify layout. Any claim about how something looks is only trusted when it passes in the browser project.

## One-time setup
```
nub install
nub exec playwright install chromium
```
The Chromium build must match the installed Playwright version. If tests fail with `Executable doesn't exist`, rerun the install command.

## Coverage (106 tests)

**Unit (29)**
- `dsl` (17): nesting, attrs, bare words per tag, quoted attribute values, flags, `#name`, intent attrs; prototype names rejected; all errors reported at once with line numbers and valid options; breakpoint variants only on responsive attrs; indent errors; print round-trip; every recipe's expansion; recipes expand to primitives only.
- `agent-views` (5): outline tree, interactive inventory, notes, recipe expansion on request; cheat sheet covers every tag, mentions intent and responsive syntax, stays compact.
- `eval-score` (6): scoring of valid, incomplete and invalid mocks, fence extraction, prompt set sanity.
- `elements` (1): `mount` creates registered elements.

**Browser (66)**
- `styles` (20): flex direction, every spacing token, padding, align/justify, text sizes, theming through CSS variables, icons, host-CSS isolation, composition geometry.
- `layout` (15): grid columns, `min=` auto-reflow at different widths, breakpoint variants (`cols-md`, `g-md`, `dir-md`) below and above the breakpoint, frame widths and frame as a query container, box, spacer, divider (horizontal and vertical), scroll, `w=full`.
- `controls` (21): button variants, sizes, icon, disabled, full, role; input label, placeholder, value, type icons; textarea rows; select options, value, open; checkbox, radio, switch states; slider position and clamping; unknown-icon warning; every bundled icon renders; fields fit narrow cards.
- `content` (10): image ratio and label, avatar, badge, text modifiers, and the rendering of `card`, `navbar`, `table`, `tabs`.

**E2E (11)**
- CLI (5): `cheatsheet`, `outline` from stdin, a real PNG (signature and size), PNG height changes with width (responsive), errors with line numbers and a non-zero exit.
- Consumers (6): Vue and React apps built with the Vite plugin render custom elements with shadow roots, with no console errors; a `.mk` import renders three columns at 1000px and one at 500px. Tree-shaking: `mokui/core` contains no `customElements` and no icon paths, and is smaller than the full import.

## Not covered yet
- Firefox and WebKit. Only Chromium runs today.
- Visual regression (screenshots are generated but not diffed).
- Angular and Svelte consumers (documented, not tested).
- Console warnings for raw-HTML invalid attribute values (the DSL rejects them; raw HTML is silently ignored).
- Accessibility auditing beyond roles on controls.
- Agent accuracy with a real model: the harness exists (`eval/`) but has not been run. See [eval/README.md](../eval/README.md).
- CI: no pipeline is configured, so none of this runs automatically yet.

## Related checks
- `nub run typecheck`: strict TypeScript over `src`, `tests`, `playground`, `bench`, `eval`.
- `nub run build`: Vite library build, IIFE browser bundle, `tsc` declarations.
- `nub run bench`: token benchmark, see [bench/README.md](../bench/README.md).
