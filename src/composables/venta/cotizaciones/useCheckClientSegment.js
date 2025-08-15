import axiosClient from "../../../axios";
import { ref } from "vue";
import { swalError, swalSuccess } from "@/functions/swal-alert.js";

export function useCheckClientSegment() {
  const loadingCheck = ref(false);

  async function fetchCheckSegmentoClient(client) {
    loadingCheck.value = true;
    try {
      const response = await axiosClient.post(
        "/cotizaciones/validar-segmento-cliente",
        { cliente: client }
      );
      const res = response.data;
      loadingCheck.value = false;
      return res;
    } catch (error) {
      console.log("Error al validar el Cliente-Segmento", error);
      swalError(error.response.data.error);
      return;
    } finally {
      loadingCheck.value = false;
    }
  }

  return {
    loadingCheck,
    fetchCheckSegmentoClient,
  };
}
