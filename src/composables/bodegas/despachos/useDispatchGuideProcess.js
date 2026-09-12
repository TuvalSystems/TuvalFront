import { ref } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";


export function useDispatchGuideProcess() {
    const { run } = useApiAction();

    const tipoIdentificacion = [
        { value: "04", label: "Ruc" },
        { value: "05", label: "Cedula" },
        { value: "06", label: "Pasaporte" },
    ];
    const apiCreateGuide = `bodegas/despachos/guia-remision/crear-guia-despacho`;
    const loading = ref(false);
    async function createGuideDispatch(data) {
        return await run(() => axiosClient.post(apiCreateGuide, data), {
            loadingRef: loading,
            successMessage: "Proceso realizado exitosamente.",
        });
    }

    const loadingDispatch = ref(false);
    const apiDispatchGuide = 'bodegas/despachos/guia-remision/despachar-guia';
    async function dispathGuide(id) {
        return await run(() => axiosClient.post(apiDispatchGuide, { id: id }), {
            loadingRef: loadingDispatch,
            successMessage: "Proceso realizado exitosamente.",

        });
    }

    return {
        tipoIdentificacion,
        loading,
        createGuideDispatch,
        loadingDispatch,
        dispathGuide
    }
}