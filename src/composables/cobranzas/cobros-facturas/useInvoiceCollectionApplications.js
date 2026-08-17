import { computed, reactive, ref } from "vue";
import useVuelidate from "@vuelidate/core";
import {
    helpers,
    maxLength,
    required,
} from "@vuelidate/validators";
import { swalWarning } from "@/functions/swal-alert";
import { formatPriceJm, roundTo, toNumber } from "@/functions";

function createEmptyApplicationPayload() {
    return {
        documento: null,
        tipo: null,
        fechaEmision: null,
        montoOriginal: 0,
        saldoCliente: 0,
        montoDisponible: 0,
        montoAplicado: 0,
        montoNoAplicado: 0,
        comentario: null,
        facturas: [],
    };
}

const requiredField = (message) => helpers.withMessage(message, required);
const applicationCommentMaxLength = helpers.withMessage(
    "El comentario no puede exceder 100 caracteres.",
    maxLength(100)
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

function getDocumentNumber(item) {
    return String(item?.documento ?? "").trim();
}

function getInvoiceAppliedAmount(invoice) {
    return toNumber(
        invoice?.aplicarMontoAplicacion ??
        invoice?.aplicar_monto_aplicacion ??
        0
    ) ?? 0;
}

function createApplicationRules() {
    return computed(() => ({
        documento: {
            required: requiredField("Seleccione el documento a aplicar."),
        },
        comentario: {
            maxLength: applicationCommentMaxLength,
        },
    }));
}

export function useInvoiceCollectionApplications({
    facturas,
    aplicacionesPendientes,
    aplicaciones,
} = {}) {
    const invoiceOptions = computed(() => normalizeCollectionItems(facturas));
    const pendingApplicationOptions = computed(() => normalizeCollectionItems(aplicacionesPendientes));
    const registeredApplications = computed(() => normalizeCollectionItems(aplicaciones));
    const applicationPayload = reactive(createEmptyApplicationPayload());
    const v$ = useVuelidate(createApplicationRules(), applicationPayload);
    const showTableInvoices = ref(false);
    const applicationInvoiceRows = ref([]);
    const applicationInvoices = computed(() => applicationInvoiceRows.value);

    function resetApplicationInvoiceState() {
        applicationInvoiceRows.value = [];
        applicationPayload.montoAplicado = 0;
        applicationPayload.montoNoAplicado = 0;
        applicationPayload.facturas = [];
        showTableInvoices.value = false;
    }

    function resetApplicationPayload() {
        Object.assign(applicationPayload, createEmptyApplicationPayload());
        resetApplicationInvoiceState();
        v$.value.$reset();
    }

    function validationMessage(field) {
        return field?.$errors?.[0]?.$message ?? "Campo invalido.";
    }

    function formatApplicationAmount(value) {
        return formatPriceJm(value) ?? "0.00";
    }

    function selectPendingApplicationDocument() {
        v$.value.$reset();

        const selectedDocument = getDocumentNumber(applicationPayload);
        resetApplicationPayload();

        if (!selectedDocument) {
            return;
        }

        applicationPayload.documento = selectedDocument;

        const pendingDocument = pendingApplicationOptions.value.find(
            (item) => getDocumentNumber(item) === selectedDocument
        );

        if (!pendingDocument) {
            swalWarning("No se encontro el documento seleccionado.");
            return;
        }

        assignPendingDocumentToPayload(pendingDocument);
    }

    function assignPendingDocumentToPayload(pendingDocument) {
        const documentNumber = getDocumentNumber(pendingDocument);
        const registeredAmount = calculateRegisteredAmountForDocument(documentNumber);
        const customerBalance = toNumber(pendingDocument?.saldoCliente) ?? 0;
        const availableAmount = roundTo(
            Math.max(customerBalance - registeredAmount, 0),
            2
        );

        Object.assign(applicationPayload, {
            documento: documentNumber,
            tipo: pendingDocument?.tipo ?? null,
            fechaEmision: pendingDocument?.fechaEmision ?? null,
            montoOriginal: roundTo(toNumber(pendingDocument?.montoOriginal) ?? 0, 2),
            saldoCliente: roundTo(customerBalance, 2),
            montoDisponible: availableAmount,
            montoAplicado: 0,
            montoNoAplicado: availableAmount,
            facturas: [],
        });
    }

    function calculateRegisteredAmountForDocument(documentNumber) {
        if (!documentNumber) {
            return 0;
        }

        return roundTo(
            registeredApplications.value.reduce((total, application) => {
                if (getDocumentNumber(application) !== documentNumber) {
                    return total;
                }

                return total + (
                    toNumber(application?.montoAplicado ?? application?.monto_aplicado) ?? 0
                );
            }, 0),
            2
        );
    }

    function getApplicationInvoiceItems(application) {
        return normalizeCollectionItems(application?.facturas);
    }

    function hasRegisteredApplicationForInvoice(application, invoiceDocument) {
        if (!invoiceDocument) {
            return false;
        }

        return getApplicationInvoiceItems(application).some(
            (invoice) => getDocumentNumber(invoice) === invoiceDocument
        );
    }

    function hasCurrentDocumentAlreadyAppliedToInvoice(invoice) {
        const documentNumber = getDocumentNumber(applicationPayload);
        const invoiceDocument = getDocumentNumber(invoice);

        if (!documentNumber || !invoiceDocument) {
            return false;
        }

        return registeredApplications.value.some((application) =>
            getDocumentNumber(application) === documentNumber &&
            hasRegisteredApplicationForInvoice(application, invoiceDocument)
        );
    }

    function calculateRegisteredApplicationAmountForInvoice(invoice) {
        const invoiceDocument = getDocumentNumber(invoice);

        if (!invoiceDocument) {
            return 0;
        }

        return roundTo(
            registeredApplications.value.reduce((applicationTotal, application) => {
                return applicationTotal + getApplicationInvoiceItems(application).reduce(
                    (invoiceTotal, appliedInvoice) => {
                        if (getDocumentNumber(appliedInvoice) !== invoiceDocument) {
                            return invoiceTotal;
                        }

                        return invoiceTotal + getInvoiceAppliedAmount(appliedInvoice);
                    },
                    0
                );
            }, 0),
            2
        );
    }

    async function applySelectedPendingDocument() {
        const result = await v$.value.$validate();
        if (!result) {
            return false;
        }

        const documentNumber = getDocumentNumber(applicationPayload);
        const availableAmount = toNumber(applicationPayload.montoDisponible) ?? 0;

        if (!documentNumber) {
            swalWarning("Seleccione un documento.");
            return false;
        }

        if (availableAmount <= 0) {
            swalWarning("El monto disponible del documento debe ser mayor a 0.");
            return false;
        }

        applicationPayload.montoDisponible = roundTo(availableAmount, 2);
        applicationPayload.montoAplicado = 0;
        applicationPayload.montoNoAplicado = roundTo(availableAmount, 2);
        applicationPayload.facturas = [];
        applicationInvoiceRows.value = buildApplicationInvoiceRows();
        showTableInvoices.value = true;

        return true;
    }

    function buildApplicationInvoiceRows() {
        return invoiceOptions.value
            .map(createApplicationInvoiceRow)
            .filter((invoice) =>
                getInvoiceApplicationBalance(invoice) > 0 &&
                !hasCurrentDocumentAlreadyAppliedToInvoice(invoice)
            );
    }

    function createApplicationInvoiceRow(invoice) {
        const availableBalance = getInvoiceAvailableBalance(invoice);

        return {
            ...invoice,
            saldoDisponibleAplicacion: availableBalance,
            aplicarTodoAplicacion: false,
            aplicarMontoAplicacion: 0,
            observacionAplicacion: "",
        };
    }

    function getInvoiceAvailableBalance(invoice) {
        const invoiceBalance = toNumber(invoice?.saldoCliente) ?? 0;
        const registeredApplicationAmount = calculateRegisteredApplicationAmountForInvoice(invoice);

        return roundTo(
            Math.max(invoiceBalance - registeredApplicationAmount, 0),
            2
        );
    }

    function getInvoiceApplicationBalance(invoice) {
        return toNumber(invoice?.saldoDisponibleAplicacion)
            ?? getInvoiceAvailableBalance(invoice);
    }

    function getInvoiceRemainingBalance(invoice) {
        const invoiceBalance = getInvoiceApplicationBalance(invoice);
        const appliedAmount = toNumber(invoice?.aplicarMontoAplicacion) ?? 0;

        return roundTo(Math.max(invoiceBalance - appliedAmount, 0), 2);
    }

    function applyFullApplicationToInvoice(invoice) {
        if (!invoice?.aplicarTodoAplicacion) {
            invoice.aplicarMontoAplicacion = 0;
            updateApplicationSummary();
            return;
        }

        const invoiceBalance = getInvoiceApplicationBalance(invoice);
        const availableAmount = getAvailableApplicationAmountForInvoice(invoice);

        if (availableAmount <= 0) {
            swalWarning("Ya no queda monto por aplicar.");
            invoice.aplicarTodoAplicacion = false;
            invoice.aplicarMontoAplicacion = 0;
            updateApplicationSummary();
            return;
        }

        invoice.aplicarMontoAplicacion = roundTo(
            Math.min(invoiceBalance, availableAmount),
            2
        );
        updateApplicationSummary();
    }

    function updateInvoiceApplicationAmount(invoice) {
        let amountToApply = toNumber(invoice?.aplicarMontoAplicacion) ?? 0;
        const invoiceBalance = getInvoiceApplicationBalance(invoice);
        const availableAmount = getAvailableApplicationAmountForInvoice(invoice);

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

        invoice.aplicarMontoAplicacion = roundTo(amountToApply, 2);
        invoice.aplicarTodoAplicacion = invoice.aplicarMontoAplicacion > 0
            && invoice.aplicarMontoAplicacion >= invoiceBalance;

        updateApplicationSummary();
    }

    function updateApplicationSummary() {
        const availableApplicationAmount = toNumber(applicationPayload.montoDisponible) ?? 0;
        const appliedAmount = calculateAppliedApplicationAmount();

        applicationPayload.montoAplicado = roundTo(appliedAmount, 2);
        applicationPayload.montoNoAplicado = roundTo(
            Math.max(availableApplicationAmount - appliedAmount, 0),
            2
        );
        syncAppliedApplicationInvoices();
    }

    function calculateAppliedApplicationAmount(excludedInvoice = null) {
        return applicationInvoiceRows.value.reduce((total, invoice) => {
            if (invoice === excludedInvoice) {
                return total;
            }

            return total + (toNumber(invoice?.aplicarMontoAplicacion) ?? 0);
        }, 0);
    }

    function syncAppliedApplicationInvoices() {
        applicationPayload.facturas = applicationInvoiceRows.value
            .filter((invoice) => (toNumber(invoice?.aplicarMontoAplicacion) ?? 0) > 0)
            .map(createApplicationInvoiceToAdd);
    }

    function getAvailableApplicationAmountForInvoice(invoice) {
        const availableApplicationAmount = toNumber(applicationPayload.montoDisponible) ?? 0;
        const appliedWithoutInvoice = calculateAppliedApplicationAmount(invoice);

        return roundTo(
            Math.max(availableApplicationAmount - appliedWithoutInvoice, 0),
            2
        );
    }

    function createApplicationInvoiceToAdd(invoice) {
        const appliedAmount = roundTo(getInvoiceAppliedAmount(invoice), 2);
        const finalBalance = roundTo(
            Math.max(getInvoiceApplicationBalance(invoice) - appliedAmount, 0),
            2
        );
        const invoiceData = { ...invoice };

        delete invoiceData.aplicarTodoAplicacion;
        delete invoiceData.saldoDisponibleAplicacion;

        return {
            ...invoiceData,
            saldoFinal: finalBalance,
            aplicarMontoAplicacion: appliedAmount,
            observacionAplicacion: invoice?.observacionAplicacion ?? "",
        };
    }

    function validateAppliedApplicationInvoicesAvailability() {
        const overAppliedInvoice = applicationPayload.facturas.find((invoice) => {
            const appliedAmount = roundTo(getInvoiceAppliedAmount(invoice), 2);
            const invoiceBalance = getInvoiceApplicationBalance(invoice);

            return appliedAmount > invoiceBalance;
        });

        if (!overAppliedInvoice) {
            return true;
        }

        swalWarning(
            `El monto aplicado a la factura ${getDocumentNumber(overAppliedInvoice)} excede su saldo disponible.`
        );
        return false;
    }

    function validateCurrentDocumentInvoiceDuplicates() {
        const duplicatedInvoice = applicationPayload.facturas.find(
            hasCurrentDocumentAlreadyAppliedToInvoice
        );

        if (!duplicatedInvoice) {
            return true;
        }

        swalWarning(
            `El documento ${getDocumentNumber(applicationPayload)} ya fue aplicado a la factura ${getDocumentNumber(duplicatedInvoice)}.`
        );
        return false;
    }

    function createApplicationToAdd() {
        if (!showTableInvoices.value) {
            swalWarning("Aplique el saldo antes de registrarlo.");
            return null;
        }

        updateApplicationSummary();

        if (applicationPayload.facturas.length === 0) {
            swalWarning("Ingrese un monto a aplicar en al menos una factura.");
            return null;
        }

        if (!validateCurrentDocumentInvoiceDuplicates()) {
            return null;
        }

        if (!validateAppliedApplicationInvoicesAvailability()) {
            return null;
        }

        return {
            documento: getDocumentNumber(applicationPayload),
            tipo: applicationPayload.tipo,
            fechaEmision: applicationPayload.fechaEmision,
            montoOriginal: roundTo(toNumber(applicationPayload.montoOriginal) ?? 0, 2),
            saldoCliente: roundTo(toNumber(applicationPayload.saldoCliente) ?? 0, 2),
            montoDisponible: roundTo(toNumber(applicationPayload.montoDisponible) ?? 0, 2),
            montoAplicado: roundTo(toNumber(applicationPayload.montoAplicado) ?? 0, 2),
            montoNoAplicado: roundTo(toNumber(applicationPayload.montoNoAplicado) ?? 0, 2),
            comentario: String(applicationPayload.comentario ?? "").trim(),
            facturas: applicationPayload.facturas.map((invoice) => ({ ...invoice })),
        };
    }

    return {
        invoiceOptions,
        pendingApplicationOptions,
        registeredApplications,
        applicationPayload,
        applicationInvoices,
        v$,
        showTableInvoices,
        validationMessage,
        formatApplicationAmount,
        selectPendingApplicationDocument,
        applySelectedPendingDocument,
        resetApplicationPayload,
        resetApplicationInvoiceState,
        updateInvoiceApplicationAmount,
        applyFullApplicationToInvoice,
        getInvoiceRemainingBalance,
        createApplicationToAdd,
    };
}
