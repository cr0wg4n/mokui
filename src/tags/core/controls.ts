import { v } from '../../theme/scale'
import { A, line } from '../shared'
import { inPack, type AttrDef, type TagSpec } from '../types'

const dis: AttrDef = { doc: 'disabled look', flag: 'opacity:.45' }
const lbl: AttrDef = { doc: 'label above the control', free: true }
const fieldBox = 'display:flex;flex-direction:column;gap:6px;min-width:min(160px,100%);font-size:var(--mk-f-md,15px)'
const fieldCss =
  `.label{font-size:var(--mk-f-sm,13px);font-weight:500;color:${v('fg')}}` +
  `.field{display:flex;align-items:center;gap:8px;min-height:40px;padding:8px 12px;border:${line};border-radius:${v('r-sm')};background:${v('bg')};box-shadow:${v('shadow')}}` +
  `.field .ico{display:inline-flex;width:1.2em;height:1.2em;color:${v('muted')}}.field .ico svg{width:100%;height:100%}` +
  `.val{flex:1;color:${v('fg')}}.ph{flex:1;color:${v('muted')}}` +
  `.msg{font-size:var(--mk-f-sm,13px);color:${v('muted')}}.msg:empty{display:none}.msg.err{color:${v('danger')}}.field.err{border-color:${v('danger')}}`
const checkBox = `display:inline-block;width:16px;height:16px;border:1px solid ${v('muted')};background:${v('bg')};flex:none;position:relative`
const choice = 'display:inline-flex;align-items:center;gap:8px;font-size:var(--mk-f-md,15px)'

/** Form controls. */
export const controls: TagSpec[] = inPack('core', [
  {
    tag: 'button',
    doc: 'button; quoted string is the label',
    role: 'button',
    css: `display:inline-flex;align-items:center;justify-content:center;gap:8px;width:fit-content;padding:8px 16px;border:${line};border-radius:${v('r-sm')};background:${v('bg')};color:${v('fg')};box-shadow:${v('shadow')};font-size:var(--mk-f-md,15px);font-weight:500;line-height:1.4`,
    attrs: {
      variant: {
        doc: 'visual weight',
        bare: true,
        rules: {
          primary: `background:${v('accent')};color:${v('on-accent')};border-color:${v('accent')};box-shadow:none`,
          secondary: '',
          ghost: 'border-color:transparent;background:transparent;box-shadow:none',
          danger: `background:${v('danger')};color:#fff;border-color:${v('danger')};box-shadow:none`,
        },
      },
      s: {
        doc: 'size',
        bare: true,
        rules: {
          sm: 'padding:4px 10px;font-size:var(--mk-f-sm,13px)',
          md: 'padding:8px 16px;font-size:var(--mk-f-md,15px)',
          lg: 'padding:12px 24px;font-size:var(--mk-f-lg,18px)',
        },
      },
      icon: { doc: 'leading icon name', free: true },
      full: { doc: 'full width', flag: 'width:100%' },
      fab: { doc: 'floating round button in the bottom-right corner of the container', flag: `position:absolute;right:16px;bottom:16px;z-index:30;width:56px;height:56px;padding:0;border-radius:50%;background:${v('accent')};color:${v('on-accent')};border-color:${v('accent')};box-shadow:${v('shadow-lg')}` },
      disabled: dis,
    },
    extra: `.ico{display:inline-flex;width:1.2em;height:1.2em}.ico svg{width:100%;height:100%}:host(:hover){filter:brightness(.97)}`,
  },
  {
    tag: 'input',
    doc: 'text field; quoted string is the placeholder',
    role: 'textbox',
    text: 'ph',
    css: fieldBox,
    attrs: {
      type: { doc: 'input kind', bare: true, rules: { text: '', email: '', password: '', number: '', search: '', date: '' } },
      label: lbl,
      ph: { doc: 'placeholder', free: true },
      value: { doc: 'filled value', free: true },
      help: { doc: 'helper text under the field', free: true },
      error: { doc: 'error text under the field (red border)', free: true },
      w: A.w,
      disabled: dis,
    },
    extra: fieldCss,
  },
  {
    tag: 'textarea',
    doc: 'multi-line field; quoted string is the placeholder',
    role: 'textbox',
    text: 'ph',
    css: fieldBox,
    attrs: {
      label: lbl,
      ph: { doc: 'placeholder', free: true },
      value: { doc: 'filled value', free: true },
      rows: { doc: 'height in lines 2-8', bare: true, rules: Object.fromEntries([2, 3, 4, 5, 6, 8].map((n) => [String(n), `--mk-rows:${n}`])) },
      help: { doc: 'helper text under the field', free: true },
      error: { doc: 'error text under the field (red border)', free: true },
      w: A.w,
      disabled: dis,
    },
    extra: fieldCss + '.field{align-items:flex-start;min-height:calc(var(--mk-rows,3) * 1.5em + 18px)}',
  },
  {
    tag: 'select',
    doc: 'dropdown field; quoted string is options "A|B|C"',
    role: 'combobox',
    text: 'opts',
    css: fieldBox,
    attrs: {
      label: lbl,
      opts: { doc: 'options separated by |', free: true },
      value: { doc: 'selected value (default first option)', free: true },
      open: { doc: 'show the option list', flag: '' },
      help: { doc: 'helper text under the field', free: true },
      error: { doc: 'error text under the field (red border)', free: true },
      w: A.w,
      disabled: dis,
    },
    extra: fieldCss + `.list{padding:4px;border:${line};border-radius:${v('r-sm')};background:${v('bg')};box-shadow:${v('shadow-lg')}}.list div{padding:8px 10px;border-radius:6px}.list div[data-sel]{background:${v('fill')};font-weight:500}`,
  },
  {
    tag: 'checkbox',
    doc: 'checkbox; quoted string is the label',
    role: 'checkbox',
    css: choice,
    attrs: { checked: { doc: 'checked', flag: '--mk-on:1' }, disabled: dis },
    extra: `.box{${checkBox};border-radius:5px}:host([checked]) .box{background:${v('accent')};border-color:${v('accent')}}:host([checked]) .box::after{content:"";position:absolute;left:4.5px;top:1.5px;width:4px;height:8px;border:solid ${v('on-accent')};border-width:0 2px 2px 0;transform:rotate(45deg)}`,
  },
  {
    tag: 'radio',
    doc: 'radio button; quoted string is the label',
    role: 'radio',
    css: choice,
    attrs: { checked: { doc: 'selected', flag: '--mk-on:1' }, disabled: dis },
    extra: `.box{${checkBox};border-radius:50%}:host([checked]) .box{border-color:${v('accent')};border-width:5px}`,
  },
  {
    tag: 'switch',
    doc: 'toggle; quoted string is the label',
    role: 'switch',
    css: choice,
    attrs: { on: { doc: 'turned on', flag: '--mk-on:1' }, disabled: dis },
    extra: `.box{display:inline-block;width:36px;height:20px;border-radius:999px;background:${v('line')};flex:none;position:relative}.box::after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.3)}:host([on]) .box{background:${v('accent')}}:host([on]) .box::after{left:18px}`,
  },
  {
    tag: 'slider',
    doc: 'range slider; value 0-100',
    role: 'slider',
    css: 'display:flex;flex-direction:column;gap:6px;min-width:min(160px,100%);font-size:var(--mk-f-sm,13px)',
    attrs: { label: lbl, value: { doc: 'position 0-100', bare: true, free: true }, w: A.w, disabled: dis },
    extra: `.label{font-weight:500}.track{position:relative;height:6px;margin:8px 0;border-radius:3px;background:${v('line')}}.fillbar{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:${v('accent')}}.thumb{position:absolute;top:50%;width:18px;height:18px;margin:-9px 0 0 -9px;border-radius:50%;border:2px solid ${v('accent')};background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25)}`,
  },
])
