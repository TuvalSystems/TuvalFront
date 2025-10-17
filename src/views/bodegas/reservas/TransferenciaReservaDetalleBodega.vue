<script setup>
import { onMounted, toRefs } from 'vue';
import { formatPrice } from "@/functions";
const props = defineProps({
  ptovtaId: { type: String, required: true },
  bodega: { type: String, required: true },
  peso: { type: Number, required: true },
});
const { ptovtaId } = toRefs(props);

const peso = 0.021;
const bodega = 'Bodega 1';

onMounted(() => {
  // console.log(ptovtaId);
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
          <span class="badge bg-warning">Peso total: {{ formatPrice(peso) }} Tn</span>
        </div>
      </template>
    </BaseBlock>
  </div>
</template>

<style lang="css" scoped></style>
