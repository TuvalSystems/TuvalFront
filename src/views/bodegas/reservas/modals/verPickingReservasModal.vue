<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { useReservationTransferByWarehouse } from '@/composables/bodegas/reservas/useReservationTransferByWarehouse';
import { formatJm } from "@/functions";
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";
const props = defineProps({
  header: { type: Object, default: () => ({}) },
  picking: { type: Array, default: () => [] }
})
const { loadingPicking, applyPickingSelected, printPickingPdf } = useReservationTransferByWarehouse();
const emit = defineEmits(["refresh", "closePickingModal"]);



const pesoTotalItems = ref(0)
const pesoTotalItemsFmt = ref('0.00')
function calcularPesoItems(items) {
  const totalKg = Array.isArray(items)
    ? items.reduce((acc, it) => acc + (Number(it?.art_peso) || 0) * (Number(it?.seleccionado ?? 0) || 0), 0)
    : 0;
  pesoTotalItems.value = totalKg
  pesoTotalItemsFmt.value = formatJm(totalKg, 2);
}

watch(
  () => props.picking,
  () => {
    calcularPesoItems(props.picking);
  },
  { immediate: true }
);





async function imprimirPicking() {
  let payload = {
    origen: props.header?.origin ?? '',
    destino: props.header?.destination ?? '',
    pesototal: pesoTotalItemsFmt.value,
    items: props.picking,
  }
  await applyPickingSelected(props.picking);
  const res = await printPickingPdf(payload);
  if (res?.ok) {
    // swalSuccess('PDF generado correctamente.')
    await nextTick()
    emit('closePickingModal')
    emit('refresh')
  } else {
    swalError(res?.message || 'No se pudo generar el PDF.')
  }
}

onMounted(() => {
});
</script>

<template>
  <BaseBlock :title="'Destino: ' + (props.header?.destination ?? '')" class="mb-0">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <div class="table-responsive">
      <table class="table table-striped table-sm table-vcenter mt-4">
        <thead>
          <tr>
            <th class="text-start">COMPT./EXIST.</th>
            <th class="text-center">CTL</th>
            <th class="text-center">Descripción</th>
            <th class="text-center">UDM</th>
            <th class="text-center">Cantidad</th>
            <th class="text-center">Peso</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(art, i) in props.picking" :key="i">
            <td class="fs-sm ">
              <code data-bs-toggle="tooltip" title="Compartimiento">{{ art.compartimiento }}</code>
              <span class="text-muted mx-1"> </span>
              <code data-bs-toggle="tooltip" title="Existencia" class="text-end">{{ art.existencia }}</code>
            </td>
            <td class="fs-sm text-center">{{ art.art_cod_tres_letras }}</td>
            <td class="fs-sm">{{ art.art_descripcion }}</td>
            <td class="fs-sm text-center"> {{ art.art_plan_umedida }}</td>
            <td class="fs-sm text-end"> {{ art.seleccionado }}</td>
            <td class="fs-sm text-end"> {{ art.art_peso }}</td>
          </tr>
          <tr>
            <th colspan="6"></th>
          </tr>
          <tr>
            <th colspan="5" class="fs-sm text-end">Peso total del despacho</th>
            <th class="fs-sm text-end">{{ pesoTotalItemsFmt }} kg </th>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button type="button" class="btn btn-primary btn-sm mx-2" data-bs-dismiss="modal"> Cerrar</button>
    <button type="button" class="btn btn-success btn-sm mx-2" @click="imprimirPicking()" :disabled="loadingPicking"><i
        class="fa fa-print"></i>
      Imprimir</button>

  </div>
</template>

<style lang="css" scoped></style>
