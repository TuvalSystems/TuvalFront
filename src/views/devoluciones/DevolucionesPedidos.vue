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
      :loading="loadingSearch || loadingCustomer || refreshingCustomer"
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
      @refresh="selectcliente(currentClienteDevolucion)"
    />
    <BaseBlock
      v-if="currentClienteDevolucion"
      v-show="showCustomerDetails"
      class="row g-0 mt-4"
    >
      <template #content>
        <div
          class="alert alert-info alert-dismissible fade show d-flex align-items-center"
          role="alert"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            class="bi bi-info-circle-fill flex-shrink-0 me-2"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"
            />
          </svg>

          <div>
            <strong>Importante:</strong> Para anular una factura, esta debe
            estar autorizada por el SRI.
            <!-- <a href="javascript:void(0)" class="alert-link text-decoration-underline">Ver documento relacionado</a> -->
          </div>

          <!-- <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button> -->
        </div>

        <ul
          class="nav nav-tabs nav-tabs-block flex-md-column col-md-2"
          role="tablist"
        >
          <li class="nav-item d-md-flex flex-md-column">
            <button
              class="nav-link text-md-start active"
              id="btabs-vertical-facturas-tab"
              data-bs-toggle="tab"
              data-bs-target="#btabs-vertical-facturas"
              role="tab"
              aria-controls="btabs-vertical-facturas"
              aria-selected="false"
            >
              <i
                class="fa fa-fw fa-user-circle opacity-50 me-1 d-none d-sm-inline-block"
              ></i>
              Facturas
            </button>
          </li>
          <li class="nav-item d-md-flex flex-md-column">
            <button
              class="nav-link text-md-start"
              id="btabs-vertical-devoluciones-tab"
              data-bs-toggle="tab"
              data-bs-target="#btabs-vertical-devoluciones"
              role="tab"
              aria-controls="btabs-vertical-devoluciones"
              aria-selected="false"
            >
              <i
                class="fa fa-fw fa-cog opacity-50 me-1 d-none d-sm-inline-block"
              ></i>
              Devoluciones
            </button>
          </li>
        </ul>
        <div class="tab-content col-md-10">
          <div
            class="block-content tab-pane active"
            id="btabs-vertical-facturas"
            role="tabpanel"
            aria-labelledby="btabs-vertical-home-tab"
          >
            <Pedidos
              @recargarCliente="selectcliente(currentClienteDevolucion)"
            ></Pedidos>
          </div>

          <div
            class="block-content tab-pane"
            id="btabs-vertical-devoluciones"
            role="tabpanel"
            aria-labelledby="btabs-vertical-devoluciones-tab"
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
    !refreshingCustomer.value &&
    !showCustomerResults.value
);
const verpedidos = ref(false);

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
    verpedidos.value = false;
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
