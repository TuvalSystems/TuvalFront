import axiosClient from "@/axios";
import { toNum } from "@/functions";
import { ref, nextTick } from "vue";
import { swalSuccess, swalError, swalWarning, swalInfo } from "@/functions/swal-alert.js";
import { useApiAction } from "@/composables/core/useApiAction";

export function useReservationProcessor(infoReserva) {
  const { run } = useApiAction();

  const urlProcess = "/reservas/procesar-reserva";
  const urlFacturaDemanda =
    "/reservas/procesar-reserva-factura-demanda";
  const loadingReservedProcess = ref(false);
  const loadingFacturaDemanda = ref(false);

  const selectAllRelease = ref(false);
  const selectAllInvoice = ref(false);

  function getPendingBase(stock) {
    const autorizado = toNum(getAuthorized(stock));
    const facturado = toNum(stock.cantidad_facturada ?? 0); // histórico
    // const cotizado    = toNum(stock.cantidad_cotizada ?? 0);
    // const trasladado  = toNum(stock.cantidad_traslado ?? 0);
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
    await nextTick(); // asegura que v-model ya actualizó
    const checked = selectAllRelease.value;
    forEachStockRow((row) => {
      if (row?.disable_movimiento) return;
      const pedir = checked
        ? getPendingBase(row) - toNum(row.a_cotizar ?? 0) // maximo lo que se puede liberar
        : 0; // destiladado => limpiar
      row.a_cancelar = clampRelease(row, pedir);
    });
  }

  async function applySelectAllInvoice() {
    await nextTick();
    const checked = selectAllInvoice.value;
    forEachStockRow((row) => {
      if (row?.disable_movimiento) return;
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
  };
}
