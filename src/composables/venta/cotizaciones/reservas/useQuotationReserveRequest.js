import axiosClient from "@/axios";
import { ref, reactive, watch, unref } from "vue";
import { swalError } from "@/functions/swal-alert.js";
import { daysUntil } from "@/composables/venta/cotizaciones/reservas/useDaysBetween";
export function useQuotationReserveRequest(cotizacion, tipoReservas = []) {
  const reservedValidation = ref(false);
  const isInvalid = ref(false);
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

  watch(
    [() => reserva.co_tipSolResInv, () => reserva.fe_solResInv],
    ([typeR, fecha]) => {
      if (!typeR || !fecha) {
        isInvalid.value = false;
        return;
      }
      const { invalid, message } = validateSolicitudReserveDate();
      if (invalid) {
        isInvalid.value = true;
        swalError(message);
      } else {
        isInvalid.value = false;
      }
    },
    { immediate: false } // pon true si quieres validar también al cargar si ya hay valores
  );

  const solicitarReserva = async () => {
    if (isInvalid.value) return false;
    // reservedValidation.value = true;
    try {
      const response = await axiosClient.post(
        "/cotizaciones/reserva/guardar-solicitud-reserva",
        {
          reserva: reserva,
        }
      );
      // reservedValidation.value = true;
      if (response.status === 200) {
        resetForm();
        swalSuccess("Reserva solicitada correctamente");
        // reservedValidation.value = false;
        return true;
      }
    } catch (error) {
      // reservedValidation.value = false;
      swalError(error.response?.data?.error || error.message);
      return false;
    }
    // reservedValidation.value = false;
    return false;
  };

  return {
    reserva,
    solicitarReserva,
    reservedValidation,
    isInvalid,
    resetForm,
  };
}
