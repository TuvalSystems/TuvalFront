<template>
  <!-- Hero -->
  <BasePageHeading
    title="Liberar órdenes de despacho"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Liberar órdenes de despacho</li>
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
            <button type="button" title="Refrescar tabla" @click="refrescar()" class="btn btn-success btn-sm"><i class="si si-refresh"></i></button>
          </div>
        </div>
      </template>
      <Dataset
        v-slot="{ ds }"
        :ds-data="ordenes_despacho_pendientes"
        :ds-sortby="sortBy"
        :ds-search-in="['orden', 'numero_pedido', 'CLI_RAZON_SOCIAL', 'CLI_RUC', 'BOD_BODEGA', 'fecha_pedido', 'fecha_entrega', 'total']"
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
        <div class="row" v-if="!ordenes_despacho_pendientes_loading && ordenes_despacho_pendientes.length">
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
                  </tr>
                </thead>
                <DatasetItem tag="tbody" class="fs-sm">
                  <template #default="{ row }">
                    <tr>
                      <td class="fs-sm">
                        {{ row.orden }}
                      </td>
                      <td class="fs-sm">
                        <a href="javascript:void(0);" @click="funcionverpedido(row.pedido, index)">{{ row.numero_pedido }}</a>
                      </td>
                      <td class="fs-sm">
                        {{ row.CLI_RAZON_SOCIAL }}
                      </td>
                     
                      <td class="fs-sm">
                        {{ row.BOD_BODEGA }}
                      </td>
                      <td class="fs-sm">
                        {{ row.fecha_pedido }}
                      </td>
                      <td class="fs-sm">
                        {{ row.fecha_entrega }}
                      </td>
                      <td class="text-end fs-sm">
                        ${{ formatPriceJm(row.total) }}
                      </td>
                      <td class="text-end">
                        <div class="btn-group">
                          <button type="button" class="btn btn-sm btn-success mx-2" @click="confirmLiberar(row)">
                            <i class="fa fa-check"></i> Liberar
                          </button>
                          <!-- <button type="button" class="btn btn-sm btn-danger mx-2" @click="confirmRechazar(row)">
                            <i class="fa fa-xmark"></i> Rechazar
                          </button> -->
                        </div>
                      </td>
                    </tr>
                  </template>
                </DatasetItem>
              </table>
            </div>
          </div>
        </div>
        <div v-if="!ordenes_despacho_pendientes_loading && ordenes_despacho_pendientes.length === 0" class="text-center">
          No hay datos
        </div>
        <div v-if="ordenes_despacho_pendientes_loading" class="text-center">
          <div class="spinner-border text-primary mt-4" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div class="d-flex flex-md-row flex-column justify-content-between align-items-center">
          <DatasetInfo class="py-3 fs-sm" />
          <DatasetPager class="flex-wrap py-3 fs-sm" />
        </div>
      </Dataset>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
  <div
  
    class="modal"
    id="modal-liberar"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-liberar"
    aria-hidden="true"
    ref="liberarModal"
    >
    <div  class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <div v-if="currentOrden" class="block-rounded block-transparent block mb-0">
          <div class="block-header block-header-default">
            <h3 class="block-title"> Liberar orden de despacho {{ currentOrden.orden }}</h3>
            <div class="block-options space-x-1">
              <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                <i class="fa fa-fw fa-times"></i>
              </button>
            </div>
          </div>
          <div class="block-content fs-sm">
            <div class="mb-4">
              <label class="form-label" for="example-textarea-input">Comentario</label>
              <textarea v-model="motivo" class="form-control" rows="3"></textarea>
            </div>
          </div>
          <div class="block-content block-content-full text-end bg-body">
            <button type="button" class="btn btn-sm btn-alt-secondary mx-2" data-bs-dismiss="modal"> Cancelar </button>
            <button type="button" class="btn btn-sm btn-success mx-2" @click="liberarOrden(currentOrden)"> <i class="fa fa-check"></i> Liberar órden de despacho</button>
          </div>
        </div>
      </div>
    </div>
  </div>
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
          ></VerPedidoModal>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted  } from "vue";
import { useStore} from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import { Modal } from "bootstrap";
import VerPedidoModal from "../ventas/modals/VerPedidoModal.vue"
import { formatPriceJm } from "@/functions";

// Helper variables
const cols = reactive([
  {
    name: "#Orden",
    field: "orden",
    sort: "",
  },
  {
    name: "#Pedido",
    field: "numero_pedido",
    sort: "",
  },
  {
    name: "Cliente",
    field: "CLI_RAZON_SOCIAL",
    sort: "",
  },
  {
    name: "Bodega",
    field: "BOD_BODEGA",
    sort: "",
  },
  {
    name: "F. Pedido",
    field: "fecha_pedido",
    sort: "",
  },
  {
    name: "F. Entrega",
    field: "fecha_entrega",
    sort: "",
  },
  {
    name: "Total",
    field: "total",
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

const ordenes_despacho_pendientes = computed(() => store.state.ordenes_despacho_pendientes);
const ordenes_despacho_pendientes_loading = computed(() => store.state.ordenes_despacho_pendientes_loading);
const store = useStore();
const currentOrden = ref(null);
const motivo = ref(null);
const verpedido = ref({});
const indexPedido = ref(null);
const tipo = ref(null);

let liberarModal= ref(null);
let liberarModalObj = null;

let verpedidoModal= ref(null);
let verpedidoModalObj = null;

refrescar()
function refrescar(){
  store.commit('resetOrdenesDespachoPendientes');
  store.dispatch('ordenesDespachoPendientes');
}

async function funcionverpedido(pedido) {
  verpedidoModalObj.show();
  verpedido.value = pedido;
  tipo.value = 'pedido';
  store.dispatch('detallepedido', pedido).then(() => {
    const elem = document.getElementById('btabs-alt-static-detalle-tab');
    if(elem)
      elem.click();
  });
}

function confirmRechazar(orden) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De rechazar la orden "+orden.orden,
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, rechazarla",
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
        rechazarOrden(orden)
      }
    });
}

function rechazarOrden(orden){

  store.dispatch('rechazarOrdenDespacho', orden.id).then( (res) => {
    store.dispatch('ordenesDespachoPendientes');
  })
}

function confirmLiberar(orden) {
  currentOrden.value = orden;
  liberarModalObj.show();
}

async function liberarOrden(orden){
  liberarModalObj.hide();
   const data = reactive({
    id: orden.id,
    motivo: motivo.value
  });
  store.commit('setOrdenesDespachoPendientesLoading', true);
  store.dispatch('liberarOrdenDespacho', data)
  .then((result) => {
    if(result.success){
      swalSuccess(result.message);
      store.commit('setOrdenesDespachoPendientesLoading', false);
      store.dispatch('ordenesDespachoPendientes');
    }else{
      swalError(result.message);
    }
    
  });
  motivo.value = null;
}

onMounted(() => {
  liberarModalObj = new Modal(liberarModal.value);
  verpedidoModalObj = new Modal(verpedidoModal.value);
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