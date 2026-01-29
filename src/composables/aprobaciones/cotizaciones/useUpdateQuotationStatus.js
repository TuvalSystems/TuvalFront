import axiosClient from "@/axios";
import { watch, reactive, ref, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useUpdateQuotationStatus() {
    const { run } = useApiAction();
    const loadingChange = ref(false);
    const apiChangeStatus = "aprobaciones/cotizacion/rechazar-estado-espera";

    async function changeStatusQuoteBeenWaiting(id) {
        return run(() => axiosClient.post(apiChangeStatus, { id },
            { headers: { "Content-Type": "application/json" } }
        ), {
            loadingRef: loadingChange,
            successMessage: "Proceso realizado exitosamente.",
        })
    }
    return {
        loadingChange,
        changeStatusQuoteBeenWaiting
    };
}
