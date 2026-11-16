<script setup>
import { useDispatchOrdersTable } from "@/composables/cobranzas/ordenes-despacho/useDispatchOrdersTable";
import { useDispatchOrdersActions } from "@/composables/cobranzas/ordenes-despacho/useDispatchOrdersActions";
import { onMounted, reactive, ref } from "vue";
import { swalWarning, swalError, swalSuccess } from "@/functions/swal-alert.js";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { useBootstrapModal } from "@/composables/core/useBootstrapModal";
import BaseTable from "@/components/BaseTable.vue";
// modals
import FiltrarCliente from "@/components/ventas/cliente/FiltrarCliente.vue";
import { useCustomerFilterSearch } from "@/composables/venta/cliente/useCustomerFilterSearch";

const {
  table,
  listPerpage,
  listStatus,
  columns,
  fetchList,
  onSort,
  refresh,
  statusClass,
} = useDispatchOrdersTable();
const { printOrderDispatchPdf } = useDispatchOrdersActions();

const flatPickrState = reactive({
  fecha_desde: {
    // maxDate: Date.now(),
    locale: Spanish,
  },
  fecha_hasta: {
    // maxDate: Date.now(),
    locale: Spanish,
  },
});

const {
  clients,
  errorSearchClient,
  loadingSearch,
  showCustomerResults,
  searchCustomerFilters,
  updateCustomerSearchTerm,
  cleanSearchClients,
} = useCustomerFilterSearch();

// variables de filtro de cliente
const selectedCustomer = ref(null);

// modals
const selectedClientModalRef = ref(null);
const selectedClientModalObj = useBootstrapModal(selectedClientModalRef);

function openModalSelectedClient() {
  selectedClientModalObj.show();
}

async function handleCustomerSelected(selection) {
  selectedCustomer.value = selection;
  showCustomerResults.value = false;
  table.filters.ruc = selectedCustomer.value.CLI_RUC;
  cleanSearchClients();
  selectedClientModalObj.hide();
}

function isRowDisabled(row) {
  console.log(row)
}

const handleClick = ({ row, col }) => {
  console.log(row, col);
};

const BLOCK_DOWNLOAD = ["cancelada", "despachada", "pendiente"];

function canDownloadPdf(row) {
  const status = String(row?.estado ?? "")
    .trim()
    .toLowerCase();
  return !BLOCK_DOWNLOAD.includes(status);
}

/**disbale boton de generar pdf  */
const btnLock = ref(new Map());

const isBtnLocked = (row) => {
  const id = row && typeof row === "object" ? row.id : row;

  if (id === null || id === undefined) {
    return false;
  }

  return btnLock.value.get(String(id)) === true;
};

function lockButton(id) {
  if (id === null || id === undefined) {
    return;
  }

  const locks = new Map(btnLock.value);
  locks.set(String(id), true);
  btnLock.value = locks;
}

function unlockButton(id) {
  if (id === null || id === undefined) {
    return;
  }

  const locks = new Map(btnLock.value);
  locks.delete(String(id));
  btnLock.value = locks;
}

async function downloadPdf(row) {
  if (isBtnLocked(row)) {
    return;
  }

  lockButton(row.id);

  try {
    const res = await printOrderDispatchPdf(row.id);
    if (!res?.ok) {
      const msg =
        res?.message || "No se pudo cargar la información del usuario";
      (res?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
      return;
    }
    swalSuccess(res?.message);
  } finally {
    unlockButton(row.id);
  }
}

onMounted(() => {
  fetchList(1);
});
</script>

<template>
  <BasePageHeading title="Consulta Ordenes Despacho">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Ordenes Despacho</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- contenido  -->
  <div class="content">
    <BaseBlock title="Consulta Ordenes Despacho">
      <!-- botones del componente -->
      <template #options>
        <div class="block-options-item">
          <button
            class="btn btn-outline-primary btn-sm"
            @click="refresh"
            :disabled="table.loading"
            title="Refrescar"
          >
            <i v-if="!table.loading" class="fa fa-refresh"></i>
            <span v-else class="spinner-border spinner-border-sm"></span>
          </button>
        </div>
      </template>

      <!-- filtros  -->
      <div class="row g-3 align-items-end px-2 pt-2 pb-1 mb-4">
        <!-- fecha -->
        <div class="col-12 col-lg-4">
          <small class="small-label d-block mb-1"> Fecha</small>
          <div class="d-flex align-items-center">
            <flat-pickr
              id="fecha_desde"
              class="form-control form-control-sm"
              v-model="table.filters.fechaInicio"
              :config="flatPickrState.fecha_desde"
            />
            <span class="text-muted">—</span>
            <flat-pickr
              id="fecha_hasta"
              class="form-control form-control-sm"
              v-model="table.filters.fechaFin"
              :config="flatPickrState.fecha_hasta"
            />
          </div>
        </div>

        <!-- cliente -->
        <div class="col-12 col-sm-6 col-lg-2">
          <small class="small-label d-block mb-1">Cliente</small>
          <button
            type="button"
            title="Seleccionar cliente"
            @click="openModalSelectedClient()"
            class="btn btn-outline-info btn-sm w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-2"
          >
            <i class="fa fa-user"></i>
            <span>Cliente</span>
          </button>
        </div>
        <!-- estado -->
        <div class="col-12 col-sm-6 col-lg-2">
          <small class="small-label d-block mb-1">Estado</small>
          <select
            class="form-select form-select-sm"
            v-model="table.filters.estado"
          >
            <option
              v-for="item in listStatus"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- end filtros -->
      <!-- paginacion y busqueda -->
      <div class="row justify-content-between align-items-center mb-3">
        <div class="col-md-1">
          <select
            v-model="table.filters.perpage"
            class="form-select form-select-sm"
          >
            <option
              v-for="item in listPerpage"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </option>
          </select>
        </div>
        <div class="col-md-4">
          <input
            v-model="table.filters.search"
            placeholder="Buscar..."
            class="form-control form-control-sm"
          />
        </div>
      </div>
      <!-- end paginacion y busqueda -->
      <BaseTable
        :columns="columns"
        :data="table.items"
        :loading="table.loading"
        :error="table.error"
        retryable
        @onRetry="fetchList(table.currentPage)"
        :perPage="table.filters.perpage"
        :totalItems="table.totalItems"
        :currentPage="table.currentPage"
        :totalPage="table.totalPage"
        :sortField="table.filters.sortField"
        :sortOrder="table.filters.sortOrder"
        @onSort="onSort"
        @onPageChange="fetchList"
        @onClick="handleClick"
        @onKeyDown="handleClick"
        :is-row-disabled="isRowDisabled"
      >
        <!-- estado -->
        <template #cell-estado="{ value, row }">
          <span :class="statusClass(value)" style="font-size: 12px">{{
            row.estado ?? "N/A"
          }}</span>
        </template>

        <!-- slot de acciones -->
        <template #actions="{ row }">
          <button
            v-show="canDownloadPdf(row)"
            type="button"
            class="btn btn-outline-primary btn-sm"
            :disabled="isBtnLocked(row)"
            @click.stop="downloadPdf(row)"
          >
            <span
              v-if="isBtnLocked(row)"
              class="spinner-border spinner-border-sm"
            ></span>
            <i v-else class="fa fa-print"></i>
          </button>
        </template>
      </BaseTable>
    </BaseBlock>
  </div>

  <!-- Modal para filtro de cliente -->
  <div
    class="modal"
    id="modal-filtrar-cliente"
    tabindex="-1"
    aria-labelledby="modal-filtrar-cliente"
    aria-hidden="true"
    ref="selectedClientModalRef"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <FiltrarCliente
          :clients="clients"
          :loading="loadingSearch"
          :error-search="errorSearchClient"
          :show-results="showCustomerResults"
          @search-term-change="updateCustomerSearchTerm"
          @search-customers="searchCustomerFilters"
          @select-customer="handleCustomerSelected"
        ></FiltrarCliente>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.small-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #6c757d;
  margin-bottom: 0.35rem;
}
</style>
