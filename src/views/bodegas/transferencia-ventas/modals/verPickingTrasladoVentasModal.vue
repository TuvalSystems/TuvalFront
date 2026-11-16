<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { formatJm } from "@/functions";
import {
  swalSuccess,
  swalError,
  swalWarning,
} from "@/functions/swal-alert.js";
import { useSalesTransfersProcess } from "@/composables/bodegas/transferencia/useSalesTransferProcess";

const {
  //actualizar picking
  loadingUpdatePicking,
  applyPickingSelected,
  // imprimir picking
  loadingPrintPicking,
  printPicking,
} = useSalesTransfersProcess();

const emit = defineEmits(["refresh", "closePickingModal"]);

const props = defineProps({
  header: { type: Object, default: () => ({}) },
  picking: { type: Array, default: () => [] }
})

const pesoTotalItems = ref(0)
const pesoTotalItemsFmt = ref('0.00')

function calcularPesoItems(items) {
  const totalKg = Array.isArray(items)
    ? items.reduce((acc, it) => acc + (Number(it?.ART_PESO) || 0) * (Number(it?.seleccionado ?? 0) || 0), 0)
    : 0;
  pesoTotalItems.value = totalKg
  pesoTotalItemsFmt.value = formatJm(totalKg, 2);
}


async function imprimirPicking() {
  let payload = {
    origen: props.header?.origen ?? '',
    destino: props.header?.destination ?? '',
    pesototal: pesoTotalItemsFmt.value,
    items: props.picking,
  }

  const respAc = await applyPickingSelected(props.picking);
  if (!respAc.ok) {
    swalError(respAc.message);
    return;
  }

  const respPrint = await printPicking(payload);
  if (respPrint?.ok) {
    swalSuccess("Archivo descargado correctamente");
    await nextTick()
    emit('closePickingModal')
    emit('refresh')
    return;
  }
  const msg = respPrint?.message || "No se pudo generar el documento";
  (respPrint?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);


}



watch(
  () => props.picking,
  () => {
    calcularPesoItems(props.picking);
  },
  { immediate: true }
);


onMounted(() => { });
</script>

<template>
  <BaseBlock :title="'Destino: ' + (props.header?.destination ?? '')" class="mb-0">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <div class="table-responsive">
      <table class="table table-borderless table-sm table-vcenter mt-1 mb-2">
        <thead>
          <tr>
            <th scope class="text-start text-label-muted">COMPT./EXIST.</th>
            <th scope class="text-center text-label-muted">CTL</th>
            <th scope class="text-start text-label-muted">Descripción</th>
            <th scope class="text-center text-label-muted">UDM</th>
            <th scope class="text-end text-label-muted">Cantidad</th>
            <th scope class="text-end text-label-muted">Peso</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(art, i) in props.picking" :key="i">
            <td class="fs-sm ">
              <code data-bs-toggle="tooltip" title="Compartimiento">{{ art.compartimiento }}</code>
              <span class="text-muted mx-1"> | </span>
              <code data-bs-toggle="tooltip" title="Existencia" class="text-end">{{ art.existencia }}</code>
            </td>
            <td class="fs-sm text-center">{{ art.ART_CODIGO_TRES_LETRAS }}</td>
            <td class="fs-sm">{{ art.ART_DESCRIPCION }}</td>
            <td class="fs-sm text-center"> {{ art.ART_PLAN_UMEDIDA }}</td>
            <td class="fs-sm text-end"> {{ art.seleccionado }}</td>
            <td class="fs-sm text-end"> {{ art.ART_PESO }}</td>
          </tr>
          <tr>
            <th scope colspan="6"></th>
          </tr>
          <tr>
            <th scope colspan="5" class="fs-sm text-end text-label-muted">Peso total</th>
            <th scope class="fs-sm text-end fw-bold text-uppercase">{{ pesoTotalItemsFmt }} kg </th>
          </tr>
        </tbody>
      </table>
    </div>
  </BaseBlock>
  <div class="block-content block-content-full text-end bg-body">
    <button type="button" class="btn btn-primary btn-sm mx-2" data-bs-dismiss="modal"> Cerrar</button>
    <button type="button" class="btn btn-success btn-sm mx-2" @click="imprimirPicking()" :disabled="loadingPrintPicking || loadingUpdatePicking"><i
        class="fa fa-print"></i>
      Imprimir</button>

  </div>
</template>

<style scoped>
.text-label-muted {
  text-transform: uppercase;
  font-weight: 700;
  /* fw-bold */
  font-size: 12px;
  line-height: 1.2;
}
</style>
