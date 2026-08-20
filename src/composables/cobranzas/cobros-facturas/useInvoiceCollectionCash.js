import { computed, reactive, ref, watch } from "vue"
import useVuelidate from "@vuelidate/core";
import {
    decimal,
    helpers,
    maxLength,
    required
} from "@vuelidate/validators";
import { swalWarning } from "@/functions/swal-alert";
import { formatPriceJm, roundTo, toNumber } from "@/functions";
import { formatDateForInput } from "@/utils/cobros/validateDate";
import {
    PAYMENT_AMOUNT_MAX_LENGTH,
    PAYMENT_AMOUNT_MAX_LENGTH_MESSAGE
} from "@/utils/cobros/paymentAmountInput";
import { rebuildInvoiceRowsPreservingSelection } from "@/utils/cobros/paymentInvoiceRows";



function createEmptyCash() {
    return {
        montoRecibido: null,
        montoACobrar: null,
        montoDevuelto: 0, //en este caso seria la resta de monto recibido menos monto a cobrar , es lo que se devuelve al cliente  
        fechaEfectivo: formatDateForInput(new Date()),
        montoNoAplicado: 0,
        montoAplicado: 0,
        facturas: [],
    }
}

const requiredField = (message) => helpers.withMessage(message, required);
const decimalField = helpers.withMessage("Ingrese un valor numerico valido", decimal);
const paymentAmountMaxLength = helpers.withMessage(
    PAYMENT_AMOUNT_MAX_LENGTH_MESSAGE,
    maxLength(PAYMENT_AMOUNT_MAX_LENGTH)
);

function createCashRules() {
    return computed(() => ({
        montoRecibido: {
            required: requiredField("Ingrese el monto a recibir."),
            decimal: decimalField,
            maxLength: paymentAmountMaxLength,
        },
        montoACobrar: {
            required: requiredField("Ingrese el monto a cobrar."),
            decimal: decimalField,
            maxLength: paymentAmountMaxLength,
        }
    }));
}


export function useInvoiceCollectionCash({
    facturas,
    efectivo,
    cliente,
    invoiceDataVersion,
} = {}) {
    const invoicesOptions = computed(() => {
        const items = facturas?.value ?? facturas ?? [];

        return Array.isArray(items)
            ? items
            : Object.values(items ?? {});
    });
    const invoiceRefreshVersion = computed(
        () => invoiceDataVersion?.value ?? invoiceDataVersion ?? 0
    );
    const cashPayload = reactive(createEmptyCash());

    const v$ = useVuelidate(createCashRules(), cashPayload);


    function resetCashPayload() {
        Object.assign(cashPayload, createEmptyCash());
        resetCashApplicationState();
    }




    function updateCashChangeAmount() {
        resetCashApplicationState();

        const receivedAmount =
            toNumber(cashPayload.montoRecibido) ?? 0;

        const amountToCollect =
            toNumber(cashPayload.montoACobrar) ?? 0;

        if (amountToCollect > receivedAmount) {
            cashPayload.montoACobrar = null;
            cashPayload.montoDevuelto = receivedAmount;

            swalWarning("El monto a cobrar no puede exceder el monto recibido.");
            return false;
        }

        cashPayload.montoDevuelto = roundTo(
            receivedAmount - amountToCollect,
            2
        );
        return true;
    }

    function validationMessage(field) {
        return field?.$errors?.[0].$message ?? "Campo invalido";
    }

    const showTableInvoices = ref(false);
    const cashInvoiceRows = ref([]);
    const cashInvoices = computed(() => cashInvoiceRows.value);

    function resetCashApplicationState() {
        cashInvoiceRows.value = [];
        cashPayload.montoAplicado = 0;
        cashPayload.montoNoAplicado = 0;
        cashPayload.facturas = [];
        showTableInvoices.value = false;
    }

    function formatCashAmount(value) {
        return formatPriceJm(value) ?? "0.00";
    }

    function createCashInvoiceRow(invoice) {
        return {
            documento: invoice?.documento ?? "",
            fechaEmision: invoice?.fechaEmision ?? "",
            fechaVencimiento: invoice?.fechaVencimiento ?? "",
            montoOriginal: roundTo(toNumber(invoice?.montoOriginal) ?? 0, 2),
            saldoCliente: roundTo(toNumber(invoice?.saldoCliente) ?? 0, 2),
            aplicarTodoEfectivo: false,
            aplicarMontoEfectivo: 0,
            observacionEfectivo: "",
        };
    }

    function buildCashInvoiceRows() {
        return invoicesOptions.value.map(createCashInvoiceRow);
    }

    function refreshCashInvoiceRows() {
        if (!showTableInvoices.value) {
            return;
        }

        cashInvoiceRows.value = rebuildInvoiceRowsPreservingSelection({
            currentRows: cashInvoiceRows.value,
            nextRows: buildCashInvoiceRows(),
            amountKey: "aplicarMontoEfectivo",
            applyAllKey: "aplicarTodoEfectivo",
            observationKey: "observacionEfectivo",
            getInvoiceBalance: (invoice) => toNumber(invoice?.saldoCliente) ?? 0,
            getAvailablePaymentAmount: () => cashPayload.montoACobrar,
        });
        updateCashApplicationSummary();
    }

    function syncAppliedCashInvoices() {
        cashPayload.facturas = cashInvoiceRows.value.filter(
            invoice => (toNumber(invoice.aplicarMontoEfectivo) ?? 0) > 0
        );
    }

    function calculateAppliedCash(excludedInvoice = null) {
        return cashInvoiceRows.value.reduce((total, invoice) => {
            if (invoice === excludedInvoice) {
                return total;
            }

            return total + (toNumber(invoice.aplicarMontoEfectivo) ?? 0);
        }, 0);
    }

    function updateCashApplicationSummary() {
        const amountToCollect = toNumber(cashPayload.montoACobrar) ?? 0;
        const appliedAmount = calculateAppliedCash();

        cashPayload.montoAplicado = roundTo(appliedAmount, 2);
        cashPayload.montoNoAplicado = roundTo(Math.max(amountToCollect - appliedAmount, 0), 2);
        syncAppliedCashInvoices();
    }

    function availableCashForInvoice(invoice) {
        const amountToCollect = toNumber(cashPayload.montoACobrar) ?? 0;
        const appliedWithoutInvoice = calculateAppliedCash(invoice);

        return roundTo(Math.max(amountToCollect - appliedWithoutInvoice, 0), 2);
    }

    function getInvoiceRemainingBalance(invoice) {
        const invoiceBalance = toNumber(invoice?.saldoCliente) ?? 0;
        const appliedAmount = toNumber(invoice?.aplicarMontoEfectivo) ?? 0;

        return roundTo(Math.max(invoiceBalance - appliedAmount, 0), 2);
    }

    function updateInvoiceCashAmount(invoice) {
        let amountToApply = toNumber(invoice.aplicarMontoEfectivo) ?? 0;
        const invoiceBalance = toNumber(invoice.saldoCliente) ?? 0;
        const availableAmount = availableCashForInvoice(invoice);

        if (amountToApply < 0) {
            swalWarning("No puede ingresar valores negativos.");
            amountToApply = 0;
        }

        if (amountToApply > invoiceBalance) {
            swalWarning("El monto aplicado no puede exceder el saldo de la factura.");
            amountToApply = invoiceBalance;
        }

        if (amountToApply > availableAmount) {
            swalWarning("El monto aplicado no puede exceder el monto disponible por aplicar.");
            amountToApply = availableAmount;
        }

        invoice.aplicarMontoEfectivo = roundTo(amountToApply, 2);
        invoice.aplicarTodoEfectivo = invoice.aplicarMontoEfectivo > 0
            && invoice.aplicarMontoEfectivo >= invoiceBalance;

        updateCashApplicationSummary();
    }

    function applyFullCashToInvoice(invoice) {
        if (!invoice.aplicarTodoEfectivo) {
            invoice.aplicarMontoEfectivo = 0;
            updateCashApplicationSummary();
            return;
        }

        const invoiceBalance = toNumber(invoice.saldoCliente) ?? 0;
        const availableAmount = availableCashForInvoice(invoice);

        if (availableAmount <= 0) {
            swalWarning("Ya no queda monto por aplicar.");
            invoice.aplicarTodoEfectivo = false;
            invoice.aplicarMontoEfectivo = 0;
            updateCashApplicationSummary();
            return;
        }

        invoice.aplicarMontoEfectivo = roundTo(
            Math.min(invoiceBalance, availableAmount),
            2
        );
        updateCashApplicationSummary();
    }

    async function applyCash() {
        const result = await v$.value.$validate();
        if (!result) {
            return false;
        }
        const receivedAmount =
            toNumber(cashPayload.montoRecibido) ?? 0;

        const amountToCollect =
            toNumber(cashPayload.montoACobrar) ?? 0;

        if (receivedAmount <= 0 || amountToCollect <= 0) {
            swalWarning("No puede ingresar valores negativos o valores en 0");
            return false;
        }

        if (amountToCollect > receivedAmount) {
            swalWarning("El monto a cobrar no puede exceder el monto recibido.");
            return false;
        }

        cashPayload.montoRecibido = roundTo(receivedAmount, 2);
        cashPayload.montoACobrar = roundTo(amountToCollect, 2);
        cashPayload.montoDevuelto = roundTo(receivedAmount - amountToCollect, 2);
        cashPayload.montoAplicado = 0;
        cashPayload.montoNoAplicado = roundTo(amountToCollect, 2);
        cashPayload.facturas = [];
        cashInvoiceRows.value = buildCashInvoiceRows();
        showTableInvoices.value = true;
        return true;
    }

    watch(
        [invoicesOptions, invoiceRefreshVersion],
        refreshCashInvoiceRows,
        { deep: true }
    );

    return {
        cashPayload,
        invoicesOptions,
        resetCashPayload,
        v$,
        validationMessage,
        updateCashChangeAmount,
        applyCash,
        showTableInvoices,
        cashInvoices,
        formatCashAmount,
        updateInvoiceCashAmount,
        applyFullCashToInvoice,
        getInvoiceRemainingBalance
    }
}
