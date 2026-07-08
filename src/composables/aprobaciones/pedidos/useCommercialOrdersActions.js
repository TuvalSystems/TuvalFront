import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { APPROVAL_API_ROUTES } from "@/constants/apiRoutes/aprobaciones/approvalRoutes";
import { ref } from "vue";

export function useCommercialOrdersActions() {

    const { run } = useApiAction();

    const loadingCommercialApproval = ref(false);
    async function approveComercialOrder(id, msg) {    
       return run(() => axiosClient.post(APPROVAL_API_ROUTES.COMERCIAL_APROBAR_PEDIDO, {
            id: id, msg: msg
        }), {
            loadingRef: loadingCommercialApproval
        });
    }

    const loadingCommercialRejection = ref(false);
    async function rejectionCommercialOrder(id, msg) {
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.COMERCIAL_RECHAZAR_PEDIDO, { id: id, msg: msg }), {
            loadingRef: loadingCommercialRejection
        });
    }

    const loadingCommercialRejectionStock = ref(false);
    async function rejectionCommercialOrderStock(id, msg) {
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.COMERCIAL_RECHAZAR_PEDIDO_POR_STOCK, { id: id, msg: msg }), {
            loadingRef: loadingCommercialRejectionStock
        });
    }

    return {
        loadingCommercialApproval,
        approveComercialOrder,
        loadingCommercialRejection,
        rejectionCommercialOrder,
        loadingCommercialRejectionStock,
        rejectionCommercialOrderStock
    }
}