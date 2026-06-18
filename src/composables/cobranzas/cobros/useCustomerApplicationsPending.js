import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref } from "vue";

export function useCustomerApplicationsPending() {
    const { run } = useApiAction();
    const isUpdatingApplicationBalances = ref(false);
    const apiUpdateList = 'cobranzas/actualizar-aplicaciones-pendientes';

    async function refreshPendingApplicationDocumentBalances(clientId, documents) {
        return run(() => axiosClient.post(apiUpdateList, {
            clienteId: clientId,
            documentos: documents
        }), {
            loadingRef: isUpdatingApplicationBalances,
        });
    }
    return {
        isUpdatingApplicationBalances,
        refreshPendingApplicationDocumentBalances
    }
}