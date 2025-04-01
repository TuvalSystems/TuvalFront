<template>
  <Dataset
    v-slot="{ ds }"
    :ds-data="recibosdecompralrecibidos.data"
    :ds-sortby="sortBy"
    :ds-search-in="['ORDEN_COMPRA_DOCUMENTO', 'ORDEN_COMPRA_DOCU_ORIGEN','PROV_RAZON_SOCIAL', 'ORDEN_COMPRA_ID_PROVEEDOR' , 'ORDEN_COMPRA_FECHA_ENTREGA', 'ORDEN_COMPRA_DIRECCION']"
    >
    <div class="row" :data-page-count="ds.dsPagecount">
      <div id="datasetLengthRecibidosL" class="col-md-8 py-2">
        <DatasetShow />
      </div>
      <div class="col-md-4 py-2">
        <DatasetSearch ds-search-placeholder="Buscar..." />
      </div>
    </div>
    <hr />
    <div v-if="recibosdecompralrecibidos.loading" class="text-center">
      <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>
    <div class="row" v-if="recibosdecompralrecibidos.data.length && !recibosdecompralrecibidos.loading">
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
              <template #default="{ row }">
                <tr>
                  <td class="fs-sm">
                    {{ row.ORDEN_COMPRA_DOCUMENTO }}
                  </td>
                  <td class="fs-sm">
                      {{  row.ORDEN_COMPRA_DOCU_ORIGEN }}
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
                      {{ row.ORDEN_COMPRA_ID_PROVEEDOR }}
                  </td>
                  <td class="fs-sm">
                      {{ row.ORDEN_COMPRA_ID_PROVEEDOR }}
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
  
</template>
<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { useStore} from 'vuex'
import Swal from "sweetalert2";
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
  {
    name: "RUC Cliente",
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


const recibosdecompralrecibidos = computed(() => store.state.recibosdecompralrecibidos);

onMounted(() => {

// Remove labels from
document.querySelectorAll("#datasetLengthRecibidosL label").forEach((el) => {
  el.remove();
});

// Replace select classes
let selectLength = document.querySelector("#datasetLengthRecibidosL select");

selectLength.classList = "";
selectLength.classList.add("form-select");
selectLength.style.width = "80px";

});

</script>