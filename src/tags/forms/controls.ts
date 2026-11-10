import { v } from '../../theme/scale'
import { A, line, num } from '../shared'
import { inPack, type TagSpec } from '../types'

/** Segmented control, file drop zone and one-time code. */
export const formControls: TagSpec[] = inPack('forms', [
  {
    tag: 'segmented',
    doc: 'segmented control; quoted "A|B|C"; active=N (1-based); click to switch',
    role: 'tablist',
    text: 'opts',
    css: 'display:inline-block;width:fit-content',
    attrs: { opts: { doc: 'options separated by |', free: true }, active: { doc: 'selected option, 1-based', free: true } },
    extra: `.seg{display:inline-flex;gap:2px;padding:3px;border-radius:${v('r-sm')};background:${v('fill')}}.sb{padding:6px 14px;border:0;border-radius:6px;background:transparent;color:${v('muted')};font:inherit;font-size:var(--mk-f-md,15px);font-weight:500;cursor:pointer;white-space:nowrap}.sb[aria-selected=true]{background:${v('bg')};color:${v('fg')};box-shadow:${v('shadow')}}`,
  },
  {
    tag: 'upload',
    doc: 'file drop zone; quoted string is the prompt',
    text: 'label',
    css: `display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;padding:24px;border:2px dashed ${v('line')};border-radius:${v('r')};background:${v('bg')};text-align:center;color:${v('muted')};font-size:var(--mk-f-md,15px)`,
    attrs: { label: { doc: 'prompt', free: true }, w: A.w },
    extra: `.ico{display:inline-flex;width:28px;height:28px}.ico svg{width:100%;height:100%}.t{color:${v('fg')};font-weight:500}.s{font-size:var(--mk-f-sm,13px)}`,
  },
  {
    tag: 'otp',
    doc: 'one-time code boxes; otp 4|6; value="123"',
    css: 'display:inline-flex;gap:8px',
    attrs: { n: { doc: 'number of boxes', bare: true, rules: num([4, 5, 6]) }, value: { doc: 'digits typed so far', free: true } },
    extra: `.d{display:flex;align-items:center;justify-content:center;width:40px;height:48px;border:${line};border-radius:${v('r-sm')};background:${v('bg')};box-shadow:${v('shadow')};font-size:var(--mk-f-lg,18px);font-weight:600}`,
  },
])
