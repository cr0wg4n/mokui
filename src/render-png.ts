import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { html } from './dsl/compile'
import { themeStyle, type ThemeInput } from './theme/theme'

export interface RenderOptions {
  /** Container width in px (default 600). Breakpoints respond to this. */
  width?: number
  /** Output PNG path. */
  out: string
  /** Device scale factor (default 2). */
  scale?: number
  /** Names of stateful elements to draw open (modal, drawer, dropdown...). */
  open?: string[]
  /** Look: a theme name or theme options (base, accent, radius, font, tokens). */
  theme?: ThemeInput
}

/** Browser bundle sits next to this file's dist output: dist/browser/mokui.iife.js */
const bundle = () => {
  for (const rel of ['./browser/mokui.iife.js', '../dist/browser/mokui.iife.js']) {
    const p = fileURLToPath(new URL(rel, import.meta.url))
    if (existsSync(p)) return p
  }
  throw new Error('mokui browser bundle not found. Run `nub run build` first.')
}

/**
 * Render DSL to a PNG with headless Chromium (needs the optional `playwright` package).
 * The DSL is validated in Node first, so errors surface before a browser starts.
 */
export async function renderPng(src: string, opts: RenderOptions): Promise<void> {
  html(src, { open: opts.open }) // fail fast with line-numbered errors
  if (opts.theme) themeStyle(opts.theme) // and with a clear theme error
  let pw: typeof import('playwright')
  try {
    pw = await import('playwright')
  } catch {
    throw new Error('PNG rendering needs the optional "playwright" package: nub add -D playwright && nub exec playwright install chromium')
  }
  const width = opts.width ?? 600
  const browser = await pw.chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: width + 32, height: 800 }, deviceScaleFactor: opts.scale ?? 2 })
    await page.setContent(`<body style="margin:0;padding:16px;background:#fff"><div id="app" style="width:${width}px"></div></body>`)
    await page.addScriptTag({ path: bundle() })
    await page.evaluate(([s, o]) => (window as any).mokui.mount(document.getElementById('app')!, s, o), [src, { open: opts.open, theme: opts.theme }] as const)
    await page.locator('#app').screenshot({ path: opts.out })
  } finally {
    await browser.close()
  }
}
