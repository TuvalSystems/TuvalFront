<template>
  <!-- Hero -->
  <BasePageHeading title="Pedidos">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Ventas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Pedidos</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">


    <BaseBlock title="Pedidos" content-full>
      <template #options>

        <div class="space-x-1">
          <div class="block-options-item">
            <button type="button" title="Refrescar tabla" @click="levantarFiltrocliente()"
              class="btn btn-info btn-sm mx-1"><i class="fa fa-user"></i> Cliente</button>
            <code class="text-muted" v-if="filtrar_cliente"> {{ filtrar_cliente.CLI_RUC }}</code>
          </div>
          <div class="block-options-item">
            <div class="row g-3 align-items-center">
              <div class="col-auto">
                <label for="fecha_desde" class="col-form-label fs-sm">Desde</label>
              </div>
              <div class="col-auto">
                <flat-pickr style="width:120px;" id="fecha_desde" class="form-control form-control-sm"
                  v-model="fecha_desde" :config="flatPickrState.fecha_desde" @change="refrescarFecha()" />
              </div>
              <div class="col-auto">
                <label for="fecha_hasta" class="col-form-label fs-sm">Hasta</label>
              </div>
              <div class="col-auto">
                <flat-pickr style="width:120px;" id="fecha_hasta" class="form-control form-control-sm"
                  v-model="fecha_hasta" :config="flatPickrState.fecha_hasta" @change="refrescarFecha()" />
              </div>
              <div class="col-auto">
                <button class="btn btn-sm btn-primary" @click="limpiarFecha()"><i class="fa fa-eraser"></i> Limpiar
                  filtros</button>
              </div>
            </div>
          </div>
          <div class="block-options-item">
            <button type="button" title="Refrescar tabla" @click="refreshllenarpedidos()"
              class="btn btn-success btn-sm"><i class="si si-refresh"></i></button>
          </div>
          <div class="dropdown d-inline-block">
            <button type="button" class="btn btn-sm btn-alt-secondary" id="dropdown-recent-orders-filters"
              data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <i class="fa fa-fw fa-flask"></i>
              Estado
              <i class="fa fa-angle-down ms-1"></i>
            </button>
            <div class="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-sm"
              aria-labelledby="dropdown-recent-orders-filters">
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('todos');" href="javascript:void(0)">
                Todos
              </a>
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('espera');" href="javascript:void(0)">
                Espera
              </a>
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('eliminado');" href="javascript:void(0)">
                Eliminados
              </a>
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('facturado');" href="javascript:void(0)">
                Facturados
              </a>
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('traslado');" href="javascript:void(0)">
                Traslado
              </a>
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('orden_de_compra');" href="javascript:void(0)">
                Orden de Compra
              </a>
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('rechazado');" href="javascript:void(0)">
                Rechazados
              </a>
              <a class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('anulada');" href="javascript:void(0)">
                Anulada
              </a>
            </div>
          </div>
        </div>
      </template>
      <Dataset v-slot="{ ds }" :ds-data="pedidos.data" :ds-sortby="sortBy"
        :ds-search-in="['pedido', 'cotizacion', 'factura', 'CLI_RAZON_SOCIAL', 'CLI_RUC', 'USERID', 'COND_ID', 'created_at', 'cotizacion']">
        <div class="row" :data-page-count="ds.dsPagecount">
          <div id="datasetLength" class="col-md-8 py-2">
            <DatasetShow />
          </div>
          <div class="col-md-4 py-2">
            <DatasetSearch ds-search-placeholder="Buscar..." />
          </div>
        </div>
        <hr />
        <div v-if="pedidos.loading" class="text-center">
          <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div class="row" v-if="verpedidos && pedidos.data.length && !pedidos.loading">
          <div class="col-md-12">
            <div class="table-responsive">
              <table class="table table-sm table-hover table-vcenter mb-0">
                <thead>
                  <tr>
                    <th v-for="(th, index) in cols" :key="th.field" :class="['sort', th.sort]"
                      @click="onSort($event, index)" class="nowrap">
                      {{ th.name }} <i class="gg-select float-end"></i>
                    </th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <DatasetItem tag="tbody" class="fs-sm">
                  <template #default="{ row }">
                    <tr>
                      <td class="fs-sm">
                        <a href="javascript:void(0);" @click="funcionverpedido(row)">{{ row.pedido }}</a>
                      </td>
                      <td class="fs-sm">
                        {{ row.cotizacion }}
                      </td>
                      <td class="fs-sm">
                        {{ row.factura }}
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
                      <td class="fs-sm">
                        <a v-if="row.estado === 'espera'" href="javascript:void(0)"
                          class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-warning-light text-warning"
                          @click="motivoEspera(row)">
                          {{ row.estado }}
                        </a>

                        <span v-else class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill "
                          @click="
                            row.estado === 'rechazado' && row.aprobado_comercial_mensaje ? swalWarning(row.aprobado_comercial_mensaje) : '' ||
                              row.estado === 'rechazado' && row.aprobado_crediticio_mensaje ? swalWarning(row.aprobado_crediticio_mensaje) : ''" :class="row.estado === 'facturado' ? 'bg-success-light text-success' : '' ||
                                row.estado === 'orden_de_compra' ? 'bg-info-light text-info' : '' ||
                                  row.estado === 'traslado' ? 'bg-danger-light text-danger' : '' ||
                                    row.estado === 'rechazado' && !row.aprobado_crediticio_mensaje ? 'bg-danger-light text-danger' : '' ||
                                      row.estado === 'rechazado' && row.aprobado_crediticio_mensaje ? 'pointer bg-danger-light text-danger' : '' ||
                                        row.estado === 'anulada' ? 'bg-warning-light text-danger' : ''">
                          {{ row.estado }}
                        </span>
                      </td>
                      <td class="nowrap">
                        <span v-if="row.estado === 'rechazado'"
                          class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger">
                          <i class="fa fa-circle-xmark"></i>
                        </span>
                        <span v-else class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill "
                          :class="row.imprimir === 'yes' ? 'bg-success-light text-success' : 'bg-warning-light text-warning'"
                          :title="row.imprimir === 'yes' ? 'Pedido aprobado' : 'Por aprobar'">
                          <i :class="row.imprimir === 'yes' ? 'fa fa-circle-check' : 'fa fa-circle-xmark'"></i>
                        </span>
                        <span v-if="(row.despachado === 1)"
                          class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-info-light text-info mx-1"
                          title="Despachado">
                          <i class="fa fa-truck-fast"></i>
                        </span>
                      </td>
                      <td class="fs-sm text-end nowrap">
                        <!-- <button type="button" class="btn btn-warning btn-sm mx-1" title="Volver a pedir"
                          @click="recuperarpedido(row)">
                          <i class="far fa-copy"></i>
                        </button> -->
                        <!-- <button type="button" class="btn btn-info btn-sm mx-1" title="Copiar pedido"
                          @click="levantarcliente(row)">
                          <i class="fa fa-copy"></i>
                        </button> -->
                        <button
                          v-if="((row.estado === 'espera' && (row.factura_posterior_despacho === 1 && row.factura_a_demanda === 1 && row.despachado === 1))
                            || (row.estado === 'espera' && (row.factura_a_demanda === 0 || row.factura_a_demanda === null) && row.factura_siguiente_mes === 1))
                            && !((row.requiere_aprobacion_comercial === 'yes' && row.aprobado_comercial === 'no') || (row.requiere_aprobacion_crediticia === 'yes' && row.aprobado_crediticio === 'no'))"
                          type="button" class="btn btn-danger btn-sm mx-1" title="Enviar a facturar"
                          @click="confirmfacturar(row)">
                          <i class="fa fa-file-invoice-dollar"></i>
                        </button>
                        <!-- dropdown -->


                        <button type="button" class="btn btn-sm btn-alt-secondary" id="dropOptions"
                          data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                          <i class="fa fa-fw fa-ellipsis-v"></i> </button>

                        <ul class="dropdown-menu dropdown-menu-end dropdown-menu-dark shadow-sm"
                          aria-labelledby="dropOptions">

                          <template v-if="row.imprimir === 'yes'">
                            <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">Exportar</li>
                            <li>
                              <button class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="imprimirpedido(row)">
                                <i class="fa fa-print text-white me-2"></i> Pedido
                              </button>
                            </li>
                            <li>
                              <button class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="imprimirpedidoimagenes(row)">
                                <i class="fa-solid fa-file-pdf text-danger me-2"></i> Pedido
                              </button>
                            </li>
                            <li>
                              <button class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="imprimirpedidoride(row)">
                                <i class="fa-solid fa-file-invoice text-primary me-2"></i> RIDE
                              </button>
                            </li>
                            <li>
                              <button class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="imprimirpedidoridesinimagen(row)">
                                <i class="fa-regular fa-file-pdf text-muted me-2"></i> RIDE (Sin img)
                              </button>
                            </li>
                            <li>
                              <button class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="imprimirpedidoxml(row)">
                                <i class="fa-solid fa-code text-warning me-2"></i> XML
                              </button>
                            </li>

                            <li class="dropdown-divider"></li>
                          </template>

                          <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">Gestión</li>

                          <!-- volver a pedir -->
                          <li>
                            <button class="dropdown-item d-flex align-items-center gap-2 py-2"
                              @click="recuperarpedido(row)">
                              <i class="fa-solid fa-cart-plus fa-fw text-warning"></i> <span>Volver a pedir</span>
                            </button>
                          </li>

                          <!-- copiar pedido -->
                          <li>
                            <button class="dropdown-item d-flex align-items-center gap-2 py-2"
                              @click="levantarcliente(row)">
                              <i class="fa-regular fa-clone fa-fw text-success"></i> 
                              <span>Copiar</span>
                            </button>
                          </li>

                          <li v-if="!['facturado', 'rechazado', 'anulada', 'eliminado'].includes(row.estado)">
                            <button class="dropdown-item d-flex align-items-center gap-2 py-2"
                              @click="operModalActualizarDatosPedido(row)">
                              <i class="fa-solid fa-user-pen text-info me-2"></i> Actualizar Datos
                            </button>
                          </li>

                          <li v-if="canRescheduleInvoice(row)">
                            <button class="dropdown-item d-flex align-items-center gap-2 py-2"
                              @click="openModalUpdateDateInvoice(row)">
                              <i class="fa-regular fa-calendar-days text-success me-2"></i> Reprogramar
                            </button>
                          </li>

                          <li v-if="row.estado === 'espera'">
                            <div class="dropdown-divider my-2"></div>
                            <button class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                              :disabled="loadingChange" @click="rechazarPedidoEstadoEspera(row.id)">
                              <i class="fa-solid fa-ban fa-fw"></i> <span class="fw-semibold">Rechazar</span>
                            </button>
                          </li>

                        </ul>



                        <!-- dropdown -->
                        <!-- <button v-if="row.estado === 'espera'" type="button" class="btn btn-danger btn-sm mx-1"
                          :disabled="loadingChange" @click="rechazarPedidoEstadoEspera(row.id)">
                         
                        </button> -->
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
  <div class="modal" id="modal-pedido" tabindex="-1" role="dialog" aria-labelledby="modal-pedido" aria-hidden="true"
    ref="verpedidoModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <VerPedidoModal :verpedido="verpedido" :indexPedido="indexPedido" :tipo="tipo"
          @consultarExistente="consultarExistente(verpedido)" @consultarDespachado="consultarDespachado(verpedido)"
          @cancelarPedido="cancelarPedido()"></VerPedidoModal>
      </div>
    </div>
  </div>
  <div class="modal" id="modal-facturarexistente" tabindex="-1" role="dialog" aria-labelledby="modal-facturarexistente"
    aria-hidden="true" ref="facturarexistenteModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <FacturarExistenteModal :verpedido="verpedido" @cerrarFacturarExistente="cerrarFacturarExistente()">
        </FacturarExistenteModal>
      </div>
    </div>
  </div>
  <div class="modal" id="modal-facturardespachado" tabindex="-1" role="dialog"
    aria-labelledby="modal-facturardespachado" aria-hidden="true" ref="facturardespachadoModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <FacturarDespachadoModal :verpedido="verpedido" @cerrarFacturarDespachado="cerrarFacturarDespachado()">
        </FacturarDespachadoModal>
      </div>
    </div>
  </div>
  <div class="modal" id="modal-levantar-cliente" tabindex="-1" role="dialog" aria-labelledby="modal-levantar-cliente"
    aria-hidden="true" ref="levantarClienteModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <LevantarClienteModal :verpedido="verpedido" :tipo="tipo"></LevantarClienteModal>
      </div>
    </div>
  </div>
  <div class="modal" id="modal-filtrar-cliente" tabindex="-1" role="dialog" aria-labelledby="modal-filtrar-cliente"
    aria-hidden="true" ref="filtrarClienteModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <FiltrarCliente @filtrarCliente="filtrarCliente()"></FiltrarCliente>
      </div>
    </div>
  </div>

  <!-- modal de actualizacion de datos de orden y nota cliente -->
  <div class="modal" id="modal-noventa" tabindex="-1" role="dialog" aria-labelledby="modal-noventa" aria-hidden="true"
    ref="verActualizarDatos">
    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <verActualizarOrdYNotaModalComponent v-if="datosModalAcPedido && datosModalAcPedido.id"
          :pedido="datosModalAcPedido" @llenarPedidos="llenarpedidos('todos')"
          @closeModal="closeModalActualizarDatosPedido">
        </verActualizarOrdYNotaModalComponent>
      </div>
    </div>
  </div>

  <!-- modal de actualizacion de fecha de facturacion de reserva -->

  <div class="modal" id="modal-noventa" tabindex="-1" role="dialog" aria-labelledby="modal-noventa" aria-hidden="true"
    ref="verModalUpdateDateInvoice">
    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <verActualizarFechaFacturaReserva v-if="datosModalPedidoAcDate && datosModalPedidoAcDate.id"
          :pedido="datosModalPedidoAcDate" @llenarPedidos="llenarpedidos('todos')"
          @closeModal="closeModalUpdateDateInvoice">
        </verActualizarFechaFacturaReserva>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useStore } from 'vuex'
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import { Modal } from "bootstrap";
import VerPedidoModal from "../modals/VerPedidoModal.vue";
import LevantarClienteModal from "../modals/LevantarCliente.vue";
import FiltrarCliente from "../modals/FiltrarCliente.vue";
import FacturarExistenteModal from "../modals/FacturarExistenteModal.vue";
import FacturarDespachadoModal from "../modals/FacturarDespachadoModal.vue";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import { formatPrice, format } from "@/functions";
import verActualizarOrdYNotaModalComponent from "@/views/ventas/modals/verActualizarOrdenYNotaClienteModal.vue";
import verActualizarFechaFacturaReserva from "@/views/ventas/modals/verActualizarFechaFacturaReserva.vue";
import { useUpdateOrderStatus } from "@/composables/aprobaciones/pedidos/useUpdateOrderStatus";
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";
const { loadingChange, changeStatusOrderBeenWaiting } = useUpdateOrderStatus();
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
    name: "Pedido",
    field: "pedido",
    sort: "",
  },
  {
    name: "Cot.",
    field: "cotizacion",
    sort: "",
  },
  {
    name: "Factura",
    field: "factura",
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
    name: "Usr.",
    field: "USERID",
    sort: "",
  },
  {
    name: "Cond.",
    field: "COND_ID",
    sort: "",
  },
  {
    name: "Fecha",
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

const store = useStore();
const templateStore = useTemplateStore();
const router = useRouter();
const verpedido = ref({});
const indexPedido = ref(null);
const tipo = ref(null);
const fecha_desde = ref(null);
const fecha_hasta = ref(null);
const estado_filtro = ref(null);
const filtrar_cliente = computed(() => store.state.filtrar_cliente);

function limpiarFecha() {
  fecha_desde.value = null;
  fecha_hasta.value = null;
  store.commit('resetFiltrarCliente');
  llenarpedidos('todos');
}

function refrescarFecha() {
  if (!fecha_desde.value)
    return;
  if (!fecha_hasta.value)
    return;

  llenarpedidos(estado_filtro.value);

}
async function funcionverpedido(pedido) {
  store.dispatch('despachoenproceso', pedido.id).then((res) => {
    pedido.despacho_en_proceso = res.data.despacho_en_proceso;
    pedido.transferencia_en_proceso = res.data.transferencia_en_proceso;
    pedido.item_l_recibido = res.data.item_l_recibido;
    verpedidoModalObj.show();
    verpedido.value = pedido;
    tipo.value = 'pedido';
    store.dispatch('detallepedido', pedido).then(() => {
      const elem = document.getElementById('btabs-alt-static-detalle-tab');
      if (elem)
        elem.click();
    });
  })
}

function levantarcliente(pedido) {
  store.commit('resetCotizacion');
  levantarClienteModalObj.show();
  verpedido.value = pedido;
  tipo.value = 'pedido';
}

let verpedidoModal = ref(null);
let verpedidoModalObj = null;

let facturarexistenteModal = ref(null);
let facturarexistenteModalObj = null;

let facturardespachadoModal = ref(null);
let facturardespachadoModalObj = null;

let levantarClienteModal = ref(null);
let levantarClienteModalObj = null;

let filtrarClienteModal = ref(null);
let filtrarClienteModalObj = null;

function levantarFiltrocliente() {
  store.commit('resetClientes');
  filtrarClienteModalObj.show();
}
function consultarExistente(verpedido) {
  verpedidoModalObj.hide();
  store.dispatch('consultarExistente', verpedido).then(() => {
    facturarexistenteModalObj.show();
  })
}
function consultarDespachado(verpedido) {
  verpedidoModalObj.hide();
  store.dispatch('consultarDespachado', verpedido).then(() => {
    facturardespachadoModalObj.show();
  })
}

function cancelarPedido() {
  verpedidoModalObj.hide();
  llenarpedidos('todos');
}
function cerrarFacturarExistente() {
  facturarexistenteModalObj.hide();
  llenarpedidos('todos');
}
function cerrarFacturarDespachado() {
  facturardespachadoModalObj.hide();
  llenarpedidos('todos');
}

let errorMsg = ref('');
const pedidos = computed(() => store.state.pedidos);
const verpedidos = ref(false);

llenarpedidos('todos');

async function llenarpedidos(estado) {
  estado_filtro.value = estado;
  const consulta = reactive({
    puntodeventa_id: store.state.puntodeventaselect,
    estado: estado,
    fecha_desde: fecha_desde.value,
    fecha_hasta: fecha_hasta.value,
    cliente: filtrar_cliente.value,
  })
  store.dispatch('llenarpedidos', consulta).then(() => {
    verpedidos.value = true;
  }).catch(err => {
    verpedidos.value = false;
    swalError(err.response.data.error);
  });
}

function filtrarCliente() {
  filtrarClienteModalObj.hide();
  llenarpedidos(estado_filtro.value);
}

function refreshllenarpedidos() {
  // store.dispatch('sendfacturasgp').then(() => {
  //   verpedidos.value = true;
  //   llenarpedidos('todos');
  // }).catch(err => {
  //     verpedidos.value = false;
  //     errorMsg.value = err.response.data.error
  // });
  llenarpedidos('todos');
}

function recuperarpedido(pedido) {
  templateStore.pageLoader({ mode: "on" });
  store.dispatch('recuperarPedido', pedido).then(() => {
    templateStore.pageLoader({ mode: "off" });
    router.push({
      name: 'ventas-crearcotizacion'
    })
  }).catch(err => {
    console.log(err);
  });
}

async function imprimirpedido(pedido) {
  store.dispatch('imprimir', '/pedidos/imprimirpedido/' + pedido.id)
    .then((response) => {
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'pedido-' + pedido.pedido + '.pdf');
        document.body.appendChild(link);
        link.click();
      }
    });
}

async function imprimirpedidoimagenes(pedido) {
  store.dispatch('imprimir', '/pedidos/imprimirpedidoimagenes/' + pedido.id)
    .then((response) => {
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'pedido-' + pedido.pedido + '.pdf');
        document.body.appendChild(link);
        link.click();
      }
    });
}

async function imprimirpedidoride(pedido) {
  try {
    const response = await store.dispatch('imprimir', '/pedidos/imprimirpedidoride/' + pedido.id);
    if (response.status === 200) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'RIDE-' + pedido.pedido + '.pdf');
      document.body.appendChild(link);
      link.click();
    } else if (response.success === false) {
      errorMsg.value = response.error || 'Ocurrió un error al generar el RIDE.';
      swalError(errorMsg.value);
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errorMsg.value = error.response.data.message;
    } else {
      errorMsg.value = 'No se pudo generar el RIDE. Inténtalo más tarde.';
    }

    swalError(errorMsg.value);
  }
}

async function imprimirpedidoridesinimagen(pedido) {
  try {
    const response = await store.dispatch('imprimir', '/pedidos/imprimirpedidoride-sin-imagen/' + pedido.id);
    if (response.status === 200) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'RIDE-' + pedido.pedido + '.pdf');
      document.body.appendChild(link);
      link.click();
    } else if (response.success === false) {
      errorMsg.value = response.error || 'Ocurrió un error al generar el RIDE.';
      swalError(errorMsg.value);
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errorMsg.value = error.response.data.message;
    } else {
      errorMsg.value = 'No se pudo generar el RIDE. Inténtalo más tarde.';
    }

    swalError(errorMsg.value);
  }
}

async function imprimirpedidoxml(pedido) {
  try {
    const response = await store.dispatch('imprimir', '/pedidos/imprimirpedidoxml/' + pedido.id);

    if (response.status === 200) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'xml-' + pedido.pedido + '.xml');
      document.body.appendChild(link);
      link.click();
    } else {
      errorMsg.value = 'Error al generar el XML.';
      swalError(errorMsg.value);
    }
  } catch (err) {
    const blob = err.response?.data;

    if (blob instanceof Blob) {
      const text = await blob.text();
      try {
        const json = JSON.parse(text);
        errorMsg.value = json.message || 'Error desconocido al generar el XML.';
      } catch {
        errorMsg.value = text || 'Error inesperado al generar el XML.';
      }
    } else {
      errorMsg.value = 'No se pudo generar el XML.';
    }

    swalError(errorMsg.value);
  }
}

function confirmfacturar(pedido) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De facturar el pedido " + pedido.pedido + "",
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, facturar",
      cancelButtonText: "Cancelar",
      html: false,
      preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 50);
        });
      },
    })
    .then((result) => {
      if (result.value) {
        facturarpedido(pedido);
      }
    });
}

function facturarpedido(pedido) {
  store.dispatch('facturarPedido', pedido).then(() => {
    llenarpedidos('todos');
  }).catch(err => {
    errorMsg.value = err.response.data.error
    swalError(errorMsg.value);
  });
}

function motivoEspera(pedido) {
  let msg = 'Pedido ';
  if (pedido.factura_siguiente_mes) {
    msg += 'factura a siguiente mes';
  }
  if (pedido.requiere_aprobacion_comercial === 'yes' && pedido.aprobado_comercial === 'no') {
    msg += ' requiere aprobación comercial ';
  }
  if (pedido.requiere_aprobacion_comercial === 'yes' && pedido.aprobado_comercial === 'no' && pedido.requiere_aprobacion_crediticia === 'yes') {
    msg += ' y ';
  }
  if (pedido.requiere_aprobacion_crediticia === 'yes' && pedido.aprobado_crediticio === 'no') {
    msg += ' requiere aprobación crediticia ';
  }
  if (pedido.factura_a_demanda) {
    msg += 'requiere factura a demanda posterior al despacho ';
  }
  swalWarning(msg);
}


let verActualizarDatos = ref(null);
let verActualizarDatosObj = null;
let datosModalAcPedido = ref({});

async function operModalActualizarDatosPedido(pedido) {
  if (pedido.estado === 'facturado') {
    swalWarning('No se puede actualizar la orden de compra y nota cliente de un pedido facturado')
    return;
  }
  datosModalAcPedido.value = pedido;
  await nextTick();
  verActualizarDatosObj.show();
}

function closeModalActualizarDatosPedido() {
  datosModalAcPedido.value = {};
  verActualizarDatosObj.hide();
}

let verModalUpdateDateInvoice = ref(null);
let verModalUpdateDateInvoiceObj = null;
let datosModalPedidoAcDate = ref({});

const BLOCKED_STATES = ['facturado', 'rechazado', 'anulada', 'eliminado'];
function canRescheduleInvoice(row) {
  return row.origen === 'reserva' && !BLOCKED_STATES.includes(row.estado);
}
async function openModalUpdateDateInvoice(pedido) {
  if (pedido.origen !== 'reserva') {
    swalWarning('Solo se puede reprogramar la facturación de pedidos de origen reserva')
    return;
  }
  datosModalPedidoAcDate.value = pedido;
  await nextTick();
  verModalUpdateDateInvoiceObj.show();
}

function closeModalUpdateDateInvoice() {
  datosModalPedidoAcDate.value = {};
  verModalUpdateDateInvoiceObj.hide();
}

onMounted(() => {

  verpedidoModalObj = new Modal(verpedidoModal.value);
  levantarClienteModalObj = new Modal(levantarClienteModal.value);
  filtrarClienteModalObj = new Modal(filtrarClienteModal.value);
  facturarexistenteModalObj = new Modal(facturarexistenteModal.value);
  facturardespachadoModalObj = new Modal(facturardespachadoModal.value);
  verActualizarDatosObj = new Modal(verActualizarDatos.value);
  verModalUpdateDateInvoiceObj = new Modal(verModalUpdateDateInvoice.value);
  // Remove labels from
  document.querySelectorAll("#datasetLength label").forEach((el) => {
    el.remove();
  });

  // Replace select classes
  let selectLength = document.querySelector("#datasetLength select");

  selectLength.classList = "";
  selectLength.classList.add("form-select");
  selectLength.style.width = "80px";
});


async function rechazarPedidoEstadoEspera(id) {
  const res = await changeStatusOrderBeenWaiting(id);
  if (!res?.ok) {
    return swalError("No se pudo rechazar el pedido");
  }
  swalSuccess("Cotización rechazada");
  llenarpedidos('todos');
}


</script>

<style scoped>
/* Alineación de iconos */
.dropdown-menu .dropdown-item i {
  width: 10px;
  /* Un poco más ancho para que todos los iconos se alineen igual */
  text-align: center;
}

/* BLINDAJE VISUAL */
.dropdown-menu {
  /* Asegura que el fondo sea sólido y no transparente */
  background-color: #262b34 !important;

  /* Asegura que el menú flote por encima de las otras filas de la tabla */
  z-index: 9999 !important;

  /* Borde sutil */
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>