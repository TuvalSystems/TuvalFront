import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { COBROS_FACTURAS_API_ROUTES } from "@/constants/apiRoutes/cobranzas/invoiceCollectionRoutes";
import { ref, computed } from "vue";
import { useStore } from 'vuex'


export function useInvoiceCollection() {
    const { run } = useApiAction();
    const store = useStore();
    const selectedPointSaleId = computed(() => store.state.puntoventaselectid);
    const selectedPointSaleCode = computed(() => store.state.puntodeventaselect);


    const loadingCashBoxStatus = ref(false);
    const dataCashBoxStatus = ref(null);
    async function getUserCashBoxStatus(date = null) {
        return run(() => axiosClient.post(COBROS_FACTURAS_API_ROUTES.OBTENER_ESTADO_CAJA_USUARIO, {
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
        return run(() => axiosClient.post(COBROS_FACTURAS_API_ROUTES.APERTURAR_CAJA_USUARIO,{
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
