import axiosClient from "@/axios";
import { ref } from "vue";
import { swalError } from "@/functions/swal-alert.js";
import { useApiAction } from "@/composables/core/useApiAction";
import { CLIENT_API_ROUTES } from "@/constants/apiRoutes/ventas/cliente/clientRoutes";

export function useGetSegmentClients() {
  const { run } = useApiAction();
  const segmentos = ref([]);
  const subsegmentos = ref([]);
  const loadingSegmentos = ref(false);
  const loadingSubSegmentos = ref(false);

  async function fetchSegmentos() {

    return run(() => axiosClient.post(CLIENT_API_ROUTES.ACTIONS.SEGMENTS), {
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
    return run(() => axiosClient.post(CLIENT_API_ROUTES.ACTIONS.SUB_SEGMENTS, { segmento: segmentoTxt }), {
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

  return {
    segmentos,
    subsegmentos,
    loadingSegmentos,
    loadingSubSegmentos,
    fetchSegmentos,
    fetchSubSegmentos,
  };
}
