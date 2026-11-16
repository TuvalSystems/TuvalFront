import { ref, nextTick, computed, reactive, watch, onScopeDispose } from "vue";
import { createDraftSaveQueue } from "./draftSaveQueue";
import { getDraftSignature } from "./draftSignature";
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
    const draftLoadError = ref('');
    let loadSequence = 0;
    async function fetchCurrentDraft() {
        const sequence = ++loadSequence;
        loadingGetCurrentDraft.value = true;
        try {
            const idToFetch = route.query.draft || draftId;
            const isCurrent = () => !disposed && sequence === loadSequence && (route.query.draft || draftId) === idToFetch;
            isRecoveringQuote.value = true;
            draftLoadError.value = '';
            const result = await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.GET, { draft_id: idToFetch }));
            if (!isCurrent()) return { ...result, stale: true };
            if (!result.ok) {
                draftLoadError.value = result.message || 'No se pudo cargar el borrador.';
                isRecoveringQuote.value = false;
                return result;
            }
            try {
                const rawData = result.data?.data;
                const savedForm = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                if (result.raw?.data != null && savedForm == null) {
                    throw new Error('El borrador recibido no tiene un formato válido.');
                }
                if (savedForm != null && (typeof savedForm !== 'object' || Array.isArray(savedForm) ||
                    (savedForm.items != null && !Array.isArray(savedForm.items)))) {
                    throw new Error('El borrador recibido no tiene un formato válido.');
                }
                form.value = {
                    ...getInitialState(),
                    ...(savedForm || {}),
                    draft_id: idToFetch,
                    items: savedForm?.items || [],
                    orden_de_compra: savedForm?.orden_de_compra || '',
                    imagenesoperaciones: [],
                    documentos_pdf: [],
                };
                await nextTick();
                if (!isCurrent()) return { ...result, stale: true };
                calculateTotals();
                // Mantiene la pausa de recuperación para los watchers del formulario.
                await new Promise(resolve => setTimeout(resolve, 500));
                if (!isCurrent()) return { ...result, stale: true };
                if (savedForm) queue.markSaved(createDraftPayload());
                isRecoveringQuote.value = false;
                return result;
            } catch (error) {
                draftLoadError.value = error.message || 'No se pudo interpretar el borrador.';
                isRecoveringQuote.value = false;
                return { ok: false, message: draftLoadError.value };
            }
        } finally {
            if (sequence === loadSequence) loadingGetCurrentDraft.value = false;
        }
    }

    const saveStates = reactive({});
    const draftSaveState = computed(() => saveStates[form.value.draft_id]?.state || 'idle');
    const draftSaveError = computed(() => saveStates[form.value.draft_id]?.error || '');
    const loadingSyncDraft = computed(() => draftSaveState.value === 'saving');
    let debounceId;
    let disposed = false;
    const queue = createDraftSaveQueue({
        getSignature: getDraftSignature,
        save: payload => run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.SYNC, payload)),
        onState: (id, state, error) => { saveStates[id] = { state, error }; },
    });

    function createDraftPayload() {
        const data = form.value;
        // Copia independiente: editar el formulario no modifica una solicitud ya en curso.
        return JSON.parse(JSON.stringify({
            draft_id: data.draft_id,
            pto_vta_id: selectedPointSaleCode.value,
            pv_id: selectedPointSaleId.value,
            data: { ...data, imagenesoperaciones: [], documentos_pdf: [] },
        }));
    }

    function enqueueCurrentDraft() {
        if (disposed || isRecoveringQuote.value || draftLoadError.value) return;
        const data = form.value;
        if (!data.draft_id || data.draft_id === 'undefined' || (!data.cliente && data.items.length === 0)) return;
        if (!queue.enqueue(createDraftPayload())) return;
        clearTimeout(debounceId);
        debounceId = setTimeout(() => queue.flush(), 1000);
    }

    watch(() => form.value, enqueueCurrentDraft, { deep: true });
    watch([selectedPointSaleCode, selectedPointSaleId], enqueueCurrentDraft);
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
        draftLoadError,
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
