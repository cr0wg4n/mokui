import 'mokui' // registers <mk-*> elements
import { createRoot } from 'react-dom/client'
import screen from './screen.mk'

createRoot(document.getElementById('root')).render(
  <>
    {/* the screen comes from a .mk file; the row below is plain JSX */}
    <div id="from-file" style={{ containerType: 'inline-size', position: 'relative', minHeight: 520 }} dangerouslySetInnerHTML={{ __html: screen }} />
    <mk-row id="inline" g="md" p="md">
      <mk-icon n="home" />
      <mk-text s="lg">Written as JSX</mk-text>
    </mk-row>
  </>,
)
