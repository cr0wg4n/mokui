import { v } from '../../theme/scale'
import { A, line } from '../shared'
import { inPack, type TagSpec } from '../types'

/** A month grid. */
export const calendarTag: TagSpec[] = inPack('data', [
  {
    tag: 'calendar',
    doc: 'month grid; month="2026-11" (default), value=day, range="12-18"',
    css: `display:block;width:fit-content;padding:12px;border:${line};border-radius:${v('r')};background:${v('bg')};box-shadow:${v('shadow')};font-size:var(--mk-f-sm,13px)`,
    attrs: {
      month: { doc: 'YYYY-MM', free: true },
      value: { doc: 'selected day', free: true },
      range: { doc: 'highlighted days, e.g. 12-18', free: true },
    },
    extra: `.head{display:flex;align-items:center;justify-content:space-between;padding:4px 4px 8px;font-weight:650;font-size:var(--mk-f-md,15px)}.g{display:grid;grid-template-columns:repeat(7,36px);gap:2px}.g span{display:flex;align-items:center;justify-content:center;height:36px;border-radius:8px}.g .dow{height:28px;color:${v('muted')};font-weight:500}.g .out{color:${v('muted')};opacity:.5}.g .in{background:${v('fill')};border-radius:0}.g .sel{background:${v('accent')};color:${v('on-accent')};font-weight:650}`,
  },
])
