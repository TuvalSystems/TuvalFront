import axiosClient from "@/axios";
import { DEVOLUTION_API_ROUTES } from "@/constants/apiRoutes/devoluciones/devolutionRoutes";
import { ref } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useOrderReturnData() {
  const { loading, run } = useApiAction();
  const info = ref(null);

  function resetOrderReturnData() {
    info.value = null;
  }

  function fetchOrderReturnData(orderId) {
    resetOrderReturnData();
    return run(() => axiosClient.post(
      DEVOLUTION_API_ROUTES.ACTIONS.ORDER_RETURN_DATA,
      { id: orderId }
    ), {
      onSuccess: (data) => { info.value = data; },
    });
  }

  return { loading, info, fetchOrderReturnData, resetOrderReturnData };
}
