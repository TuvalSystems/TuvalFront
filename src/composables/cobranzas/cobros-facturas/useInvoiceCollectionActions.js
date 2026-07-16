import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { INVOICE_COLLECTION_API_ROUTES } from "@/constants/apiRoutes/cobranzas/invoiceCollectionRoutes";
import { ref, computed } from "vue";
import { useStore } from 'vuex'


export function useInvoiceCollectionActions() {
    const { run } = useApiAction();
    const store = useStore();
    const selectedPointSaleId = computed(() => store.state.puntoventaselectid);
    const selectedPointSaleCode = computed(() => store.state.puntodeventaselect);


    const loadingCashBoxStatus = ref(false);
    const dataCashBoxStatus = ref(null);
    async function getUserCashBoxStatus(date = null) {
        return run(() => axiosClient.post(INVOICE_COLLECTION_API_ROUTES.GET_USER_CASH_BOX_STATUS, {
            pvId: selectedPointSaleId.value,
            pvCodigo: selectedPointSaleCode.value,
            fecha: date
        }), {
            loadingRef: loadingCashBoxStatus,
            onSuccess: (info) => {
                dataCashBoxStatus.value = info ?? null
            }
        });
    }


    const loadingOpenCashBox = ref(false);
    async function openCashBoxed(){
        return run(() => axiosClient.post(INVOICE_COLLECTION_API_ROUTES.OPEN_USER_CASH_BOX,{
            pvId : selectedPointSaleId.value
        }),{
            loadingRef :loadingOpenCashBox

        });
    }

    return {
        //obtener estado de caja
        loadingCashBoxStatus,
        getUserCashBoxStatus,
        dataCashBoxStatus,

        //aperturar caja
        loadingOpenCashBox,
        openCashBoxed
    }
}
