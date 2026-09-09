import { defineStore } from "pinia";
import { ref } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { swalError } from "@/functions/swal-alert.js";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";
export const useMotivosStore = defineStore('motivos', () => {

    const motivos = ref([]);
    const loading = ref(false);
    const error = ref(null);
    const { run } = useApiAction();

    async function fetchMotivos({ force = false } = {}) {
        if (motivos.value.length && !force) {
            return { ok: true, data: motivos.value };
        }
        error.value = null;
        return run(() => axiosClient.get(QUOTE_API_ROUTES.REMINDER.LIST_REASON_NO_SALES), {
            loadingRef: loading,
            onSuccess: (resp) => {
                error.value = null;
                motivos.value = resp || [];
            },
            onError: (backend, err) => {
                error.value = backend?.error || backend?.message || err?.message;
                swalError(error.value || "Error al obtener los motivos");
            },
        });
    }

    function clear() {
        motivos.value = [];
    }

    return {
        loading,
        motivos,
        fetchMotivos,
        clear,
        error
    }

});