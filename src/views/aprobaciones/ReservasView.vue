<script setup>
import {
  onMounted,
  watch,
  computed,
  reactive,
  ref,
  nextTick,
  onBeforeUnmount,
} from "vue";
import { Modal } from "bootstrap";
import BaseTable from "@/components/BaseTable.vue";
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
} from "@/functions/swal-alert.js";
import { useQuotationReserveRequests } from "@/composables/aprobaciones/reservas/useQuotationReserveRequests";
import { useApprovalsGridRefresh } from "@/composables/aprobaciones/reservas/useApprovalsGridRefresh";
import { useQuotationReserveApproval } from "@/composables/aprobaciones/reservas/useQuotationReserveApproval";
import VerCotizacionDetalleReservaComponent from "@/views/aprobaciones/modals/VerCotizacionDetalleReservaModal.vue";
import verCotizacionAprobacionReservaComponent from "@/views/aprobaciones/modals/verCotizacionAprobacionReservaModal.vue";
import verCotizacionReservaRechazarModal from "@/views/aprobaciones/modals/verCotizacionReservaRechazarModal.vue";
import verUsoFacturaDemandaComponent from "@/views/ventas/reservas/modal/verUsoFacturaDemandaModal.vue";

import { formatPriceJm, formatJm } from "@/functions";
const { columns, table, refresh, fetchReservationRequests, onSort, estadoClass,
  totalClass } =
  useQuotationReserveRequests();

const {
  fetchQuotationWithDetial,
  fetchQuotationWithDetialAndStock,
  loadingDeny,
  fetchQuotationWithDetialAndStockActive
} = useQuotationReserveApproval();





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
async function visualizarDetalleCotización(id) {
  if (lockedIds.value.has(id)) return;
  lockedIds.value.add(id);
  lockedIds.value = new Set(lockedIds.value);
  try {
    const response = await fetchQuotationWithDetial(id);
    if (response) {
      verCotizacionDetalleModalObj.show();
      datosModalCotizacionDetalle.value = response.cotizacion;
      datosModalCotizacionSegmento.value = response.segmento;
    }
  } catch (error) {
    return;
  } finally {
    lockedIds.value.delete(id);
    lockedIds.value = new Set(lockedIds.value); // 🔓 re-habilita esa fila
  }
}

/** manejo del modal para la aprobación */

const modalLocks = ref(new Map());
const isModalLocked = (modalRow) => {
  const id = typeof modalRow === "object" ? modalRow?.id : modalRow;
  return modalLocks.value.get(String(id)) === true;
}

function lockModal(id) {
  const m = new Map(modalLocks.value)
  m.set(String(id), true)
  modalLocks.value = m;
}

function unLockedModal(id) {
  const m = new Map(modalLocks.value)
  m.delete(String(id))
  modalLocks.value = m
}

let verDetalleCotizacionAprobacionModal = ref(null);
let verDetalleCotizacionAprobacionModalObj = null;
let datosModalCotizacionAprobacion = ref(null);
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

async function closeModalAprobacionReserva() {
  verDetalleCotizacionAprobacionModalObj.hide();
  datosModalCotizacionAprobacion.value = null;
  refresh();
}

// modal aprobacion  reserva
async function openModalAprobacionReserva(row) {
  if (!row || row.id === null) return
  const id = row.id
  if (isModalLocked(id)) return

  try {
    lockModal(id);
    const response = await fetchQuotationWithDetialAndStock(row.id);
    if (response) {
      datosModalCotizacionAprobacion.value = response;
      verDetalleCotizacionAprobacionModalObj.show();
    }
    unLockedModal(id);
  } catch (error) {
    swalError(error.response.data.error);
  }
  finally {
    unLockedModal(id);
  }
}

// modal de aprobacion a factura demanda
async function openModalAprobacionFacturaDemanda(row) {
  if (!row || row.id === null) return
  const id = row.id
  if (isModalLocked(id)) return
  try {
    lockModal(id);
    const response = await fetchQuotationWithDetialAndStockActive(row.id);
    if (response) {
      dataModal.value = response;
      verUsoFacturaDemandaModalObj.show();
    }
    unLockedModal(id);
  } catch (e) {
    swalError(e?.response?.data?.error || e?.message || 'Error')
  }
  finally {
    unLockedModal(id);
  }
}

async function closeModalUsoFacturaDemanda() {
  verUsoFacturaDemandaModalObj.hide();
  dataModal.value = null;
  refresh();
}


/** rechazo de reservca */
let verModalRechazarReservaModal = ref(null);
let verModalRechazarReservaModalObj = null;

async function verModalRechazar(row) {
  try {
    const response = await fetchQuotationWithDetialAndStock(row.id);
    if (response) {
      datosModalCotizacionAprobacion.value = response;
      verModalRechazarReservaModalObj.show();
    }
  } catch (error) {
    swalError(error.response.data.error);
  }
}

async function closeModalRechazarReserva() {
  verModalRechazarReservaModalObj.hide();
  datosModalCotizacionAprobacion.value = null;
  refresh();
}

function ensureModals() {
  verCotizacionDetalleModalObj = new Modal(verCotizacionDetalleModal.value);
  verModalRechazarReservaModalObj = new Modal(verModalRechazarReservaModal.value);
  verDetalleCotizacionAprobacionModalObj = new Modal(
    verDetalleCotizacionAprobacionModal.value
  );
  verUsoFacturaDemandaModalObj = new Modal(verUsoFacturaDemandaModal.value);

}


/* ---- SOCKET: approvals ---- */
let stopGridSocket

onMounted(async () => {

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
  })

});
onBeforeUnmount(() => {
  stopGridSocket?.()
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
    <BaseBlock title="Aprobaciones Reservas" rounded themed>
      <template #options>
        <div class="block-options-item">
          <button class="btn btn-outline-success btn-sm" @click="refresh" :disabled="table.loading" title="Refrescar"
            aria-label="Refrescar">
            <i v-if="!table.loading" class="fa fa-refresh"></i>
            <span v-else class="spinner-border spinner-border-sm"></span>
          </button>
        </div>
      </template>
      <div class="row justify-content-between align-items-center mb-3">
        <div class="col-md-1">
          <select v-model="table.perPage" class="form-select">
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </div>
        <div class="col-md-4">
          <input v-model="table.searchTerm" placeholder="Buscar..." class="form-control" />
        </div>
      </div>
      <BaseTable :columns="columns" :data="table.items" :loading="table.loading" :perPage="table.perPage"
        :totalItems="table.totalItems" :currentPage="table.currentPage" :totalPage="table.totalPage"
        :sortField="table.sortField" :sortOrder="table.sortOrder" @onSort="onSort"
        @onPageChange="fetchReservationRequests" @onSearch="table.searchTerm" @onClick="handleClick"
        :is-row-disabled="isRowDisabled">
        <!-- Slot específico para la columna 'estado' -->
        <template #cell-st_solResInv="{ value, row }">
          <span :class="estadoClass(value)">{{
            row.st_solResInv ?? "N/A"
          }}</span>
        </template>
        <template #cell-total="{ value, row }">
          <span :class="totalClass(value)"> ${{ formatPriceJm(row.total) ?? "N/A" }}</span>
        </template>
        <template #actions="{ row }">
          <button type="button" class="btn btn-primary btn-sm mx-1" aria-placeholder="Aprobar"
            @click="verModalAprobacionReserva(row)" :disabled="isModalLocked(row)">
            <span v-if="isModalLocked(row)" class="spinner-border spinner-border-sm" role="status"
              aria-hidden="true"></span>
            <i v-else class="fa-solid fa-circle-check me-1"></i>
            <!-- Aprobar -->
          </button>
          <button type="button" class="btn btn-danger btn-sm" aria-placeholder="Rechazar" @click="verModalRechazar(row)"
            :disabled="loadingDeny">
            <i class="fa-regular fa-circle-xmark me-11"></i>
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
  <div class="modal" id="modal-cotizacion-detalle" tabindex="-1" role="dialog"
    aria-labelledby="modal-cotizacion-detalle" aria-hidden="true" ref="verCotizacionDetalleModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <VerCotizacionDetalleReservaComponent v-if="datosModalCotizacionDetalle &&
          datosModalCotizacionSegmento &&
          datosModalCotizacionDetalle.id" :infoCotizacion="datosModalCotizacionDetalle"
          :segmento="datosModalCotizacionSegmento">
        </VerCotizacionDetalleReservaComponent>
      </div>
    </div>
  </div>

  <!-- Modal de aprobación de reservas -->
  <div class="modal" id="modal-cotizacion-reserva" tabindex="-1" role="dialog"
    aria-labelledby="modal-cotizacion-reserva" aria-hidden="true" ref="verDetalleCotizacionAprobacionModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <verCotizacionAprobacionReservaComponent v-if="datosModalCotizacionAprobacion"
          :infoCotizacion="datosModalCotizacionAprobacion" @closeModalAprobacionReserva="closeModalAprobacionReserva()">
        </verCotizacionAprobacionReservaComponent>
      </div>
    </div>
  </div>


  <!-- Moda de rechazo de reservas -->
  <div class="modal" id="modal-rechazo-reserva" tabindex="-1" role="dialog" aria-labelledby="modal-rechazo-reserva"
    aria-hidden="true" ref="verModalRechazarReservaModal">
    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <verCotizacionReservaRechazarModal v-if="datosModalCotizacionAprobacion"
          :infoCotizacion="datosModalCotizacionAprobacion" @closeModalRechazarReserva="closeModalRechazarReserva()">
        </verCotizacionReservaRechazarModal>
      </div>
    </div>
  </div>


  <!-- Modal para generar facturas a demanda -->
  <div class="modal" id="modal-uso-reserva" tabindex="-1" role="dialog" aria-labelledby="modal-uso-reserva"
    aria-hidden="false" ref="verUsoFacturaDemandaModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <verUsoFacturaDemandaComponent v-if="dataModal" :reserva="dataModal"
          @closeModalUsoFacturaDemanda="closeModalUsoFacturaDemanda()">
        </verUsoFacturaDemandaComponent>
      </div>
    </div>
  </div>

</template>