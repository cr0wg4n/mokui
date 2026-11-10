# Using Mokui from an agent

Mokui exists so an agent and a human can share a concrete picture of a UI next to written requirements. Requirements say what and why; the mock shows shape and structure. This is the loop an agent should follow.

## 1. Load the reference once
```
nub exec mokui cheatsheet        # or: import { cheatsheet } from 'mokui/core'
```
About 1,500 tokens by default, generated from the registry, so it always matches the code. Put it in the system prompt or context once per session.

### Packs: load only what the screen needs
The default sheet covers `core` and `overlay` (about 1,500 tokens) and ends with one line that lists the other tags by pack. The parser accepts every tag regardless, so an agent can use `chart` or `alert` straight from that index line, but its attributes are only documented when the pack is loaded:
```
nub exec mokui cheatsheet data feedback     # add the packs the requirements mention
nub exec mokui cheatsheet all               # everything, about 2,200 tokens
```
Rule of thumb: dashboards need `data` and `feedback`, sign-up flows need `forms` and `nav` (`steps`), marketing pages need `nav` (`hero`, `footer`), mobile screens need `nav` (`tabbar`).

## 2. Write the mock beside the requirements
```
// REQ-3: user signs in with email and password
stack g=lg p=lg #login
  icon user
  text xl bold "Welcome back"
  input email label="Email" #email "you@x.com"
  input password label="Password" #password "Password"
  button primary full #submit note="REQ-3: POST /login, then go to dashboard" "Sign in"
```
- `#name` gives an element a stable identifier.
- `note="..."` ties an element to a requirement. Use requirement ids so a reader can trace both ways.
- Prefer recipes (`card`, `navbar`, `table`, `list`) and `grid min=md` for responsive layout. They cost the fewest tokens.
- **Show interactions when the requirements describe them.** "Clicking Delete asks for confirmation" is `button opens=#confirm` plus a `modal #confirm`. A mock that cannot show a dialog, menu or collapsible sidebar leaves half the requirements unrepresented.
- Put overlays inside the `frame` they belong to (`frame mobile` ... `drawer #nav left "Menu"`), otherwise they cover the whole container.

## 3. Validate: errors are cheap to fix
Every problem is reported at once with a line number and the valid options:
```
line 3: <row> g="huge" invalid. Valid: none xs sm md lg xl
line 5: unknown tag "btn". Valid: stack row grid ...
```
Fix all lines in one pass instead of one error per round trip.

## 4. Read the structure
```
nub exec mokui outline mock.mk
```
Output: the canonical tree (recipes kept as written), then an inventory of every interactive element, the **interactions** (`button "Invite" #invite-btn -> opens #invite`), the **states** that exist (`modal "Invite teammate" #invite (starts closed)`), and the requirement notes. Compare it with the requirements: every button, field and flow in the text should have a counterpart, every "when the user clicks X, Y appears" should be an interaction, and nothing extra should be there.

In a browser, the rendered DOM is also readable: every control carries a `role` attribute, and `name` / `note` are on the elements.

## 5. See it
```
nub exec mokui render mock.mk -o mock.png -w 390     # phone width
nub exec mokui render mock.mk -o mock-wide.png -w 1000
```
Render at two widths to check responsive behavior. **Render each state you care about**: overlays are hidden in the base picture, so draw them open:
```
nub exec mokui render mock.mk -o invite.png --open invite
nub exec mokui render mock.mk -o menu-dark.png --open more --theme dark
```
The `states` section of the outline lists the names you can pass to `--open`. Rendering needs the optional `playwright` package (`nub add -D playwright && nub exec playwright install chromium`). The DSL is validated before the browser starts.

## 6. Iterate
Change only the lines that need changing. The format is line-based, so edits are small diffs.

## Fidelity
The default look is modern and polished, which makes drafts pleasant to review. For an early, structure-only conversation use `theme=wire` (plain boxes, no shadows) so nobody mistakes the draft for a design. `theme=dark` checks the same screen in a dark UI.

To match a brand, do not hand-write colors: pick an accent (`accent=indigo`), or generate a theme from the brand color and use it by name:
```
nub exec mokui theme "#e11d48" --name brand > brand.json
nub exec mokui render mock.mk -o out.png --theme-file brand.json
```
`accent`, `radius` and `font` combine with any theme and survive nested themes, so `stack theme=dark accent=emerald radius=round` is one line. Invalid values are errors that list the valid ones.

## Conventions
- One mock per screen. Use `frame mobile|tablet|desktop` to show a device width.
- Use `//` comment lines for requirement context. They are ignored by the parser.
- Do not invent attributes or values. Unknown ones are errors by design, so the mock stays inside the shared vocabulary.
- Unknown icon names render a dashed placeholder and warn; use Lucide names.
- Reference errors are caught: `opens=#x` with no element named `x`, a duplicate `#name`, or a target that cannot open (`box`, `card`) is an error with a line number.
- Use `#name` on anything referenced, and `note="REQ-12: ..."` on anything that traces to a requirement.
