# Mokui Constitution

The founding principles of Mokui. Every feature, API, and contribution must be consistent with this document. When in doubt, this file wins.

## 1. Purpose

Mokui is a **framework-agnostic, token-cheap way to mock UI**. It exists to *draft* interfaces: lay out and distribute elements, choose icons, set font sizes and spacing, and iterate on structure before any real implementation exists.

It is designed first for **AI agentic flows** (an agent drafting a UI in a handful of tokens) and second for humans. It must work the same regardless of whether the target app is Vue, React, Angular, Svelte, or plain HTML.

A mock is a **communication artifact**: it sits next to written requirements and gives humans and agents a shared, concrete picture of what is needed. Requirements say *what and why*; the mock shows *shape and structure*. Neither is complete alone.

## 2. Core Principles

### 2.1 Token economy is a feature
- The cost of expressing a UI is the primary metric. A mock should be describable in the fewest tokens that remain unambiguous.
- Prefer terse, regular, predictable syntax over verbose or clever syntax. Short keywords, consistent shapes, no boilerplate.
- Output (what the agent reads back) is as important as input. Errors, previews, and introspection must be compact.
- Any addition that increases the average token cost of a typical mock must justify itself against this principle.

### 2.2 Framework-agnostic by construction
- Mokui never depends on, imports, or assumes Vue, React, Angular, Svelte, or any UI framework.
- The core is plain TypeScript/JavaScript producing framework-neutral output (DOM / custom elements / HTML+CSS). Framework adapters, if ever needed, are thin and optional, never required.
- A mock written once must be usable in any Vite project, unchanged.

### 2.3 One dependency, zero friction
- Users install **a single package** and it works. No peer dependencies, no companion packages, no required config files.
- Vite integration is a plugin or a simple import; the default setup is one line.
- Mokui's own runtime dependencies stay at zero or as close to it as possible. Every added dependency requires explicit justification.

### 2.4 Draft, not production
- Mokui is for sketching: layout, hierarchy, spacing, typography, iconography. It is **not** a component library, design system, or production renderer.
- Fidelity is intentionally low-to-medium. Do not chase pixel-perfection, animation, theming engines, or state logic.
- Mocks are disposable and replaceable. Making them easy to throw away is a goal.

### 2.5 Agent-first, human-readable
- The format must be easy for an LLM to **generate correctly on the first try** and easy to **edit surgically** (small diffs, stable structure).
- It must also be readable by a human at a glance.
- Deterministic: the same input always yields the same output. No randomness, no hidden state, no network.
- Constrained vocabulary beats open-ended vocabulary: a small, closed set of primitives, sizes, and tokens reduces hallucination and invalid output.

### 2.6 Shared understanding: intent, not just looks
- A mock must be readable by an agent as **structure**, not only as pixels. Every mock can be dumped as a compact outline (tree of elements, roles, names, notes) that an agent can match against written requirements.
- Elements may carry optional intent: a `name`, a `role`, and a short `note` (e.g. `note="shown after login"`). Intent is optional and must never be required to render.
- Agents get two views of the same mock: the rendered image and the structural outline. Both derive from one source, so they cannot disagree.

### 2.7 Composites are recipes, not components
- Common patterns (card, navbar, tabs, table, list) are important and supported, but as **recipes**: named compositions that expand into the same primitives. They add no new rendering path and no bespoke styling.
- A recipe is only added when it measurably saves tokens or reduces agent errors in real mocks.

## 3. Design Rules

### 3.1 Small closed vocabulary
- A minimal set of layout primitives (e.g. stack, row, grid, box, text, icon, image, input, button, spacer).
- Spacing, font size, and radius use **named scales** (e.g. `xs..xl`), not arbitrary pixel values, unless explicitly escaped.
- Icons are referenced by name from a fixed, bundled set. Unknown icon names fail clearly, never silently.

### 3.2 Declarative and flat
- Describe *what* the UI is, not *how* to render it. No logic, loops, or conditionals in the mock language.
- Prefer shallow, readable structure. Avoid deep nesting syntax that is costly or error-prone to generate.

### 3.3 Fail loud, fail small
- Invalid input produces a short, precise, actionable error (what, where, and the valid options).
- Never guess silently. Never produce partially broken output without saying so.

### 3.4 Self-describing
- Mokui can describe its own vocabulary in a compact, agent-consumable form (a "cheat sheet" an agent can load once for minimal tokens).
- Documentation and the cheat sheet are generated from the same source of truth as the code, so they cannot drift.

### 3.5 Visual neutrality
- Default styling is neutral, wireframe-like, and legible. It must never be mistaken for a final design.
- Styles are isolated so mocks do not leak into, or get altered by, the host app's CSS.

## 4. Non-Goals

Mokui will not:
- Become a full component library or design system. Recipes (section 2.7) expand to primitives; they are not a component library.
- Ship framework-specific component wrappers as a requirement.
- Include a state manager, router, data layer, or business logic.
- Require a build step beyond a standard Vite setup.
- Optimize for production performance or accessibility auditing of final UIs (it may offer sensible defaults, but it is a drafting tool).
- Add features whose main benefit is human convenience at the expense of token cost.

## 5. Engineering Standards

- **TypeScript**, strict mode, fully typed public API.
- **Tiny bundle size** is tracked and guarded; regressions fail CI.
- **Tree-shakeable** and side-effect-free where possible.
- **Tested on tokens too:** representative mocks have token-count benchmarks so cost regressions are visible.
- **Stable public API.** Breaking changes to the mock format are rare, versioned, and documented, since agents and prompts depend on them.
- Prefer deleting code over adding configuration.

## 6. Decision Framework

When evaluating a change, ask in order:

1. Does it keep Mokui **framework-agnostic**?
2. Does it keep the install at **one dependency, minimal setup**?
3. Does it **reduce or keep neutral** the token cost of a typical mock?
4. Can an **AI agent generate and edit it reliably**?
5. Does it stay within **drafting scope** (layout, icons, type, spacing)?

If any answer is "no", the change needs an explicit, documented exception, or it should not be made.

## 7. Amendments

This constitution may be amended only by an explicit, reviewed change to this file that states which principle is being changed and why. Code that contradicts this document is a bug in the code or an unrecorded amendment; resolve it one way or the other.
