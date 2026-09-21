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
            responsable_pago: payload?.responsable_pago,
            punto_venta_ids : payload?.punto_venta_ids
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

    const loadingDetail = ref(false);
    const detail = ref(null);
    async function getDetailDispatchType(id){
        detail.value = null;
        return run(()=>axiosClient.post(QUOTE_API_ROUTES.DISPATCH_TYPE.GET_DETAIL, {id: id}),{
            loadingRef : loadingDetail,
            onSuccess : (info)=> {
                const record = Array.isArray(info) ? info[0] : info;
                detail.value = record && typeof record === 'object'
                    ? { ...record, id: record.id ?? id }
                    : null;
            }
        });
    }


    async function updateStatusDispatchType(id) {
        return run(() => axiosClient.post(QUOTE_API_ROUTES.DISPATCH_TYPE.UPDATED_STATUS, { id: id }), {
            loadingRef: saving
        });
    }

    const loadingPointSales = ref(false);
    const listPointSales = ref([]);
    async function fetchListPointSales() {
        return run(() => axiosClient.get(QUOTE_API_ROUTES.DISPATCH_TYPE.LIST_POINT_SALES), {
            loadingRef: loadingPointSales,
            onSuccess: (info) => {
                listPointSales.value = Array.isArray(info) ? info : [];
            }
        });
    }

    return {
        saving,
        saveDispatchType,
        updateDispatchType,
        updateStatusDispatchType,
        listPointSales,
        loadingPointSales,
        fetchListPointSales,

        //detail 
        loadingDetail,
        detail,
        getDetailDispatchType

    }
}
