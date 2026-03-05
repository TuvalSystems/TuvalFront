import { ref } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";

export function useRepositionGuideProcess() {
    const { run } = useApiAction();
    const apiCreateGuide = `bodegas/reposiciones/guia-remision/crear-guia-reposicion`;
    const loadingReposition = ref(false);

    async function createGuideReposition(data) {
        return await run(() => axiosClient.post(apiCreateGuide, data), {
            loadingRef: loadingReposition,
            successMessage: "Proceso realizado exitosamente.",
        });
    }

    const apiDispatchReposition = 'bodegas/reposiciones/guia-remision/despachar-guia-reposicion';
    const loadingDispatchReposition = ref(false);
    async function dispatchGuideReposition(id) {
        return await run(() => axiosClient.post(apiDispatchReposition, { id: id }), {
            loadingRef: loadingDispatchReposition,
            successMessage: "Proceso realizado exitosamente.",
        });
    }

    const apiReceivedReposition = 'bodegas/reposiciones/guia-remision/recibir-guia-reposicion';
    const loadingReceivedReposition = ref(false);
    async function receivedGuideReposition(data) {
        return await run(() => axiosClient.post(apiReceivedReposition, data), {
            loadingRef: loadingReceivedReposition,
            successMessage: "Proceso realizado exitosamente.",
        });
    }

    return {
        loadingReposition,
        createGuideReposition,
        // despachar guia de reposicion
        loadingDispatchReposition,
        dispatchGuideReposition,
        // recibir guia de reposicion 
        loadingReceivedReposition,
        receivedGuideReposition
    }



}