<template>
  <!-- Hero -->
  <template v-if="transferencias_reposicion[route.params.id].bodega">
    <BasePageHeading v-if="transferencias_reposicion" title="Transferencias por Reposición"
      :subtitle="transferencias_reposicion[route.params.id].bodega">
      <template #extra>
        <nav aria-label="breadcrumb">
          <ol class="breadcrumb breadcrumb-alt">
            <li class="breadcrumb-item">
              <a class="link-fx" href="javascript:void(0)">Bodegas</a>
            </li>
            <li class="breadcrumb-item">
              <router-link class="link-fx" :to="{ name: 'bodegas-transferenciasreposicion' }">
                Transferencias por Reposición
              </router-link>
            </li>
            <li class="breadcrumb-item" aria-current="page">{{ transferencias_reposicion[route.params.id].bodega }}</li>
          </ol>
        </nav>
      </template>
    </BasePageHeading>
    <!-- END Hero -->

    <!-- Page Content -->
    <div class="content" v-if="transferencias_reposicion">
      <!-- Full Table -->
      <BaseBlock :title="'Destino: ' + transferencias_reposicion[route.params.id].bodega">
        <template #options>
          <div class="block-options-item"><span class="badge bg-warning">Peso total: {{
            formatPrice(transferencias_reposicion[route.params.id].peso_total / 1000) }} Tn</span></div>
          <div class="block-options-item">
            <button type="button" class="btn btn-sm btn-primary"
              @click="seleccionartodos(transferencias_reposicion[route.params.id].traslados)"><i
                class="fa fa-hand-pointer"></i> Seleccionar todos</button>
          </div>
          <div class="block-options-item">
            <button type="button" title="Refrescar tabla" @click="refrescar()" class="btn-block-option"><i
                class="si si-refresh"></i></button>
          </div>
        </template>
        <Dataset v-slot="{ ds }" :ds-data="transferencias_reposicion[route.params.id].traslados" :ds-sortby="sortBy"
          :ds-search-in="['compartimiento', 'ART_CODIGO', 'ART_DESCRIPCION', 'Documento', 'Codigo_Motivo', 'Fecha_Documento']">
          <div class="row">
            <div class="col-sm-3">
              <VueSelect v-model="buscardocumento" :options="transferencias_reposicion[route.params.id].documentos"
                placeholder="Buscar por documento..." @keyup.enter="buscarDocumento"></VueSelect>
            </div>
            <div class="col-sm-3">
              <button type="button" @click="buscarDocumento" class="btn btn-primary"
                :disabled="loadingDoc">Buscar</button>
            </div>
          </div>
          <div class="row" :data-page-count="ds.dsPagecount">
            <div id="datasetLength" class="col-md-8 py-2">
              <DatasetShow />
            </div>
            <div class="col-md-4 py-2">
              <DatasetSearch ds-search-placeholder="Buscar..." />
            </div>
          </div>
          <hr />
          <div class="row" v-if="transferencias_reposicion[route.params.id].traslados">
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
                      <th></th>
                    </tr>
                  </thead>
                  <DatasetItem tag="tbody" class="fs-sm">
                    <template #default="{ row }">
                      <tr :class="(row.reservado > 0 && row.reservado == row.cantidad ? 'table-success' : '') ||
                        (row.reservado > 0 && row.pendiente == 0 ? 'table-success' : '') ||
                        (row.reservado > 0 && row.pendiente > 0 ? 'table-warning' : '') ||
                        (row.picking ? 'table-info' : '')
                        ">
                        <td>{{ row.ART_CODIGO_TRES_LETRAS }}</td>
                        <td>
                          {{ row.ART_CODIGO }}
                        </td>
                        <td>
                          {{ row.ART_DESCRIPCION }}
                        </td>
                        <td>
                          {{ row.compartimiento }}
                        </td>
                        <td>
                          {{ row.Documento }}
                        </td>
                        <td>
                          {{ row.Fecha_Documento }}
                        </td>

                        <td class="text-end">
                          {{ row.cantidad }}
                        </td>
                        <td class="text-end">
                          {{ row.reservado }}
                        </td>
                        <td class="text-end">
                          {{ row.trasladado }}
                        </td>
                        <td class="text-end">
                          {{ row.pendiente }}
                        </td>
                        <td style="width: 31px;" class="text-center">
                          <input v-if="(row.pendiente > 0)" type="checkbox" class="form-check-input"
                            v-model="row.aplicar_todo" @change="aplicatodo(row)" />
                        </td>
                        <td style="width: 80px;">
                          <input v-if="(row.pendiente > 0)" type="text" class="form-control text-end"
                            v-model="row.seleccionado" @change="aplicartraslado(row)" />
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
        <div class="row">
          <div class="col-md-12 text-end mb-2">
            <button :disabled="!transferencias_reposicion[route.params.id].generar" type="button"
              class="btn btn-sm btn-warning mx-2" @click="verPicking(transferencias_reposicion[route.params.id])">
              <i class="fa fa-people-carry-box"></i> Picking
            </button>
            <button :disabled="!transferencias_reposicion[route.params.id].generar" type="button"
              class="btn btn-sm btn-success mx-2" @click="guiaRemision(transferencias_reposicion[route.params.id])"><i
                class="fa fa-file-lines"></i> Generar guía de remisión</button>
          </div>
        </div>
        <div class="table-responsive">
          <table v-if="transferencias_reposicion[route.params.id].guias.length" class="table table-sm fs-sm">
            <thead>
              <tr>
                <th>No. de Guía</th>
                <th>Fecha</th>
                <th>Transportista</th>
                <th>Vehículo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(guia, index) in transferencias_reposicion[route.params.id].guias" :key="index">
                <td>{{ guia.GUI_REM_GUIA_REMISION }}</td>
                <td>{{ guia.GUI_REM_FECHA_INICIO }}</td>
                <td>{{ guia.GUI_REM_RAZON_SOCIAL_TRANSPORTISTA }}</td>
                <td>{{ guia.GUI_REM_PLACA }}</td>
                <td class="text-end">
                  <button type="button" class="btn btn-outline-primary btn-sm mx-2" @click="imprimirGuia(guia)"><i
                      class="fa fa-print"></i> Imprimir</button>
                  <button type="button" class="btn btn-outline-success btn-sm mx-2"
                    @click="confirmDespacharGuia(guia)"><i class="fa fa-print"></i> Despachar</button>
                  <!-- <button  type="button" class="btn btn-outline-danger btn-sm mx-2" @click="confirmEliminarguiaGuia(guia)"><i class="fa fa-trash"></i> Eliminar</button> -->
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseBlock>
      <!-- END Full Table -->
    </div>
    <!-- END Page Content -->
    <div class="modal" id="modal-pedido" tabindex="-1" role="dialog" aria-labelledby="modal-pedido" aria-hidden="true"
      ref="guiaRemisionModal">
      <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
        <div class="modal-content" v-if="currentBodega">
          <GuiaRemisionTransferencia :currentBodega="currentBodega" @generarGuia="generarGuia()">
          </GuiaRemisionTransferencia>
        </div>
      </div>
    </div>
    <div class="modal" id="modal-liberar" tabindex="-1" role="dialog" aria-labelledby="modal-liberar" aria-hidden="true"
      ref="pickingModal">
      <div class="modal-dialog modal-xl modal-md modal-dialog-centered" role="document">
        <div class="modal-content" v-if="currentBodega">
          <PickingTransferencias :currentBodega="currentBodega" @regrescarLista="refrescar()"></PickingTransferencias>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore } from 'vuex'
import { useTemplateStore } from "@/stores/template";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import { Modal } from "bootstrap";
import { useRouter, useRoute } from "vue-router";
import PickingTransferencias from "./modals/PickingTransferencias.vue"
import GuiaRemisionTransferencia from "./modals/GuiaRemisionTransferencia.vue"
import VueSelect from "vue-select"
import { formatPrice } from "../../functions";

const store = useStore();
const templateStore = useTemplateStore();
const route = useRoute();
const transferencias_reposicion = computed(() => store.state.transferencias_reposicion);
const picking = computed(() => store.state.picking);
const currentOrden = ref(null);
const motivo = ref(null);
const currentBodega = ref(null);
const buscardocumento = ref(null);

store.dispatch('getTransportistas');

let verpedidoModal = ref(null);
let verpedidoModalObj = null;

let pickingModal = ref(null);
let pickingModalObj = null;

let guiaRemisionModal = ref(null);
let guiaRemisionModalObj = null;
let loadingDoc = ref(false);
function buscarDocumento() {
  loadingDoc.value = true;
  if (!buscardocumento.value) {
    // refrescar();
    loadingDoc.value = false;
    return;
  }
  store.dispatch('transferenciasReposicionDocumento', buscardocumento.value).then((res) => {
    transferencias_reposicion.value[route.params.id].traslados = res;
    if (transferencias_reposicion.value[route.params.id].traslados.length > 0) {
      loadingDoc.value = false;
    }
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

function confirmEliminarguiaGuia(guia) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De eliminar la guía de remisión " + guia.GUI_REM_GUIA_REMISION,
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, eliminarla",
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
        eliminarguiaGuia(guia)
      }
    });
}

function eliminarguiaGuia(guia) {
  store.dispatch('eliminarGuiaRemision', guia).then((res) => {
    refrescar();
  })
}

function confirmDespacharGuia(guia) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De despachar la guía de remisión " + guia.GUI_REM_GUIA_REMISION,
      icon: "question",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-success m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, despacharla",
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
        despacharguiaGuia(guia)
      }
    });
}

function despacharguiaGuia(guia) {
  templateStore.pageLoader({ mode: "on" });
  store.dispatch('despacharGuiaRemision', guia).then((res) => {
    if (res.success == false) {
      swalError(res.message);
    } else {
      swalSuccess(res.message);
      refrescar();
    }
    templateStore.pageLoader({ mode: "off" });
  }).catch(err => {
    swalError(err.response.data.error);
    templateStore.pageLoader({ mode: "off" });
  })
}


//refrescar();

function refrescar(imprimir = false) {
  store.dispatch('transferenciasReposicion').then(() => {
    document.querySelectorAll("#datasetLength label").forEach((el) => {
      el.remove();
    });
    // Replace select classes
    let selectLength = document.querySelector("#datasetLength select");

    selectLength.classList = "";
    selectLength.classList.add("form-select");
    selectLength.style.width = "80px";

    if (imprimir) {
      imprimirGuia(transferencias_reposicion.value[route.params.id].ultimaguia);
      despacharguiaGuia(transferencias_reposicion.value[route.params.id].ultimaguia)
    }
  })
}



function generarGuia() {
  guiaRemisionModalObj.hide();
  templateStore.pageLoader({ mode: "off" });
  refrescar(true)
}

function aplicatodo(traslado) {

  if (traslado.aplicar_todo == false) {
    traslado.seleccionado = '';
    checkgenerarguia();
    return;
  }
  traslado.seleccionado = traslado.pendiente;
  checkgenerarguia();
}

function isInt(value) {
  const x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}
function aplicartraslado(traslado) {

  if (!isInt(traslado.seleccionado) && traslado.ART_DECIMAL_CANTIDAD === 0) {
    swalError('Ingresar un número entero');
    traslado.seleccionado = 0;
    traslado.aplicar_todo = false;
    checkgenerarguia();
    return false;
  }

  if (isNaN(traslado.seleccionado)) {

    swalError('Ingresar un número');
    traslado.seleccionado = 0;
    traslado.aplicar_todo = false;
    checkgenerarguia();
    return false;
  }

  if (parseFloat(traslado.seleccionado) === 0) {
    traslado.aplicar_todo = false;
  } else if (parseFloat(traslado.seleccionado) < 0) {
    swalError('No ingresar números negativos');
    traslado.seleccionado = null;
    traslado.aplicar_todo = false;
  } else if (parseFloat(traslado.seleccionado) < 0) {
    traslado.aplicar_todo = false;
    swalError("No se puede ingresar números negativos");
    traslado.seleccionado = null;
  } else if (parseFloat(traslado.seleccionado) <= parseFloat(traslado.pendiente)) {
    traslado.aplicar_todo = true;
  } else if (parseFloat(traslado.seleccionado) > parseFloat(traslado.pendiente)) {
    swalError('El número ingresado es mayor a la cantidad pendiente');
    traslado.seleccionado = traslado.pendiente;
    traslado.aplicar_todo = true;
  } else {
    traslado.aplicar_todo = true;
  }
  checkgenerarguia();
}

function seleccionartodos(traslados, maxItems = 100) {
  let count = 0;
  for (const t of traslados) {
    if (count < maxItems && (Number(t.pendiente) || 0) > 0) {
      t.seleccionado = Number(t.pendiente) || 0;
      t.aplicar_todo = true;
      count++;
    } else {
      t.seleccionado = 0;
      t.aplicar_todo = false;
    }
  }
  checkgenerarguia();
}

function checkgenerarguia() {
  transferencias_reposicion.value.map(bodega => {
    var check = false;
    bodega.traslados.map(traslado => {

      if (traslado.seleccionado > 0) {
        check = true;
      }
    })
    if (check) {
      bodega.generar = true;
    } else {
      bodega.generar = false;
    }
  });
}

function verPicking(bodega) {
  currentBodega.value = bodega;
  pickingModalObj.show();

  let arreglo = [];
  bodega.traslados.map(item => {
    if (item.aplicar_todo) {
      arreglo.push(item);
    }
  })

  store.dispatch('detallePickingTransferencia', arreglo)
}
function guiaRemision(bodega) {
  if (!validateLimitSelectItems(bodega.traslados)) {
    return;
  }
  currentBodega.value = bodega;
  store.commit("resetFlatPickrState");
  store.commit("resetVehiculo");
  store.commit("resetTransportista");
  store.commit('setDespacho', 'Despacho en ruta');
  store.commit('setDetallePickingLimpio', bodega.traslados);
  guiaRemisionModalObj.show();
}


function validateLimitSelectItems(selectedItems, maxItems = 100) {
  const itemsCount = selectedItems.reduce((acc, it) => {
    const sel = Number(it?.seleccionado ?? 0);
    return acc + (sel > 0 ? 1 : 0);
  }, 0);

  // Máximo inclusivo: 100 es OK; 101 no
  if (Number.isFinite(maxItems) && maxItems >= 0 && itemsCount > maxItems) {
    swalWarning(`Solo puedes seleccionar hasta un máximo de ${maxItems} ítems (llevas ${itemsCount}).`);
    return false;
  }

  return true;
}

const cols = reactive([
  {
    name: "CTL",
    field: "ART_CODIGO_TRES_LETRAS",
    sort: "",
  },
  {
    name: "Código",
    field: "ART_CODIGO",
    sort: "",
  },
  {
    name: "Descripción",
    field: "ART_DESCRIPCION",
    sort: "",
  },
  {
    name: "Compartimiento",
    field: "compartimiento",
    sort: "",
  },
  {
    name: "#Documento",
    field: "Documento",
    sort: "",
  },
  {
    name: "Fecha",
    field: "fecha",
    sort: "",
  },

  {
    name: "Cant.",
    field: "cantidad",
    sort: "",
  },
  {
    name: "Res.",
    field: "reservado",
    sort: "",
  },
  {
    name: "Trasl.",
    field: "trasladado",
    sort: "",
  },
  {
    name: "Pend.",
    field: "pendiente",
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

onMounted(() => {

  document.querySelectorAll("#datasetLength label").forEach((el) => {
    el.remove();
  });
  // Replace select classes
  let selectLength = document.querySelector("#datasetLength select");

  selectLength.classList = "";
  selectLength.classList.add("form-select");
  selectLength.style.width = "80px";

  pickingModalObj = new Modal(pickingModal.value);

  guiaRemisionModalObj = new Modal(guiaRemisionModal.value);

});

</script>