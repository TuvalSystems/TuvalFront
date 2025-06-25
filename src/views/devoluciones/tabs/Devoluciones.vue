<template>
  <Dataset
      v-slot="{ ds }"
      :ds-data="devoluciones.data"
      :ds-sortby="sortBy"
      :ds-search-in="['devolucion', 'factura', 'USERID', 'created_at']"
  >
    <div class="row" :data-page-count="ds.dsPagecount">
      <div id="datasetDevolucionesLength" class="col-md-8 py-2">
        <DatasetShow />
      </div>
      <div class="col-md-4 py-2">
        <DatasetSearch ds-search-placeholder="Buscar..." />
      </div>
    </div>
    <hr />
    <div v-if="devoluciones.loading" class="text-center">
      <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>
    <div class="row" v-if="!devoluciones.loading && devoluciones.data.length">
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
            <DatasetItem tag="tbody" class="fs-sm table-sm">
              <template #default="{ row }">
                <tr>
                  <td class="fs-sm">
                    <a href="javascript:void(0);" @click="funcionverDevolucion(row)">{{ row.devolucion }}</a>
                  </td>
                  <td class="fs-sm">
                    {{  row.factura }}
                  </td>
                  <td class="fs-sm">
                    {{ row.USERID }}
                  </td>
                  <td class="fs-sm">
                    {{ row.created_at }}
                  </td>
                  <td class="text-center">
                    <span class="badge rounded-pill fw-semibold d-inline-block py-2 px-3 mx-1 fs-xs"

                      @click="row.estado == 'rechazado' && row.aprobado_mensaje ? swalWarning(row.aprobado_mensaje) : ''||
                        row.estado === 'solicitado' && row.NC_VTA_MENSAJE ? swalWarning(row.NC_VTA_MENSAJE) : ''"
                      :class="
                      row.aprobado_mensaje ? 'pointer bg-danger-light text-danger':'' ||
                      row.estado == 'procesado' ? 'bg-success-light text-success': '' ||
                      row.estado == 'aprobado' ? 'bg-info-light text-info': '' ||
                      row.estado == 'solicitado' ? 'pointer bg-black-50': '' ||
                      row.estado == 'espera' ? 'bg-warning-light text-warning': '' ||
                      row.estado == 'rechazado' ? 'bg-danger-light text-danger': '' ||
                      row.estado == 'anulada' ? 'bg-danger-light text-danger': '' ||
                      row.estado == 'recibido' ? 'bg-success-light text-info': ''"
                      >
                        {{ row.estado }}</span>
                  </td>
                  <td class="text-center">
                    <span v-if="row.orden_despacho" class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-success-light text-success mx-1" title="Despachado">
                      <i class="fa fa-check-circle"></i> Si
                    </span>
                    <span v-else class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger mx-1" title="Despachado">
                      <i class="fa fa-xmark"></i> No
                    </span>
                  </td>
                  <td class="text-center">
                    <span v-if="(row.despachado === 1)" class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-info-light text-info mx-1" title="Despachado">
                      <i class="fa fa-truck-fast"></i>
                    </span>
                    <span v-else class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger mx-1" title="No despachada">
                      <i class="fa fa-xmark"></i>
                    </span>
                  </td>
                  <td class="text-center">
                    <span v-if="row.volver_a_facturar === 1" class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-success-light text-success mx-1" title="Despachado">
                      <i class="fa fa-check-circle"></i> Si
                    </span>
                    <span v-else class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger mx-1" title="Despachado">
                      <i class="fa fa-xmark"></i> No
                    </span>
                  </td>
                  <td class="text-end">
                    <button v-if="row.estado === 'procesado'"  type="button" class="btn btn-outline-primary btn-sm mx-2" @click="imprimirDevolucion(row)"><i class="fa fa-print"></i> Imprimir</button>
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
    v-if="verdevolucion"
    >
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <DetalleDevolucion
            :verdevolucion="verdevolucion"
        ></DetalleDevolucion>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore} from 'vuex'
import { useTemplateStore } from "@/stores/template";
import { Modal } from "bootstrap";

import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import DetalleDevolucion from "../modals/DetalleDevolucion.vue"

const store = useStore();
const templateStore = useTemplateStore();
const devoluciones = computed(() => store.state.devoluciones);
const verdevolucion = ref({});
const indexPedido = ref(null);

let verDevolucionModal= ref(null);
let verDevolucionModalObj = null;

async function funcionverDevolucion(pedido) {
  verDevolucionModalObj.show();
  verdevolucion.value = pedido;
  store.dispatch('detalleDevolucion', pedido).then(() => {
  });
}


// Helper variables
const cols = reactive([
  {
    name: "Devolución",
    field: "devolucion",
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
    name: "Estado",
    field: "estado",
    sort: "",
  },
  {
    name: "Orden desp.",
    field: "orden_despacho",
    sort: "",
  },
  {
    name: "Despachada",
    field: "orden_despacho",
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

async function imprimirDevolucion(devolucion){
  store.dispatch('imprimir', '/devoluciones/imprimirdevolucion/'+devolucion.id)
      .then((response) => {
        if(response.status == 200){
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'nota-de-credito-'+devolucion.devolucion+'.pdf');
          document.body.appendChild(link);
          link.click();
        }
      });
}

onMounted(() => {
   verDevolucionModalObj = new Modal(verDevolucionModal.value);

});
</script>