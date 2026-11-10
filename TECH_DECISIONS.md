# Mokui Technology Decisions

Record of what we chose and why. Subordinate to [CONSTITUTION.md](./CONSTITUTION.md).

## Summary

| Area | Decision |
|---|---|
| Rendering | **Web Components** (Custom Elements v1 + Shadow DOM), hand-written, no library |
| Styling | Plain CSS, constructable stylesheets, CSS custom-property scales, attribute selectors |
| CSS framework | None |
| Icons | Bundled SVG path map, Lucide names |
| Authoring | Indentation-based DSL (primary), HTML tags (secondary) |
| Integration | Vite plugin or plain import |
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
- A map of about 100-150 icon names to SVG path strings, using Lucide naming because LLMs already know those names.
- Exported as individual modules so bundlers can tree-shake unused icons.
- Unknown names render a visible placeholder and warn; they never fail silently.
- No Iconify, no network fetches.

### Authoring format
- **Primary:** compact indentation-based DSL. No closing tags saves tokens.

  ```
  row g=md p=lg
    icon search
    text lg "Title"
  ```

- A small hand-written parser (no parser-generator dependency) produces the same custom-element tree, so DSL and HTML are equivalent and share one render path.
- **Secondary:** raw HTML tags (`<mk-row g="md">`) work with no parser at all.
- Preliminary benchmark: about 44% fewer tokens than compact HTML, 56% than pretty HTML, 61% than Tailwind HTML (4 fixtures, proxy tokenizer). See [bench/README.md](./bench/README.md) for method and caveats. Still provisional until the cheat-sheet cost and LLM generation accuracy are measured.

### Vite integration
- Entry point registers all elements as a side effect, with a sub-path export per primitive for tree-shaking.
- Optional Vite plugin transforms `.mk` files and `` mk`...` `` template literals into the element tree at build time.
- Setup stays one install and one import.

### Tooling
- **TypeScript**, strict, fully typed public API; ships ESM with `.d.ts`.
- **Vitest** with two projects: `unit` (happy-dom, pure logic) and `browser` (real headless Chromium via `@vitest/browser-playwright`). happy-dom does not compute shadow-DOM styles, so all styling assertions run in the browser project. See [docs/TESTING.md](./docs/TESTING.md).
- **Token benchmarks:** fixture mocks in DSL vs HTML vs Tailwind, counted with `gpt-tokenizer` (a proxy for Claude's tokenizer), run with `nub run bench`. Not yet tracked in CI.
- **Bundle-size guard** in CI.
- **TypeScript 7 note:** TS 7 has no JS compiler API, so `vite-plugin-dts` does not work. Declarations are emitted with `tsc -p tsconfig.build.json` after the Vite build.
- **Lightning CSS** or Vite's `?inline` CSS import to minify the stylesheet into a string (dev-only).

### Package manager
- `nub` for installing, running scripts, and publishing. Contributors and CI use it; docs and scripts show `nub` commands only.

### Dependencies
- Runtime: zero. Users install one package.
- Dev-only: TypeScript, Vite, Vitest, a DOM test environment, Lightning CSS.

## Revisit if
- DSL benchmarks show no meaningful token savings over HTML.
- Agents need arbitrary values: add an escape hatch via inline custom properties, not a CSS framework.
- Shadow DOM causes real friction (e.g. host-level global theming or SSR needs): reconsider light DOM with scoped attribute selectors.
