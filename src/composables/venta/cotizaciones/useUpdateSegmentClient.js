import axiosClient from "../../../axios";
import { reactive } from "vue";
import { swalError, swalSuccess } from "@/functions/swal-alert.js";

export function useUpdateSegmentClient() {
  const data = reactive({
    segmento: "",
    subsegmento: "",
  });

  async function updateClientWithSegment(cliente) {
    try {
      const response = await axiosClient.post(
        "/cotizaciones/actualizar-segmento-cliente",
        {
          cliente: cliente,
          segmento: data.segmento,
          subsegmento: data.subsegmento,
        }
      );
      if (response.status === 200) {
        resetForm();
        swalSuccess("Segmento y subsegmento actualizados correctamente");
        return true;
      }
    } catch (error) {
      swalError(error.response?.data?.error || error.message);
      return false;
    }
    return false;
  }

  function resetForm() {
    data.segmento = "";
    data.subsegmento = "";
  }

  return {
    updateClientWithSegment,
    data,
    resetForm,
  };
}
