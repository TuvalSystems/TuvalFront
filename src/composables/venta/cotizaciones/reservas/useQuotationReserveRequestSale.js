import axiosClient from "@/axios";
import { ref, reactive, watch, unref, onMounted, computed } from "vue";
import { swalError } from "@/functions/swal-alert.js";
import { daysUntil } from "@/composables/venta/cotizaciones/reservas/useDaysBetween";
import { usePuntosVentaReservaLimits } from "@/stores/cotizaciones/reservas/usePuntosVentaReservaLimits";
import { useApiAction } from "@/composables/core/useApiAction";

export function useQuotationReserveRequestSale(datoReserva) {
  const ptoStore = usePuntosVentaReservaLimits();
  const reservedValidation = ref(false);
  const isInvalid = ref(false);
  // const isInvalidType = ref(false);
  const { run } = useApiAction();

  const reserva = reactive({
    cotizacion_id: null,
    tipo_reserva_id: null,
    tipo_traslado_reserva_id: null,
    fe_solicitud_reserva: null,
    obs_solicitud_reserva: null,
  });

  const apiSolicitud = "/reservas/guardar-solicitud-reserva";
  function resetForm() {
    reserva.cotizacion_id = null;
    reserva.tipo_reserva_id = null;
    reserva.tipo_traslado_reserva_id = null;
    reserva.fe_solicitud_reserva = null;
    reserva.obs_solicitud_reserva = null;
  }

  // obtengo el punto de venta de la cotización para validación
  const ptoVtaId = computed(() => unref(datoReserva)?.PTO_VTA_ID ?? null);

  // limites por punto de venta ( array de objetos )
  const limitsForPto = computed(() => {
    if (!ptoVtaId.value) return [];
    return ptoStore.byPunto(ptoVtaId.value);
  });

  function validateSolicitudReserveDate() {
    const pvLimit = limitsForPto.value[0]?.pto_vta_max_dias_reserva ?? 0;

    const numDay = Math.max(0, daysUntil(reserva.fe_solicitud_reserva));
    const d = pvLimit === 1 ? "dia" : "dias";
    const limitStr = `${pvLimit} ${d}`;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + pvLimit);
    const maxStr = maxDate.toLocaleDateString("es-EC");
    const invalid = numDay > pvLimit;
    return {
      invalid,
      message: `La fecha de solicitud de reserva excede el límite de ${limitStr}. Elija hasta ${maxStr}.`,
    };
  }

  function validateTypeReserveHasItemLOrService() {
    const dataCot = unref(datoReserva) ?? {};
    const isType1 = Number(reserva.tipo_reserva_id) === 1;
    const hasL = !!dataCot.has_l_items;
    const hasServ = !!dataCot.has_service_items;

    const invalid = isType1 && (hasL || hasServ);
    return {
      invalid,
      message:
        "No puede generar una solicitud de Reserva si la cotización tiene un item L o servicio",
    };
  }

  watch(
    [
      () => Number(reserva.tipo_reserva_id),
      () => !!unref(datoReserva)?.has_l_items,
      () => !!unref(datoReserva)?.has_service_items,
    ],
    () => {
      const { invalid, message } = validateTypeReserveHasItemLOrService();
      isInvalid.value = invalid;
      
      if (invalid) {
        reserva.tipo_reserva_id = null;
        isInvalid.value = true;
        swalError(message);
      }
    },
    { immediate: true }
  );

  watch(
    [() => reserva.tipo_reserva_id, () => reserva.fe_solicitud_reserva],
    ([typeR, fecha]) => {
      if (!typeR || !fecha) {
        isInvalid.value = false;
        return;
      }
      const { invalid, message } = validateSolicitudReserveDate();
      isInvalid.value = invalid;
      if (invalid) swalError(message);
    },
    { immediate: false } // pon true si quieres validar también al cargar si ya hay valores
  );

  async function solicitarReserva() {
    if (isInvalid.value) {
      return false;
    }
    if (reserva.tipo_reserva_id === null) {
      return returnErrorMessage("Seleccione un tipo de reserva");
    }
    if (reserva.tipo_reserva_id === 1) {
      if (reserva.tipo_traslado_reserva_id === null) {
        return returnErrorMessage("Seleccione un tipo de traslado");

      }
    }
    if (reserva.fe_solicitud_reserva === null) {
      return returnErrorMessage("Seleccione una fecha");

    }
    if (reserva.obs_solicitud_reserva === null) {
      return returnErrorMessage("Ingrese una observación");

    }
    if (reserva.tipo_reserva_id === 2) {
      reserva.tipo_traslado_reserva_id = null;
    }

    return await run(() => axiosClient.post(apiSolicitud, { reserva: reserva }), {
      loadingRef: isInvalid,
      successMessage: "Reserva solicitada correctamente.",
    });
  };

  function returnErrorMessage(message) {
    return { ok: false, message: message };
  }

  onMounted(async () => {
    if (!unref(ptoStore).puntosVentaReservaLimits) {
      await ptoStore.fetchPuntosVentaReservaLimits();
    }
  });

  return {
    reserva,
    solicitarReserva,
    reservedValidation,
    isInvalid,
    resetForm,
  };
}
