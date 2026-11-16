<template>
  <BaseBlock title="Aprobar devolución" class="mb-0">
    <template #options>
      <button
          type="button"
          class="btn-block-option"
          data-bs-dismiss="modal"
          aria-label="Close"
      >
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content fs-sm ">
        <CabeceraDevolucion :verdevolucion="verdevolucion" :segmentocliente="segmentocliente"></CabeceraDevolucion>
        <DetalleDevolucion></DetalleDevolucion>
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full bg-body">
    <div class="row">
      <label for="nota-interna" class="col-sm-2 col-form-label text-end">Observación:</label>
      <div class="col-sm-6">
        <input v-model="editable_observacion" type="text"
               id="orden-de-compra" class="form-control"
               disabled
        />
      </div>
      <div class="col-sm-4 text-end">
        <button  type="button" class="btn btn-primary btn-sm mx-1" data-bs-dismiss="modal"> Cerrar</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import CabeceraDevolucion from "@/components/CabeceraDevolucion.vue";
import DetalleDevolucion from "@/components/DetalleDevolucion.vue";
const props = defineProps({
  verdevolucion: Object,
})
const store = useStore();
const segmentocliente = computed(() => store.state.segmentocliente);

const emit = defineEmits(["update:verdevolucion"]);
const editable_observacion = computed({
  get: () => props.verdevolucion.observacion,
  set: (value) => emit("update:verdevolucion", { observacion: value }),
});
</script>
