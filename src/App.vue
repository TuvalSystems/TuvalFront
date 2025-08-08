<script setup>
import { inject, onMounted, ref, onBeforeUnmount } from 'vue'
import axiosPrint from "./axiosPrint";
const echo = inject('echo')
const logs = ref([])

const openPing = async () => {
     await axiosPrint.get('/ping') // ajusta URL si aplica
}

echo.channel('public.pings').listen('.test-event', (e) => {
  console.log('[EVENTO RECIBIDO]', e.message)
})

onMounted(() => {
  // if (!echo) return
  // echo.channel('public.pings').listen('.ping', (e) => {
  //   console.log(e.message)
  //   logs.value.push(e.message)
  // })

  const p = echo.connector.pusher
  console.log('[Echo opts]', echo.options)
  console.log('[WS URL]', `ws://${echo.options.wsHost}:${echo.options.wsPort}/app/${echo.options.key}`)
  console.log('[VITE key]', import.meta.env.VITE_PUSHER_APP_KEY)
  console.log('[Echo opts]', echo.options)
  p.connection.bind('state_change', states => {
    console.log('[WS state]', states.previous, '->', states.current)
  })
  p.connection.bind('connected', () => console.log('[WS connected]'))
  p.connection.bind('error', e => console.error('[WS error]', e))

  echo.channel('public.pings').listen('.test-event', (e) => {
    console.log('[EVENT]', e)
    logs.value.push(e.message)
  })
})

onBeforeUnmount(() => {
  if (!echo) return
  echo.leaveChannel('public.pings')
});
</script>

<template>
  <!-- <div class="p-4 space-y-2">
    <h1>WS Test (Vue 3 + Vite)</h1>
    <button @click="openPing">Enviar Ping</button>
    <ul>
      <li v-for="(l, i) in logs" :key="i">{{ l }}</li>
    </ul>
  </div> -->
  <RouterView />
</template>
<style lang="scss">
// Main Stylesheet
@import "@/assets/scss/main";

// All color themes are included and available by default
// Feel free to comment out any of them if you won't use them in your project
@import "@/assets/scss/oneui/themes/amethyst";
@import "@/assets/scss/oneui/themes/city";
@import "@/assets/scss/oneui/themes/flat";
@import "@/assets/scss/oneui/themes/modern";
@import "@/assets/scss/oneui/themes/smooth";

// SweetAlert2
@import "sweetalert2/dist/sweetalert2.min.css";

// Flatpickr + Custom overrides
@import "flatpickr/dist/flatpickr.css";
@import "@/assets/scss/vendor/flatpickr";

// Vue Select + Custom overrides
@import "vue-select/src/scss/vue-select";
@import "@/assets/scss/vendor/vue-select";

// Vue Form Slider + Custom overrides
@import "@vueform/slider/themes/default.css";
@import "@/assets/scss/vendor/vueform-slider";

// Dropzone + Custom overrides
@import "dropzone/dist/dropzone.css";
@import "@/assets/scss/vendor/dropzone";
</style>
