import { computed, reactive, ref, watch } from "vue";
import useVuelidate from "@vuelidate/core";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import {
    decimal,
    helpers,
    maxLength,
    required
} from "@vuelidate/validators";
import { formatDateForInput, parseLocalDate } from "@/utils/cobros/validateDate";
import { formatPriceJm, roundTo, toNumber } from "@/functions";
import { swalError, swalWarning } from "@/functions/swal-alert";
import {
    PAYMENT_AMOUNT_MAX_LENGTH,
    PAYMENT_AMOUNT_MAX_LENGTH_MESSAGE
} from "@/utils/cobros/paymentAmountInput";
import { rebuildInvoiceRowsPreservingSelection } from "@/utils/cobros/paymentInvoiceRows";




const requiredField = (message) => helpers.withMessage(message, required);
const decimalField = helpers.withMessage("Ingrese un valor numerico valido.", decimal);
const numericReciptField = helpers.withMessage(
    "Ingrese solo numeros.", helpers.regex(/^\d+$/)
);
const checkNumericFieldMaxLength = helpers.withMessage(
    "El campo no puede exceder 30 caracteres.",
    maxLength(30)
);
const paymentAmountMaxLength = helpers.withMessage(
    PAYMENT_AMOUNT_MAX_LENGTH_MESSAGE,
    maxLength(PAYMENT_AMOUNT_MAX_LENGTH)
);
const CHECK_DUE_DATE_GRACE_DAYS = 1;

function resolveSource(source) {
    if (typeof source === "function") {
        return source();
    }

    return source?.value ?? source;
}

function normalizeCollectionItems(source) {
    const items = resolveSource(source);

    return Array.isArray(items)
        ? items
        : Object.values(items ?? {});
}


function createEmptyCheck() {
    return {
        banco_id: "",
        fechaEmision: formatDateForInput(new Date()),
        fechaVencimiento: "",
        cuenta: "",
        cheque: "",
        montoRecibido: null,
        montoNoAplicado: 0,
        montoAplicado: 0,
        comentario: "",
        facturas: []
    }
}


function createCheckRule() {
    return computed(() => ({
        banco_id: {
            required: requiredField("Seleccione el banco."),
        },
        cheque: {
            required: requiredField("Ingrese el cheque."),
            numeric: numericReciptField,
            maxLength: checkNumericFieldMaxLength,
        },
        cuenta: {
            required: requiredField("Ingrese la cuenta."),
            numeric: numericReciptField,
            maxLength: checkNumericFieldMaxLength,
        },

        montoRecibido: {
            required: requiredField("Ingrese el monto del cheque."),
            decimal: decimalField,
            maxLength: paymentAmountMaxLength,
        },
        fechaVencimiento: {
            required: requiredField("Seleccione la fecha de vencimiento")
        }
    }));
}


function getInvoiceDocument(invoice) {
    return String(invoice?.documento ?? "").trim();
}

function getInvoiceDueDate(invoice) {
    return invoice?.fechaVencimiento ??
        "";
}

function getBankId(bank) {
    return bank?.id ?? bank?.CB_ID ?? "";
}

function getBankName(bank) {
    return bank?.CB_DESCRIPCION ?? bank?.nombre ?? "Banco no definido";
}

function normalizeDateAtStartOfDay(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
        return null;
    }

    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDaysToDate(date, days) {
    const normalizedDate = normalizeDateAtStartOfDay(date);

    if (!normalizedDate) {
        return null;
    }

    normalizedDate.setDate(normalizedDate.getDate() + days);
    return normalizedDate;
}

function parseComparableDate(dateValue) {
    if (dateValue instanceof Date) {
        return normalizeDateAtStartOfDay(dateValue);
    }

    const textValue = String(dateValue ?? "").trim();
    const parsedLocalDate = /^\d{4}-\d{1,2}-\d{1,2}/.test(textValue)
        ? parseLocalDate(textValue)
        : null;

    if (parsedLocalDate) {
        return normalizeDateAtStartOfDay(parsedLocalDate);
    }

    const numericDate = textValue.match(/^(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})/);

    if (!numericDate) {
        return null;
    }

    const firstPart = Number(numericDate[1]);
    const secondPart = Number(numericDate[2]);
    const thirdPart = Number(numericDate[3]);
    const year = firstPart > 31 ? firstPart : thirdPart;
    const month = secondPart;
    const day = firstPart > 31 ? thirdPart : firstPart;
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return normalizeDateAtStartOfDay(date);
}

export function useInvoiceCollectionChecks({
    facturas,
    cliente,
    bancoClientes,
    invoiceDataVersion,
    validateCheckReceiptNumber
}) {

    // limite para fecha de vencimiento 
    const flatPickrState = reactive({
        emision: {
            minDate: null,
            maxDate: Date.now(),
            locale: Spanish,
        },
        vencimiento: {
            minDate: Date.now(),
            locale: Spanish,
        },
    });

    const invoiceOptions = computed(() => normalizeCollectionItems(facturas));
    const bankClientsOptions = computed(() => normalizeCollectionItems(bancoClientes));
    const client = computed(() => resolveSource(cliente) ?? {});
    const invoiceRefreshVersion = computed(() => resolveSource(invoiceDataVersion) ?? 0);
    const checkPayload = reactive(createEmptyCheck());

    //vaidation 
    const v$ = useVuelidate(createCheckRule(), checkPayload);
    const showTableInvoices = ref(false);
    const checkInvoicesRows = ref([]);
    const checkInvoices = computed(() => checkInvoicesRows.value);

    const selectedBank = computed(() =>
        bankClientsOptions.value.find((bank) =>
            String(getBankId(bank)) === String(checkPayload.banco_id)
        ) ?? null
    );

    const selectedBankName = computed(() =>
        selectedBank.value ? getBankName(selectedBank.value) : "Sin banco"
    );


    function resetCheckApplicationState() {
        checkInvoicesRows.value = [];
        checkPayload.montoAplicado = 0;
        checkPayload.montoNoAplicado = 0;
        checkPayload.facturas = [];
        showTableInvoices.value = false;
    }

    function resetCheckPayload() {
        Object.assign(checkPayload, createEmptyCheck());
        resetCheckApplicationState();
        v$.value.$reset();
    }

    function validationMessage(field) {
        return field?.$errors?.[0]?.$message ?? "Campo invalido.";
    }

    function formatCheckAmount(value) {
        return formatPriceJm(value) ?? "0.00";
    }

    function getCheckDueDateValidation(invoice) {
        const documentNumber = getInvoiceDocument(invoice) || "seleccionada";
        const checkDueDate = parseComparableDate(checkPayload.fechaVencimiento);
        const invoiceDueDateValue = getInvoiceDueDate(invoice);
        const invoiceDueDate = parseComparableDate(invoiceDueDateValue);

        if (!checkDueDate) {
            return {
                valid: false,
                message: "Seleccione la fecha de vencimiento del cheque.",
            };
        }

        if (!invoiceDueDate) {
            return {
                valid: false,
                message: `La factura ${documentNumber} no tiene fecha de vencimiento valida.`,
            };
        }

        const allowedCheckDueDate = addDaysToDate(
            invoiceDueDate,
            CHECK_DUE_DATE_GRACE_DAYS
        );

        if (!allowedCheckDueDate) {
            return {
                valid: false,
                message: `No se pudo validar la fecha de vencimiento de la factura ${documentNumber}.`,
            };
        }

        if (checkDueDate.getTime() > allowedCheckDueDate.getTime()) {
            return {
                valid: false,
                message:
                    `No se puede aplicar el cheque a la factura ${documentNumber}. ` +
                    `La fecha de vencimiento del cheque (${formatDateForInput(checkDueDate)}) ` +
                    `es mayor a la fecha de vencimiento de la factura (${formatDateForInput(invoiceDueDate)}).`,
            };
        }

        return { valid: true, message: "" };
    }

    function canApplyCheckToInvoice(invoice, showWarning = false) {
        const validation = getCheckDueDateValidation(invoice);

        if (!validation.valid && showWarning) {
            swalWarning(validation.message);
        }

        return validation.valid;
    }

    function clearCheckInvoiceApplication(invoice) {
        invoice.aplicarTodoCheque = false;
        invoice.aplicarMontoCheque = 0;
    }


    async function validateCheckAccountAndNumber() {
        const clientId = client.value?.id;
        const bankId = checkPayload.banco_id;
        const checkNumber = String(checkPayload.cheque).trim();
        const account = String(checkPayload.cuenta).trim();

        if (!clientId) {
            swalWarning("Seleccione un cliente antes de validar el cheque");
            return false;
        }

        if (!bankId) {
            swalWarning("Seleccione el banco");
            return false;
        }

        if (!account) {
            swalWarning("Ingrese el numero de cuenta");
            return false;
        }

        if (!checkNumber) {
            swalWarning("Ingrese el numero de cheque");
            return false;
        }

        if (typeof validateCheckReceiptNumber !== "function") {
            swalWarning("No se pudo validar el cheque");
            return false;
        }

        const resp = await validateCheckReceiptNumber(clientId, bankId, account, checkNumber);
        if (!resp?.ok) {
            checkPayload.cheque = "";
            const message = resp?.message || "Cheque ya registrado con anterioridad.";
            (resp?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
            return false;
        }


        return true;
    }

    // aplicacion del cheque con sus respectivas validaciones
    async function applyCheck() {
        const result = await v$.value.$validate();
        if (!result) {
            return false;
        }

        const isCheckAccountValid = await validateCheckAccountAndNumber();
        if (!isCheckAccountValid) {
            return false;
        }

        const checkAmount = toNumber(checkPayload.montoRecibido) ?? 0;

        if (checkAmount <= 0) {
            swalWarning("Ingrese un monto mayor a cero");
            return false;
        }

        checkPayload.montoRecibido = roundTo(checkAmount, 2);
        checkPayload.montoAplicado = 0;
        checkPayload.montoNoAplicado = roundTo(checkAmount, 2);
        checkPayload.facturas = [];
        checkInvoicesRows.value = buildCheckInvoiceRows();
        showTableInvoices.value = true;
        return true;
    }


    function buildCheckInvoiceRows() {
        return invoiceOptions.value
            .map(createCheckInvoiceRow)
            .filter((invoice) => getInvoiceCheckBalance(invoice) > 0);
    }

    function refreshCheckInvoiceRows() {
        if (!showTableInvoices.value) {
            return;
        }

        checkInvoicesRows.value = rebuildInvoiceRowsPreservingSelection({
            currentRows: checkInvoicesRows.value,
            nextRows: buildCheckInvoiceRows(),
            amountKey: "aplicarMontoCheque",
            applyAllKey: "aplicarTodoCheque",
            observationKey: "observacionCheque",
            getInvoiceBalance: getInvoiceCheckBalance,
            getAvailablePaymentAmount: () => checkPayload.montoRecibido,
        });
        updateCheckApplicationSummary();
    }

    function createCheckInvoiceRow(invoice) {
        const availableBalance = getInvoiceAvailableBalance(invoice);
        return {
            ...invoice,
            saldoDisponibleCheque: availableBalance,
            chequeAplicadoPrevio: 0,
            aplicarTodoCheque: false,
            aplicarMontoCheque: 0,
            observacionCheque: ""
        }
    }

    function getInvoiceCheckBalance(invoice) {
        return toNumber(invoice?.saldoDisponibleCheque) ?? getInvoiceAvailableBalance(invoice);
    }

    function getInvoiceAvailableBalance(invoice) {
        const invoiceBalance = toNumber(invoice?.saldoCliente) ?? 0;
        return roundTo(Math.max(invoiceBalance, 0), 2)
    }

    function createCheckInvoiceToAdd(invoice) {
        const appliedAmount = roundTo(toNumber(invoice?.aplicarMontoCheque) ?? 0, 2);
        const finalBalance = roundTo(
            Math.max(getInvoiceCheckBalance(invoice) - appliedAmount, 0),
            2
        );
        const invoiceData = { ...invoice };

        delete invoiceData.aplicarTodoCheque;
        delete invoiceData.saldoDisponibleCheque;
        delete invoiceData.chequeAplicadoPrevio;

        return {
            ...invoiceData,
            saldoFinal: finalBalance,
            aplicarMontoCheque: appliedAmount,
            observacionCheque: invoice?.observacionCheque ?? "",
        };
    }

    function syncAppliedCheckInvoices() {
        checkPayload.facturas = checkInvoicesRows.value
            .filter((invoice) => (toNumber(invoice?.aplicarMontoCheque) ?? 0) > 0)
            .map(createCheckInvoiceToAdd);
    }

    function calculateAppliedCheck(excludedInvoice = null) {
        return checkInvoicesRows.value.reduce((total, invoice) => {
            if (invoice === excludedInvoice) {
                return total;
            }

            return total + (toNumber(invoice?.aplicarMontoCheque) ?? 0);
        }, 0);
    }

    function updateCheckApplicationSummary() {
        const checkAmount = toNumber(checkPayload.montoRecibido) ?? 0;
        const appliedAmount = calculateAppliedCheck();

        checkPayload.montoAplicado = roundTo(appliedAmount, 2);
        checkPayload.montoNoAplicado = roundTo(
            Math.max(checkAmount - appliedAmount, 0),
            2
        );
        syncAppliedCheckInvoices();
    }

    function availableCheckForInvoice(invoice) {
        const checkAmount = toNumber(checkPayload.montoRecibido) ?? 0;
        const appliedWithoutInvoice = calculateAppliedCheck(invoice);

        return roundTo(Math.max(checkAmount - appliedWithoutInvoice, 0), 2);
    }

    function getInvoiceRemainingBalance(invoice) {
        const invoiceBalance = getInvoiceCheckBalance(invoice);
        const appliedAmount = toNumber(invoice?.aplicarMontoCheque) ?? 0;

        return roundTo(Math.max(invoiceBalance - appliedAmount, 0), 2);
    }

    function updateInvoiceCheckAmount(invoice) {
        let amountToApply = toNumber(invoice?.aplicarMontoCheque) ?? 0;
        const invoiceBalance = getInvoiceCheckBalance(invoice);
        const availableAmount = availableCheckForInvoice(invoice);

        if (amountToApply < 0) {
            swalWarning("No puede ingresar valores negativos.");
            amountToApply = 0;
        }

        if (amountToApply > 0 && !canApplyCheckToInvoice(invoice, true)) {
            clearCheckInvoiceApplication(invoice);
            updateCheckApplicationSummary();
            return;
        }

        if (amountToApply > invoiceBalance) {
            swalWarning("El monto aplicado no puede exceder el saldo disponible de la factura.");
            amountToApply = invoiceBalance;
        }

        if (amountToApply > availableAmount) {
            swalWarning("El monto aplicado no puede exceder el monto disponible por aplicar.");
            amountToApply = availableAmount;
        }

        invoice.aplicarMontoCheque = roundTo(amountToApply, 2);
        invoice.aplicarTodoCheque = invoice.aplicarMontoCheque > 0
            && invoice.aplicarMontoCheque >= invoiceBalance;

        updateCheckApplicationSummary();
    }

    function applyFullCheckToInvoice(invoice) {
        if (!invoice.aplicarTodoCheque) {
            invoice.aplicarMontoCheque = 0;
            updateCheckApplicationSummary();
            return;
        }

        if (!canApplyCheckToInvoice(invoice, true)) {
            clearCheckInvoiceApplication(invoice);
            updateCheckApplicationSummary();
            return;
        }

        const invoiceBalance = getInvoiceCheckBalance(invoice);
        const availableAmount = availableCheckForInvoice(invoice);

        if (availableAmount <= 0) {
            swalWarning("Ya no queda monto por aplicar.");
            invoice.aplicarTodoCheque = false;
            invoice.aplicarMontoCheque = 0;
            updateCheckApplicationSummary();
            return;
        }

        invoice.aplicarMontoCheque = roundTo(
            Math.min(invoiceBalance, availableAmount),
            2
        );
        updateCheckApplicationSummary();
    }

    function validateAppliedInvoicesAvailability() {
        const overAppliedInvoice = checkPayload.facturas.find((invoice) => {
            const appliedAmount = roundTo(toNumber(invoice?.aplicarMontoCheque) ?? 0, 2);
            const invoiceBalance = getInvoiceCheckBalance(invoice);

            return appliedAmount > invoiceBalance;
        });

        if (!overAppliedInvoice) {
            return true;
        }

        swalWarning(
            `El monto aplicado a la factura ${getInvoiceDocument(overAppliedInvoice)} excede su saldo disponible.`
        );
        return false;
    }

    function validateAppliedCheckDueDates() {
        const invalidInvoice = checkPayload.facturas.find((invoice) => {
            const appliedAmount = roundTo(toNumber(invoice?.aplicarMontoCheque) ?? 0, 2);

            return appliedAmount > 0 && !canApplyCheckToInvoice(invoice);
        });

        if (!invalidInvoice) {
            return true;
        }

        swalWarning(getCheckDueDateValidation(invalidInvoice).message);
        return false;
    }

    function createCheckToAdd() {
        if (!showTableInvoices.value) {
            swalWarning("Aplique el cheque antes de registrarlo.");
            return null;
        }

        updateCheckApplicationSummary();

        if (!validateAppliedCheckDueDates()) {
            return null;
        }

        if (!validateAppliedInvoicesAvailability()) {
            return null;
        }

        return {
            banco_id: checkPayload.banco_id,
            cuenta: String(checkPayload.cuenta ?? "").trim(),
            cheque: String(checkPayload.cheque ?? "").trim(),
            fechaEmision: checkPayload.fechaEmision,
            fechaVencimiento: checkPayload.fechaVencimiento,
            montoRecibido: roundTo(toNumber(checkPayload.montoRecibido) ?? 0, 2),
            montoAplicado: roundTo(toNumber(checkPayload.montoAplicado) ?? 0, 2),
            montoNoAplicado: roundTo(toNumber(checkPayload.montoNoAplicado) ?? 0, 2),
            comentario: checkPayload.comentario ?? "",
            facturas: checkPayload.facturas.map((invoice) => ({ ...invoice })),
        };
    }



    watch(
        [invoiceOptions, invoiceRefreshVersion],
        refreshCheckInvoiceRows,
        { deep: true }
    );


    return {
        invoiceOptions,
        bankClientsOptions,
        flatPickrState,
        checkPayload,
        v$,
        showTableInvoices,
        checkInvoices,
        selectedBankName,
        validationMessage,
        formatCheckAmount,
        applyCheck,
        resetCheckPayload,
        resetCheckApplicationState,
        updateInvoiceCheckAmount,
        applyFullCheckToInvoice,
        getInvoiceRemainingBalance,
        createCheckToAdd,
        getBankId,
        getBankName,
    }
}
