import { ref, computed, isRef, onMounted, onBeforeUnmount } from 'vue'

// Parse "YYYY-MM-DD [HH:mm[:ss]]" o ISO
function parseYmdOrLaravel(str) {
  if (!str) return new Date(NaN)
  if (str.includes('T')) return new Date(str) // ISO
  const [d, t] = str.trim().split(' ')
  const [y, m, day] = d.split('-').map(Number)
  if (!t) return new Date(y, (m || 1) - 1, day || 1)
  const parts = t.split(':').map(Number)
  const H = parts[0] || 0
  const M = parts[1] || 0
  const S = parts[2] || 0
  return new Date(y, (m || 1) - 1, day || 1, H, M, S)
}

function toDate(input) {
  const v = isRef(input) ? input.value : input
  if (v == null) return new Date(NaN)
  if (v instanceof Date) return v
  if (typeof v === 'string') return parseYmdOrLaravel(v)
  return new Date(v) // timestamp numérico
}

function utcMidnightMs(date) {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
}

function diffDays(a, b) {
  return Math.floor((utcMidnightMs(b) - utcMidnightMs(a)) / 86400000)
}

/**
 * Composable para calcular días entre 'desde' y 'hasta'.
 * - 'desde' y 'hasta' aceptan String | Date | ref(String|Date)
 * - Si 'hasta' se omite/null → compara contra HOY (reactivo) y se refresca a medianoche
 * options: { inclusive?: boolean, autoTick?: boolean }
 */
export function useDaysBetween(desde, hasta = null, options = {}) {
  const { inclusive = false, autoTick = true } = options

  const start = isRef(desde) ? desde : ref(desde)
  const end = isRef(hasta) ? hasta : ref(hasta)

  // "hoy" reactivo si no se pasa 'hasta'
  const now = ref(new Date())
  let timer

  onMounted(() => {
    if (!end.value && autoTick) {
      const n = now.value
      const midnight = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1)
      const ms = midnight.getTime() - n.getTime()
      timer = setTimeout(function tick() {
        now.value = new Date()
        timer = setTimeout(tick, 86400000)
      }, ms)
    }
  })

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  const days = computed(() => {
    const d = toDate(start)
    const h = end.value ? toDate(end) : now.value
    const base = diffDays(d, h)
    return inclusive ? base + 1 : base
  })

  // Helper por si quieres calcular ad-hoc sin tocar refs
  function calc(desdeVal, hastaVal, inclusiveLocal = inclusive) {
    const d = toDate(desdeVal)
    const h = hastaVal ? toDate(hastaVal) : now.value
    const base = diffDays(d, h)
    return inclusiveLocal ? base + 1 : base
  }

  return { days, calc }
}

// Si te viene bien, exporta también funciones "planas":
export function daysSince(fechaStr, inclusivo = false) {
  const base = diffDays(parseYmdOrLaravel(fechaStr), new Date())
  return inclusivo ? base + 1 : base
}

export function daysBetweenRaw(desdeStr, hastaStr, inclusivo = false) {
  const base = diffDays(parseYmdOrLaravel(desdeStr), parseYmdOrLaravel(hastaStr))
  return inclusivo ? base + 1 : base
}