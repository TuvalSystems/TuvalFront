import axiosClient from "@/axios";
import { ref } from "vue";
import { swalError } from "@/functions/swal-alert.js";

export function useFetchTransportAndVehicle() {
  const vehiculos = ref([]);
  const transportes = ref([]);
  const loadingVehiculos = ref(false);
  const loadingTransportes = ref(false);
  const apiVehicle = "/reservas/transferencias/lista-vehiculos";
  const apiPersonalTransport = "/reservas/transferencias/lista-transportistas";
  async function fetchVehiculos() {
    loadingVehiculos.value = true;
    try {
      const response = await axiosClient.post(apiVehicle);
      const res = response.data;
      loadingVehiculos.value = false;
      vehiculos.value = res.data;
    } catch (error) {
      let msg =
        error?.response?.data?.error ||
        error?.message ||
        "Error al obtener los vehiculos.";
      console.log("Error al obtener los vehiculos", msg);
      swalError(msg);
      return;
    } finally {
      loadingVehiculos.value = false;
    }
  }

  async function fetchPersonalTransport(transportId) {
    {
      loadingTransportes.value = true;
      try {
        const response = await axiosClient.post(
          apiPersonalTransport,
          { vehicle_id: transportId },
          { headers: { "Content-Type": "application/json" } }
        );
        const res = response.data;
        loadingTransportes.value = false;
        transportes.value = res.data;
      } catch (error) {
        let msg =
          error?.response?.data?.error ||
          error?.message ||
          "Error al obtener los transportistas.";
        console.log("Error al obtener los transportistas", msg);
        swalError(msg);
        return;
      } finally {
        loadingTransportes.value = false;
      }
    }
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
