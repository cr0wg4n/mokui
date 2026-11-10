# Mokui Roadmap

Task list for building Mokui. Check items off as they land (`- [x]`). Any deviation from the plan is recorded under **Notes** at the bottom. Principles live in [CONSTITUTION.md](./CONSTITUTION.md), stack decisions in [TECH_DECISIONS.md](./TECH_DECISIONS.md).

Status legend: `[x]` done and tested, `[ ]` not done.

**Status: Steps 0-5 and 7-9 are done. Step 6 is done except running the accuracy eval against a real model.** 162 tests pass (unit, browser, e2e).

## Step 0: Registry as single source of truth
- [x] Primitive registry: one spec per tag (attributes, allowed values, CSS rules, bare-word mapping)
- [x] Generate element CSS from the registry (no hand-written per-attribute CSS)
- [x] Generate custom elements from the registry
- [x] Parser resolves bare words through the registry (no hardcoded positional table)
- [x] Quoted attribute values: `label="Full name"`
- [x] Boolean flags: `button primary disabled`
- [x] `#name` shorthand for the `name` attribute
- [x] Intent attributes on every tag: `name`, `role`, `note`
- [x] Validation with line numbers: unknown tag, unknown attribute, invalid value (lists valid options), all errors reported at once
- [x] Tests: parser, validation, generated CSS in a real browser

## Step 1: Layout and responsiveness
- [x] `grid` (`cols=1..6`)
- [x] `box`
- [x] `spacer`
- [x] `divider` (horizontal and `vertical`)
- [x] `scroll`
- [x] `frame` (`mobile` / `tablet` / `desktop`)
- [x] Auto-reflow: `grid min=xs..xl` (`auto-fit` / `minmax`)
- [x] Container-query breakpoints: `cols-md=3`, `g-lg=xl`, `dir-md=row` (`sm` / `md` / `lg`, mobile-first)
- [x] `mount()` makes its target a query container
- [x] More icons (about 30 total)
- [x] Browser tests: grid columns, auto-reflow, breakpoints at different container widths, frame widths

## Step 2: Controls
- [x] `button` (`primary` / `secondary` / `ghost`, `sm`..`lg`, `icon=`, `disabled`, `full`)
- [x] `input` (`type=text|email|password|number|search|date`, `label=`, placeholder from quoted text, `disabled`)
- [x] `textarea`
- [x] `select` (options from quoted text `"A|B|C"`, `open`)
- [x] `checkbox`, `radio` (`checked`)
- [x] `switch` (`on`)
- [x] `slider` (`value`)
- [x] ARIA role set on the host element for each control
- [x] Browser tests for each control

## Step 3: Content
- [x] `image` (placeholder with diagonals, `ratio`, label from quoted text)
- [x] `avatar`
- [x] `badge`
- [x] Browser tests

## Step 4: Recipes (composites)
- [x] Recipe mechanism: DSL-level macros that expand into primitives
- [x] `card`
- [x] `navbar`
- [x] `tabs`
- [x] `list`
- [x] `table` + `tr`
- [x] Tests: expansion output and rendering

## Step 5: Agent views
- [x] `outline(src)`: compact structural view (recipes kept as written, `expandRecipes` to expand; intent shown; interactive-element inventory)
- [x] `cheatsheet()`: generated from the registry
- [x] Docs on how an agent should use both together with written requirements
- [x] PNG render CLI (optional extra, needs Playwright)
- [x] Tests for outline and cheatsheet

## Step 6: Measure
- [x] Expand benchmark fixtures to realistic screens using the new primitives and recipes
- [x] Measure cheat sheet token cost and the break-even point
- [x] Agent accuracy harness (`eval/`): prompts, scoring, runner
- [ ] Run the accuracy eval against a real model (needs API credentials and approval)

## Step 7: Real-world proof
- [x] Vue consumer app (Vite)
- [x] React consumer app (Vite)
- [x] Bundle size and tree-shaking measured from the consumers
- [x] Vite plugin test (`.mk` imports)
- [x] Docs: install and usage per framework

## Step 8: Modern look
- [x] Design tokens and themes: `modern` (default), `dark`, `wire` through CSS variables and a `theme` attribute; `mount(..., { theme })`
- [x] Restyle every primitive (radius, soft borders, elevation, type, accent for primary and checked states)
- [x] `raised` flag on `box`, `card` raised by default; `grow` flag; `divider accent`
- [x] `item` (menu and nav row), restyled `tabs`
- [x] Browser tests for tokens and themes

## Step 9: Interactions
- [x] Interaction attributes on every tag: `opens=#x`, `toggles=#x`, `closes` / `closes=#x`
- [x] One delegated click runtime (works inside framework apps and shadow roots), Escape closes overlays, outside click closes dropdowns
- [x] `modal`, `drawer`, `sidebar`, `dropdown` + `menu` + `item`, `tooltip`, `toast`, `collapse`
- [x] Stateful `tabs` + `tab` panels (replaces the static tabs recipe)
- [x] Validation of references: missing target, duplicate names, target that cannot open, `closes` outside an overlay
- [x] Render any state statically: `open` flag, `compile(src, { open })`, CLI `--open`, `--theme`
- [x] `outline()` lists interactions and the states available
- [x] Cheat sheet, docs, benchmark fixture and eval prompts updated
- [x] Tests: unit, real-browser interaction tests, CLI states, framework consumers click through

## Notes
Deviations from the plan and findings, recorded as work happened.

**Deviations**
- **Comments use `//`, not `#`.** `#` is now the shorthand for `name` (`button #save`).
- **`heading` was dropped.** `text xl bold` covers it with no new element.
- **Icons are one map, not one module per icon** (30 icons, about 1.4 KB gzipped). Per-icon tree-shaking was not worth the complexity. `mokui/core` ships no icons or elements instead (verified by test). `settings` is a simplified approximation of the Lucide shape.
- **Roles are set as a `role` attribute** on the host, not through `ElementInternals`. The attribute is testable and also shows up in the DOM structure an agent reads.
- **`mokui/core` entry added** (DOM-free) because the main entry registers elements on import and would crash in Node.
- **No Lightning CSS.** CSS is generated as strings from the registry, so no CSS build step is needed.
- **No `vite-plugin-dts`.** TypeScript 7 has no JS API; declarations come from `tsc`.
- **Strict validation.** The DSL rejects unknown tags, attributes and values (all errors at once). The old `g=huge changes nothing` behavior now only applies to raw HTML.
- **Sub-path export per primitive was not done.** The registry registers all elements together; the full bundle is 25 KB (8.8 KB gzipped).

**Findings**
- Real-browser tests caught a bug happy-dom could not: inputs overflowed narrow cards. Fixed (`min-width: min(160px, 100%)`) with a regression test.
- The first cheat sheet mislabeled `min=` as a font set and did not show which attributes accept bare words. Fixed; it is generated from the registry now.
- The canonical printer now emits bare words (`icon bell`, `grid 3`) so the outline matches what an author would write.
- The cheat sheet costs 958 tokens and pays for itself after about 4 mocks vs Tailwind (see bench/README.md). DSL token savings: 53% vs compact mk HTML, 63% vs pretty, 66% vs Tailwind.

**Steps 8 and 9 (modern look, interactions)**
- **`tabs` is now a real element** (`tabs` + `tab` panels, or `tabs "A|B|C"` for a strip), not a recipe: switching panels needs state. The old recipe is gone.
- **Quoted text of `modal`, `drawer` and `collapse` lives in `label`, not `title`**, because `title` shows a native browser tooltip.
- **Bug found by looking at renders, not by the first test run:** the HTML `align` attribute is a legacy `text-align` hint, so `row align=center` centered every child's text. Fixed with a `text-align: start` reset and a regression test. Documented in TECH_DECISIONS.
- **Sidebar state is inverted** (`closed`, visible by default) because a sidebar is normally shown; every other stateful element uses `open`.
- **Overlays cover the nearest positioned container.** In a phone preview put the drawer inside the `frame`; outside it, it covers the whole container. This is documented but easy to get wrong.
- **Cheat sheet grew from 958 to 1320 tokens** with the new primitives, moving break-even from about 4 to about 4-6 mocks depending on the baseline. It can be trimmed (for example merging `stack` and `row`).
- **Default accent is near-black on purpose** so drafts do not look like a brand design. Colors are one variable away.
- **Accessibility is minimal:** roles on controls, but overlays do not trap or restore focus and tabs, dropdowns have no arrow-key support.
- **Still untested by a model:** whether agents write `opens=#x` flows correctly. Three interaction prompts were added to the eval for when it runs.

**Not done / needs a decision**
- **Accuracy eval against a real model.** The harness and offline scoring exist; no API key is available here and a run costs money. Until it runs, the DSL being the primary format is provisional.
- **"Agent sees the HTML structure" beyond the outline.** `outline()` works from DSL source. A DOM-based outline (reading rendered `mk-*` elements) is not built; the DOM already carries `role`, `name` and `note`, so it would be small.
- **Firefox and WebKit, visual regression, Angular and Svelte consumers, CI.** Listed in docs/TESTING.md.
- **Brand-new composites beyond the six recipes.** Add only when a measured pattern repeats.
