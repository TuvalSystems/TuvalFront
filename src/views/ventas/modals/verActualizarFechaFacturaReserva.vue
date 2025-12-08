<script setup>
import { onMounted, watch, ref, reactive } from 'vue';
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";
import { useOrderUpdate } from '@/composables/venta/pedidos/useOrderUpdate'
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
const {  //state
  dataUpddateDateInvoice,
  loadingDateInvoice,
  //functions
  updateDateInvoiceReserved,
  insertDataInvoice,
  resetFormDateInvoice
} = useOrderUpdate()
const flatPickrState = reactive({
  fecha: {
    minDate: new Date(new Date().setDate(new Date().getDate() - 1)),
    locale: Spanish,
  },

});
const emit = defineEmits(["closeModal"]);
const props = defineProps({
  'pedido': Object
});

watch(
  () => props.pedido,
  () => {

    insertDataInvoice(props.pedido)
  },
  { immediate: true }
);



async function updateForm() {
  const resp = await updateDateInvoiceReserved();
  if (!resp?.ok) {
    swalError(resp?.message || 'Error al actualizar la fecha de factura de reserva');
    return;
  }

  emit('closeModal');
  await swalSuccess(resp.message || 'Fecha de factura de reserva actualizada correctamente');

}
onMounted(() => { });
</script>

<template>
  <BaseBlock :title="`Pedido: ${pedido.pedido}`">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close"
        @click="resetFormDateInvoice">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content fs-sm pb-0">
        <div class="mb-3">
          <label for="orden_de_compra" class="form-label">Factura reserva</label>
          <flat-pickr id="fechaReserva" class="form-control form-control-sm"
            v-model="dataUpddateDateInvoice.fe_facturacion_reserva" :config="flatPickrState.fecha" />
        </div>
      </div>
    </template>
  </BaseBlock>
  <!-- Footer -->
  <div class="block-content block-content-full bg-body">
    <div class="d-flex justify-content-end gap-2">
      <button type="button" class="btn btn-dark btn-sm" data-bs-dismiss="modal">Cerrar</button>
      <button type="button" class="btn btn-primary btn-sm"  :disabled="loadingDateInvoice"
        @click="updateForm">Actualizar</button>
    </div>
  </div>
</template>

<style lang="css" scoped></style>
