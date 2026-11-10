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

## Coverage (244 tests)

**Unit (70)**
- `dsl` (16): nesting, attrs, bare words per tag, quoted attribute values, flags, `#name`, intent attrs; prototype names rejected; all errors reported at once with line numbers and valid options; breakpoint variants only on responsive attrs; indent errors; print round-trip with bare words; every recipe's expansion; recipes expand to primitives only.
- `interactions` (15): `opens` / `toggles` / `closes` parsing and print round-trip; missing target (lists the names that exist), duplicate names, target that cannot open, `closes` outside an overlay, `menu` outside `dropdown`, `tab` outside `tabs`; `compile` with `open` states (including sidebar, unknown names, recipes); outline flows and states; cheat sheet content.
- `agent-views` (5): outline tree, interactive inventory, notes, recipe expansion on request; cheat sheet covers every tag and stays compact.
- `extras` (18): packs (every tag in exactly one pack, default sheet vs `all`, unknown pack error, the parser accepts every tag regardless of packs); parsing and validation of every new primitive; the newline escape; the expansion of every new recipe.
- `playground` (8): every playground example compiles and has an outline, ids are unique, and together the examples use more than 85% of the vocabulary (so a new tag that no example shows is noticed).
- `eval-score` (7): scoring of valid, incomplete and invalid mocks (including interaction prompts), fence extraction, prompt set sanity.
- `elements` (1): `mount` creates registered elements.

**Browser (147)**, in real Chromium
- `styles` (20): flex direction, every spacing token, padding, align/justify, text sizes, theming through CSS variables, icons, host-CSS isolation, composition geometry.
- `extras` (44): alert variants and dismiss, progress, spinner, skeleton, rating, chip, every chart kind and `values` / `labels` / `h` (and that charts are deterministic), calendar (a fixed month, leading and trailing days, value and range, seven columns), avatars, code, kbd, video, segmented, upload, otp, `help` / `error` on fields, link, popover (open, click inside, outside, `closes`, opened by name), bottom sheet, fab, labeled divider, status colors, and the rendering of every new recipe.
- `layout` (17): grid columns, `min=` auto-reflow, breakpoint variants below and above the breakpoint, frame widths and frame as a query container, box, spacer, divider, scroll, `w=full`.
- `controls` (21): button variants, sizes, icon, disabled, full, role; input label, placeholder, value, type icons; textarea rows; select; checkbox, radio, switch; slider; unknown-icon warning; every bundled icon renders; fields fit narrow cards.
- `content` (9): image, avatar, badge, text modifiers, and `card`, `navbar`, `table` rendering.
- `interactions` (21): modal hidden until opened, covers its container, closes from `closes`, the x, the backdrop and Escape (and not from a click on the panel), sizes; drawer sides; sidebar default, toggle, `closed`, `grow`; dropdown trigger, item click, outside click, second dropdown, Escape; tabs switching, `active=N`, strip-only; collapse; tooltip on real hover; toast; interactions inside a shadow root.
- `look` (15): modern tokens (radius, shadow, accent, field height), `raised`, themes `dark` and `wire` (subtree, nesting, `mount({ theme })`, invalid value), `mount({ open })`, and regression tests for browser built-in attribute behavior (legacy `align` hint, native `title` tooltips).

**E2E (27)**
- CLI (9): `cheatsheet`; `outline` from stdin; a real PNG; PNG height changes with width; `--open` draws a closed modal; `--open` with an unknown name fails clearly; `--theme` changes the picture; outline shows interactions and states; errors with line numbers and a non-zero exit.
- Consumers (18): the Vue and React apps (the same eight tests each) are built with the Vite plugin and loaded in Chromium. They check that: the showcase renders as custom elements with shadow roots and no console errors; all six examples render without errors; clicks declared in a `.mk` file open and close the modal and toggle the sidebar; tabs and dropdowns inside injected markup respond; breakpoints follow the container width (three columns at 1200px, one at 500px); the width slider and theme select change the picture (`dark`, `wire`); **framework state drives Mokui elements** (a range input updates `<mk-progress>`, `<mk-rating>` and a badge variant); native events work on elements (a click handler updates state, a chip removes itself). Plus two tree-shaking tests: `mokui/core` ships no `customElements` and no icon paths, and is smaller than the full import.

## Not covered yet
- Firefox and WebKit. Only Chromium runs today.
- Visual regression (screenshots are generated but not diffed).
- Angular and Svelte consumers (documented, not tested).
- Console warnings for raw-HTML invalid attribute values (the DSL rejects them; raw HTML is silently ignored).
- Keyboard and focus behavior: overlays do not trap focus or restore it, and tabs and dropdowns have no arrow-key support. These are mocks, but it is a gap if accessibility review matters.
- Visual quality of states is checked by eye (rendered PNGs reviewed during development), not by diffing.
- Accessibility auditing beyond roles on controls.
- Agent accuracy with a real model: the harness exists (`eval/`) but has not been run. See [eval/README.md](../eval/README.md).
- CI: no pipeline is configured, so none of this runs automatically yet.

## Related checks
- `nub run typecheck`: strict TypeScript over `src`, `tests`, `playground`, `bench`, `eval`.
- `nub run build`: Vite library build, IIFE browser bundle, `tsc` declarations.
- `nub run bench`: token benchmark, see [bench/README.md](../bench/README.md).
