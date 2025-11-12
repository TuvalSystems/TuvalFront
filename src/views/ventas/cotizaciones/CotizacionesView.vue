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
    <BaseBlock title="Cotizaciones" content-full>
      <template #options>
        <div class="space-x-1">
          <div class="block-options-item">
            <div class="row g-3 align-items-center">
              <div class="col-auto">
                <label for="fecha_desde" class="col-form-label fs-sm">Desde</label>
              </div>
              <div class="col-auto">
                <flat-pickr style="width: 120px" id="fecha_desde" class="form-control form-control-sm"
                  v-model="fecha_desde" :config="flatPickrState.fecha_desde" @change="refrescarFecha()" />
              </div>
              <div class="col-auto">
                <label for="fecha_hasta" class="col-form-label fs-sm">Hasta</label>
              </div>
              <div class="col-auto">
                <flat-pickr style="width: 120px" id="fecha_hasta" class="form-control form-control-sm"
                  v-model="fecha_hasta" :config="flatPickrState.fecha_hasta" @change="refrescarFecha()" />
              </div>
              <div class="col-auto">
                <button class="btn btn-sm btn-primary" @click="limpiarFecha()">
                  <i class="fa fa-eraser"></i> Limpiar fecha
                </button>
              </div>
            </div>
          </div>
          <div class="block-options-item">
            <button type="button" title="Refrescar tabla" @click="llenarcotizaciones('pendientes')"
              class="btn btn-success btn-sm">
              <i class="si si-refresh"></i>
            </button>
          </div>
          <div class="dropdown d-inline-block">
            <button type="button" class="btn btn-sm btn-alt-secondary" id="dropdown-recent-orders-filters"
              data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="fa fa-fw fa-flask"></i>
              Filtrar
              <i class="fa fa-angle-down ms-1"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-md dropdown-menu-end fs-sm"
              aria-labelledby="dropdown-recent-orders-filters">
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarcotizaciones('pendientes')" href="javascript:void(0)">
                Pendientes
              </a>
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarcotizaciones('procesadas')" href="javascript:void(0)">
                Procesadas
              </a>
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarcotizaciones('prospectos')" href="javascript:void(0)">
                Prospectos
              </a>
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarcotizaciones('caducado')" href="javascript:void(0)">
                Caducadas
              </a>
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarcotizaciones('rechazadas')" href="javascript:void(0)">
                Rechazadas
              </a>
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarcotizaciones('todas')" href="javascript:void(0)">
                Todas
              </a>
            </div>
          </div>
        </div>
      </template>
      <Dataset v-slot="{ ds }" :ds-data="cotizaciones.data" :ds-sortby="sortBy" :ds-search-in="[
        'cotizacion',
        'id',
        'CLI_RAZON_SOCIAL',
        'CLI_RUC',
        'USERID',
        'COND_ID',
        'created_at',
      ]">
        <div class="row" :data-page-count="ds.dsPagecount">
          <div id="datasetLength" class="col-md-8 py-2">
            <DatasetShow />
          </div>
          <div class="col-md-4 py-2">
            <DatasetSearch ds-search-placeholder="Buscar..." />
          </div>
        </div>
        <hr />
        <div v-if="cotizaciones.loading" class="text-center">
          <div class="spinner-border text-primary mt-4" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div class="row" v-if="
          vercotizaciones && cotizaciones.data.length && !cotizaciones.loading
        ">
          <div class="col-md-12">
            <div class="table-responsive">
              <table class="table table-sm table-hover table-vcenter mb-0">
                <thead>
                  <tr>
                    <th v-for="(th, index) in cols" :key="th.field" :class="['sort', th.sort]"
                      @click="onSort($event, index)">
                      {{ th.name }} <i class="gg-select float-end"></i>
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <DatasetItem tag="tbody" class="fs-sm">
                  <template #default="{ row }">
                    <tr>
                      <td class="fs-sm">
                        <a href="javascript:void(0);" @click="funcionvercotizacion(row, index)">{{ row.cotizacion }}</a>
                      </td>
                      <td class="fs-sm">
                        {{ row.CLI_RAZON_SOCIAL }}
                      </td>
                      <td class="fs-sm">
                        {{ row.CLI_RUC }}
                      </td>
                      <td class="fs-sm">
                        {{ row.USERID }}
                      </td>
                      <td class="fs-sm">
                        {{ row.COND_ID }}
                      </td>
                      <td class="fs-sm">
                        {{ row.created_at }}
                      </td>
                      <td class="fs-sm text-end">
                        ${{ format(parseFloat(row.total)) }}
                      </td>
                      <td v-if="row.prospecto_id && !row.cliente_id" class="fs-sm">
                        <span v-if="row.estado == 'procesado'"
                          class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill">
                          procesado
                        </span>
                        <span v-else
                          class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-info-light text-info">
                          prospecto
                        </span>
                      </td>
                      <td v-else class="fs-sm">
                        <a v-if="row.estado == 'espera'" href="javascript:void(0)"
                          class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-warning-light text-warning"
                          @click="motivoEspera(row)">
                          {{ row.estado }}
                        </a>
                        <span v-else class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill" :class="row.aprobado_comercial_mensaje ? 'pointer bg-danger-light text-danger' : '' || row.estado == 'aprobado' ? 'bg-success-light text-success'
                          : '' || row.estado == 'rechazado' ? 'bg-danger-light text-danger' : '' || row.estado == 'caducado' ? 'bg-danger-light text-danger'
                            : '' || row.estado == 'procesado' ? 'bg-info-light text-info' : ''"
                          @click="row.estado == 'rechazado' && row.aprobado_comercial_mensaje ? swalWarning('Motivo de rechazo', row.aprobado_comercial_mensaje) : ''">{{
                            row.estado }}
                        </span>
                      </td>
                      <td>
                        <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill mx-1"
                          :class="getReminderClass(row)"
                          @click="row.recordatorioventa == 0 ? showModalNoVenta(row) : ''">
                          {{ row.recordatorioventa == 1 ? "Si" : "No" }}
                        </span>
                      </td>
                      <td v-if="row.prospecto_id && !row.cliente_id" class="fs-sm nowrap text-end">
                        <button type="button" class="btn btn-primary btn-sm mx-2" title="Imprimir Cotización"
                          @click="imprimircotizacionprospecto(row)">
                          <i class="fa fa-print"></i>
                        </button>
                        <button v-if="row.estado != 'procesado'" type="button" class="btn btn-success btn-sm mx-2"
                          title="Recuperar Cotización" @click="recuperarcotizacionprospecto(row)">
                          <i class="fa fa-upload"></i>
                        </button>
                        <button type="button" class="btn btn-info btn-sm mx-1" title="Copiar pedido"
                          @click="levantarcliente(row)">
                          <i class="fa fa-copy"></i>
                        </button>
                      </td>
                      <td v-else class="fs-sm nowrap text-end">
                        <button v-if="
                          row.recuperar == 'yes' &&
                          row.estado != 'caducado' &&
                          row.estado != 'procesado'
                        " type="button" class="btn btn-success btn-sm mx-2" title="Recuperar Cotización"
                          @click="recuperarcotizacion(row)">
                          <i class="fa fa-upload"></i>
                        </button>
                        <button type="button" class="btn btn-warning btn-sm mx-1" title="Volver a pedir"
                          @click="volverapedir(row)">
                          <i class="far fa-copy"></i>
                        </button>
                        <button type="button" class="btn btn-info btn-sm mx-1" title="Copiar pedido"
                          @click="levantarcliente(row)">
                          <i class="fa fa-copy"></i>
                        </button>

                        <button type="button" class="btn btn-dark btn-sm mx-1" title="Solicitar Reserva"
                          @click="verModalReserva(row)">
                          <i class="fa fa fa-box-archive"></i>
                        </button>
                        <button v-if="row.imprimir == 'yes' && row.estado != 'caducado'" type="button"
                          class="btn btn-sm btn-alt-secondary" id="dropOptions" data-bs-toggle="dropdown"
                          aria-haspopup="true" aria-expanded="false">
                          <i class="fa fa-angle-down ms-1"></i>
                        </button>
                        <ul class="dropdown-menu" aria-labelledby="dropOptions">
                          <li>
                            <button v-if="row.imprimir == 'yes' && row.estado != 'caducado'" class="dropdown-item"
                              title="Imprimir Cotización" @click="imprimircotizacion(row)"><i class="fa fa-print"></i>
                              Imprimir
                            </button>
                          </li>
                          <li>
                            <button v-if="row.imprimir == 'yes' && row.estado != 'caducado'" type="button"
                              class="dropdown-item" title="Imprimir Cotización Imágenes"
                              @click="imprimircotizacionimagenes(row)"><i class="fa fa-print"></i>
                              Imprimir (Imagen)</button>
                          </li>
                        </ul>
                      </td>
                    </tr>
                  </template>
                </DatasetItem>
              </table>
            </div>
          </div>
        </div>
        <div class="d-flex flex-md-row flex-column justify-content-between align-items-center">
          <DatasetInfo class="py-3 fs-sm" />
          <DatasetPager class="flex-wrap py-3 fs-sm" />
        </div>
      </Dataset>
    </BaseBlock>
  </div>
  <!-- END Page Content -->

  <!-- Modal de ver cotizacion -->
  <div class="modal" id="modal-cotizacion" tabindex="-1" role="dialog" aria-labelledby="modal-cotizacion"
    aria-hidden="true" ref="vercotizacionModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <VerCotizacionModal :vercotizacion="vercotizacion" :indexCotizacion="indexCotizacion" :tipo="tipo">
        </VerCotizacionModal>
      </div>
    </div>
  </div>

  <!-- Modal de levantar cliente -->
  <div class="modal" id="modal-levantar-cliente" tabindex="-1" role="dialog" aria-labelledby="modal-levantar-cliente"
    aria-hidden="true" ref="levantarClienteModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <LevantarClienteModal :verpedido="vercotizacion" :tipo="tipo"></LevantarClienteModal>
      </div>
    </div>
  </div>

  <!-- modal de no venta -->
  <div class="modal" id="modal-noventa" tabindex="-1" role="dialog" aria-labelledby="modal-noventa" aria-hidden="true"
    ref="verNoVentaModal">
    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <VerNoVentaModalComponent v-if="datosModalNoVenta && datosModalNoVenta.id" :vercotizacion="datosModalNoVenta"
          @actualizarEstado="llenarcotizaciones('pendientes')"></VerNoVentaModalComponent>
      </div>
    </div>
  </div>

  <!-- Modal de reserva -->
  <div class="modal" id="modal-reserva" tabindex="-1" role="dialog" aria-labelledby="modal-reserva" aria-hidden="true"
    ref="verReservaModal">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content">
        <VerSolicitudReservaModalComponent v-if="datosModalReserva && datosModalReserva.cotizacion_id"
          :datosReserva="datosModalReserva" @modalReservaHide="modalReservaHide()"></VerSolicitudReservaModalComponent>
      </div>
    </div>
  </div>



</template>
<script setup>
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import { Modal } from "bootstrap";
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";
import VerCotizacionModal from "../modals/VerCotizacionModal.vue";
import LevantarClienteModal from "../modals/LevantarCliente.vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { formatPrice, format } from "@/functions";
import VerNoVentaModalComponent from "../modals/verNoVentaModal.vue";
import { useMotivosStore } from '@/stores/cotizaciones/useMotivosStore'
import { useTipoReservasStore } from '@/stores/cotizaciones/reservas/useTipoReservasStore'
import { usePuntosVentaReservaLimits } from '@/stores/cotizaciones/reservas/usePuntosVentaReservaLimits'
import VerSolicitudReservaModalComponent from "@/views/ventas/modals/verSolicitudReservaModal.vue";
import { useValidatesReserved } from "@/composables/venta/cotizaciones/reservas/useValidatesReserved";
const motivoStore = useMotivosStore()
const tipoReservasStore = useTipoReservasStore()
const puntosVentaReservaLimitsStore = usePuntosVentaReservaLimits()
const { checkExistingReserve } = useValidatesReserved()

// const motivoStore = useMotivosStore()
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
// Helper variables
const cols = reactive([
  {
    name: "COTIZACION",
    field: "cotizacion",
    sort: "",
  },
  {
    name: "Cliente",
    field: "CLI_RAZON_SOCIAL",
    sort: "",
  },
  {
    name: "RUC",
    field: "CLI_RUC",
    sort: "",
  },
  {
    name: "Usuario",
    field: "USERID",
    sort: "",
  },
  {
    name: "Cond. Pago",
    field: "COND_ID",
    sort: "",
  },
  {
    name: "Fecha/hora",
    field: "created_at",
    sort: "",
  },
  {
    name: "Total",
    field: "total",
    sort: "",
  },
  {
    name: "Estado",
    field: "estado",
    sort: "",
  },
  {
    name: "Facturacion",
    field: "venta",
    sort: "",
  },
]);

// Sort by functionality
const sortBy = computed(() => {
  return cols.reduce((acc, o) => {
    if (o.sort) {
      o.sort === "asc" ? acc.push(o.field) : acc.push("-" + o.field);
    }
    return acc;
  }, []);
});

// On sort th click
function onSort(event, i) {
  let toset;
  const sortEl = cols[i];

  if (!event.shiftKey) {
    cols.forEach((o) => {
      if (o.field !== sortEl.field) {
        o.sort = "";
      }
    });
  }

  if (!sortEl.sort) {
    toset = "asc";
  }

  if (sortEl.sort === "desc") {
    toset = event.shiftKey ? "" : "asc";
  }

  if (sortEl.sort === "asc") {
    toset = "desc";
  }

  sortEl.sort = toset;
}
const templateStore = useTemplateStore();
const store = useStore();
const router = useRouter();
const vercotizacion = ref({});
const indexCotizacion = ref(null);
const tipo = ref(null);
const fecha_desde = ref(null);
const fecha_hasta = ref(null);
const estado_filtro = ref(null);
function limpiarFecha() {
  fecha_desde.value = null;
  fecha_hasta.value = null;
  llenarcotizaciones("pendientes");
}

function refrescarFecha() {
  if (!fecha_desde.value) return;
  if (!fecha_hasta.value) return;

  llenarcotizaciones(estado_filtro.value);
}
async function funcionvercotizacion(cotizacion, index) {
  vercotizacionModalObj.show();
  vercotizacion.value = cotizacion;
  tipo.value = "cotizacion";
  store.dispatch("detallecotizacion", cotizacion);
}



let verReservaModal = ref(null);
let verReservaModalObj = null;
let datosModalReserva = ref(null);
async function verModalReserva(row) {
  const reserva = row?.reserva ?? null;
  const hasReserva = (row?.has_reserva === true) || !!reserva;
  if (hasReserva && reserva) {
    swalWarning(
      'Ya se registró una reserva para esta cotización para el día ' +
      (reserva?.fe_solicitud_reserva ?? '(sin fecha)')
    );
    return;
  }
  if (row.reserva_disabled === true && row.has_l_items !== true && row.has_service_items !== true) {
    swalWarning('No puede realizar la reserva: la cotización no tiene cantidades seleccionadas.')
    return;
  }
  const payload = {
    cotizacion_id: row.id,
    cotizacion: row.cotizacion,
    pto_venta: row.BOD_BODEGA,
    PTO_VTA_ID: row.PTO_VTA_ID,
    razon_social: row.CLI_RAZON_SOCIAL,
    fecha: row.created_at,
    total: row.total,
    has_l_items: row.has_l_items ?? null,
    has_service_items: row.has_service_items ?? null
  };
  // datosModalReserva.value = null;
  // await nextTick();
  datosModalReserva.value = payload;
  await nextTick();
  verReservaModalObj?.show();

}

async function modalReservaHide() {
  verReservaModalObj?.hide();
  datosModalReserva.value = null
  llenarcotizaciones('pendientes');
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

let vercotizacionModal = ref(null);
let vercotizacionModalObj = null;

let errorMsg = ref("");
const cotizaciones = computed(() => store.state.cotizaciones);
const vercotizaciones = ref(false);

llenarcotizaciones("pendientes");

async function llenarcotizaciones(estado) {
  estado_filtro.value = estado;
  const consulta = reactive({
    puntodeventa_id: store.state.puntodeventaselect,
    estado: estado,
    fecha_desde: fecha_desde.value,
    fecha_hasta: fecha_hasta.value,
  });
  store
    .dispatch("llenarcotizaciones", consulta)
    .then(() => {
      vercotizaciones.value = true;
    })
    .catch((err) => {
      vercotizaciones.value = false;
      swalError(err.response.data.error);
    });
}

async function recuperarcotizacion(cotizacion) {
  let respRes;
  try {
    respRes = await checkExistingReserve(cotizacion.id);
  } catch {
    return;
  }
  if (respRes?.exists) {
    swalError('No puede recuperar la cotización: la cotización cuenta con una reserva  ');
    return;
  }

  templateStore.pageLoader({ mode: "on" });
  store
    .dispatch("recuperarCotizacion", cotizacion)
    .then(() => {
      templateStore.pageLoader({ mode: "off" });
      router.push({
        name: "ventas-crearcotizacion",
      });
    })
    .catch((err) => {
      errorMsg.value = err.response.data.error;
    });
}

function recuperarcotizacionprospecto(cotizacion) {
  templateStore.pageLoader({ mode: "on" });

  store.dispatch("checkRucProspecto", cotizacion).then((res) => {
    if (res.prospecto) {
      store
        .dispatch("recuperarCotizacionProspecto", cotizacion)
        .then(() => {
          templateStore.pageLoader({ mode: "off" });
          router.push({
            name: "ventas-crearcliente",
          });
        })
        .catch((err) => {
          swalError(err.response.data.error);
        });
    } else {
      cotizacion.cliente_id = res.cliente.id;
      cotizacion.sucursal_id = res.cliente.sucursales[0].id;
      recuperarcotizacion(cotizacion);
      templateStore.pageLoader({ mode: "off" });
    }
  });
}

async function volverapedir(cotizacion) {
  let respRes;
  try {
    respRes = await checkExistingReserve(cotizacion.id);
  } catch {
    return;
  }
  if (respRes?.exists) {
    swalError('No puede volver a pedir la cotización ya que cuenta con una reserva');
    return;
  }
  templateStore.pageLoader({ mode: "on" });
  store
    .dispatch("volverapedirCotizacion", cotizacion)
    .then(() => {
      templateStore.pageLoader({ mode: "off" });
      router.push({
        name: "ventas-crearcotizacion",
      });
    })
    .catch((err) => {
      errorMsg.value = err.response.data.error;
    });
}


async function levantarcliente(pedido) {
  let respRes;
  try {
    respRes = await checkExistingReserve(pedido.id);
  } catch {
    return;
  }
  if (respRes?.exists) {
    swalError('No puede copiar la cotización ya que cuenta con una reserva');
    return;
  }

  store.commit("resetCotizacion");
  levantarClienteModalObj.show();
  vercotizacion.value = pedido;
  tipo.value = "cotizacion";
}

let levantarClienteModal = ref(null);
let levantarClienteModalObj = null;

async function imprimircotizacion(cotizacion) {
  store
    .dispatch("imprimir", "/cotizaciones/imprimircotizacion/" + cotizacion.id)
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "cotizacion-" + cotizacion.cotizacion + ".pdf"
        );
        document.body.appendChild(link);
        link.click();
      }
      llenarcotizaciones("pendientes");
    });
}

async function imprimircotizacionimagenes(cotizacion) {
  store
    .dispatch(
      "imprimir",
      "/cotizaciones/imprimircotizacionimagenes/" + cotizacion.id
    )
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "cotizacion-" + cotizacion.cotizacion + ".pdf"
        );
        document.body.appendChild(link);
        link.click();
      }
      //llenarcotizaciones('pendientes');
    });
}

async function imprimircotizacionprospecto(cotizacion) {
  store
    .dispatch(
      "imprimir",
      "/cotizaciones/imprimircotizacionprospecto/" + cotizacion.id
    )
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "cotizacion-" + cotizacion.cotizacion + ".pdf"
        );
        document.body.appendChild(link);
        link.click();
      }
      llenarcotizaciones("pendientes");
    });
}


let verNoVentaModal = ref(null);
let verNoVentaModalObj = null;
let datosModalNoVenta = ref({});

function showModalNoVenta(row) {
  datosModalNoVenta.value = null // 🔄 reset para forzar reactividad
  nextTick(() => {
    datosModalNoVenta.value = {
      id: row.id,
      motivo_id: row.cotizacion_venta_motivo_id,
      recordar: row.recordar,
      observacion: row.observacion,
      fecha_recordatorio: row.fecha_recordatorio,
      cotizacion: row.cotizacion
    }
    nextTick(() => {
      verNoVentaModalObj?.show()
    })
  });
}

function getReminderClass(row) {
  if (row.recordatorioventa == 0) {
    if (row.cotizacion_venta_motivo_id != null || row.recordar == 1) {
      return 'bg-success-light text-success'
    } else {
      return 'bg-warning-light text-warning'
    }

  } else if (row.recordatorioventa == 1) {
    return 'bg-info-light text-info'
  }


  return 'bg-danger-light text-danger';
}



onMounted(() => {
  vercotizacionModalObj = new Modal(vercotizacionModal.value);
  verReservaModalObj = new Modal(verReservaModal.value);
  levantarClienteModalObj = new Modal(levantarClienteModal.value);
  verNoVentaModalObj = new Modal(verNoVentaModal.value);
  // Remove labels from
  document.querySelectorAll("#datasetLength label").forEach((el) => {
    el.remove();
  });

  // Replace select classes
  let selectLength = document.querySelector("#datasetLength select");

  selectLength.classList = "";
  selectLength.classList.add("form-select");
  selectLength.style.width = "80px";
  if (motivoStore.motivos.length == 0) {
    motivoStore.fetchMotivos()
  }
  if (tipoReservasStore.tipoReservas.length == 0) {
    tipoReservasStore.fetchListTypeReserved()
  }

  if (puntosVentaReservaLimitsStore.puntosVentaReservaLimits.length == 0) {
    puntosVentaReservaLimitsStore.fetchPuntosVentaReservaLimits()
  }

});
</script>
