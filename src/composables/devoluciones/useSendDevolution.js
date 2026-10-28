import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { DEVOLUTION_API_ROUTES } from "@/constants/apiRoutes/devoluciones/devolutionRoutes";

export function useSendDevolution() {
  const { loading, run } = useApiAction();

  function sendDevolution(payload) {
    return run(() => axiosClient.post(
      DEVOLUTION_API_ROUTES.ACTIONS.SEND,
      payload
    ));
  }

  return { loading, sendDevolution };
}