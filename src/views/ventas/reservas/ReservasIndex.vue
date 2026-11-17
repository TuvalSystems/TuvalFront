<script setup>
import BaseTable from "@/components/BaseTable.vue";
import { onMounted, reactive, ref, onBeforeUnmount, nextTick } from "vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { useApprovedReservationsTable } from "@/composables/venta/cotizaciones/reservas/useApprovedReservationsTable";
import { usePtoVtaStore } from "../../../stores/bodegas/utils/useListPuntoVentaStore";
import { formatPriceJm } from "@/functions";
import { useBootstrapModal } from "@/composables/core/useBootstrapModal";
import { useQuotationReserveApproval } from "@/composables/aprobaciones/reservas/useQuotationReserveApproval";
import { swalWarning, swalError, swalSuccess } from "@/functions/swal-alert.js";
//componente
import FiltrarCliente from "@/components/ventas/cliente/FiltrarCliente.vue";
import VerCotizacionDetalleReservaComponent from "@/views/aprobaciones/modals/VerCotizacionDetalleReservaModal.vue";
import verUsoReservaModal from "@/views/ventas/reservas/modal/verUsoReservaModal.vue";
import verUsoFacturaDemandaComponent from "@/views/ventas/reservas/modal/verUsoFacturaDemandaModal.vue";
//composables
import { useCustomerFilterSearch } from "@/composables/venta/cliente/useCustomerFilterSearch";
import { useAuthorizedReservationsRefresh } from "@/composables/venta/cotizaciones/reservas/useAuthorizedReservationsRefresh";

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
  columns,
  listPerpage,
  listStatus,
  table,
  fetchList,
  onSort,
  refresh,
  estadoClass,
  totalClass,
} = useApprovedReservationsTable();
const ptoVta = usePtoVtaStore();
const {
  fetchQuotationWithDetial,
  fetchQuotationWithDetialAndStockActive,
  cancelReservation,
} = useQuotationReserveApproval();

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

const lockedIds = ref(new Set());

function lock(id) {
  const s = new Set(lockedIds.value);
  s.add(id);
  lockedIds.value = s;
}
function unlock(id) {
  const s = new Set(lockedIds.value);
  s.delete(id);
  lockedIds.value = s;
}

function isRowDisabled(row) {
  return row && lockedIds.value.has(row.id);
}

const handleClick = ({ row, col }) => {
  if (col.key === "cotizacion") {
    visualizarDetalleCotización(row.id);
  }
};

/** disabled boton aprobar */

const testLocks = ref(new Map()); // Map<id, true>

const isTestLocked = (idOrRow) => {
  const id = typeof idOrRow === "object" ? idOrRow?.id : idOrRow;
  return testLocks.value.get(String(id)) === true;
};

function lockTest(id) {
  const m = new Map(testLocks.value);
  m.set(String(id), true);
  testLocks.value = m; // 👈 reasignar dispara reactividad
}

function unlockTest(id) {
  const m = new Map(testLocks.value);
  m.delete(String(id));
  testLocks.value = m; // 👈 idem
}

const dataModal = ref(null);
const dataDemandaModal = ref(null);
const verCrearEditarReservaModal = ref(null);
const verCrearEditarReservaModalObj = useBootstrapModal(verCrearEditarReservaModal);
const verUsoFacturaDemandaModal = ref(null);
const verUsoFacturaDemandaModalObj = useBootstrapModal(verUsoFacturaDemandaModal);
async function crearReserva(row) {
  if (row.estado == "pendiente") {
    swalWarning(
      "La reserva aun no ha sido aprobada, no puede visualizar el detalle"
    );
    return;
  }
  if (row.tipo_reserva_id == 1) {
    openModalUsoReserva(row);
  } else if (row.tipo_reserva_id == 2) {
    openModalUsoFacturaDemanda(row);
  }
}

async function openModalUsoReserva(row) {
  dataModal.value = null;
  if (!row || row.id == null) return;
  const id = row.id;
  if (isTestLocked(id)) return;
  lockTest(id);
  const resp = await fetchQuotationWithDetialAndStockActive(row.id);
  if (!resp?.ok) {
    unlockTest(id);
    return swalError(resp?.message);
  }
  dataModal.value = resp.data;
  await nextTick();
  verCrearEditarReservaModalObj.show();
  unlockTest(id);
}

async function openModalUsoFacturaDemanda(row) {
  dataDemandaModal.value = null;
  if (!row || row.id == null) return;
  const id = row.id;
  if (isTestLocked(id)) return;
  lockTest(id);
  const resp = await fetchQuotationWithDetialAndStockActive(row.id);
  if (!resp?.ok) {
    unlockTest(id);
    return swalError(resp?.message);
  }
  dataDemandaModal.value = resp.data;
  await nextTick();
  verUsoFacturaDemandaModalObj.show();
  unlockTest(id);
}

async function closeModalUsoReserva() {
  verCrearEditarReservaModalObj.hide();
  dataModal.value = null;
  refresh();
}

async function closeModalUsoFacturaDemanda() {
  verUsoFacturaDemandaModalObj.hide();
  dataDemandaModal.value = null;
  refresh();
}

async function cancelarReserva(id) {
  const resp = await cancelReservation(id);
  if (!resp?.ok) {
    await swalError(resp?.message);
    return;
  }
  await swalSuccess(resp?.message || "Reserva cancelada exitosamente.");
  refresh();
}

// funcion para modal de filtro de cliente
const filtrarClienteModal = ref(null);
const filtrarClienteModalObj = useBootstrapModal(filtrarClienteModal);
function levantarFiltrocliente() {
  filtrarClienteModalObj.show();
}

/** filtro y busqueda de clientes */

async function handleCustomerSelected(selection) {
  selectedCustomer.value = selection;
  showCustomerResults.value = false;
  table.cliente = selectedCustomer.value.CLI_RUC;
  cleanSearchClients();
  filtrarClienteModalObj.hide();
}

/** funciones para visualizar el detalle de la cotizacion  */

const verCotizacionDetalleModal = ref(null);
const verCotizacionDetalleModalObj = useBootstrapModal(verCotizacionDetalleModal);
let datosModalCotizacionDetalle = ref(null);
let datosModalCotizacionSegmento = ref(null);
async function visualizarDetalleCotización(id) {
  if (lockedIds.value.has(id)) return;
  lock(id);
  const resp = await fetchQuotationWithDetial(id);
  if (!resp?.ok) {
    unlock(id);
    return swalError(resp?.message);
  }
  datosModalCotizacionDetalle.value = resp.data.reserva;
  datosModalCotizacionSegmento.value = resp.data.segmento;
  verCotizacionDetalleModalObj.show();
  await nextTick();
  unlock(id);
}

/** socket */
let stopRefresh;
onMounted(() => {
  ptoVta.fetchAll();
  if (!table.items.length && !table.loading) {
    fetchList(1);
  }
  stopRefresh = useAuthorizedReservationsRefresh({
    refreshFn: () => fetchList(table.currentPage),
    debounceMs: 350,
    // Si quieres log de suscripción:
    // onSubscribed: () => console.log("📡 Suscrito: refresh-authorized-reservations"),
    // onEvent: (e) => console.log('🔔 ReservedListAuthorizedChanged:', e),
  });
});
onBeforeUnmount(() => {
  stopRefresh?.();
});
</script>
<template>
  <BasePageHeading title="Reservas">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Ventas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Reservas</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>

  <!-- contenido -->
  <div class="content">
    <BaseBlock title="Reservas" content-full rounded>
      <template #options>
        <div class="block-options-item">
          <button
            class="btn btn-outline-primary btn-sm"
            @click="refresh"
            :disabled="table.loading"
            title="Refrescar"
            aria-label="Refrescar"
          >
            <i v-if="!table.loading" class="fa fa-refresh"></i>
            <span v-else class="spinner-border spinner-border-sm"></span>
          </button>
        </div>
      </template>
      <div class="row g-3 align-items-end px-2 pt-2 pb-1 mb-4">
        <!-- fecha -->
        <div class="col-12 col-lg-4">
          <small class="text-muted d-block mb-1">Fecha</small>
          <div class="d-flex align-items-center">
            <flat-pickr
              id="fecha_desde"
              class="form-control form-control-sm"
              v-model="table.fecha_desde"
              :config="flatPickrState.fecha_desde"
            />
            <span class="text-muted">—</span>
            <flat-pickr
              id="fecha_hasta"
              class="form-control form-control-sm"
              v-model="table.fecha_hasta"
              :config="flatPickrState.fecha_hasta"
            />
          </div>
        </div>
        <!-- sucursal -->
        <div class="col-12 col-sm-6 col-lg-2">
          <small class="text-muted d-block mb-1">Sucursal</small>
          <select
            name=""
            id=""
            class="form-control form-control-sm"
            v-model="table.ptovta"
          >
            <option value="">Todos</option>
            <option
              v-for="p in ptoVta.list"
              :key="p.PTO_VTA_BOD_PUNTO_VENTA"
              :value="p.PTO_VTA_BOD_PUNTO_VENTA"
            >
              {{ p.PTO_VTA_DESCRIPCION }}
            </option>
          </select>
        </div>
        <!-- sucursal -->
        <div class="col-12 col-sm-6 col-lg-2">
          <small class="text-muted d-block mb-1">Cliente</small>
          <button
            type="button"
            title="Seleccionar cliente"
            @click="levantarFiltrocliente()"
            class="btn btn-outline-info btn-sm w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm rounded-2"
          >
            <i class="fa fa-user"></i>
            <span>Cliente</span>
          </button>
        </div>
        <!-- sucursal -->
        <div class="col-12 col-sm-6 col-lg-2">
          <small class="text-muted d-block mb-1">Estado</small>
          <select class="form-select form-select-sm" v-model="table.status">
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
      <div class="row justify-content-between align-items-center mb-3">
        <div class="col-md-1">
          <select v-model="table.perPage" class="form-select form-select-sm">
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
            v-model="table.searchTerm"
            placeholder="Buscar..."
            class="form-control form-control-sm"
          />
        </div>
      </div>
      <BaseTable
        :columns="columns"
        :data="table.items"
        :loading="table.loading" :error="table.error" retryable
        @onRetry="fetchList(table.currentPage)"
        :perPage="table.perPage"
        :totalItems="table.totalItems"
        :currentPage="table.currentPage"
        :totalPage="table.totalPage"
        :sortField="table.sortField"
        :sortOrder="table.sortOrder"
        @onSort="onSort"
        @onPageChange="fetchList"
        @onSearch="table.searchTerm"
        @onClick="handleClick"
        @onKeyDown="handleClick"
        :is-row-disabled="isRowDisabled"
      >
        <template #cell-estado="{ value, row }">
          <span :class="estadoClass(value)" style="font-size: 12px">{{
            row.estado ?? "N/A"
          }}</span>
        </template>
        <template #cell-total="{ value, row }">
          <span :class="totalClass(value)">
            ${{ formatPriceJm(row.total) ?? "N/A" }}</span
          >
        </template>
        <!-- slot para cambiar el diseño y estilo de la columna para listar las bodegas usadas por la cotizacion -->
        <template #cell-bodegas_uso="{ value, row }">
          <code
            v-for="(bod, index) in value"
            :key="`${row.id}-bodega-${index}`"
            class="d-block mb-1"
            style="width: fit-content"
          >
            {{ bod }}
          </code>
        </template>
        <!-- diseño de las campos autorizadores -->
        <template #cell-usuario_aprobador="{ value }">
          <span v-if="value" class="badge-usuario-aprobador">{{ value }}</span>
          <span v-else> Sin Aprobador</span>
        </template>
        <template #cell-fe_ingreso_autorizacion_reserva="{ value }">
          <span v-if="value" class="badge-fecha-autorizacion">{{ value }}</span>
          <span v-else> Sin Fecha</span>
        </template>
        <template #actions="{ row }">
          <button
            type="button"
            class="btn btn-sm btn-alt-secondary"
            id="dropOptions"
            data-bs-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <i class="fa fa-fw fa-ellipsis-v"></i>
          </button>
          <ul
            class="dropdown-menu dropdown-menu-end shadow-sm"
            aria-labelledby="dropOptions"
          >
            <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">
              Gestión
            </li>
            <li>
              <button
                class="dropdown-item d-flex align-items-center gap-2 py-2"
                @click="crearReserva(row)"
              >
                <i class="fa-solid fa-calendar-plus fa-fw text-warning"></i
                ><span>Reserva</span>
              </button>
            </li>
            <li v-if="row.estado === 'pendiente'">
              <div class="dropdown-divider my-2"></div>
              <button
                class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                @click="cancelarReserva(row.id)"
              >
                <i class="fa-solid fa-ban fa-fw"></i>
                <span class="fw-semibold">Cancelar</span>
              </button>
            </li>
          </ul>
        </template>
        <!-- Slot de vacío -->
        <template #empty>
          <div class="text-center py-5">
            <i class="fa fa-box-open fa-2x text-muted mb-2"></i>
            <p class="text-muted mb-0">
              No se encontraron registros para mostrar
            </p>
          </div>
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
    ref="filtrarClienteModal"
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

  <!-- Modal de reserva -->
  <div
    class="modal"
    id="modal-cotizacion-detalle"
    tabindex="-1"
    aria-labelledby="modal-cotizacion-detalle"
    aria-hidden="true"
    ref="verCotizacionDetalleModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <VerCotizacionDetalleReservaComponent
          v-if="datosModalCotizacionDetalle && datosModalCotizacionSegmento"
          :infoReserva="datosModalCotizacionDetalle"
          :segmento="datosModalCotizacionSegmento"
        >
        </VerCotizacionDetalleReservaComponent>
      </div>
    </div>
  </div>

  <!-- Modal de generacion de reservas -->
  <div
    class="modal"
    id="modal-uso-reserva"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-uso-reserva"
    aria-hidden="false"
    ref="verCrearEditarReservaModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <verUsoReservaModal
          v-if="dataModal"
          :reserva="dataModal"
          @closeModalUsoReserva="closeModalUsoReserva()"
        >
        </verUsoReservaModal>
      </div>
    </div>
  </div>

  <!-- Modal para generar facturas a demanda -->
  <div
    class="modal"
    id="modal-uso-reserva"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-uso-reserva"
    aria-hidden="false"
    ref="verUsoFacturaDemandaModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <verUsoFacturaDemandaComponent
          v-if="dataDemandaModal"
          :reserva="dataDemandaModal"
          @closeModalUsoFacturaDemanda="closeModalUsoFacturaDemanda()"
        >
        </verUsoFacturaDemandaComponent>
      </div>
    </div>
  </div>
</template>

<style scoped>
.badge-usuario-aprobador {
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  border-radius: 6px;
  background-color: var(--tuval-primary-soft);
  color: var(--tuval-primary-strong);
  border: 1px solid var(--tuval-primary);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-fecha-autorizacion {
  display: inline-flex;
  align-items: center;
  padding: 4px 9px;
  border-radius: 6px;
  background-color: var(--tuval-primary-soft);
  color: var(--tuval-primary-strong);
  border: 1px solid var(--tuval-primary);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}
</style>