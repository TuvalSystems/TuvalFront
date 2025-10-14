// src/directives/bsTooltip.ts
import { Directive } from 'vue'

// @ts-ignore — si no tienes tipos de Bootstrap
const Tooltip = (window as any).bootstrap?.Tooltip

export const bsTooltip: Directive<HTMLElement, string> = {
  mounted(el, binding) {
    if (!Tooltip) return
    el.setAttribute('data-bs-toggle', 'tooltip')
    el.setAttribute('data-bs-placement', el.getAttribute('data-bs-placement') || 'top')
    el.setAttribute('data-bs-title', binding.value || el.getAttribute('title') || '')
    new Tooltip(el)
  },
  updated(el, binding) {
    if (!Tooltip) return
    // Actualiza el contenido del tooltip si cambia la binding
    el.setAttribute('data-bs-title', binding.value || '')
    // Reinicializa (Bootstrap 5)
    const existing = Tooltip.getInstance(el)
    existing?.dispose()
    new Tooltip(el)
  },
  unmounted(el) {
    if (!Tooltip) return
    const existing = Tooltip.getInstance(el)
    existing?.dispose()
  }
}
