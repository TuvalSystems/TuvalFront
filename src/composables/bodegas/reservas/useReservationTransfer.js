import { ref } from "vue";
import axiosClient from "@/axios";
import { useStore } from "vuex";
import { swalError } from "@/functions/swal-alert.js";

export function useReservationTransfers(){
/** composable para manejar la transferencia de reservas */

  const store = useStore();
  const ptoVtaId = store.state.puntodeventaselect;
  const dataTransfer = ref(null);
  const loadingTransfer = ref(false);
  const apiListTransferByWarehouse =`reservas/transferencias/traslados-por-reserva-dashboard/${ptoVtaId}`;

  async function fetchListTransfersCount() {
    loadingTransfer.value = true;
    try {
      const response = await axiosClient.get(apiListTransferByWarehouse);
      const res = response.data;
      loadingTransfer.value = false;
      dataTransfer.value = res.data;
      return dataTransfer.value;
    } catch (error) {
      console.log("Error al obtener la información", error);
      swalError(error?.response?.data?.error || error?.message || 'Error');
      return;
    } finally {
      loadingTransfer.value = false;
    }
  }

  return {
    //states
    dataTransfer,
    loadingTransfer,

    //functions
    fetchListTransfersCount
  }
}
