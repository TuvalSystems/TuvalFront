import axiosClient from "@/axios";
import { ref, onUnmounted, reactive, computed, watch } from "vue";

export function useValidatesReserved() {
  const dataR = ref([]);
  const loadingL = ref(false);
  const loadingRs = ref(false);


  async function checkExistingReserve(id) {
    loadingRs.value = true;
    try {
      const { data } = await axiosClient.get(
        `/cotizaciones/reserva/validar-reserva-cotizacion/${id}`
      );
      loadingRs.value = false;
      const payload2 = data?.data ?? data ?? {};
      dataR.value = payload2;
      return payload2;
    } catch (error) {
      console.log("Error al determinar reserva", error);
      swalError(error.response.data.error);
      return;
    } finally {
      loadingRs.value = false;
    }
  }

  return {
     // state
    dataR,
    loadingL,
    loadingRs,
    //actions 
    checkExistingReserve

  };
}
