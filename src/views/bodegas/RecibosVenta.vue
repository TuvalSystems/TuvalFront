<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore } from 'vuex'
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import { Modal } from "bootstrap";
import { useRouter, useRoute } from "vue-router";
import PickingTransferencias from "./modals/PickingTransferencias.vue"
import GuiaRemisionTransferencia from "./modals/GuiaRemisionTransferencia.vue"
import { useSalesTransfersGuideProcess } from '@/composables/bodegas/transferencia/useSalesTransfersGuideProcess';

const {
  // Recibir guia de transferencia de venta
  loadingRecivedGuide,
  receivedGuideSalesTransfer,
} = useSalesTransfersGuideProcess();
const store = useStore();
const route = useRoute();
const recibos_venta = computed(() => store.state.recibos_venta);
const recibos_venta_loading = computed(() => store.state.recibos_venta_loading);
const picking = computed(() => store.state.picking);
const currentOrden = ref(null);
const motivo = ref(null);
const currentGuia = ref(null);

let guiaRemisionModal = ref(null);
let guiaRemisionModalObj = null;

async function imprimirGuia(guia) {
  store.dispatch('imprimir', '/bodegas/guiasderemision/imprimirguia/' + guia.id)
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'guia-' + guia.GUI_REM_GUIA_REMISION + '.pdf');
        document.body.appendChild(link);
        link.click();
      }
    });
}

function verGuia(bodega) {
  currentGuia.value = bodega;
  guiaRemisionModalObj.show();
}

function confirmRecibirGuia(guia) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De recibir la guía de remisión " + guia.GUI_REM_GUIA_REMISION,
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, recibirla",
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
        recibirGuia(guia)
      }
    });
}

async function recibirGuia(guia) {
  const resp = await receivedGuideSalesTransfer(guia);
  if (!resp.ok) {
    if (resp?.status >= 400 && resp?.status < 500) {
      swalWarning(resp.message);
      return;
    }
    if (resp?.status >= 500) {
      swalError(resp.message);
      return;
    }
  }
  guiaRemisionModalObj.hide();
  swalSuccess(resp.message);
  refrescar();
}

function imprimirOrden(guia) {
  store.dispatch('imprimirorden', guia)
    .then((response) => {
      if (response.status == 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'orden-almacenamiento-' + guia.GUI_REM_GUIA_REMISION + '.pdf');
        document.body.appendChild(link);
        link.click();
      }
    });
}

refrescar();

function refrescar() {
  store.dispatch('recibosVenta').then(() => {
    document.querySelectorAll("#datasetLength label").forEach((el) => {
      el.remove();
    });
    // Replace select classes
    let selectLength = document.querySelector("#datasetLength select");

    selectLength.classList = "";
    selectLength.classList.add("form-select");
    selectLength.style.width = "80px";
  })
}

const cols = reactive([

  {
    name: "Guia Remisión",
    field: "GUI_REM_GUIA_REMISION",
    sort: "",
  },
  {
    name: "Origen",
    field: "bodega_origen",
    sort: "",
  },

  {
    name: "#Pedido",
    field: "pedidos",
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

function isInt(value) {
  const x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

function aplicarrecibido(articulo) {
  if (!isInt(articulo.recibido) && articulo.ART_DECIMAL_CANTIDAD === 0) {
    swalError('Ingresar un número entero');
    articulo.recibido = articulo.pendiente;
    return false;
  }

  if (isNaN(articulo.recibido)) {
    swalError("Ingresar un número");
    articulo.recibido = articulo.pendiente;
    return false;
  }

  if (articulo.recibido === '') {
    articulo.recibido = 0;
    return;
  }

  if (articulo.recibido < 0) {
    articulo.recibido = 0;
    swalError("El número ingresado no puede ser negativo");
    return;
  }

  if (parseFloat(articulo.recibido) > parseFloat(articulo.pendiente)) {
    swalError("El número ingresado es mayor a la cantidad pendiente");
    articulo.recibido = articulo.pendiente;
  }
}

onMounted(() => {
  guiaRemisionModalObj = new Modal(guiaRemisionModal.value);
});

</script>
<template>
  <!-- Hero -->
  <BasePageHeading title="Recibos por Venta">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Bodegas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Recibos por Venta</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content" v-if="recibos_venta">
    <!-- Full Table -->
    <BaseBlock title="Recibos por Venta">
      <template #options>
        <div class="block-options-item">
          <button type="button" title="Refrescar tabla" @click="refrescar()" class="btn-block-option"><i
              class="si si-refresh"></i></button>
        </div>
      </template>
      <Dataset v-slot="{ ds }" :ds-data="recibos_venta" :ds-sortby="sortBy"
        :ds-search-in="['bodega_origen', 'GUI_REM_GUIA_REMISION', 'GUI_REM_RAZON_SOCIAL_TRANSPORTISTA', 'pedidos', 'GUI_REM_PLACA', 'usuario']">
        <div class="row" :data-page-count="ds.dsPagecount">
          <div id="datasetLength" class="col-md-8 py-2">
            <DatasetShow />
          </div>
          <div class="col-md-4 py-2">
            <DatasetSearch ds-search-placeholder="Buscar..." />
          </div>
        </div>
        <hr />
        <div v-if="recibos_venta_loading" class="text-center">
          <div class="spinner-border text-primary mt-4"><span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div class="row" v-if="recibos_venta && !recibos_venta_loading">
          <div class="col-md-12">
            <div class="table-responsive">
              <table class="table table-sm fs-sm table-hover table-vcenter mb-0">
                <thead>
                  <tr>
                    <th v-for="(th, index) in cols" :key="th.field" :class="['sort', th.sort]"
                      @click="onSort($event, index)" class="nowrap">
                      {{ th.name }} <i class="gg-select float-end"></i>
                    </th>
                    <th></th>
                  </tr>
                </thead>
                <DatasetItem tag="tbody" class="fs-sm">
                  <template #default="{ row }">
                    <tr :class="(row.reservado > 0 && row.reservado < row.cantidad ? 'table-warning' : '') ||
                      (row.reservado > 0 && row.reservado == row.cantidad ? 'table-success' : '') ||
                      (row.trasladado > 0 && row.trasladado < row.cantidad ? 'table-warning' : '')">
                      <td>
                        <a href="javascript:void(0)" @click="verGuia(row)">{{ row.GUI_REM_GUIA_REMISION }}</a>
                      </td>
                      <td>
                        {{ row.bodega_origen }}
                      </td>
                      <td>
                        {{ row.pedidos }}
                      </td>
                      <td>
                        {{ row.GUI_REM_RAZON_SOCIAL_TRANSPORTISTA }}
                      </td>
                      <td>
                        {{ row.GUI_REM_PLACA }}
                      </td>
                      <td class="nowrap text-end">
                        <button type="button" class="btn btn-primary btn-sm mx-1" @click="imprimirGuia(row)"><i
                            class="fa fa-print"></i></button>
                        <button type="button" class="btn btn-sm btn-success nowrap mx-1" @click="verGuia(row);"><i
                            class="fa fa-people-carry-box"></i> Recibir</button>
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
    </BaseBlock>
    <!-- END Full Table -->
  </div>
  <!-- END Page Content -->
  <div class="modal" id="modal-pedido" tabindex="-1" aria-labelledby="modal-pedido" aria-hidden="true"
    ref="guiaRemisionModal">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content" v-if="currentGuia">
        <BaseBlock :title="('Detalle de guía ' + currentGuia.GUI_REM_GUIA_REMISION)" class="mb-0">
          <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
              <i class="fa fa-fw fa-times"></i>
            </button>
          </template>
          <div class="table-responsive">

            <table class="table table-striped table-sm table-vcenter mt-4 fs-sm">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Pedido</th>
                  <th>Cód.Let.Itm.</th>

                  <th>Unidad</th>
                  <th>Descripción</th>
                  <th class="text-end">Cantidad</th>
                  <th class="text-end">Pendiente</th>
                  <th>Recibido</th>
                </tr>
              </thead>
              <tbody>

                <tr v-for="(articulo, index) in currentGuia.detalle" :key="index">
                  <template v-if="articulo.pendiente > 0">
                    <td>
                      {{ articulo.GUI_REM_CODI_INTERNO }}
                    </td>
                    <td>
                      {{ articulo.pedido }}
                    </td>
                    <td>
                      {{ articulo.GUI_REM_CODI_ADICIONAL }}
                    </td>

                    <td>
                      {{ articulo.GUI_REM_UNIDAD_MEDIDA }}
                    </td>
                    <td>
                      {{ articulo.GUI_REM_DESCRIPCION }}
                    </td>
                    <td class="text-end">
                      {{ articulo.GUI_REM_CANTIDAD }}
                    </td>
                    <td class="text-end">
                      {{ articulo.pendiente }}
                    </td>
                    <td style="width: 80px">
                      <input type="text" class="form-control text-end" v-model="articulo.recibido"
                        @change="aplicarrecibido(articulo)" />
                    </td>
                  </template>
                </tr>
              </tbody>
            </table>
          </div>
        </BaseBlock>
        <div class="block-content block-content-full text-end bg-body">
          <button type="button" class="btn btn-warning btn-sm mx-2" @click="imprimirOrden(currentGuia)"><i
              class="fa fa-print"></i> Orden de almacenamiento</button>
          <button type="button" class="btn btn-success btn-sm mx-1" :disabled="loadingRecivedGuide"
            @click="confirmRecibirGuia(currentGuia)"><i class="fa fa-people-carry-box"></i> Recibir</button>
          <button type="button" class="btn btn-primary btn-sm mx-1" data-bs-dismiss="modal"> Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>
