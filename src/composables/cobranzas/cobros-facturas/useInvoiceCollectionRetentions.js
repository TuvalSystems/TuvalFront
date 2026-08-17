import { computed, reactive } from "vue";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import useVuelidate from "@vuelidate/core";
import {
    decimal,
    helpers,
    maxLength,
    minLength,
    required
} from "@vuelidate/validators";
import { swalError, swalWarning } from "@/functions/swal-alert";
import { formatPriceJm, roundTo, toNumber } from "@/functions";
import { formatDateForInput, parseLocalDate } from "@/utils/cobros/validateDate";
import {
    PAYMENT_AMOUNT_MAX_LENGTH,
    PAYMENT_AMOUNT_MAX_LENGTH_MESSAGE
} from "@/utils/cobros/paymentAmountInput";



const retentionAmountMaxLength = helpers.withMessage(
    PAYMENT_AMOUNT_MAX_LENGTH_MESSAGE,
    maxLength(PAYMENT_AMOUNT_MAX_LENGTH)
);

const retentionTaxRows = [
    {
        label: "IVA",
        percentageKey: "porcentajeIva",
        amountKey: "iva",
    },
    {
        label: "RENTA",
        percentageKey: "porcentajeRenta",
        amountKey: "renta",
    },
    {
        label: "IVA SRV",
        percentageKey: "porcentajeIvaSrv",
        amountKey: "ivaSrv",
    },
    {
        label: "RENTA SRV",
        percentageKey: "porcentajeRentaSrv",
        amountKey: "rentaSrv",
    },
];

const numericRetentionFields = [
    "montoOriginal",
    "saldoFactura",
    "subtotal",
    "ivaFactura",
    "iva",
    "porcentajeIva",
    "renta",
    "porcentajeRenta",
    "ivaSrv",
    "porcentajeIvaSrv",
    "rentaSrv",
    "porcentajeRentaSrv",
    "total",
];

const requiredField = (message) => helpers.withMessage(message, required);
const decimalField = helpers.withMessage("Ingrese un valor numerico valido.", decimal);
const numericAuthorizationField = helpers.withMessage(
    "Ingrese solo numeros en la autorizacion.",
    helpers.regex(/^\d+$/)
);
const authorizationMaxLength = helpers.withMessage(
    "La autorizacion no puede exceder 50 caracteres.",
    maxLength(50)
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

function createEmptyRetention() {
    return {
        documento: null,
        fechaEmision: "",
        fechaVencimiento: "",
        montoOriginal: 0,
        saldoFactura: 0,
        subtotal: 0,
        ivaFactura: 0,
        iva: "",
        porcentajeIva: "",
        renta: "",
        porcentajeRenta: "",
        ivaSrv: "",
        porcentajeIvaSrv: "",
        rentaSrv: "",
        porcentajeRentaSrv: "",
        retEmision: "",
        retCaducidad: "",
        comprobante: "",
        autorizacion: "",
        total: 0
    };
}

function createRetentionRules() {
    return computed(() => ({
        documento: {
            required: requiredField("Seleccione un documento."),
        },
        retEmision: {
            required: requiredField("Seleccione la fecha de emision.")
        },
        retCaducidad: {
            required: requiredField("Seleccione la fecha de caducidad.")
        },
        iva: {
            required: requiredField("Ingrese el valor retenido de IVA."),
            decimal: decimalField,
        },
        renta: {
            required: requiredField("Ingrese el valor retenido de renta."),
            decimal: decimalField,
        },
        comprobante: {
            required: requiredField("Ingrese el numero de comprobante."),
            minLength: helpers.withMessage("El comprobante debe tener 17 caracteres.", minLength(17)),
        },
        autorizacion: {
            required: requiredField("Ingrese el numero de autorizacion."),
            minLength: helpers.withMessage("La autorizacion debe tener al menos 10 caracteres.", minLength(10)),
            numeric: numericAuthorizationField,
            maxLength: authorizationMaxLength,
        },
        porcentajeIva: {
            required: requiredField("Ingrese el porcentaje de IVA."),
            decimal: decimalField,
        },
        porcentajeRenta: {
            required: requiredField("Ingrese el porcentaje de renta."),
            decimal: decimalField,
        },
        ivaSrv: {
            decimal: decimalField,
            maxLength: retentionAmountMaxLength,
        },
        rentaSrv: {
            decimal: decimalField,
            maxLength: retentionAmountMaxLength,
        },
        porcentajeIvaSrv: {
            decimal: decimalField
        },
        porcentajeRentaSrv: {
            decimal: decimalField
        }
    }));
}

function getRetentionDocument(retention) {
    return String(retention?.documento ?? "").trim();
}

function calculateAllowedRetentionDate(invoiceIssueDate) {
    const invoiceDate = parseLocalDate(invoiceIssueDate);

    if (!invoiceDate) {
        return null;
    }

    const currentDate = new Date();
    const currentMonthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
    );

    const previousMonthStart = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
    );

    const invoiceMonthStart = new Date(
        invoiceDate.getFullYear(),
        invoiceDate.getMonth(),
        1
    );

    const isCurrentMonth =
        invoiceMonthStart.getTime() === currentMonthStart.getTime();

    const isPreviousMonth =
        invoiceMonthStart.getTime() === previousMonthStart.getTime();

    if (isCurrentMonth) {
        const allowedDate = new Date(invoiceDate);

        allowedDate.setDate(
            allowedDate.getDate() + 6
        );

        return allowedDate;
    }

    if (isPreviousMonth) {
        return new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            5
        );
    }

    return null;
}

function getRetentionRows(retention) {
    return retentionTaxRows.map((row) => ({
        label: row.label,
        percentage: toNumber(retention?.[row.percentageKey]) ?? 0,
        amount: formatPriceJm(retention?.[row.amountKey]) ?? "0.00",
    }));
}

function calculateRetentionTaxAmount(baseAmount, percentage) {
    return roundTo(
        (toNumber(baseAmount) ?? 0) * ((toNumber(percentage) ?? 0) / 100),
        2
    );
}

function buildRetentionPayload(payload) {
    const retention = {
        ...payload,
    };

    numericRetentionFields.forEach((field) => {
        retention[field] = roundTo(toNumber(retention[field]) ?? 0, 2);
    });

    retention.total = roundTo(
        retention.iva +
        retention.ivaSrv +
        retention.renta +
        retention.rentaSrv,
        2
    );

    return retention;
}

export function useInvoiceCollectionRetentions({
    facturasRetenciones,
    retenciones,
    cliente,
    validateRetentionReceiptNumber,
} = {}) {
    const retentionPayload = reactive(createEmptyRetention());
    const retentionOptions = computed(() => normalizeCollectionItems(facturasRetenciones));
    const retentions = computed(() => normalizeCollectionItems(retenciones));
    const client = computed(() => resolveSource(cliente) ?? {});
    const flatPickrState = reactive({
        emision: {
            minDate: Date.now(),
            maxDate: Date.now(),
            locale: Spanish,
        },
        caducidad: {
            minDate: Date.now(),
            locale: Spanish,
        },
    });
    const v$ = useVuelidate(createRetentionRules(), retentionPayload);

    const totalRetention = computed(() =>
        retentions.value.reduce(
            (total, retention) => total + (toNumber(retention?.total) ?? 0),
            0
        )
    );

    function resetRetentionPayload() {
        Object.assign(retentionPayload, createEmptyRetention());
    }

    function validationMessage(field) {
        return field?.$errors?.[0]?.$message ?? "Campo invalido.";
    }

    function selectedInvoice(selectedDocument) {
        v$.value.$reset();

        const invoice = retentionOptions.value.find(
            item => item.documento === selectedDocument
        );

        if (!invoice) {
            swalWarning("Documento No encontrado");
            resetRetentionPayload();
            return false;
        }

        return assignInvoiceToRetention(invoice);
    }

    function assignInvoiceToRetention(invoice) {
        if (isInvoiceAlreadyAssigned(invoice.documento)) {
            resetRetentionPayload();
            swalWarning("Esta factura ya tiene una retencion ingresada");
            return false;
        }

        const retentionDate = calculateAllowedRetentionDate(invoice.fechaEmision);
        if (!retentionDate) {
            resetRetentionPayload();
            swalWarning("No puede ingresar una retencion de una factura de hace mas de un mes");
            return false;
        }

        Object.assign(retentionPayload, {
            documento: invoice.documento,
            fechaEmision: invoice.fechaEmision,
            fechaVencimiento: invoice.fechaVencimiento,
            montoOriginal: toNumber(invoice.montoOriginal) ?? 0,
            subtotal: toNumber(invoice.subtotal) ?? 0,
            ivaFactura: toNumber(invoice.iva) ?? 0,
            saldoFactura: toNumber(invoice.saldoCliente) ?? 0,
        });

        flatPickrState.emision.minDate = invoice.fechaEmision;
        flatPickrState.emision.maxDate = formatDateForInput(retentionDate);
        flatPickrState.caducidad.minDate = invoice.fechaEmision;

        return true;
    }

    function isInvoiceAlreadyAssigned(doc) {
        const selectedDocument = String(doc ?? "").trim();

        return retentions.value.some(
            retention => getRetentionDocument(retention) === selectedDocument
        );
    }

    function changePorcentilIva() {
        retentionPayload.iva = calculateRetentionTaxAmount(
            retentionPayload.ivaFactura,
            retentionPayload.porcentajeIva
        );
    }

    function changePorcentilRenta() {
        retentionPayload.renta = calculateRetentionTaxAmount(
            retentionPayload.subtotal,
            retentionPayload.porcentajeRenta
        );
    }

    async function validateReceiptNumber() {
        const clientId = client.value?.id;
        const receiptNumber = String(
            retentionPayload.comprobante ?? ""
        ).trim();

        if (!clientId) {
            swalWarning("Seleccione un cliente antes de validar el comprobante");
            return false;
        }

        if (!receiptNumber) {
            swalWarning("Ingrese el numero de comprobante");
            return false;
        }

        const receiptAlreadyAdded = retentions.value.some(
            retention =>
                String(retention?.comprobante ?? "").trim() === receiptNumber
        );

        if (receiptAlreadyAdded) {
            swalWarning("El comprobante ya fue ingresado previamente");
            return false;
        }

        if (typeof validateRetentionReceiptNumber !== "function") {
            swalWarning("No se pudo validar el comprobante");
            return false;
        }

        const resp = await validateRetentionReceiptNumber(clientId, receiptNumber);
        if (!resp?.ok) {
            retentionPayload.comprobante = "";
            const message = resp?.message || "Comprobante ya registrado con anterioridad.";
            (resp?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
            return false;
        }

        return true;
    }

    async function createRetentionToAdd() {
        const result = await v$.value.$validate();
        if (!result) {
            return null;
        }

        const isReceiptValid = await validateReceiptNumber();
        if (!isReceiptValid) {
            return null;
        }

        const authorizationLength = String(retentionPayload.autorizacion ?? "").length;

        if (authorizationLength !== 10 && authorizationLength !== 49) {
            swalWarning("El numero de autorizacion debe ser de 10 caracteres en caso de ser fisica y de 49 caracteres en caso de se electronica");
            return null;
        }

        const retention = buildRetentionPayload(retentionPayload);

        v$.value.$reset();
        resetRetentionPayload();

        return retention;
    }

    return {
        flatPickrState,
        payloadRetention: retentionPayload,
        retentionOptions,
        retentions,
        totalRetention,
        v$,
        validationMessage,
        selectedInvoice,
        changePorcentilIva,
        changePorcentilRenta,
        validateReceiptNumber,
        getRetentionRows,
        createRetentionToAdd,
        resetPayloadRetention: resetRetentionPayload,
    };
}
