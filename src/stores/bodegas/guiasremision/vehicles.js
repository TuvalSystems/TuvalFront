import { defineStore } from "pinia";
import { ref } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { swalError } from "@/functions/swal-alert.js";
export const useVehiclesStore = defineStore("vehicles", () => {
    const list = ref([]);
    const loading = ref(false);
    const { run } = useApiAction();
    const apiVehicle = "/reservas/transferencias/lista-vehiculos";


    async function fetch({ force = false } = {}) {
        if (list.value.length && !force) return list.value;

        return run(() => axiosClient.post(apiVehicle), {
            loadingRef: loading,
            successMessage: "Items cargados correctamente.",
            onSuccess: (arr) => { list.value = arr || []; },
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

    function clear() { list.value = []; }

    return { list, loading, fetch, clear };

});