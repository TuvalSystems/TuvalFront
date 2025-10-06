import axiosClient from "@/axios";
import { toInt } from "@/functions";
import { ref, nextTick } from "vue";
import { swalSuccess, swalError } from "@/functions/swal-alert.js";

export function useReservationProcessor(infoCotizacion) {
  const urlProcess = "/reservas/procesar-reserva";
  const urlFacturaDemanda =
    "/reservas/procesar-reserva-factura-demanda";
  const loadingReservedProcess = ref(false);
  const loadingFacturaDemanda = ref(false);

  const selectAllRelease = ref(false);
  const selectAllInvoice = ref(false);

  function getPendingBase(stock) {
    const autorizado = toInt(getAuthorized(stock));
    const facturado = toInt(stock.cantidad_facturada ?? 0); // histórico
    const canceladoPrev = toInt(stock.cantidad_cancelada ?? 0); // histórico
    return Math.max(autorizado - facturado - canceladoPrev, 0);
  }

  function clampRelease(row, requested) {
    const base = getPendingBase(row);
    const facturarOtro = toInt(row.a_facturar ?? 0);
    const pendiente = Math.max(0, base - facturarOtro); // lo que planeas facturar ahora (no cancelable)
    return Math.max(0, Math.min(toInt(requested), pendiente));
  }

  function clampInvoice(row, requested) {
    const base = getPendingBase(row);
    const cancelarOtro = toInt(row.a_cancelar ?? 0);
    const pendiente = Math.max(0, base - cancelarOtro); // lo que planeas cancelar ahora (no facturable)
    return Math.max(0, Math.min(toInt(requested), pendiente));
  }

  /** validacion de valores  */
  function updateReleaseReserved(e, stockRow) {
    const solicitado = toInt(e?.target?.value ?? stockRow.a_cancelar);
    const val = clampRelease(stockRow, solicitado);
    if (solicitado > val) {
      swalError(`Solo puede liberar hasta ${val}.`);
    }
    stockRow.a_cancelar = val;
  }

  function updateInvoiceReserved(e, stockRow) {
    const solicitado = toInt(e?.target?.value ?? stockRow.a_facturar);
    const val = clampInvoice(stockRow, solicitado);
    if (solicitado > val) {
      swalError(`Solo puede facturar hasta ${val}.`);
    }
    stockRow.a_facturar = val;
  }

  function getAuthorized(stock) {
    return toInt(stock.cantidad_autorizada_reserva ?? 0);
  }

  /** funcion para correr todas las filas de stock */
  function forEachStockRow(cb) {
    const dets = infoCotizacion.value?.detallecotizacion ?? [];
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
        ? getPendingBase(row) - toInt(row.a_facturar ?? 0) // maximo lo que se puede liberar
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
        ? getPendingBase(row) - toInt(row.a_cancelar ?? 0) // maximo lo que se puede facturar
        : 0; // destiladado => limpiar
      row.a_facturar = clampInvoice(row, pedir);
    });
  }

  async function processReservation(quotation) {
    if (loadingReservedProcess.value) {
      return { ok: false, message: "Ya hay un proceso en curso." };
    }
    loadingReservedProcess.value = true;
    try {
      const { data, status } = await axiosClient.post(urlProcess, {
        data: quotation,
      });

      const ok = status >= 200 && status < 300 && (data?.success ?? true);

      if (!ok) {
        const msg = data?.error || "No se pudo procesar la reserva.";
        throw new Error(msg);
      }
      const msg = data?.message || "Reserva procesada correctamente.";
      // swalSuccess(msg);
      return { ok: true, data, message: msg };
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.error ||
        "Error al procesar la reserva.";
      // console.error("[processReservation] ", error);
      // swalError(msg);
      return { ok: false, error, message: msg };
    } finally {
      loadingReservedProcess.value = false;
    }
  }

  async function procesarReservaFacturaDemanda(reserve) {
    loadingFacturaDemanda.value = true;
    try {
      const { data, status } = await axiosClient.post(urlFacturaDemanda, {
        reserva: reserve,
      });
      const ok = status >= 200 && status < 300 && (data?.success ?? true);

      if (!ok) {
        const msg = data?.error || "No se pudo procesar la reserva.";
        throw new Error(msg);
      }
      const msg = data?.message || "Reserva procesada correctamente.";
      // swalSuccess(msg);
      return { ok: true, data, message: msg };
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.error ||
        "Error al procesar la reserva.";
      // console.error("[procesarReservaFacturaDemanda2] ", error);
      // swalError(msg);
      return { ok: false, error, message: msg };
    } finally {
      loadingFacturaDemanda.value = false;
    }
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
