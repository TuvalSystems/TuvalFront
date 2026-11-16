import { createOrderCompletion } from "./orderCompletion";
import { ref } from "vue";
import { useStore } from "vuex";
import axiosClient from "@/axios";
import { swalWarning } from "@/functions/swal-alert";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";
import { createSubmissionGuard } from "./submissionGuard";
import { buildQuotationFormData, buildOrderFormData } from "./quoteFormData";
import { preparePersistentSubmission, persistentRequest, discardPersistentSubmission } from "./persistentSubmission";

export function useQuoteSubmission({ form, run, validateItemLWeights, validateDispatchFields, validateFreightTotal }) {
    const store = useStore();
    const loadingCreateQuotation = ref(false);
    const loadingSaveOrder = ref(false);
    const submitDocument = createSubmissionGuard();
    const completeOrder = createOrderCompletion();
    const completed = new Set();

    function validateSubmission() {
        const weightError = validateItemLWeights();
        if (weightError) return { ok: false, message: weightError };
        const dispatchError = validateDispatchFields();
        if (dispatchError) return { ok: false, message: dispatchError };
        if (!(Number(form.value.tipo_despacho_id) > 0)) {
            return {
                ok: false,
                message: 'Debe seleccionar un tipo de despacho.',
            };
        }
        if (!form.value.cliente) {
            swalWarning('Debe seleccionar un cliente.');
            return { ok: false, skipped: true };
        }
        if (!form.value.items.length) {
            swalWarning('Debe agregar al menos un artículo.');
            return { ok: false, skipped: true };
        }
        if (!validateFreightTotal()) {
            swalWarning("Ingrese montos de flete válidos; para paquetería, la suma del detalle debe coincidir con la cabecera.");
            return { ok: false, skipped: true };
        }
        return null;
    }

    function context(kind) {
        const user = store.state.user.data;
        if (!user?.id || !form.value.draft_id) throw new Error("No se pudo identificar el borrador para un guardado seguro.");
        return JSON.stringify([user.id, form.value.punto_venta_id, form.value.draft_id, kind]);
    }

    async function send(record, part, url, loadingRef) {
        const request = await persistentRequest(record, part);
        return run(() => axiosClient.post(url, request.data, request.config), { loadingRef });
    }

    async function prepareAndSend(kind, prepare, execute) {
        try {
            const identity = context(kind);
            const record = await preparePersistentSubmission(identity, () => {
                const invalid = validateSubmission();
                if (invalid) throw { validationResult: invalid };
                return prepare();
            });
            const result = await execute(record);
            if (result?.ok) completed.add(identity);
            return result;
        } catch (error) {
            return error.validationResult || { ok: false, message: error.message || "No se pudo conservar el guardado. No se envió una nueva solicitud." };
        }
    }

    const createQuote = mode => submitDocument(() => prepareAndSend(`cotizacion:${mode}`,
        () => ({ quotation: buildQuotationFormData(form.value, mode) }),
        async record => {
            const result = await send(record, 'quotation', QUOTE_API_ROUTES.QUOTES.CREATE, loadingCreateQuotation);
            if (result?.status === 422) await discardPersistentSubmission(record.context);
            return result;
        },
    ));

    const saveOrder = () => submitDocument(() => prepareAndSend('pedido',
        () => ({ order: buildOrderFormData(form.value) }),
        async record => {
            const result = await send(record, 'order', QUOTE_API_ROUTES.ORDERS.CREATE, loadingSaveOrder);
            if (result?.status === 422) await discardPersistentSubmission(record.context);
            return result;
        },
    ));

    const saveOrderAndUpdateQuote = () => submitDocument(() => prepareAndSend('conversion',
        () => ({ order: buildOrderFormData(form.value), quotation: buildQuotationFormData(form.value, 'update') }),
        record => completeOrder(record.context, () => ({
            createOrder: async () => {
                const result = await send(record, 'order', QUOTE_API_ROUTES.ORDERS.CREATE, loadingSaveOrder);
                if (result?.status === 422) await discardPersistentSubmission(record.context);
                return result;
            },
            updateQuote: () => send(record, 'quotation', QUOTE_API_ROUTES.QUOTES.CREATE, loadingCreateQuotation),
        })),
    ));

    // Solo se descarta la copia local después de limpiar el borrador confirmado.
    async function finishSubmission() {
        for (const identity of completed) {
            try {
                await discardPersistentSubmission(identity);
                completed.delete(identity);
            } catch {
                // Conservarla permite recuperarse sin arriesgar otro envío.
            }
        }
    }

    return { loadingCreateQuotation, createQuote, loadingSaveOrder, saveOrder, saveOrderAndUpdateQuote, finishSubmission };
}
