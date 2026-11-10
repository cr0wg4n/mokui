import { mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import { tmpdir } from 'node:os'
import { extname, join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { build } from 'vite'
import { chromium, type Browser } from 'playwright'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const root = process.cwd()
const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }
const serve = (dir: string) =>
  new Promise<{ server: Server; url: string }>((resolve) => {
    const server = createServer((req, res) => {
      try {
        const p = join(dir, req.url === '/' ? 'index.html' : req.url!.split('?')[0]!)
        res.setHeader('content-type', types[extname(p)] ?? 'application/octet-stream')
        res.end(readFileSync(p))
      } catch {
        res.statusCode = 404
        res.end()
      }
    }).listen(0, () => resolve({ server, url: `http://localhost:${(server.address() as { port: number }).port}` }))
  })

let browser: Browser
beforeAll(async () => {
  browser = await chromium.launch()
})
afterAll(() => browser?.close())

for (const app of ['vue', 'react']) {
  describe(`${app} consumer`, () => {
    const open = async (width = 1200) => {
      const { server, url } = await serve(join(root, 'examples', app, 'dist'))
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      await page.goto(url)
      await page.waitForSelector('#stage mk-sidebar')
      return { page, errors, close: async () => (await page.close(), server.close()) }
    }
    type Page = import('playwright').Page
    const modalDisplay = (page: Page) => page.evaluate(() => getComputedStyle(document.querySelector('#stage mk-modal')!).display)
    const gridCols = (page: Page, sel: string) =>
      page.evaluate((s) => getComputedStyle(document.querySelector(s)!).gridTemplateColumns.split(' ').length, sel)

    it('renders the showcase as custom elements with shadow roots and no console errors', async () => {
      const { page, errors, close } = await open()
      expect(await page.evaluate(() => !!document.querySelector('#stage mk-icon')!.shadowRoot)).toBe(true)
      expect(await page.evaluate(() => document.querySelectorAll('#stage *').length)).toBeGreaterThan(150)
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('#stage mk-button[variant=primary]')!).backgroundColor)).toBe('rgb(24, 24, 27)')
      expect(errors).toEqual([])
      await close()
    })
    it('every example renders without errors', async () => {
      const { page, errors, close } = await open()
      const ids = await page.$$eval('#example option', (os) => os.map((o) => (o as HTMLOptionElement).value))
      expect(ids).toEqual(['showcase', 'analytics', 'forms', 'mobile', 'landing', 'gallery'])
      for (const id of ids) {
        await page.selectOption('#example', id)
        await page.waitForFunction(() => document.querySelectorAll('#stage *').length > 20)
        expect(await page.evaluate(() => document.querySelectorAll('#stage mk-icon, #stage mk-text, #stage mk-box, #stage mk-stack').length), id).toBeGreaterThan(5)
      }
      expect(errors).toEqual([])
      await close()
    })
    it('clicks work: triggers declared in a .mk file open and close the modal, the sidebar toggles', async () => {
      const { page, errors, close } = await open()
      expect(await modalDisplay(page)).toBe('none')
      await page.click('#stage mk-button[opens=invite]')
      expect(await modalDisplay(page)).toBe('flex')
      await page.evaluate(() => (document.querySelector('#stage mk-modal mk-button[closes]') as HTMLElement).click())
      expect(await modalDisplay(page)).toBe('none')
      const sidebar = () => page.evaluate(() => getComputedStyle(document.querySelector('#stage mk-sidebar')!).display)
      expect(await sidebar()).toBe('flex')
      await page.click('#stage mk-button[toggles=nav]')
      expect(await sidebar()).toBe('none')
      expect(errors).toEqual([])
      await close()
    })
    it('tabs and dropdowns inside injected markup respond to clicks', async () => {
      const { page, close } = await open()
      const panelVisible = (i: number) => page.evaluate((n) => getComputedStyle(document.querySelectorAll('#stage mk-tab')[n]!).display !== 'none', i)
      expect(await panelVisible(0)).toBe(true)
      expect(await panelVisible(1)).toBe(false)
      await page.evaluate(() => (document.querySelectorAll('#stage mk-tabs')[0]!.shadowRoot!.querySelectorAll('.tabbtn')[1] as HTMLElement).click())
      expect(await panelVisible(1)).toBe(true)
      await page.click('#stage mk-dropdown mk-button')
      expect(await page.evaluate(() => document.querySelector('#stage mk-dropdown')!.hasAttribute('open'))).toBe(true)
      await close()
    })
    it('breakpoints follow the container width', async () => {
      const wide = await open(1200)
      await wide.page.selectOption('#example', 'analytics')
      await wide.page.waitForSelector('#stage mk-chart')
      expect(await gridCols(wide.page, '#stage mk-grid[cols-md="3"]')).toBe(3)
      await wide.close()
      const narrow = await open(500)
      await narrow.page.selectOption('#example', 'analytics')
      await narrow.page.waitForSelector('#stage mk-chart')
      expect(await gridCols(narrow.page, '#stage mk-grid[cols-md="3"]')).toBe(1)
      await narrow.close()
    })
    it('the width slider and the theme select change the picture', async () => {
      const { page, close } = await open(1200)
      const stageWidth = () => page.evaluate(() => Math.round(document.querySelector('#stage')!.getBoundingClientRect().width))
      expect(await stageWidth()).toBeGreaterThan(1000)
      await page.fill('#width', '600')
      expect(await stageWidth()).toBe(600)
      await page.selectOption('#theme', 'dark')
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('#stage')!).backgroundColor)).toBe('rgb(9, 9, 11)')
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('#stage mk-text')!).color)).toBe('rgb(250, 250, 250)')
      await page.selectOption('#theme', 'wire')
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('#stage mk-box')!).borderRadius)).toBe('4px')
      await close()
    })
    it('accent, radius and font controls re-skin the screen, in light and dark, and reset cleanly', async () => {
      const { page, errors, close } = await open(1200)
      const look = () =>
        page.evaluate(() => {
          const b = getComputedStyle(document.querySelector('#stage mk-button[variant=primary]')!)
          return { bg: b.backgroundColor, radius: getComputedStyle(document.querySelector('#stage mk-box')!).borderRadius, font: b.fontFamily }
        })
      const base = await look()
      expect(base).toMatchObject({ bg: 'rgb(24, 24, 27)', radius: '12px' })
      await page.selectOption('#accent', 'indigo')
      expect((await look()).bg).toBe('rgb(79, 70, 229)')
      await page.selectOption('#radius', 'sharp')
      expect((await look()).radius).toBe('2px')
      await page.selectOption('#font', 'serif')
      expect((await look()).font).toContain('Georgia')
      await page.selectOption('#theme', 'dark')
      expect((await look()).bg).toBe('rgb(129, 140, 248)') // the lighter indigo for a dark surface
      expect((await look()).radius).toBe('2px')
      await page.selectOption('#accent', '')
      await page.selectOption('#radius', '')
      await page.selectOption('#font', '')
      await page.selectOption('#theme', 'modern')
      expect(await look()).toEqual(base)
      expect(errors).toEqual([])
      await close()
    })
    it('framework state drives Mokui elements written as plain tags', async () => {
      const { page, errors, close } = await open()
      const read = () => page.evaluate(() => ({
        progress: document.querySelector('#reactive mk-progress')!.getAttribute('aria-valuenow'),
        stars: document.querySelectorAll('#reactive mk-rating')[0]!.shadowRoot!.querySelectorAll('svg[fill=currentColor]').length,
        badge: document.querySelector('#reactive mk-badge')!.textContent,
        warn: document.querySelector('#reactive mk-badge')!.getAttribute('variant'),
      }))
      expect(await read()).toEqual({ progress: '60', stars: 3, badge: '60%', warn: null })
      await page.fill('#seats', '90')
      expect(await read()).toEqual({ progress: '90', stars: 5, badge: '90%', warn: 'warning' })
      expect(errors).toEqual([])
      await close()
    })
    it('native events on elements work: a click handler updates framework state, a chip removes itself', async () => {
      const { page, close } = await open()
      await page.click('#reactive mk-button')
      await page.click('#reactive mk-button')
      expect(await page.evaluate(() => document.querySelector('#reactive mk-button')!.textContent)).toBe('Clicked 2 times')
      expect(await page.evaluate(() => document.querySelectorAll('#reactive mk-chip').length)).toBe(3)
      await page.click('#reactive mk-chip')
      expect(await page.evaluate(() => Array.from(document.querySelectorAll('#reactive mk-chip')).map((c) => c.textContent))).toEqual(['research', 'launch'])
      await close()
    })
  })
}

describe('tree-shaking', () => {
  const bundle = async (code: string) => {
    const dir = mkdtempSync(join(tmpdir(), 'mokui-ts-'))
    writeFileSync(join(dir, 'entry.js'), code)
    const out = (await build({
      root: dir,
      logLevel: 'silent',
      configFile: false,
      resolve: { alias: { 'mokui/core': join(root, 'dist/core.js'), mokui: join(root, 'dist/index.js') } },
      build: { write: false, minify: false, lib: { entry: join(dir, 'entry.js'), formats: ['es'], fileName: 'out' } },
    })) as { output: { code: string }[] }[]
    const code2 = out[0]!.output[0]!.code
    return { code: code2, gz: gzipSync(code2).length }
  }
  it('mokui/core ships no elements and no icons', async () => {
    const { code } = await bundle("import { html } from 'mokui/core'; console.log(html('row'))")
    expect(code).not.toContain('customElements')
    expect(code).not.toContain('M10.268 21') // bell icon path
  })
  it('core is much smaller than the full import', async () => {
    const core = await bundle("import { html } from 'mokui/core'; console.log(html('row'))")
    const full = await bundle("import 'mokui'")
    expect(full.code).toContain('customElements')
    expect(core.gz).toBeLessThan(full.gz)
    console.log(`bundle gzip: core import ${core.gz} B, full import ${full.gz} B`)
  })
})
