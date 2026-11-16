<template>
  <Dataset
    v-slot="{ ds }"
    :ds-data="pedidos.data"
    :ds-sortby="sortBy"
    :ds-search-in="['pedido', 'factura', 'USERID', 'COND_ID', 'created_at']"
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
    <div class="row" v-if="!pedidos.loading && pedidos.data.length">
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
                <th style="width: 180px"></th>
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
                    {{ row.factura }}
                  </td>
                  <td class="fs-sm">
                    {{ row.USERID }}
                  </td>
                  <td class="fs-sm">
                    {{ row.created_at }}
                  </td>
                  <td class="fs-sm text-end">
                    ${{ format(parseFloat(row.total)) }}
                  </td>
                  <td class="text-center">
                    <span
                      v-if="row.orden_despacho"
                      class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-success-light text-success mx-1"
                      title="Liberada"
                    >
                      <i class="fa fa-check-circle"></i>
                    </span>
                    <span
                      v-else
                      class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger mx-1"
                      title="Pendiente"
                    >
                      <i class="fa fa-xmark"></i>
                    </span>
                  </td>
                  <td class="text-center">
                    <span
                      v-if="row.despachado === 1"
                      class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-info-light text-info mx-1"
                      title="Despachado"
                    >
                      <i class="fa fa-truck-fast"></i>
                    </span>
                    <span
                      v-else
                      class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger mx-1"
                      title="No despachada"
                    >
                      <i class="fa fa-xmark"></i>
                    </span>
                  </td>
                  <td class="fs-sm text-end nowrap">
                    <div v-if="loadingSolicitud && verpedidodevolucion?.id === row.id" class="text-center">
                      <div
                        class="spinner-border spinner-border-sm text-primary"
                        role="status"
                      >
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <button
                      v-else
                      type="button"
                      class="btn btn-primary btn-sm mx-1"
                      :disabled="loadingSolicitud"
                      @click="solicitardevolucion(row)"
                    >
                      <i class="fa fa-arrow-right-arrow-left"></i> Solicitar
                      devolución
                    </button>
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
  <div
    class="modal"
    id="modal-pedido"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-pedido"
    aria-hidden="true"
    ref="verpedidoModal"
    v-if="verpedido"
  >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <VerPedidoModal
          :verpedido="verpedido"
          :indexPedido="indexPedido"
          :tipo="tipo"
         @update:verpedido="Object.assign(verpedido, $event)"></VerPedidoModal>
      </div>
    </div>
  </div>
  <BaseModal
    id="modal-solicitar-devolucion"
    ref="solicitarDevolucionModal"
    title="Solicitar Devolución"
    :busy="loadingSolicitud || enviandoSolicitud"
    body-class="p-0"
    @hidden="limpiarSolicitud"
  >
    <template #header-actions>
      <span
        v-if="verpedidodevolucion?.despachado === 1"
        class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-info-light text-info mx-1"
      >
        <i class="fa fa-truck-fast"></i> Despachado
      </span>
    </template>
    <div v-if="loadingSolicitud" class="text-center py-4" role="status">
      <span class="spinner-border text-primary"></span>
      <span class="visually-hidden">Cargando datos de devolución...</span>
    </div>
    <SolicitarDevolucion
      v-else-if="infoSolicitud && verpedidodevolucion"
      :verpedido="verpedidodevolucion"
      :info="infoSolicitud"
      @enviarDevolucion="enviarDevolucion"
      @cerrar="solicitarDevolucionModal?.hide()"
      @enviando="enviandoSolicitud = $event"
    />
  </BaseModal>
</template>
<script setup>
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useStore } from "vuex";
import { Modal } from "bootstrap";
import BaseModal from "@/components/BaseModal.vue";
import SolicitarDevolucion from "../modals/SolicitarDevolucion.vue";
import VerPedidoModal from "../../ventas/modals/VerPedidoModal.vue";
import { swalError, swalWarning } from "@/functions/swal-alert.js";
import { format } from "@/functions";
import { useOrderReturnData } from "@/composables/devoluciones/useOrderReturnData";

const store = useStore();
const {
  loading: loadingSolicitud,
  info: infoSolicitud,
  fetchOrderReturnData,
  resetOrderReturnData,
} = useOrderReturnData();
const enviandoSolicitud = ref(false);
const pedidos = computed(() => store.state.pedidos);
const verpedido = ref({});
const indexPedido = ref(null);
const verpedidodevolucion = ref(null);
const tipo = ref(null);

let verpedidoModal = ref(null);
let verpedidoModalObj = null;
let solicitarDevolucionModal = ref(null);

const emit = defineEmits(["recargarCliente"]);

async function funcionverpedido(pedido) {
  verpedidoModalObj.show();
  verpedido.value = pedido;
  tipo.value = "pedido";
  store.dispatch("detallepedido", pedido).then(() => {
    const elem = document.getElementById("btabs-alt-static-detalle-tab");
    if (elem) elem.click();
  });
}

async function solicitardevolucion(pedido) {
  if (loadingSolicitud.value || enviandoSolicitud.value) return;
  verpedidodevolucion.value = { ...pedido };
  const result = await fetchOrderReturnData(pedido.id);
  if (!result.ok) {
    limpiarSolicitud();
    if (!result.handled && !result.canceled) {
      const message =
        result.message || "No se pudo obtener la información de la devolución.";
      (result.status >= 500 ? swalError : swalWarning)(message);
    }
    return;
  }

  await nextTick();
  solicitarDevolucionModal.value?.show();
}
function limpiarSolicitud() {
  resetOrderReturnData();
  verpedidodevolucion.value = null;
  enviandoSolicitud.value = false;
}

// Helper variables
const cols = reactive([
  {
    name: "Pedido",
    field: "pedido",
    sort: "",
  },
  {
    name: "Factura",
    field: "factura",
    sort: "",
  },
  {
    name: "Usr.",
    field: "USERID",
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
    name: "Orden desp.",
    field: "orden_despacho",
    sort: "",
  },
  {
    name: "Despachado",
    field: "despachado",
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

function enviarDevolucion() {
  solicitarDevolucionModal.value.hide();
  emit("recargarCliente");
}

onMounted(() => {
  verpedidoModalObj = new Modal(verpedidoModal.value);
});
</script>
