# Testing

How Mokui is tested, what each layer proves, and what is still not covered. Run everything with `nub run test`.

## Layout

| Project | Where | Environment | Purpose |
|---|---|---|---|
| `unit` | `tests/unit/` | happy-dom | Pure logic: DSL parser, HTML output, element registration. Fast, no browser. |
| `browser` | `tests/browser/` | real headless Chromium via Playwright | Anything that depends on real CSS: computed styles, shadow DOM, layout geometry. |

Both are Vitest projects defined in `vite.config.ts`.

### Why two environments
happy-dom and jsdom do not compute styles from shadow-root `adoptedStyleSheets`, so they cannot verify that `g="md"` produces a 12px gap. Styling claims are only trusted when they pass in the browser project.

## One-time setup
```
nub install
nub exec playwright install chromium
```
The Chromium build must match the installed Playwright version. If tests fail with `Executable doesn't exist`, rerun the install command.

## Current coverage (23 tests)

**Unit (3)**
- DSL parses nesting, attributes, positional values, and quoted text into the expected HTML.
- DSL errors include the line number (odd indent, indent jump).
- `mount()` creates registered custom elements; `mk-icon` renders an `<svg>`.

**Browser (20)**
- `row` and `stack` are flex containers with the right direction.
- Every spacing token (`xs..xl`) maps to the expected `gap` (4/8/12/16/24px).
- `p`, `align`, `justify` map to padding and flex properties.
- Unknown scale values change nothing (`g=huge` leaves `gap: normal`).
- Text sizes (`sm`, `lg`, `xl`) and the `md` default map to the expected `font-size`.
- Theming: overriding `--mk-s-md` on a host element changes the rendered gap.
- Icons: known icons render paths; unknown icons render a placeholder; changing `n` re-renders.
- Isolation: aggressive host CSS (`svg { display: none !important }`) does not leak into shadow content.
- Composition: two icons in `row g=lg` sit side by side with a 16px gap (measured with `getBoundingClientRect`).

## Not covered yet
- Primitives not implemented: `grid`, `box`, `image`, `input`, `button`, `spacer`.
- Tree-shaking in a real consumer app (`sideEffects` has already broken the build once, so this matters).
- The Vite plugin (`.mk` imports).
- Console warnings for unknown icons and unknown attribute values (only the placeholder is asserted).
- Firefox and WebKit. Only Chromium runs today.
- Visual regression (screenshots).

## Related checks
- `nub run typecheck`: strict TypeScript over `src`, `tests`, `playground`, `bench`.
- `nub run build`: Vite library build plus `tsc` declaration emit.
- `nub run bench`: token benchmark, see [bench/README.md](../bench/README.md).
