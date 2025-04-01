<template>
  <div class="col-sm-8 offset-2 my-4" v-if="cobros_registrados.length > 0">
    <div class="row">
      <div class="col"><h4>Cobros Registrados</h4></div>
      <div class="col text-end"><button @click="consultarCobros" class="btn btn-sm btn-warning"><i class="fa fa-refresh"></i> Actualizar cobros</button></div>
    </div>


    <div v-if="cobros_registrados_loading" class="text-center">
      <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
    </div>
    <Dataset
        v-slot="{ ds }"
        :ds-data="cobros_registrados"
        :ds-sortby="sortBy"
        :ds-search-in="['numero_recibo', 'fecha', 'Estado']"
        >
        <div class="row" :data-page-count="ds.dsPagecount">
          <div id="datasetLengthCobros" class="col-md-8 py-2">
            <DatasetShow />
          </div>
          <div class="col-md-4 py-2">
            <DatasetSearch ds-search-placeholder="Buscar..." />
          </div>
        </div>
        <hr />
        <!-- <div v-if="pedidos.loading" class="text-center">
          <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
        </div> -->
        <div class="row" v-if="cobros_registrados.length && !cobros_registrados_loading">
          <div class="col-md-12">
            <div class="table-responsive">
              <table class="table table-striped table-vcenter mb-0">
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
                      :id="'recibo-'+index"
                      :class="row.chao ? 'hide':''"
                      >
                      <td class="fs-sm">
                        {{ row.numero_recibo }}
                      </td>
                      <td class="fs-sm">
                        {{ row.fecha }}
                      </td>
                      <td>
                        <a v-if="row.estado == 'iniciado'" class="text-danger" @click="swalInfo('Mensaje',row.alerta)" href="javascript:void(0);">
                          Pendiente
                        </a>
                        <span v-else>
                          Procesado
                        </span>
                      </td>
                      <td class="text-center"><a v-if="row.estado == 'enviado'" class="pointer"  @click="imprimircobro(row)"><i class="fa fa-print"></i></a></td>
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
</div>
</template>
<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, onBeforeUnmount } from "vue";
import { useStore} from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";

// Helper variables
const cols = reactive([
  {
    name: "# Recibo",
    field: "numero_recibo",
    sort: "",
  },
  {
    name: "Fecha",
    field: "fecha",
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

const store = useStore();
const currentClienteCobro = computed(() => store.state.currentClienteCobro);
const cobros_registrados = computed(() => store.state.cobros_registrados);
const cobros_registrados_loading = computed(() => store.state.cobros_registrados_loading);

function consultarCobros(){
  const cliente = reactive({
    id: currentClienteCobro.value.id
  });
  store.dispatch('cobrosRegistrados', cliente);
}


//consultarCobros();

async function imprimircobro(cobro){
  store.dispatch('imprimir', '/cobranzas/imprimircobro/'+cobro.id)
  .then((response) => {
    if(response.status == 200){
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'cobro-'+cobro.numero_recibo+'.pdf');
        document.body.appendChild(link);
        link.click();
    }
  });
}

onMounted(() => {
  if(cobros_registrados.value.length){
    document.querySelectorAll("#datasetLengthCobros label").forEach((el) => {
      el.remove();
    });

    // Replace select classes
    let selectLength = document.querySelector("#datasetLengthCobros select");

    selectLength.classList = "";
    selectLength.classList.add("form-select");
    selectLength.style.width = "80px";
  }
  
});
</script>