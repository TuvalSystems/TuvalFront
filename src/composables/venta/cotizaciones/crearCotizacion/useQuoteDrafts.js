import { ref, nextTick } from "vue";
import { watchDebounced } from "@vueuse/core";
import axiosClient from "@/axios";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";
import { getInitialState } from "./quoteInitialState";

export function useQuoteDrafts({
    route,
    draftId,
    isRecoveringQuote,
    run,
    form,
    calculateTotals,
    selectedPointSaleCode,
    selectedPointSaleId,
}) {
    const loadingGetCurrentDraft = ref(false);
    async function fetchCurrentDraft() {
        const idToFetch = route.query.draft || draftId;
        isRecoveringQuote.value = true;
        return await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.GET, { draft_id: idToFetch }), {
            loadingRef: loadingGetCurrentDraft,
            onSuccess: (info) => {
                const rawData = info.data;
                const savedForm = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                const nextState = {
                    ...getInitialState(),
                    ...(savedForm || {}),
                    draft_id: idToFetch,
                    imagenesoperaciones: [],
                    documentos_pdf: []
                };
                if (!nextState.items) nextState.items = [];
                if (!nextState.orden_de_compra) nextState.orden_de_compra = '';
                form.value = nextState;
                nextTick(() => {
                    calculateTotals();
                    setTimeout(() => {
                        isRecoveringQuote.value = false;
                    }, 500);
                });
            },
            onError: (err) => {
                console.log("Iniciando borrador nuevo en blanco", err);
                const emptyState = getInitialState();
                emptyState.draft_id = idToFetch;
                form.value = emptyState;
                isRecoveringQuote.value = false;
            }
        })
    }


    const loadingSyncDraft = ref(false);
    watchDebounced(
        () => form.value, async (newVal) => {
            if (!newVal.cliente && newVal.items.length === 0) {
                return;
            }
            const currentId = newVal.draft_id;
            if (!currentId || currentId === 'undefined') return;
            const { ...cleanData } = newVal;
            return await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.SYNC, {
                draft_id: currentId,
                pto_vta_id: selectedPointSaleCode.value,
                pv_id : selectedPointSaleId.value,
                data: {
                    ...cleanData,
                    imagenesoperaciones: [], // Aseguramos que viajen vacíos
                    documentos_pdf: []      // Aseguramos que viajen vacíos
                }
            }), {
                loadingRef: loadingSyncDraft
            })
        }, { deep: true, debounce: 1000 });


    const loadingListDrafts = ref(false);
    async function getActiveDrafts() {
        return await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.LIST, { pv_id: selectedPointSaleId.value }), {
            loadingRef: loadingListDrafts
        });
    }

    const loadingRemoveDraft = ref(false);
    async function removeDraft(draftIdToRemove) {
        return await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.DELETE, { draft_id: draftIdToRemove }), {
            loadingRef: loadingRemoveDraft,
            onError: (err) => {
                console.error("Error al eliminar borrador:", err);
            }
        });
    }









    return {
        loadingGetCurrentDraft,
        fetchCurrentDraft,
        loadingSyncDraft,
        loadingListDrafts,
        getActiveDrafts,
        loadingRemoveDraft,
        removeDraft,
    };
}
