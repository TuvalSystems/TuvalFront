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


    const apiSendSalesTransfer = 'bodegas/transferencia-venta/guia-remision/despachar-guia-transferencia-venta';
    const loadingSendGuide = ref(false);
    async function sendGuideSalesTransfer(id) {
        return await run(() => axiosClient.post(apiSendSalesTransfer, { id: id }), {
            loadingRef: loadingSendGuide,
            successMessage: "Proceso realizado exitosamente.",
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
        // despachar guia de transferencia de venta
        loadingSendGuide,
        sendGuideSalesTransfer,

        // Recibir guia de transferencia de venta
        loadingRecivedGuide,
        receivedGuideSalesTransfer,

    }
}