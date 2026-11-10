# Mokui

Framework-agnostic, token-cheap UI mocking for AI agents and humans. Draft layouts, spacing, type and icons in a tiny line-based DSL; render them as web components in any Vite project (Vue, React, Angular, Svelte, plain HTML).

```
stack g=lg p=lg
  navbar "Acme"
    icon bell
  grid cols=1 cols-md=3 g=md
    card "Visits"
      text xl bold "1,204"
  button primary opens=#confirm "Save"
  modal #confirm sm "Save changes?"
    row g=sm justify=end
      button ghost closes "Cancel"
      button primary closes "Confirm"
```

- **Cheap:** about 70% fewer tokens than the equivalent Tailwind HTML in our fixtures ([bench](./bench/README.md)).
- **Modern by default, easy to re-skin:** soft neutrals, rounded corners, subtle elevation. `theme=dark accent=indigo radius=round font=serif` on any element, a whole theme from one brand color (`mokui theme "#e11d48"`), or a theme file. A theme is data, not a template.
- **Interactive drafts:** `button opens=#invite`, modals, drawers, sidebars, dropdowns, tabs. Declared, not programmed, and validated.
- **Closed vocabulary, wide coverage:** 67 tags (layout, forms, overlays, charts, calendars, alerts, navigation...) in packs that cost tokens only when loaded. Unknown tags, attributes and values are errors with line numbers.
- **For agents:** generated cheat sheet, structural outline with notes, PNG render. See [docs/AGENTS.md](./docs/AGENTS.md).
- **One dependency, zero runtime deps.**

## Docs
- [CONSTITUTION.md](./CONSTITUTION.md): principles
- [TECH_DECISIONS.md](./TECH_DECISIONS.md): stack and architecture
- [ROADMAP.md](./ROADMAP.md): task list and status
- [docs/USAGE.md](./docs/USAGE.md): install, frameworks, theming, CLI
- [examples/](./examples/README.md): six screens shared by the playground, a Vue app and a React app
- [docs/AGENTS.md](./docs/AGENTS.md): how an agent should use Mokui
- [docs/TESTING.md](./docs/TESTING.md): test layers and coverage
- [bench/README.md](./bench/README.md), [eval/README.md](./eval/README.md): measurements

## Develop
```
nub install
nub exec playwright install chromium
nub run dev        # live playground: 6 examples (app, analytics, forms, mobile, landing, gallery)
nub run test       # unit, browser, e2e
nub run bench      # token benchmark
```
