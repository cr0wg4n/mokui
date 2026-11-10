import { v } from '../../theme/scale'
import { A, line } from '../shared'
import { inPack, type TagSpec } from '../types'

const mono = 'ui-monospace,SFMono-Regular,Menlo,Consolas,monospace'

/** Avatar groups, code, keys and video. */
export const dataMisc: TagSpec[] = inPack('data', [
  {
    tag: 'avatars',
    doc: 'overlapping avatar group; children are avatars',
    css: 'display:inline-flex;align-items:center;width:fit-content',
    attrs: {},
    extra: `::slotted(mk-avatar){border:2px solid ${v('bg')}}::slotted(mk-avatar:not(:first-child)){margin-left:-8px}`,
  },
  {
    tag: 'code',
    doc: 'inline code, or a block with `block`; quoted string is the code (\\n for a new line)',
    css: `display:inline;padding:2px 6px;border:${line};border-radius:6px;background:${v('fill')};font-family:${mono};font-size:.9em`,
    attrs: { block: { doc: 'multi-line block', flag: `display:block;padding:12px 16px;border-radius:${v('r-sm')};white-space:pre-wrap;line-height:1.6` } },
  },
  {
    tag: 'kbd',
    doc: 'keyboard key; quoted string is the key',
    css: `display:inline-flex;align-items:center;padding:1px 7px;border:${line};border-bottom-width:2px;border-radius:6px;background:${v('bg')};font-family:${mono};font-size:.85em;line-height:1.5`,
    attrs: {},
  },
  {
    tag: 'video',
    doc: 'video placeholder with a play button; quoted string is the caption',
    role: 'img',
    css: `display:flex;align-items:flex-end;position:relative;aspect-ratio:16/9;width:100%;max-width:100%;overflow:hidden;border-radius:${v('r')};background:${v('fill')};border:${line};color:${v('muted')};font-size:var(--mk-f-sm,13px)`,
    attrs: {
      ratio: { doc: 'aspect ratio', bare: true, rules: { '16:9': 'aspect-ratio:16/9', '4:3': 'aspect-ratio:4/3', '1:1': 'aspect-ratio:1/1', '9:16': 'aspect-ratio:9/16' } },
      w: A.w,
    },
    extra: `.play{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:${v('bg')};color:${v('fg')};box-shadow:${v('shadow-lg')}}.play svg{width:24px;height:24px;margin-left:3px}slot{display:block;padding:8px 12px}`,
  },
])
