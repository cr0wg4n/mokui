import { mount } from 'mokui'

mount(
  document.getElementById('app')!,
  `
stack g=md p=lg
  row g=sm align=center
    icon menu
    text lg "Dashboard"
  row g=sm
    icon search
    text sm "Search..."
`,
)
