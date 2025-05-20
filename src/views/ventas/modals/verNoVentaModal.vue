<script setup>
import { useFormNoVenta } from '@/composables/cotizaciones/useFormNoVenta'
import { useMotivosStore } from '@/stores/cotizaciones/useMotivosStore'
import { watch, onMounted } from 'vue';
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";

const props = defineProps({
    vercotizacion: Object,
})


const motivoStore = useMotivosStore()
const {
    formData,
    isValid,
    errors,
    guardar,
    resetForm
} = useFormNoVenta(props.vercotizacion, motivoStore.motivos)


watch(
  () => props.vercotizacion?.id,
  (id) => {
    if (!id) return

    resetForm()

    const row = props.vercotizacion
    formData.motivo_id = row.motivo_id ?? ''
    formData.recordar = row.recordar ?? 0
    formData.observacion = row.observacion ?? ''
    formData.fecha_recordatorio = row.fecha_recordatorio ?? ''
    formData.cotizacion_id = row.id ?? null
  },
  { immediate: true }
)

watch(
  () => formData.motivo_id,
  (nuevoMotivo) => {
    const motivo = motivoStore.motivos.find(m => m.id == nuevoMotivo)
    if (motivo && motivo.descripcion.toLowerCase().includes('proyecto')) {
      if (formData.recordar !== 1) {
        swalWarning('Si el motivo es Proyecto, el recordatorio debe ser Sí y debe tener una fecha de recordatorio.')
      }
    }
  }
)


onMounted(() => {
    if (motivoStore.motivos.length == 0) {
        motivoStore.fetchMotivos()
    }
});



</script>
<template>
    <BaseBlock title="Cotización de Factura">
        <template #options>
            <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close"
                @click="resetForm">
                <i class="fa fa-fw fa-times"></i>
            </button>
        </template>
        <template #content>
            <div class="block-content fs-sm pb-0">
                <!-- Motivos No Venta -->
                <div class="mb-3">
                    <label class="form-label">Motivos No Venta</label>
                    <div v-if="motivoStore.loading"> Cargando motivos...</div>
                    <div v-else-if="motivoStore.error"> {{ motivoStore.error }}</div>
                    <select class="form-select" v-model="formData.motivo_id" :class="{ 'is-invalid': errors.motivo_id }">
                        <option v-for="motivo in motivoStore.motivos" :key="motivo.id" :value="motivo.id">
                            {{ motivo.descripcion }}
                        </option>
                    </select>
                    
                </div>
                <!-- Recordar -->
                <div class="mb-3">
                    <label class="form-label">¿Recordar? &nbsp;</label>
                    <div class="form-check form-check-inline">
                        <input type="radio" class="form-check-input" id="recordarSi" name="recordar" :value="1"
                            v-model="formData.recordar" :class="{ 'is-invalid': errors.recordar }">
                        <label class="form-check-label" for="recordarSi">Sí</label>
                    </div>
                    <div class="form-check form-check-inline">
                        <input type="radio" class="form-check-input" id="recordarNo" name="recordar" :value="0"
                            v-model="formData.recordar" :class="{ 'is-invalid': errors.recordar }">
                        <label class="form-check-label" for="recordarNo">No</label>
                        
                    </div>

                    
                </div>
                <!-- Fecha Recordatorio -->
                <div class="mb-3">
                    <label for="fecha_recordatorio" class="form-label">Fecha del Recordatorio</label>
                    <input type="date" class="form-control form-control-sm" id="fecha_recordatorio"
                        v-model="formData.fecha_recordatorio" :class="{ 'is-invalid': errors.fecha_recordatorio }">
                        <div class="invalid-feedback">Debe ingresar una fecha</div>
                </div>
                <!-- Observaciones -->
                <div class="mb-3">
                    <label for="observaciones" class="form-label">Observacion</label>
                    <textarea id="observaciones" class="form-control" rows="3" v-model="formData.observacion"
                        placeholder="Agrega una observación..."></textarea>
                </div>
            </div>
        </template>
    </BaseBlock>
    <!-- Footer -->
    <div class="block-content block-content-full bg-body">
        <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-danger btn-sm" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" class="btn btn-primary btn-sm" data-bs-dismiss="modal"
                :disabled="!isValid"   @click="guardar">Guardar</button>
        </div>
    </div>
</template>