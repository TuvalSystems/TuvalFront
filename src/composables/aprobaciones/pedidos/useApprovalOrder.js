import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
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
    const apiListOrders = "aprobaciones/pedidos/lista-pedidos-pendientes";
    async function fetchListOrders() {
        return run(() => axiosClient.post(apiListOrders, { puntodeventa_id: ptoVtaSelect.value }), {
            loadingRef: loadingOrders,
            onSuccess: (info) => (orders.value = info),
            successMessage: "Proceso realizado exitosamente.",
        })
    }
    const countOrders = computed(() => orders.value.length);


    const apiListOrdersConsult = "aprobaciones/pedidos/consulta/lista-pedidos-pendientes";
    async function fetchListOrdersConsult() {
        return run(() => axiosClient.post(apiListOrdersConsult, { puntodeventa_id: ptoVtaSelect.value }), {
            loadingRef: loadingOrderConsult,
            onSuccess: (info) => (orderConsult.value = info),
            successMessage: "Proceso realizado exitosamente.",
        })
    }

    const countOrdersConsult = computed(() => orderConsult.value.length);


    return {
        loadingOrders,
        fetchListOrders,
        orders,
        countOrders,
        fetchListOrdersConsult,
        orderConsult,
        loadingOrderConsult,
        countOrdersConsult
    };
}
