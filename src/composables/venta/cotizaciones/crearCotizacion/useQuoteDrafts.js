import { ref, nextTick, computed, reactive, watch, onScopeDispose } from "vue";
import { createDraftSaveQueue } from "./draftSaveQueue";
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


    const saveStates = reactive({});
    const draftSaveState = computed(() => saveStates[form.value.draft_id]?.state || 'idle');
    const draftSaveError = computed(() => saveStates[form.value.draft_id]?.error || '');
    const loadingSyncDraft = computed(() => draftSaveState.value === 'saving');
    let debounceId;
    let disposed = false;
    const queue = createDraftSaveQueue({
        save: payload => run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.SYNC, payload)),
        onState: (id, state, error) => { saveStates[id] = { state, error }; },
    });

    function enqueueCurrentDraft() {
        if (disposed || isRecoveringQuote.value) return;
        const data = form.value;
        if (!data.draft_id || data.draft_id === 'undefined' || (!data.cliente && data.items.length === 0)) return;
        // Copia independiente: editar el formulario no modifica una solicitud ya en curso.
        const payload = JSON.parse(JSON.stringify({
            draft_id: data.draft_id,
            pto_vta_id: selectedPointSaleCode.value,
            pv_id: selectedPointSaleId.value,
            data: { ...data, imagenesoperaciones: [], documentos_pdf: [] },
        }));
        queue.enqueue(payload);
        clearTimeout(debounceId);
        debounceId = setTimeout(() => queue.flush(), 1000);
    }

    watch(() => form.value, enqueueCurrentDraft, { deep: true });
    watch(isRecoveringQuote, recovering => {
        if (!recovering) enqueueCurrentDraft();
    });

    async function flushDraftSave() {
        await nextTick();
        clearTimeout(debounceId);
        return queue.flush();
    }

    async function retryDraftSave() {
        await nextTick();
        clearTimeout(debounceId);
        return queue.retry(form.value.draft_id);
    }

    function warnBeforeUnload(event) {
        if (!queue.hasPending()) return;
        event.preventDefault();
        event.returnValue = '';
    }
    window.addEventListener('beforeunload', warnBeforeUnload);
    onScopeDispose(() => {
        disposed = true;
        clearTimeout(debounceId);
        queue.dispose();
        window.removeEventListener('beforeunload', warnBeforeUnload);
    });

    const loadingListDrafts = ref(false);
    async function getActiveDrafts() {
        return await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.LIST, { pv_id: selectedPointSaleId.value }), {
            loadingRef: loadingListDrafts
        });
    }

    const loadingRemoveDraft = ref(false);
    async function removeDraft(draftIdToRemove) {
        await queue.suspend(draftIdToRemove);
        try {
            return await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.DELETE, { draft_id: draftIdToRemove }), {
                loadingRef: loadingRemoveDraft,
                onError: (err) => {
                    console.error("Error al eliminar borrador:", err);
                }
            });
        } finally {
            queue.resume(draftIdToRemove);
        }
    }









    return {
        loadingGetCurrentDraft,
        fetchCurrentDraft,
        loadingSyncDraft,
        draftSaveState,
        draftSaveError,
        retryDraftSave,
        flushDraftSave,
        loadingListDrafts,
        getActiveDrafts,
        loadingRemoveDraft,
        removeDraft,
    };
}
