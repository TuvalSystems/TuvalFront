import { ref, nextTick } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";

export function useSalesTransfersProcess() {
    const { run } = useApiAction();
    const loadingCancelPicking = ref(false);
    const apiCancelPicking = 'bodegas/transferencias/cancelar-picking';

    async function cancelPicking(row) {
        return await run(() => axiosClient.post(apiCancelPicking, { payload : row }), {
            loadingRef: loadingCancelPicking,
            successMessage: "Proceso realizado exitosamente.",
        });
    }
    return {
        loadingCancelPicking,
        cancelPicking
    }
}