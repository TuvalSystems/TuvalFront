<script setup>
import { onMounted, toRefs, ref, nextTick } from 'vue';
import { formatPrice } from "@/functions";
import { useReservationTransferByWarehouse } from '@/composables/bodegas/reservas/useReservationTransferByWarehouse';
import { useVehiclesStore } from "@/stores/bodegas/guiasremision/vehicles";
import {
  swalSuccess,
  swalError,
} from "@/functions/swal-alert.js";
import { Modal } from "bootstrap";
/** modales */
import verPickingReservas from "@/views/bodegas/reservas/modals/verPickingReservasModal.vue"
import verGuiaRemisionReserva from "@/views/bodegas/reservas/modals/verGuiaRemisionReservasModal.vue"
const props = defineProps({
  ptovtaId: { type: String, required: true },  //ptovta destino
});
const { ptovtaId } = toRefs(props);

const {
  //cabecera
  dataHeaderTransfer,
  loadingHeaderTransfer,
  payloadHeader,
  //detalle
  dataDetailTransfer,
  loadingDetailTransfer,
  payload,
  cols,
  datasetLengthRef,
  disabledPicking,
  disabledGuiaRemision,
  dataPendingGuides,
  loadingPendingGuides,
  //picking - cancelar
  loadingCancelPicking,

  //functions
  //cabecera
  fetchHeaderTransferByWarehouseOriginAndDestination,

  //detalle
  sortBy,
  onSort,
  fetchListTransfersByWarehouseOriginAndDestination,
  refresh,
  seacrchQuotation,
  selectAll,
  applyAlPendingTransfer,
  applyTransfer,
  fectchListGuideRemisionPending,
  cancelPicking,
  printGuidePdf,
  loadingDispacthGuide,
  dispatchGuideReservedPending
} = useReservationTransferByWarehouse();
const vehicles = useVehiclesStore();

let pickingModal = ref(null);
let pickingModalObj = null;
let guiaRemisionModal = ref(null);
let guiaRemisionModalObj = null;
let dataPicking = ref([]);
let dataGuiaRemision = ref([]);



async function cancelarPicking(row) {
  let resp = await cancelPicking(row);
  if (!resp.ok) {
    swalError(resp.message);
    return;
  }
  row.picking = 0;
  swalSuccess(resp.message);

}

async function verPicking() {
  dataPicking.value = [];
  dataPicking.value = (dataDetailTransfer.value || []).filter((item) => item.check_seleccion === true);
  if (dataPicking.value.length === 0) {
    return
  }

  await nextTick();
  pickingModalObj = Modal.getOrCreateInstance(pickingModal.value, { backdrop: true })
  pickingModalObj.show();
}
async function closePickingModal() {
  await nextTick();
  dataPicking.value = [];
  pickingModalObj.hide();
}



async function guiaRemision() {
  dataGuiaRemision.value = [];
  dataGuiaRemision.value = (dataDetailTransfer.value || []).filter((item) => item.check_seleccion === true);
  if (dataGuiaRemision.value.length === 0) {
    return
  }
  await nextTick();
  guiaRemisionModalObj = Modal.getOrCreateInstance(guiaRemisionModal.value, { backdrop: true })
  guiaRemisionModalObj.show();
}

async function closeGuiaRemisionModal() {
  await nextTick();
  dataGuiaRemision.value = [];
  guiaRemisionModalObj.hide();
  refresh();
}


/*** procesos de guias de remisiones pendientes */

async function printPdfGuiaRemision(id) {
  const res = await printGuidePdf({'id': id});
  if (res?.ok) {
    await nextTick()
    swalSuccess('Documento generado correctamente.');
  } else {
    swalError(res?.message || 'No se pudo generar el PDF.')
  }
}


async function dispatchGuiaRemision(id) {
  const resp = await dispatchGuideReservedPending(id);
  if (!resp.ok) {
    swalError(resp.message || 'No se pudo aplicar la transferencia.');
    return;
  }
  swalSuccess(resp.message);
  refresh();
}








function initialModal() {
  if (pickingModal.value) {
    pickingModalObj = Modal.getOrCreateInstance(pickingModal.value, { backdrop: true })
  }
  if (guiaRemisionModal.value) {
    guiaRemisionModalObj = Modal.getOrCreateInstance(guiaRemisionModal.value, { backdrop: true })
  }
}

onMounted(async () => {
  payload.destino = ptovtaId.value;
  payloadHeader.destino = ptovtaId.value;
  if (!dataHeaderTransfer.value) fetchHeaderTransferByWarehouseOriginAndDestination();
  if (!dataDetailTransfer.value) fetchListTransfersByWarehouseOriginAndDestination();
  if (!dataPendingGuides.value) fectchListGuideRemisionPending();
  await nextTick()
  initialModal();
  vehicles.fetch();
});


</script>

<template>
  <BasePageHeading title="Transferencias por Reserva">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Bodegas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">
            <router-link class="link-fx" :to="{ name: 'bodegas-reservas-transferencias' }">
              Transferencias por Reservas
            </router-link>
          </li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>

  <!-- END Hero -->

  <!-- Page Content -->
  <div class="content">
    <div v-if="loadingHeaderTransfer" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2 text-muted">Cargando información de transferencias...</p>
    </div>
    <div v-if="!loadingHeaderTransfer && dataHeaderTransfer">
      <BaseBlock :title="'Destino: ' + dataHeaderTransfer.destination" content-full>
        <template #options>
          <div class="block-options-item space-x-2">
            <span class="badge bg-primary">Peso total: {{ formatPrice(dataHeaderTransfer.pesoTotal) }} Tn</span>
            <button class="btn btn-outline-primary btn-sm" title="Refrescar" aria-label="Refrescar" @click="refresh"
              :disabled="loadingDetailTransfer">
              <i v-if="!loadingDetailTransfer" class="fa fa-refresh"></i>
              <span v-else class="spinner-border spinner-border-sm"></span>
            </button>
          </div>
        </template>
        <div class="row g-3 align-items-end px-2 pt-2 pb-1 mb-4">
          <div class="col-12 col-sm-6 col-lg-3">
            <small class="text-muted d-block mb-1">Cotización</small>
            <div class="input-group input-group-sm">
              <select class="form-select form-select-sm" v-model="payload.cotizacion">
                <option value="">Todos</option>
                <option v-for="p in dataHeaderTransfer.listaQuotations" :key="p" :value="p">{{ p }}</option>
              </select>
              <button type="button" class="btn btn-primary" @click="seacrchQuotation" :disabled="loadingDetailTransfer">
                <i class="fa fa-search"></i>
              </button>
            </div>
          </div>
        </div>
        <div v-if="loadingDetailTransfer" class="text-center py-4">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
          <p class="mt-2 text-muted">Cargando información...</p>
        </div>
        <div v-if="!loadingDetailTransfer && dataDetailTransfer" class="m-2">
          <Dataset v-slot="{ ds }" :ds-data="dataDetailTransfer" :ds-sortby="sortBy"
            :ds-search-in="['art_code', 'art_cod_tres_letras', 'cotizacion']">
            <div class="row" :data-page-count="ds.dsPagecount" style="justify-content: space-between;">
              <div ref="datasetLengthRef" id="datasetLength" v-show="!loadingDetailTransfer && dataDetailTransfer"
                class="col-md-8 py-2 fs-sm">
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
                      <tr>
                        <th v-for="(th, index) in cols" :key="th.field" :class="['sort', th.sort, th.thClass]"
                          @click="onSort($event, index)">
                          {{ th.name }} <i class="gg-select float-end"></i>
                        </th>
                        <th class="fs-sm text-center" style="font-size:10px;">
                          <label class="d-inline-flex align-items-center gap-1 m-0">
                            <span>SELEC.</span>
                            <input type="checkbox" class="form-check-input m-0" @click="selectAll($event)" />
                          </label>
                        </th>
                        <th></th>
                        <th></th>
                      </tr>
                    </thead>
                    <DatasetItem tag="tbody" class="fs-sm">
                      <template #default="{ row }">
                        <tr>
                          <td class="fs-sm text-center">{{ row.art_code }}</td>
                          <td class="fs-sm text-center">{{ row.art_cod_tres_letras }}</td>
                          <td class="fs-sm text-center">{{ row.art_descripcion }}</td>
                          <td class="fs-sm text-center">{{ row.compartimiento }}</td>
                          <td class="fs-sm text-center">{{ row.cotizacion }}</td>
                          <td class="fs-sm text-center">{{ row.fecha }}</td>
                          <td class="fs-sm text-center">{{ row.user_solicitud_reserva }}</td>
                          <td class="fs-sm text-end">{{ row.cantidad }}</td>
                          <td class="fs-sm text-end">{{ row.reservado }}</td>
                          <td class="fs-sm text-end">{{ row.trasladado }}</td>
                          <td class="fs-sm text-end">{{ row.pending_transfer }}</td>
                          <td class="fs-sm text-end">{{ row.art_peso }}</td>
                          <td style="width: 20px;" class="fs-sm text-center">
                            <input v-if="(row.pending_transfer > 0)" type="checkbox" class="form-check-input"
                              v-model="row.check_seleccion" @change="applyAlPendingTransfer($event, row)">
                          </td>
                          <td class="fs-sm" style="width:70px">
                            <input v-if="(row.pending_transfer > 0)" type="text"
                              class="form-control form-control-sm text-end" v-model="row.seleccionado"
                              @change="applyTransfer(row)" />
                          </td>
                          <td class="fs-sm" style="width:30px">
                            <button v-if="row.picking" class="btn btn-sm btn-danger" title="Cancelar Picking"
                              @click="cancelarPicking(row)" :disabled="loadingCancelPicking">
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
    <div v-if="!loadingPendingGuides && dataPendingGuides">
      <BaseBlock>
        <div class="row">
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
                    <td class="fs-sm text-center">{{ row.numero_guia }}</td>
                    <td class="fs-sm text-center">{{ row.fecha_salida }}</td>
                    <td class="fs-sm text-center">{{ row.razon_social_transportista }}</td>
                    <td class="fs-sm text-center">{{ row.placa }}</td>
                    <td class="fs-sm text-center space-x-2">
                      <button type="button" class="btn btn-sm btn-outline-primary"
                        @click="printPdfGuiaRemision(row.id)">Imprimir</button>
                      <button type="button" class="btn btn-sm btn-outline-success" @click="dispatchGuiaRemision(row.id)"
                        :disabled="loadingDispacthGuide">Despachar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </BaseBlock>
    </div>
    <div v-if="!loadingHeaderTransfer && (!dataHeaderTransfer || dataHeaderTransfer.length === 0)">
      <div class="text-center">
        <i class="fa fa-box-open fa-2x text-muted mb-2"></i>
        <p class="text-muted mb-0">No se encontraron registros para mostrar</p>
      </div>
    </div>
  </div>


  <!-- modales  -->
  <!-- modal de picking -->
  <div class="modal" id="modal-liberar" tabindex="-1" role="dialog" aria-labelledby="modal-picking" aria-hidden="true"
    ref="pickingModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <verPickingReservas v-if="dataPicking && dataPicking.length > 0" :header="dataHeaderTransfer"
          :picking="dataPicking" @refresh="refresh()" @closePickingModal="closePickingModal()"></verPickingReservas>
      </div>
    </div>
  </div>

  <!-- modal guia remision reservas -->
  <div class="modal" id="modal-guia-reservas" tabindex="-1" role="dialog" aria-labelledby="modal-guia-reservas"
    aria-hidden="true" ref="guiaRemisionModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document">
      <div class="modal-content">
        <verGuiaRemisionReserva v-if="dataGuiaRemision && dataGuiaRemision.length > 0" :header="dataHeaderTransfer"
          :detalle="dataGuiaRemision" @refresh="refresh()" @closeModal="closeGuiaRemisionModal()">
        </verGuiaRemisionReserva>
      </div>
    </div>
  </div>

</template>

<style scoped>
@media (min-width: 1000px) {
  .table.table-sm> :not(caption)>*>* {
    padding-top: .25rem;
    padding-bottom: .15rem;
  }
}
</style>
