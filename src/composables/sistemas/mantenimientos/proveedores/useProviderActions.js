import axiosClient from "@/axios";
import { ref } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { PROVIDER_API_ROUTES } from "@/constants/apiRoutes/ventas/proveedores/providerRoutes";
import { reactive } from "vue";

export function useProviderActions() {
    const { run } = useApiAction();

    const loadingCarrierProvider = ref(false);
    async function updateStatusCarrierProvider(id) {
        return await run(() => axiosClient.put(`${PROVIDER_API_ROUTES.UPDATED_CARRIER}/${encodeURIComponent(id)}`), {
            loadingRef: loadingCarrierProvider,
            onError: (backend, error) => {
                console.error(backend, error);
            },
        });
    }

    const loadingStatusProvider = ref(false);
    async function updateStatusProvider(id) {
        return await run(() => axiosClient.put(`${PROVIDER_API_ROUTES.UPDATED_STATUS}/${encodeURIComponent(id)}`), {
            loadingRef: loadingStatusProvider,
            onError: (backend, error) => {
                console.error(backend, error);
            },
        });
    }

    const loadingActiveProviders = ref(false);
    const activeProviders = ref([]);
    async function fetchActiveProviders() {
        return await run(() => axiosClient.get(PROVIDER_API_ROUTES.LIST_PROVIDER_ACTIVE), {
            loadingRef: loadingActiveProviders,
            onSuccess: (info) => {
                activeProviders.value = Array.isArray(info) ? info : [];
            }
        });
    }


    const loadingDetailProvider = ref(false);
    const detailProvider = ref(null);
    async function fetchDetailProvider(id) {
        detailProvider.value = null;
        return run(() => axiosClient.post(PROVIDER_API_ROUTES.DETAIL, {
            id: id
        }), {
            loadingRef: loadingDetailProvider,
            onSuccess: (info) => {
                const record = Array.isArray(info) ? info[0] : info;
                detailProvider.value = record && typeof record === "object"
                    ? { ...record, id: record.id ?? id }
                    : null;
            }
        });
    }

    const formProvider = reactive({
        'punto_venta_ids': []
    });

    const loadingSyncProviders = ref(false);
    async function syncPointSalesByProvider(id) {
        return run(() => axiosClient.post(PROVIDER_API_ROUTES.SYNC_POINT_SALES_PROVIDER, {
            id: id,
            punto_venta_ids: [...formProvider.punto_venta_ids]
        }),
            {
                loadingRef: loadingSyncProviders
            });
    }

    function resetFormProvider() {
        formProvider.punto_venta_ids = [];
    }


    return {
        loadingCarrierProvider,
        updateStatusCarrierProvider,
        loadingStatusProvider,
        updateStatusProvider,

        //lista proveedores activos para cotizacion-detalle-proveedores
        loadingActiveProviders,
        fetchActiveProviders,
        activeProviders,


        //para sincronizar los punto de venta de proveedores
        fetchDetailProvider,
        detailProvider,
        loadingDetailProvider,
        formProvider,
        loadingSyncProviders,
        syncPointSalesByProvider,
        resetFormProvider

    }
}
