<template>

  <Dataset
    v-slot="{ ds }"
    :ds-data="guiasprocesadas.data.transferencias_recibidas"
    :ds-sortby="sortBy"
    :ds-search-in="[
      'GUI_REM_GUIA_REMISION',
      'pedido',
      'GUI_REM_NUME_DOCU_SUSTENTO',
      'CLI_RAZON_SOCIAL',
      'GUI_REM_RAZON_SOCIAL_DESTINATARIO',
      'BOD_BODEGA',
      'GUI_REM_RAZON_SOCIAL_TRANSPORTISTA',
      'GUI_REM_PLACA',
      'GUI_REM_FECHA_INICIO',
    ]"
    >
    <div class="row" :data-page-count="ds.dsPagecount">
      <div id="datasetLengthTransferenciasRecibidas" class="col-md-8 py-2">
        <DatasetShow />
      </div>
      <div class="col-md-4 py-2">
        <DatasetSearch ds-search-placeholder="Buscar..." />
      </div>
    </div>
    <hr />
    <div class="row" v-if="guiasprocesadas.data.transferencias_recibidas && !guiasprocesadas.loading">
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
              </tr>
            </thead>
            <DatasetItem tag="tbody" class="fs-sm">
              <template #default="{ row }">
                <tr>
                  <td>{{ row.GUI_REM_GUIA_REMISION }}</td>
                  <td>{{ row.bodega_origen }}</td>
                  <td>{{ row.GUI_REM_RAZON_SOCIAL_DESTINATARIO }}</td>
                  <td>{{ row.GUI_REM_DIRECCION_DESTINATARIO }}</td>
                  <td>{{ row.GUI_REM_FECHA_INICIO }}</td>
                  <td>{{ row.GUI_REM_RAZON_SOCIAL_TRANSPORTISTA }}</td>
                  <td>{{ row.GUI_REM_PLACA }}</td>
                  <td class="text-end">
                    <button
                        type="button"
                        class="btn btn-outline-primary btn-sm mx-2"
                        @click="imprimirGuia(row)"
                    >
                      <i class="fa fa-print"></i> Imprimir
                    </button>
                  </td>
                </tr>
              </template>
            </DatasetItem>
          </table>
        </div>
      </div>
    </div>
    <div v-if="guiasprocesadas.loading" class="text-center">
      <div class="spinner-border text-primary mt-4" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div
      v-if="!guiasprocesadas.loading"
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
import { Modal } from "bootstrap";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import Picking from "../modals/Picking.vue";
import OrdenDespacho from "../modals/OrdenDespacho.vue";

const store = useStore();
const guiasprocesadas = computed(() => store.state.guiasprocesadas);
const verpedido = ref({});

// Helper variables
const cols = reactive([
  {
    name: "#Guia",
    field: "GUI_REM_GUIA_REMISION",
    sort: "",
  },
  {
    name: "#Origen",
    field: "bodega_origen",
    sort: "",
  },
  {
    name: "Cliente",
    field: "GUI_REM_RAZON_SOCIAL_DESTINATARIO",
    sort: "",
  },
  {
    name: "Dirección",
    field: "GUI_REM_DIRECCION_DESTINATARIO",
    sort: "",
  },
  {
    name: "Fecha/Hora",
    field: "GUI_REM_FECHA_INICIO",
    sort: "",
  },
  {
    name: "Transportista",
    field: "GUI_REM_RAZON_SOCIAL_TRANSPORTISTA",
    sort: "",
  },
  {
    name: "Vehiculo",
    field: "GUI_REM_PLACA",
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
const pedidos = computed(() => store.state.pedidos);

async function imprimirGuia(guia) {
  store
    .dispatch("imprimir", "/bodegas/guiasderemision/imprimirguia/" + guia.id)
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "guia-" + guia.GUI_REM_GUIA_REMISION + ".pdf");
        document.body.appendChild(link);
        link.click();
      }
    });
}


onMounted(() => {
  // Remove labels from
  document.querySelectorAll("#datasetLengthTransferenciasRecibidas label").forEach((el) => {
    el.remove();
  });

  // Replace select classes
  let selectLength = document.querySelector("#datasetLengthTransferenciasRecibidas select");

  selectLength.classList = "";
  selectLength.classList.add("form-select");
  selectLength.style.width = "80px";

});

</script>