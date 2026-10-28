<template>
  <!-- Hero -->
  <BasePageHeading title="Devolución de pedidos">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Devoluciones</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">
            Devolución pedidos
          </li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <FiltrarCliente
      :clients="clients"
      :loading="loadingSearch || loadingCustomer"
      :error-search="errorSearchClient"
      :show-results="showCustomerResults"
      @search-term-change="updateCustomerSearchTerm"
      @search-customers="searchCustomerFilters"
      @select-customer="selectcliente"
    />
    <ClienteDevolucion
      v-if="currentClienteDevolucion"
      v-show="showCustomerDetails"
      :cliente="currentClienteDevolucion"
      :loading-download-excel="loadingDownloadExcel"
      :loading-download-pdf="loadingDownloadPdf"
      :refreshing="refreshingCustomer"
      @download-excel="printAccountStatementExcel"
      @download-pdf="printAccountStatementPdf"
      @refresh="actualizar"
    />
    <BaseBlock
      v-if="currentClienteDevolucion"
      v-show="showCustomerDetails"
      class="row g-0 mt-4"
    >
      <template #content>
        <div class="return-notice" role="note" aria-label="Requisito para anular facturas">
          <i class="fa fa-triangle-exclamation return-notice-icon" aria-hidden="true"></i>
          <p><strong>Importante para anular facturas</strong><span class="return-notice-separator" aria-hidden="true">·</span>Para anular una factura, primero debe estar <strong>autorizada por el SRI.</strong></p>
        </div>

        <div class="return-tabs" role="tablist" aria-label="Pedidos y devoluciones">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :id="`btabs-vertical-${tab.id}-tab`"
            type="button"
            class="return-tab"
            :class="{ 'is-active': activeTab === tab.id }"
            role="tab"
            :aria-controls="`btabs-vertical-${tab.id}`"
            :aria-selected="activeTab === tab.id"
            :tabindex="activeTab === tab.id ? 0 : -1"
            @click="activeTab = tab.id"
            @keydown="navigateTabs($event, tab.id)"
          >
            <i :class="['fa fa-fw', tab.icon]" aria-hidden="true"></i>
            <span>{{ tab.label }}</span>
            <span v-if="tab.loading" class="spinner-border spinner-border-sm" role="status">
              <span class="visually-hidden">Actualizando {{ tab.label.toLowerCase() }}...</span>
            </span>
            <span v-else class="return-tab-count">{{ tab.count }}</span>
          </button>
        </div>
        <div class="tab-content col-12">
          <div
            class="block-content"
            v-show="activeTab === 'facturas'"
            id="btabs-vertical-facturas"
            role="tabpanel"
            aria-labelledby="btabs-vertical-facturas-tab"
            :aria-busy="store.state.pedidos.loading"
            tabindex="0"
          >
            <Pedidos
              @recargarCliente="actualizar"
            ></Pedidos>
          </div>

          <div
            class="block-content"
            v-show="activeTab === 'devoluciones'"
            id="btabs-vertical-devoluciones"
            role="tabpanel"
            aria-labelledby="btabs-vertical-devoluciones-tab"
            :aria-busy="store.state.devoluciones.loading"
            tabindex="0"
          >
            <Devoluciones></Devoluciones>
          </div>
        </div>
      </template>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import { ref, computed, nextTick } from "vue";
import ClienteDevolucion from "./components/ClienteDevolucion.vue";
import FiltrarCliente from "@/components/ventas/cliente/FiltrarCliente.vue";
import { useCustomerFilterSearch } from "@/composables/venta/cliente/useCustomerFilterSearch";
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import { useStore } from "vuex";
import { swalSuccess, swalWarning, swalError } from "@/functions/swal-alert.js";
import Pedidos from "./tabs/Pedidos.vue";
import Devoluciones from "./tabs/Devoluciones.vue";
import { useInvoiceCollectionActions } from "@/composables/cobranzas/cobros-facturas/useInvoiceCollectionActions";
const {
  //download pdf
  loadingDownloadPdf,
  printPdfStatusAccountClient,

  //download excel
  loadingDownloadExcel,
  printExcelStatusAccountClient,
} = useInvoiceCollectionActions();
const store = useStore();
const {
  clients,
  loadingSearch,
  errorSearchClient,
  showCustomerResults,
  updateCustomerSearchTerm,
  searchCustomerFilters: searchClients,
  cleanSearchClients,
} = useCustomerFilterSearch();
const { infoClient, fetchAvailableCreditCustomer } = useClientSearch();

const currentClienteDevolucion = computed(
  () => store.state.currentClienteDevolucion
);
const loadingCustomer = ref(false);
const refreshingCustomer = ref(false);
const showCustomerDetails = computed(
  () =>
    currentClienteDevolucion.value &&
    verpedidos.value &&
    !loadingSearch.value &&
    !loadingCustomer.value &&
    !showCustomerResults.value
);
const verpedidos = ref(false);
const activeTab = ref("facturas");
const tabs = computed(() => [
  {
    id: "facturas",
    label: "Facturas",
    icon: "fa-file-invoice-dollar",
    count: store.state.pedidos.data.length,
    loading: store.state.pedidos.loading,
  },
  {
    id: "devoluciones",
    label: "Devoluciones",
    icon: "fa-arrow-right-arrow-left",
    count: store.state.devoluciones.data.length,
    loading: store.state.devoluciones.loading,
  },
]);

function navigateTabs(event, tabId) {
  const index = tabs.value.findIndex((tab) => tab.id === tabId);
  let nextIndex;
  switch (event.key) {
    case "ArrowRight": nextIndex = (index + 1) % tabs.value.length; break;
    case "ArrowLeft": nextIndex = (index - 1 + tabs.value.length) % tabs.value.length; break;
    case "Home": nextIndex = 0; break;
    case "End": nextIndex = tabs.value.length - 1; break;
    default: return;
  }
  event.preventDefault();
  activeTab.value = tabs.value[nextIndex].id;
  document.getElementById(`btabs-vertical-${activeTab.value}-tab`)?.focus();
}

if (!verpedidos.value && currentClienteDevolucion.value) {
  selectcliente(currentClienteDevolucion.value);
}

async function searchCustomerFilters() {
  verpedidos.value = false;
  await searchClients();
}

async function selectcliente(cliente) {
  if (loadingCustomer.value) return;
  if (!cliente?.CLI_RUC) {
    swalWarning(
      "El cliente seleccionado no tiene los datos necesarios para consultar devoluciones."
    );
    return;
  }
  verpedidos.value = false;
  loadingCustomer.value = true;
  cleanSearchClients();
  try {
    const response = await fetchAvailableCreditCustomer(cliente.CLI_RUC);
    if (!response?.ok) {
      if (response?.handled || response?.canceled) return;
      const message = response?.message || "No se pudo consultar la información del cliente.";
      (response?.status >= 500 ? swalError : swalWarning)(message);
      return;
    }
    if (!infoClient.value?.id) {
      swalWarning("La información del cliente no incluye el identificador para consultar devoluciones.");
      return;
    }
    if (currentClienteDevolucion.value?.id !== infoClient.value.id) {
      activeTab.value = "facturas";
    }
    store.commit("setCurrentclienteDevolucion", { ...infoClient.value });
    await actualizar();
  } catch (err) {
    swalError(
      err.response?.data?.error || err.message || "No se pudo consultar la información del cliente."
    );
  } finally {
    loadingCustomer.value = false;
  }
}

async function actualizar() {
  if (refreshingCustomer.value) return;
  refreshingCustomer.value = true;
  store.commit("setPedidosLoading", true);
  store.commit("setDevolucionesLoading", true);
  try {
    await store.dispatch("pedidoscliente", currentClienteDevolucion.value.id);
    verpedidos.value = true;
    await nextTick();

    for (const id of ["datasetLength", "datasetDevolucionesLength"]) {
      document.querySelectorAll("#" + id + " label").forEach((el) => el.remove());
      const selectLength = document.querySelector("#" + id + " select");
      if (selectLength) {
        selectLength.className = "form-select";
        selectLength.style.width = "80px";
      }
    }
  } catch (err) {
    store.commit("setPedidosLoading", false);
    store.commit("setDevolucionesLoading", false);
    swalError(
      err.response?.data?.error || err.message || "No se pudieron consultar los pedidos del cliente."
    );
  } finally {
    refreshingCustomer.value = false;
  }
}

async function printAccountStatementExcel() {
  const resp = await printExcelStatusAccountClient(
    currentClienteDevolucion.value.id
  );
  if (!resp?.ok) {
    const msg = resp?.message || "Opps! No se pudo generar el archivo Excel";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    return;
  }
  swalSuccess(resp?.message || "Excel Generado exitosamente");
}

async function printAccountStatementPdf() {
  const resp = await printPdfStatusAccountClient(
    currentClienteDevolucion.value.id
  );
  if (!resp?.ok) {
    const msg = resp?.message || "Opps! No se pudo generar el archivo Pdf";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    return;
  }
  swalSuccess(resp?.message || "Pdf Generado exitosamente");
}
</script>

<style scoped>
.return-notice {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0.75rem 0.75rem 0;
  padding: 0.75rem 0.875rem;
  border: 1px solid #e7bc54;
  border-left: 4px solid #d99500;
  border-radius: 0.5rem;
  background: #fff3cd;
  color: #664d03;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.return-notice-icon {
  flex-shrink: 0;
  color: #946200;
  font-size: 1rem;
}

.return-notice p { margin: 0; }
.return-notice strong { font-weight: 700; }
.return-notice-separator { margin: 0 0.5rem; opacity: 0.5; }

@media (max-width: 575.98px) {
  .return-notice p > strong:first-child { display: block; margin-bottom: 0.125rem; }
  .return-notice-separator { display: none; }
}

.return-tabs {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--bs-border-color, #e9ecef);
  width: 100%;
}

.return-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 0.625rem;
  background: transparent;
  color: inherit;
  font-weight: 600;
  font-size: 0.8125rem;
  transition: background-color 150ms, border-color 150ms, color 150ms;
}

.return-tab:hover {
  background-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.06);
}

.return-tab.is-active {
  color: var(--bs-primary, #0d6efd);
  background-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.1);
  border-color: currentColor;
}

.return-tab:focus-visible {
  outline: 3px solid var(--bs-primary, #0d6efd);
  outline-offset: 2px;
}

.return-tab-count {
  min-width: 1.375rem;
  padding: 0.0625rem 0.375rem;
  border-radius: 1rem;
  background-color: rgba(var(--bs-primary-rgb, 13, 110, 253), 0.1);
  font-size: 0.6875rem;
}

@media (max-width: 575.98px) {
  .return-tab {
    gap: 0.375rem;
    padding: 0.5rem;
    font-size: 0.75rem;
  }
}
</style>
