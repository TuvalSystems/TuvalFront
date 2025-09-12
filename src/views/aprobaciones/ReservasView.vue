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
import { useFetchReservaCotizacion } from "@/composables/aprobaciones/reservas/useFetchReservaCotizacion";
import { useFetchQuotationWitDetail } from "@/composables/aprobaciones/reservas/useFetchQuotationWitDetail";
import VerCotizacionDetalleReservaComponent from "@/views/aprobaciones/modals/VerCotizacionDetalleReservaModal.vue";
import verCotizacionAprobacionReservaComponent from "@/views/aprobaciones/modals/verCotizacionAprobacionReservaModal.vue";
import verCotizacionReservaRechazarModal from "@/views/aprobaciones/modals/verCotizacionReservaRechazarModal.vue";
const { table, refresh, fetchItemsAproval, onSort } =
  useFetchReservaCotizacion();

const {
  fetchQuotationWithDetial,
  fetchQuotationWithDetialAndStock,
  loadingDeny,
} = useFetchQuotationWitDetail();

const columns = [
  {
    label: "Pto. Venta",
    key: "PTO_VTA_DESCRIPCION",
    clickable: false,
    sortable: true,
    render: (value) => value,
    thClass: " text-center",
    tdClass: " text-center",
  },
  {
    label: "Cotizacion",
    key: "cotizacion",
    clickable: true,
    sortable: true,
    thClass: " text-center",
    tdClass: " text-center",
  },
  {
    label: "Fecha",
    key: "created_at",
    clickable: false,
    sortable: true,
    thClass: "d-none d-md-table-cell text-center",
    tdClass: "d-none d-md-table-cell text-center",
  },
  {
    label: "Cliente",
    key: "CLI_RAZON_SOCIAL",
    clickable: false,
    sortable: true,
    thClass: "d-none d-md-table-cell  text-start",
    tdClass: "d-none d-md-table-cell  text-start",
  },
  {
    label: "Total",
    key: "total",
    clickable: false,
    sortable: false,
    render: (value) => value,
    thClass: "text-end",
    tdClass: "text-end",
  },
  {
    label: "Tipo Reserva",
    key: "tipo_reserva",
    clickable: false,
    sortable: true,
    thClass: "d-none d-md-table-cell text-center",
    tdClass: "d-none d-md-table-cell text-center",
  },
  {
    label: "F. Solicitud",
    key: "fe_solResInv",
    clickable: false,
    sortable: true,
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "Estado",
    key: "st_solResInv",
    clickable: false,
    sortable: true,
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "Mult.Bod.",
    key: "tipo_traslado",
    clickable: false,
    sortable: true,
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
  {
    label: "Observacion",
    key: "tx_obsSolResInv",
    clickable: false,
    sortable: true,
    thClass: "d-none d-md-table-cell",
    tdClass: "d-none d-md-table-cell",
  },
];

const estadoClass = (st) => {
  switch (st || "") {
    case "pendiente":
      return "badge bg-dark text-light fw-semibold";
    case "aprobado":
      return "badge bg-success  fw-semibold";
    case "rechazada":
      return "badge bg-danger  fw-semibold";
    case "cancelada":
      return "badge bg-warning  fw-semibold";
    case "facturado":
      return "badge bg-success  fw-semibold";
    default:
      return "badge bg-secondary";
  }
};

const totalClass = (total) => {
  if (total > 0) {
    return "text-end fw-semibold";
  }
  return "text-end fw-semibold";
};

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
      datosModalCotizacionDetalle.value = response.value.cotizacion;
      datosModalCotizacionSegmento.value = response.value.segmento;
    }
  } catch (error) {
    return;
  } finally {
    lockedIds.value.delete(id);
    lockedIds.value = new Set(lockedIds.value); // 🔓 re-habilita esa fila
  }
}

/** manejo del modal para la aprobación */

let verDetalleCotizacionAprobacionModal = ref(null);
let verDetalleCotizacionAprobacionModalObj = null;
let datosModalCotizacionAprobacion = ref(null);
async function verModalAprobacionReserva(row) {
  try {
    const response = await fetchQuotationWithDetialAndStock(row.id);
    if (response) {
      datosModalCotizacionAprobacion.value = response.value;
      verDetalleCotizacionAprobacionModalObj.show();
    }
  } catch (error) {
    swalError(error.response.data.error);
  }
}

async function closeModalAprobacionReserva() {
  verDetalleCotizacionAprobacionModalObj.hide();
  datosModalCotizacionAprobacion.value = null;
  refresh();
}

/** rechazo de reservca */
let verModalRechazarReservaModal = ref(null);
let verModalRechazarReservaModalObj = null;

async function verModalRechazar(row) {
  try {
    const response = await fetchQuotationWithDetialAndStock(row.id);
    if (response) {
      datosModalCotizacionAprobacion.value = response.value;
      verModalRechazarReservaModalObj.show();
    }
  } catch (error) {
    console.log(error);
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
}

onMounted(async () => {
  ensureModals();
  if (!table.items.length && !table.loading) {
    fetchItemsAproval(1);
  }
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
        :sortField="table.sortField" :sortOrder="table.sortOrder" @onSort="onSort" @onPageChange="fetchItemsAproval"
        @onSearch="table.searchTerm" @onClick="handleClick" :is-row-disabled="isRowDisabled">
        <!-- Slot específico para la columna 'estado' -->
        <template #cell-st_solResInv="{ value, row }">
          <span :class="estadoClass(value)">{{
            row.st_solResInv ?? "N/A"
          }}</span>
        </template>
        <template #cell-total="{ value, row }">
          <span :class="totalClass(value)"> ${{ row.total ?? "N/A" }}</span>
        </template>
        <template #actions="{ row }">
          <button type="button" class="btn btn-primary btn-sm mx-1" @click="verModalAprobacionReserva(row)">
            <i class="fa-solid fa-circle-check me-1"></i> Aprobar
          </button>
          <button type="button" class="btn btn-danger btn-sm" @click="verModalRechazar(row)" :disabled="loadingDeny">
            <i class="fa-regular fa-circle-xmark me-11"></i> Rechazar
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
</template>