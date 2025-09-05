import axiosClient from "@/axios";
import axios from "axios";
import { ref, onUnmounted, reactive } from "vue";
import { swalError } from "@/functions/swal-alert.js";

export function useReservedQuotation(cotizacion, tipoReservas = []) {
  let controller = null;
  const reserva = reactive({
    id: null,
    co_tipSolResInv: null,
    co_tipTrasResInv: null,
    fe_solResInv: null,
    co_tipSolResInv: null,
    tx_obsSolResInv: null,
  });
  function mapHeader(payload) {
    return payload;
  }

  function cancel() {
    if (controller) {
      controller.abort();
      controller = null;
    }
  }



  async function solicitarReserva(){
    reserva.id = cotizacion.id;
    console.log(reserva, cotizacion);
  }

  onUnmounted(cancel);
  return {
    reserva,
    solicitarReserva
  };
}
