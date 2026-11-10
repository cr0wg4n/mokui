# Token benchmark

Preliminary measurement of the claim in [TECH_DECISIONS.md](../TECH_DECISIONS.md): the indentation DSL is cheaper in tokens than HTML. Run with `nub run bench`; results are written to [RESULTS.md](./RESULTS.md).

## Method
- Four fixtures in `fixtures/`: login form, dashboard header with cards, settings list, product list.
- Each fixture has the same UI in four forms:
  1. **DSL** (`*.mk`): the source of truth.
  2. **mk HTML (compact)**: DSL compiled by `toHTML()`, single line. Equivalent by construction.
  3. **mk HTML (pretty)**: the same HTML, one tag per line and indented, which is how an LLM usually writes markup.
  4. **Tailwind HTML** (`*.tw.html`): hand-written, the most common alternative an agent would produce.
- Tokens counted with `gpt-tokenizer` (`o200k_base`).

## Results (summary)

| Compared to | Token savings with DSL |
|---|---|
| mk HTML, compact | about 44% |
| mk HTML, pretty | about 56% |
| Tailwind HTML | about 61% |

Totals across the four fixtures: DSL 484, compact HTML 857, pretty HTML 1111, Tailwind 1246. Per-fixture numbers are in [RESULTS.md](./RESULTS.md).

## Caveats (read before trusting the numbers)
- **Proxy tokenizer.** `o200k_base` is not Claude's tokenizer. Absolute counts will differ; the ratios should be similar but are unverified.
- **Fixtures were written by hand** by the author of the DSL. The Tailwind versions are plausible, not canonical. A fairer test would use mocks produced by an LLM from the same prompt in each format.
- **Cheat sheet cost is excluded.** The DSL is unfamiliar, so an agent needs its grammar and primitive list in context once. That one-time cost (not yet written or measured) offsets savings on small tasks and pays off over many mocks.
- **Output only.** Counts cover the mock itself, not agent reliability. Fewer tokens is worthless if models write the DSL incorrectly more often than HTML.
- **Four fixtures** is a small sample. Several fixtures use primitives not implemented yet (`grid`, `box`, `image`, `input`, `button`, `spacer`); they only affect syntax cost here.

## Conclusion so far
The DSL is a clear token win in this sample, so it stays as the primary format (decision still provisional). Next steps: measure the cheat sheet, and test generation accuracy with a real model.
