import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref } from "vue";

export function useCustomerPaymentApply() {
    const { run } = useApiAction();
    const loadingPayment = ref(false);
    const apiValidatePaymente = "cobranzas/validacion-pago-facturas";
    async function fecthDataValidate(data) {
        return run(() => axiosClient.post(apiValidatePaymente, { data }), {
            loadingRef: loadingPayment
        });
    }

    return {
        loadingPayment,
        fecthDataValidate
    };

}