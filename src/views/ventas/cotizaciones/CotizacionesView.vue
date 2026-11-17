<template>
  <!-- Hero -->
  <BasePageHeading title="Cotizaciones">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Ventas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Cotizaciones</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <BaseBlock
      title="Cotizaciones"
      content-full
    >
      <template #options>
        <div class="block-options-item">
          <button
            class="btn btn-outline-primary btn-sm"
            @click="refresh"
            :disabled="table.loading"
            title="Restablecer filtros y refrescar"
            aria-label="Restablecer filtros y refrescar"
          >
            <i v-if="!table.loading" class="fa fa-refresh"></i>
            <span v-else class="spinner-border spinner-border-sm"></span>
          </button>
        </div>
      </template>
      <div class="row g-3 align-items-end px-2 pt-2 pb-1 mb-4">
        <div class="col-12 col-lg-4">
          <small class="text-muted d-block mb-1">Fecha</small>
          <div class="d-flex align-items-center gap-1">
            <flat-pickr
              id="fecha_desde"
              v-model="table.filters.fecha_desde"
              :config="flatPickrState.fecha_desde"
              class="form-control form-control-sm"
              aria-label="Fecha desde"
            />
            <span class="text-muted">—</span>
            <flat-pickr
              id="fecha_hasta"
              v-model="table.filters.fecha_hasta"
              :config="flatPickrState.fecha_hasta"
              class="form-control form-control-sm"
              aria-label="Fecha hasta"
            />
            <button
              class="btn btn-sm btn-outline-secondary"
              @click="clearDates"
              title="Limpiar fechas"
              aria-label="Limpiar fechas"
            >
              <i class="fa fa-eraser"></i>
            </button>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-3">
          <label for="cot" class="text-muted d-block mb-1 small"
            >Cotización</label
          >
          <input
            id="cot"
            v-model="table.filters.cotizacion_filtro"
            type="text"
            maxlength="100"
            class="form-control form-control-sm"
          />
        </div>
        <div class="col-12 col-sm-6 col-lg-2">
          <label for="estado-cotizacion" class="text-muted d-block mb-1 small"
            >Estado</label
          >
          <select
            id="estado-cotizacion"
            v-model="table.filters.estado"
            class="form-select form-select-sm"
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
      <div class="row justify-content-between align-items-center mb-3">
        <div class="col-md-1">
          <select
            v-model="table.filters.perPage"
            class="form-select form-select-sm"
            aria-label="Cotizaciones por página"
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
            class="form-control form-control-sm"
            placeholder="Buscar..."
            aria-label="Buscar cotizaciones"
            maxlength="150"
          />
        </div>
      </div>
      <div v-if="printError" class="alert alert-danger" role="alert">
        {{ printError }}
      </div>
      <BaseTable
        :processing="printing || checkingReserve"
        :columns="columns"
        :data="table.items"
        :loading="table.loading"
        :error="table.error"
        retryable
        :total-items="table.totalItems"
        :current-page="table.currentPage"
        :total-page="table.totalPage"
        :per-page="table.filters.perPage"
        sortable
        :sort-field="table.filters.sortField"
        :sort-order="table.filters.sortOrder"
        @on-sort="onSort"
        @on-page-change="fetchList"
        @on-retry="fetchList()"
      >
        <template #cell-cotizacion="{ row }">
          <a href="javascript:void(0);" @click="funcionvercotizacion(row)">{{
            row.cotizacion
          }}</a>
        </template>
        <template #cell-CLI_RAZON_SOCIAL="{ row }">
          {{ row.CLI_RAZON_SOCIAL }}
        </template>
        <template #cell-CLI_RUC="{ row }">
          {{ row.CLI_RUC }}
        </template>
        <template #cell-USERID="{ row }">
          {{ row.USERID }}
        </template>
        <template #cell-COND_ID="{ row }">
          {{ row.COND_ID }}
        </template>
        <template #cell-created_at="{ row }">
          {{ row.created_at }}
        </template>
        <template #cell-total="{ row }">
          ${{ format(parseFloat(row.total)) }}
        </template>
        <template #cell-estado="{ row }">
          <span style="font-size: 12px" v-if="row.prospecto_id && !row.cliente_id"
            :class="estadoClass(esEstado(row, 'procesado') ? 'procesado' : 'prospecto')">
            {{ esEstado(row, 'procesado') ? 'Procesado' : 'Prospecto' }}
          </span>
          <a style="font-size: 12px" v-else-if="esEstado(row, 'espera')" href="javascript:void(0)"
            :class="estadoClass(row.estado)" @click="motivoEspera(row)">
            {{ estadoLabel(row) }}
          </a>
          <span style="font-size: 12px" v-else
            :class="[estadoClass(row.estado), { pointer: esEstado(row, 'rechazado') && !!row.aprobado_comercial_mensaje }]"
            @click="handleEstadoClick(row)">
            {{ estadoLabel(row) }}
          </span>
        </template>
        <template #cell-venta="{ row }">
          <span style="font-size: 12px"
            class="mx-1"
            :class="getReminderClass(row)"
            @click="row.recordatorioventa == 0 ? showModalNoVenta(row) : ''"
          >
            {{ row.recordatorioventa == 1 ? "Si" : "No" }}
          </span>
        </template>
        <template #actions="{ row }"
          ><div class="text-end text-nowrap">
            <template v-if="row.prospecto_id && !row.cliente_id">
              <button
                type="button"
                class="btn btn-sm btn-alt-secondary"
                :id="`prospect-options-${row.id}`"
                data-bs-toggle="dropdown"
                aria-label="Acciones de cotización de prospecto"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i class="fa fa-fw fa-ellipsis-v"></i>
              </button>
              <ul
                class="dropdown-menu dropdown-menu-end shadow-sm"
                :aria-labelledby="`prospect-options-${row.id}`"
              >
                <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">
                  Exportar
                </li>
                <li>
                  <button
                    type="button"
                    class="dropdown-item d-flex align-items-center gap-2 py-2"
                    @click="printQuotation(row, 'prospect')"
                  >
                    <i class="fa-solid fa-file-pdf fa-fw"></i>
                    <span>Cotización PDF</span>
                  </button>
                </li>
                <li class="dropdown-divider my-2"></li>
                <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">
                  Gestión
                </li>
                <li v-if="row.estado != 'procesado'">
                  <button
                    type="button"
                    class="dropdown-item d-flex align-items-center gap-2 py-2"
                    @click="recuperarcotizacionprospecto(row)"
                  >
                    <i class="fa-solid fa-rotate-left fa-fw"></i>
                    <span>Recuperar</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="dropdown-item d-flex align-items-center gap-2 py-2"
                    @click="levantarcliente(row)"
                  >
                    <i class="fa-regular fa-clone fa-fw"></i>
                    <span>Copiar</span>
                  </button>
                </li>
              </ul> </template
            ><template v-else>
              <!-- dropdown -->
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
                <!-- exportaciones -->
                <template
                  v-if="
                    row.imprimir === 'yes' &&
                    !['caducado', 'borrador_app'].includes(row.estado)
                  "
                >
                  <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">
                    Exportar
                  </li>

                  <!-- imprimir cotizacion sin imagenes -->
                  <li>
                    <button
                      class="dropdown-item d-flex align-items-center gap-2 py-2"
                      @click="printQuotation(row)"
                    >
                      <i class="fa-solid fa-file-pdf fa-fw"></i>
                      <span>Cotización PDF</span>
                    </button>
                  </li>

                  <!-- imprimir cotizaciones con imagenes -->
                  <li>
                    <button
                      class="dropdown-item d-flex align-items-center gap-2 py-2"
                      @click="printQuotation(row, 'images')"
                    >
                      <i class="fa-solid fa-file-image fa-fw"></i>
                      <span>Cotización (Img)</span>
                    </button>
                  </li>
                  <li class="dropdown-divider my-2"></li>
                </template>
                <!-- gestios de cotizaciones -->
                <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">
                  Gestión
                </li>

                <!-- recuperar cotizacion -->
                <li
                  v-if="row.recuperar == 'yes' && canVolverAPedir(row.estado)"
                >
                  <button
                    class="dropdown-item d-flex align-items-center gap-2 py-2"
                    @click="recuperarcotizacion(row)"
                  >
                    <i class="fa-solid fa-rotate-left fa-fw"></i>
                    <span>Recuperar</span>
                  </button>
                </li>

                <!-- volver a pedir  -->
                <li>
                  <button
                    class="dropdown-item d-flex align-items-center gap-2 py-2"
                    @click="volverapedir(row)"
                  >
                    <i class="fa-solid fa-cart-plus fa-fw"></i>
                    <span>Volver a pedir</span>
                  </button>
                </li>

                <!-- copiar cotizacion  -->
                <li>
                  <button
                    class="dropdown-item d-flex align-items-center gap-2 py-2"
                    @click="levantarcliente(row)"
                  >
                    <i class="fa-regular fa-clone fa-fw"></i>
                    <span>Copiar</span>
                  </button>
                </li>

                <!-- solicitud de reserva -->
                <li v-if="['espera', 'aprobado'].includes(row.estado)">
                  <button
                    class="dropdown-item d-flex align-items-center gap-2 py-2"
                    @click="verModalReserva(row)"
                  >
                    <i class="fa-solid fa-calendar-check fa-fw"></i>
                    <span>Solicitar Reserva</span>
                  </button>
                </li>

                <!-- rechazar una cotizacion en estado espera -->
                <li v-if="row.estado === 'espera'">
                  <div class="dropdown-divider my-2"></div>
                  <button
                    class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                    :disabled="loadingChange"
                    @click="rechazarCotizacionEstadoEspera(row.id)"
                  >
                    <i class="fa-solid fa-ban fa-fw"></i>
                    <span class="fw-semibold">Rechazar</span>
                  </button>
                </li>
              </ul>

              <!-- dropdown -->
            </template>
          </div></template
        >
      </BaseTable>
    </BaseBlock>
  </div>
  <!-- END Page Content -->

  <BaseModal
    id="modal-cotizacion"
    ref="vercotizacionModal"
    title="Detalle de cotización"
    :busy="detail.saving"
    body-class="p-0"
    @hidden="clearDetail"
  >
    <div v-if="detail.loading" class="text-center p-4" role="status">
      <span class="spinner-border text-primary"></span
      ><span class="visually-hidden">Cargando cotización...</span>
    </div>
    <div v-else-if="detail.error" class="alert alert-danger m-3" role="alert">
      {{ detail.error }}
      <button
        class="btn btn-sm btn-primary ms-2"
        @click="loadDetail(detail.id)"
      >
        Reintentar
      </button>
    </div>
    <VerCotizacionModal
      v-else-if="detail.data"
      :vercotizacion="detail.data.cabecera"
      :detail-data="detail.data"
      :saving="detail.saving"
      @update:vercotizacion="Object.assign(detail.data.cabecera, $event)"
      @save="saveNotes"
    />
    <div v-if="detail.saveError" class="alert alert-danger m-3" role="alert">
      {{ detail.saveError }}
      <button
        class="btn btn-sm btn-primary ms-2"
        :disabled="detail.saving"
        @click="saveNotes"
      >
        Reintentar
      </button>
    </div>
  </BaseModal>

  <!-- Modal de levantar cliente -->
  <div
    class="modal"
    id="modal-levantar-cliente"
    tabindex="-1"
    aria-labelledby="modal-levantar-cliente"
    aria-hidden="true"
    ref="levantarClienteModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <LevantarClienteModal
          :verpedido="vercotizacion"
          :tipo="tipo"
        ></LevantarClienteModal>
      </div>
    </div>
  </div>

  <!-- modal de no venta -->
  <div
    class="modal"
    id="modal-noventa"
    tabindex="-1"
    aria-labelledby="modal-noventa"
    aria-hidden="true"
    ref="verNoVentaModal"
  >
    <div class="modal-dialog modal-md modal-dialog-centered">
      <div class="modal-content">
        <VerNoVentaModalComponent
          v-if="datosModalNoVenta && datosModalNoVenta.id"
          :vercotizacion="datosModalNoVenta"
          @actualizarEstado="llenarcotizaciones()"
        ></VerNoVentaModalComponent>
      </div>
    </div>
  </div>

  <!-- Modal de reserva -->
  <div
    class="modal"
    id="modal-reserva"
    tabindex="-1"
    aria-labelledby="modal-reserva"
    aria-hidden="true"
    ref="verReservaModal"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <VerSolicitudReservaModalComponent
          v-if="datosModalReserva && datosModalReserva.cotizacion_id"
          :datosReserva="datosModalReserva"
          @modalReservaHide="modalReservaHide()"
        ></VerSolicitudReservaModalComponent>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, onMounted, nextTick, watch } from "vue";
import { useStore } from "vuex";
import { useRoute, useRouter } from "vue-router";
import { Modal } from "bootstrap";
import {
  swalSuccess,
  swalWarning,
  swalError,
} from "@/functions/swal-alert.js";
import BaseTable from "@/components/BaseTable.vue";
import BaseModal from "@/components/BaseModal.vue";
import { useQuotationsTable } from "@/composables/venta/cotizaciones/useQuotationsTable";
import { useQuotationDetail } from "@/composables/venta/cotizaciones/useQuotationDetail";
import VerCotizacionModal from "../modals/VerCotizacionModal.vue";
import LevantarClienteModal from "../modals/LevantarCliente.vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { format } from "@/functions";
import VerNoVentaModalComponent from "./modals/verNoVentaModal.vue";
import { useMotivosStore } from "@/stores/cotizaciones/useMotivosStore";
import { useTipoReservasStore } from "@/stores/cotizaciones/reservas/useTipoReservasStore";
import { usePuntosVentaReservaLimits } from "@/stores/cotizaciones/reservas/usePuntosVentaReservaLimits";
import VerSolicitudReservaModalComponent from "@/views/ventas/cotizaciones/modals/verSolicitudReservaModal.vue";
import { useQuotationActions } from "@/composables/venta/cotizaciones/useQuotationActions";
import { useUpdateQuotationStatus } from "@/composables/aprobaciones/cotizaciones/useUpdateQuotationStatus";
import {
  useQuotationReserveRequestSale,
  validateReserveDispatch,
} from "@/composables/venta/cotizaciones/reservas/useQuotationReserveRequestSale";
import { useQuotationPrint } from "@/composables/venta/cotizaciones/useQuotationPrint";
import { useQuoteProspectActions } from "@/composables/venta/cotizaciones/prospecto/useQuoteProspectActions.js";
const { loadingChange, changeStatusQuoteBeenWaiting } =
  useUpdateQuotationStatus();
const motivoStore = useMotivosStore();
const tipoReservasStore = useTipoReservasStore();
const puntosVentaReservaLimitsStore = usePuntosVentaReservaLimits();
const { checkingReserve, canManageQuotation, recoverQuotation: recuperarcotizacion, reorderQuotation: volverapedir } = useQuotationActions();
const { verifyStockBeforeRequestReserve } = useQuotationReserveRequestSale();
//** imports pra nuevos procesos */
import { useCustomerCreate } from "@/composables/venta/cliente/useCustomerCreate";

// const motivoStore = useMotivosStore()

const {
  //validacion de existencia de ruc
  // loadingValidateIdentification,
  validateIdentification,
  //validacion de existencia de ruc prospecto
  // loadingValidateProspectIdentification,
  // validateProspectIdentification,
} = useCustomerCreate();

const {
  //carga de prospecto
  // loadingRestoreProspect,
  restoreProspect,
} = useQuoteProspectActions();

const flatPickrState = reactive({
  fecha_desde: {
    maxDate: Date.now(),
    locale: Spanish,
  },
  fecha_hasta: {
    maxDate: Date.now(),
    locale: Spanish,
  },
});
const store = useStore();
const router = useRouter();
const route = useRoute();
const vercotizacion = ref({});
const tipo = ref(null);

function queryValue(value) {
  return Array.isArray(value) ? value[0] : value;
}

function hasQueryParam(key) {
  return Object.prototype.hasOwnProperty.call(route.query, key);
}

function samePuntoVentaCode(a, b) {
  const left = String(a ?? "").trim();
  const right = String(b ?? "").trim();
  if (!left || !right) return false;
  if (left === right) return true;

  const leftNumber = Number(left);
  const rightNumber = Number(right);
  return (
    Number.isFinite(leftNumber) &&
    Number.isFinite(rightNumber) &&
    leftNumber === rightNumber
  );
}

function findRoutePuntoVenta() {
  const puntos = Array.isArray(store.state.puntosdeventa)
    ? store.state.puntosdeventa
    : [];
  const pvCodigo = queryValue(route.query.pvCodigo);
  const pvId = queryValue(route.query.pvId);

  if (pvId) {
    const byId = puntos.find((punto) => String(punto.id) === String(pvId));
    if (byId) return byId;
  }

  if (pvCodigo) {
    return (
      puntos.find((punto) => samePuntoVentaCode(punto.PTO_VTA_ID, pvCodigo)) ??
      null
    );
  }

  return null;
}

function getRoutePuntoVentaId() {
  const puntoVenta = findRoutePuntoVenta();
  if (puntoVenta?.id) return puntoVenta.id;

  const pvId = queryValue(route.query.pvId);
  if (pvId) return Number(pvId);

  const pvCodigo = queryValue(route.query.pvCodigo);
  if (pvCodigo && !samePuntoVentaCode(pvCodigo, store.state.puntodeventaselect)) return null;
  return store.state.puntoventaselectid;
}

function syncRoutePuntoVenta() {
  const puntoVenta = findRoutePuntoVenta();
  if (!puntoVenta?.PTO_VTA_ID) return;

  const sameCode = samePuntoVentaCode(
    store.state.puntodeventaselect,
    puntoVenta.PTO_VTA_ID
  );
  const sameId =
    !puntoVenta.id ||
    String(store.state.puntoventaselectid ?? "") === String(puntoVenta.id);

  if (sameCode && sameId) {
    return;
  }

  sessionStorage.setItem("CURRENTCLIENTE", null);
  sessionStorage.setItem("CURRENTSUCURSAL", null);
  sessionStorage.setItem("PTO_ANTERIOR", store.state.puntodeventaselect);
  sessionStorage.setItem("PUNTODEVENTASELECT", puntoVenta.PTO_VTA_ID);

  if (puntoVenta.id) {
    sessionStorage.setItem("PUNTOVENTASELECTID", puntoVenta.id);
  } else {
    sessionStorage.removeItem("PUNTOVENTASELECTID");
  }

  store.state.currentCliente = null;
  store.state.currentSucursal = null;
  store.state.puntodeventaselect = puntoVenta.PTO_VTA_ID;
  store.state.puntoventaselectid = puntoVenta.id ?? null;
  store.state.bodegas = puntoVenta.bodegas ?? [];
  sessionStorage.setItem("BODEGAS", JSON.stringify(store.state.bodegas));
}

function normalizeRouteStatus(value) {
  const status = String(value ?? "")
    .trim()
    .toLowerCase();
  if (!status) return "";

  if (["procesado", "procesada", "procesados", "procesadas"].includes(status)) {
    return "procesadas";
  }

  if (["caducado", "caducada", "caducados", "caducadas"].includes(status)) {
    return "caducado";
  }

  if (["rechazado", "rechazada", "rechazados", "rechazadas"].includes(status)) {
    return "rechazadas";
  }

  return status === "prospectos" ? "prospectos" : "pendientes";
}

function applyRouteFilters() {
  syncRoutePuntoVenta();

  if (hasQueryParam("cotizacion")) {
    table.filters.cotizacion_filtro =
      queryValue(route.query.cotizacion) || null;
  }

  if (hasQueryParam("estado")) {
    table.filters.estado = normalizeRouteStatus(queryValue(route.query.estado));
  }
}

async function funcionvercotizacion(cotizacion) {
  const loading = loadDetail(cotizacion.id);
  vercotizacionModal.value?.show();
  await loading;
}

let verReservaModal = ref(null);
let verReservaModalObj = null;
let datosModalReserva = ref(null);
async function verModalReserva(row) {
  const dispatchValidation = validateReserveDispatch(row);
  if (dispatchValidation.invalid) {
    swalWarning(dispatchValidation.message);
    return;
  }
  const reserva = row?.reserva ?? null;
  const hasReserva = row?.has_reserva === true || !!reserva;
  if (hasReserva && reserva) {
    swalWarning(
      "Ya se registró una reserva para esta cotización para el día " +
        (reserva?.fe_solicitud_reserva ?? "(sin fecha)")
    );
    return;
  }
  if (
    row.reserva_disabled === true &&
    row.has_l_items !== true &&
    row.has_service_items !== true
  ) {
    swalWarning(
      "No puede realizar la reserva: la cotización no tiene cantidades seleccionadas."
    );
    return;
  }

  /** proceso de verificacion de stock antes de que se abra el modal de reserva */
  const respStock = await verifyStockBeforeRequestReserve(row.id);

  if (
    !respStock?.ok &&
    row.has_l_items == false &&
    row.has_service_items == false
  ) {
    swalWarning(
      respStock.message ||
        "No se puede procesar la solicitud de reserva por falta de stock."
    );
    return;
  }

  const payload = {
    cotizacion_id: row.id,
    tipo_despacho_id: row.tipo_despacho_id,
    cotizacion: row.cotizacion,
    pto_venta: row.BOD_BODEGA,
    PTO_VTA_ID: row.PTO_VTA_ID,
    razon_social: row.CLI_RAZON_SOCIAL,
    fecha: row.created_at,
    total: row.total,
    has_l_items: row.has_l_items ?? null,
    has_service_items: row.has_service_items ?? null,
    has_duplicate_items: row.has_duplicate_items ?? null,
  };

  datosModalReserva.value = payload;
  await nextTick();
  verReservaModalObj?.show();
}

async function modalReservaHide() {
  verReservaModalObj?.hide();
  datosModalReserva.value = null;
  llenarcotizaciones();
}

function motivoEspera(cotizacion) {
  let msg = "La cotización requiere ";
  if (cotizacion.requiere_aprobacion_comercial === "yes") {
    msg += "aprobación comercial ";
  }
  if (
    cotizacion.requiere_aprobacion_comercial === "yes" &&
    cotizacion.requiere_aprobacion_crediticia === "yes"
  ) {
    msg += "y ";
  }
  if (cotizacion.requiere_aprobacion_crediticia === "yes") {
    msg += "aprobación crediticia";
  }
  swalWarning(msg);
}

const { printing, printError, printQuotation } =
  useQuotationPrint(llenarcotizaciones);
const vercotizacionModal = ref(null);
const {
  detail,
  load: loadDetail,
  clear: clearDetail,
  saveNotes,
} = useQuotationDetail();
const {
  table,
  columns,
  listStatus,
  listPerpage,
  fetchList,
  onSort,
  refresh,
  clearDates,
  estadoClass,
  getReminderClass,
} = useQuotationsTable(getRoutePuntoVentaId);
function llenarcotizaciones() {
  return fetchList();
}

const infoProspecto = reactive({
  prospecto: null,
  cotizacion_id: null,
  tipo: null,
});
async function recuperarcotizacionprospecto(cotizacion) {
  const respRes = await validateIdentification(cotizacion.CLI_RUC);
  if (!respRes.ok) {
    swalWarning(respRes.message);
    if (respRes.raw?.isAxiosError || respRes.canceled) return;
    await recuperarcotizacion(cotizacion);
    return;
  }
  const respRestore = await restoreProspect(cotizacion.CLI_RUC);
  if (!respRestore?.ok) {
    swalWarning(respRestore?.message || "No se pudo recuperar el prospecto.");
    return;
  }
  infoProspecto.prospecto = respRestore?.data ?? null;
  infoProspecto.cotizacion_id = cotizacion?.id ?? null;
  infoProspecto.tipo = "prospecto";
  await router.push({
    name: "ventas-crearcliente",
    query: {
      tipo: "prospecto",
      documento: cotizacion.CLI_RUC,
      cotizacion_id: cotizacion.id,
      cotizacion: cotizacion.cotizacion,
    },
    state: { infoProspecto: JSON.parse(JSON.stringify(infoProspecto)) },
  });
}

async function levantarcliente(pedido) {
  if (!await canManageQuotation(pedido)) return;

  levantarClienteModalObj.show();
  vercotizacion.value = pedido;
  tipo.value = "cotizacion";
}

let levantarClienteModal = ref(null);
let levantarClienteModalObj = null;

let verNoVentaModal = ref(null);
let verNoVentaModalObj = null;
let datosModalNoVenta = ref({});

function showModalNoVenta(row) {
  datosModalNoVenta.value = null; // 🔄 reset para forzar reactividad
  nextTick(() => {
    datosModalNoVenta.value = {
      id: row.id,
      motivo_id: row.cotizacion_venta_motivo_id,
      recordar: row.recordar,
      observacion: row.observacion,
      fecha_recordatorio: row.fecha_recordatorio,
      cotizacion: row.cotizacion,
    };
    nextTick(() => {
      verNoVentaModalObj?.show();
    });
  });
}

onMounted(() => {
  applyRouteFilters();
  llenarcotizaciones();

  verReservaModalObj = new Modal(verReservaModal.value);
  levantarClienteModalObj = new Modal(levantarClienteModal.value);
  verNoVentaModalObj = new Modal(verNoVentaModal.value);
  if (motivoStore.motivos.length == 0) {
    motivoStore.fetchMotivos();
  }
  if (tipoReservasStore.tipoReservas.length == 0) {
    tipoReservasStore.fetchListTypeReserved();
  }

  if (puntosVentaReservaLimitsStore.puntosVentaReservaLimits.length == 0) {
    puntosVentaReservaLimitsStore.fetchPuntosVentaReservaLimits();
  }
});

watch(
  () => route.query,
  () => {
    applyRouteFilters();
    llenarcotizaciones();
  },
  { flush: "post" }
);

async function rechazarCotizacionEstadoEspera(id) {
  const res = await changeStatusQuoteBeenWaiting(id);
  if (!res?.ok) {
    return swalError("No se pudo rechazar la cotización");
  }
  swalSuccess("Cotización rechazada");
  llenarcotizaciones();
}

const BLOCKED_VOLVER_A_PEDIR_STATUSES = ["procesado", "caducado"];
const canVolverAPedir = (estado) => {
  return !BLOCKED_VOLVER_A_PEDIR_STATUSES.includes(estado);
};

function normalizarEstados(estado) {
  return String(estado ?? "")
    .trim()
    .toLowerCase();
}

function estadoLabel(row) {
  const estado = normalizarEstados(row.estado);
  const labels = {
    borrador_app: "Borrador App Móvil",
    aprobado: "Aprobado",
    rechazado: "Rechazado",
    caducado: "Caducado",
    procesado: "Procesado",
    espera: "Espera",
  };

  return labels[estado] ?? row.estado;
}

function esEstado(row, estadoComparar) {
  return normalizarEstados(row.estado) === normalizarEstados(estadoComparar);
}

function handleEstadoClick(row) {
  const estado = normalizarEstados(row.estado);
  if (estado === "rechazado" && row.aprobado_comercial_mensaje) {
    swalWarning("Motivo de rechazo", row.aprobado_comercial_mensaje);
  }
}
</script>

<style scoped>
/* Alineación de iconos */
.dropdown-menu .dropdown-item i {
  width: 20px;
  /* Un poco más ancho para que todos los iconos se alineen igual */
  text-align: center;
}

</style>
