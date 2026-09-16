<script setup>
import { onMounted, ref, nextTick, onBeforeUnmount } from "vue";
import { Modal } from "bootstrap";
import BaseTable from "@/components/BaseTable.vue";
import { swalError } from "@/functions/swal-alert.js";

//stores
import { usePtoVtaStore } from "@/stores/bodegas/utils/useListPuntoVentaStore";
import { useTipoReservasStore } from "@/stores/cotizaciones/reservas/useTipoReservasStore";

// modals
import VerCotizacionDetalleReservaComponent from "@/views/aprobaciones/modals/VerCotizacionDetalleReservaModal.vue";
import verCotizacionAprobacionReservaComponent from "@/views/aprobaciones/modals/verCotizacionAprobacionReservaModal.vue";
import verCotizacionReservaRechazarModal from "@/views/aprobaciones/modals/verCotizacionReservaRechazarModal.vue";
import verUsoFacturaDemandaComponent from "@/views/ventas/reservas/modal/verUsoFacturaDemandaModal.vue";

//componente
import FiltrarCliente from "@/components/ventas/cliente/FiltrarCliente.vue";

//composables
import { useApprovalsGridRefresh } from "@/composables/aprobaciones/reservas/useApprovalsGridRefresh";
import { useQuotationReserveRequests } from "@/composables/aprobaciones/reservas/useQuotationReserveRequests";
import { useQuotationReserveApproval } from "@/composables/aprobaciones/reservas/useQuotationReserveApproval";
import { useCustomerFilterSearch } from "@/composables/venta/cliente/useCustomerFilterSearch";

import { formatPriceJm } from "@/functions";
import { usePuntosVentaReservaLimits } from "@/stores/cotizaciones/reservas/usePuntosVentaReservaLimits";
const {
  columns,
  listPerpage,
  table,
  refresh,
  fetchReservationRequests,
  onSort,
  estadoClass,
  totalClass,
} = useQuotationReserveRequests();
const ptoVta = usePtoVtaStore();
const tipoReservasStore = useTipoReservasStore();

const {
  fetchQuotationWithDetial,
  fetchQuotationWithDetialAndStock,
  fetchQuotationWithDetialAndStockActive,
} = useQuotationReserveApproval();
const puntosVentaReservaLimitsStore = usePuntosVentaReservaLimits();

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

/** para bloquear fila de la tabla cuando
 * se esta visualizando la informacion de la cotizacion
 */
const lockedIds = ref(new Set());
function isRowDisabled(row) {
  return lockedIds.value.has(row.id);
}

const handleClick = ({ row, col }) => {
  if (col.key === "cotizacion") {
    visualizarDetalleCotización(row.id);
  }
};

let verCotizacionDetalleModal = ref(null);
let verCotizacionDetalleModalObj = null;
let datosModalCotizacionDetalle = ref(null);
let datosModalCotizacionSegmento = ref(null);

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
async function visualizarDetalleCotización(id) {
  if (lockedIds.value.has(id)) return;
  lock(id);
  const resp = await fetchQuotationWithDetial(id);

  if (!resp?.ok) {
    unlock(id);
    return swalError(resp?.message);
  }
  datosModalCotizacionDetalle.value = resp?.data.reserva;
  datosModalCotizacionSegmento.value = resp?.data.segmento;
  verCotizacionDetalleModalObj.show();
  await nextTick();
  unlock(id);
}

/** manejo del modal para la aprobación */

const modalLocks = ref(new Map());
const isModalLocked = (modalRow) => {
  const id = typeof modalRow === "object" ? modalRow?.id : modalRow;
  return modalLocks.value.get(String(id)) === true;
};

function lockModal(id) {
  const m = new Map(modalLocks.value);
  m.set(String(id), true);
  modalLocks.value = m;
}

function unLockedModal(id) {
  const m = new Map(modalLocks.value);
  m.delete(String(id));
  modalLocks.value = m;
}

let verDetalleCotizacionAprobacionModal = ref(null);
let verDetalleCotizacionAprobacionModalObj = null;
let dataModalReserva = ref(null);
let verUsoFacturaDemandaModalObj = null;
let verUsoFacturaDemandaModal = ref(null);
const dataModal = ref(null);
async function verModalAprobacionReserva(row) {
  if (row.tipo_reserva_id === 1) {
    openModalAprobacionReserva(row);
  } else if (row.tipo_reserva_id === 2) {
    openModalAprobacionFacturaDemanda(row);
  }
}

// modal aprobacion  reserva
async function openModalAprobacionReserva(row) {
  if (!row || row.id === null) return;
  const id = row.id;
  if (isModalLocked(id)) return;
  dataModalReserva.value = null;
  lockModal(id);
  const resp = await fetchQuotationWithDetialAndStock(row.id);
  if (!resp?.ok) {
    unLockedModal(id);
    return swalError(resp?.message);
  }
  dataModalReserva.value = resp.data;
  verDetalleCotizacionAprobacionModalObj.show();
  await nextTick();
  unLockedModal(id);
}

async function closeModalAprobacionReserva() {
  verDetalleCotizacionAprobacionModalObj.hide();
  dataModalReserva.value = null;
  refresh();
}

// modal de aprobacion a factura demanda
async function openModalAprobacionFacturaDemanda(row) {
  if (!row || row.id === null) return;
  const id = row.id;
  if (isModalLocked(id)) return;
  dataModal.value = null;
  lockModal(id);
  const resp = await fetchQuotationWithDetialAndStockActive(row.id);
  if (!resp?.ok) {
    unLockedModal(id);
    return swalError(resp?.message);
  }
  dataModal.value = resp.data;
  verUsoFacturaDemandaModalObj.show();
  await nextTick();
  unLockedModal(id);
}

async function closeModalUsoFacturaDemanda() {
  verUsoFacturaDemandaModalObj.hide();
  dataModal.value = null;
  refresh();
}

/** rechazo de reservca */
const modalCancelLocks = ref(new Map());
const isModalCancelLocked = (modalRow) => {
  const id = typeof modalRow === "object" ? modalRow?.id : modalRow;
  return modalCancelLocks.value.get(String(id)) === true;
};
function lockModalCancel(id) {
  const m = new Map(modalCancelLocks.value);
  m.set(String(id), true);
  modalCancelLocks.value = m;
}

function unLockedModalCancel(id) {
  const m = new Map(modalCancelLocks.value);
  m.delete(String(id));
  modalCancelLocks.value = m;
}

let verModalRechazarReservaModal = ref(null);
let verModalRechazarReservaModalObj = null;
const dataRechazoModal = ref(null);
async function verModalRechazar(row) {
  if (!row || row.id === null) return;
  const id = row.id;
  if (isModalCancelLocked(id)) return;

  dataRechazoModal.value = null;
  lockModalCancel(id);
  const resp = await fetchQuotationWithDetialAndStock(row.id);
  if (!resp?.ok) {
    unLockedModalCancel(id);
    return swalError(resp?.message);
  }
  dataRechazoModal.value = resp.data;
  verModalRechazarReservaModalObj.show();
  await nextTick();
  unLockedModalCancel(id);
}

async function closeModalRechazarReserva() {
  verModalRechazarReservaModalObj.hide();
  dataModalReserva.value = null;
  refresh();
}

function ensureModals() {
  verCotizacionDetalleModalObj = new Modal(verCotizacionDetalleModal.value);
  verModalRechazarReservaModalObj = new Modal(
    verModalRechazarReservaModal.value
  );
  verDetalleCotizacionAprobacionModalObj = new Modal(
    verDetalleCotizacionAprobacionModal.value
  );
  verUsoFacturaDemandaModalObj = new Modal(verUsoFacturaDemandaModal.value);
  filtrarClienteModalObj = new Modal(filtrarClienteModal.value);
}

/** filtro y busqueda de clientes */

let filtrarClienteModal = ref(null);
let filtrarClienteModalObj = null;
function levantarFiltrocliente() {
  filtrarClienteModalObj.show();
}

async function handleCustomerSelected(selection) {
  selectedCustomer.value = selection;
  showCustomerResults.value = false;
  table.cliente = selectedCustomer.value.CLI_RUC;
  cleanSearchClients();
  filtrarClienteModalObj.hide();
}

/* ---- SOCKET: approvals ---- */
let stopGridSocket;

onMounted(async () => {
  ptoVta.fetchAll();
  if (tipoReservasStore.tipoReservas.length == 0) {
    tipoReservasStore.fetchListTypeReserved();
  }
  ensureModals();
  if (!table.items.length && !table.loading) {
    fetchReservationRequests(1);
  }

  stopGridSocket = useApprovalsGridRefresh({
    refreshFn: () => fetchReservationRequests(table.currentPage),
    debounceMs: 350,
    // Si quieres log de suscripción:
    // onSubscribed: () => console.log("📡 Suscrito: refresh-authorized-reservations"),
    // onEvent: (e) => console.log('🔔 ReservedListAuthorizedChanged:', e),
  });

  if (puntosVentaReservaLimitsStore.puntosVentaReservaLimits.length == 0) {
    puntosVentaReservaLimitsStore.fetchPuntosVentaReservaLimits();
  }
});
onBeforeUnmount(() => {
  stopGridSocket?.();
});
</script>
<template>
  <BasePageHeading title="Aprobaciones Reservas">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Aprobaciones</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Reservas</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <div class="content">
    <BaseBlock title="Aprobaciones Reservas" content-full rounded>
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
      <div class="row g-3 align-items-center px-2 pt-2 pb-1 mb-4">
        <!-- sucursal -->
        <div class="col-12 col-sm-6 col-lg-3">
          <small class="text-muted d-block mb-1">Sucursal</small>
          <select class="form-control form-control-sm" v-model="table.ptovta">
            <option value="">Todas</option>
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
          <small class="text-muted d-block mb-1">Tipo Reserva</small>
          <select
            class="form-select form-select-sm"
            v-model="table.tipoReserva"
          >
            <option value="">Todos</option>
            <option
              v-for="item in tipoReservasStore.tipoReservas"
              :key="item.value"
              :value="item.id"
            >
              {{ item.descripcion }}
            </option>
          </select>
        </div>
      </div>
      <div class="row justify-content-between align-items-center mb-3">
        <div class="col-md-1">
          <select v-model="table.perPage" class="form-select">
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
            class="form-control"
          />
        </div>
      </div>
      <BaseTable
        :columns="columns"
        :data="table.items"
        :loading="table.loading"
        :perPage="table.perPage"
        :totalItems="table.totalItems"
        :currentPage="table.currentPage"
        :totalPage="table.totalPage"
        :sortField="table.sortField"
        :sortOrder="table.sortOrder"
        @onSort="onSort"
        @onPageChange="fetchReservationRequests"
        @onSearch="table.searchTerm"
        @onClick="handleClick"
        @onKeyDown="handleClick"
        :is-row-disabled="isRowDisabled"
      >
        <!-- Slot específico para la columna 'estado' -->
        <template #cell-estado="{ value, row }">
          <span :class="estadoClass(value)" style="font-size: 12px">{{
            row.estado ?? "N/A"
          }}</span>
        </template>
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
        <template #cell-total="{ value, row }">
          <span :class="totalClass(value)">
            ${{ formatPriceJm(row.total) ?? "N/A" }}</span
          >
        </template>
        <template #actions="{ row }">
          <button
            type="button"
            class="btn btn-primary btn-sm mx-1"
            @click="verModalAprobacionReserva(row)"
            :disabled="isModalLocked(row)"
          >
            <span
              v-if="isModalLocked(row)"
              class="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
            <i v-else class="fa-solid fa-circle-check me-1"></i>
            <!-- Aprobar -->
          </button>
          <button
            type="button"
            class="btn btn-danger btn-sm"
            @click="verModalRechazar(row)"
            :disabled="isModalCancelLocked(row)"
          >
            <span
              v-if="isModalCancelLocked(row)"
              class="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>
            <i v-else class="fa fa-ban me-11"></i>
            <!-- Rechazar -->
          </button>
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

  <!-- Modales para visualizar el detalle de la cotización -->
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
          v-if="
            datosModalCotizacionDetalle &&
            datosModalCotizacionSegmento &&
            datosModalCotizacionDetalle.id
          "
          :infoReserva="datosModalCotizacionDetalle"
          :segmento="datosModalCotizacionSegmento"
        >
        </VerCotizacionDetalleReservaComponent>
      </div>
    </div>
  </div>

  <!-- Modal de aprobación de reservas -->
  <div
    class="modal"
    id="modal-cotizacion-reserva"
    tabindex="-1"
    aria-labelledby="modal-cotizacion-reserva"
    aria-hidden="true"
    ref="verDetalleCotizacionAprobacionModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <verCotizacionAprobacionReservaComponent
          v-if="dataModalReserva && dataModalReserva.reserva"
          :reserva="dataModalReserva"
          @closeModalAprobacionReserva="closeModalAprobacionReserva()"
        >
        </verCotizacionAprobacionReservaComponent>
      </div>
    </div>
  </div>

  <!-- Moda de rechazo de reservas -->
  <div
    class="modal"
    id="modal-rechazo-reserva"
    tabindex="-1"
    aria-labelledby="modal-rechazo-reserva"
    aria-hidden="true"
    ref="verModalRechazarReservaModal"
  >
    <div class="modal-dialog modal-md modal-dialog-centered">
      <div class="modal-content">
        <verCotizacionReservaRechazarModal
          v-if="dataRechazoModal && dataRechazoModal.reserva"
          :reserva="dataRechazoModal"
          @closeModalRechazarReserva="closeModalRechazarReserva()"
        >
        </verCotizacionReservaRechazarModal>
      </div>
    </div>
  </div>

  <!-- Modal para generar facturas a demanda -->
  <div
    class="modal"
    id="modal-uso-reserva"
    tabindex="-1"
    aria-labelledby="modal-uso-reserva"
    aria-hidden="false"
    ref="verUsoFacturaDemandaModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <verUsoFacturaDemandaComponent
          v-if="dataModal"
          :reserva="dataModal"
          @closeModalUsoFacturaDemanda="closeModalUsoFacturaDemanda()"
        >
        </verUsoFacturaDemandaComponent>
      </div>
    </div>
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
</template>
