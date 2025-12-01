// src/directives/bsTooltip.ts
import { Directive, DirectiveBinding } from 'vue'

//definimos una clave para almacenar la instancia de Tooltip en el elemento
const INSTANCE_KEY = '__bs_tooltip_instance__'

// Interfaz simple para el tipo de datos de la instancia (opcional, para tipado)
interface BootstrapTooltipInstance {
  dispose(): void
  update(): void // Método de BS5 para recalcular la posición y las opciones
}

export const bsTooltip: Directive<HTMLElement, string> = {
  // 1. Hook 'mounted': Inicializa el Tooltip
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    // Obtenemos la referencia de Tooltip DESPUÉS de que main.ts ha establecido window.bootstrap
    const Tooltip = (window as any).bootstrap?.Tooltip
    if (!Tooltip) {
      console.warn("Bootstrap Tooltip no está disponible en window.bootstrap.")
      return
    }

    const title = binding.value || el.getAttribute('title') || ''
    
    // Configura los atributos necesarios para Bootstrap
    el.setAttribute('data-bs-toggle', 'tooltip')
    el.setAttribute('data-bs-placement', el.getAttribute('data-bs-placement') || 'top')

    // Inicializa la instancia del Tooltip
    const instance = new Tooltip(el, {
      title: title, // Pasa el título directamente como opción (la forma preferida de BS5)
      trigger: 'hover focus', // Disparadores predeterminados
      html: true // Si necesitas HTML dentro del tooltip, si no, usa 'false'
    }) as BootstrapTooltipInstance;

    // Guarda la instancia en el elemento para un acceso fácil posterior
    (el as any)[INSTANCE_KEY] = instance
  },

  // 2. Hook 'updated': Actualiza el título si el valor del binding cambia
  updated(el: HTMLElement, binding: DirectiveBinding<string>) {
    // Obtenemos la referencia de Tooltip
    const Tooltip = (window as any).bootstrap?.Tooltip
    if (!Tooltip) return

    const instance = (el as any)[INSTANCE_KEY] as BootstrapTooltipInstance | undefined
    
    // Solo actualizamos si la directiva tiene una instancia y si el valor ha cambiado
    if (instance && binding.value !== binding.oldValue) {
      const newTitle = binding.value || el.getAttribute('title') || ''

      // El enfoque más limpio y seguro para actualizar el título en BS5 es:
      // 1. Destruir la instancia existente.
      instance.dispose()

      // 2. Re-inicializar con el nuevo título
      const newInstance = new Tooltip(el, {
        title: newTitle, 
        trigger: 'hover focus',
        html: true
      }) as BootstrapTooltipInstance;
      
      // 3. Guardar la nueva instancia
      (el as any)[INSTANCE_KEY] = newInstance
    }
  },

  // 3. Hook 'unmounted': Limpia la instancia para evitar fugas de memoria
  unmounted(el: HTMLElement) {
    const Tooltip = (window as any).bootstrap?.Tooltip
    if (!Tooltip) return

    const instance = (el as any)[INSTANCE_KEY] as BootstrapTooltipInstance | undefined
    
    if (instance) {
      instance.dispose()
      // Opcional: limpiar la referencia en el elemento
      delete (el as any)[INSTANCE_KEY] 
    }
  }
}