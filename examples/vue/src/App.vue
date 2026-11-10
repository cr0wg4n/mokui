<script setup>
import { computed, ref } from 'vue'
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
const screen = ref('showcase')
const theme = ref('modern')
const width = ref(1100)
const html = computed(() => pages[screen.value])
// Positioned query container: breakpoints follow this width and overlays cover it.
const stage = computed(() => ({
  containerType: 'inline-size',
  position: 'relative',
  minHeight: '560px',
  width: '100%',
  maxWidth: `${width.value}px`,
  ...themeStyle(theme.value),
}))

// Plain Vue state drives <mk-*> elements below.
const seats = ref(60)
const clicks = ref(0)
const tags = ref(['design', 'research', 'launch'])
const remove = (t) => (tags.value = tags.value.filter((x) => x !== t))
</script>

<template>
  <header>
    <h1>mokui + Vue</h1>
    <label>example <select id="example" v-model="screen"><option v-for="m in meta" :key="m.id" :value="m.id">{{ m.label }}</option></select></label>
    <label>theme <select id="theme" v-model="theme"><option>modern</option><option>dark</option><option>wire</option></select></label>
    <label>container width <input id="width" type="range" min="280" max="1400" v-model.number="width" /> {{ width }}px</label>
    <span class="note">everything is clickable</span>
  </header>
  <main>
    <div id="stage" :style="stage" v-html="html" />

    <section id="reactive">
      <h2>Vue state driving Mokui elements</h2>
      <p>These are plain <code>&lt;mk-*&gt;</code> tags in a Vue template, bound to Vue refs.</p>
      <mk-stack g="md" p="md" style="background:#fff;border:1px solid #e4e4e7;border-radius:12px">
        <mk-row g="md" align="center">
          <mk-text bold>Seats</mk-text>
          <input id="seats" type="range" min="0" max="100" v-model.number="seats" />
          <mk-badge :variant="seats > 80 ? 'warning' : undefined">{{ seats }}%</mk-badge>
        </mk-row>
        <mk-progress :value="seats"></mk-progress>
        <mk-row g="md" align="center">
          <mk-rating :value="Math.round(seats / 20)"></mk-rating>
          <mk-button variant="primary" s="sm" @click="clicks++">Clicked {{ clicks }} times</mk-button>
        </mk-row>
        <mk-row g="sm" wrap align="center">
          <mk-chip v-for="t in tags" :key="t" x @click="remove(t)">{{ t }}</mk-chip>
          <mk-text s="sm" muted v-if="!tags.length">No tags left</mk-text>
        </mk-row>
      </mk-stack>
    </section>
  </main>
</template>
