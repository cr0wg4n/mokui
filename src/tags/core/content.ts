import { v } from '../../theme/scale'
import { A, line, withBare } from '../shared'
import { inPack, type TagSpec } from '../types'

const sFont = withBare(A.s)
const tone = (t: 'success' | 'warning' | 'danger' | 'info') =>
  `background:color-mix(in srgb,${v(t)} 12%,${v('bg')});color:${v(t)};border-color:color-mix(in srgb,${v(t)} 35%,${v('line')})`

/** Content: text, links, icons, images, avatars and badges. */
export const content: TagSpec[] = inPack('core', [
  {
    tag: 'text',
    doc: 'text; quoted string is the content',
    css: `display:block;font-size:var(--mk-f-md,15px);line-height:1.5`,
    attrs: {
      s: sFont,
      bold: { doc: 'bold', flag: 'font-weight:650' },
      muted: { doc: 'secondary color', flag: `color:${v('muted')}` },
      center: { doc: 'center aligned', flag: 'text-align:center' },
    },
  },
  {
    tag: 'link',
    doc: 'inline link; quoted string is the text',
    role: 'link',
    css: `display:inline;color:${v('fg')};text-decoration:underline;text-decoration-color:${v('muted')};text-underline-offset:3px;font-size:var(--mk-f-md,15px)`,
    attrs: { s: sFont, muted: { doc: 'secondary color', flag: `color:${v('muted')}` } },
  },
  {
    tag: 'icon',
    doc: 'Lucide-named icon; first bare word is the name',
    css: 'display:inline-flex;width:1.5em;height:1.5em;flex:none',
    attrs: { n: { doc: 'icon name', free: true, bare: true, required: true }, s: sFont, muted: { doc: 'secondary color', flag: `color:${v('muted')}` } },
    extra: 'svg{width:100%;height:100%}',
  },
  {
    tag: 'image',
    doc: 'image placeholder; quoted string is the label',
    role: 'img',
    css: `display:flex;align-items:center;justify-content:center;aspect-ratio:4/3;width:var(--mk-z-lg,160px);max-width:100%;color:${v('muted')};font-size:var(--mk-f-sm,13px);border:${line};border-radius:${v('r')};overflow:hidden;background:linear-gradient(to top right,transparent calc(50% - .5px),${v('line')} 50%,transparent calc(50% + .5px)),linear-gradient(to top left,transparent calc(50% - .5px),${v('line')} 50%,transparent calc(50% + .5px)),${v('fill')}`,
    attrs: {
      w: A.w,
      h: A.h,
      ratio: {
        doc: 'aspect ratio',
        bare: true,
        rules: { '1:1': 'aspect-ratio:1/1', '4:3': 'aspect-ratio:4/3', '16:9': 'aspect-ratio:16/9', '3:4': 'aspect-ratio:3/4', '9:16': 'aspect-ratio:9/16' },
      },
    },
    extra: `slot{background:${v('fill')};padding:2px 8px;border-radius:999px}`,
  },
  {
    tag: 'avatar',
    doc: 'circular avatar; quoted string is the initials',
    css: `display:inline-flex;align-items:center;justify-content:center;width:2.5em;height:2.5em;flex:none;border-radius:50%;background:${v('fill')};color:${v('muted')};font-weight:600;font-size:var(--mk-f-sm,13px);overflow:hidden`,
    attrs: { s: sFont },
  },
  {
    tag: 'badge',
    doc: 'small pill label; quoted string is the content',
    css: `display:inline-flex;align-items:center;width:fit-content;padding:2px 10px;border-radius:999px;border:${line};background:${v('fill')};font-size:var(--mk-f-xs,11px);font-weight:600;letter-spacing:.01em`,
    attrs: {
      variant: {
        doc: 'style',
        bare: true,
        rules: {
          primary: `background:${v('accent')};color:${v('on-accent')};border-color:${v('accent')}`,
          success: tone('success'),
          warning: tone('warning'),
          error: tone('danger'),
          info: tone('info'),
        },
      },
    },
  },
])
