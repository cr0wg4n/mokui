# Mokui Technology Decisions

Record of what we chose and why. Subordinate to [CONSTITUTION.md](./CONSTITUTION.md).

## Summary

| Area | Decision |
|---|---|
| Rendering | **Web Components** (Custom Elements v1 + Shadow DOM), hand-written, no library |
| Styling | Plain CSS, constructable stylesheets, CSS custom-property scales and design tokens, attribute selectors; three themes (`modern`, `dark`, `wire`) |
| CSS framework | None |
| Icons | Bundled SVG path map, Lucide names |
| Authoring | Indentation-based DSL (primary), HTML tags (secondary); recipes for composites |
| Interactions | Declared (`opens` / `toggles` / `closes`), one delegated click listener, state is open / closed / selected only |
| Integration | Vite plugin or plain import; Node-safe `mokui/core`; CLI |
| Language / tests | Strict TypeScript, Vitest + token benchmarks |
| Package manager | `nub` |
| Runtime deps | Zero |

## Details

### Web Components
- Each primitive (`mk-row`, `mk-stack`, `mk-grid`, `mk-box`, `mk-text`, `mk-icon`, `mk-image`, `mk-input`, `mk-button`, `mk-spacer`) is a class extending `HTMLElement`, registered with `customElements.define`.
- **Why:** web components are a browser standard, so the same elements work in Vue, React, Angular, Svelte, or plain HTML with no adapters. This is the only way to meet the framework-agnostic principle.
- **No Lit/Stencil:** the primitives are simple, and a library would break the zero-dependency rule.
- Props are string attributes only (`observedAttributes` + `attributeChangedCallback`). No object props, which avoids React's custom-element prop friction.

### Shadow DOM and styling
- Each element attaches an open shadow root so host CSS cannot alter the mock and the mock cannot leak into the host.
- One shared `CSSStyleSheet` is built once and applied to every root via `adoptedStyleSheets`. This avoids a `<style>` tag per element and is cheap in memory.
- Scales (`--mk-xs` … `--mk-xl` for spacing, font size, radius) are CSS custom properties on `:root`/`:host`. Custom properties inherit through shadow boundaries, so a host can retheme by overriding variables.
- Attributes map to variables with selectors, e.g. `:host([g="md"]) { --mk-gap: var(--mk-md) }`. An undefined value changes nothing, and the element logs a short warning.
- Fallback: browsers without constructable stylesheets are not a target; Mokui requires evergreen browsers.

### Why no CSS framework (UnoCSS, Tailwind, Twind, Open Props)
- Open utility vocabulary (`px-[13px]`) raises token cost and hallucination risk.
- Utility classes do not penetrate shadow DOM without injecting generated CSS into every root.
- Adds a dependency and config, and can clash with a host's own Tailwind/Uno setup.
- Open Props only provides tokens; ~30 lines of our own variables replace it.

### Icons
- 30 Lucide-named icons as inner SVG markup in one map (`src/icons/index.ts`), about 1.4 KB gzipped. `settings` is a simplified approximation of the Lucide shape.
- Lucide naming because LLMs already know those names.
- Unknown names render a dashed placeholder and warn with the valid list; they never fail silently.
- Deviation from the first plan: not one module per icon. A single map is small enough that per-icon tree-shaking is not worth the complexity. `mokui/core` ships no icons at all.
- No Iconify, no network fetches.

### Authoring format
- **Primary:** compact indentation-based DSL. No closing tags saves tokens.

  ```
  row g=md p=lg
    icon search
    text lg "Title"
  ```

- A small hand-written parser (no parser-generator dependency) produces the same custom-element tree, so DSL and HTML are equivalent and share one render path.
- Syntax: `tag [bare words] [key=value] ["text"] [#name]`. `//` starts a comment line (`#` is reserved for names). Quoted attribute values (`label="Full name"`) and boolean flags (`disabled`) are supported.
- **Secondary:** raw HTML tags (`<mk-row g="md">`) work with no parser at all.
- Benchmark (8 fixtures, proxy tokenizer): 53% fewer tokens than compact mk HTML, 63% than pretty, 70% than Tailwind HTML. The cheat sheet costs 1320 tokens and pays back after about 4 mocks. See [bench/README.md](./bench/README.md). Still provisional until LLM generation accuracy is measured ([eval/README.md](./eval/README.md)).

### Vite integration
- Entry point registers all elements as a side effect, with a sub-path export per primitive for tree-shaking.
- Optional Vite plugin transforms `.mk` files and `` mk`...` `` template literals into the element tree at build time.
- Setup stays one install and one import.

### Tooling
- **TypeScript**, strict, fully typed public API; ships ESM with `.d.ts`.
- **Vitest** with three projects (`unit`, `browser`, `e2e`): `unit` = happy-dom for pure logic, browser = real headless Chromium via `@vitest/browser-playwright`, e2e = built CLI and Vue/React consumers. happy-dom does not compute shadow-DOM styles, so all styling assertions run in the browser project. See [docs/TESTING.md](./docs/TESTING.md).
- **Token benchmarks:** fixture mocks in DSL vs HTML vs Tailwind, counted with `gpt-tokenizer` (a proxy for Claude's tokenizer), run with `nub run bench`. Not yet tracked in CI.
- **Bundle-size guard** in CI.
- **TypeScript 7 note:** TS 7 has no JS compiler API, so `vite-plugin-dts` does not work. Declarations are emitted with `tsc -p tsconfig.build.json` after the Vite build.
- **CSS is generated from the registry at load time** as strings, so no CSS build tooling (Lightning CSS, `?inline`) is needed. The earlier plan to add Lightning CSS was dropped.

### Package manager
- `nub` for installing, running scripts, and publishing. Contributors and CI use it; docs and scripts show `nub` commands only.

### Dependencies
- Runtime: zero. Users install one package.
- Dev-only: TypeScript, Vite, Vitest, happy-dom, Playwright (browser tests and PNG rendering), `@vitest/browser-playwright`, `gpt-tokenizer` (benchmark), `@types/node`.
- Optional peer: `playwright`, only for `mokui render`.
- Examples (`examples/vue`, `examples/react`) have their own dependencies and are not part of the package.

## Architecture

### Source layout
```
src/
  index.ts  core.ts  vite-plugin.ts  cli.ts  render-png.ts    entry points (the package's public files)
  tags/                       what each tag is and how it draws
    types.ts shared.ts        TagSpec / AttrDef / Pack, shared attributes, intent and interaction attrs
    recipe-kit.ts             builders shared by recipes
    index.ts                  collects every spec; derives PACKS; attrDef()
    renderers.ts              merges every *.render.ts (the DOM side)
    core/  overlay/  forms/  feedback/  data/  nav/
      <group>.ts              specs (pure data), for example overlay/dialogs.ts: modal, drawer, toast
      <group>.render.ts       how those tags draw in their shadow root (only when they need to)
      recipes.ts              recipes of that pack
  dsl/                        parse, print, compile
  theme/                      tokens and themes (scale), color, theme API, generated CSS
  agent/                      cheat sheet and outline
  runtime/                    define the custom elements, the delegated click listener, DOM helpers
  icons/
```
- **One place per tag.** A tag's spec, its renderer and its recipe sit in one pack folder; adding or changing a tag no longer means editing files in four unrelated places (`docs/ADDING_A_TAG.md`).
- **Grouped, not one file per tag.** Most specs are 8 to 15 lines, so they live in small themed files (`layout.ts`, `dialogs.ts`, `floating.ts`...). A tag gets its own files only when it has real logic: `chart` and `calendar` each have a spec and a renderer with their drawing code.
- **Spec and renderer are separate files on purpose.** Specs are pure data, so `mokui/core` can use them in Node. Renderers touch the DOM and are only reachable from `runtime/`. `tests/unit/structure.test.ts` follows every import from `src/core.ts` and fails if `runtime/`, a renderer or the icon set becomes reachable.
- **Entry points stay at the root** so the published file names (`dist/index.js`, `dist/core.js`, `dist/cli.js`) and the `bin` path are unchanged by internal moves.
- **Guarded by tests:** each spec file lives in the folder of its pack, every spec is registered in the index (and nothing is registered twice), only primitives have renderers, every renderer file sits next to the spec file it draws.

### Registry is the single source of truth (`src/tags/`)
One `TagSpec` per primitive: attributes, closed value sets with their CSS, flags, which words may be bare, where quoted text goes, default ARIA role. Everything is derived from it:
- the stylesheet per element (`src/theme/css.ts`), including breakpoint variants
- the custom elements (`src/runtime/define.ts`)
- the parser's bare-word resolution and validation (`src/dsl/parse.ts`)
- the cheat sheet (`src/agent/cheatsheet.ts`)

Adding a primitive means adding one spec (plus a small renderer if it needs shadow content). Docs and validation cannot drift from the code.

### Validation is strict
Unknown tags, attributes and values are errors, all reported at once with line numbers and the valid options (`MkError`). Raw HTML with an invalid value is silently ignored by CSS, as usual.

### Responsiveness
- Auto-reflow first: `grid min=md` uses `auto-fit` / `minmax`, costing no extra tokens.
- Escape hatch: `-sm|-md|-lg` variants (`cols=1 cols-md=3`, `dir-md=row`, `g-lg=xl`) on attributes marked responsive, mobile-first, generated as container queries. Breakpoints are 480 / 768 / 1024 px of the container.
- Container queries (not media queries) because mocks live inside panes and shadow roots. `mount()` and `<mk-frame>` are the containers.
- `frame mobile|tablet|desktop` previews a device width.

### Recipes (`src/tags/*/recipes.ts`)
`card`, `navbar`, `list`, `table`, `tr` are DSL-level macros that expand to primitives before rendering. There are no recipe elements, no extra rendering path, and the DOM stays flat and readable. See constitution section 2.7.

### Packs (a wide vocabulary that stays cheap)
- Every tag belongs to one pack, declared where the tag lives (`inPack('data', [...])`) and derived into `PACKS` by `src/tags/index.ts`: `core`, `overlay`, `forms`, `feedback`, `data`, `nav`. `cheatsheet()` documents `core` and `overlay` and ends with a single index line of the other packs; `cheatsheet({ packs })` and `mokui cheatsheet <pack|all>` load more. The parser never looks at packs, so a tag used from the index line is always valid. A unit test makes sure every tag is in exactly one pack.
- Measured: 1,498 tokens for the default sheet, 2,177 for everything. The vocabulary roughly doubled while the default cost grew about 13%.
- The pack folders under `src/tags/` hold the specs, recipes and renderers of their tags (see Source layout above); a test keeps each spec file in the folder of its pack.

### Deterministic fake data
Charts take optional `values`, otherwise draw fixed sample data per kind; calendars draw a fixed month (2026-11) unless `month=` is given. Nothing reads the clock or `Math.random`, so a source always renders the same picture and PNG renders can be compared. (A first version of `chart` treated a missing `values` as `[0]`; an empty-string filter fixed that, found by a test.)

### Theming (data, never templates)
- **Why not a template language:** a template would add logic (the constitution excludes it) and gain nothing a token set cannot do. A theme is a `TokenSet` (17 tokens), nothing more.
- **Layers:** built-in themes (`src/theme/scale.ts`); the `theme` / `accent` / `radius` / `font` attributes (generated CSS in `src/theme/css.ts`, validated from `INTENT` in the registry); `themeFromColor` (`src/theme/color.ts`); `defineTheme`, `loadTheme`, `themeStyle`, `themeCssText`, `themeFile` (`src/theme/theme.ts`); the `mokui theme` and `render --theme-file` CLI; the playground editor.
- **Accent, radius and font survive nested themes.** The five user tokens (`accent`, `on-accent`, `r`, `r-sm`, `font`) are written by every theme as `var(--mk-u-<token>, <theme value>)` and read by the elements as `var(--mk-<token>, var(--mk-u-<token>, <modern value>))`. The `accent` / `radius` / `font` attributes set only `--mk-u-*`. So `accent=emerald` on a page reaches a `theme=dark` panel inside it, and a theme and an accent on the same element do not fight over order.
- **Named accents use `light-dark()`** (`--mk-u-accent: light-dark(#059669,#34d399)`), evaluated where the variable is used, so the same `accent=emerald` is the lighter variant in a dark subtree. A hex accent is used as given. On-accent text is computed from contrast (`contrastOn`).
- **`themeFromColor` guarantees contrast:** in dark mode the accent is lightened step by step until it has at least 4.5:1 (WCAG AA) against the dark surface; a test checks seven colors including black and zinc.
- **`defineTheme` is global state by design** (it extends the closed vocabulary of `theme=`). The shared base stylesheet is one `CSSStyleSheet` adopted by every shadow root, so inserting one rule styles elements that already exist (`themeListeners`). The base sheet is built when elements are defined, so themes registered earlier are included.
- **`mount` replaces the look.** The theme is applied as inline custom properties; a second `mount` first removes what the first applied (tracked per element), so dropping an accent really drops it. Found when the playground's Reset button left the old accent behind. Styles the page set itself are never touched.
- **Requires** `color-mix()` and `light-dark()` (evergreen browsers).

### Look: tokens and themes
- Every color, radius and shadow is a design token read through a CSS variable with the modern value as its fallback (`var(--mk-fg,#18181b)`). A `theme` attribute (`modern`, `dark`, `wire`) on any element redefines the variables for its subtree; because custom properties inherit through shadow DOM, a dark panel can sit inside a light page. `mount(..., { theme })` does the same for a whole mock.
- Status colors (`success`, `warning`, `info`, `danger`) are tokens too: `alert`, badge variants, `rating` and `stat` deltas use them, `dark` lightens them, `wire` flattens them to the foreground color.
- The default is modern and restrained: zinc neutrals, 12px / 8px radii, soft shadows, one accent that defaults to near-black so a draft is not mistaken for a brand design (constitution 3.5). `wire` keeps the old plain look for low-fidelity conversations.
- Theme rules live in the shared base sheet, so adding a theme is one entry in `src/theme/scale.ts`.

### Interactions
- **Declared, not programmed (constitution 2.8).** `opens=#name`, `toggles=#name`, `closes` / `closes=#name` on any element; stateful targets are `modal`, `drawer`, `sidebar`, `dropdown`, `toast`, `collapse`. Their state is the `open` attribute (`sidebar` is visible unless `closed`). `tabs`, `collapse` and `dropdown` carry their own selection state.
- **One delegated listener** on `document` (`src/runtime/interact.ts`), installed when elements are defined. It reads `composedPath()`, so it works for markup inside Vue, React and other shadow roots, and resolves `#name` within the clicked element's own tree. The innermost element with an interaction attribute wins. Also: Escape closes the top modal or drawer, a click outside closes dropdowns, a backdrop click closes a modal.
- **Validated at parse time:** missing target (lists existing names), duplicate names, a target that cannot open, `closes` outside an overlay, `menu` outside `dropdown`, `tab` outside `tabs`.
- **Overlays cover the nearest positioned container** (`position: absolute; inset: 0`), not the viewport, so they work in panes and inside a `frame` device preview. `mount()` positions its target and gives it a minimum height when the mock has a modal or drawer.
- **States can be drawn statically:** the `open` flag, `compile(src, { open })`, `mount(..., { open })`, `mokui render --open name`. `outline()` lists the interactions and which states exist, so an agent can render each one.
- **No timers, no navigation, no data.** A toast stays until closed; a reload resets everything.

### Browser built-ins that bite custom elements
Found by testing in a real browser, now covered by regression tests:
- The HTML `align` attribute is a legacy hint for `text-align`: `row align=center` silently centered the text of every child (a placeholder drifted away from its icon). Every element now resets `text-align: start` on `:host`; only the `center` flag on `text` centers.
- The `title` attribute shows a native tooltip, so the quoted text of `modal`, `drawer` and `collapse` is stored in `label`, never `title`.

### Intent layer
Every tag accepts `name` (`#name`), `role` and `note`. Controls get a default `role` attribute on the host (explicit `role` wins). `outline()` prints the canonical tree, an inventory of interactive elements and the notes, so an agent can match a mock against written requirements.

### Entry points
- `mokui`: registers elements, exports `mount` and the core API.
- `mokui/core`: DOM-free (parse, compile, print, outline, cheatsheet), safe in Node. Verified by test to ship no elements or icons.
- `mokui/vite`: `.mk` imports.
- `mokui` CLI: `cheatsheet`, `outline`, `render` (PNG via the optional `playwright` peer, using an IIFE browser bundle).

## Revisit if
- DSL benchmarks show no meaningful token savings over HTML.
- Agents need arbitrary values: add an escape hatch via inline custom properties, not a CSS framework.
- Shadow DOM causes real friction (e.g. host-level global theming or SSR needs): reconsider light DOM with scoped attribute selectors.
