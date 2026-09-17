<script setup>
import { swalError, swalSuccess, swalWarning } from "@/functions/swal-alert.js";
import {
  onMounted,
  ref,
  computed,
  markRaw,
  nextTick,
  watch,
  onUnmounted,
} from "vue";
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import { roundTo, toNumber } from "@/functions";
import BaseBlock from "@/components/BaseBlock.vue";

//eventos
import { useRefreshCollectionInvoiceUpdateOnEvent } from "@/composables/cobranzas/cobros-facturas/useRefreshCollectionInvoiceUpdateOnEvent.js";

//composables
import { useInvoiceCollectionActions } from "@/composables/cobranzas/cobros-facturas/useInvoiceCollectionActions";
import { useInvoiceCollectionDraft } from "@/composables/cobranzas/cobros-facturas/useInvoiceCollectionDraft.js";
//componentes
import TarjetaEstadoCaja from "./components/TarjetaEstadoCaja.vue";
import TablaBusquedaCliente from "./components/TablaBusquedaCliente.vue";
import TarjetaInformacionCliente from "./components/TarjetaInformacionCliente.vue";
import PagoRetenciones from "./components/PagoRetenciones.vue";
import PagoEfectivo from "./components/PagoEfectivo.vue";
import PagoDepositos from "./components/PagoDepositos.vue";
import PagoCheques from "./components/PagoCheques.vue";
import PagoTarjetas from "./components/PagoTarjetas.vue";
import PagoAplicaciones from "./components/PagoAplicaciones.vue";
import ResumenCobro from "./components/ResumenCobro.vue";
import TablaCobrosRegistrados from "./components/TablaCobrosRegistrados.vue";

const {
  //obtener estado de caja
  loadingCashBoxStatus,
  getUserCashBoxStatus,
  dataCashBoxStatus,

  //aperturar caja
  loadingOpenCashBox,
  openCashBoxed,

  //carga de facturas y facturas retenciones
  clientInvoices,
  retentionInvoices,
  loadingClientInvoices,
  fetchClientInvoices,

  //carga de documentos pendiente de aplicacion
  pendingApplicationDocuments,
  loadingPendingApplicationDocuments,
  fetchPendingApplicationDocuments,
  //carga de bancos
  bankTuval,
  bankClient,
  bankCard,
  loadingCollectionBanks,
  fetchCollectionBanks,
  resetCustomerCollectionData,

  //registrar cobro
  loadingRegisterInvoiceCollection,
  registerInvoiceCollection,
} = useInvoiceCollectionActions();

const {
  //search Customers
  clients,
  errorSearchClient,
  dataSearch,
  loadingSearch,
  searchClients,

  //customer
  infoClient,
  infoSegmento,
  loadingAvailableCredit,
  fetchAvailableCreditCustomer,
} = useClientSearch();

const {
  collectionDraft,
  //funciones de limpieza
  resetDraft,
  resetDraftPreservingClient,
  //asignacion de clienteId
  setCustomer,
  //retenciones
  addRetention,
  removeRetention,
  //cheques
  addCheck,
  removeCheck,
  //depositos
  addDeposits,
  removeDeposits,
  //efectivo
  addCash,
  removeCash,
  //tarjeta
  addCard,
  removeCard,
  //aplicaciones
  addApplications,
  removeApplications,
  setCashBox,
} = useInvoiceCollectionDraft();

/** asignar el id de la caja al collection Draft */
watch(
  () => dataCashBoxStatus.value,
  (cashBox) => {
    setCashBox(cashBox);
  },
  { immediate: true }
);

/**
 * proceso de refresco de data del cliente
 *
 *  */
const loadingCustomerCollectionData = computed(
  () =>
    loadingClientInvoices.value ||
    loadingPendingApplicationDocuments.value ||
    loadingCollectionBanks.value
);
const customerCollectionDataVersion = ref(0);

async function refreshCustomerCollectionData(customer, notify = true) {
  const clientId = customer?.id;
  if (!clientId) {
    swalWarning("Debe seleccionar un cliente.");
    return false;
  }
  const responses = await Promise.all([
    fetchClientInvoices(clientId),
    fetchPendingApplicationDocuments(clientId),
    fetchCollectionBanks(),
  ]);

  const errorResponse = responses.find((response) => response?.ok === false);

  if (errorResponse) {
    const msg =
      errorResponse?.message || "No se pudo cargar la información del cliente";
    (errorResponse?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    return false;
  }
  if (notify) {
    swalSuccess("Información Actualizada Exitosamente");
  }
  customerCollectionDataVersion.value += 1;
  return true;
}

async function refreshPaymentDataBeforeApply() {
  const refreshed = await refreshCustomerCollectionData(
    selectedCustomer.value,
    false
  );

  if (refreshed) {
    await nextTick();
  }

  return refreshed;
}

function paymentCountLabel(count) {
  return count === 1 ? "1 registro" : `${count} registros`;
}

const paymentComponents = {
  retenciones: markRaw(PagoRetenciones),
  efectivo: markRaw(PagoEfectivo),
  depositos: markRaw(PagoDepositos),
  cheques: markRaw(PagoCheques),
  tarjetas: markRaw(PagoTarjetas),
  aplicaciones: markRaw(PagoAplicaciones),
};

const paymentInvoiceAmountFields = {
  retenciones: ["aplicarMontoRetencion"],
  efectivo: ["aplicarMontoEfectivo", "aplicar_monto_efectivo"],
  depositos: ["aplicarMontoDeposito", "aplicar_monto_deposito"],
  cheques: ["aplicarMontoCheque", "aplicar_monto_cheque"],
  tarjetas: ["aplicarMontoTarjeta", "aplicar_monto_tarjeta"],
  aplicaciones: ["aplicarMontoAplicacion", "aplicar_monto_aplicacion"],
};

const paymentMethodsWithInvoiceBalance = [
  "efectivo",
  "depositos",
  "cheques",
  "tarjetas",
  "aplicaciones",
];

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

function getInvoiceDocument(invoice) {
  return String(invoice?.documento ?? "").trim();
}

function getInvoiceBalance(invoice) {
  return toNumber(invoice?.saldoCliente ?? 0) ?? 0;
}

function getPaymentEntriesByMethod(methodKey) {
  if (methodKey === "efectivo") {
    return normalizePaymentEntries(collectionDraft.efectivo);
  }

  if (methodKey === "cheques") {
    return normalizePaymentEntries(collectionDraft.cheque);
  }

  if (methodKey === "tarjetas") {
    return normalizePaymentEntries(collectionDraft.tarjeta);
  }

  return normalizePaymentEntries(collectionDraft[methodKey]);
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

function getAppliedAmountForInvoice(documentNumber, excludedMethod = null) {
  if (!documentNumber) {
    return 0;
  }

  return roundTo(
    paymentMethodsWithInvoiceBalance.reduce((total, methodKey) => {
      if (methodKey === excludedMethod) {
        return total;
      }

      return (
        total +
        getPaymentEntriesByMethod(methodKey).reduce((methodTotal, payment) => {
          return (
            methodTotal +
            normalizeItems(payment?.facturas).reduce(
              (invoiceTotal, invoice) => {
                if (getInvoiceDocument(invoice) !== documentNumber) {
                  return invoiceTotal;
                }

                return (
                  invoiceTotal +
                  getPaymentInvoiceAppliedAmount(invoice, methodKey)
                );
              },
              0
            )
          );
        }, 0)
      );
    }, 0),
    2
  );
}

function getAvailableInvoicesForPaymentMethod(methodKey) {
  return normalizeItems(clientInvoices.value).map((invoice) => {
    const invoiceBalance = getInvoiceBalance(invoice);
    const appliedByOtherMethods = getAppliedAmountForInvoice(
      getInvoiceDocument(invoice),
      methodKey
    );
    const availableBalance = roundTo(
      Math.max(invoiceBalance - appliedByOtherMethods, 0),
      2
    );

    return {
      ...invoice,
      saldoCliente: availableBalance,
      saldo: availableBalance,
      saldoAplicadoOtrosMetodos: appliedByOtherMethods,
    };
  });
}

const paymentMethodSections = computed(() => {
  const sections = [
    {
      key: "retenciones",
      headingId: "payment-retentions-heading",
      collapseId: "payment-retentions-collapse",
      title: "Ingreso de Retenciones",
      subtitle: "Comprobantes de retencion",
      icon: "fa-file-invoice-dollar",
      count: collectionDraft.retenciones.length,
      component: paymentComponents.retenciones,
      props: {
        facturasRetenciones: retentionInvoices.value,
        retenciones: collectionDraft.retenciones,
        cliente: selectedCustomer.value,
        loadingDocs: loadingCustomerCollectionData.value,
      },
      events: {
        "add-retention": (retention) =>
          handlePaymentMethodAdded("retenciones", addRetention, retention),
        "remove-retention": removeRetention,
      },
    },
    {
      key: "efectivo",
      headingId: "payment-cash-heading",
      collapseId: "payment-cash-collapse",
      title: "Ingreso de Efectivo",
      subtitle: "Pago directo en caja",
      icon: "fa-money-bill-wave",
      count: collectionDraft.efectivo ? 1 : 0,
      component: paymentComponents.efectivo,
      props: {
        facturas: getAvailableInvoicesForPaymentMethod("efectivo"),
        efectivo: collectionDraft.efectivo,
        cliente: selectedCustomer.value,
        loadingDocs: loadingCustomerCollectionData.value,
        invoiceDataVersion: customerCollectionDataVersion.value,
        refreshBeforeApply: refreshPaymentDataBeforeApply,
      },
      events: {
        "add-cash": (cash) =>
          handlePaymentMethodAdded("efectivo", addCash, cash),
        "remove-cash": removeCash,
      },
    },
    {
      key: "depositos",
      headingId: "payment-deposits-heading",
      collapseId: "payment-deposits-collapse",
      title: "Ingreso de Depósitos o Transferencias",
      subtitle: "Pagos bancarios",
      icon: "fa-building-columns",
      count: collectionDraft.depositos.length,
      component: paymentComponents.depositos,
      props: {
        bancosTuval: bankTuval.value,
        facturas: getAvailableInvoicesForPaymentMethod("depositos"),
        depositos: collectionDraft.depositos,
        cliente: selectedCustomer.value,
        loadingDocs: loadingCustomerCollectionData.value,
        invoiceDataVersion: customerCollectionDataVersion.value,
        refreshBeforeApply: refreshPaymentDataBeforeApply,
      },
      events: {
        "add-deposit": (deposit) =>
          handlePaymentMethodAdded("depositos", addDeposits, deposit),
        "remove-deposit": removeDeposits,
      },
    },
    {
      key: "cheques",
      headingId: "payment-checks-heading",
      collapseId: "payment-checks-collapse",
      title: "Ingreso de Cheques",
      subtitle: "Cheques recibidos",
      icon: "fa-money-check-dollar",
      count: collectionDraft.cheque ? 1 : 0,
      component: paymentComponents.cheques,
      props: {
        facturas: getAvailableInvoicesForPaymentMethod("cheques"),
        cheque: collectionDraft.cheque,
        cliente: infoClient.value,
        bancoClientes: bankClient.value,
        loadingDocs: loadingCustomerCollectionData.value,
        invoiceDataVersion: customerCollectionDataVersion.value,
        refreshBeforeApply: refreshPaymentDataBeforeApply,
      },
      events: {
        "add-check": (check) =>
          handlePaymentMethodAdded("cheques", addCheck, check),
        "remove-check": removeCheck,
      },
    },
    {
      key: "tarjetas",
      headingId: "payment-cards-heading",
      collapseId: "payment-cards-collapse",
      title: "Tarjeta de crédito",
      subtitle: "Voucher o comprobante de tarjeta",
      icon: "fa-credit-card",
      count: collectionDraft.tarjeta ? 1 : 0,
      component: paymentComponents.tarjetas,
      props: {
        facturas: getAvailableInvoicesForPaymentMethod("tarjetas"),
        bancoTarjetas: bankCard.value,
        tarjeta: collectionDraft.tarjeta,
        cliente: selectedCustomer.value,
        loadingDocs: loadingCustomerCollectionData.value,
        invoiceDataVersion: customerCollectionDataVersion.value,
        refreshBeforeApply: refreshPaymentDataBeforeApply,
      },
      events: {
        "add-card": (card) =>
          handlePaymentMethodAdded("tarjetas", addCard, card),
        "remove-card": removeCard,
      },
    },
    {
      key: "aplicaciones",
      headingId: "payment-applications-heading",
      collapseId: "payment-applications-collapse",
      title: "Aplicar saldos",
      subtitle: "Saldos pendientes del cliente",
      icon: "fa-scale-balanced",
      count: collectionDraft.aplicaciones.length,
      component: paymentComponents.aplicaciones,
      props: {
        facturas: getAvailableInvoicesForPaymentMethod("aplicaciones"),
        cliente: selectedCustomer.value,
        aplicacionesPendientes: pendingApplicationDocuments.value,
        aplicaciones: collectionDraft.aplicaciones,
        loadingDocs: loadingCustomerCollectionData.value,
        invoiceDataVersion: customerCollectionDataVersion.value,
        refreshBeforeApply: refreshPaymentDataBeforeApply,
      },
      events: {
        "add-application": (apply) =>
          handlePaymentMethodAdded("aplicaciones", addApplications, apply),
        "remove-application": removeApplications,
      },
    },
  ];

  return sections.map((section) => ({
    ...section,
    badgeClass:
      section.count > 0
        ? "bg-success-light text-success"
        : "payment-method-badge-empty",
    badgeText:
      section.count > 0 ? paymentCountLabel(section.count) : "Sin registros",
  }));
});

const totalPaymentRecords = computed(() => {
  return paymentMethodSections.value.reduce(
    (total, section) => total + section.count,
    0
  );
});

const collectionSummaryRef = ref(null);
const registeredCollectionsRef = ref(null);
const canShowCollectionSummary = computed(
  () => collectionDraft.cliente_id && totalPaymentRecords.value > 0
);

function getDepositReceiptNumber(deposit) {
  return String(deposit?.comprobante ?? "").trim();
}

function hasRequiredDepositReceipt(deposit) {
  return getDepositReceiptNumber(deposit).length > 0;
}

function validateDepositReceiptBeforeAdding(deposit) {
  if (hasRequiredDepositReceipt(deposit)) {
    return true;
  }

  swalWarning("Ingrese el comprobante del deposito antes de agregarlo.");
  return false;
}

function validateDepositReceiptsBeforeRegisteringCollection() {
  const missingReceiptIndex = collectionDraft.depositos.findIndex(
    (deposit) => !hasRequiredDepositReceipt(deposit)
  );

  if (missingReceiptIndex === -1) {
    return true;
  }

  swalWarning(
    `El deposito #${
      missingReceiptIndex + 1
    } no tiene comprobante. Ingrese el comprobante antes de registrar el cobro.`
  );
  return false;
}

function handleSummaryPaymentRemoved({ methodKey, index }) {
  if (methodKey === "retenciones") {
    removeRetention(index);
    return;
  }

  if (methodKey === "efectivo") {
    removeCash();
    return;
  }

  if (methodKey === "depositos") {
    removeDeposits(index);
    return;
  }

  if (methodKey === "cheques") {
    removeCheck();
    return;
  }

  if (methodKey === "tarjetas") {
    removeCard();
    return;
  }

  if (methodKey === "aplicaciones") {
    removeApplications(index);
  }
}

function hidePaymentMethodCollapse(methodKey) {
  const paymentMethod = paymentMethodSections.value.find(
    (section) => section.key === methodKey
  );

  if (!paymentMethod || typeof window === "undefined") {
    return;
  }

  const Collapse = window.bootstrap?.Collapse;
  const collapseElement = document.getElementById(paymentMethod.collapseId);

  if (!Collapse || !collapseElement) {
    return;
  }

  const collapseInstance =
    typeof Collapse.getOrCreateInstance === "function"
      ? Collapse.getOrCreateInstance(collapseElement, { toggle: false })
      : new Collapse(collapseElement, { toggle: false });

  collapseInstance.hide();
}

function scrollToCollectionSummary() {
  collectionSummaryRef.value?.scrollIntoView();
}

async function handlePaymentMethodAdded(methodKey, addPayment, payload) {
  if (
    methodKey === "depositos" &&
    !validateDepositReceiptBeforeAdding(payload)
  ) {
    return;
  }

  addPayment(payload);
  await nextTick();
  hidePaymentMethodCollapse(methodKey);
  await nextTick();
  scrollToCollectionSummary();
}

async function confirmOpenCashBox() {
  const openResponse = await openCashBoxed();
  if (!openResponse?.ok) {
    const message = openResponse?.message || "No se pudo abrir la caja.";
    (openResponse?.status ?? 0) >= 500
      ? swalError(message)
      : swalWarning(message);
    return;
  }
  const statusResponse = await getUserCashBoxStatus();
  if (!statusResponse?.ok) {
    const message =
      statusResponse?.message ||
      "La caja se abrió, pero no se pudo actualizar el estado.";
    (statusResponse?.status ?? 0) >= 500
      ? swalError(message)
      : swalWarning(message);
    return;
  }
  swalSuccess(openResponse?.message || "Caja abierta correctamente.");
}

const cannotProcessCollection = computed(() => {
  const status = dataCashBoxStatus.value?.estado;

  return ["cerrado", "sin_cierre"].includes(status);
});

function clearCurrentCustomerCollection() {
  selectedCustomer.value = null;
  infoClient.value = {};
  infoSegmento.value = {};
  resetDraft();
  resetCustomerCollectionData();
}

/**
 *
 * busqueda de cliente
 *
 * */

async function updateCustomerSearchTerm(textSearch) {
  dataSearch.search = textSearch;
  const searchTextLength = textSearch?.trim().length ?? 0;
  const hasSearchText = searchTextLength > 0;
  const canShowCustomerResults = searchTextLength > 4;

  showCustomerResults.value = canShowCustomerResults;
  if (hasSearchText && (selectedCustomer.value || collectionDraft.cliente_id)) {
    clearCurrentCustomerCollection();
    showCustomerResults.value = canShowCustomerResults;
  }
}

async function searchCustomerFilters() {
  showCustomerResults.value = true;

  if (!dataSearch.search || dataSearch.search.trim().length <= 4) {
    errorSearchClient.value = true;
    showCustomerResults.value = false;
    return;
  }
  clearCurrentCustomerCollection();
  dataSearch.tipo = "proceso";
  const searchRespesponse = await searchClients();
  if (!searchRespesponse?.ok) {
    errorSearchClient.value = true;
    showCustomerResults.value = false;
    const message =
      searchRespesponse?.message ||
      "Opps! Ocurrio un error al obtener la lista de clientes.";
    (searchRespesponse?.status ?? 0) >= 500
      ? swalError(message)
      : swalWarning(message);
    return;
  }
  errorSearchClient.value = false;
}

/** variable para la visualizacion de tabla de resultados de
 *  clientes
 */
const selectedCustomer = ref(null);
const showCustomerResults = ref(true);
async function handleCustomerSelected(selection) {
  selectedCustomer.value = selection;

  showCustomerResults.value = false;
  cleanSearchClients();
  resetDraft();

  const availableResponse = await fetchAvailableCreditCustomer(
    selection.CLI_RUC
  );
  if (!availableResponse?.ok) {
    const message =
      availableResponse?.message ||
      "Opps! Ocurrio un error al obtener la lista de clientes.";
    (availableResponse?.status ?? 0) >= 500
      ? swalError(message)
      : swalWarning(message);
    return;
  }

  setCustomer(selectedCustomer.value);
  await refreshCustomerCollectionData(selectedCustomer.value, false);
}

async function cleanSearchClients() {
  dataSearch.search = "";
  clients.value = [];
}

async function registerCollection(payload = collectionDraft) {
  if (!validateDepositReceiptsBeforeRegisteringCollection()) {
    return;
  }

  const response = await registerInvoiceCollection(payload);
  if (!response?.ok) {
    const message = response?.message || "No se pudo registrar el cobro.";
    (response?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
    return;
  }

  swalSuccess(response?.message);
  await registeredCollectionsRef.value?.refresh();
  await resetDraftPreservingClient();
  await refreshCustomerCollectionData(selectedCustomer.value, false);
}

onMounted(() => {
  getUserCashBoxStatus();
});

function hasCurrentCustomerCollection() {
  return Boolean(
    selectedCustomer.value ||
      collectionDraft.cliente_id ||
      totalPaymentRecords.value > 0
  );
}

function getCollectionInvoiceEventCashBoxId(event) {
  return event?.boxId ?? null;
}

function getCurrentCashBoxId() {
  return (
    collectionDraft.caja_id ??
    null
  );
}

function isCurrentCashBoxCollectionInvoiceEvent(event) {
  const eventCashBoxId = getCollectionInvoiceEventCashBoxId(event);
  const currentCashBoxId = getCurrentCashBoxId();

  return (
    Boolean(eventCashBoxId && currentCashBoxId) &&
    String(eventCashBoxId) === String(currentCashBoxId)
  );
}

async function refreshCollectionViewForCashBoxEvent() {
  await getUserCashBoxStatus();

  if (hasCurrentCustomerCollection()) {
    clearCurrentCustomerCollection();
    await cleanSearchClients();
  }

  showCustomerResults.value = true;
}

function shouldRefreshCollectionViewForCashBoxEvent(event) {
  return isCurrentCashBoxCollectionInvoiceEvent(event);
}

const stopRefreshCollectionInvoiceUpdateOnEvent =
  useRefreshCollectionInvoiceUpdateOnEvent({
    refreshFn: refreshCollectionViewForCashBoxEvent,
    shouldRefresh: shouldRefreshCollectionViewForCashBoxEvent,
  });
onUnmounted(() => {
  stopRefreshCollectionInvoiceUpdateOnEvent?.();
});
</script>

<template>
  <!-- Hero -->
  <BasePageHeading title="Cobros facturas">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Cobros Facturas</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- contenido -->
  <div class="content-full m-2">
    <!-- cabecera de estado de caja-->
    <div v-if="loadingCashBoxStatus" class="text-center py-3">
      <div class="spinner-border text-primary spinner-border-sm">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <div class="fs-sm text-muted mt-2">Consultando estado de caja...</div>
    </div>
    <TarjetaEstadoCaja
      v-else-if="dataCashBoxStatus"
      :cash-box="dataCashBoxStatus"
      :loading="loadingOpenCashBox"
      @open-cash-box="confirmOpenCashBox"
    />

    <div v-else class="cash-box-empty-state" role="alert">
      <div class="cash-box-empty-icon">
        <i class="fa fa-triangle-exclamation"></i>
      </div>

      <div class="cash-box-empty-content">
        <div class="d-flex align-items-center flex-wrap gap-2 mb-1">
          <h2 class="cash-box-empty-title mb-0">Caja no asignada</h2>
          <span
            class="fs-xs fw-semibold bg-warning-light text-warning px-2 py-1 rounded-pill"
          >
            Acción requerida
          </span>
        </div>
        <p class="cash-box-empty-message mb-0">
          No hay una caja asociada a su usuario para el punto de venta
          seleccionado. Verifique el punto de venta o solicite la asignación
          antes de registrar cobros.
        </p>
      </div>

      <button
        type="button"
        class="btn btn-alt-warning btn-sm cash-box-empty-action"
        :disabled="loadingCashBoxStatus"
        @click="getUserCashBoxStatus()"
      >
        <i class="fa fa-rotate-right me-1"></i>
        Reintentar
      </button>
    </div>
    <!-- end cabecera de estado de caja-->

    <BaseBlock
      v-if="dataCashBoxStatus && !cannotProcessCollection"
      title="Cliente"
      class="mb-3"
      rounded
    >
      <!-- busqueda de cliente y seleccion de cliente-->
      <TablaBusquedaCliente
        :clients="clients"
        :loading="loadingSearch"
        :error-search="errorSearchClient"
        :show-results="showCustomerResults"
        @search-term-change="updateCustomerSearchTerm"
        @search-customers="searchCustomerFilters"
        @select-customer="handleCustomerSelected"
      >
      </TablaBusquedaCliente>
      <!-- end seccion clientes -->

      <!-- informacion del cliente -->
      <TarjetaInformacionCliente
        v-if="selectedCustomer"
        :loading="loadingAvailableCredit"
        :loading-info="loadingCustomerCollectionData"
        :client="infoClient"
        :segment="infoSegmento"
        class="mb-3"
        @refresh-info="refreshCustomerCollectionData"
      ></TarjetaInformacionCliente>
      <!-- end informacion del cliente -->

      <!-- inicio proceso de cobros a ejecutar -->
      <div v-if="collectionDraft.cliente_id" class="payment-methods mt-3 mb-2">
        <div class="payment-methods-header">
          <div>
            <h3 class="h6 fw-bold mb-1 text-uppercase">Metodos de cobro</h3>
            <div class="fs-sm text-muted">
              {{
                totalPaymentRecords > 0
                  ? paymentCountLabel(totalPaymentRecords)
                  : "SIN REGISTROS"
              }}
            </div>
          </div>

          <span class="badge rounded-pill bg-primary-light text-primary">
            {{ paymentMethodSections.length }} procesos
          </span>
        </div>

        <div
          class="accordion payment-accordion"
          id="invoiceCollectionPaymentMethods"
        >
          <div
            v-for="method in paymentMethodSections"
            :key="method.key"
            class="accordion-item"
          >
            <h2 class="accordion-header" :id="method.headingId">
              <button
                class="accordion-button payment-accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                :data-bs-target="`#${method.collapseId}`"
                aria-expanded="false"
                :aria-controls="method.collapseId"
              >
                <span class="payment-method-icon">
                  <i :class="['fa', method.icon]"></i>
                </span>

                <span class="payment-method-title">
                  <span
                    class="fw-semibold text-uppercase fw-bold payment-method-name"
                    >{{ method.title }}</span
                  >
                  <!-- <span class="fs-sm text-muted">{{ method.subtitle }}</span> -->
                </span>

                <span
                  class="badge rounded-pill payment-method-badge"
                  :class="method.badgeClass"
                >
                  {{ method.badgeText }}
                </span>
              </button>
            </h2>

            <div
              :id="method.collapseId"
              class="accordion-collapse collapse"
              :aria-labelledby="method.headingId"
              data-bs-parent="#invoiceCollectionPaymentMethods"
            >
              <div class="accordion-body payment-accordion-body">
                <component
                  :is="method.component"
                  v-bind="method.props"
                  v-on="method.events"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- fin proceso de cobros a ejecutar -->

      <ResumenCobro
        v-if="canShowCollectionSummary"
        :loading-register="loadingRegisterInvoiceCollection"
        ref="collectionSummaryRef"
        :collection-draft="collectionDraft"
        :banks-tuval="bankTuval"
        :bank-clients="bankClient"
        :bank-cards="bankCard"
        @remove-payment="handleSummaryPaymentRemoved"
        @register-collection="registerCollection"
      />

      <!-- lista de cobros ya registrados -->
      <TablaCobrosRegistrados
        v-if="selectedCustomer && !loadingCustomerCollectionData"
        ref="registeredCollectionsRef"
        :collection-draft="collectionDraft"
      />
    </BaseBlock>
  </div>
</template>

<style lang="css" scoped>
.min-w-0 {
  min-width: 0;
}

td input.form-control {
  min-width: 60px;
  /* Asegura que nunca sean inusables */
  width: 100%;
  /* Ocupa toda la celda */
  padding: 0.25rem;
  /* Padding pequeño */
}

@media (min-width: 992px) {
  .table.table-sm > :not(caption) > * > * {
    padding-top: 0.35rem;
    padding-bottom: 0.35rem;
  }
}

.payment-methods {
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--tuval-surface, var(--bs-body-bg));
  overflow: hidden;
}

.payment-methods-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
  background: var(--tuval-surface, var(--bs-body-bg));
}

.payment-methods-header h3 {
  font-size: 0.82rem;
}

.payment-methods-header .fs-sm {
  font-size: 0.68rem !important;
}

.payment-methods-header .badge {
  font-size: 0.64rem;
  padding: 0.25rem 0.5rem;
}

.payment-accordion {
  --bs-accordion-border-width: 0;
  --bs-accordion-border-radius: 0;
  --bs-accordion-inner-border-radius: 0;
}

.payment-accordion .accordion-item {
  border: 0;
  border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
  background: var(--tuval-surface, var(--bs-body-bg));
}

.payment-accordion .accordion-item:last-child {
  border-bottom: 0;
}

.payment-accordion-button {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.52rem 0.75rem;
  color: var(--tuval-text, var(--bs-body-color));
  background: var(--tuval-surface, var(--bs-body-bg));
  box-shadow: none;
}

.payment-accordion-button:not(.collapsed) {
  color: var(--tuval-primary, var(--bs-primary));
  background: var(--tuval-surface, var(--bs-body-bg));
  box-shadow: inset 0 -1px 0 var(--tuval-border, var(--bs-border-color));
}

.payment-accordion-button:focus {
  box-shadow: inset 0 0 0 1px rgba(var(--bs-primary-rgb), 0.25);
}

.payment-method-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 1.75rem;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: var(--tuval-radius-md, 8px);
  color: var(--tuval-primary, var(--bs-primary));
  background: rgba(var(--bs-primary-rgb), 0.08);
  font-size: 0.72rem;
}

.payment-method-title {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  line-height: 1.15;
}

.payment-method-name {
  font-size: 0.68rem;
}

.payment-method-badge {
  flex: 0 0 auto;
  margin-right: 0.45rem;
  padding: 0.24rem 0.48rem;
  font-size: 0.62rem;
}

.payment-method-badge-empty {
  color: var(--tuval-text-muted, var(--bs-secondary-color)) !important;
  background: var(--tuval-surface, var(--bs-body-bg)) !important;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
}

.payment-accordion-body {
  min-height: 3.5rem;
  padding: 0.65rem;
  background: var(--bs-body-bg);
}

.cash-box-empty-state {
  --cash-box-empty-accent: var(--bs-warning);
  --cash-box-empty-bg: var(
    --bs-warning-bg-subtle,
    rgba(var(--bs-warning-rgb), 0.1)
  );
  --cash-box-empty-border: var(
    --bs-warning-border-subtle,
    rgba(var(--bs-warning-rgb), 0.35)
  );
  --cash-box-empty-icon-bg: rgba(var(--bs-warning-rgb), 0.14);
  --cash-box-empty-text: var(
    --bs-warning-text-emphasis,
    var(--tuval-text, var(--bs-body-color))
  );

  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--cash-box-empty-border);
  border-left: 4px solid var(--cash-box-empty-accent);
  border-radius: var(--tuval-radius-md, var(--bs-border-radius));
  background: var(--cash-box-empty-bg);
  color: var(--cash-box-empty-text);
}

.cash-box-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 2.3rem;
  width: 2.3rem;
  height: 2.3rem;
  border-radius: var(--tuval-radius-md, var(--bs-border-radius));
  background: var(--cash-box-empty-icon-bg);
  color: var(--cash-box-empty-accent);
  font-size: 1rem;
}

.cash-box-empty-content {
  flex: 1 1 auto;
  min-width: 0;
}

.cash-box-empty-title {
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--cash-box-empty-text);
}

.cash-box-empty-message {
  max-width: 58rem;
  font-size: 0.78rem;
  line-height: 1.45;
}

.cash-box-empty-action {
  flex: 0 0 auto;
}

@media (max-width: 575.98px) {
  .payment-methods-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .payment-accordion-button {
    align-items: flex-start;
  }

  .payment-method-badge {
    margin-top: 0.35rem;
  }

  .cash-box-empty-state {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .cash-box-empty-action {
    width: 100%;
  }
}
</style>
