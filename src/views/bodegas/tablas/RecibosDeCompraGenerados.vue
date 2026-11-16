<template>
  <Dataset
    v-slot="{ ds }"
    :ds-data="recibosdecompral.data"
    :ds-sortby="sortBy"
    :ds-search-in="['ORDEN_COMPRA_DOCUMENTO', 'ORDEN_COMPRA_DOCU_ORIGEN','PROV_RAZON_SOCIAL', 'ORDEN_COMPRA_ID_PROVEEDOR' , 'ORDEN_COMPRA_FECHA_ENTREGA', 'ORDEN_COMPRA_DIRECCION']"
    >
    <div class="row" :data-page-count="ds.dsPagecount">
      <div id="datasetLengthPedidos" class="col-md-8 py-2">
        <DatasetShow />
      </div>
      <div class="col-md-4 py-2">
        <DatasetSearch ds-search-placeholder="Buscar..." />
      </div>
    </div>
    <hr />
    <div v-if="recibosdecompral.loading" class="text-center">
      <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>
    <div class="row" v-if="recibosdecompral.data.length && !recibosdecompral.loading">
      <div class="col-md-12">
        <div class="table-responsive">
          <table class="table table-hover table-vcenter mb-0 fs-sm table-sm">
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
              </tr>
            </thead>
            <DatasetItem tag="tbody" class="fs-sm">
              <template #default="{ row, index }">
                <tr
                  :id="'recibodecompral-'+index"
                  :class="row.chao ? 'hide':''"
                  >
                  <td class="fs-sm">
                    <a href="javascript:void(0);" @click="funcionverrecibodecompra(row)">{{ row.ORDEN_COMPRA_DOCUMENTO }}</a>
                  </td>
                  <td class="fs-sm">
                      {{  row.ORDEN_COMPRA_DOCU_ORIGEN }}
                  </td>
                  <td class="fs-sm">
                    {{ row.vendedor }}
                  </td>
                  <td class="fs-sm">
                    {{ row.USERID }}
                  </td>
                  <td class="fs-sm">
                      {{ row.PROV_RAZON_SOCIAL }}
                  </td>
                  <td class="fs-sm">
                      {{ row.ORDEN_COMPRA_ID_PROVEEDOR }}
                  </td>
                  <td class="fs-sm">
                      {{ row.ORDEN_COMPRA_FECHA_ENTREGA }}
                  </td>
                  <td class="fs-sm">
                      {{ row.CLI_RAZON_SOCIAL }}
                  </td>

                  <td class="fs-sm text-center nowrap">
                    <button  type="button" class="btn btn-primary btn-sm " @click="funcionverrecibodecompra(row)"><i class="fa fa-gear"></i> Procesar</button>
                    
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
  <!-- Large Block Modal -->
  <div
    class="modal"
    id="modal-pedido"
    tabindex="-1"
    role="dialog"
    aria-labelledby="modal-pedido"
    aria-hidden="true"
    ref="verrecibodecompralModal"
    >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <VerOrdenDeCompraRecibida 
          :verrecibodecompral="verrecibodecompral" 
          @recibir="recibircompra(verrecibodecompral)"
          ></VerOrdenDeCompraRecibida>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore} from 'vuex'

import { Modal } from "bootstrap";

import VerOrdenDeCompraRecibida from "../modals/VerOrdenDeCompraRecibida.vue";


// Helper variables
const cols = reactive([
  {
    name: "Documento",
    field: "ORDEN_COMPRA_DOCUMENTO",
    sort: "",
  },
  {
    name: "Pedido Origen",
    field: "ORDEN_COMPRA_DOCU_ORIGEN",
    sort: "",
  },
  {
    name: "Vendedor",
    field: "vendedor",
    sort: "",
  },
  {
    name: "Usuario",
    field: "USERID",
    sort: "",
  },
  {
    name: "Proveedor",
    field: "PROV_RAZON_SOCIAL",
    sort: "",
  },
  {
    name: "RUC Proveedor",
    field: "ORDEN_COMPRA_ID_PROVEEDOR",
    sort: "",
  },
  {
    name: "Fecha de entrega",
    field: "ORDEN_COMPRA_FECHA_ENTREGA",
    sort: "",
  },
  {
    name: "Cliente",
    field: "ORDEN_COMPRA_DIRECCION",
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




const recibosdecompral = computed(() => store.state.recibosdecompral);
const verrecibodecompral = ref({});


async function funcionverrecibodecompra(recibodecompral) {
  store.commit("setGenerar", false);
  verrecibodecompralModalObj.show();
  verrecibodecompral.value = recibodecompral;
  await store.dispatch('detallerecibodecompral', recibodecompral);
}

function recibircompra(recibodecompral){
  recibodecompral.chao = true;
  verrecibodecompralModalObj.hide();
  store.dispatch('bodegasBandejaRecibosdecompraL');
}

let verrecibodecompralModal= ref(null);
let verrecibodecompralModalObj = null;

onMounted(() => {

  verrecibodecompralModalObj = new Modal(verrecibodecompralModal.value);

  // Remove labels from
  document.querySelectorAll("#datasetLengthPedidos label").forEach((el) => {
    el.remove();
  });

  // Replace select classes
  let selectLength = document.querySelector("#datasetLengthPedidos select");

  selectLength.classList = "";
  selectLength.classList.add("form-select");
  selectLength.style.width = "80px";

});


</script>
