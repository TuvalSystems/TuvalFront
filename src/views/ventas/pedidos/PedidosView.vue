<script setup>
import { ref, reactive, computed, onMounted, nextTick, onUnmounted } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";
import { useTemplateStore } from "@/stores/template";
import { useBootstrapModal } from "@/composables/core/useBootstrapModal";
import VerPedidoModal from "../modals/VerPedidoModal.vue";
import LevantarClienteModal from "../modals/LevantarCliente.vue";
import FiltrarCliente from "@/components/ventas/cliente/FiltrarCliente.vue";
import FacturarExistenteModal from "../modals/FacturarExistenteModal.vue";
import FacturarDespachadoModal from "../modals/FacturarDespachadoModal.vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { format } from "@/functions";
import verActualizarOrdYNotaModalComponent from "@/views/ventas/pedidos/modals/verActualizarOrdenYNotaClienteModal.vue";
import verActualizarFechaFacturaReserva from "@/views/ventas/pedidos/modals/verActualizarFechaFacturaReserva.vue";
import { useUpdateOrderStatus } from "@/composables/aprobaciones/pedidos/useUpdateOrderStatus";
import { useCustomerFilterSearch } from "@/composables/venta/cliente/useCustomerFilterSearch";
import {
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";
import { useOrderActions } from "@/composables/venta/pedidos/useOrderActions";
const {
  cancelOrder,
  cancelOrderStatusSending: cancelOrderStatusSendingAction,
} = useOrderActions();
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

//composable para busqueda de clientes
const {
  clients,
  errorSearchClient,
  loadingSearch,
  showCustomerResults,
  searchCustomerFilters,
  updateCustomerSearchTerm,
  cleanSearchClients,
} = useCustomerFilterSearch();
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
    name: "Fecha Creacion",
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

// variables de filtro de cliente
const selectedCustomer = ref(null);

const store = useStore();
const templateStore = useTemplateStore();
const router = useRouter();
const verpedido = ref({});
const indexPedido = ref(null);
const tipo = ref(null);
const fecha_desde = ref(null);
const fecha_hasta = ref(null);
const estado_filtro = ref(null);

function limpiarFecha() {
  fecha_desde.value = null;
  fecha_hasta.value = null;
  selectedCustomer.value = null;
  store.commit("resetFiltrarCliente");
  llenarpedidos("todos");
}

function refrescarFecha() {
  if (!fecha_desde.value) return;
  if (!fecha_hasta.value) return;

  llenarpedidos(estado_filtro.value);
}
async function funcionverpedido(pedido) {
  store.dispatch("despachoenproceso", pedido.id).then((res) => {
    pedido.despacho_en_proceso = res.data.despacho_en_proceso;
    pedido.transferencia_en_proceso = res.data.transferencia_en_proceso;
    pedido.item_l_recibido = res.data.item_l_recibido;
    verpedidoModalObj.show();
    verpedido.value = pedido;
    tipo.value = "pedido";
    store.dispatch("detallepedido", pedido).then(() => {
      const elem = document.getElementById("btabs-alt-static-detalle-tab");
      if (elem) elem.click();
    });
  });
}

function levantarcliente(pedido) {
  levantarClienteModalObj.show();
  verpedido.value = pedido;
  tipo.value = "pedido";
}

const verpedidoModal = ref(null);
const verpedidoModalObj = useBootstrapModal(verpedidoModal);

const facturarexistenteModal = ref(null);
const facturarexistenteModalObj = useBootstrapModal(facturarexistenteModal);

const facturardespachadoModal = ref(null);
const facturardespachadoModalObj = useBootstrapModal(facturardespachadoModal);

const levantarClienteModal = ref(null);
const levantarClienteModalObj = useBootstrapModal(levantarClienteModal);

const filtrarClienteModal = ref(null);
const filtrarClienteModalObj = useBootstrapModal(filtrarClienteModal);

function levantarFiltrocliente() {
  store.commit("resetClientes");
  filtrarClienteModalObj.show();
}
function consultarExistente(verpedido) {
  verpedidoModalObj.hide();
  store
    .dispatch("consultarExistente", verpedido)
    .then(() => {
      facturarexistenteModalObj.show();
    })
    .catch((error) => {
      let status = error.response.status || 500;
      if (status === 409) {
        swalWarning(error.response.data.error);
        return;
      }
      swalError(error.response.data.error);
    });
}
function consultarDespachado(verpedido) {
  verpedidoModalObj.hide();
  store.dispatch("consultarDespachado", verpedido).then(() => {
    facturardespachadoModalObj.show();
  });
}

async function cancelarPedido(order) {
  const resp = await cancelOrder(order?.id);
  if (!resp?.ok) {
    const message = resp?.message || "No se pudo cancelar el pedido.";
    (resp?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
    return;
  }
  swalSuccess(resp?.message || "Pedido cancelado exitosamente.");
  verpedidoModalObj.hide();
  llenarpedidos("todos");
}
function cerrarFacturarExistente() {
  facturarexistenteModalObj.hide();
  llenarpedidos("todos");
}
function cerrarFacturarDespachado() {
  facturardespachadoModalObj.hide();
  llenarpedidos("todos");
}

let errorMsg = ref("");
const pedidos = computed(() => store.state.pedidos);
const verpedidos = ref(false);

llenarpedidos("todos");

async function llenarpedidos(estado) {
  estado_filtro.value = estado;
  const consulta = reactive({
    puntodeventa_id: store.state.puntodeventaselect,
    estado: estado,
    fecha_desde: fecha_desde.value,
    fecha_hasta: fecha_hasta.value,
    cliente: selectedCustomer.value,
  });
  store
    .dispatch("llenarpedidos", consulta)
    .then(() => {
      verpedidos.value = true;
    })
    .catch((err) => {
      verpedidos.value = false;
      swalError(err.response.data.error);
    });
}

function refreshllenarpedidos() {
  llenarpedidos("todos");
}

async function recuperarpedido(pedido) {
  templateStore.pageLoader({ mode: "on" });
  router.push({
    name: "ventas-crearcotizacion",
    query: { id: pedido.id, mode: "reorder_order" },
  });
  templateStore.pageLoader({ mode: "off" });
}

async function imprimirpedido(pedido) {
  store
    .dispatch("imprimir", "/pedidos/imprimirpedido/" + pedido.id)
    .then((response) => {
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "pedido-" + pedido.pedido + ".pdf");
        document.body.appendChild(link);
        link.click();
      }
    });
}

async function imprimirpedidoimagenes(pedido) {
  store
    .dispatch("imprimir", "/pedidos/imprimirpedidoimagenes/" + pedido.id)
    .then((response) => {
      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "pedido-" + pedido.pedido + ".pdf");
        document.body.appendChild(link);
        link.click();
      }
    });
}

async function imprimirpedidoride(pedido) {
  try {
    const response = await store.dispatch(
      "imprimir",
      "/pedidos/imprimirpedidoride/" + pedido.id
    );
    if (response.status === 200) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "RIDE-" + pedido.pedido + ".pdf");
      document.body.appendChild(link);
      link.click();
    } else if (response.success === false) {
      errorMsg.value = response.error || "Ocurrió un error al generar el RIDE.";
      swalError(errorMsg.value);
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errorMsg.value = error.response.data.message;
    } else {
      errorMsg.value = "No se pudo generar el RIDE. Inténtalo más tarde.";
    }

    swalError(errorMsg.value);
  }
}

async function imprimirpedidoridesinimagen(pedido) {
  try {
    const response = await store.dispatch(
      "imprimir",
      "/pedidos/imprimirpedidoride-sin-imagen/" + pedido.id
    );
    if (response.status === 200) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "RIDE-" + pedido.pedido + ".pdf");
      document.body.appendChild(link);
      link.click();
    } else if (response.success === false) {
      errorMsg.value = response.error || "Ocurrió un error al generar el RIDE.";
      swalError(errorMsg.value);
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      errorMsg.value = error.response.data.message;
    } else {
      errorMsg.value = "No se pudo generar el RIDE. Inténtalo más tarde.";
    }

    swalError(errorMsg.value);
  }
}

async function imprimirpedidoxml(pedido) {
  try {
    const response = await store.dispatch(
      "imprimir",
      "/pedidos/imprimirpedidoxml/" + pedido.id
    );

    if (response.status === 200) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "xml-" + pedido.pedido + ".xml");
      document.body.appendChild(link);
      link.click();
    } else {
      errorMsg.value = "Error al generar el XML.";
      swalError(errorMsg.value);
    }
  } catch (err) {
    const blob = err.response?.data;

    if (blob instanceof Blob) {
      const text = await blob.text();
      try {
        const json = JSON.parse(text);
        errorMsg.value = json.message || "Error desconocido al generar el XML.";
      } catch {
        errorMsg.value = text || "Error inesperado al generar el XML.";
      }
    } else {
      errorMsg.value = "No se pudo generar el XML.";
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

async function facturarpedido(pedido) {
  try {
    await store.dispatch("facturarPedido", pedido);

    llenarpedidos("todos");
  } catch (err) {
    const status = err.response?.status || 500;
    const message =
      err.response?.data?.error ||
      err.message ||
      "Error de conexión o servidor";
    const warningCodes = [404, 409, 422];

    // CASO 1: Advertencias de Negocio (Ya facturado, no encontrado, etc.)
    if (warningCodes.includes(status)) {
      swalWarning(message);
      return;
    }
    // CASO 2: Error Crítico (500, Red, etc.)
    // Actualizamos la variable reactiva si la usas en el template
    if (typeof errorMsg.value !== "undefined") {
      errorMsg.value = message;
    }

    swalError(message);
  }
}

function motivoEspera(pedido) {
  let msg = "Pedido ";
  if (pedido.factura_siguiente_mes) {
    msg += "factura a siguiente mes";
  }
  if (pedido.origen === "factura_demanda") {
    msg += " factura Demanda";
  }
  if (
    pedido.requiere_aprobacion_comercial === "yes" &&
    pedido.aprobado_comercial === "no"
  ) {
    msg += " requiere aprobación comercial ";
  }
  if (
    pedido.requiere_aprobacion_comercial === "yes" &&
    pedido.aprobado_comercial === "no" &&
    pedido.requiere_aprobacion_crediticia === "yes"
  ) {
    msg += " y ";
  }
  if (
    pedido.requiere_aprobacion_crediticia === "yes" &&
    pedido.aprobado_crediticio === "no"
  ) {
    msg += " requiere aprobación crediticia ";
  }
  if (pedido.factura_a_demanda) {
    msg += "requiere factura a demanda posterior al despacho ";
  }

  swalWarning(msg);
}

const verActualizarDatos = ref(null);
const verActualizarDatosObj = useBootstrapModal(verActualizarDatos);
let datosModalAcPedido = ref({});

async function operModalActualizarDatosPedido(pedido) {
  if (pedido.estado === "facturado") {
    swalWarning(
      "No se puede actualizar la orden de compra y nota cliente de un pedido facturado"
    );
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

const verModalUpdateDateInvoice = ref(null);
const verModalUpdateDateInvoiceObj = useBootstrapModal(verModalUpdateDateInvoice);
let datosModalPedidoAcDate = ref({});


function closeModalUpdateDateInvoice() {
  datosModalPedidoAcDate.value = {};
  verModalUpdateDateInvoiceObj.hide();
}

onMounted(() => {
  // Remove labels from
  document.querySelectorAll("#datasetLength label").forEach((el) => {
    el.remove();
  });

  // Replace select classes
  let selectLength = document.querySelector("#datasetLength select");

  selectLength.classList = "";
  selectLength.classList.add("form-select");
  selectLength.style.width = "80px";

  document.addEventListener("visibilitychange", handleVisibilityChange);
});

onUnmounted(() => {
  // IMPORTANTE: Limpiar el evento cuando el componente se destruye
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});

async function rechazarPedidoEstadoEspera(id) {
  const res = await changeStatusOrderBeenWaiting(id);
  if (!res?.ok) {
    return swalError("No se pudo rechazar el pedido");
  }
  swalSuccess("Cotización rechazada");
  llenarpedidos("todos");
}

const handleVisibilityChange = () => {
  if (document.visibilityState === "visible") {
    //cerrar modales
    verpedidoModalObj.hide();
    facturarexistenteModalObj.hide();
    facturardespachadoModalObj.hide();
    verModalUpdateDateInvoiceObj.hide();
    verActualizarDatosObj.hide();
    filtrarClienteModalObj.hide();
    llenarpedidos("todos");
  }
};

//proceso para cancelar un pedido en estado enviando

async function cancelOrderStatusSending(id) {
  const res = await cancelOrderStatusSendingAction(id);
  if (res?.ok) {
    swalSuccess(res?.message || "Pedido cancelado");
    llenarpedidos("todos");
    return;
  }
  const msg = res?.message || "No se pudo actualizar el estado del usuario";
  (res?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}

/** filtro y busqueda de clientes */

async function handleCustomerSelected(selection) {
  selectedCustomer.value = selection;
  showCustomerResults.value = false;
  cleanSearchClients();
  llenarpedidos(estado_filtro.value);
  filtrarClienteModalObj.hide();
}
</script>
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
            <button
              type="button"
              title="Refrescar tabla"
              @click="levantarFiltrocliente()"
              class="btn btn-info btn-sm mx-1"
            >
              <i class="fa fa-user"></i> Cliente
            </button>
            <code class="text-muted" v-if="selectedCustomer">
              {{ selectedCustomer.CLI_RUC }}</code
            >
          </div>
          <div class="block-options-item">
            <div class="row g-3 align-items-center">
              <div class="col-auto">
                <label for="fecha_desde" class="col-form-label fs-sm"
                  >Desde</label
                >
              </div>
              <div class="col-auto">
                <flat-pickr
                  style="width: 120px"
                  id="fecha_desde"
                  class="form-control form-control-sm"
                  v-model="fecha_desde"
                  :config="flatPickrState.fecha_desde"
                  @change="refrescarFecha()"
                />
              </div>
              <div class="col-auto">
                <label for="fecha_hasta" class="col-form-label fs-sm"
                  >Hasta</label
                >
              </div>
              <div class="col-auto">
                <flat-pickr
                  style="width: 120px"
                  id="fecha_hasta"
                  class="form-control form-control-sm"
                  v-model="fecha_hasta"
                  :config="flatPickrState.fecha_hasta"
                  @change="refrescarFecha()"
                />
              </div>
              <div class="col-auto">
                <button class="btn btn-sm btn-primary" @click="limpiarFecha()">
                  <i class="fa fa-eraser"></i> Limpiar filtros
                </button>
              </div>
            </div>
          </div>
          <div class="block-options-item">
            <button
              type="button"
              title="Refrescar tabla"
              @click="refreshllenarpedidos()"
              class="btn btn-success btn-sm"
            >
              <i class="si si-refresh"></i>
            </button>
          </div>
          <div class="dropdown d-inline-block">
            <button
              type="button"
              class="btn btn-sm btn-alt-secondary"
              id="dropdown-recent-orders-filters"
              data-bs-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i class="fa fa-fw fa-flask"></i>
              Estado
              <i class="fa fa-angle-down ms-1"></i>
            </button>
            <div
              class="dropdown-menu dropdown-menu-end shadow-sm"
              aria-labelledby="dropdown-recent-orders-filters"
            >
              <a
                class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('todos')"
                href="javascript:void(0)"
              >
                Todos
              </a>
              <a
                class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('espera')"
                href="javascript:void(0)"
              >
                Espera
              </a>
              <a
                class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('eliminado')"
                href="javascript:void(0)"
              >
                Eliminados
              </a>
              <a
                class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('facturado')"
                href="javascript:void(0)"
              >
                Facturados
              </a>
              <a
                class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('traslado')"
                href="javascript:void(0)"
              >
                Traslado
              </a>
              <a
                class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('orden_de_compra')"
                href="javascript:void(0)"
              >
                Orden de Compra
              </a>
              <a
                class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('rechazado')"
                href="javascript:void(0)"
              >
                Rechazados
              </a>
              <a
                class="dropdown-item fw-medium d-flex align-items-center justify-content-between"
                @click="llenarpedidos('anulada')"
                href="javascript:void(0)"
              >
                Anulada
              </a>
            </div>
          </div>
        </div>
      </template>
      <Dataset
        v-slot="{ ds }"
        :ds-data="pedidos.data"
        :ds-sortby="sortBy"
        :ds-search-in="[
          'pedido',
          'cotizacion',
          'factura',
          'CLI_RAZON_SOCIAL',
          'CLI_RUC',
          'USERID',
          'COND_ID',
          'created_at',
          'cotizacion',
        ]"
      >
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
          <div class="spinner-border text-primary mt-4" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div
          class="row"
          v-if="verpedidos && pedidos.data.length && !pedidos.loading"
        >
          <div class="col-md-12">
            <div class="table-responsive">
              <table class="table table-sm table-hover table-vcenter mb-0">
                <thead>
                  <tr>
                    <th
                      v-for="(th, index) in cols"
                      :key="th.field"
                      :class="['sort', th.sort]"
                      @click="onSort($event, index)"
                      class="nowrap"
                    >
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
                        <a
                          href="javascript:void(0);"
                          @click="funcionverpedido(row)"
                          >{{ row.pedido }}</a
                        >
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
                        <a
                          v-if="row.estado === 'espera'"
                          href="javascript:void(0)"
                          class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-warning-light text-warning"
                          @click="motivoEspera(row)"
                        >
                          {{ row.estado }}
                        </a>

                        <span
                          v-else
                          class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                          @click="
                            row.estado === 'rechazado' &&
                            row.aprobado_comercial_mensaje
                              ? swalWarning(row.aprobado_comercial_mensaje)
                              : '' ||
                                (row.estado === 'rechazado' &&
                                  row.aprobado_crediticio_mensaje)
                              ? swalWarning(row.aprobado_crediticio_mensaje)
                              : ''
                          "
                          :class="
                            row.estado === 'facturado'
                              ? 'bg-success-light text-success'
                              : '' || row.estado === 'orden_de_compra'
                              ? 'bg-info-light text-info'
                              : '' || row.estado === 'traslado'
                              ? 'bg-danger-light text-danger'
                              : '' ||
                                (row.estado === 'rechazado' &&
                                  !row.aprobado_crediticio_mensaje)
                              ? 'bg-danger-light text-danger'
                              : '' ||
                                (row.estado === 'rechazado' &&
                                  row.aprobado_crediticio_mensaje)
                              ? 'pointer bg-danger-light text-danger'
                              : '' || row.estado === 'anulada'
                              ? 'bg-warning-light text-danger'
                              : ''
                          "
                        >
                          {{ row.estado }}
                        </span>
                      </td>
                      <td class="nowrap">
                        <span
                          v-if="row.estado === 'rechazado'"
                          class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger"
                        >
                          <i class="fa fa-circle-xmark"></i>
                        </span>
                        <span
                          v-else
                          class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                          :class="
                            row.imprimir === 'yes'
                              ? 'bg-success-light text-success'
                              : 'bg-warning-light text-warning'
                          "
                          :title="
                            row.imprimir === 'yes'
                              ? 'Pedido aprobado'
                              : 'Por aprobar'
                          "
                        >
                          <i
                            :class="
                              row.imprimir === 'yes'
                                ? 'fa fa-circle-check'
                                : 'fa fa-circle-xmark'
                            "
                          ></i>
                        </span>
                        <span
                          v-if="row.despachado === 1"
                          class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-info-light text-info mx-1"
                          title="Despachado"
                        >
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
                          v-if="
                            ((row.estado === 'espera' &&
                              row.factura_posterior_despacho === 1 &&
                              row.factura_a_demanda === 1 &&
                              row.despachado === 1) ||
                              (row.estado === 'espera' &&
                                (row.factura_a_demanda === 0 ||
                                  row.factura_a_demanda === null) &&
                                row.factura_siguiente_mes === 1) ||
                              (row.estado === 'espera' &&
                                (row.factura_a_demanda === 0 ||
                                  row.factura_a_demanda === null) &&
                                row.factura_siguiente_mes === 0 &&
                                row.origen === 'factura_demanda')) &&
                            !(
                              (row.requiere_aprobacion_comercial === 'yes' &&
                                row.aprobado_comercial === 'no') ||
                              (row.requiere_aprobacion_crediticia === 'yes' &&
                                row.aprobado_crediticio === 'no')
                            )
                          "
                          type="button"
                          class="btn btn-danger btn-sm mx-1"
                          title="Enviar a facturar"
                          @click="confirmfacturar(row)"
                        >
                          <i class="fa fa-file-invoice-dollar"></i>
                        </button>
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
                          <template v-if="row.imprimir === 'yes'">
                            <li
                              class="dropdown-header text-uppercase fs-xs fw-bold mt-1"
                            >
                              Exportar
                            </li>
                            <li>
                              <button
                                class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="imprimirpedido(row)"
                              >
                                <i class="fa fa-print text-white me-2"></i>
                                Pedido
                              </button>
                            </li>
                            <li>
                              <button
                                class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="imprimirpedidoimagenes(row)"
                              >
                                <i
                                  class="fa-solid fa-file-pdf text-danger me-2"
                                ></i>
                                Pedido
                              </button>
                            </li>
                            <li>
                              <button
                                class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="imprimirpedidoride(row)"
                              >
                                <i
                                  class="fa-solid fa-file-invoice text-primary me-2"
                                ></i>
                                RIDE
                              </button>
                            </li>
                            <li>
                              <button
                                class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="imprimirpedidoridesinimagen(row)"
                              >
                                <i
                                  class="fa-regular fa-file-pdf text-muted me-2"
                                ></i>
                                RIDE (Sin img)
                              </button>
                            </li>
                            <li>
                              <button
                                class="dropdown-item d-flex align-items-center gap-2 py-2"
                                @click="imprimirpedidoxml(row)"
                              >
                                <i
                                  class="fa-solid fa-code text-warning me-2"
                                ></i>
                                XML
                              </button>
                            </li>

                            <li class="dropdown-divider"></li>
                          </template>

                          <li
                            class="dropdown-header text-uppercase fs-xs fw-bold mt-1"
                          >
                            Gestión
                          </li>

                          <!-- volver a pedir -->
                          <li>
                            <button
                              class="dropdown-item d-flex align-items-center gap-2 py-2"
                              @click="recuperarpedido(row)"
                            >
                              <i
                                class="fa-solid fa-cart-plus fa-fw text-warning"
                              ></i>
                              <span>Volver a pedir</span>
                            </button>
                          </li>

                          <!-- copiar pedido -->
                          <li>
                            <button
                              class="dropdown-item d-flex align-items-center gap-2 py-2"
                              @click="levantarcliente(row)"
                            >
                              <i
                                class="fa-regular fa-clone fa-fw text-success"
                              ></i>
                              <span>Copiar</span>
                            </button>
                          </li>
                          <!-- actualizar datos de orden de compra y nota clientes antes de facturar un pedido -->
                          <li
                            v-if="
                              ![
                                'facturado',
                                'rechazado',
                                'anulada',
                                'eliminado',
                              ].includes(row.estado)
                            "
                          >
                            <button
                              class="dropdown-item d-flex align-items-center gap-2 py-2"
                              @click="operModalActualizarDatosPedido(row)"
                            >
                              <i
                                class="fa-solid fa-user-pen text-info me-2"
                              ></i>
                              Actualizar Datos
                            </button>
                          </li>
                          <li
                            v-if="
                              row.estado === 'espera' &&
                              ((row.requiere_aprobacion_comercial === 'yes' &&
                                row.aprobado_comercial === 'no') ||
                                (row.requiere_aprobacion_crediticia === 'yes' &&
                                  row.aprobado_crediticio === 'no'))
                            "
                          >
                            <div class="dropdown-divider my-2"></div>
                            <button
                              class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                              :disabled="loadingChange"
                              @click="rechazarPedidoEstadoEspera(row.id)"
                            >
                              <i class="fa-solid fa-ban fa-fw"></i>
                              <span class="fw-semibold">Rechazar</span>
                            </button>
                          </li>

                          <li>
                            <button
                              v-if="row.estado === 'enviando'"
                              class="dropdown-item d-flex align-items-center gap-2 py-2 text-danger"
                              :disabled="loadingChange"
                              @click="cancelOrderStatusSending(row.id)"
                            >
                              <i class="fa-solid fa-ban fa-fw"></i>
                              <span class="fw-semibold">Cancelar Enviando</span>
                            </button>
                          </li>
                        </ul>

                        <!-- dropdown -->
                      </td>
                    </tr>
                  </template>
                </DatasetItem>
              </table>
            </div>
          </div>
        </div>
        <div
          class="d-flex flex-md-row flex-column justify-content-between align-items-center"
        >
          <DatasetInfo class="py-3 fs-sm" />
          <DatasetPager class="flex-wrap py-3 fs-sm" />
        </div>
      </Dataset>
    </BaseBlock>
  </div>
  <!-- END Page Content -->
  <div
    class="modal"
    id="modal-pedido"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-pedido"
    aria-hidden="true"
    ref="verpedidoModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <VerPedidoModal
          :verpedido="verpedido"
          :indexPedido="indexPedido"
          :tipo="tipo"
          @consultarExistente="consultarExistente(verpedido)"
          @consultarDespachado="consultarDespachado(verpedido)"
          @cancelarPedido="cancelarPedido"
        ></VerPedidoModal>
      </div>
    </div>
  </div>
  <div
    class="modal"
    id="modal-facturarexistente"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-facturarexistente"
    aria-hidden="true"
    ref="facturarexistenteModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <FacturarExistenteModal
          :verpedido="verpedido"
          @cerrarFacturarExistente="cerrarFacturarExistente()"
        >
        </FacturarExistenteModal>
      </div>
    </div>
  </div>
  <div
    class="modal"
    id="modal-facturardespachado"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-facturardespachado"
    aria-hidden="true"
    ref="facturardespachadoModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <FacturarDespachadoModal
          :verpedido="verpedido"
          @cerrarFacturarDespachado="cerrarFacturarDespachado()"
        >
        </FacturarDespachadoModal>
      </div>
    </div>
  </div>
  <div
    class="modal"
    id="modal-levantar-cliente"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-levantar-cliente"
    aria-hidden="true"
    ref="levantarClienteModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <LevantarClienteModal
          :verpedido="verpedido"
          :tipo="tipo"
        ></LevantarClienteModal>
      </div>
    </div>
  </div>
  <!-- modal de filtro de clientes -->
  <div
    class="modal"
    id="modal-filtrar-cliente"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-filtrar-cliente"
    aria-hidden="true"
    ref="filtrarClienteModal"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
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

  <!-- modal de actualizacion de datos de orden y nota cliente -->
  <div
    class="modal"
    id="modal-noventa"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-noventa"
    aria-hidden="true"
    ref="verActualizarDatos"
  >
    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <verActualizarOrdYNotaModalComponent
          v-if="datosModalAcPedido && datosModalAcPedido.id"
          :pedido="datosModalAcPedido"
          @llenarPedidos="llenarpedidos('todos')"
          @closeModal="closeModalActualizarDatosPedido"
        >
        </verActualizarOrdYNotaModalComponent>
      </div>
    </div>
  </div>

  <!-- modal de actualizacion de fecha de facturacion de reserva -->

  <div
    class="modal"
    id="modal-noventa"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-noventa"
    aria-hidden="true"
    ref="verModalUpdateDateInvoice"
  >
    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <verActualizarFechaFacturaReserva
          v-if="datosModalPedidoAcDate && datosModalPedidoAcDate.id"
          :pedido="datosModalPedidoAcDate"
          @llenarPedidos="llenarpedidos('todos')"
          @closeModal="closeModalUpdateDateInvoice"
        >
        </verActualizarFechaFacturaReserva>
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
  /* Asegura que el fondo sea sólido y no transparente */

  /* Asegura que el menú flote por encima de las otras filas de la tabla */
  z-index: 9999 !important;

  /* Borde sutil */
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>