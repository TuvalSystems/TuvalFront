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
        <div class="d-flex flex-wrap align-items-center gap-2 mb-3 fs-sm">
          <span class="text-muted">Tipo de despacho del pedido:</span>
          <span class="fw-semibold">{{ verdevolucion.tipo_despacho || 'Sin tipo de despacho' }}</span>
          <span class="text-muted ms-sm-3">Responsable del pago de transporte:</span>
          <span class="badge bg-info-light text-info">
            {{ verdevolucion.responsable_pago_transporte?.codigo === 'tuval'
              ? 'Tuval'
              : verdevolucion.responsable_pago_transporte?.codigo === 'cliente'
                ? 'Cliente'
                : verdevolucion.responsable_pago_transporte?.descripcion || 'No Aplica' }}
          </span>
        </div>
        <DetalleDevolucion></DetalleDevolucion>
      </div>
    </template>
  </BaseBlock>
  <div class="block-content block-content-full bg-body">
    <div class="row">
      <label for="nota-interna" class="col-sm-2 col-form-label text-end">Observación:</label>
      <div class="col-sm-6">
        <input v-model="verdevolucion.observacion" type="text"
               id="orden-de-compra" class="form-control"
               disabled
        />
      </div>
      <div class="col-sm-4 text-end">
        <button  type="button" class="btn btn-success btn-sm" @click="emit('aprobar')"><i class="fa fa-check"></i> Aprobar</button>
        <button  type="button" class="btn btn-danger btn-sm mx-2" @click="emit('rechazar')"><i class="fa fa-times"></i> Rechazar</button>
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
const { verdevolucion } = defineProps({
  verdevolucion: Object,
})
const emit = defineEmits(["aprobar", "rechazar"]);
const store = useStore();
const segmentocliente = computed(() => store.state.segmentocliente);

</script>
