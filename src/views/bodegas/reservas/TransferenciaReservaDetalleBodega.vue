<script setup>
import { onMounted, toRefs, ref } from 'vue';
import { formatPrice } from "@/functions";
import { useReservationTransferByWarehouse } from '@/composables/bodegas/reservas/useReservationTransferByWarehouse';
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

} = useReservationTransferByWarehouse();


function verPicking() {

}


function guiaRemision() {

}








onMounted(async () => {
  payload.destino = ptovtaId.value;
  payloadHeader.destino = ptovtaId.value;
  if (!dataHeaderTransfer.value) fetchHeaderTransferByWarehouseOriginAndDestination();
  if (!dataDetailTransfer.value) fetchListTransfersByWarehouseOriginAndDestination();
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
      <p class="mt-2 text-muted">Cargando detalle de transferencias...</p>
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
            <div class="input-group">
              <select class="form-select form-control-sm" v-model="payload.cotizacion">
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
                            <span>SELECCIONAR</span>
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
                            <button v-if="row.picking" class="btn btn-sm btn-danger" title="Cancelar Picking">
                              <i class="fa fa-xmark"></i>
                            </button>
                            <!-- <button v-else class="btn btn-sm btn-primary" title="Generar Picking">
                              <i class="fa fa-check"></i>
                            </button> -->
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
              <button type="button" class="btn btn-sm btn-warning mx-2" :disabled="disabledPicking"
                @click="verPicking()">
                <i class="fa fa-people-carry-box"></i> Picking
              </button>
              <button type="button" class="btn btn-sm btn-success mx-2" :disabled="disabledGuiaRemision"
                @click="guiaRemision()"><i class="fa fa-file-lines"></i>
                Generar guía de remisión</button>
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
</template>

<style scoped>
@media (min-width: 992px) {
  .table.table-sm> :not(caption)>*>* {
    padding-top: .35rem;
    padding-bottom: .35rem;
  }
}
</style>
