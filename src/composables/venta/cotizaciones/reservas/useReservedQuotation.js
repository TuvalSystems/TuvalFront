import axiosClient from "@/axios";
import { ref, onUnmounted, reactive, computed, watch } from "vue";
import { swalError } from "@/functions/swal-alert.js";
import { daysUntil } from "@/composables/venta/cotizaciones/reservas/useDaysBetween";
export function useReservedQuotation(cotizacion, tipoReservas = []) {
  const reservedValidation = ref(false);
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

  watch(
    [() => reserva.co_tipSolResInv, () => reserva.fe_solResInv],
    ([typeR, fecha], [oldTypeR, oldFecha]) => {
      if (!typeR || !fecha) {
        reservedValidation.value = false;
        return;
      }
      const newTypeReserved = tipoReservas.value.find((m) => m.id == typeR);
      if (!newTypeReserved) return;
      const numDay = Math.max(0, daysUntil(reserva.fe_solResInv)); // para que no sea numero negativo aunque se puede quitar es opcional ya que desde el inicio la fecha minima es la fecha del dia de hoy

      const limit = newTypeReserved.dias_max_reserva;
      const d = limit === 1 ? "dia" : "dias";
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + limit);
      const maxStr = maxDate.toLocaleDateString("es-EC");

      if (numDay >= newTypeReserved.dias_max_reserva) {
        swalError(
          `La fecha seleccionada excede el límite de ${limit} ${d} permitido para el tipo de reserva seleccionado. ` +
            `Elija una fecha hasta antes de ${maxStr}.`
        );
        reservedValidation.value = true;
        return;
      } else {
        reservedValidation.value = false;
      }
    },
    { immediate: false } // pon true si quieres validar también al cargar si ya hay valores
  );

  const solicitarReserva = async () => {
    reservedValidation.value = true;
    try {
      const response = await axiosClient.post(
        "/cotizaciones/reserva/guardar-solicitud-reserva",
        {
          reserva: reserva,
        }
      );
      reservedValidation.value = true;
      if (response.status === 200) {
        resetForm();
        swalSuccess("Reserva solicitada correctamente");
        reservedValidation.value = false;
        return true;
      }
    } catch (error) {
      reservedValidation.value = false;
      swalError(error.response?.data?.error || error.message);
      return false;
    }
    reservedValidation.value = false;
    return false;
  };

  return {
    reserva,
    solicitarReserva,
    reservedValidation,
    resetForm,
  };
}
