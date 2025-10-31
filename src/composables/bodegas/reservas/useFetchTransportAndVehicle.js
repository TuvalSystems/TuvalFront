import axiosClient from "@/axios";
import { ref } from "vue";
import { swalError } from "@/functions/swal-alert.js";
import { useApiAction } from "@/composables/core/useApiAction";

export function useFetchTransportAndVehicle() {
  const { run } = useApiAction();

  const vehiculos = ref([]);
  const transportes = ref([]);
  const loadingVehiculos = ref(false);
  const loadingTransportes = ref(false);
  const apiVehicle = "/reservas/transferencias/lista-vehiculos";
  const apiPersonalTransport = "/reservas/transferencias/lista-transportistas";
  async function fetchVehiculos() {
    return await run(() => axiosClient.post(apiVehicle), {
      loadingRef: loadingVehiculos,
      successMessage: "Items cargados correctamente.",
      onSuccess: (list) => {
        vehiculos.value = list; // list ya es response.data.data
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
    vehiculos,
    transportes,
    loadingVehiculos,
    loadingTransportes,
    fetchVehiculos,
    fetchPersonalTransport,
  };
}
