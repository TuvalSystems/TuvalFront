import axiosClient from "@/axios";
import { watch, ref, reactive } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useUnapplicationProcess() {
    const { run } = useApiAction();
    const apiDetail = 'cobranzas/desaplicaciones/detalle';
    const loadingDetail = ref(false);
    const detailPayment = ref({
        activos: [],
        inactivos: [],
        collectionsIds: [],
        receiptNumbers: [],
    });

    async function getDetail(ruc, factura) {
        return run(() => axiosClient.post(apiDetail, {
            ruc: ruc,
            factura: factura
        }), {
            loadingRef: loadingDetail,
            onSuccess: (info) => {
                detailPayment.value = {
                    activos: info?.activos ?? [],
                    inactivos: info?.inactivos ?? [],
                    collectionsIds: info?.collectionsIds ?? [],
                    receiptNumbers: info?.receiptNumbers ?? [],
                };
            },
            onError: () => {
                detailPayment.value = {
                    activos: [],
                    inactivos: [],
                    collectionsIds: [],
                    receiptNumbers: [],
                };
            },
        });
    }

    const apiUpdate = 'cobranzas/desaplicaciones/procesar';
    const loadingUpdate = ref(false);
    async function updateUnapplicationItems(payload) {
        return run(() => axiosClient.post(apiUpdate, {
            payload: payload,
        }, {
            loadingRef: loadingUpdate,
        }));
    }

    return {
        detailPayment,
        loadingDetail,
        getDetail,

        //procesar
        loadingUpdate,
        updateUnapplicationItems,
    };
}