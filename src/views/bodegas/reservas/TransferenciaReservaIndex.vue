<script setup>
import { onMounted } from 'vue';
import { formatPrice } from "@/functions";
import { useReservationTransfers } from '@/composables/bodegas/reservas/useReservationTransfer';
const {
  dataTransfer,
  loadingTransfer,
  fetchListTransfersCount,
} = useReservationTransfers();

onMounted(() => {
  if (dataTransfer.value === null) {
    fetchListTransfersCount();
  }
});
</script>

<template>
  <!-- Hero -->
  <BasePageHeading title="Transferencias por Reserva">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Bodegas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Transferencias por Reserva</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <div class="content">
    <div v-if="loadingTransfer" class="text-center py-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2 text-muted">Cargando transferencias...</p>
    </div>
    <div v-if="!loadingTransfer && dataTransfer">
      <div class="row items-push">
        <div v-for="(bodega, i) in dataTransfer" :key="i" class="col-sm-6 col-xxl-3">

          <BaseBlock class="d-flex flex-column h-100 mb-0">
            <template #content>
              <div
                class="block-content block-content-full flex-grow-1 d-flex justify-content-between align-items-center">
                <dl class="mb-0">
                  <dt class="fs-3 fw-bold"
                    :class="{ 'text-danger': bodega.totalItems === 0 && bodega.totalGuidePending > 0 }">
                    {{ bodega.totalItems > 0 ? bodega.totalItems : bodega.totalGuidePending }}
                  </dt>

                  <dd class="fs-sm fw-medium text-muted mb-0">
                    <router-link
                      :to="{ name: 'bodegas-reservas-transferencias-detalle', params: { ptovtaId: bodega.ptovtaId } }">
                      {{ bodega.bodega }}
                    </router-link>
                    <br>

                    <span v-if="bodega.totalItems > 0" class="fs-xs text-muted">Items pendientes</span>
                    <span v-else-if="bodega.totalGuidePending > 0" class="fs-xs fw-bold text-warning">
                      <i class="fa fa-exclamation-circle"></i> Guías pendientes
                    </span>
                    <span v-else class="fs-xs text-success">Completado</span>
                  </dd>
                </dl>

                <router-link
                  :to="{ name: 'bodegas-reservas-transferencias-detalle', params: { ptovtaId: bodega.ptovtaId } }">
                  <div class="item item-rounded-lg"
                    :class="bodega.totalItems === 0 && bodega.totalGuidePending > 0 ? 'bg-danger-light text-danger' : 'bg-body-light text-primary'">
                    <i class="fs-3"
                      :class="bodega.totalItems === 0 && bodega.totalGuidePending > 0 ? 'fa fa-file-invoice' : 'fa fa-warehouse'"></i>
                  </div>
                </router-link>
              </div>

              <div class="bg-body-light rounded-bottom">
                <router-link
                  :to="{ name: 'bodegas-reservas-transferencias-detalle', params: { ptovtaId: bodega.ptovtaId } }">
                  <a class="block-content block-content-full block-content-sm fs-sm fw-medium d-flex align-items-center justify-content-between"
                    href="javascript:void(0)">
                    <span>Ver más</span>

                    <span v-if="bodega.totalItems > 0"
                      class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-warning-light text-warning mx-1"
                      title="Peso pendiente">
                      <i class="fa fa-weight-hanging"></i> {{ formatPrice(bodega.pesoTon) }} Tn
                    </span>

                    <span v-else-if="bodega.totalGuidePending > 0"
                      class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill bg-danger-light text-danger mx-1"
                      title="Guías por gestionar">
                      <i class="fa fa-file-invoice"></i> {{ bodega.totalGuidePending }} Guías
                    </span>

                    <i class="fa fa-arrow-alt-circle-right ms-1 opacity-25 fs-base"></i>
                  </a>
                </router-link>
              </div>
            </template>
          </BaseBlock>
        </div>
      </div>
    </div>
    <div v-if="!loadingTransfer && (!dataTransfer || dataTransfer.length === 0)">
      <div class="text-center">
        <i class="fa fa-box-open fa-2x text-muted mb-2"></i>
        <p class="text-muted mb-0">No se encontraron registros para mostrar</p>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped></style>
