import { ref } from "vue";
import axiosClient from "@/axios";
import { useStore } from "vuex";
import { swalError } from "@/functions/swal-alert.js";
import { useApiAction } from "@/composables/core/useApiAction";
export function useReservationTransfers(){
/** composable para manejar la transferencia de reservas */
  const { run } = useApiAction();

  const store = useStore();
  const ptoVtaId = store.state.puntodeventaselect;
  const dataTransfer = ref(null);
  const loadingTransfer = ref(false);
  const apiListTransferByWarehouse =`reservas/transferencias/traslados-por-reserva-dashboard/${ptoVtaId}`;

  async function fetchListTransfersCount() {

     return  run(() => axiosClient.get(apiListTransferByWarehouse), {
      loadingRef: loadingTransfer,
      successMessage: "Proceso realizado exitosamente.",
       onSuccess: (list) => {
        dataTransfer.value = list; // list ya es response.data.data
      },
      onError: (backend, error) => {
        swalError(
          backend?.error ||
          backend?.message ||
          error?.message ||
          "Error al obtener la información"
        );
      },
    });
  }

  return {
    //states
    dataTransfer,
    loadingTransfer,

    //functions
    fetchListTransfersCount
  }
}
