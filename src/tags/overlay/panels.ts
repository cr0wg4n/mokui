import { v } from '../../theme/scale'
import { A, line } from '../shared'
import { inPack, type TagSpec } from '../types'
import { openFlag } from './kit'

/** Panels that show and hide: sidebar, collapse, tabs. */
export const panels: TagSpec[] = inPack('overlay', [
  {
    tag: 'sidebar',
    doc: 'side navigation panel, visible unless `closed`; collapse with toggles=#name',
    role: 'navigation',
    stateful: true,
    stateAttr: 'closed',
    css: `display:flex;flex-direction:column;gap:4px;width:var(--mk-sidebar-w,240px);flex:none;padding:12px;border-right:${line};background:${v('bg')}`,
    attrs: { w: A.w, p: A.p, g: A.g, closed: { doc: 'start collapsed', flag: 'display:none' } },
  },
  {
    tag: 'collapse',
    doc: 'expandable section; quoted string is the title; click the title to toggle',
    stateful: true,
    text: 'label',
    css: `display:block;border-bottom:${line}`,
    attrs: { label: { doc: 'section title', free: true }, open: openFlag('') },
    extra: `.head{display:flex;align-items:center;gap:8px;padding:12px 0;font-weight:600;cursor:pointer}.title{flex:1}.chev{display:inline-flex;width:1.2em;height:1.2em;color:${v('muted')}}.chev svg{width:100%;height:100%}.body{display:none;padding:0 0 12px}:host([open]) .body{display:block}`,
  },
  {
    tag: 'tabs',
    doc: 'tab strip; children are `tab` panels, or quoted "A|B|C" for a strip only; click to switch',
    text: 'opts',
    css: 'display:block',
    attrs: { opts: { doc: 'labels separated by | (strip only)', free: true }, active: { doc: 'selected tab, 1-based', free: true } },
    extra: `.strip{display:flex;gap:4px;border-bottom:${line};overflow:auto}.tabbtn{padding:8px 12px;border:0;border-bottom:2px solid transparent;margin-bottom:-1px;background:transparent;color:${v('muted')};font:inherit;font-weight:500;cursor:pointer;white-space:nowrap}.tabbtn[aria-selected=true]{color:${v('fg')};border-bottom-color:${v('accent')}}`,
  },
  {
    tag: 'tab',
    doc: 'panel inside tabs; quoted string is its label',
    within: 'tabs',
    text: 'label',
    css: 'display:block;padding-top:12px',
    attrs: { label: { doc: 'tab label', free: true } },
  },
])
