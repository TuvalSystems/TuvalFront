<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore } from 'vuex'
import { Modal } from "bootstrap";
import { swalInfo } from "@/functions/swal-alert.js";
import VerPedidoAprobarModal from "@/views/aprobaciones/modals/consulta/VerPedidoConsultaAprobarModal.vue";
import { format } from "@/functions";
import { useApprovalOrder } from "@/composables/aprobaciones/pedidos/useApprovalOrder";

const {
  fetchListOrdersConsult,
  orderConsult,
  loadingOrderConsult,
} = useApprovalOrder();
// Helper variables
const cols = reactive([
  {
    name: "Pedido",
    field: "pedido",
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
const verpedido = ref({});
const indexPedido = ref(null);
const tipo = ref(null);

async function funcionverpedido(pedido) {
  verpedidoModalObj.show();
  verpedido.value = pedido;
  tipo.value = 'pedido';
  store.dispatch('detallepedido', pedido)
}



function verdiferenciacondicion(pedido) {
  swalInfo('Cambio condición de pago', 'de <b>' + pedido.COND_ID_ORIGINAL + '</b> a <b>' + pedido.COND_ID + '</b>');
}

let verpedidoModal = ref(null);
let verpedidoModalObj = null;

onMounted(() => {
  fetchListOrdersConsult();
  verpedidoModalObj = new Modal(verpedidoModal.value);

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
<template>
  <Dataset v-slot="{ ds }" :ds-data="orderConsult" :ds-sortby="sortBy"
    :ds-search-in="['pedido', 'CLI_RAZON_SOCIAL', 'CLI_RUC', 'USERID', 'COND_ID', 'created_at']">
    <div class="row" :data-page-count="ds.dsPagecount">
      <div id="datasetLengthPedidos" class="col-md-8 py-2">
        <DatasetShow />
      </div>
      <div class="col-md-4 py-2">
        <DatasetSearch ds-search-placeholder="Buscar..." />
      </div>
    </div>
    <hr />
    <div v-if="loadingOrderConsult" class="text-center">
      <div class="spinner-border text-primary mt-4"><span class="visually-hidden">Loading...</span></div>
    </div>
    <div class="row" v-if="orderConsult.length">
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
                <tr :id="'pedido-' + index" :class="row.chao ? 'hide' : ''">
                  <td class="fs-sm">
                    <a href="javascript:void(0);" @click="funcionverpedido(row)">{{ row.pedido }}</a>
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
                  <td class="fs-sm" :class="row.COND_ID != row.COND_ID_ORIGINAL ? 'text-danger' : ''">
                    <a class="text-danger" v-if="row.COND_ID != row.COND_ID_ORIGINAL"
                      @click="verdiferenciacondicion(row)" href="javascript:void(0);">{{ row.COND_ID }}</a>
                    <span v-else>{{ row.COND_ID }}</span>
                  </td>
                  <td class="fs-sm">
                    <code>{{ row.users_autorizadores }}</code>
                  </td>
                  <td class="fs-sm">
                    {{ row.created_at }}
                  </td>
                  <td class="fs-sm">
                    ${{ format(parseFloat(row.total)) }}
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
  <div class="modal" id="modal-pedido" tabindex="-1" aria-labelledby="modal-pedido" aria-hidden="true"
    ref="verpedidoModal">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <VerPedidoAprobarModal :verpedido="verpedido" :indexPedido="indexPedido" :tipo="tipo"></VerPedidoAprobarModal>
      </div>
    </div>
  </div>
</template>
