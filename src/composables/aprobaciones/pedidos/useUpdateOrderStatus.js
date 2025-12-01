import axiosClient from "@/axios";
import { watch, reactive, ref, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useUpdateOrderStatus() {
    const { run } = useApiAction();
    const loadingChange = ref(false);
    const apiChangeStatus = "aprobaciones/pedido/rechazar-estado-espera";

    async function changeStatusOrderBeenWaiting(id) {
        return await run(() => axiosClient.post(apiChangeStatus, { id },
            { headers: { "Content-Type": "application/json" } }
        ), {
            loadingRef: loadingChange,
            successMessage: "Proceso realizado exitosamente.",
        })
    }
    return {
        loadingChange,
        changeStatusOrderBeenWaiting
    };
}
