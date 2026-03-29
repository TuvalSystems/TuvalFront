import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, computed } from "vue";
import { useStore } from 'vuex'

const loading = ref(false);
const quotes = ref([]);
export function useApprovalQuote() {
    const { run } = useApiAction();
    const store = useStore();
    const ptoVtaSelect = computed(() => store.state.puntodeventaselect);
    const apiListQuotes = "aprobaciones/cotizaciones/lista-cotizaciones-pendientes";
    async function fetchListQuotes() {
        return run(() => axiosClient.post(apiListQuotes, { puntodeventa_id: ptoVtaSelect.value }), {
            loadingRef: loading,
            onSuccess: (info) => {
                quotes.value = info
            },
            successMessage: "Proceso realizado exitosamente.",
        })
    }

    const countQuotes = computed(() => quotes.value.length);

    return {
        loading,
        fetchListQuotes,
        quotes,
        countQuotes
    };
}
