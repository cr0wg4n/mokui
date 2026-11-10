import 'mokui' // registers <mk-*> elements
import { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { themeStyle } from 'mokui'
import meta from '../../screens/index.json'
// Each .mk file becomes an HTML string through the mokui Vite plugin.
import showcase from '../../screens/showcase.mk'
import analytics from '../../screens/analytics.mk'
import forms from '../../screens/forms.mk'
import mobile from '../../screens/mobile.mk'
import landing from '../../screens/landing.mk'
import gallery from '../../screens/gallery.mk'

const pages = { showcase, analytics, forms, mobile, landing, gallery }

function App() {
  const [screen, setScreen] = useState('showcase')
  const [theme, setTheme] = useState('modern')
  const [width, setWidth] = useState(1100)
  // Plain React state drives <mk-*> elements below.
  const [seats, setSeats] = useState(60)
  const [clicks, setClicks] = useState(0)
  const [tags, setTags] = useState(['design', 'research', 'launch'])

  // Positioned query container: breakpoints follow this width and overlays cover it.
  const stage = useMemo(
    () => ({ containerType: 'inline-size', position: 'relative', minHeight: 560, width: '100%', maxWidth: width, ...themeStyle(theme) }),
    [theme, width],
  )

  return (
    <>
      <header>
        <h1>mokui + React</h1>
        <label>
          example{' '}
          <select id="example" value={screen} onChange={(e) => setScreen(e.target.value)}>
            {meta.map((m) => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </label>
        <label>
          theme{' '}
          <select id="theme" value={theme} onChange={(e) => setTheme(e.target.value)}>
            <option>modern</option>
            <option>dark</option>
            <option>wire</option>
          </select>
        </label>
        <label>
          container width <input id="width" type="range" min="280" max="1400" value={width} onChange={(e) => setWidth(Number(e.target.value))} /> {width}px
        </label>
        <span className="note">everything is clickable</span>
      </header>
      <main>
        <div id="stage" style={stage} dangerouslySetInnerHTML={{ __html: pages[screen] }} />

        <section id="reactive">
          <h2>React state driving Mokui elements</h2>
          <p>These are plain <code>&lt;mk-*&gt;</code> tags in JSX, bound to React state.</p>
          <mk-stack g="md" p="md" style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 12 }}>
            <mk-row g="md" align="center">
              <mk-text bold="">Seats</mk-text>
              <input id="seats" type="range" min="0" max="100" value={seats} onChange={(e) => setSeats(Number(e.target.value))} />
              <mk-badge variant={seats > 80 ? 'warning' : undefined}>{seats}%</mk-badge>
            </mk-row>
            <mk-progress value={seats}></mk-progress>
            <mk-row g="md" align="center">
              <mk-rating value={Math.round(seats / 20)}></mk-rating>
              <mk-button variant="primary" s="sm" onClick={() => setClicks(clicks + 1)}>Clicked {clicks} times</mk-button>
            </mk-row>
            <mk-row g="sm" wrap="" align="center">
              {tags.map((t) => (
                <mk-chip key={t} x="" onClick={() => setTags(tags.filter((x) => x !== t))}>{t}</mk-chip>
              ))}
              {!tags.length && <mk-text s="sm" muted="">No tags left</mk-text>}
            </mk-row>
          </mk-stack>
        </section>
      </main>
    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
