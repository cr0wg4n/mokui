# Token benchmark

Measures the claim in [TECH_DECISIONS.md](../TECH_DECISIONS.md): the DSL is cheaper in tokens than HTML. Run `nub run bench`; results are written to [RESULTS.md](./RESULTS.md).

## Method
- Eight fixtures in `fixtures/`: login, dashboard, settings list, product list, profile form, admin table, pricing, and an app shell (sidebar, dropdown, tabs, table and a modal).
- Each has the same UI in four forms:
  1. **DSL** (`*.mk`): the source of truth. The benchmark compiles every fixture, so it also proves each one is valid against the registry.
  2. **mk HTML (compact)**: DSL compiled (recipes expanded) to custom elements on one line.
  3. **mk HTML (pretty)**: the same HTML, one tag per line and indented, which is how an LLM usually writes markup.
  4. **Tailwind HTML** (`*.tw.html`): hand-written, the most common alternative an agent would produce.
- Tokens counted with `gpt-tokenizer` (`o200k_base`).
- The cheat sheet is measured too, because the DSL (unlike HTML) must be taught to the model.

## Results

| Compared to | Token savings with DSL |
|---|---|
| mk HTML, compact | 53% |
| mk HTML, pretty | 63% |
| Tailwind HTML | 70% |

Totals over eight fixtures: DSL 1238, compact 2609, pretty 3305, Tailwind 4061. Recipes and overlays help most: the app shell is 358 tokens as DSL against 1474 as Tailwind (-76%), and the admin table is 132 against 536 (-75%). Plain control forms help least: the profile form is -66% vs Tailwind but only -36% vs compact mk HTML.

The app-shell Tailwind version is static markup (hidden dialog, hidden menu, `data-*` hooks). Making it actually interactive would need JavaScript that is not counted, so the real gap is larger than shown.

**Cheat sheet: 1,560 tokens by default (core + overlay), 2,239 with every pack.** The vocabulary grew from 1,320 tokens (before the feedback, data, forms and nav packs) because popover, link, status variants and more attributes joined the default packs; the new packs are only loaded on demand, which is why the default barely moved while the vocabulary roughly doubled. Average saving is 353 tokens per mock vs Tailwind, so the default sheet pays for itself after about 5 mocks in the same context (7 vs pretty mk HTML). For a single throwaway mock, plain HTML is cheaper; for an agent session that drafts several screens, the DSL wins. Prompt caching changes this further in the DSL's favor, since the cheat sheet is a stable prefix. The sheet can still be trimmed (for example merging `stack` and `row`, which have identical attribute lists).

Per-fixture numbers: [RESULTS.md](./RESULTS.md).

## Caveats (read before trusting the numbers)
- **Proxy tokenizer.** `o200k_base` is not Claude's tokenizer. Ratios should be similar but are unverified.
- **Fixtures were written by hand** by the author of the DSL. The Tailwind versions are plausible, not canonical. A fairer test would use mocks produced by a model from the same prompt in each format.
- **Output tokens only, no accuracy.** Fewer tokens is worthless if models write the DSL incorrectly more often than HTML. See [eval/README.md](../eval/README.md); that eval has not been run against a real model yet.
- **Eight fixtures** is a small sample.
- **Equivalence is approximate.** Tailwind markup carries semantics the DSL does not (and vice versa), and an agent might write less or more detail in either.

## Conclusion so far
The DSL remains the primary format. The savings are large and the cheat sheet cost is recovered within a few mocks, but the decision is still provisional until the accuracy eval shows models write it reliably.
