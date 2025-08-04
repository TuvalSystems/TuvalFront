import axiosClient from "../../../axios";
import { ref } from "vue";
import { swalError, swalSuccess } from "@/functions/swal-alert.js";

export function useGetSegmentClients() {
  const segmentos = ref([]);
  const subsegmentos = ref([]);
  const loadingSegmentos = ref(false);
  const loadingSubSegmentos = ref(false);

  async function fetchSegmentos() {
    loadingSegmentos.value = true;
    try {
      const response = await axiosClient.post(
        "/cotizaciones/obtener-segmentos"
      );
      const res = response.data;
      loadingSegmentos.value = false;
      segmentos.value = res.data;
    } catch (error) {
      console.log("Error al obtener los segmentos", error);
      swalError(error.response.data.error);
      return;
    } finally {
      loadingSegmentos.value = false;
    }
  }

  async function fetchSubSegmentos(segmentoTxt) {
    console.log(segmentoTxt, "segmentoId");
    {
      loadingSubSegmentos.value = true;
      try {
        const response = await axiosClient.post(
          "/cotizaciones/obtener-subsegmentos",
          { segmento: segmentoTxt },
          { headers: { "Content-Type": "application/json" } }
        );
        const res = response.data;
        loadingSubSegmentos.value = false;
        subsegmentos.value = res.data;
      } catch (error) {
        console.log("Error al obtener los subsegmentos", error);
        swalError(error.response.data.error);
        return;
      } finally {
        loadingSubSegmentos.value = false;
      }
    }
  }

  return {
    segmentos,
    subsegmentos,
    loadingSegmentos,
    loadingSubSegmentos,
    fetchSegmentos,
    fetchSubSegmentos,
  };
}
