import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction"
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";
import { computed, ref } from "vue";
import { useStore } from "vuex";

export function useQuoteProspectActions() {

    const store = useStore();
    const { run } = useApiAction();
    const selectedSalesPointCode = computed(
        () => store.state.puntodeventaselect
    );
    const loadingDefault = ref(false);

    async function fetchDefaultPriceListBySalesPoint() {
        return await run(() => axiosClient.post(QUOTE_API_ROUTES.PROSPECTS.GET_DEFAULT_PRICE_LIST,
            {
                pvCodigo: selectedSalesPointCode.value
            }

        ), {
            loadingRef: loadingDefault
        });
    }

    const loadingRestoreProspect = ref(false);
    async function restoreProspect(documento){
    return run(() => axiosClient.post(QUOTE_API_ROUTES.PROSPECTS.RESTORE, {
       documento : documento
    }),{
        loadingRef: loadingRestoreProspect

    });
            
    }


    return {
        loadingDefault,
        fetchDefaultPriceListBySalesPoint,
        //carga de prospecto 
        loadingRestoreProspect,
        restoreProspect,
    }
}
