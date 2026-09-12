import axiosClient from "@/axios";
import {  ref } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useApiValidatesOrdersReservation() {
    const { run } = useApiAction();
    const loadingValidateGuides = ref(false);
    const apiValidateGuides = '/pedidos/validar-despachos-pedidos';
    async function validateExistingGuidesWithAjustment(id) {
       return  run(() => axiosClient.post(apiValidateGuides, { id: id }), {
            loadingRef: loadingValidateGuides,
            successMessage: "Proceso realizado exitosamente.",
        });
    }

    return {
        validateExistingGuidesWithAjustment,
        loadingValidateGuides
    }
}