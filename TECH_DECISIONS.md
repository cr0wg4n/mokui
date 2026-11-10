# Mokui Technology Decisions

Record of what we chose and why. Subordinate to [CONSTITUTION.md](./CONSTITUTION.md).

## Summary

| Area | Decision |
|---|---|
| Rendering | **Web Components** (Custom Elements v1 + Shadow DOM), hand-written, no library |
| Styling | Plain CSS, constructable stylesheets, CSS custom-property scales, attribute selectors |
| CSS framework | None |
| Icons | Bundled SVG path map, Lucide names |
| Authoring | Indentation-based DSL (primary), HTML tags (secondary); recipes for composites |
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
- Benchmark (7 fixtures, proxy tokenizer): 53% fewer tokens than compact mk HTML, 63% than pretty, 66% than Tailwind HTML. The cheat sheet costs 958 tokens and pays back after about 4 mocks. See [bench/README.md](./bench/README.md). Still provisional until LLM generation accuracy is measured ([eval/README.md](./eval/README.md)).

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

### Registry is the single source of truth (`src/registry.ts`)
One `TagSpec` per primitive: attributes, closed value sets with their CSS, flags, which words may be bare, where quoted text goes, default ARIA role. Everything is derived from it:
- the stylesheet per element (`src/css.ts`), including breakpoint variants
- the custom elements (`src/elements/index.ts`)
- the parser's bare-word resolution and validation (`src/dsl/parse.ts`)
- the cheat sheet (`src/cheatsheet.ts`)

Adding a primitive means adding one spec (plus a small renderer if it needs shadow content). Docs and validation cannot drift from the code.

### Validation is strict
Unknown tags, attributes and values are errors, all reported at once with line numbers and the valid options (`MkError`). Raw HTML with an invalid value is silently ignored by CSS, as usual.

### Responsiveness
- Auto-reflow first: `grid min=md` uses `auto-fit` / `minmax`, costing no extra tokens.
- Escape hatch: `-sm|-md|-lg` variants (`cols=1 cols-md=3`, `dir-md=row`, `g-lg=xl`) on attributes marked responsive, mobile-first, generated as container queries. Breakpoints are 480 / 768 / 1024 px of the container.
- Container queries (not media queries) because mocks live inside panes and shadow roots. `mount()` and `<mk-frame>` are the containers.
- `frame mobile|tablet|desktop` previews a device width.

### Recipes (`src/recipes.ts`)
`card`, `navbar`, `tabs`, `list`, `table`, `tr` are DSL-level macros that expand to primitives before rendering. There are no recipe elements, no extra rendering path, and the DOM stays flat and readable. See constitution section 2.7.

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
