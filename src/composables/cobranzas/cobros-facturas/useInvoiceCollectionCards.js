import { computed, reactive, ref, watch } from "vue";
import { Spanish } from "flatpickr/dist/l10n/es.js";
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
import {
    isBlankPaymentAmount,
    rebuildInvoiceRowsPreservingSelection
} from "@/utils/cobros/paymentInvoiceRows";

const requiredField = (message) => helpers.withMessage(message, required);
const decimalField = helpers.withMessage("Ingrese un valor numerico valido.", decimal);
const numericCardField = helpers.withMessage(
    "Ingrese solo numeros.",
    helpers.regex(/^\d+$/)
);
const cardApprovalMaxLength = helpers.withMessage(
    "El comprobante no puede exceder 30 caracteres.",
    maxLength(30)
);
const cardCommentMaxLength = helpers.withMessage(
    "El comentario no puede exceder 100 caracteres.",
    maxLength(100)
);

const cardAmountMaxLength = helpers.withMessage(
    PAYMENT_AMOUNT_MAX_LENGTH_MESSAGE,
    maxLength(PAYMENT_AMOUNT_MAX_LENGTH)
);

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

function getBankId(bank) {
    return bank?.id ?? bank?.CB_ID ?? bank?.banco_id ?? bank?.value ?? "";
}

function getBankName(bank) {
    return bank?.CB_DESCRIPCION ?? bank?.nombre ?? bank?.label ?? "Banco no definido";
}

function getInvoiceDocument(invoice) {
    return String(invoice?.documento ?? "").trim();
}

function createEmptyCard() {
    return {
        banco_id: "",
        comprobante: "",
        montoRecibido: null,
        montoAplicado: 0,
        montoNoAplicado: 0,
        fechaTarjeta: formatDateForInput(new Date()),
        comentario: "",
        facturas: [],
    };
}

function createCardRules() {
    return computed(() => ({
        banco_id: {
            required: requiredField("Seleccione un emisor."),
        },
        comprobante: {
            required: requiredField("Ingrese el numero de aprobación."),
            numeric: numericCardField,
            maxLength: cardApprovalMaxLength,
        },
        montoRecibido: {
            required: requiredField("Ingrese el monto de la tarjeta."),
            decimal: decimalField,
            maxLength: cardAmountMaxLength
        },
        comentario: {
            required: requiredField("Ingrese el lote o referencia."),
            numeric: numericCardField,
            maxLength: cardCommentMaxLength,
        },
    }));
}

export function useInvoiceCollectionCards({
    facturas,
    bancoTarjetas,
    cliente,
    invoiceDataVersion,
} = {}) {
    const invoiceOptions = computed(() => normalizeCollectionItems(facturas));
    const bankCardsOptions = computed(() => normalizeCollectionItems(bancoTarjetas));
    const client = computed(() => resolveSource(cliente) ?? {});
    const invoiceRefreshVersion = computed(() => resolveSource(invoiceDataVersion) ?? 0);
    const cardPayload = reactive(createEmptyCard());
    const v$ = useVuelidate(createCardRules(), cardPayload);
    const showTableInvoices = ref(false);
    const cardInvoiceRows = ref([]);
    const cardInvoices = computed(() => cardInvoiceRows.value);

    const cardDateConfig = reactive({
        locale: Spanish,
        maxDate: new Date(),
    });

    const selectedBank = computed(() =>
        bankCardsOptions.value.find((bank) =>
            String(getBankId(bank)) === String(cardPayload.banco_id)
        ) ?? null
    );

    const selectedBankName = computed(() =>
        selectedBank.value ? getBankName(selectedBank.value) : "Sin emisor"
    );

    function resetCardApplicationState() {
        cardInvoiceRows.value = [];
        cardPayload.montoAplicado = 0;
        cardPayload.montoNoAplicado = 0;
        cardPayload.facturas = [];
        showTableInvoices.value = false;
    }

    function resetCardPayload() {
        Object.assign(cardPayload, createEmptyCard());
        resetCardApplicationState();
        v$.value.$reset();
    }

    function validationMessage(field) {
        return field?.$errors?.[0]?.$message ?? "Campo invalido.";
    }

    function formatCardAmount(value) {
        return formatPriceJm(value) ?? "0.00";
    }

    function getInvoiceAvailableBalance(invoice) {
        const invoiceBalance = toNumber(invoice?.saldoCliente) ?? 0;

        return roundTo(Math.max(invoiceBalance, 0), 2);
    }

    function getInvoiceCardBalance(invoice) {
        return toNumber(invoice?.saldoDisponibleTarjeta) ?? getInvoiceAvailableBalance(invoice);
    }

    function createCardInvoiceRow(invoice) {
        const availableBalance = getInvoiceAvailableBalance(invoice);

        return {
            ...invoice,
            saldoDisponibleTarjeta: availableBalance,
            aplicarTodoTarjeta: false,
            aplicarMontoTarjeta: null,
            observacionTarjeta: "",
        };
    }

    function buildCardInvoiceRows() {
        return invoiceOptions.value
            .map(createCardInvoiceRow)
            .filter((invoice) => getInvoiceCardBalance(invoice) > 0);
    }

    function refreshCardInvoiceRows() {
        if (!showTableInvoices.value) {
            return;
        }

        cardInvoiceRows.value = rebuildInvoiceRowsPreservingSelection({
            currentRows: cardInvoiceRows.value,
            nextRows: buildCardInvoiceRows(),
            amountKey: "aplicarMontoTarjeta",
            applyAllKey: "aplicarTodoTarjeta",
            observationKey: "observacionTarjeta",
            getInvoiceBalance: getInvoiceCardBalance,
            getAvailablePaymentAmount: () => cardPayload.montoRecibido,
        });
        updateCardApplicationSummary();
    }

    function createCardInvoiceToAdd(invoice) {
        const appliedAmount = roundTo(toNumber(invoice?.aplicarMontoTarjeta) ?? 0, 2);
        const finalBalance = roundTo(
            Math.max(getInvoiceCardBalance(invoice) - appliedAmount, 0),
            2
        );
        const invoiceData = { ...invoice };

        delete invoiceData.aplicarTodoTarjeta;
        delete invoiceData.saldoDisponibleTarjeta;

        return {
            ...invoiceData,
            saldoFinal: finalBalance,
            aplicarMontoTarjeta: appliedAmount,
            observacionTarjeta: invoice?.observacionTarjeta ?? "",
        };
    }

    function syncAppliedCardInvoices() {
        cardPayload.facturas = cardInvoiceRows.value
            .filter((invoice) => (toNumber(invoice?.aplicarMontoTarjeta) ?? 0) > 0)
            .map(createCardInvoiceToAdd);
    }

    function calculateAppliedCard(excludedInvoice = null) {
        return cardInvoiceRows.value.reduce((total, invoice) => {
            if (invoice === excludedInvoice) {
                return total;
            }

            return total + (toNumber(invoice?.aplicarMontoTarjeta) ?? 0);
        }, 0);
    }

    function updateCardApplicationSummary() {
        const cardAmount = toNumber(cardPayload.montoRecibido) ?? 0;
        const appliedAmount = calculateAppliedCard();

        cardPayload.montoAplicado = roundTo(appliedAmount, 2);
        cardPayload.montoNoAplicado = roundTo(
            Math.max(cardAmount - appliedAmount, 0),
            2
        );
        syncAppliedCardInvoices();
    }

    function availableCardForInvoice(invoice) {
        const cardAmount = toNumber(cardPayload.montoRecibido) ?? 0;
        const appliedWithoutInvoice = calculateAppliedCard(invoice);

        return roundTo(Math.max(cardAmount - appliedWithoutInvoice, 0), 2);
    }

    function getInvoiceRemainingBalance(invoice) {
        const invoiceBalance = getInvoiceCardBalance(invoice);
        const appliedAmount = toNumber(invoice?.aplicarMontoTarjeta) ?? 0;

        return roundTo(Math.max(invoiceBalance - appliedAmount, 0), 2);
    }

    function updateInvoiceCardAmount(invoice) {
        if (isBlankPaymentAmount(invoice?.aplicarMontoTarjeta)) {
            invoice.aplicarMontoTarjeta = null;
            invoice.aplicarTodoTarjeta = false;
            updateCardApplicationSummary();
            return;
        }

        let amountToApply = toNumber(invoice?.aplicarMontoTarjeta) ?? 0;
        const invoiceBalance = getInvoiceCardBalance(invoice);
        const availableAmount = availableCardForInvoice(invoice);

        if (amountToApply <= 0) {
            if (amountToApply < 0) {
                swalWarning("No puede ingresar valores negativos.");
            }

            invoice.aplicarMontoTarjeta = null;
            invoice.aplicarTodoTarjeta = false;
            updateCardApplicationSummary();
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

        invoice.aplicarMontoTarjeta = roundTo(amountToApply, 2);
        invoice.aplicarTodoTarjeta = invoice.aplicarMontoTarjeta > 0
            && invoice.aplicarMontoTarjeta >= invoiceBalance;

        updateCardApplicationSummary();
    }

    function applyFullCardToInvoice(invoice) {
        if (!invoice.aplicarTodoTarjeta) {
            invoice.aplicarMontoTarjeta = null;
            updateCardApplicationSummary();
            return;
        }

        const invoiceBalance = getInvoiceCardBalance(invoice);
        const availableAmount = availableCardForInvoice(invoice);

        if (availableAmount <= 0) {
            swalWarning("Ya no queda monto por aplicar.");
            invoice.aplicarTodoTarjeta = false;
            invoice.aplicarMontoTarjeta = null;
            updateCardApplicationSummary();
            return;
        }

        invoice.aplicarMontoTarjeta = roundTo(
            Math.min(invoiceBalance, availableAmount),
            2
        );
        updateCardApplicationSummary();
    }

    function validateAppliedInvoicesAvailability() {
        const overAppliedInvoice = cardPayload.facturas.find((invoice) => {
            const appliedAmount = roundTo(toNumber(invoice?.aplicarMontoTarjeta) ?? 0, 2);
            const invoiceBalance = getInvoiceCardBalance(invoice);

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

    async function applyCard() {
        const result = await v$.value.$validate();
        if (!result) {
            return false;
        }

        const cardAmount = toNumber(cardPayload.montoRecibido) ?? 0;

        if (!client.value?.id) {
            swalWarning("Seleccione un cliente antes de aplicar la tarjeta.");
            return false;
        }

        if (cardAmount <= 0) {
            swalWarning("Ingrese un monto mayor a cero.");
            return false;
        }

        cardPayload.montoRecibido = roundTo(cardAmount, 2);
        cardPayload.montoAplicado = 0;
        cardPayload.montoNoAplicado = roundTo(cardAmount, 2);
        cardPayload.facturas = [];
        cardInvoiceRows.value = buildCardInvoiceRows();
        showTableInvoices.value = true;

        return true;
    }

    function createCardToAdd() {
        if (!showTableInvoices.value) {
            swalWarning("Aplique la tarjeta antes de registrarla.");
            return null;
        }

        updateCardApplicationSummary();

        if (!validateAppliedInvoicesAvailability()) {
            return null;
        }

        return {
            banco_id: cardPayload.banco_id,
            banco_nombre: selectedBankName.value,
            comprobante: String(cardPayload.comprobante ?? "").trim(),
            fechaTarjeta: cardPayload.fechaTarjeta,
            montoRecibido: roundTo(toNumber(cardPayload.montoRecibido) ?? 0, 2),
            montoAplicado: roundTo(toNumber(cardPayload.montoAplicado) ?? 0, 2),
            montoNoAplicado: roundTo(toNumber(cardPayload.montoNoAplicado) ?? 0, 2),
            comentario: String(cardPayload.comentario ?? "").trim(),
            facturas: cardPayload.facturas.map((invoice) => ({ ...invoice })),
        };
    }

    watch(
        [invoiceOptions, invoiceRefreshVersion],
        refreshCardInvoiceRows,
        { deep: true }
    );

    return {
        cardPayload,
        invoiceOptions,
        bankCardsOptions,
        cardDateConfig,
        showTableInvoices,
        cardInvoices,
        selectedBankName,
        v$,
        resetCardPayload,
        resetCardApplicationState,
        validationMessage,
        formatCardAmount,
        applyCard,
        updateInvoiceCardAmount,
        applyFullCardToInvoice,
        getInvoiceRemainingBalance,
        createCardToAdd,
        getBankId,
        getBankName,
    };
}
