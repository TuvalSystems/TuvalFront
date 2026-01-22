import axiosClient from "@/axios";
import { swalWarning } from "@/functions/swal-alert.js";
import { watch, reactive, ref, unref, computed } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { usePuntosVentaReservaLimits } from "@/stores/cotizaciones/reservas/usePuntosVentaReservaLimits";
import { daysUntil } from "@/composables/venta/cotizaciones/reservas/useDaysBetween";

export function useQuotationReserveApproval() {
  const { run } = useApiAction();
  const data = ref(null);
  const ptoVtaReservation = ref(null);
  const ptoStore = usePuntosVentaReservaLimits();
  const dataQuotationDetailStock = ref(null);
  const loadingQ = ref(false);
  const loadingQ1 = ref(false);
  const loadingDeny = ref(false);
  const loadingApproval = ref(false);

  /** para listar los detalles de la cotizacion y el stock activo */
  const dataQuotationDetailAndStockActive = ref(null);
  const loadingQ2 = ref(false);
  // apis consultas
  const apiFetchWithDetail = "/reservas/cotizacion-con-detalle/";
  const apiFetchWithDetailAnStock = "/reservas/cotizacion-detalle-stock/";
  const apiFetchWithDetailAnStockActive = "/reservas/cotizacion-detalle-stock-activo/";
  const apiDenyReservation = "/reservas/rechazar-solicitud-reserva";
  const apiApproveReservation = "/reservas/aprobar-solicitud-reserva";
  const apiCheckStockReserved = "/reservas/verificar-stock-reserva";
  /** datos para enviar a aprobar y rechazar */
  const dataSendApproval = reactive({
    id: null,
    fe_autorizacion_reserva: null,
    obs_autorizacion_reserva: null,
  });



  const resetForm = () => {
    dataSendApproval.id = null;
    dataSendApproval.fe_autorizacion_reserva = null;
    dataSendApproval.obs_autorizacion_reserva = null;
  };

  async function fetchQuotationWithDetial(id) {
    return await run(() => axiosClient.get(`${apiFetchWithDetail}${id}`), {
      loadingRef: loadingQ,
      onSuccess: (res) => {
        data.value = res;
      },
      successMessage: "Proceso realizado exitosamente.",
    });

  }


  async function fetchQuotationWithDetialAndStock(id) {
    return await run(() => axiosClient.get(`${apiFetchWithDetailAnStock}${id}`), {
      loadingRef: loadingQ1,
      onSuccess: (res) => {
        dataQuotationDetailStock.value = res;
      },
      successMessage: "Proceso realizado exitosamente.",
    });
  }

  async function fetchQuotationWithDetialAndStockActive(id) {
    return await run(() => axiosClient.get(`${apiFetchWithDetailAnStockActive}${id}`), {
      loadingRef: loadingQ2,
      onSuccess: (res) => {
        dataQuotationDetailAndStockActive.value = res;
      },
      successMessage: "Proceso realizado exitosamente.",
    });
  }


  async function checkStockReserved() {
    return await run(() => axiosClient.post(apiCheckStockReserved, { id: dataSendApproval.id }), {
      loadingRef: loadingApproval,
      successMessage: "Proceso realizado exitosamente.",
    });
  }

  /** denegar solicitud */
  async function denyReservation() {
    return await run(() => axiosClient.post(apiDenyReservation, { data: dataSendApproval }), {
      loadingRef: loadingDeny,
      successMessage: "Proceso realizado exitosamente.",
      onSuccess: () => { resetForm(); }
    });
  }



  /** aprobar solicitud */
  async function approveReservation() {
    return await run(() => axiosClient.post(apiApproveReservation, { data: dataSendApproval }), {
      loadingRef: loadingApproval,
      successMessage: "Proceso realizado exitosamente.",
      onSuccess: () => { resetForm(); }
    });
  }

  const apiCancelReservation = '/reservas/cancelar-solicitud-reserva'
  const loadingCancelReservation = ref(false)
  async function cancelReservation(id) {
    return await run(() => axiosClient.post(apiCancelReservation, { id }), {
       loadingRef: loadingCancelReservation,
       successMessage: "Proceso realizado exitosamente.",
    });
  }


  // validacion para limite de fecha para aprobar reservas segun punto de venta
  const limitsForPto = computed(() => {
    if (!ptoVtaReservation.value) return [];
    return ptoStore.byPunto(ptoVtaReservation.value);
  });


  function validateDateApproval() {

    // 1. VALIDACIÓN DE SEGURIDAD:
    // Si no hay datos en el array, asumimos que están cargando y no mostramos error aún.
    if (!limitsForPto.value || limitsForPto.value.length === 0) {
      return { invalid: false, message: '' };
    }

    // OJO: Aquí estás tomando siempre el índice [0] (California).
    // Asegúrate de que eso sea lo que quieres. Si el usuario está en QUITO, 
    // deberías filtrar por ID.
    const config = limitsForPto.value[0];

    const pvLimit = config?.pto_vta_max_dias_autorizacion_reserva ?? 0;

    // Si la fecha es null, no validamos
    if (!dataSendApproval.fe_autorizacion_reserva) return { invalid: false, message: '' };

    const numDay = Math.max(0, daysUntil(dataSendApproval.fe_autorizacion_reserva));

    // Si pvLimit llega a ser 0 (porque la config vino mal), bloqueamos.
    // Pero con tus datos actuales de 150, esto funcionará bien.
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


  watch(() => dataSendApproval.fe_autorizacion_reserva, (fecha) => {
    if (!fecha) { return; }
    const { invalid, message } = validateDateApproval();
    if (invalid) {
      swalWarning(message);
      dataSendApproval.fe_autorizacion_reserva = null;
      return;
    }
  },
    { immediate: false });

  return {
    fetchQuotationWithDetial,
    dataQuotationDetailStock,
    fetchQuotationWithDetialAndStock,
    loadingDeny,
    checkStockReserved,
    denyReservation,
    dataSendApproval,
    loadingApproval,
    approveReservation,
    fetchQuotationWithDetialAndStockActive,
    resetForm,
    ptoVtaReservation,

    cancelReservation,
  };
}
