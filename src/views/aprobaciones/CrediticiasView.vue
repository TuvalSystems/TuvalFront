<template>
  <!-- Hero -->
  <BasePageHeading title="Aprobaciones Crediticias">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Aprobaciones</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Crediticias</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <!-- Full Table -->
    <BaseBlock title="Aprobaciones Crediticias">

      <Dataset v-slot="{ ds }" :ds-data="pedidos.data" :ds-sortby="sortBy"
        :ds-search-in="['pedido', 'CLI_RAZON_SOCIAL', 'CLI_RUC', 'USERID', 'COND_ID', 'created_at']">
        <div class="row" :data-page-count="ds.dsPagecount">
          <div id="datasetLengthPedidosCrediticios" class="col-md-8 py-2">
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
        <div class="row" v-if="pedidos.data.length">
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
                        <a href="javascript:void(0);" @click="funcionverestadodecuenta(row)">{{ row.CLI_RAZON_SOCIAL
                        }}</a>
                      </td>
                      <td class="fs-sm">
                        <a href="javascript:void(0);" @click="funcionverestadodecuenta(row)">{{ row.CLI_RUC }}</a>
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
                        {{ row.PTO_VTA_DESCRIPCION }}
                      </td>
                      <td class="fs-sm text-danger">
                        {{ row.motivo_crediticio }}
                      </td>
                      <td class="fs-sm">
                        {{ row.created_at }}
                      </td>
                      <td class="fs-sm">
                        {{ row.total }}
                      </td>
                      <td class="fs-sm text-center nowrap">
                        <button type="button" class="btn btn-primary btn-sm " @click="funcionverestadodecuenta(row)"> <i
                            class="fa fa-gear"></i> Procesar </button>
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
      <div class="modal" id="modal-pedido" tabindex="-1" role="dialog" aria-labelledby="modal-pedido" aria-hidden="true"
        ref="verpedidoModal">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
          <div class="modal-content">
            <VerPedidoAprobarCrediticioModal :verpedido="verpedido" :indexPedido="indexPedido" :tipo="tipo"
              @rechazar="rechazarPedido(verpedido)" @aprobar="aprobarPedido(verpedido, false)">
            </VerPedidoAprobarCrediticioModal>
          </div>
        </div>
      </div>
      <div class="modal" id="modal-estado-de-cuenta" tabindex="-1" role="dialog"
        aria-labelledby="modal-estado-de-cuenta" aria-hidden="true" ref="verestadodecuentaModal">
        <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
          <div class="modal-content">
            <VerEstadoDeCuentaModal :verpedido="verpedido" :indexPedido="indexPedido" :tipo="tipo"
              @rechazar="rechazarPedido(verpedido)" @aprobar="aprobarPedido(verpedido, true)"></VerEstadoDeCuentaModal>
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
import { useStore } from 'vuex'
import { Modal } from "bootstrap";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";

import VerPedidoAprobarCrediticioModal from "./modals/VerPedidoAprobarCrediticioModal.vue";
import VerEstadoDeCuentaModal from "./modals/VerEstadoDeCuentaModal.vue";


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
    name: "Punto de venta",
    field: "PTO_VTA_DESCRIPCION",
    sort: "",
  },

  {
    name: "Motivo",
    field: "motivo_crediticio",
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

let errorMsg = ref('');
const store = useStore();

const pedidos = computed(() => store.state.pedidos_crediticios);

store.dispatch('llenarpedidosporaprobarcrediticios');
// store.dispatch('llenarpedidosporaprobarcrediticiosInterval');

function confirmAprobar(pedido, estadodecuenta = false) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De aprobar el pedido " + pedido.pedido + "",
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, aprobarlo",
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
        aprobarPedido(pedido, estadodecuenta);
      }
    });
}

function aprobarPedido(pedido, estadodecuenta) {
  pedido.chao = true;
  if (estadodecuenta) {
    verestadodecuentaModalObj.hide();
  } else {
    verpedidoModalObj.hide();
  }
  store.dispatch('consultaParaAprobarPedido', pedido).then(res => {
    if (res.success == true) {
      store.dispatch('aprobarPedidoCrediticio', pedido).then(() => {
        swalSuccess(res.message);
      }).catch(err => {
        swalError(err.response.data.error);
        return;
      });
    } else {
      pedido.alert = res.message;
      store.dispatch('rechazarPedidoCrediticioPorStock', pedido).then(() => {
        swalInfo(res.message);
      }).catch(err => {
        errorMsg.value = err.response.data.error
        swalError(errorMsg.value);
        return;
      });
    }
  }).catch(err => {
    errorMsg.value = err.response.data.error
    swalError(errorMsg.value);
    return;
  });
}

function confirmRechazarPedido(pedido) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De rechazar el pedido " + pedido.pedido + "",
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
        rechazarPedido(pedido);
      }
    });
}

function rechazarPedido(pedido) {
  pedido.chao = true;
  verestadodecuentaModalObj.hide()
  verpedidoModalObj.hide()
  store.dispatch('rechazarPedidoCrediticio', pedido).then(() => {
  }).catch(err => {
    swalError(err.response.data.error);
  });
}


const verpedido = ref({});
const indexPedido = ref(null);
const tipo = ref(null);

async function funcionverpedido(pedido) {
  verpedidoModalObj.show();
  verpedido.value = pedido;
  tipo.value = 'pedido';

  store.dispatch('detallepedido', pedido)
  store.dispatch('detalleestadodecuenta', pedido)
}

async function funcionverestadodecuenta(pedido) {
  verestadodecuentaModalObj.show();
  verpedido.value = pedido;
  tipo.value = 'pedido';
  store.dispatch('detalleestadodecuenta', pedido)
}

function verdiferenciacondicion(pedido) {
  swalInfo('Cambio condición de pago', 'de <b>' + pedido.COND_ID_ORIGINAL + '</b> a <b>' + pedido.COND_ID + '</b>');
}

let verpedidoModal = ref(null);
let verpedidoModalObj = null;

let verestadodecuentaModal = ref(null);
let verestadodecuentaModalObj = null;

onMounted(() => {

  verpedidoModalObj = new Modal(verpedidoModal.value);
  verestadodecuentaModalObj = new Modal(verestadodecuentaModal.value);
  // Remove labels from
  document.querySelectorAll("#datasetLengthPedidosCrediticios label").forEach((el) => {
    el.remove();
  });

  // Replace select classes
  let selectLength = document.querySelector("#datasetLengthPedidosCrediticios select");

  selectLength.classList = "";
  selectLength.classList.add("form-select");
  selectLength.style.width = "80px";

});

onBeforeUnmount(() => {
  store.dispatch('llenarpedidosporaprobarcrediticiosStop');
});

</script>