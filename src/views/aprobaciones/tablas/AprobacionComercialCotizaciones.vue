<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore } from 'vuex'
import { Modal } from "bootstrap";
import { format } from "@/functions";
import { swalSuccess, swalError } from "@/functions/swal-alert.js";
import VerCotizacionAprobarModal from "../modals/VerCotizacionAprobarModal.vue";
import { useApprovalQuote } from "@/composables/aprobaciones/cotizaciones/useApprovalQuote";

const {
  loading,
  fetchListQuotes,
  quotes
} = useApprovalQuote();
// Helper variables
const cols = reactive([
  {
    name: "Cotización",
    field: "cotizacion",
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
    name: "Segmento",
    field: "segmento",
    sort: "",
  },
  {
    name: "Subsegmento",
    field: "subsegmento",
    sort: "",
  },
  {
    name: "Cond. Pago",
    field: "COND_ID",
    sort: "",
  },
  {
    name: "Autorizadores",
    field: "users_autorizadores",
    sort: "",
  },
  {
    name: "Fecha/hora",
    field: "created_at",
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

const store = useStore();


let errorMsg = ref('');




const vercotizacion = ref({});
const indexCotizacion = ref(null);
const tipo = ref(null);

function funcionvercotizacion(cotizacion) {
  vercotizacionModalObj.show();
  vercotizacion.value = cotizacion;
  tipo.value = 'pedido';
  store.dispatch('detallecotizacion', cotizacion)
}



function aprobarCotizacion(cotizacion) {
  cotizacion.chao = true;
  vercotizacionModalObj.hide();
  store.dispatch('aprobarCotizacion', cotizacion).then(() => {
    swalSuccess('Cotización: ' + cotizacion.cotizacion + ' aprobada');
  }).catch(err => {
    errorMsg.value = err.response.data.error
    swalError(errorMsg.value);
  });
}



function rechazarCotizacion(cotizacion) {
  cotizacion.chao = true;
  vercotizacionModalObj.hide();
  store.dispatch('rechazarCotizacion', cotizacion).then(() => {
    swalSuccess('Cotización: ' + cotizacion.cotizacion + ' rechazada');
  }).catch(err => {
    errorMsg.value = err.response.data.error
    swalError(errorMsg.value);
  });
}

let vercotizacionModal = ref(null);
let vercotizacionModalObj = null;

onMounted(() => {
  fetchListQuotes();
  vercotizacionModalObj = new Modal(vercotizacionModal.value);
  // Remove labels from
  document.querySelectorAll("#datasetLengthcotizaciones label").forEach((el) => {
    el.remove();
  });

  // Replace select classes
  let selectLength = document.querySelector("#datasetLengthcotizaciones select");

  selectLength.classList = "";
  selectLength.classList.add("form-select");
  selectLength.style.width = "80px";
});

</script>
<template>
  <Dataset v-slot="{ ds }" :ds-data="quotes" :ds-sortby="sortBy"
    :ds-search-in="['id', 'cotizacion', 'CLI_RAZON_SOCIAL', 'CLI_RUC', 'USERID', 'COND_ID', 'created_at']">
    <div class="row" :data-page-count="ds.dsPagecount">
      <div id="datasetLengthcotizaciones" class="col-md-8 py-2">
        <DatasetShow />
      </div>
      <div class="col-md-4 py-2">
        <DatasetSearch ds-search-placeholder="Buscar..." />
      </div>
    </div>
    <hr />
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary mt-4"><span class="visually-hidden">Loading...</span></div>
    </div>
    <div class="row" v-if="quotes.length">
      <div class="col-md-12">
        <div class="table-responsive">
          <table class="table table-hover table-sm table-vcenter mb-0">
            <thead>
              <tr>
                <th v-for="(th, index) in cols" :key="th.field" :class="['sort', th.sort]"
                  @click="onSort($event, index)">
                  {{ th.name }} <i class="gg-select float-end"></i>
                </th>
                <th></th>
              </tr>
            </thead>
            <DatasetItem tag="tbody" class="fs-sm">
              <template #default="{ row, index }">
                <tr :id="'cotizacion-' + index" :class="row.chao ? 'hide' : ''">
                  <td class="fs-sm">
                    <a href="javascript:void(0);" @click="funcionvercotizacion(row)">{{ row.cotizacion }}</a>
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
                    {{ row.segmento }}
                  </td>
                  <td class="fs-sm">
                    {{ row.subsegmento }}
                  </td>
                  <td class="fs-sm">
                    {{ row.COND_ID }}
                  </td>
                  <td class="fs-sm">
                    <code>{{ row.users_autorizadores }}</code>
                  </td>
                  <td class="fs-sm">
                    {{ row.created_at }}
                  </td>
                  <td class="fs-sm text-end">
                    ${{ format(parseFloat(row.total)) }}
                  </td>
                  <td class="fs-sm text-end nowrap space-x-1">
                    <button type="button" class="btn btn-success btn-sm" @click="aprobarCotizacion(row)"><i
                        class="fa fa-check"></i> </button>
                    <button type="button" class="btn btn-danger btn-sm" @click="rechazarCotizacion(row)"><i
                        class="fa fa-times"></i> </button>
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
  <!-- Large Block Modal -->
  <div class="modal" id="modal-cotizacion" tabindex="-1" aria-labelledby="modal-cotizacion" aria-hidden="true"
    ref="vercotizacionModal">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <VerCotizacionAprobarModal :vercotizacion="vercotizacion" :indexCotizacion="indexCotizacion" :tipo="tipo"
          @rechazar="rechazarCotizacion(vercotizacion)" @aprobar="aprobarCotizacion(vercotizacion)" @update:vercotizacion="Object.assign(vercotizacion, $event)">
        </VerCotizacionAprobarModal>
      </div>
    </div>
  </div>
</template>
