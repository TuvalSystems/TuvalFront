import axiosClient from "@/axios";
import { ref } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";

export function useDispatchTypeActions() {
    const { run } = useApiAction();
    const saving = ref(false);

    function buildPayload(payload) {
        return {
            descripcion: payload?.descripcion,
            observacion: payload?.observacion,
            responsable_pago : payload?.responsable_pago
        }
    }

    async function saveDispatchType(payload) {
        return run(() => axiosClient.post(QUOTE_API_ROUTES.DISPATCH_TYPE.CREATED, { payload: buildPayload(payload) }), {
            loadingRef: saving
        });
    }

    async function updateDispatchType(payload) {
        return run(() => {
            if (payload?.id == null) throw new Error("El ID del tipo de despacho es obligatorio.");
            return axiosClient.put(`${QUOTE_API_ROUTES.DISPATCH_TYPE.UPDATED}/${encodeURIComponent(payload.id)}`, {
                payload: buildPayload(payload)
            });
        }, {
            loadingRef: saving
        });
    }

    async function updateStatusDispatchType(id) {
        return run(() => axiosClient.post(QUOTE_API_ROUTES.DISPATCH_TYPE.UPDATED_STATUS, { id: id }), {
            loadingRef: saving
        });
    }

    return {
        saving,
        saveDispatchType,
        updateDispatchType,
        updateStatusDispatchType

    }
}
