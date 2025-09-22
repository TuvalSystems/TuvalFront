import axiosClient from "@/axios";
import { ref, reactive, watch, unref } from "vue";
import { swalError } from "@/functions/swal-alert.js";
import { daysUntil } from "@/composables/venta/cotizaciones/reservas/useDaysBetween";
export function useQuotationReserveRequest(datoReserva, tipoReservas = []) {
  const reservedValidation = ref(false);
  const isInvalid = ref(false);
  const isInvalidType = ref(false);
  const reserva = reactive({
    id: null,
    co_tipSolResInv: null,
    co_tipTrasResInv: null,
    fe_solResInv: null,
    tx_obsSolResInv: null,
  });

  function resetForm() {
    reserva.id = null;
    reserva.co_tipSolResInv = null;
    reserva.co_tipTrasResInv = null;
    reserva.fe_solResInv = null;
    reserva.tx_obsSolResInv = null;
  }

  function validateSolicitudReserveDate() {
    const tipos = unref(tipoReservas) ?? [];
    const newTypeReserved = tipos.find((m) => m.id == reserva.co_tipSolResInv);
    if (!newTypeReserved) return;
    const limit = newTypeReserved.dias_max_reserva ?? 0;
    const numDay = Math.max(0, daysUntil(reserva.fe_solResInv));

    const d = limit === 1 ? "dia" : "dias";
    const limitStr = `${limit} ${d}`;
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + limit);
    const maxStr = maxDate.toLocaleDateString("es-EC");
    const invalid = numDay > limit;
    return {
      invalid,
      message: `La fecha excede el límite de ${limitStr}. Elija hasta ${maxStr}.`,
    };
  }

  function validateTypeReserveHasItemLOrService() {
    const dataCot = unref(datoReserva) ?? {};
    const isType1 = Number(reserva.co_tipSolResInv) === 1;
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
      () => Number(reserva.co_tipSolResInv),
      () => !!unref(datoReserva)?.has_l_items,
      () => !!unref(datoReserva)?.has_service_items,
    ],
    () => {
      const { invalid, message } = validateTypeReserveHasItemLOrService();
      isInvalidType.value = invalid;

      if (invalid) {
        reserva.co_tipSolResInv = null;
        swalError(message);
      }
    },
    { immediate: true }
  );

  watch(
    [() => reserva.co_tipSolResInv, () => reserva.fe_solResInv],
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

  const solicitarReserva = async () => {
    if (isInvalid.value) {
      return false;
    }
    if (isInvalidType.value) {
      return false;
    }
    if (reserva.co_tipSolResInv === null) {
      throw new Error("Seleccione un tipo de reserva");
    }
    if (reserva.co_tipSolResInv === null) {
      throw new Error("Seleccione un tipo de reserva");
    }
    if (reserva.co_tipSolResInv === null) {
      throw new Error("Seleccione un tipo de reserva");
    }
    if (reserva.fe_solResInv === null) {
      throw new Error("Seleccione una fecha");
    }
    if (reserva.tx_obsSolResInv === null) {
      throw new Error("Debe ingresar una observación");
    }

    try {
      isInvalid.value = true;
      isInvalidType.value = true;
      const response = await axiosClient.post(
        "/cotizaciones/reserva/guardar-solicitud-reserva",
        {
          reserva: reserva,
        }
      );
      if (response.status === 200) {
        resetForm();
        swalSuccess("Reserva solicitada correctamente");
        isInvalid.value = false;
        isInvalidType.value = false;
        return true;
      }
    } catch (error) {
      swalError(error.response?.data?.error || error.message);
      isInvalid.value = false;
      isInvalidType.value = false;

      return false;
    }
    return false;
  };

  return {
    reserva,
    solicitarReserva,
    reservedValidation,
    isInvalid,
    resetForm,
    isInvalidType,
  };
}
