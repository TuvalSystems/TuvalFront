import { computed, reactive, ref, watch } from "vue";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import useVuelidate from "@vuelidate/core";
import {
    decimal,
    helpers,
    required
} from "@vuelidate/validators";
import { swalError, swalWarning } from "@/functions/swal-alert";
import { formatPriceJm, roundTo, toNumber } from "@/functions";
import { formatDateForInput } from "@/utils/cobros/validateDate";

const typeDeposits = [
    { label: "Deposito Bancario", value: "DP" },
    { label: "Deposito Anterior", value: "DA" },
    { label: "Transferencia Bancaria", value: "TR" },
];

const requiredField = (message) => helpers.withMessage(message, required);
const decimalField = helpers.withMessage("Ingrese un valor numerico valido.", decimal);

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

function getDepositTypeLabel(value) {
    return typeDeposits.find((type) => type.value === value)?.label ?? "Sin tipo";
}

function getInvoiceDocument(invoice) {
    return String(invoice?.documento ?? "").trim();
}

function createEmptyDeposit() {
    return {
        tipo: "",
        banco_id: "",
        comprobante: "",
        fechaDeposito: formatDateForInput(new Date()),
        montoRecibido: 0,
        montoNoAplicado: 0,
        montoAplicado: 0,
        facturas: []
    };
}

function createDepositRule() {
    return computed(() => ({
        tipo: {
            required: requiredField("Seleccione el tipo de deposito.")
        },
        banco_id: {
            required: requiredField("Seleccione el banco."),
        },
        comprobante: {
            required: requiredField("Ingrese el comprobante."),
        },
        fechaDeposito: {
            required: requiredField("Seleccione la fecha del deposito.")
        },
        montoRecibido: {
            required: requiredField("Ingrese el monto del deposito."),
            decimal: decimalField
        },
    }));
}

function createDateRange(type) {
    const currentDate = new Date();
    const currentMonthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    );
    const previousMonthEnd = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        0
    );

    if (type === "DA") {
        return {
            minDate: null,
            maxDate: previousMonthEnd,
            defaultDate: previousMonthEnd,
        };
    }

    if (type === "DP") {
        return {
            minDate: currentMonthStart,
            maxDate: currentDate,
            defaultDate: currentDate,
        };
    }

    return {
        minDate: null,
        maxDate: currentDate,
        defaultDate: currentDate,
    };
}

export function useInvoiceCollectionDeposits({
    facturas,
    bancosTuval,
    depositos,
    cliente,
    validateDepositReceiptNumber,

} = {}) {
    const invoiceOptions = computed(() => normalizeCollectionItems(facturas));
    const bankTuvalOptions = computed(() => normalizeCollectionItems(bancosTuval));
    const registeredDeposits = computed(() => normalizeCollectionItems(depositos));
    const client = computed(() => resolveSource(cliente) ?? {});
    const depositPayload = reactive(createEmptyDeposit());
    const v$ = useVuelidate(createDepositRule(), depositPayload);
    const showTableInvoices = ref(false);
    const depositInvoiceRows = ref([]);
    const depositInvoices = computed(() => depositInvoiceRows.value);

    const depositDateConfig = reactive({
        locale: Spanish,
        minDate: null,
        maxDate: new Date(),
    });

    const selectedBank = computed(() =>
        bankTuvalOptions.value.find((bank) =>
            String(getBankId(bank)) === String(depositPayload.banco_id)
        ) ?? null
    );

    const selectedBankName = computed(() =>
        selectedBank.value ? getBankName(selectedBank.value) : "Sin banco"
    );

    const selectedDepositTypeLabel = computed(() =>
        getDepositTypeLabel(depositPayload.tipo)
    );

    const totalRegisteredDeposits = computed(() =>
        registeredDeposits.value.reduce(
            (total, deposit) =>
                total + (toNumber(deposit?.montoRecibido ?? deposit?.monto) ?? 0),
            0
        )
    );

    function resetDepositApplicationState() {
        depositInvoiceRows.value = [];
        depositPayload.montoAplicado = 0;
        depositPayload.montoNoAplicado = 0;
        depositPayload.facturas = [];
        showTableInvoices.value = false;
    }

    function resetDepositPayload() {
        Object.assign(depositPayload, createEmptyDeposit());
        resetDepositApplicationState();
        v$.value.$reset();
    }

    function updateDepositDateRange() {
        const range = createDateRange(depositPayload.tipo);

        depositDateConfig.minDate = range.minDate;
        depositDateConfig.maxDate = range.maxDate;
        depositPayload.fechaDeposito = formatDateForInput(range.defaultDate);
    }

    function validationMessage(field) {
        return field?.$errors?.[0]?.$message ?? "Campo invalido.";
    }

    function formatDepositAmount(value) {
        return formatPriceJm(value) ?? "0.00";
    }

    function getDepositInvoiceItems(deposit) {
        return normalizeCollectionItems(deposit?.facturas);
    }

    function getDepositInvoiceAppliedAmount(invoice) {
        return toNumber(
            invoice?.aplicarMontoDeposito ??
            0
        ) ?? 0;
    }

    function getRegisteredDepositAmountForInvoice(invoice) {
        const documentNumber = getInvoiceDocument(invoice);

        if (!documentNumber) {
            return 0;
        }

        return roundTo(
            registeredDeposits.value.reduce((depositTotal, deposit) => {
                const appliedInvoices = getDepositInvoiceItems(deposit);

                return depositTotal + appliedInvoices.reduce((invoiceTotal, appliedInvoice) => {
                    if (getInvoiceDocument(appliedInvoice) !== documentNumber) {
                        return invoiceTotal;
                    }

                    return invoiceTotal + getDepositInvoiceAppliedAmount(appliedInvoice);
                }, 0);
            }, 0),
            2
        );
    }

    function getInvoiceAvailableBalance(invoice) {
        const invoiceBalance = toNumber(invoice?.saldoCliente) ?? 0;
        const registeredAmount = getRegisteredDepositAmountForInvoice(invoice);

        return roundTo(Math.max(invoiceBalance - registeredAmount, 0), 2);
    }

    function getInvoiceDepositBalance(invoice) {
        return toNumber(invoice?.saldoDisponibleDeposito) ?? getInvoiceAvailableBalance(invoice);
    }

    function createDepositInvoiceRow(invoice) {
        const availableBalance = getInvoiceAvailableBalance(invoice);

        return {
            ...invoice,
            saldoDisponibleDeposito: availableBalance,
            depositoAplicadoPrevio: getRegisteredDepositAmountForInvoice(invoice),
            aplicarTodoDeposito: false,
            aplicarMontoDeposito: 0,
            observacionDeposito: "",
        };
    }

    function buildDepositInvoiceRows() {
        return invoiceOptions.value
            .map(createDepositInvoiceRow)
            .filter((invoice) => getInvoiceDepositBalance(invoice) > 0);
    }

    function createDepositInvoiceToAdd(invoice) {
        const appliedAmount = roundTo(toNumber(invoice?.aplicarMontoDeposito) ?? 0, 2);
        const finalBalance = roundTo(
            Math.max(getInvoiceDepositBalance(invoice) - appliedAmount, 0),
            2
        );
        const invoiceData = { ...invoice };

        delete invoiceData.aplicarTodoDeposito;
        delete invoiceData.saldoDisponibleDeposito;
        delete invoiceData.depositoAplicadoPrevio;

        return {
            ...invoiceData,
            saldoFinal: finalBalance,
            aplicarMontoDeposito: appliedAmount,
            observacionDeposito: invoice?.observacionDeposito ?? "",
        };
    }

    function syncAppliedDepositInvoices() {
        depositPayload.facturas = depositInvoiceRows.value
            .filter((invoice) => (toNumber(invoice?.aplicarMontoDeposito) ?? 0) > 0)
            .map(createDepositInvoiceToAdd);
    }

    function calculateAppliedDeposit(excludedInvoice = null) {
        return depositInvoiceRows.value.reduce((total, invoice) => {
            if (invoice === excludedInvoice) {
                return total;
            }

            return total + (toNumber(invoice?.aplicarMontoDeposito) ?? 0);
        }, 0);
    }

    function updateDepositApplicationSummary() {
        const depositAmount = toNumber(depositPayload.montoRecibido) ?? 0;
        const appliedAmount = calculateAppliedDeposit();

        depositPayload.montoAplicado = roundTo(appliedAmount, 2);
        depositPayload.montoNoAplicado = roundTo(
            Math.max(depositAmount - appliedAmount, 0),
            2
        );
        syncAppliedDepositInvoices();
    }

    function availableDepositForInvoice(invoice) {
        const depositAmount = toNumber(depositPayload.montoRecibido) ?? 0;
        const appliedWithoutInvoice = calculateAppliedDeposit(invoice);

        return roundTo(Math.max(depositAmount - appliedWithoutInvoice, 0), 2);
    }

    function getInvoiceRemainingBalance(invoice) {
        const invoiceBalance = getInvoiceDepositBalance(invoice);
        const appliedAmount = toNumber(invoice?.aplicarMontoDeposito) ?? 0;

        return roundTo(Math.max(invoiceBalance - appliedAmount, 0), 2);
    }

    function updateInvoiceDepositAmount(invoice) {
        let amountToApply = toNumber(invoice?.aplicarMontoDeposito) ?? 0;
        const invoiceBalance = getInvoiceDepositBalance(invoice);
        const availableAmount = availableDepositForInvoice(invoice);

        if (amountToApply < 0) {
            swalWarning("No puede ingresar valores negativos.");
            amountToApply = 0;
        }

        if (amountToApply > invoiceBalance) {
            swalWarning("El monto aplicado no puede exceder el saldo disponible de la factura.");
            amountToApply = invoiceBalance;
        }

        if (amountToApply > availableAmount) {
            swalWarning("El monto aplicado no puede exceder el monto disponible por aplicar.");
            amountToApply = availableAmount;
        }

        invoice.aplicarMontoDeposito = roundTo(amountToApply, 2);
        invoice.aplicarTodoDeposito = invoice.aplicarMontoDeposito > 0
            && invoice.aplicarMontoDeposito >= invoiceBalance;

        updateDepositApplicationSummary();
    }

    function applyFullDepositToInvoice(invoice) {
        if (!invoice.aplicarTodoDeposito) {
            invoice.aplicarMontoDeposito = 0;
            updateDepositApplicationSummary();
            return;
        }

        const invoiceBalance = getInvoiceDepositBalance(invoice);
        const availableAmount = availableDepositForInvoice(invoice);

        if (availableAmount <= 0) {
            swalWarning("Ya no queda monto por aplicar.");
            invoice.aplicarTodoDeposito = false;
            invoice.aplicarMontoDeposito = 0;
            updateDepositApplicationSummary();
            return;
        }

        invoice.aplicarMontoDeposito = roundTo(
            Math.min(invoiceBalance, availableAmount),
            2
        );
        updateDepositApplicationSummary();
    }

    function receiptAlreadyRegistered() {
        const receiptNumber = String(depositPayload.comprobante ?? "").trim().toLowerCase();
        const bankId = String(depositPayload.banco_id ?? "");

        return registeredDeposits.value.some((deposit) => {
            const registeredReceipt = String(
                deposit?.comprobante ?? ""
            ).trim().toLowerCase();
            const registeredBankId = String(
                deposit?.banco_id ?? ""
            );

            return registeredReceipt === receiptNumber && registeredBankId === bankId;
        });
    }

    function validateAppliedInvoicesAvailability() {
        const overAppliedInvoice = depositPayload.facturas.find((invoice) => {
            const appliedAmount = roundTo(toNumber(invoice?.aplicarMontoDeposito) ?? 0, 2);
            const invoiceBalance = getInvoiceDepositBalance(invoice);

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


    /**validacion de comprobante de deposito */
    async function validateReceiptNumber() {
        const clientId = client.value?.id;
        const bankId = depositPayload.banco_id;
        const receiptNumber = String(depositPayload.comprobante ?? "").trim();

        if (!clientId) {
            swalWarning("Seleccione un cliente antes de validar el comprobante");
            return false;
        }

        if (!bankId) {
            swalWarning("Seleccione el banco");
            return false;
        }

        if (!receiptNumber) {
            swalWarning("Ingrese el numero de comprobante");
            return false;
        }

        if (receiptAlreadyRegistered()) {
            swalWarning("Este comprobante ya fue ingresado para el banco seleccionado.");
            return false;
        }

        if (typeof validateDepositReceiptNumber !== "function") {
            swalWarning("No se pudo validar el comprobante");
            return false;
        }

        const resp = await validateDepositReceiptNumber(clientId, bankId, receiptNumber);
        if (!resp?.ok) {
            depositPayload.comprobante = "";
            const message = resp?.message || "Comprobante ya registrado con anterioridad.";
            (resp?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
            return false;
        }

        return true;

    }

    async function applyDeposit() {
        const result = await v$.value.$validate();
        if (!result) {
            return false;
        }

        const isReceiptValid = await validateReceiptNumber();
        if (!isReceiptValid) {
            return false;
        }

        const depositAmount = toNumber(depositPayload.montoRecibido) ?? 0;

        if (depositAmount <= 0) {
            swalWarning("Ingrese un monto mayor a cero.");
            return false;
        }



        depositPayload.montoRecibido = roundTo(depositAmount, 2);
        depositPayload.montoAplicado = 0;
        depositPayload.montoNoAplicado = roundTo(depositAmount, 2);
        depositPayload.facturas = [];
        depositInvoiceRows.value = buildDepositInvoiceRows();
        showTableInvoices.value = true;

        return true;
    }

    function createDepositToAdd() {
        if (!showTableInvoices.value) {
            swalWarning("Aplique el deposito antes de registrarlo.");
            return null;
        }

        updateDepositApplicationSummary();

        if (!validateAppliedInvoicesAvailability()) {
            return null;
        }

        return {
            tipo: depositPayload.tipo,
            banco_id: depositPayload.banco_id,
            comprobante: String(depositPayload.comprobante ?? "").trim(),
            fechaDeposito: depositPayload.fechaDeposito,
            montoRecibido: roundTo(toNumber(depositPayload.montoRecibido) ?? 0, 2),
            montoAplicado: roundTo(toNumber(depositPayload.montoAplicado) ?? 0, 2),
            montoNoAplicado: roundTo(toNumber(depositPayload.montoNoAplicado) ?? 0, 2),
            facturas: depositPayload.facturas.map((invoice) => ({ ...invoice })),
        };
    }

    watch(
        () => depositPayload.tipo,
        () => {
            updateDepositDateRange();
            resetDepositApplicationState();
        }
    );

    return {
        typeDeposits,
        depositPayload,
        v$,
        invoiceOptions,
        bankTuvalOptions,
        registeredDeposits,
        totalRegisteredDeposits,
        depositDateConfig,
        showTableInvoices,
        depositInvoices,
        selectedBankName,
        selectedDepositTypeLabel,
        validationMessage,
        formatDepositAmount,
        applyDeposit,
        resetDepositPayload,
        resetDepositApplicationState,
        updateInvoiceDepositAmount,
        applyFullDepositToInvoice,
        getInvoiceRemainingBalance,
        validateReceiptNumber,
        createDepositToAdd,
        getBankId,
        getBankName,
        getDepositTypeLabel,
    };
}
