import { computed, nextTick, onScopeDispose, ref } from "vue";
import { useStore } from "vuex";
import { useRouter, isNavigationFailure, NavigationFailureType } from "vue-router";
import { usePaginationCacheStore } from "@/stores/bodegas/consultas/usePaginationCacheStore";
import { resetApprovalOrders } from "@/composables/aprobaciones/pedidos/useApprovalOrder";
import { resetApprovalQuotes } from "@/composables/aprobaciones/cotizaciones/useApprovalQuote";
import { esperarSolicitudes } from "@/utils/puntoVentaRequests";
import { rutaParaPuntoVenta } from "@/utils/puntoVentaRoute";
import { swalWarning } from "@/functions/swal-alert";

const cambiandoPuntoVenta = ref(false);
const validaciones = new Set();
const validandoCambio = ref(false);
const cambioEnCurso = computed(() => validandoCambio.value || cambiandoPuntoVenta.value);

export function onBeforePuntoVentaChange(validar) {
  validaciones.add(validar);
  onScopeDispose(() => validaciones.delete(validar));
}

export function useCambioPuntoVenta() {
  const store = useStore();
  const router = useRouter();
  const cache = usePaginationCacheStore();

  async function cambiarPuntoVenta(punto) {
    if (!punto || cambioEnCurso.value ||
        String(punto.PTO_VTA_ID) === String(store.state.puntodeventaselect)) return;

    validandoCambio.value = true;
    const rutaAnterior = router.currentRoute.value;
    const puntoAnterior = store.state.puntodeventaselect;
    try {
      // No cambiar el contexto de una operación que todavía se está procesando.
      if (!await esperarSolicitudes()) {
        swalWarning('Hay operaciones en curso. Espere a que terminen y vuelva a cambiar el punto de venta.');
        return;
      }
      for (const validar of validaciones) {
        if (await validar() === false) return;
      }
      if (!await esperarSolicitudes()) {
        swalWarning('Hay operaciones en curso. Espere a que terminen y vuelva a cambiar el punto de venta.');
        return;
      }
      if (router.currentRoute.value !== rutaAnterior ||
          store.state.puntodeventaselect !== puntoAnterior || !store.state.user.token) return;

      cambiandoPuntoVenta.value = true;
      // Desmontar primero detiene los watchers y las suscripciones de la vista.
      await nextTick();
      const destino = rutaParaPuntoVenta(rutaAnterior);
      const failure = await router.replace(destino);
      if (failure && !isNavigationFailure(failure, NavigationFailureType.duplicated)) return;
      if (!store.state.user.token ||
          router.currentRoute.value.name !== (destino.name || rutaAnterior.name)) return;
      store.commit('resetCotizacion');
      store.commit('cambiarPuntoVenta', punto);
      cache.$reset();
      resetApprovalOrders();
      resetApprovalQuotes();
      // Los detalles ya se redirigieron; no dejar una redirección pendiente.
      sessionStorage.removeItem('PTO_ANTERIOR');
    } finally {
      cambiandoPuntoVenta.value = false;
      validandoCambio.value = false;
    }
  }

  return { cambiandoPuntoVenta, cambioEnCurso, cambiarPuntoVenta };
}
