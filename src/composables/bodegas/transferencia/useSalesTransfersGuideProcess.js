import { ref } from "vue";
import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";

export function useSalesTransfersGuideProcess() {
    const { run } = useApiAction();

    const tipoIdentificacion = [
        { value: "04", label: "Ruc" },
        { value: "05", label: "Cedula" },
        { value: "06", label: "Pasaporte" },
    ];
    const apiCreateGuide = `bodegas/transferencia-venta/guia-remision/crear-guia-transferencia-venta`;
    const loading = ref(false);

    async function createGuideTransfer(data) {
        return await run(() => axiosClient.post(apiCreateGuide, data), {
            loadingRef: loading,
            successMessage: "Proceso realizado exitosamente.",
        });
    }


    const apiVerifyGuide = 'bodegas/transferencia-venta/guia-remision/verificar-guia-transferencia-venta-v1';
    const loadingVerifyGuide = ref(false);

    async function verifyGuideTransfer(data) {
        return await run(() => axiosClient.post(apiVerifyGuide, data), {
            loadingRef: loadingVerifyGuide,
        });
    }


    return {
        tipoIdentificacion,
        loading,
        createGuideTransfer,
        loadingVerifyGuide,
        verifyGuideTransfer
    }
}