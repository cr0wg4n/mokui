// Playground examples: the same screens the Vue and React apps render (examples/screens/*.mk).
import meta from '../examples/screens/index.json'
import showcase from '../examples/screens/showcase.mk?raw'
import analytics from '../examples/screens/analytics.mk?raw'
import forms from '../examples/screens/forms.mk?raw'
import mobile from '../examples/screens/mobile.mk?raw'
import landing from '../examples/screens/landing.mk?raw'
import gallery from '../examples/screens/gallery.mk?raw'

export interface Example {
  id: string
  label: string
  src: string
}

export const examples: Example[] = [
  { ...meta[0]!, src: showcase },
  { ...meta[1]!, src: analytics },
  { ...meta[2]!, src: forms },
  { ...meta[3]!, src: mobile },
  { ...meta[4]!, src: landing },
  { ...meta[5]!, src: gallery },
]
