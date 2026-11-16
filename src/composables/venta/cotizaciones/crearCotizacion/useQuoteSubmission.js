import { ref } from "vue";
import axiosClient from "@/axios";
import { swalWarning } from "@/functions/swal-alert";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";
import { createSubmissionGuard } from "./submissionGuard";
import { buildQuotationFormData, buildOrderFormData } from "./quoteFormData";

export function useQuoteSubmission({ form, run, validateItemLWeights, validateDispatchFields, validateFreightTotal }) {
    const loadingCreateQuotation = ref(false);
    // Cotizaciones y pedidos comparten bloqueo porque usan el mismo formulario.
    const submitDocument = createSubmissionGuard();
    const createQuote = mode => submitDocument(() => submitQuote(mode));
    async function submitQuote(mode) {
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
            return;
        }
        if (!form.value.items.length) {
            swalWarning('Debe agregar al menos un artículo.');
            return;
        }
        if (!validateFreightTotal()) {
            swalWarning("Ingrese montos de flete válidos; para paquetería, la suma del detalle debe coincidir con la cabecera.");
            return;
        }
        const formData = buildQuotationFormData(form.value, mode);

        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.CREATE, formData), {
            loadingRef: loadingCreateQuotation,
            onError: (error) => {
                console.error('Error al crear la cotización:', error);
            },
        });

    }

    const loadingSaveOrder = ref(false);
    const saveOrder = () => submitDocument(() => submitOrder());
    async function submitOrder() {
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
            return;
        }
        if (!form.value.items.length) {
            swalWarning('Debe agregar al menos un artículo.');
            return;
        }
        if (!validateFreightTotal()) {
            swalWarning('Ingrese montos de flete válidos; para paquetería, la suma del detalle debe coincidir con la cabecera.');
            return;
        }
        const formData = buildOrderFormData(form.value);

        return run(() => axiosClient.post(QUOTE_API_ROUTES.ORDERS.CREATE, formData), {
            loadingRef: loadingSaveOrder,
            onError: (error) => {
                console.error('Error al crear el pedido:', error);
            },
        });
    }

    return { loadingCreateQuotation, createQuote, loadingSaveOrder, saveOrder };
}
