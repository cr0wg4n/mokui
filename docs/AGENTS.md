# Using Mokui from an agent

Mokui exists so an agent and a human can share a concrete picture of a UI next to written requirements. Requirements say what and why; the mock shows shape and structure. This is the loop an agent should follow.

## 1. Load the reference once
```
nub exec mokui cheatsheet        # or: import { cheatsheet } from 'mokui/core'
```
About 960 tokens, generated from the registry, so it always matches the code. Put it in the system prompt or context once per session.

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
- Prefer recipes (`card`, `navbar`, `tabs`, `table`, `list`) and `grid min=md` for responsive layout. They cost the fewest tokens.

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
Output has three parts: the canonical tree (recipes kept as written), an inventory of every interactive element with its label and name, and a list of requirement notes. Compare the inventory with the requirements: every button, field and flow in the text should have a counterpart, and nothing extra should be there.

In a browser, the rendered DOM is also readable: every control carries a `role` attribute, and `name` / `note` are on the elements.

## 5. See it
```
nub exec mokui render mock.mk -o mock.png -w 390     # phone width
nub exec mokui render mock.mk -o mock-wide.png -w 1000
```
Render at two widths to check responsive behavior. Rendering needs the optional `playwright` package (`nub add -D playwright && nub exec playwright install chromium`). The DSL is validated before the browser starts.

## 6. Iterate
Change only the lines that need changing. The format is line-based, so edits are small diffs.

## Conventions
- One mock per screen. Use `frame mobile|tablet|desktop` to show a device width.
- Use `//` comment lines for requirement context. They are ignored by the parser.
- Do not invent attributes or values. Unknown ones are errors by design, so the mock stays inside the shared vocabulary.
- Unknown icon names render a dashed placeholder and warn; use Lucide names.
