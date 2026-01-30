import axiosPublic from "@/axiosPublic";
import { ref} from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useDashboardOrderDispatch() {
    const { run } = useApiAction();
    /** variables de loading y carga de informacion */
    const loadingOrderDispatch = ref(false);
    const dataOrderDispatch = ref(null);
    const loadingCountItemsServ = ref(false);
    const countItemsServ = ref(null);



    async function getDataOrderDispatchPending(ptoVtaId) {
        if (!ptoVtaId) return;
        return run(() => axiosPublic.get(`dashboard/ordenes-despacho-pendientes/${ptoVtaId}`), {
            loadingRef: loadingOrderDispatch,
            onSuccess: (list) => {
                dataOrderDispatch.value = list; // list ya es response.data.data
            },

        })
    }


    async function getCountItemsServ(ptoVtaId) {
        if (!ptoVtaId) return;
        return run(() => axiosPublic.get(`dashboard/contador-items-servicios/${ptoVtaId}`), {
            loadingRef: loadingCountItemsServ,
            onSuccess: (data) => {
                countItemsServ.value = data;
            }
        });
    }




    return {
        loadingOrderDispatch,
        dataOrderDispatch,
        getDataOrderDispatchPending,

        loadingCountItemsServ,
        countItemsServ,
        getCountItemsServ,

    }
}