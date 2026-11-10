# Adding a tag

Everything a tag needs lives in one pack folder under `src/tags/`. Pick the pack by what the tag is for: `core` (layout, content, basic controls), `overlay` (things that open and close), `forms`, `feedback`, `data`, `nav`.

## 1. A primitive (becomes a custom element)
Add its spec to a group file in the pack folder, or create a new group file. Specs are plain data:
```ts
// src/tags/feedback/primitives.ts
export const feedback: TagSpec[] = inPack('feedback', [
  {
    tag: 'meter',
    doc: 'level indicator; value 0-100',          // one line, shown in the cheat sheet
    css: `display:block;height:8px;border-radius:999px;background:${v('line')}`,
    attrs: { value: withBare({ doc: 'percent', free: true }) },
  },
  // ...
])
```
- `attrs` define what the parser accepts: `rules` is a closed set (value -> CSS), `flag` is a boolean, `free` is any text, `bare: true` lets it be a bare word, `responsive: true` adds `-sm|-md|-lg` variants.
- `text` says where the quoted string goes (`'ph'`, `'label'`, `'opts'`, or the element's content by default).
- Use the theme tokens (`v('accent')`, `v('line')`, ...) and never literal colors, so themes and `accent=` work.

## 2. A renderer, only if it needs shadow content
If the element is just a slot (a container), stop: it needs nothing else. Otherwise add a sibling `.render.ts` with the same base name as the spec file and register the tag there:
```ts
// src/tags/feedback/primitives.render.ts
export const feedbackRenderers: Record<string, Renderer> = {
  meter: {
    template: '<div class="bar"></div>',          // runs once
    update(el, root) { q(root, '.bar').style.width = `${el.getAttribute('value') ?? 0}%` },   // on connect and on attribute change
  },
}
```
Attributes in `attrs` are observed automatically, so `update` re-runs when they change. Spec files never import renderers; that is what keeps `mokui/core` free of DOM code.

## 3. A recipe (expands into primitives)
Add it to `recipes.ts` in the pack folder with an `expand` function that returns nodes (builders `n`, `txt`, `items`, `carry` are in `src/tags/recipe-kit.ts`). Recipes have no element and no renderer. If it expands to something that can open and close (like `command` becomes a `modal`), mark it `stateful: true` so `opens=#name` validates.

## 4. Register and check
- A new group file only needs to be added to `src/tags/index.ts` (`primitives` or `recipes`); a new renderer file to `src/tags/renderers.ts`.
- The pack's cheat sheet line is generated; nothing to write.
- Add the tag to a playground example (`examples/screens/*.mk`): a test requires the examples to use most of the vocabulary.
- Tests: add cases to `tests/unit/extras.test.ts` (parsing, validation, recipe expansion) and `tests/browser/extras.test.ts` (how it renders). Then run `nub run test`: `tests/unit/structure.test.ts` fails if the spec is in the wrong pack folder, is not registered, if a recipe has a renderer, or if a renderer has no spec file next to it.
- Update the pack table in `docs/USAGE.md`.

## Cost to remember
Every tag adds cheat-sheet tokens for the pack it joins (`nub run bench` prints the default and the full cost). Keep `doc` to one short line and prefer extending an existing tag with an attribute over adding a new one.
