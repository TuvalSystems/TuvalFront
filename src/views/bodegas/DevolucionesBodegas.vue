<template>
  <!-- Hero -->
  <BasePageHeading
      title="Recibir devoluciones"
  >
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Bodegas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Devoluciones</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <BaseBlock title="Recibir devoluciones">
      <template #options>
        <div class="block-options-item">
          <button type="button" title="Refrescar tabla" @click="refrescar()" class="btn-block-option"><i class="si si-refresh"></i></button>
        </div>
      </template>
      <Dataset
        v-slot="{ ds }"
        :ds-data="devoluciones_por_recibir.data"
        :ds-sortby="sortBy"
        :ds-search-in="['devolucion', 'CLI_RAZON_SOCIAL', 'CLI_RUC', 'USERID', 'COND_ID', 'created_at']"
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
        <div v-if="devoluciones_por_recibir.loading" class="text-center">
          <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
        </div>
        <div class="row" v-if="devoluciones_por_recibir.data.length && !devoluciones_por_recibir.loading">
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
                  >
                    {{ th.name }} <i class="gg-select float-end"></i>
                  </th>
                  <th></th>
                </tr>
                </thead>
                <DatasetItem tag="tbody" class="fs-sm">
                  <template #default="{ row, index }">
                    <tr
                        :id="'pedido-'+index"
                        :class="row.chao ? 'hide':''"
                    >
                      <td class="fs-sm">
                        <a href="javascript:void(0);" @click="funcionverdevolucion(row)">{{ row.devolucion }}</a>
                      </td>
                      <td class="fs-sm">
                        {{  row.CLI_RAZON_SOCIAL }}
                      </td>
                      <td class="fs-sm">
                        {{ row.CLI_RUC }}
                      </td>
                      <td class="fs-sm">
                        {{ row.USERID }}
                      </td>
                      <td class="fs-sm">
                        {{ row.PTO_VTA_DESCRIPCION }}
                      </td>
                      <td class="fs-sm">
                        {{ row.created_at }}
                      </td>


                      <td class="text-center">
                        <span v-if="row.volver_a_facturar === 1" class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-success-light text-success mx-1" title="Despachado">
                          <i class="fa fa-check-circle"></i> Si
                        </span>
                        <span v-else class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger mx-1" title="Despachado">
                          <i class="fa fa-xmark"></i> No
                        </span>
                      </td>
                      <td class="fs-sm text-center nowrap">
                        <button type="button" class="btn btn-primary btn-sm " @click="funcionverdevolucion(row)"> <i class="fa fa-gear"></i> Recibir </button>
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
      <div
        class="modal"
        id="modal-pedido"
        tabindex="-1"
        role="dialog"
        aria-labelledby="modal-pedido"
        aria-hidden="true"
        ref="verDevolucionModal"
       >
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
          <div class="modal-content">
            <VerDevolucionRecibirModal
                :verdevolucion="verdevolucion"
                @rechazar="rechazarDevolucion(verdevolucion)"
                @recibir="recibirDevolucion(verdevolucion)"
            ></VerDevolucionRecibirModal>
          </div>
        </div>
      </div>
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
</template>
<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { useStore} from 'vuex'
import { Modal } from "bootstrap";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";

import VerDevolucionRecibirModal from "./modals/VerDevolucionRecibirModal.vue";


// Helper variables
const cols = reactive([
  {
    name: "Devolucion",
    field: "devolucion",
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
    name: "Punto de venta",
    field: "PTO_VTA_DESCRIPCION",
    sort: "",
  },
  {
    name: "Fecha/hora",
    field: "created_at",
    sort: "",
  },
  {
    name: "Refactura",
    field: "volver_a_facturar",
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

let errorMsg = ref('');
const store = useStore();

const devoluciones_por_recibir = computed(() => store.state.devoluciones_por_recibir);

refrescar();

function refrescar(){
  store.dispatch('verDevolucionesPorRecibir');
}

function recibirDevolucion(pedido){
  pedido.chao = true;
  verDevolucionModalObj.hide();
  refrescar();
}

function confirmRechazarPedido(pedido){
  toast
      .fire({
        title: "Estás seguro?",
        text: "De rechazar el pedido "+pedido.pedido +"",
        icon: "warning",
        showCancelButton: true,
        customClass: {
          confirmButton: "btn btn-danger m-1",
          cancelButton: "btn btn-secondary m-1",
        },
        confirmButtonText: "Si, rechazarlo",
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
          rechazarDevolucion(pedido);
        }
      });
}

function rechazarDevolucion(pedido){
  pedido.chao = true;
  verDevolucionModalObj.hide();
  store.dispatch('rechazarDevolucion', pedido).then(() => {
  }).catch(err => {
    errorMsg.value = err.response.data.error
  });
}


const verdevolucion = ref({});
const indexPedido = ref(null);
const tipo = ref(null);

async function funcionverdevolucion(pedido) {
  store.commit("setGenerar", false);
  verDevolucionModalObj.show();
  verdevolucion.value = pedido;
  await store.dispatch('detalleDevolucion', pedido);
}

function verdiferenciacondicion(pedido){
  swalInfo('Cambio condición de pago', 'de <b>'+ pedido.COND_ID_ORIGINAL + '</b> a <b>' + pedido.COND_ID + '</b>');
}

let verDevolucionModal= ref(null);
let verDevolucionModalObj = null;


onMounted(() => {

  verDevolucionModalObj = new Modal(verDevolucionModal.value);
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