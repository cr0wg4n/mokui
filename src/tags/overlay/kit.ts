import { v } from '../../theme/scale'
import { line } from '../shared'

/** Shared pieces of the overlay tags: the open flag, the close button and the dialog panel. */
export const openFlag = (css: string) => ({ doc: 'start open', flag: css })
export const closeButton = `.x{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border:0;border-radius:6px;background:transparent;color:${v('muted')};padding:0}.x:hover{background:${v('fill')}}.x svg{width:16px;height:16px}`

export const overlayPanel =
  `.panel{display:flex;flex-direction:column;gap:12px;width:min(var(--mk-modal-w,480px),100%);max-height:100%;overflow:auto;padding:20px;border:${line};border-radius:16px;background:${v('bg')};box-shadow:${v('shadow-lg')}}` +
  `.head{display:flex;align-items:center;gap:12px}.title{flex:1;font-size:var(--mk-f-lg,18px);font-weight:650}.body{display:flex;flex-direction:column;gap:12px}` +
  closeButton
