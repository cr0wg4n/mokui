import type { Renderer } from '../runtime/dom'
import { contentRenderers } from './core/content.render'
import { controlRenderers } from './core/controls.render'
import { layoutRenderers } from './core/layout.render'
import { calendarRenderers } from './data/calendar.render'
import { chartRenderers } from './data/chart.render'
import { dataMiscRenderers } from './data/misc.render'
import { feedbackRenderers } from './feedback/primitives.render'
import { formRenderers } from './forms/controls.render'
import { dialogRenderers } from './overlay/dialogs.render'
import { floatingRenderers } from './overlay/floating.render'
import { panelRenderers } from './overlay/panels.render'

/** How each element draws itself in its shadow root (the DOM side; `mokui/core` never imports this). */
export const renderers: Record<string, Renderer> = {
  ...layoutRenderers, ...contentRenderers, ...controlRenderers,
  ...dialogRenderers, ...floatingRenderers, ...panelRenderers,
  ...formRenderers, ...feedbackRenderers,
  ...chartRenderers, ...calendarRenderers, ...dataMiscRenderers,
}
