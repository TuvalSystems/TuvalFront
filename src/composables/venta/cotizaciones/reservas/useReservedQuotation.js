import axiosClient from "@/axios";
import axios from "axios";
import { ref, onUnmounted, reactive, computed, watch } from "vue";
import { swalError } from "@/functions/swal-alert.js";
import {
  daysSince,
  daysBetweenRaw,
} from "@/composables/venta/cotizaciones/reservas/useDaysBetween";
export function useReservedQuotation(cotizacion, tipoReservas = []) {
  const reservedValidation = ref(false);
  const reserva = reactive({
    id: null,
    co_tipSolResInv: null,
    co_tipTrasResInv: null,
    fe_solResInv: null,
    tx_obsSolResInv: null,
  });

  const selectTypeReserva = computed(() => {
    tipoReservas.find((tipo) => tipo.id == reserva.co_tipSolResInv);
  });
  // console.log(selectTypeReserva);

  // const isValidDate = computed(() => {
  //   const numDay = daysSince(reserva.fe_solResInv);
  //   if (numDay >= selectTypeReserva.dias_max_reserva) {
  //     swalError(
  //       `La reserva no puede ser mayor a ${selectTypeReserva.dias_max_reserva} dias`
  //     );
  //     return false;
  //   } else {
  //     return true;
  //   }
  // });

  watch(
    () => reserva.co_tipSolResInv,
    (typeR) => {
      if (!typeR)return
   
      const newTypeReserved = tipoReservas.value.find((m) => m.id == typeR);
      
      const numDay = daysSince(reserva.fe_solResInv);
      console.log(numDay,'numDay', newTypeReserved.dias_max_reserva,'dias_max_reserva');
      if (numDay >= newTypeReserved.dias_max_reserva) {
        swalError(
          `La reserva no puede ser mayor a ${newTypeReserved.dias_max_reserva} dias`
        );
        reserva.co_tipSolResInv = null;
        reservedValidation.value = true;
      }
      reservedValidation.value = false;
    }
  );

  async function solicitarReserva() {
    reserva.id = cotizacion.id;
    console.log(reserva, cotizacion);
  }

  return {
    reserva,
    solicitarReserva,
    reservedValidation,
  };
}
