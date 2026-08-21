import { roundTo, toNumber } from "@/functions";

function normalizeRows(rows) {
    return Array.isArray(rows) ? rows : Object.values(rows ?? {});
}

function getInvoiceDocument(invoice) {
    return String(invoice?.documento ?? "").trim();
}

export function isBlankPaymentAmount(value) {
    return value === null || value === undefined || String(value).trim() === "";
}

export function rebuildInvoiceRowsPreservingSelection({
    currentRows,
    nextRows,
    amountKey,
    applyAllKey,
    observationKey,
    getInvoiceBalance,
    getAvailablePaymentAmount,
}) {
    const currentRowsByDocument = new Map();

    normalizeRows(currentRows).forEach((invoice) => {
        const documentNumber = getInvoiceDocument(invoice);

        if (documentNumber) {
            currentRowsByDocument.set(documentNumber, invoice);
        }
    });

    let appliedTotal = 0;
    const availablePaymentAmount = Math.max(
        toNumber(getAvailablePaymentAmount?.()) ?? 0,
        0
    );

    return normalizeRows(nextRows).map((invoice) => {
        const currentInvoice = currentRowsByDocument.get(
            getInvoiceDocument(invoice)
        );

        if (!currentInvoice) {
            return invoice;
        }

        const invoiceBalance = Math.max(
            toNumber(getInvoiceBalance?.(invoice)) ?? 0,
            0
        );
        const remainingPaymentAmount = roundTo(
            Math.max(availablePaymentAmount - appliedTotal, 0),
            2
        );
        const currentAmount = Math.max(toNumber(currentInvoice?.[amountKey]) ?? 0, 0);
        const appliedAmount = roundTo(
            Math.min(currentAmount, invoiceBalance, remainingPaymentAmount),
            2
        );
        const displayAmount = appliedAmount > 0 ? appliedAmount : null;

        appliedTotal = roundTo(appliedTotal + appliedAmount, 2);

        return {
            ...invoice,
            [amountKey]: displayAmount,
            [applyAllKey]: displayAmount > 0 && displayAmount >= invoiceBalance,
            [observationKey]:
                currentInvoice?.[observationKey] ??
                invoice?.[observationKey] ??
                "",
        };
    });
}
