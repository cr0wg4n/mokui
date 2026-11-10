// DOM-free API: safe to import from Node (tooling, agents, CI).
export { parse, toHTML, MkError } from './dsl/parse'
export type { MkNode } from './dsl/parse'
export { compile, expand, html } from './dsl/compile'
export { print } from './dsl/print'
export { outline } from './outline'
export { cheatsheet } from './cheatsheet'
export { scale } from './scale'
