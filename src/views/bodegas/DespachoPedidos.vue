<template>
  <!-- Hero -->
  <BasePageHeading title="Despacho Pedidos">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Bodegas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Despacho Pedidos</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <BaseBlock title="Órdenes de despacho pendientes">
      <template #options>
        <div class="space-x-1">
          <div class="block-options-item">
            <template
              v-if="
                user.perfil_id === 1 ||
                user.perfil_id === 2 ||
                user.perfil_id === 31
              "
            >
              <button
                v-if="loading_todas || ordenes_despacho_loading"
                type="button"
                class="btn btn-sm btn-alt-info mx-1"
                title="Consultar detalle"
              >
                <div class="spinner-border spinner-border-sm text-primary">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </button>

              <button
                v-else
                type="button"
                class="btn btn-sm btn-alt-info mx-1"
                @click="getDescripcionTodas()"
                title="Consultar detalle"
              >
                <i class="fa fa-eye"></i> Consultar todas
              </button>
            </template>
            <button
              type="button"
              title="Refrescar tabla"
              @click="refrescar()"
              class="btn btn-success btn-sm"
            >
              <i class="si si-refresh"></i>
            </button>
          </div>
        </div>
      </template>
      <Dataset
        v-slot="{ ds }"
        :ds-data="ordenes_despacho"
        :ds-sortby="sortBy"
        :ds-search-in="[
          'orden',
          'numpedido',
          'factura',
          'CLI_RAZON_SOCIAL',
          'CLI_RUC',
          'BOD_BODEGA',
          'fecha',
          'total',
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
        <div class="row" v-if="ordenes_despacho">
          <div class="col-md-12">
            <div class="table-responsive">
              <table
                class="table table-sm fs-sm table-hover table-vcenter mb-0"
              >
                <thead>
                  <tr>
                    <th></th>
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
                  </tr>
                </thead>
                <DatasetItem tag="tbody" class="fs-sm">
                  <template #default="{ row, index }">
                    <tr
                      :class="
                        row.guias && row.guias.length
                          ? 'table-success'
                          : '' || (row.guias && row.enviadas)
                          ? 'table-warning'
                          : ''
                      "
                    >
                      <td>{{ index + 1 }}</td>
                      <td class="fs-sm">
                        <a
                          href="javascript:void(0);"
                          @click="verOrdenDespacho(row)"
                          >{{ row.orden }}</a
                        >
                      </td>
                      <td class="fs-sm">
                        {{ row.numpedido }}
                      </td>
                      <td class="fs-sm">
                        {{ row.factura }}
                      </td>
                      <td class="fs-sm">
                        {{ row.CLI_RAZON_SOCIAL }}
                      </td>
                      <td class="fs-sm">
                        {{ row.direccion }}
                      </td>
                      <td class="fs-sm">
                        {{ row.ciudad }}
                      </td>
                      <td class="fs-sm">
                        {{ row.despacho }}
                      </td>
                      <td class="fs-sm text-end">
                        {{ formatPrice(row.peso) }}
                      </td>
                      <td class="fs-sm">
                        {{ row.fecha }}
                      </td>
                      <td class="fs-sm">
                        {{ row.fecha_entrega }}
                      </td>
                      <td class="fs-sm text-end">
                        {{ row.dias }}
                      </td>
                      <td
                        class="text-end nowrap"
                        v-if="!row.sindetalle"
                        style="min-width: 146px"
                      >
                        <button
                          title="Reporte Picking"
                          type="button"
                          class="btn btn-sm btn-alt-info mx-2"
                          @click="verPicking(row)"
                        >
                          <i class="fa fa-people-carry-box"></i>
                        </button>
                        <button
                          title="Generar guía"
                          v-if="row.pedido.despacho_en_proceso === 1"
                          type="button"
                          class="btn btn-sm btn-alt-primary mx-2"
                          @click="guiaRemision(row)"
                        >
                          <i class="fa fa-file-lines"></i>
                        </button>
                        <button
                          v-if="
                            row.pedido.despacho_en_proceso === 1 &&
                            !row.guias.length
                          "
                          type="button"
                          class="btn btn-sm btn-alt-danger mx-2"
                          @click="cancelarProceso(row)"
                          title="Cancelar proceso de despacho"
                        >
                          <i class="fa fa-xmark"></i>
                        </button>
                      </td>
                      <td v-else style="min-width: 146px" class="text-center">
                        <div v-if="row.loading" class="text-center">
                          <div
                            class="spinner-border spinner-border-sm text-primary"
                          >
                            <span class="visually-hidden">Loading...</span>
                          </div>
                        </div>
                        <button
                          v-else
                          type="button"
                          class="btn btn-sm btn-alt-info mx-2"
                          @click="getDescripcion(row)"
                          title="Consultar detalle"
                        >
                          <i class="fa fa-eye"></i> Consultar
                        </button>
                      </td>
                      <td>
                        <button
                          v-if="
                            row.pedido_imagenes && row.pedido_imagenes.length
                          "
                          class="btn btn-success btn-sm"
                          type="button"
                          @click="showPhoto(row.pedido_imagenes)"
                        >
                          <i class="fa fa-search"></i>
                        </button>
                      </td>
                    </tr>

                    <tr v-if="row.guias.length">
                      <td colspan="13">
                        <table class="table table-sm fs-sm">
                          <thead>
                            <tr>
                              <th>No. de Guía</th>
                              <th>Fecha</th>
                              <th>Transportista</th>
                              <th>Vehículo</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="(guia, index) in row.guias" :key="index">
                              <td>{{ guia.GUI_REM_GUIA_REMISION }}</td>
                              <td>{{ guia.GUI_REM_FECHA_INICIO }}</td>
                              <td>
                                {{ guia.GUI_REM_RAZON_SOCIAL_TRANSPORTISTA }}
                              </td>
                              <td>{{ guia.GUI_REM_PLACA }}</td>
                              <td class="text-end">
                                <button
                                  type="button"
                                  class="btn btn-outline-primary btn-sm mx-2"
                                  @click="imprimirGuia(guia)"
                                >
                                  <i class="fa fa-print"></i> Imprimir
                                </button>
                                <button
                                  type="button"
                                  class="btn btn-outline-success btn-sm mx-2"
                                  :disabled="loadingDispatch"
                                  @click="confirmDespacharGuia(guia)"
                                >
                                  <i class="fa fa-print"></i> Despachar
                                </button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  </template>
                </DatasetItem>
              </table>
            </div>
          </div>
        </div>
        <div
          v-if="!ordenes_despacho_loading && ordenes_despacho.length === 0"
          class="text-center"
        >
          No hay datos
        </div>
        <div v-if="ordenes_despacho_loading" class="text-center">
          <div class="spinner-border text-primary mt-4">
            <span class="visually-hidden">Loading...</span>
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
    <div class="col-md-12">
      <p class="alert alert-warning float-end mx-2">Despachos parciales</p>
      <p class="alert alert-success float-end mx-2">Guías pendientes</p>
    </div>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
  <div
    class="modal"
    id="modal-liberar"
    tabindex="-1"
    aria-labelledby="modal-liberar"
    aria-hidden="true"
    ref="pickingModal"
  >
    <div class="modal-dialog modal-xl modal-md modal-dialog-centered">
      <div class="modal-content">
        <Picking :verpedido="verpedido"></Picking>
      </div>
    </div>
  </div>

  <div
    class="modal"
    id="modal-guiaremision"
    tabindex="-1"
    aria-labelledby="modal-guiaremision"
    aria-hidden="true"
    ref="guiaremisionModal"
  >
    <div class="modal-dialog modal-xl modal-md modal-dialog-centered">
      <div class="modal-content">
        <GuiaRemision
          :verpedido="verpedido"
          @generarGuia="generarGuia"
        ></GuiaRemision>
      </div>
    </div>
  </div>

  <div
    class="modal"
    id="modal-ordendespacho"
    tabindex="-1"
    aria-labelledby="modal-ordendespacho"
    aria-hidden="true"
    ref="ordendespachoModal"
  >
    <div class="modal-dialog modal-xl modal-md modal-dialog-centered">
      <div class="modal-content">
        <OrdenDespacho
          v-if="currentOrden && documentosPdf"
          :verpedido="verpedido"
          :currentOrden="currentOrden"
          :documentosPedidos="documentosPdf"
        ></OrdenDespacho>
      </div>
    </div>
  </div>
  <VueEasyLightbox
    :visible="gallery.visible"
    :index="gallery.index"
    :imgs="gallery.photos"
    @hide="handleHide"
  />
</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore } from "vuex";
import { useTemplateStore } from "@/stores/template";
import { Modal } from "bootstrap";
import {
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";

import Picking from "./modals/Picking.vue";
import GuiaRemision from "./modals/GuiaRemision.vue";
import OrdenDespacho from "./modals/OrdenDespacho.vue";
import { formatPrice } from "@/functions";
import VueEasyLightbox from "vue-easy-lightbox";
import { useDispatchGuideProcess } from "@/composables/bodegas/despachos/useDispatchGuideProcess";

const { loadingDispatch, dispathGuide } = useDispatchGuideProcess();
// Helper variables
const cols = reactive([
  {
    name: "#Orden",
    field: "orden",
    sort: "",
  },
  {
    name: "#Pedido",
    field: "numpedido",
    sort: "",
  },
  {
    name: "#Factura",
    field: "factura",
    sort: "",
  },
  {
    name: "Cliente",
    field: "CLI_RAZON_SOCIAL",
    sort: "",
  },
  {
    name: "Dirección",
    field: "direccion",
    sort: "",
  },
  {
    name: "Ciudad",
    field: "direccion",
    sort: "",
  },
  {
    name: "Despacho",
    field: "despacho",
    sort: "",
  },
  {
    name: "Peso",
    field: "peso",
    sort: "",
  },
  {
    name: "F. Liberación",
    field: "fecha",
    sort: "",
  },
  {
    name: "F. Entrega",
    field: "fecha_entrega",
    sort: "",
  },
  {
    name: "Días",
    field: "dias",
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
const ordenes_despacho = computed(() => store.state.ordenes_despacho);
const ordenes_despacho_loading = computed(
  () => store.state.ordenes_despacho_loading
);
const ultimaguia = computed(() => store.state.ultimaguia);
const user = computed(() => store.state.user.data);

const currentOrden = ref(null);
const loading_todas = ref(false);
const verpedido = ref({});

let pickingModal = ref(null);
let pickingModalObj = null;

let guiaremisionModal = ref(null);
let guiaremisionModalObj = null;

let ordendespachoModal = ref(null);
let ordendespachoModalObj = null;

const documentosPdf = ref(null);
function verOrdenDespacho(orden) {
  currentOrden.value = orden;
  verpedido.value = orden.pedido;
  documentosPdf.value = orden.documentosPdf;
  ordendespachoModalObj.show();
  store.dispatch("verOrdenDespacho", orden.id);
}
function generarGuia() {
  guiaremisionModalObj.hide();
  refrescarDespacho();
}

store.dispatch("getTransportistas");
refrescar();

function refrescar(imprimir = false) {
  store.commit("resetOrdenesDespacho");
  store
    .dispatch("ordenesDespachoSinDetalle")
    .then(() => {
      if (imprimir) {
        imprimirGuia(ultimaguia.value);
        despacharguiaGuia(ultimaguia.value);
      }
    })
    .catch((error) => {
      console.log("error" + error);
    });
}

async function refrescarDespacho() {
  templateStore.pageLoader({ mode: "on" });
  try {
    await store.dispatch("getUltimaGuia");
    const guia = ultimaguia.value;
    if (!guia) {
      throw new Error("No se encontró la última guía de remisión.");
    }
    await Promise.allSettled([imprimirGuia(guia), despacharguiaGuia(guia)]);
  } catch (error) {
    console.error("Error al actualizar el despacho:", error);
    swalError("No se pudo actualizar el despacho.");
  } finally {
    templateStore.pageLoader({ mode: "off" });
  }
}

function getDescripcion(orden) {
  orden.loading = true;
  store
    .dispatch("descripcionOrdenDespacho", orden.id)
    .then((res) => {
      if (res.success) {
        orden.loading = false;
        orden.sindetalle = false;
        orden.peso = res.orden.peso;
        orden.guias = res.orden.guias;
        orden.enviadas = res.orden.enviadas;
      } else {
        orden.loading = false;
      }
    })
    .catch(() => {
      orden.loading = false;
    });
}

function getDescripcionTodas() {
  loading_todas.value = true;
  ordenes_despacho.value.map(async (orden) => {
    if (orden.sindetalle) {
      getDescripcion(orden);
    }
  });
  loading_todas.value = false;
}

async function imprimirGuia(guia) {
  return store
    .dispatch("imprimir", "/bodegas/guiasderemision/imprimirguia/" + guia.id)
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute(
          "download",
          "guia-" + guia.GUI_REM_GUIA_REMISION + ".pdf"
        );
        document.body.appendChild(link);
        link.click();
      }
    })
    .catch((error) => {
      console.error("Error al imprimir la guía:", error);
      // Aquí puedes mostrar una notificación al usuario
      swalError("Error al imprimir la guía.");
    });
}

function verPicking(orden) {
  orden.pedido.despacho_en_proceso = 1;
  currentOrden.value = orden;
  verpedido.value = orden.pedido;
  pickingModalObj.show();
  store.dispatch("detallePicking", orden.pedido.id);
}

function guiaRemision(orden) {
  store.commit("resetTransportista");
  store.commit("resetVehiculo");
  store.commit("resetFlatPickrState");
  store.commit("setGenerar", false);
  currentOrden.value = orden;
  store.dispatch("detalleOrdenDespacho", orden.pedido.id).then((res) => {
    if (res.success === true) {
      guiaremisionModalObj.show();
      verpedido.value = orden;
    } else {
      swalWarning(res.message);
    }
  });
}

function cancelarProceso(orden) {
  orden.pedido.despacho_en_proceso = 0;
  store.dispatch("cancelarProcesoDespacho", orden.pedido.id);
}

function confirmDespacharGuia(guia) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De despachar la guía de remisión " + guia.GUI_REM_GUIA_REMISION,
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, despacharla",
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
        despacharguiaGuia(guia);
      }
    });
}

async function despacharguiaGuia(guia) {
  let indexorden = ordenes_despacho.value.findIndex(
    (orden) => orden.pedido_id === parseInt(guia.pedido.replace("PED", ""))
  );
  const respDispatch = await dispathGuide(guia.id);
  if (!respDispatch?.ok) {
    if (respDispatch?.status >= 400 && respDispatch?.status < 500) {
      swalWarning(respDispatch?.message);
    }
    if (respDispatch?.status >= 500) {
      swalError(respDispatch?.message);
    }
    return;
  }

  let order = respDispatch.data.pedido;
  if (order.despachado) {
    store.commit("eliminaDespacho", indexorden);
  } else {
    getDescripcion(ordenes_despacho.value[indexorden]);
  }
  swalSuccess(respDispatch.message);
}

/** visualizacion de imagenes de operaciones en ordenes de despacho */
const gallery = reactive({
  visible: false,
  index: 0,
  photos: [],
});
function showPhoto(imagenes) {
  gallery.index = 0;
  gallery.visible = true;
  gallery.photos = imagenes.map((imagen) => imagen.url);
}

function handleHide() {
  gallery.visible = false;
}

onMounted(() => {
  pickingModalObj = new Modal(pickingModal.value);
  guiaremisionModalObj = new Modal(guiaremisionModal.value);
  ordendespachoModalObj = new Modal(ordendespachoModal.value);

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
