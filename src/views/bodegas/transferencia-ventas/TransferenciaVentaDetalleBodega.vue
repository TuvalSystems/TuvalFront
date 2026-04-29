<script setup>
import { onMounted, toRefs, nextTick, watch, ref } from 'vue';
import { formatPrice, toNum, formatJm } from "@/functions";
import { useBootstrapModal } from '@/composables/core/useBootstrapModal';
import { useSalesTransfersProcess } from "@/composables/bodegas/transferencia/useSalesTransferProcess";
import { useSalesTransfersGuideProcess } from "@/composables/bodegas/transferencia/useSalesTransfersGuideProcess";
import { useVehiclesStore } from "@/stores/bodegas/guiasremision/vehicles";
import verPickingSalesTransferModal from "@/views/bodegas/transferencia-ventas/modals/verPickingTrasladoVentasModal.vue"
import verGuiaRemisionSalesTransferModal from "@/views/bodegas/transferencia-ventas/modals/verGuiaRemisionTrasladoVentasModal.vue"
import {
  swalSuccess,
  swalError,
  swalWarning
} from "@/functions/swal-alert.js";
const props = defineProps({
  pvDestino: {
    type: String,
    required: true
  }
}); //ptovtaId destino
const { pvDestino } = toRefs(props);


const {
  //cargar cabecera de transferencia
  payload,
  dataTransferHeader,
  loadingTransferHeader,
  fetchDataTransferHeader,
  //carga de lista de guias pendientes 
  dataPendingGuides,
  loadingPendingGuides,
  fectchListGuideRemisionPending,

  //tabla 
  cols,
  sortBy,
  onSort,

  //cargar lista de transferencia
  dataListTransfer,
  loadingListTransfer,
  fetchListTransfer,

  //proceso de seleccion 
  selectAll,
  applyPendingTransfer,
  applyTransfer,
  disabledPicking,
  disabledGuiaRemision,

  //pintar tabla
  getRowClass,

  //refresh
  refresh,

  //cancelar picking
  loadingCancelPicking,
  cancelPicking,

  //imprimir guias pendientes
  loadingPrintGuideRemision,
  printGuidePdf
} = useSalesTransfersProcess();
const {
  loadingSendGuide,
  sendGuideSalesTransfer,
} = useSalesTransfersGuideProcess();
const vehicles = useVehiclesStore();


//modales 
const dataPicking = ref([]);
const pickingModalRef = ref(null);
const pickingModalObj = useBootstrapModal(pickingModalRef, {
  onHidden: () => {
    dataPicking.value = [];
  }
});

const dataGuiaRemision = ref([]);
const guiaRemisionModalRef = ref(null);
const guiaRemisionModalObj = useBootstrapModal(guiaRemisionModalRef, {
  onHidden: () => {
    dataGuiaRemision.value = [];
  }
});


watch(() => payload.pedido, () => {
  fetchListTransfer();
});


async function verPicking() {
  dataPicking.value = [];
  dataPicking.value = dataListTransfer.value.filter((item) => item.check_seleccion);
  if (dataPicking.value.length === 0) {
    return
  }

  await nextTick();
  pickingModalObj.show();


}

async function closePickingModal() {
  await nextTick();
  dataPicking.value = [];
  pickingModalObj.hide();
}


async function cancelarPicking(row) {
  let resp = await cancelPicking(row);
  if (!resp.ok) {
    swalError(resp.message);
    return;
  }
  row.picking = 0;
  swalSuccess(resp.message);
  refresh();
}



async function guiaRemision() {
  dataGuiaRemision.value = [];
  dataGuiaRemision.value = dataListTransfer.value.filter((item) => item.check_seleccion);
  if (dataGuiaRemision.value.length === 0) {
    return
  }
  await nextTick();
  guiaRemisionModalObj.show();
}

async function closeGuiaRemisionModal() {
  await nextTick();
  dataGuiaRemision.value = [];
  guiaRemisionModalObj.hide();
  refresh();
  fectchListGuideRemisionPending();
}


async function printPdfGuiaRemision(id) {
  const resp = await printGuidePdf({ 'id': id });
  if (resp?.ok) {
    swalSuccess("Archivo descargado correctamente");
    return;
  }
  const msg = resp?.message || "No se pudo generar el documento";
  (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}

async function dispatchGuiaRemision(id) {
  const resp = await sendGuideSalesTransfer(id);
  if (!resp.ok) {
    if (resp.status >= 400 && resp.status < 500) {
      swalWarning(resp.message);
      return
    }
    if (resp.status >= 500) {
      swalError(resp.message);
      return;
    }
  }
  swalSuccess(resp.message);
  refresh();
  fectchListGuideRemisionPending();
}


async function refreshData() {
  refresh();
  fetchDataTransferHeader();
  fectchListGuideRemisionPending();
}



onMounted(async () => {
  payload.destino = pvDestino.value;
  await nextTick();
  if (!dataTransferHeader.value) fetchDataTransferHeader();
  if (dataListTransfer.value.length === 0) fetchListTransfer();
  if (dataPendingGuides.value.length === 0) fectchListGuideRemisionPending();
  vehicles.fetch();

});
</script>

<template>
  <BasePageHeading title="Transferencias por Venta">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Bodegas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">
            <router-link class="link-fx" :to="{ name: 'bodegas-transferenciasventa' }">
              Transferencias por Venta
            </router-link>
          </li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->
  <!-- Page Content -->

  <div class="content">
    <div v-if="loadingTransferHeader" class="text-center py-4">
      <div class="spinner-border text-primary">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2 text-muted">Cargando información de transferencias...</p>
    </div>
    <div v-if="!loadingTransferHeader && dataTransferHeader">
      <BaseBlock :title="'Destino: ' + dataTransferHeader.destination" content-full class="mb-2">
        <template #options>
          <div class="block-options-item space-x-2">
            <span class="badge bg-primary">Peso total: {{ formatPrice(dataTransferHeader.pesoTotal) }} Tn</span>
            <button class="btn btn-outline-primary btn-sm" title="Refrescar" aria-label="Refrescar" @click="refreshData"
              :disabled="loadingListTransfer">
              <i v-if="!loadingListTransfer" class="fa fa-refresh"></i>
              <span v-else class="spinner-border spinner-border-sm"></span>
            </button>
          </div>
        </template>

        <!-- filtros -->
        <div class="row g-3 align-items-end px-2 pt-2 pb-1 mb-4">
          <div class="col-12 col-sm-6 col-lg-3">
            <small class="text-muted d-block mb-1   text-value-upper">Pedidos</small>
            <div class="input-group input-group-sm">
              <select class="form-select form-select-sm  text-value-upper" v-model="payload.pedido">
                <option class=" text-value-upper" value="">Todos</option>
                <option class="  text-value-upper" style="font-size: 12px;" v-for="p in dataTransferHeader.listsOrders"
                  :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
          </div>
        </div>


        <!-- tabla -->
        <div v-if="loadingListTransfer" class="text-center py-4">
          <div class="spinner-border text-primary">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2 text-muted">Cargando información...</p>
        </div>

        <div v-if="!loadingListTransfer && dataListTransfer.length > 0" class="m-2">
          <Dataset v-slot="{ ds }" :ds-data="dataListTransfer" :ds-sortby="sortBy"
            :ds-search-in="['ART_CODIGO', 'ART_DESCRIPCION', 'orderNumber', 'compartimiento']">
            <div class="row" :data-page-count="ds.dsPagecount" style="justify-content: space-between;">
              <div id="datasetLength" v-show="!loadingListTransfer && dataListTransfer" class="col-md-8 py-2 fs-sm">
                <DatasetShow />
              </div>
              <div class="col-md-4 py-2 fs-sm">
                <DatasetSearch ds-search-placeholder="Search..." />
              </div>
            </div>
            <hr />
            <div class="row">
              <div class="col-md-12">
                <div class="table-responsive mb-0">
                  <table class="table table-sm table-hover table-vcenter align-middle mb-0">
                    <thead style="position: sticky; top: 0; z-index: 1;">
                      <tr class="text-label-muted">
                        <th v-for="(th, index) in cols" :key="th.field" :class="['sort', th.sort, th.thClass]"
                          @click="onSort($event, index)">
                          {{ th.name }} <i class="gg-select float-end"></i>
                        </th>
                        <th class="fs-sm text-center" style="font-size:10px;width: 20px;">
                          <label class="d-inline-flex align-items-center gap-0 m-0">
                            <span>SELEC.</span>
                            <input type="checkbox" class="form-check-input m-0" @click="selectAll($event)" />
                          </label>
                        </th>
                        <th style="width:80px"></th>
                        <th style="width:27px"></th>
                      </tr>
                    </thead>

                    <DatasetItem tag="tbody" class="fs-sm">
                      <template #default="{ row }">
                        <tr :class="getRowClass(row)">
                          <td class="fs-sm text-start">{{ row.ART_CODIGO_TRES_LETRAS }}</td>
                          <td class="fs-sm text-start">{{ row.ART_CODIGO }}</td>
                          <td class="fs-sm text-start">{{ row.ART_DESCRIPCION }}</td>
                          <td class="fs-sm text-start">{{ row.compartimiento }}</td>
                          <td class="fs-sm text-start">{{ row.orderNumber }}</td>
                          <td class="fs-sm text-start">{{ row.fecha }}</td>
                          <td class="fs-sm text-start">{{ row.usuario }}</td>
                          <td class="fs-sm text-end">{{ formatJm(row.cantidad) }}</td>
                          <td class="fs-sm text-end">{{ formatJm(row.reservado) }}</td>
                          <td class="fs-sm text-end">{{ formatJm(row.trasladado) }}</td>
                          <td class="fs-sm text-end">{{ (toNum(row.pending_transfer)).toFixed(2) }}</td>
                          <td class="fs-sm text-end">{{ row.ART_PESO }}</td>
                          <td style="width: 20px;" class="fs-sm text-center">
                            <input v-if="(row.pending_transfer > 0)" type="checkbox" class="form-check-input"
                              v-model="row.check_seleccion" @change="applyPendingTransfer($event, row)">
                          </td>
                          <td class="fs-sm" style="width:80px">
                            <input v-if="(row.pending_transfer > 0)" type="text"
                              class="form-control form-control-sm text-end" v-model="row.seleccionado"
                              @change="applyTransfer(row)" />
                          </td>
                          <td class="fs-sm" style="width:27px">
                            <button v-if="row.picking && row.has_guide_active === false" class="btn btn-sm btn-danger"
                              title="Cancelar Picking" @click="cancelarPicking(row)" :disabled="loadingCancelPicking">
                              <i class="fa fa-xmark"></i>
                            </button>
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
          <!-- opciones de picking y generacion de guia -->
          <div class="row">
            <div class="col-12 col-md-6  ms-md-auto">
              <div class="d-grid d-sm-flex gap-2 justify-content-end">
                <button type="button" class="btn btn-warning btn-sm w-100 w-sm-auto" :disabled="disabledPicking"
                  @click="verPicking()">
                  <i class="fa fa-people-carry-box me-1"></i>
                  <span class="d-none d-sm-inline">Picking</span>
                </button>
                <button type="button" class="btn btn-primary btn-sm w-100 w-sm-auto" :disabled="disabledGuiaRemision"
                  @click="guiaRemision()">
                  <i class="fa fa-file-lines me-1"></i>
                  <span class="d-none d-sm-inline">Generar guía de remisión</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </BaseBlock>
    </div>

    <!-- lista de guias de remision de reservas pendientes -colagadas- -->
    <div v-if="!loadingPendingGuides && dataPendingGuides.length > 0">
      <BaseBlock title="Guias Pendientes">
        <div class="row mb-4">
          <div class="col-md-12">
            <div class="table-responsive mb-0">
              <table class="table table-sm table-hover table-vcenter align-middle mb-0">
                <thead style="position: sticky; top: 0; z-index: 1;">
                  <tr>
                    <th class="fs-sm text-center">N° Guia</th>
                    <th class="fs-sm text-center">Fecha</th>
                    <th class="fs-sm text-center">Transportista</th>
                    <th class="fs-sm text-center">Vehiculo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in dataPendingGuides" :key="index">
                    <td class="fs-sm text-center">{{ row.GUI_REM_BODEGA }}</td>
                    <td class="fs-sm text-center">{{ row.GUI_REM_FECHA_INICIO }}</td>
                    <td class="fs-sm text-center">{{ row.GUI_REM_RAZON_SOCIAL_TRANSPORTISTA }}</td>
                    <td class="fs-sm text-center">{{ row.GUI_REM_PLACA }}</td>
                    <td class="fs-sm text-center space-x-2">
                      <button type="button" class="btn btn-sm btn-outline-primary"
                        @click="printPdfGuiaRemision(row.id)">Imprimir</button>
                      <button type="button" class="btn btn-sm btn-outline-success" @click="dispatchGuiaRemision(row.id)"
                        :disabled="loadingSendGuide">Despachar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </BaseBlock>
    </div>
    <div v-if="!loadingListTransfer && dataListTransfer.length === 0 && dataPendingGuides.length === 0">
      <div class="text-center">
        <i class="fa fa-box-open fa-2x text-muted mb-2"></i>
        <p class="text-muted mb-0">No se encontraron registros para mostrar</p>
      </div>
    </div>






    <!-- modales  -->
    <!-- modal de picking -->
    <div class="modal" id="modal-liberar" tabindex="-1" aria-labelledby="modal-picking" aria-hidden="true"
      ref="pickingModalRef">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <verPickingSalesTransferModal v-if="dataPicking && dataPicking.length > 0" :header="dataTransferHeader"
            :picking="dataPicking" @refresh="refresh()" @closePickingModal="closePickingModal()">
          </verPickingSalesTransferModal>
        </div>
      </div>
    </div>

    <!-- modal guia remision reservas -->
    <div class="modal" id="modal-guia-reservas" tabindex="-1" aria-labelledby="modal-guia-reservas" aria-hidden="true"
      ref="guiaRemisionModalRef">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content">
          <verGuiaRemisionSalesTransferModal v-if="dataGuiaRemision && dataGuiaRemision.length > 0"
            :header="dataTransferHeader" :detalle="dataGuiaRemision" @refresh="refresh()"
            @closeModal="closeGuiaRemisionModal()">
          </verGuiaRemisionSalesTransferModal>
        </div>
      </div>
    </div>


  </div>
</template>
<style scoped>
:deep(#datasetLength label) {
  font-size: 0;
}

:deep(#datasetLength select) {
  font-size: 0.875rem;
  /* Le devolvemos el tamaño de letra al texto del select */
  display: inline-block;
  width: 80px;
  margin: 0 0.5rem;
  padding: 0.375rem 2.25rem 0.375rem 0.75rem;
  border-radius: 0.375rem;
}

@media (min-width: 500px) {
  .table.table-sm> :not(caption)>*>* {
    padding-top: .25rem;
    padding-bottom: .15rem;
  }
}

:deep(.table-vcenter tbody td) {
  font-size: 0.8rem !important;
}


/* Para cabeceras, labels o etiquetas <small> (Reemplaza: text-muted text-uppercase fw-bold + 10px) */
.text-label-muted {
  text-transform: uppercase;
  font-weight: 700;
  /* fw-bold */
  font-size: 10px;
  line-height: 1.2;
  /* Recomendado para que no ocupe espacio extra hacia arriba o abajo */
}

/* Para texto normal o valores (Reemplaza: text-uppercase fw-bold + 12px) */
.text-value-upper {
  color: inherit;
  /* Toma el color de texto por defecto del body o modo oscuro */
  text-transform: uppercase;
  font-weight: 700;
  font-size: 12px;
}
</style>