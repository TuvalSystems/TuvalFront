import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, computed } from "vue";
import { useStore } from 'vuex'
import { APPROVAL_API_ROUTES } from "@/constants/apiRoutes/aprobaciones/approvalRoutes";
const loading = ref(false);
const quotes = ref([]);
const quotesConsult = ref([]);
const loadingConsult = ref(false);

export function useApprovalQuote() {
    const { run } = useApiAction();
    const store = useStore();
    const ptoVtaSelect = computed(() => store.state.puntodeventaselect);
    async function fetchListQuotes() {
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.COMMERCIAL.QUOTES.LIST_PENDING, { puntodeventa_id: ptoVtaSelect.value }), {
            loadingRef: loading,
            onSuccess: (info) => {
                quotes.value = info
            },
            successMessage: "Proceso realizado exitosamente.",
        })
    }
    const countQuotes = computed(() => quotes.value.length);




    async function fetchListQuotesConsult() {
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.COMMERCIAL.QUOTES.LIST_PENDING_QUERY, { puntodeventa_id: ptoVtaSelect.value }), {
            loadingRef: loadingConsult,
            onSuccess: (info) => {
                quotesConsult.value = info
            },
            successMessage: "Proceso realizado exitosamente.",
        })
    }
    const countQuotesConsult = computed(() => quotesConsult.value.length);


    return {
        loading,
        fetchListQuotes,
        quotes,
        countQuotes,
        fetchListQuotesConsult,
        loadingConsult,
        quotesConsult,
        countQuotesConsult,
    };
}
