import { v } from '../../theme/scale'
import { A, line } from '../shared'
import { inPack, type TagSpec } from '../types'
import { closeButton, openFlag, overlayPanel } from './kit'

/** Dialogs over a backdrop, and toasts. */
export const dialogs: TagSpec[] = inPack('overlay', [
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
      side: {
        doc: 'which edge',
        bare: true,
        rules: {
          left: 'justify-content:flex-start',
          right: 'justify-content:flex-end',
          top: 'flex-direction:column;justify-content:flex-start;align-items:stretch',
          bottom: 'flex-direction:column;justify-content:flex-end;align-items:stretch',
        },
      },
      label: { doc: 'drawer title', free: true },
      w: A.w,
      open: openFlag('display:flex'),
    },
    extra: overlayPanel + `:host([side="top"]) .panel,:host([side="bottom"]) .panel{width:auto;max-height:70%;border-width:1px 0 0 0;border-radius:16px 16px 0 0}:host([side="top"]) .panel{border-width:0 0 1px 0;border-radius:0 0 16px 16px}.panel{width:min(var(--mk-drawer-w,340px),85%);max-height:none;border-radius:0;border-width:0 0 0 1px}:host([side="left"]) .panel{border-width:0 1px 0 0}`,
  },
  {
    tag: 'toast',
    doc: 'small notification in the corner; quoted string is the message',
    role: 'status',
    stateful: true,
    css: `display:none;align-items:center;gap:12px;position:absolute;right:16px;bottom:16px;z-index:60;min-width:240px;max-width:calc(100% - 32px);padding:12px 12px 12px 16px;border:${line};border-radius:${v('r')};background:${v('bg')};box-shadow:${v('shadow-lg')};font-size:var(--mk-f-md,15px)`,
    attrs: { open: openFlag('display:flex') },
    extra: '.msg{flex:1}' + closeButton,
  },
])
