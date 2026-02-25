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


    const apiRecived = 'bodegas/transferencia-venta/guia-remision/recibir-guia-transferencia-venta';
    const loadingRecivedGuide = ref(false);
    async function receivedGuideSalesTransfer(data) {
        return await run(() => axiosClient.post(apiRecived, data), {
            loadingRef: loadingRecivedGuide,
            successMessage: "Proceso realizado exitosamente.",
        });
    }

    return {
        tipoIdentificacion,
        loading,
        createGuideTransfer,
        loadingVerifyGuide,
        verifyGuideTransfer,

        // Recibir guia de transferencia de venta
        loadingRecivedGuide,
        receivedGuideSalesTransfer,

    }
}