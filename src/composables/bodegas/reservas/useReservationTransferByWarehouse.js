import { ref } from "vue";
import axiosClient from "@/axios";
import { useStore } from "vuex";
import { swalError } from "@/functions/swal-alert.js";
import { reactive } from "vue";

export function useReservationTransferByWarehouse() {
  /** maneja el detalle de mis transferencias de reserva por bodega */
  const store = useStore();
  const ptoOrigen = store.state.puntodeventaselect;
  const dataDetailTransfer = ref(null);
  const loadingDetailTransfer = ref(false);
  const apiListTransferByWarehouse = `reservas/transferencias/lista-traslados-por-reserva-bodega`;
  const payload = reactive({
    origen: ptoOrigen,
    destino: null,
    cotizacion: null,
  });

  async function fetchListTransfersByWarehouseOriginAndDestination() {
    loadingDetailTransfer.value = true;
    try {
      validatePtoDestination();
      const response = await axiosClient.post(
        apiListTransferByWarehouse,
        payload
      );
      const res = response.data;
      loadingDetailTransfer.value = false;
      dataDetailTransfer.value = res.data;
      return dataDetailTransfer.value;
    } catch (error) {
      console.log("Error al obtener lista transferencia", error);
      swalError(error?.response?.data?.error || error?.message || "Error");
      return;
    } finally {
      loadingDetailTransfer.value = false;
    }
  }

  async function validatePtoDestination() {
    if (payload.destino === null) {
      return;
    }
  }

  return {
    //states
    dataDetailTransfer,
    loadingDetailTransfer,
    payload,

    //functions
    fetchListTransfersByWarehouseOriginAndDestination
  };
}
