import axiosClient from "@/axios";
import { ref } from "vue";
import { swalError } from "@/functions/swal-alert.js";
import { useApiAction } from "@/composables/core/useApiAction";

export function useGetSegmentClients() {
  const { run } = useApiAction();
  const apiSegments = "/cotizaciones/obtener-segmentos";
  const apiSubSegments = "/cotizaciones/obtener-subsegmentos";
  const apiIdentify = "/cotizaciones/lista-tipo-identificaciones";
  const segmentos = ref([]);
  const subsegmentos = ref([]);
  const loadingSegmentos = ref(false);
  const loadingSubSegmentos = ref(false);

  async function fetchSegmentos() {

    return run(() => axiosClient.post(apiSegments), {
      loadingRef: loadingSegmentos,
      onSuccess: (data) => {
        segmentos.value = data ?? []
      },
      onError: (backend, error) => {
        swalError(
          backend?.error ||
          backend?.message ||
          error?.message ||
          "Error al obtener la información"
        );
      }
    });
  }

  async function fetchSubSegmentos(segmentoTxt) {
    return run(() => axiosClient.post(apiSubSegments, { segmento: segmentoTxt }), {
      loadingRef: loadingSubSegmentos,
      onSuccess: (data) => {
        subsegmentos.value = data ?? []
      },
      onError: (backend, error) => {
        swalError(
          backend?.error ||
          backend?.message ||
          error?.message ||
          "Error al obtener la información"
        );
      }
    });
  }

  const loadingIdentify = ref(false);
  const listTypeIdentify = ref([]);
  async function getListTypeIdentify() {
    return run(() => axiosClient.get(apiIdentify), {
      loadingRef: loadingIdentify,
      onSuccess: (data) => {
        listTypeIdentify.value = data;
      }
    });
  }





  return {
    segmentos,
    subsegmentos,
    loadingSegmentos,
    loadingSubSegmentos,
    fetchSegmentos,
    fetchSubSegmentos,
    loadingIdentify,
    listTypeIdentify,
    getListTypeIdentify
  };
}
