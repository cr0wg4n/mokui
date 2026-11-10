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
    const open = async (width: number) => {
      const { server, url } = await serve(join(root, 'examples', app, 'dist'))
      const page = await browser.newPage({ viewport: { width, height: 900 } })
      const errors: string[] = []
      page.on('pageerror', (e) => errors.push(e.message))
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
      await page.goto(url)
      await page.waitForSelector('#inline')
      return { page, errors, close: async () => (await page.close(), server.close()) }
    }
    const cols = (page: import('playwright').Page) =>
      page.evaluate(() => getComputedStyle(document.querySelector('#from-file mk-grid')!).gridTemplateColumns.split(' ').length)

    it('renders custom elements with shadow roots and no errors', async () => {
      const { page, errors, close } = await open(1000)
      expect(await page.evaluate(() => !!document.querySelector('#from-file mk-icon')!.shadowRoot)).toBe(true)
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('#inline')!).gap)).toBe('12px')
      expect(await page.evaluate(() => document.querySelector('#inline mk-text')!.textContent)).toMatch(/Written as/)
      expect(errors).toEqual([])
      await close()
    })
    it('.mk import goes through the Vite plugin and responds to container width', async () => {
      const wide = await open(1000)
      expect(await cols(wide.page)).toBe(3)
      await wide.close()
      const narrow = await open(500)
      expect(await cols(narrow.page)).toBe(1)
      await narrow.close()
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
