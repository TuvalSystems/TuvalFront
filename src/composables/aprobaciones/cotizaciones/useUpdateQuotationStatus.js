import axiosClient from "@/axios";
import { ref } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { APPROVAL_API_ROUTES } from "@/constants/apiRoutes/aprobaciones/approvalRoutes";

export function useUpdateQuotationStatus() {
    const { run } = useApiAction();
    const loadingChange = ref(false);

    async function changeStatusQuoteBeenWaiting(id) {
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.COMERCIAL_CAMBIAR_ESTADO_COTIZACION, { id },
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
