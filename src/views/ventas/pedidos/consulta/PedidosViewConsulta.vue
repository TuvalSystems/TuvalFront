<script setup>
import { ref, reactive, computed, onMounted} from "vue";
import { useStore } from 'vuex'
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import { Modal } from "bootstrap";
import VerPedidoModal from "@/views/ventas/modals/consulta/verModalPedidoConsulta.vue";
import LevantarClienteModal from "@/views/ventas/modals/LevantarCliente.vue";
import FiltrarCliente from "@/views/ventas/modals/FiltrarCliente.vue";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import { format } from "@/functions";
import {
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";


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




let levantarClienteModal = ref(null);
let levantarClienteModalObj = null;

let filtrarClienteModal = ref(null);
let filtrarClienteModalObj = null;

function levantarFiltrocliente() {
  store.commit('resetClientes');
  filtrarClienteModalObj.show();
}


function cancelarPedido() {
  verpedidoModalObj.hide();
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

  llenarpedidos('todos');
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


let verModalUpdateDateInvoice = ref(null);
let verModalUpdateDateInvoiceObj = null;
let datosModalPedidoAcDate = ref({});

const BLOCKED_STATES = ['facturado', 'rechazado', 'anulada', 'eliminado'];
function canRescheduleInvoice(row) {
  return row.origen === 'factura_demanda' && !BLOCKED_STATES.includes(row.estado);
}

onMounted(() => {
  verpedidoModalObj = new Modal(verpedidoModal.value);
  levantarClienteModalObj = new Modal(levantarClienteModal.value);
  filtrarClienteModalObj = new Modal(filtrarClienteModal.value);
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



</script>
<template>
  <!-- Hero -->
  <BasePageHeading title="Pedidos Consulta">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Ventas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Pedidos Consulta</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">


    <BaseBlock title="Pedidos Consulta" content-full>
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
            <div class="dropdown-menu dropdown-menu-end  shadow-sm"
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
  <div class="modal" id="modal-pedido" tabindex="-1" aria-labelledby="modal-pedido" aria-hidden="true"
    ref="verpedidoModal">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <VerPedidoModal :verpedido="verpedido" :indexPedido="indexPedido" :tipo="tipo"
        ></VerPedidoModal>
      </div>
    </div>
  </div>
 
  <div class="modal" id="modal-levantar-cliente" tabindex="-1" aria-labelledby="modal-levantar-cliente"
    aria-hidden="true" ref="levantarClienteModal">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <LevantarClienteModal :verpedido="verpedido" :tipo="tipo"></LevantarClienteModal>
      </div>
    </div>
  </div>
  <div class="modal" id="modal-filtrar-cliente" tabindex="-1" aria-labelledby="modal-filtrar-cliente" aria-hidden="true"
    ref="filtrarClienteModal">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <FiltrarCliente @filtrarCliente="filtrarCliente()"></FiltrarCliente>
      </div>
    </div>
  </div>




</template>
<style scoped>
/* Alineación de iconos */
.dropdown-menu .dropdown-item i {
  width: 20px;
  /* Un poco más ancho para que todos los iconos se alineen igual */
  text-align: center;
}

/* BLINDAJE VISUAL */
.dropdown-menu {
  

  /* Asegura que el menú flote por encima de las otras filas de la tabla */
  z-index: 9999 !important;

  /* Borde sutil */
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>