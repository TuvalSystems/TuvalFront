import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ORDER_API_ROUTES } from "@/constants/apiRoutes/ventas/pedidos/orderRoutes";
import { ref } from "vue";

export function useOrderActions() {
    const { run } = useApiAction();

    const loadingCancelOrder = ref(false);
    async function cancelOrder(orderId) {
        return run(() => axiosClient.post(ORDER_API_ROUTES.ACTIONS.CANCEL_ORDER, { id: orderId }),
            loadingCancelOrder,
        );
    }



    const loadingCancel = ref(false);
    async function cancelOrderStatusSending(id) {
        return run(() => axiosClient.post(ORDER_API_ROUTES.ACTIONS.CANCEL_ORDER_BY_STATUS_SENDING, { id: id }),
            loadingCancelOrder
        );
    }


    return {
        loadingCancelOrder,
        cancelOrder,
        loadingCancel,
        cancelOrderStatusSending

    }
}