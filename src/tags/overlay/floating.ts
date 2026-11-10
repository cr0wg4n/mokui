import { v } from '../../theme/scale'
import { A, line } from '../shared'
import { inPack, type TagSpec } from '../types'
import { openFlag } from './kit'

/** Anchored panels: dropdown, popover, menu, item, tooltip. */
export const floating: TagSpec[] = inPack('overlay', [
  {
    tag: 'dropdown',
    doc: 'first child is the trigger, then a menu; click the trigger to open',
    stateful: true,
    css: 'display:inline-block;position:relative;width:fit-content',
    attrs: { open: openFlag('') },
    extra: '::slotted(mk-menu){display:none}:host([open]) ::slotted(mk-menu){display:block}',
  },
  {
    tag: 'popover',
    doc: 'first child is the trigger; any other children form a floating panel opened by clicking it',
    stateful: true,
    css: 'display:inline-block;position:relative;width:fit-content',
    attrs: { open: openFlag('') },
    extra: `:host(:not([open])) ::slotted(:not(:first-child)){display:none}::slotted(:not(:first-child)){position:absolute;top:calc(100% + 6px);left:0;z-index:40;min-width:240px;padding:12px;border:${line};border-radius:${v('r')};background:${v('bg')};box-shadow:${v('shadow-lg')}}`,
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
])
