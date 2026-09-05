import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ORDER_API_ROUTES } from "@/constants/apiRoutes/ventas/pedidos/orderRoutes";
import { ref } from "vue";

export function useOrderActions() {
    const { run } = useApiAction();

    const loadingCancelOrder = ref(false);
    async function cancelOrder(orderId) {
        return run(() => axiosClient.post(ORDER_API_ROUTES.ACTIONS.CANCEL_ORDER, { id : orderId }),
            loadingCancelOrder,
        );
    }

    return {
        loadingCancelOrder,
        cancelOrder
    }
}