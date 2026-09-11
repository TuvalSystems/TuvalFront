import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { INVOICE_COLLECTION_API_ROUTES } from "@/constants/apiRoutes/cobranzas/invoiceCollectionRoutes";
import { ref } from "vue";

export function useCustomerPaymentApply() {
    const { run } = useApiAction();
    const loadingPayment = ref(false);
    async function fecthDataValidate(data) {
        return run(() => axiosClient.post(INVOICE_COLLECTION_API_ROUTES.COLLECTIONS.VALIDATE, { data }), {
            loadingRef: loadingPayment
        });
    }

    return {
        loadingPayment,
        fecthDataValidate
    };

}
