import axiosClient from "@/axios";
import { ref } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { PROVIDER_API_ROUTES } from "@/constants/apiRoutes/ventas/proveedores/providerRoutes";

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
        return await run(() => axiosClient.put(`${PROVIDER_API_ROUTES.UPDATED_CARRIER}/${encodeURIComponent(id)}`), {
            loadingRef: loadingStatusProvider,
            onError: (backend, error) => {
                console.error(backend, error);
            },
        });
    }


    return {
        loadingCarrierProvider,
        updateStatusCarrierProvider,
        loadingStatusProvider,
        updateStatusProvider
    }
}
