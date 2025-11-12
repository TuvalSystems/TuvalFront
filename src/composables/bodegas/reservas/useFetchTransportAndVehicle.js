import axiosClient from "@/axios";
import { ref } from "vue";
import { swalError } from "@/functions/swal-alert.js";
import { useApiAction } from "@/composables/core/useApiAction";

export function useFetchTransportAndVehicle() {
  const { run } = useApiAction();
  const transportes = ref([]);
  const loadingTransportes = ref(false);
  const apiPersonalTransport = "/reservas/transferencias/lista-transportistas";

  async function fetchPersonalTransport(transportId) {
    return await run(() => axiosClient.post(apiPersonalTransport, { vehicle_id: transportId },
      { headers: { "Content-Type": "application/json" } }), {
      loadingRef: loadingTransportes,
      successMessage: "Items cargados correctamente.",
      onSuccess: (list) => {
        transportes.value = list; // list ya es response.data.data
      },
      onError: (backend, error) => {
        swalError(
          backend?.error ||
          backend?.message ||
          error?.message ||
          "Error al obtener la información"
        );
      },
    });
  }
  return {
    transportes,
    loadingTransportes,
    fetchPersonalTransport,
  };
}
