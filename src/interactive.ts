import { A, type TagSpec } from './registry'
import { v } from './scale'

const line = `1px solid ${v('line')}`
const openFlag = (css: string) => ({ doc: 'start open', flag: css })
const x = `.x{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:${v('muted')};padding:0}.x:hover{background:${v('fill')}}.x svg{width:16px;height:16px}`

const overlayPanel =
  `.panel{display:flex;flex-direction:column;gap:12px;width:min(var(--mk-modal-w,480px),100%);max-height:100%;overflow:auto;padding:20px;border:${line};border-radius:16px;background:${v('bg')};box-shadow:${v('shadow-lg')}}` +
  `.head{display:flex;align-items:center;gap:12px}.title{flex:1;font-size:var(--mk-f-lg,18px);font-weight:650}.body{display:flex;flex-direction:column;gap:12px}` +
  x

export const interactive: TagSpec[] = [
  {
    tag: 'modal',
    doc: 'dialog over a backdrop; quoted string is the title; opened by opens=#name',
    role: 'dialog',
    text: 'label',
    stateful: true,
    overlay: true,
    css: `display:none;position:absolute;inset:0;z-index:50;overflow:auto;align-items:center;justify-content:center;padding:24px;background:${v('backdrop')}`,
    attrs: {
      size: { doc: 'dialog width', bare: true, rules: { sm: '--mk-modal-w:360px', md: '--mk-modal-w:480px', lg: '--mk-modal-w:640px' } },
      label: { doc: 'dialog title', free: true },
      open: openFlag('display:flex'),
    },
    extra: overlayPanel,
  },
  {
    tag: 'drawer',
    doc: 'panel sliding over a backdrop from a side; quoted string is the title',
    role: 'dialog',
    text: 'label',
    stateful: true,
    overlay: true,
    css: `display:none;position:absolute;inset:0;z-index:50;overflow:hidden;align-items:stretch;justify-content:flex-end;background:${v('backdrop')}`,
    attrs: {
      side: { doc: 'which edge', bare: true, rules: { left: 'justify-content:flex-start', right: 'justify-content:flex-end' } },
      label: { doc: 'drawer title', free: true },
      w: A.w,
      open: openFlag('display:flex'),
    },
    extra: overlayPanel + `.panel{width:min(var(--mk-drawer-w,340px),85%);max-height:none;border-radius:0;border-width:0 0 0 1px}:host([side="left"]) .panel{border-width:0 1px 0 0}`,
  },
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
    tag: 'dropdown',
    doc: 'first child is the trigger, then a menu; click the trigger to open',
    stateful: true,
    css: 'display:inline-block;position:relative;width:fit-content',
    attrs: { open: openFlag('') },
    extra: '::slotted(mk-menu){display:none}:host([open]) ::slotted(mk-menu){display:block}',
  },
  {
    tag: 'menu',
    doc: 'popup list of items inside a dropdown',
    within: 'dropdown',
    role: 'menu',
    css: `position:absolute;top:calc(100% + 6px);left:0;z-index:40;min-width:200px;padding:6px;border:${line};border-radius:${v('r')};background:${v('bg')};box-shadow:${v('shadow-lg')}`,
    attrs: { end: { doc: 'align to the right edge', flag: 'left:auto;right:0' } },
  },
  {
    tag: 'item',
    doc: 'row for menus and navigation; quoted string is the label',
    role: 'menuitem',
    css: `display:flex;align-items:center;gap:10px;padding:8px 12px;border-radius:8px;font-size:var(--mk-f-md,15px);line-height:1.4;color:${v('fg')}`,
    attrs: {
      icon: { doc: 'leading icon name', free: true },
      active: { doc: 'current item', flag: `background:${v('fill')};font-weight:600` },
      danger: { doc: 'destructive item', flag: `color:${v('danger')}` },
    },
    extra: `.ico{display:inline-flex;width:1.2em;height:1.2em;color:${v('muted')}}.ico svg{width:100%;height:100%}:host(:hover){background:${v('fill')}}`,
  },
  {
    tag: 'tooltip',
    doc: 'hover hint; quoted string is the hint; wraps one child',
    text: 'tip',
    css: 'display:inline-block;position:relative;width:fit-content',
    attrs: { tip: { doc: 'hint text', free: true }, open: openFlag('') },
    extra: `.tip{display:none;position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);z-index:60;white-space:nowrap;padding:5px 9px;border-radius:6px;background:${v('fg')};color:${v('bg')};font-size:var(--mk-f-xs,11px);font-weight:500}:host(:hover) .tip,:host([open]) .tip{display:block}`,
  },
  {
    tag: 'toast',
    doc: 'small notification in the corner; quoted string is the message',
    role: 'status',
    stateful: true,
    css: `display:none;align-items:center;gap:12px;position:absolute;right:16px;bottom:16px;z-index:60;min-width:240px;max-width:calc(100% - 32px);padding:12px 12px 12px 16px;border:${line};border-radius:${v('r')};background:${v('bg')};box-shadow:${v('shadow-lg')};font-size:var(--mk-f-md,15px)`,
    attrs: { open: openFlag('display:flex') },
    extra: '.msg{flex:1}' + x,
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
]
