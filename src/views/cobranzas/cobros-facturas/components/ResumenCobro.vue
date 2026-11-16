<script setup>
import { computed, ref } from "vue";
import { formatPriceJm, roundTo, toNumber } from "@/functions";
import { swalError, swalWarning } from "@/functions/swal-alert.js";
import { useBootstrapModal } from "@/composables/core/useBootstrapModal";
import { useCustomerPaymentApply } from "@/composables/cobranzas/cobros/useCustomerPaymentApply";
import verModalValidacionAplicacionPagos from "../modals/verModalValidacionAplicacionPagos.vue";

const props = defineProps({
  loadingRegister: {
    type: Boolean,
    default: false,
  },
  collectionDraft: {
    type: Object,
    required: true,
  },
  banksTuval: {
    type: Array,
    default: () => [],
  },
  bankClients: {
    type: Array,
    default: () => [],
  },
  bankCards: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update-draft", "remove-payment", "register-collection"]);

const summaryRoot = ref(null);
const modalValidationPaymentRef = ref(null);
const modalValidationPayment = useBootstrapModal(modalValidationPaymentRef);

const { loadingPayment, fecthDataValidate } = useCustomerPaymentApply();

const depositTypeLabels = {
  DP: "Deposito Bancario",
  DA: "Deposito Anterior",
  TR: "Transferencia Bancaria",
};

const paymentInvoiceAmountFields = {
  retenciones: ["aplicarMontoRetencion"],
  efectivo: ["aplicarMontoEfectivo", "aplicar_monto_efectivo"],
  depositos: ["aplicarMontoDeposito", "aplicar_monto_deposito"],
  cheques: ["aplicarMontoCheque", "aplicar_monto_cheque"],
  tarjetas: ["aplicarMontoTarjeta", "aplicar_monto_tarjeta"],
  aplicaciones: ["aplicarMontoAplicacion", "aplicar_monto_aplicacion"],
};

const collectionSummarySections = computed(() => {
  const draft = props.collectionDraft ?? {};
  const sections = [
    {
      key: "retenciones",
      title: "Retenciones",
      icon: "fa-file-invoice-dollar",
      entries: normalizeItems(draft.retenciones).map((payment, index) =>
        createPaymentSummaryEntry("retenciones", payment, index)
      ),
    },
    {
      key: "efectivo",
      title: "Efectivo",
      icon: "fa-money-bill-wave",
      entries: normalizePaymentEntries(draft.efectivo).map((payment, index) =>
        createPaymentSummaryEntry("efectivo", payment, index)
      ),
    },
    {
      key: "depositos",
      title: "Depositos / transferencias",
      icon: "fa-building-columns",
      entries: normalizeItems(draft.depositos).map((payment, index) =>
        createPaymentSummaryEntry("depositos", payment, index)
      ),
    },
    {
      key: "cheques",
      title: "Cheques",
      icon: "fa-money-check-dollar",
      entries: normalizePaymentEntries(draft.cheque).map((payment, index) =>
        createPaymentSummaryEntry("cheques", payment, index)
      ),
    },
    {
      key: "tarjetas",
      title: "Tarjetas de credito",
      icon: "fa-credit-card",
      entries: normalizePaymentEntries(draft.tarjeta).map((payment, index) =>
        createPaymentSummaryEntry("tarjetas", payment, index)
      ),
    },
    {
      key: "aplicaciones",
      title: "Aplicacion de saldos",
      icon: "fa-scale-balanced",
      entries: normalizeItems(draft.aplicaciones).map((payment, index) =>
        createPaymentSummaryEntry("aplicaciones", payment, index)
      ),
    },
  ];

  return sections
    .filter((section) => section.entries.length > 0)
    .map((section) => ({
      ...section,
      count: section.entries.length,
      totalApplied: roundTo(
        section.entries.reduce((total, entry) => total + entry.appliedTotal, 0),
        2
      ),
    }));
});

const collectionSummaryTotals = computed(() => ({
  methods: collectionSummarySections.value.length,
  records: collectionSummarySections.value.reduce(
    (total, section) => total + section.count,
    0
  ),
  applied: roundTo(
    collectionSummarySections.value.reduce(
      (total, section) => total + section.totalApplied,
      0
    ),
    2
  ),
}));

const validationItems = computed(() =>
  collectValidationItems(props.collectionDraft)
);

const collectionRegisterTotal = computed(() =>
  roundTo(getCollectionRegisterTotal(props.collectionDraft), 2)
);

const loadingVerifyAndRegister = computed(
  () => loadingPayment.value || props.loadingRegister
);

const canRegisterCollection = computed(
  () => collectionRegisterTotal.value > 0 && !loadingVerifyAndRegister.value
);

const collectionReference = computed({
  get: () => props.collectionDraft?.referencia ?? "",
  set: (value) => {
    if (props.collectionDraft) {
      emit("update-draft", { referencia: value ?? "" });
    }
  },
});

const registerButtonText = computed(() =>
  loadingPayment.value
    ? "Validando..."
    : props.loadingRegister
    ? "Registrando..."
    : "Registrar Cobro"
);

function scrollIntoView() {
  summaryRoot.value?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

defineExpose({
  scrollIntoView,
});

function paymentCountLabel(count) {
  return count === 1 ? "1 registro" : `${count} registros`;
}

function normalizeItems(source) {
  if (Array.isArray(source)) {
    return source;
  }

  return Object.values(source ?? {});
}

function normalizePaymentEntries(source) {
  if (Array.isArray(source)) {
    return source;
  }

  if (source && typeof source === "object" && Object.keys(source).length > 0) {
    return [source];
  }

  return [];
}

function cloneForValidation(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function buildPaymentValidationPayload() {
  const draft = props.collectionDraft ?? {};

  return {
    cliente_id: draft.cliente_id ?? null,
    caja_id: draft.caja_id ?? null,
    pv_id: draft.pv_id ?? null,
    pvCodigo: draft.pvCodigo ?? null,
    referencia: String(draft.referencia ?? "").trim(),
    retenciones: normalizeItems(draft.retenciones).map(cloneForValidation),
    efectivo: draft.efectivo ? cloneForValidation(draft.efectivo) : null,
    tarjeta: draft.tarjeta ? cloneForValidation(draft.tarjeta) : null,
    cheque: draft.cheque ? cloneForValidation(draft.cheque) : null,
    depositos: normalizeItems(draft.depositos).map(cloneForValidation),
    aplicaciones: normalizeItems(draft.aplicaciones).map(cloneForValidation),
  };
}

function resolveValidationData(responseData, fallbackPayload) {
  if (responseData && typeof responseData === "object") {
    return responseData;
  }

  return fallbackPayload;
}

function mergeValidationResponseIntoDraft(validationData) {
  if (!validationData || typeof validationData !== "object") {
    return;
  }

  emit("update-draft", { hasGlobalExcess: Boolean(
    validationData.hasGlobalExcess
  ) });

  mergeRowsByIndex(
    props.collectionDraft.retenciones,
    normalizeItems(validationData.retenciones)
  );
  mergePaymentByInvoices(
    props.collectionDraft.efectivo,
    validationData.efectivo ?? validationData.ingreso_efectivo
  );
  mergePaymentByInvoices(
    props.collectionDraft.tarjeta,
    validationData.tarjeta ?? validationData.ingreso_tarjeta
  );
  mergePaymentByInvoices(
    props.collectionDraft.cheque,
    validationData.cheque ?? validationData.ingreso_cheques
  );
  mergePaymentsByIndex(
    props.collectionDraft.depositos,
    normalizeItems(validationData.depositos ?? validationData.ingreso_depositos)
  );
  mergePaymentsByIndex(
    props.collectionDraft.aplicaciones,
    normalizeItems(
      validationData.aplicaciones ?? validationData.ingreso_aplicaciones
    )
  );
}

function mergeRowsByIndex(targetRows, sourceRows) {
  if (!Array.isArray(targetRows) || !Array.isArray(sourceRows)) {
    return;
  }

  sourceRows.forEach((sourceRow, index) => {
    if (targetRows[index] && sourceRow && typeof sourceRow === "object") {
      copyValidationFields(targetRows[index], sourceRow);
    }
  });
}

function copyValidationFields(target, source) {
  [
    "hasExcess",
    "hasDoubleApply",
    "saldoFactura",
    "saldoBase",
    "saldoDisponible",
    "totalApply",
    "excessValue",
    "priceRecommend",
    "validationType",
    "validationMessage",
    "doubleApplyDoc",
    "devoluciones_info",
    "saldoFinal",
  ].forEach((field) => {
    if (source?.[field] !== undefined) {
      target[field] = source[field];
    }
  });
}

function mergePaymentByInvoices(targetPayment, sourcePayment) {
  if (!targetPayment || !sourcePayment || typeof sourcePayment !== "object") {
    return;
  }

  Object.assign(targetPayment, {
    hasGlobalExcess: sourcePayment.hasGlobalExcess,
  });
  mergeRowsByIndex(
    targetPayment.facturas,
    normalizeItems(sourcePayment.facturas)
  );
}

function mergePaymentsByIndex(targetPayments, sourcePayments) {
  if (!Array.isArray(targetPayments) || !Array.isArray(sourcePayments)) {
    return;
  }

  sourcePayments.forEach((sourcePayment, paymentIndex) => {
    const targetPayment = targetPayments[paymentIndex];

    if (!targetPayment || !sourcePayment || typeof sourcePayment !== "object") {
      return;
    }

    Object.assign(targetPayment, {
      hasGlobalExcess: sourcePayment.hasGlobalExcess,
    });
    mergeRowsByIndex(
      targetPayment.facturas,
      normalizeItems(sourcePayment.facturas)
    );
  });
}

function hasCollectionPaymentRecords(data) {
  return getCollectionRegisterTotal(data) > 0;
}

function hasAppliedInvoiceApplications(data) {
  return (
    normalizeItems(data?.retenciones).some(
      (row) => getRetentionRegisterAmount(row) > 0
    ) ||
    normalizePaymentEntries(data?.efectivo).some((payment) =>
      hasAppliedPaymentInvoices(payment, "efectivo")
    ) ||
    normalizePaymentEntries(data?.tarjeta).some((payment) =>
      hasAppliedPaymentInvoices(payment, "tarjetas")
    ) ||
    normalizePaymentEntries(data?.cheque).some((payment) =>
      hasAppliedPaymentInvoices(payment, "cheques")
    ) ||
    normalizeItems(data?.depositos).some((payment) =>
      hasAppliedPaymentInvoices(payment, "depositos")
    ) ||
    normalizeItems(data?.aplicaciones).some((payment) =>
      hasAppliedPaymentInvoices(payment, "aplicaciones")
    )
  );
}

function hasAppliedPaymentInvoices(payment, methodKey) {
  return normalizeItems(payment?.facturas).some((invoice) => {
    return getPaymentInvoiceAppliedAmount(invoice, methodKey) > 0;
  });
}

function getCollectionRegisterTotal(data) {
  const draft = data ?? {};

  return roundTo(
    sumPaymentAmounts(draft.retenciones, getRetentionRegisterAmount) +
      sumPaymentAmounts(
        normalizePaymentEntries(draft.efectivo),
        getCashRegisterAmount
      ) +
      sumPaymentAmounts(
        normalizePaymentEntries(draft.tarjeta),
        getReceivedRegisterAmount
      ) +
      sumPaymentAmounts(
        normalizePaymentEntries(draft.cheque),
        getReceivedRegisterAmount
      ) +
      sumPaymentAmounts(draft.depositos, getReceivedRegisterAmount) +
      sumPaymentAmounts(draft.aplicaciones, getAppliedRegisterAmount),
    2
  );
}

function sumPaymentAmounts(payments, amountResolver) {
  return normalizeItems(payments).reduce((total, payment) => {
    return total + amountResolver(payment);
  }, 0);
}

function getRetentionRegisterAmount(payment) {
  return toPaymentNumber(payment?.total);
}

function getCashRegisterAmount(payment) {
  return toPaymentNumber(payment?.montoACobrar ?? payment?.montoAplicado);
}

function getReceivedRegisterAmount(payment) {
  return toPaymentNumber(payment?.montoRecibido ?? payment?.montoAplicado);
}

function getAppliedRegisterAmount(payment) {
  return toPaymentNumber(payment?.montoAplicado ?? payment?.monto_aplicado);
}

function formatMoney(value) {
  return formatPriceJm(value) ?? "0.00";
}

function createDetail(label, value, type = "text") {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return {
    label,
    value: type === "money" ? `$${formatMoney(value)}` : value,
  };
}

function createPositiveMoneyDetail(label, value) {
  const amount = toNumber(value) ?? 0;

  return amount > 0 ? createDetail(label, amount, "money") : null;
}

function compactDetails(details) {
  return details.filter(Boolean);
}

function getBankOptionId(bank) {
  return bank?.id ?? bank?.CB_ID ?? bank?.banco_id ?? bank?.value ?? "";
}

function getBankOptionName(bank) {
  return bank?.CB_DESCRIPCION ?? bank?.nombre ?? bank?.label ?? "Sin banco";
}

function getBankSummaryName(bankId, banks, fallback = "Sin banco") {
  const selectedBank = normalizeItems(banks).find(
    (bank) => String(getBankOptionId(bank)) === String(bankId ?? "")
  );

  return selectedBank ? getBankOptionName(selectedBank) : fallback;
}

function getDepositTypeLabel(value) {
  return depositTypeLabels[value] ?? value ?? "Sin tipo";
}

function getPaymentAppliedTotal(payment, methodKey) {
  if (methodKey === "retenciones") {
    return roundTo(toNumber(payment?.total) ?? 0, 2);
  }

  return roundTo(
    toNumber(payment?.montoAplicado ?? payment?.monto_aplicado) ?? 0,
    2
  );
}

function getPaymentEntryTitle(methodKey, payment, index) {
  const fallback = `Registro ${index + 1}`;

  if (methodKey === "retenciones") {
    return `Retencion ${payment?.comprobante || fallback}`;
  }

  if (methodKey === "efectivo") {
    return "Pago en efectivo";
  }

  if (methodKey === "depositos") {
    return `${getDepositTypeLabel(payment?.tipo)} ${
      payment?.comprobante || ""
    }`.trim();
  }

  if (methodKey === "cheques") {
    return `Cheque ${payment?.cheque || fallback}`;
  }

  if (methodKey === "tarjetas") {
    return `Tarjeta ${payment?.comprobante || fallback}`;
  }

  if (methodKey === "aplicaciones") {
    return `Saldo ${payment?.documento || fallback}`;
  }

  return fallback;
}

function getPaymentEntrySubtitle(methodKey, payment) {
  if (methodKey === "retenciones") {
    return `Factura ${payment?.documento ?? "-"}`;
  }

  const invoiceCount = normalizeItems(payment?.facturas).length;

  return invoiceCount === 1
    ? "1 factura aplicada"
    : `${invoiceCount} facturas aplicadas`;
}

function createPaymentSummaryEntry(methodKey, payment, index) {
  const invoices =
    methodKey === "retenciones"
      ? buildRetentionSummaryInvoices(payment)
      : buildPaymentSummaryInvoices(payment, methodKey);
  const appliedTotal = getPaymentAppliedTotal(payment, methodKey);

  return {
    key: `${methodKey}-${index}-${getPaymentEntryTitle(
      methodKey,
      payment,
      index
    )}`,
    index,
    title: getPaymentEntryTitle(methodKey, payment, index),
    subtitle: getPaymentEntrySubtitle(methodKey, payment),
    appliedTotal,
    details: getPaymentSummaryDetails(methodKey, payment),
    invoices,
  };
}

function collectValidationItems(data) {
  const items = [];

  const addItem = ({
    source,
    label,
    row,
    field,
    parent = null,
    paymentIndex = null,
    invoiceIndex = null,
  }) => {
    const hasExcess = Boolean(row?.hasExcess);
    const hasDoubleApply = Boolean(row?.hasDoubleApply);

    if (!hasExcess && !hasDoubleApply) {
      return;
    }

    items.push({
      source,
      label,
      row,
      parent,
      field,
      paymentIndex,
      invoiceIndex,
      invoice: getInvoiceDocument(row) || row?.documento || "-",
      enteredAmount: toNumber(row?.[field]) ?? 0,
      saldoFactura: toNumber(row?.saldoFactura) ?? 0,
      saldoBase: toNumber(row?.saldoBase ?? row?.saldoCliente) ?? 0,
      saldoDisponible:
        toNumber(
          row?.saldoDisponible ?? row?.saldoFinal ?? row?.saldoCliente
        ) ?? 0,
      totalApply: toNumber(row?.totalApply) ?? 0,
      excessValue: toNumber(row?.excessValue) ?? 0,
      priceRecommend: toNumber(row?.priceRecommend) ?? 0,
      hasExcess,
      hasDoubleApply,
      validationType: resolveValidationType(row),
      validationLabel: resolveValidationLabel(row),
      validationMessage: row?.validationMessage ?? null,
      doubleApplyDoc: row?.doubleApplyDoc ?? null,
    });
  };

  normalizeItems(data?.retenciones).forEach((row, index) => {
    addItem({
      source: "retenciones",
      label: "Retencion",
      row,
      field: "total",
      paymentIndex: index,
    });
  });

  normalizeItems(data?.efectivo?.facturas).forEach((row, invoiceIndex) => {
    addItem({
      source: "efectivo",
      label: "Efectivo",
      row,
      parent: data?.efectivo,
      field: getPaymentInvoiceAppliedField(row, "efectivo"),
      invoiceIndex,
    });
  });

  normalizeItems(data?.tarjeta?.facturas).forEach((row, invoiceIndex) => {
    addItem({
      source: "tarjetas",
      label: "Tarjeta",
      row,
      parent: data?.tarjeta,
      field: getPaymentInvoiceAppliedField(row, "tarjetas"),
      invoiceIndex,
    });
  });

  normalizeItems(data?.cheque?.facturas).forEach((row, invoiceIndex) => {
    addItem({
      source: "cheques",
      label: "Cheque",
      row,
      parent: data?.cheque,
      field: getPaymentInvoiceAppliedField(row, "cheques"),
      invoiceIndex,
    });
  });

  normalizeItems(data?.depositos).forEach((deposit, paymentIndex) => {
    normalizeItems(deposit?.facturas).forEach((row, invoiceIndex) => {
      addItem({
        source: "depositos",
        label: `${getDepositTypeLabel(deposit?.tipo)} - ${
          deposit?.comprobante ?? ""
        }`.trim(),
        row,
        parent: deposit,
        field: getPaymentInvoiceAppliedField(row, "depositos"),
        paymentIndex,
        invoiceIndex,
      });
    });
  });

  normalizeItems(data?.aplicaciones).forEach((application, paymentIndex) => {
    normalizeItems(application?.facturas).forEach((row, invoiceIndex) => {
      addItem({
        source: "aplicaciones",
        label: `Aplicacion - ${application?.documento ?? ""}`.trim(),
        row,
        parent: application,
        field: getPaymentInvoiceAppliedField(row, "aplicaciones"),
        paymentIndex,
        invoiceIndex,
      });
    });
  });

  return items;
}

function resolveValidationType(row) {
  if (row?.hasDoubleApply) {
    return "double_apply";
  }

  if (row?.hasExcess) {
    return "excess";
  }

  return row?.validationType ?? null;
}

function resolveValidationLabel(row) {
  if (row?.hasDoubleApply) {
    return "Doble aplicacion";
  }

  if (row?.hasExcess) {
    return "Excedente";
  }

  return "Validacion";
}

function getPaymentSummaryDetails(methodKey, payment) {
  if (methodKey === "retenciones") {
    return compactDetails([
      createDetail("Comprobante", payment?.comprobante),
      createDetail("Autorizacion", payment?.autorizacion),
      createDetail("Emision retencion", payment?.retEmision),
      createDetail("Caducidad", payment?.retCaducidad),
      createPositiveMoneyDetail("Ret. IVA", payment?.iva),
      createPositiveMoneyDetail("Ret. Renta", payment?.renta),
      createPositiveMoneyDetail("Ret. IVA SRV", payment?.ivaSrv),
      createPositiveMoneyDetail("Ret. Renta SRV", payment?.rentaSrv),
      createDetail("Total retenido", payment?.total, "money"),
    ]);
  }

  if (methodKey === "efectivo") {
    return compactDetails([
      createDetail("Fecha", payment?.fechaEfectivo),
      createDetail("Recibido", payment?.montoRecibido, "money"),
      createDetail("A cobrar", payment?.montoACobrar, "money"),
      createDetail("Devuelto", payment?.montoDevuelto, "money"),
      createDetail("Aplicado", payment?.montoAplicado, "money"),
      createDetail("No aplicado", payment?.montoNoAplicado, "money"),
    ]);
  }

  if (methodKey === "depositos") {
    return compactDetails([
      createDetail("Tipo", getDepositTypeLabel(payment?.tipo)),
      createDetail(
        "Banco",
        getBankSummaryName(payment?.banco_id, props.banksTuval)
      ),
      createDetail("Comprobante", payment?.comprobante),
      createDetail("Fecha", payment?.fechaDeposito),
      createDetail("Recibido", payment?.montoRecibido, "money"),
      createDetail("Aplicado", payment?.montoAplicado, "money"),
      createDetail("No aplicado", payment?.montoNoAplicado, "money"),
    ]);
  }

  if (methodKey === "cheques") {
    return compactDetails([
      createDetail(
        "Banco",
        getBankSummaryName(payment?.banco_id, props.bankClients)
      ),
      createDetail("Cuenta", payment?.cuenta),
      createDetail("Cheque", payment?.cheque),
      createDetail("Emision", payment?.fechaEmision),
      createDetail("Vencimiento", payment?.fechaVencimiento),
      createDetail("Recibido", payment?.montoRecibido, "money"),
      createDetail("Aplicado", payment?.montoAplicado, "money"),
      createDetail("No aplicado", payment?.montoNoAplicado, "money"),
      createDetail("Comentario", payment?.comentario),
    ]);
  }

  if (methodKey === "tarjetas") {
    return compactDetails([
      createDetail(
        "Emisor",
        payment?.banco_nombre ||
          getBankSummaryName(payment?.banco_id, props.bankCards, "Sin emisor")
      ),
      createDetail("Aprobacion", payment?.comprobante),
      createDetail("Fecha", payment?.fechaTarjeta),
      createDetail("Lote ref", payment?.comentario),
      createDetail("Recibido", payment?.montoRecibido, "money"),
      createDetail("Aplicado", payment?.montoAplicado, "money"),
      createDetail("No aplicado", payment?.montoNoAplicado, "money"),
    ]);
  }

  if (methodKey === "aplicaciones") {
    return compactDetails([
      createDetail("Documento", payment?.documento),
      // createDetail("Tipo", payment?.tipo),
      createDetail("Fecha", payment?.fechaEmision),
      createDetail("Monto original", payment?.montoOriginal, "money"),
      createDetail("Saldo", payment?.saldoCliente, "money"),
      createDetail("Disponible", payment?.montoDisponible, "money"),
      createDetail("Aplicado", payment?.montoAplicado, "money"),
      createDetail("No aplicado", payment?.montoNoAplicado, "money"),
      createDetail("Comentario", payment?.comentario),
    ]);
  }

  return [];
}

function getInvoiceDocument(invoice) {
  return String(invoice?.documento ?? "").trim();
}

function getInvoiceBalance(invoice) {
  return toNumber(invoice?.saldoCliente ?? 0) ?? 0;
}

function getInvoiceIssueDate(invoice) {
  return invoice?.fechaEmision ?? "-";
}

function getInvoiceDueDate(invoice) {
  return invoice?.fechaVencimiento ?? "-";
}

function getInvoiceOriginalAmount(invoice) {
  return toNumber(invoice?.montoOriginal) ?? 0;
}

function getPaymentInvoiceAppliedField(invoice, methodKey) {
  const fields = paymentInvoiceAmountFields[methodKey] ?? [];

  return fields.find((field) => invoice?.[field] !== undefined) ?? fields[0];
}

function getPaymentInvoiceAppliedAmount(invoice, methodKey) {
  const fields = paymentInvoiceAmountFields[methodKey] ?? [];

  for (const field of fields) {
    const amount = toNumber(invoice?.[field]);

    if (amount !== null && amount !== undefined) {
      return amount;
    }
  }

  return 0;
}

function getPaymentInvoiceObservation(invoice, methodKey) {
  const fields =
    {
      retenciones: ["observacionRetencion"],
      efectivo: ["observacionEfectivo", "observacion_efectivo"],
      depositos: ["observacionDeposito", "observacion_deposito"],
      cheques: ["observacionCheque", "observacion_cheque"],
      tarjetas: ["observacionTarjeta", "observacion_tarjeta"],
      aplicaciones: ["observacionAplicacion", "observacion_aplicacion"],
    }[methodKey] ?? [];

  for (const field of fields) {
    const value = invoice?.[field];

    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }

  return "";
}

function getInvoiceFinalBalance(invoice, methodKey) {
  const explicitBalance = toNumber(invoice?.saldoFinal ?? invoice?.saldo_final);

  if (explicitBalance !== null && explicitBalance !== undefined) {
    return roundTo(explicitBalance, 2);
  }

  const appliedAmount = getPaymentInvoiceAppliedAmount(invoice, methodKey);

  return roundTo(Math.max(getInvoiceBalance(invoice) - appliedAmount, 0), 2);
}

function buildPaymentSummaryInvoices(payment, methodKey) {
  return normalizeItems(payment?.facturas).map((invoice, index) => {
    const appliedAmount = getPaymentInvoiceAppliedAmount(invoice, methodKey);

    return {
      key: `${getInvoiceDocument(invoice)}-${index}`,
      documento: getInvoiceDocument(invoice) || "-",
      fechaEmision: getInvoiceIssueDate(invoice),
      fechaVencimiento: getInvoiceDueDate(invoice),
      montoOriginal: getInvoiceOriginalAmount(invoice),
      saldoBase: getInvoiceBalance(invoice),
      montoAplicado: appliedAmount,
      saldoFinal: getInvoiceFinalBalance(invoice, methodKey),
      observacion: getPaymentInvoiceObservation(invoice, methodKey),
    };
  });
}

function buildRetentionSummaryInvoices(retention) {
  const appliedAmount = toNumber(retention?.total) ?? 0;
  const invoiceBalance = toNumber(retention?.saldoFactura) ?? 0;

  return [
    {
      key: `${retention?.documento ?? "retencion"}-${
        retention?.comprobante ?? ""
      }`,
      documento: retention?.documento ?? "-",
      fechaEmision: retention?.fechaEmision ?? "-",
      fechaVencimiento: retention?.fechaVencimiento ?? "-",
      montoOriginal: toNumber(retention?.montoOriginal) ?? 0,
      saldoBase: invoiceBalance,
      montoAplicado: appliedAmount,
      saldoFinal: roundTo(Math.max(invoiceBalance - appliedAmount, 0), 2),
      observacion: "Retencion",
    },
  ];
}

function removePayment(methodKey, index) {
  emit("remove-payment", { methodKey, index });
}

async function validatePaymentApplicationsBeforeRegister() {
  if (loadingVerifyAndRegister.value) {
    return;
  }

  if (!hasCollectionPaymentRecords(props.collectionDraft)) {
    swalWarning("No existen valores de cobro para registrar.");
    return;
  }

  const validationPayload = buildPaymentValidationPayload();

  if (!hasAppliedInvoiceApplications(validationPayload)) {
    emit("register-collection", validationPayload);
    return;
  }

  const response = await fecthDataValidate(validationPayload);

  if (!response?.ok) {
    const message = response?.message || "No se pudo validar el cobro.";
    (response?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
    return;
  }

  const validationData = resolveValidationData(
    response.data,
    validationPayload
  );
  mergeValidationResponseIntoDraft(validationData);

  if (hasPaymentValidationIssues()) {
    modalValidationPayment.show();
    return;
  }

  emit("register-collection", buildPaymentValidationPayload());
}

function hasPaymentValidationIssues() {
  return (
    Boolean(props.collectionDraft?.hasGlobalExcess) ||
    validationItems.value.length > 0
  );
}

async function applyRecommendationsAndRequestRegister() {
  if (loadingVerifyAndRegister.value) {
    return;
  }

  applyRecommendedAmounts();
  modalValidationPayment.hide();
  emit("register-collection", buildPaymentValidationPayload());
}

function applyRecommendedAmounts() {
  [...validationItems.value].forEach((item) => {
    const recommended = roundMoney(item.priceRecommend);

    if (recommended <= 0) {
      removePaymentApplicationRow(item);
      return;
    }

    item.row[item.field] = recommended;
    updateInvoiceBalanceAfterRecommendation(item, recommended);
    clearRowValidationState(item.row);
  });

  removeZeroAmountApplications();
  removeEmptyPaymentApplications();
  recalculatePaymentHeaders();
  emit("update-draft", { hasGlobalExcess: false });
}

function removeZeroAmountApplications() {
  emit("update-draft", { retenciones: props.collectionDraft.retenciones?.filter((retention) => {
      return toPaymentNumber(retention?.total) > 0;
    }) ?? [] });

  filterInvoiceApplications(props.collectionDraft.efectivo, "efectivo");
  filterInvoiceApplications(props.collectionDraft.tarjeta, "tarjetas");
  filterInvoiceApplications(props.collectionDraft.cheque, "cheques");

  props.collectionDraft.depositos?.forEach((deposit) => {
    filterInvoiceApplications(deposit, "depositos");
  });

  props.collectionDraft.aplicaciones?.forEach((application) => {
    filterInvoiceApplications(application, "aplicaciones");
  });
}

function filterInvoiceApplications(payment, methodKey) {
  if (!payment || !Array.isArray(payment.facturas)) {
    return;
  }

  payment.facturas = payment.facturas.filter((invoice) => {
    return getPaymentInvoiceAppliedAmount(invoice, methodKey) > 0;
  });
}

function removeEmptyPaymentApplications() {
  if (props.collectionDraft.efectivo?.facturas?.length === 0) {
    emit("update-draft", { efectivo: null });
  }

  if (props.collectionDraft.tarjeta?.facturas?.length === 0) {
    emit("update-draft", { tarjeta: null });
  }

  if (props.collectionDraft.cheque?.facturas?.length === 0) {
    emit("update-draft", { cheque: null });
  }

  emit("update-draft", { depositos: props.collectionDraft.depositos?.filter((deposit) => {
      return deposit?.facturas?.length > 0;
    }) ?? [] });

  emit("update-draft", { aplicaciones: props.collectionDraft.aplicaciones?.filter((application) => {
      return application?.facturas?.length > 0;
    }) ?? [] });
}

function removePaymentApplicationRow(item) {
  if (!item) {
    return;
  }

  if (item.source === "retenciones") {
    removeRowFromArray(props.collectionDraft.retenciones, item.row);
    return;
  }

  removeRowFromArray(item.parent?.facturas, item.row);
}

function removeRowFromArray(array, row) {
  if (!Array.isArray(array)) {
    return;
  }

  const index = array.indexOf(row);

  if (index >= 0) {
    array.splice(index, 1);
  }
}

function updateInvoiceBalanceAfterRecommendation(item, recommended) {
  const saldoBase = toPaymentNumber(
    item.row?.saldoBase ??
      item.row?.saldoCliente ??
      item.row?.saldoFactura ??
      item.enteredAmount
  );

  item.row.saldoFinal = roundMoney(Math.max(saldoBase - recommended, 0));
  item.row.saldoDisponible = item.row.saldoFinal;
}

function clearRowValidationState(row) {
  if (!row) {
    return;
  }

  row.hasExcess = false;
  row.hasDoubleApply = false;
  row.excessValue = 0;
  row.validationType = null;
  row.validationMessage = null;
}

function recalculatePaymentHeaders() {
  recalculateHeaderAmount(
    props.collectionDraft.efectivo,
    "efectivo",
    "montoACobrar"
  );
  recalculateHeaderAmount(
    props.collectionDraft.tarjeta,
    "tarjetas",
    "montoRecibido"
  );
  recalculateHeaderAmount(
    props.collectionDraft.cheque,
    "cheques",
    "montoRecibido"
  );

  props.collectionDraft.depositos?.forEach((deposit) => {
    recalculateHeaderAmount(deposit, "depositos", "montoRecibido");
  });

  props.collectionDraft.aplicaciones?.forEach((application) => {
    recalculateHeaderAmount(application, "aplicaciones", "montoDisponible");
  });
}

function recalculateHeaderAmount(payment, methodKey, originalAmountKey) {
  if (!payment) {
    return;
  }

  const applied = roundMoney(
    normalizeItems(payment.facturas).reduce((total, invoice) => {
      return total + getPaymentInvoiceAppliedAmount(invoice, methodKey);
    }, 0)
  );
  const original = toPaymentNumber(
    payment?.[originalAmountKey] ??
      payment?.montoRecibido ??
      payment?.montoDisponible ??
      payment?.montoAplicado
  );

  payment.montoAplicado = applied;
  payment.montoNoAplicado = roundMoney(Math.max(original - applied, 0));
}

function toPaymentNumber(value) {
  return toNumber(value) ?? 0;
}

function roundMoney(value, decimals = 2) {
  return roundTo(toPaymentNumber(value), decimals);
}
</script>

<template>
  <div ref="summaryRoot" class="collection-summary mb-2">
    <div class="collection-summary-header">
      <div class="min-w-0">
        <span class="collection-summary-kicker">Resumen de cobro</span>
        <h3 class="collection-summary-title mb-0">
          {{ collectionSummaryTotals.records }} registro(s) en
          {{ collectionSummaryTotals.methods }} metodo(s)
        </h3>
      </div>

      <div class="collection-summary-total">
        <span>Total aplicado</span>
        <strong>${{ formatMoney(collectionSummaryTotals.applied) }}</strong>
      </div>
    </div>

    <div class="collection-summary-reference">
      <label
        class="collection-summary-reference-label"
        for="collectionSummaryReference"
      >
        Referencia
      </label>

      <div
        class="input-group input-group-sm collection-summary-reference-input"
      >
        <span class="input-group-text"><i class="fa fa-hashtag"></i></span>
        <input
          id="collectionSummaryReference"
          v-model.trim="collectionReference"
          type="text"
          class="form-control"
          maxlength="80"
          autocomplete="off"
          :disabled="loadingVerifyAndRegister"
        />
      </div>
    </div>

    <section
      v-for="section in collectionSummarySections"
      :key="section.key"
      class="collection-summary-section"
    >
      <header class="collection-summary-section-header">
        <div class="d-flex align-items-center gap-2 min-w-0">
          <span class="collection-summary-icon">
            <i :class="['fa', section.icon]"></i>
          </span>
          <div class="min-w-0">
            <h4 class="collection-summary-section-title mb-0">
              {{ section.title }}
            </h4>
            <span class="collection-summary-section-subtitle">
              {{ paymentCountLabel(section.count) }}
            </span>
          </div>
        </div>

        <strong class="collection-summary-section-total">
          ${{ formatMoney(section.totalApplied) }}
        </strong>
      </header>

      <article
        v-for="entry in section.entries"
        :key="entry.key"
        class="collection-summary-entry"
      >
        <div class="collection-summary-entry-header">
          <div class="min-w-0">
            <h5 class="collection-summary-entry-title mb-0">
              {{ entry.title }} 
            </h5>
            <span class="collection-summary-entry-subtitle">
              {{ entry.subtitle }}
            </span>
          </div>

          <div class="collection-summary-entry-actions">
            <strong>${{ formatMoney(entry.appliedTotal) }}</strong>
            <button
              type="button"
              class="btn btn-sm btn-alt-danger collection-summary-remove"
              title="Eliminar registro"
              @click="removePayment(section.key, entry.index)"
            >
              <i class="fa fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="collection-summary-detail-grid">
          <div
            v-for="detail in entry.details"
            :key="detail.label"
            class="collection-summary-detail"
          >
            <span>{{ detail.label }}</span>
            <strong>{{ detail.value }}</strong>
          </div>
        </div>

        <div class="collection-summary-invoices">
          <div
            v-if="entry.invoices.length"
            class="collection-summary-table-wrap"
          >
            <table
              class="table table-sm table-vcenter mb-0 collection-summary-table"
            >
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Emision</th>
                  <th>Vencimiento</th>
                  <th class="text-end">Monto original</th>
                  <th class="text-end">Saldo base</th>
                  <th class="text-end">Aplicado</th>
                  <th class="text-end">Saldo final</th>
                  <th>Comentario</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="invoice in entry.invoices" :key="invoice.key">
                  <td class="fw-semibold">{{ invoice.documento }}</td>
                  <td>{{ invoice.fechaEmision }}</td>
                  <td>{{ invoice.fechaVencimiento }}</td>
                  <td class="text-end">
                    ${{ formatMoney(invoice.montoOriginal) }}
                  </td>
                  <td class="text-end">
                    ${{ formatMoney(invoice.saldoBase) }}
                  </td>
                  <td class="text-end fw-semibold">
                    ${{ formatMoney(invoice.montoAplicado) }}
                  </td>
                  <td class="text-end">
                    ${{ formatMoney(invoice.saldoFinal) }}
                  </td>
                  <td>{{ invoice.observacion || "-" }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="collection-summary-empty-invoices">
            <i class="fa fa-file-invoice"></i>
            <span>Sin facturas aplicadas</span>
          </div>
        </div>
      </article>
    </section>

    <div class="collection-summary-submit-bar">
      <div class="collection-summary-submit-info">
        <span>Monto a registrar</span>
        <strong>${{ formatMoney(collectionRegisterTotal) }}</strong>
      </div>

      <button
        type="button"
        class="btn btn-success collection-summary-submit"
        :disabled="!canRegisterCollection"
        title="Registrar cobro"
        @click="validatePaymentApplicationsBeforeRegister"
      >
        <i
          :class="[
            'fa',
            loadingVerifyAndRegister
              ? 'fa-circle-notch fa-spin'
              : 'fa-circle-check',
          ]"
        ></i>
        <span>{{ registerButtonText }}</span>
      </button>
    </div>
  </div>

  <div
    ref="modalValidationPaymentRef"
    class="modal"
    id="modal-validacion-aplicacion-pagos"
    tabindex="-1"
    aria-labelledby="modal-validacion-aplicacion-pagos"
    aria-hidden="true"
  >
    <div
      class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable modal-validacion-pagos"
    >
      <div class="modal-content">
        <verModalValidacionAplicacionPagos
          :items="validationItems"
          :processing="loadingPayment"
          @close-modal="modalValidationPayment.hide()"
          @apply-recommendations="applyRecommendationsAndRequestRegister"
        />
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.collection-summary {
  display: grid;
  gap: 0.65rem;
  margin-top: 0.85rem;
}

.collection-summary,
.collection-summary * {
  min-width: 0;
}

.collection-summary-header,
.collection-summary-section-header,
.collection-summary-entry-header,
.collection-summary-entry-actions {
  display: flex;
  align-items: center;
}

.collection-summary-header {
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--tuval-surface-muted, var(--bs-light));
}

.collection-summary-kicker,
.collection-summary-section-subtitle,
.collection-summary-entry-subtitle {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-weight: 800;
}

.collection-summary-kicker {
  font-size: 0.64rem;
  text-transform: uppercase;
}

.collection-summary-title {
  margin-top: 0.1rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1.2;
}

.collection-summary-total {
  display: grid;
  flex: 0 0 auto;
  gap: 0.05rem;
  min-width: 8.5rem;
  text-align: right;
}

.collection-summary-total span {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.58rem;
  font-weight: 800;
  text-transform: uppercase;
}

.collection-summary-total strong {
  color: var(--bs-primary, var(--tuval-primary));
  font-size: 1rem;
  font-weight: 900;
  line-height: 1.1;
}

.collection-summary-section {
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  overflow: hidden;
  background: var(--bs-body-bg);
}

.collection-summary-section-header {
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.65rem;
  border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
  background: var(--tuval-surface-muted, var(--bs-light));
}

.collection-summary-icon {
  display: inline-flex;
  width: 1.75rem;
  height: 1.75rem;
  align-items: center;
  justify-content: center;
  flex: 0 0 1.75rem;
  border-radius: var(--tuval-radius-md, 8px);
  color: var(--tuval-primary, var(--bs-primary));
  background: rgba(var(--bs-primary-rgb), 0.08);
  font-size: 0.72rem;
}

.collection-summary-section-title {
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.82rem;
  font-weight: 900;
  line-height: 1.15;
  text-transform: uppercase;
}

.collection-summary-section-subtitle {
  margin-top: 0.08rem;
  font-size: 0.64rem;
}

.collection-summary-section-total {
  flex: 0 0 auto;
  color: var(--bs-success-text-emphasis, var(--bs-success));
  font-size: 0.86rem;
  white-space: nowrap;
}

.collection-summary-entry {
  border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
}

.collection-summary-entry:last-child {
  border-bottom: 0;
}

.collection-summary-entry-header {
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.65rem;
}

.collection-summary-entry-title {
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.70rem;
  font-weight: 850;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.collection-summary-entry-subtitle {
  margin-top: 0.08rem;
  font-size: 0.56rem;
}

.collection-summary-entry-actions {
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 0.45rem;
}

.collection-summary-entry-actions strong {
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.84rem;
  white-space: nowrap;
}

.collection-summary-remove {
  display: inline-flex;
  width: 1.85rem;
  height: 1.85rem;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 0.72rem;
}

.collection-summary-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7.75rem, 1fr));
  gap: 0.32rem;
  padding: 0 0.65rem 0.55rem;
}

.collection-summary-detail {
  padding: 0.32rem 0.4rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--tuval-surface-muted, var(--bs-light));
}

.collection-summary-detail span {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.54rem;
  font-weight: 900;
  line-height: 1.1;
  text-transform: uppercase;
}

.collection-summary-detail strong {
  display: block;
  margin-top: 0.08rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.72rem;
  font-weight: 850;
  line-height: 1.15;
  overflow-wrap: anywhere;
  text-align: right;
}

.collection-summary-invoices {
  padding: 0 0.65rem 0.65rem;
}

.collection-summary-table-wrap {
  max-width: 100%;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  overflow: auto;
}

.collection-summary-table {
  min-width: 56rem;
  table-layout: fixed;
}

.collection-summary-table th,
.collection-summary-table td {
  padding: 0.35rem 0.45rem;
  font-size: 0.72rem;
  vertical-align: middle;
}

.collection-summary-table thead th {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  background: var(--tuval-surface-muted, var(--bs-light));
  font-size: 0.6rem;
  font-weight: 900;
  text-transform: uppercase;
}

.collection-summary-empty-invoices {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.4rem;
  padding: 0.55rem 0.65rem;
  border: 1px dashed var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.74rem;
  font-weight: 800;
}

.collection-summary-reference {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--bs-body-bg);
}

.collection-summary-reference-label {
  margin: 0;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.62rem;
  font-weight: 900;
  line-height: 1.1;
  text-align: center;
  text-transform: uppercase;
}

.collection-summary-reference-input {
  min-width: 0;
  width: min(100%, 40rem);
}

.collection-summary-reference :deep(.form-control),
.collection-summary-reference :deep(.input-group-text) {
  min-height: 1.95rem;
  padding: 0.25rem 0.45rem;
  font-size: 0.78rem;
}

.collection-summary-reference :deep(.form-control) {
  text-align: center;
}

.collection-summary-submit-bar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.7rem 0.75rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--bs-body-bg);
}

.collection-summary-submit-info {
  display: grid;
  gap: 0.05rem;
  text-align: right;
}

.collection-summary-submit-info span {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.58rem;
  font-weight: 900;
  line-height: 1.1;
  text-transform: uppercase;
}

.collection-summary-submit-info strong {
  color: var(--bs-success-text-emphasis, var(--bs-success));
  font-size: 1rem;
  font-weight: 900;
  line-height: 1.1;
}

.collection-summary-submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-width: 11rem;
  min-height: 2.45rem;
  padding: 0.52rem 0.95rem;
  border-radius: var(--tuval-radius-md, 8px);
  font-size: 0.82rem;
  font-weight: 900;
  line-height: 1;
  white-space: nowrap;
}

.collection-summary-submit:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.modal-validacion-pagos {
  max-width: min(1120px, calc(100vw - 1rem));
}

@media (max-width: 575.98px) {
  .collection-summary-header,
  .collection-summary-section-header,
  .collection-summary-entry-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .collection-summary-total,
  .collection-summary-entry-actions {
    width: 100%;
  }

  .collection-summary-total {
    text-align: left;
  }

  .collection-summary-entry-actions {
    justify-content: space-between;
  }

  .collection-summary-detail-grid {
    grid-template-columns: 1fr;
  }

  .collection-summary-submit-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .collection-summary-submit-info {
    text-align: left;
  }

  .collection-summary-submit {
    width: 100%;
  }
}
</style>
