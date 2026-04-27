<script setup>
import { onMounted, toRefs, nextTick, watch } from 'vue';
import { formatPrice, toNum, formatJm } from "@/functions";
import { useSalesTransfersProcess } from "@/composables/bodegas/transferencia/useSalesTransferProcess";
import { useVehiclesStore } from "@/stores/bodegas/guiasremision/vehicles";

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

  //refresh
  refresh,

  //cancelar picking
  loadingCancelPicking,
  cancelPicking
} = useSalesTransfersProcess();
const vehicles = useVehiclesStore();


watch(() => payload.pedido, () => {
  fetchListTransfer();
});


onMounted(async () => {
  payload.destino = pvDestino.value;
  await nextTick();
  if (!dataTransferHeader.value) fetchDataTransferHeader();
  if (!dataListTransfer.value) fetchListTransfer();
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
            <button class="btn btn-outline-primary btn-sm" title="Refrescar" aria-label="Refrescar" @click="refresh"
              :disabled="loadingListTransfer">
              <i v-if="!loadingListTransfer" class="fa fa-refresh"></i>
              <span v-else class="spinner-border spinner-border-sm"></span>
            </button>
          </div>
        </template>

        <!-- filtros -->
        <div class="row g-3 align-items-end px-2 pt-2 pb-1 mb-4">
          <div class="col-12 col-sm-6 col-lg-3">
            <small class="text-muted d-block mb-1">Pedidos</small>
            <div class="input-group input-group-sm">
              <select class="form-select form-select-sm" v-model="payload.pedido">
                <option value="">Todos</option>
                <option v-for="p in dataTransferHeader.listsOrders" :key="p" :value="p">{{ p }}</option>
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

        <div v-if="!loadingListTransfer && dataListTransfer" class="m-2">
          <Dataset v-slot="{ ds }" :ds-data="dataListTransfer" :ds-sortby="sortBy"
            :ds-search-in="['ART_CODIGO', 'ART_DESCRIPCION', 'orderNumber']">
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
                        <tr :class="(row.has_guide_active && row.pending_transfer > 0 ? 'table-warning' : '')">
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
                              v-model="row.check_seleccion" @change="applyAlPendingTransfer($event, row)">
                          </td>
                          <td class="fs-sm">
                            <input v-if="(row.pending_transfer > 0)" type="text"
                              class="form-control form-control-sm text-end" v-model="row.seleccionado"
                              @change="applyTransfer(row)" />
                          </td>
                          <td class="fs-sm" style="width:30px">
                            <button v-if="row.picking && row.check_disable_button_picking === false"
                              class="btn btn-sm btn-danger" title="Cancelar Picking" @click="cancelarPicking(row)"
                              :disabled="loadingCancelPicking">
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
          </Dataset>
        </div>
      </BaseBlock>

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
</style>