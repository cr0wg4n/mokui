<script setup>
import screen from './screen.mk'
</script>

<template>
  <!-- the screen comes from a .mk file; the row below is plain markup in Vue -->
  <div id="from-file" style="container-type: inline-size; position: relative; min-height: 520px" v-html="screen" />
  <mk-row id="inline" g="md" p="md">
    <mk-icon n="home" />
    <mk-text s="lg">Written as Vue template markup</mk-text>
  </mk-row>
</template>
