import axiosClient from "@/axios";
import { ref, onUnmounted, reactive, computed, watch } from "vue";

export function useValidatesReserved() {
  const dataL = ref([]);
  const dataR = ref([]);
  const loadingL = ref(false);
  const loadingRs = ref(false);

  async function fetchResponseHaveItemL(id) {
    loadingL.value = true;
    try {
      const { data } = await axiosClient.get(
        `/cotizaciones/reserva/validar-item-l/${id}`
      );
      loadingL.value = false;
      const payload = data?.data ?? data ?? {};
      dataL.value = payload;
      return payload;
    } catch (error) {
      console.log("Error al determinar itemL", error);
      swalError(error.response.data.error);
      return;
    } finally {
      loadingL.value = false;
    }
  }

  async function fetchResponseHaveStatusQuotation(id) {
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
    dataL,
    dataR,
    loadingL,
    loadingRs,
    fetchResponseHaveItemL,
    fetchResponseHaveStatusQuotation,
  };
}
