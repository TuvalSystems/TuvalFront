<script setup>
import { onMounted, toRefs } from 'vue';
import { formatPrice } from "@/functions";
import { useReservationTransferByWarehouse } from '@/composables/bodegas/reservas/useReservationTransferByWarehouse';

const props = defineProps({
  ptovtaId: { type: String, required: true },  //ptovta destino
  bodega: { type: String, required: true },
  peso: { type: Number, required: true },
});
const { ptovtaId } = toRefs(props);
const {
  dataDetailTransfer,
  loadingDetailTransfer,
  payload,
  fetchListTransfersByWarehouseOriginAndDestination,
} = useReservationTransferByWarehouse();
const bodega =  dataDetailTransfer.destination;
const pesoTotal = dataDetailTransfer.pesoTotal;
onMounted(() => {
  payload.destino = ptovtaId.value;
  if (dataDetailTransfer.value === null) {
    fetchListTransfersByWarehouseOriginAndDestination();
  }
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
    <BaseBlock :title="'Destino: ' + bodega">
      <template #options>
        <div class="block-options-item">
          <span class="badge bg-warning">Peso total: {{ formatPrice(pesoTotal) }} Tn</span>
        </div>
      </template>
    </BaseBlock>
  </div>
</template>

<style lang="css" scoped></style>
