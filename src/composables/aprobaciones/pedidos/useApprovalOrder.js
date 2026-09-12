import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { APPROVAL_API_ROUTES } from "@/constants/apiRoutes/aprobaciones/approvalRoutes";
import { ref, computed } from "vue";
import { useStore } from 'vuex'
const orders = ref([]);
const loadingOrders = ref(false);
const orderConsult = ref([]);
const loadingOrderConsult = ref(false);
export function useApprovalOrder() {
    const { run } = useApiAction();
    const store = useStore();
    const ptoVtaSelect = computed(() => store.state.puntodeventaselect);
    async function fetchListOrders() {
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.COMMERCIAL.ORDERS.LIST_PENDING, { puntodeventa_id: ptoVtaSelect.value }), {
            loadingRef: loadingOrders,
            onSuccess: (info) => (orders.value = info),
            successMessage: "Proceso realizado exitosamente.",
        })
    }
    const countOrders = computed(() => orders.value.length);


    async function fetchListOrdersConsult() {
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.COMMERCIAL.ORDERS.LIST_PENDING_QUERY, { puntodeventa_id: ptoVtaSelect.value }), {
            loadingRef: loadingOrderConsult,
            onSuccess: (info) => (orderConsult.value = info),
            successMessage: "Proceso realizado exitosamente.",
        })
    }

    const countOrdersConsult = computed(() => orderConsult.value.length);




    const loadingValidateStockOrderApproval  = ref(false);
    async function validateStockForOrderApproval(id){
      return run(() => axiosClient.post(APPROVAL_API_ROUTES.ORDERS.VERIFY_STOCK, {id : id}),{
        loadingRef : loadingValidateStockOrderApproval ,

      });
    }


    return {
        loadingOrders,
        fetchListOrders,
        orders,
        countOrders,
        fetchListOrdersConsult,
        orderConsult,
        loadingOrderConsult,
        countOrdersConsult,

        //consulta de stock para pedido antes de aprobar 
        loadingValidateStockOrderApproval,
        validateStockForOrderApproval 
    };
}
