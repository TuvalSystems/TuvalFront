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
    return {
        loadingReposition,
        createGuideReposition
    }
}