import axiosClient from "@/axios";
import { toNum } from "@/functions";
import { ref, nextTick, unref, computed, onMounted, watch } from "vue";
import {  swalError, swalWarning } from "@/functions/swal-alert.js";
import { useApiAction } from "@/composables/core/useApiAction";


import { usePuntosVentaReservaLimits } from "@/stores/cotizaciones/reservas/usePuntosVentaReservaLimits";
import { daysUntil } from "@/composables/venta/cotizaciones/reservas/useDaysBetween";
export function useReservationProcessor(infoReserva) {
  const { run } = useApiAction();

  const urlProcess = "/reservas/procesar-reserva";
  const urlFacturaDemanda =
    "/reservas/procesar-reserva-factura-demanda";
  const loadingReservedProcess = ref(false);
  const loadingFacturaDemanda = ref(false);

  const selectAllRelease = ref(false);
  const selectAllInvoice = ref(false);

  const ptoStore = usePuntosVentaReservaLimits();
  const ptoVtaReservation = ref(null);
  function getPendingBase(stock) {
    const autorizado = toNum(getAuthorized(stock));
    const facturado = toNum(stock.cantidad_facturada ?? 0); // histórico
    const canceladoPrev = toNum(stock.cantidad_cancelada ?? 0); // histórico
    const result = autorizado - facturado - canceladoPrev;
    return Math.max(Number(result.toFixed(4)), 0);
  }

  function clampRelease(row, requested) {
    const base = getPendingBase(row);
    const cotizarOtro = toNum(row.a_cotizar ?? 0);
    const pendiente = Math.max(0, base - cotizarOtro); // lo que planeas facturar ahora (no cancelable)
    return Math.max(0, Math.min(toNum(requested), pendiente));
  }

  function clampInvoice(row, requested) {
    const base = getPendingBase(row);
    const cancelarOtro = toNum(row.a_cancelar ?? 0);
    const pendiente = Math.max(0, base - cancelarOtro); // lo que planeas cancelar ahora (no facturable)
    return Math.max(0, Math.min(toNum(requested), pendiente));
  }

  /** validacion de valores  */
  function updateReleaseReserved(e, stockRow) {
    const solicitado = toNum(e?.target?.value ?? stockRow.a_cancelar);
    const val = clampRelease(stockRow, solicitado);
    if (solicitado > val) {
      swalWarning(`Solo puede liberar maximo esta cantidad ${val}.`);
    }
    stockRow.a_cancelar = val;
  }

  function updateInvoiceReserved(e, stockRow) {
    const solicitado = toNum(e?.target?.value ?? stockRow.a_cotizar);
    const val = clampInvoice(stockRow, solicitado);
    if (solicitado > val) {
      swalWarning(`Solo puede cotizar maximo esta cantidad ${val}.`);
    }
    stockRow.a_cotizar = val;
  }

  function getAuthorized(stock) {
    return toNum(stock.cantidad_reservada ?? 0);
  }

  /** funcion para correr todas las filas de stock */
  function forEachStockRow(cb) {
    const dets = infoReserva.cotizacion.detallecotizacion ?? [];
    for (const det of dets) {
      const stocks = det.stock ?? [];
      for (const row of stocks) cb(row, det);
    }
  }


  async function applySelectAllRelease() {
    if (selectAllRelease.value) {
      selectAllInvoice.value = false; // Desmarcar el check de cabecera opuesto
      forEachStockRow(row => row.a_cotizar = 0); // Limpiar los inputs de la columna opuesta
    }
    await nextTick(); // asegura que v-model ya actualizó
    const checked = selectAllRelease.value;
    forEachStockRow((row) => {
      if (row?.disable_movimiento || (row?.disable_traslado && row?.picking)) return;
      const pedir = checked
        ? getPendingBase(row) - toNum(row.a_cotizar ?? 0) // maximo lo que se puede liberar
        : 0; // destiladado => limpiar
      row.a_cancelar = clampRelease(row, pedir);
    });
  }

  async function applySelectAllInvoice() {
    if (selectAllInvoice.value) {
      selectAllRelease.value = false; // Desmarcar el check de cabecera opuesto
      forEachStockRow(row => row.a_cancelar = 0); // Limpiar los inputs de la columna opuesta
    }
    await nextTick();
    const checked = selectAllInvoice.value;
    forEachStockRow((row) => {
      if (row?.disable_movimiento || row?.disable_traslado) return;
      const pedir = checked
        ? getPendingBase(row) - toNum(row.a_cancelar ?? 0) // maximo lo que se puede facturar
        : 0; // destiladado => limpiar
      row.a_cotizar = clampInvoice(row, pedir);
    });
  }

  async function processReservation(quotation) {
    return await run(() => axiosClient.post(urlProcess, { data: quotation }), {
      loadingRef: loadingReservedProcess,
      successMessage: "Proceso realizado exitosamente.",
      onError: (backend, error) => {
        swalError(
          backend?.error ||
          backend?.message ||
          error?.message ||
          "Error al obtener la información"
        );
      },
    })
  }

  async function procesarReservaFacturaDemanda(reserve) {
    return await run(() => axiosClient.post(urlFacturaDemanda, { reserva: reserve }), {
      loadingRef: loadingFacturaDemanda,
      successMessage: "Proceso realizado exitosamente.",
    });
  }


  /** proceso de validacion de fecha de autorizacion */
  // validacion para limite de fecha para aprobar reservas segun punto de venta
  const limitsForPto = computed(() => {
    if (!ptoVtaReservation.value) return [];
    return ptoStore.byPunto(ptoVtaReservation.value);
  });

  // limites por punto de venta ( array de objetos )

  function validateDateApproval() {
    if (!limitsForPto.value || limitsForPto.value.length === 0) {
      return { invalid: false, message: '' };
    }

    const config = limitsForPto.value[0];

    const pvLimit = config?.pto_vta_max_dias_autorizacion_reserva ?? 0;
    // Si la fecha es null, no validamos
    if (!infoReserva.fe_autorizacion_reserva) return { invalid: false, message: '' };

    const numDay = Math.max(0, daysUntil(infoReserva.fe_autorizacion_reserva));
    const invalid = numDay > pvLimit;

    // Formateo de mensajes
    const d = pvLimit === 1 ? "día" : "días";
    const limitStr = `${pvLimit} ${d}`;

    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + pvLimit);
    const maxStr = maxDate.toLocaleDateString("es-EC");

    return {
      invalid,
      message: `La fecha de aprobación excede el límite de ${limitStr}. Elija hasta ${maxStr}.`,
    };
  }


  watch(() => infoReserva?.fe_autorizacion_reserva, (fecha) => {
    if (!fecha) { return; }
    const { invalid, message } = validateDateApproval();
    if (invalid) {
      swalWarning(message);
      if (infoReserva && infoReserva.cotizacion) {
        infoReserva.fe_autorizacion_reserva = null;
      }
      return;
    }
  },
    { immediate: false });

  onMounted(async () => {
    if (!unref(ptoStore).puntosVentaReservaLimits) {
      await ptoStore.fetchPuntosVentaReservaLimits();
    }
  });

  return {
    getPendingBase,
    updateReleaseReserved,
    updateInvoiceReserved,
    getAuthorized,
    loadingReservedProcess,
    loadingFacturaDemanda,
    processReservation,

    /** seleccion lote */
    selectAllRelease,
    selectAllInvoice,

    /** acciones */
    applySelectAllRelease,
    applySelectAllInvoice,
    procesarReservaFacturaDemanda,
    ptoVtaReservation
  };
}
