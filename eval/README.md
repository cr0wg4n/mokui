# Agent accuracy eval

Measures the question that matters most: can a model write valid, complete Mokui DSL from written requirements, given only the generated cheat sheet?

## Status
The harness is built and its scoring is unit-tested offline (`tests/unit/eval-score.test.ts`). **It has not been run against a real model yet.** It needs `ANTHROPIC_API_KEY` and costs API tokens, so it is run deliberately:
```
ANTHROPIC_API_KEY=... nub run eval          # EVAL_MODEL overrides the default model
```
Results are written to `eval/RESULTS.md`.

## Packs
The runner documents every pack (`cheatsheet({ packs: 'all' })`, about 2,200 tokens) so the eval measures writing the DSL, not remembering to load a pack. Set `EVAL_PACKS=default` to evaluate the cheaper core + overlay sheet (about 1,500 tokens) and see how well a model copes when the tags it needs are only listed in the index line.

## What it sends
Only the synthetic prompts in `prompts.json` plus the cheat sheet. No project code or personal data.

## Method
- 18 requirement prompts (login, dashboard, settings, product list, profile form, admin table, pricing, mobile feed, checkout, onboarding tabs, inbox, media controls, and three interaction prompts: delete-confirm modal, app shell with collapsible sidebar, actions dropdown with a toast; and three for the wider element set: an analytics dashboard with charts, a sign-up form with validation, a mobile inbox with tab bar and bottom sheet).
- Each has expectations: minimum counts per tag, alternatives (`anyOf`), required text, optional note requirement.
- **Valid** = parses and validates against the registry. **Complete** = valid and meets the expectations.
- Recipes count as written; if a recipe is not written, its primitives count.
- Each prompt gets a first try, then one repair round that feeds back either the line-numbered errors or the missing items. This approximates a real agent loop.

## Reading results
Per prompt: first-try valid / complete, and valid / complete after one repair. If first-try validity is low, the vocabulary or cheat sheet is too hard. If complete is low but valid is high, the cheat sheet is not teaching enough about what to include.

## Limits
- 18 prompts is a small sample; run several models and repeats before concluding.
- Completeness checks are structural, not visual: they do not judge whether the layout is good.
- No baseline yet for HTML or Tailwind accuracy. Token savings only matter if accuracy is comparable.
