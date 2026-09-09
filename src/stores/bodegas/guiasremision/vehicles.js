import { defineStore } from "pinia";
import { ref } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { swalError } from "@/functions/swal-alert.js";
export const useVehiclesStore = defineStore("vehicles", () => {
    const vehicles = ref([]);
    const transporters = ref([]);
    const loading = ref(false);
    const { run } = useApiAction();
    const apiVehicle = "/reservas/transferencias/lista-vehiculos-transportistas";


    async function fetch({ force = false } = {}) {
        if ((vehicles.value.length || transporters.value.length) > 0 && !force) {
            return { vehiculos: vehicles.value, transportistas: transporters.value };
        }

        return run(() => axiosClient.post(apiVehicle), {
            loadingRef: loading,
            successMessage: "Items cargados correctamente.",
            onSuccess: (resp) => {
                vehicles.value = resp.vehiculos || [];
                transporters.value = resp.transportistas || [];
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

    function clear() {
        vehicles.value = [];
        transporters.value = [];
    }

    return { vehicles, transporters, loading, fetch, clear };

});