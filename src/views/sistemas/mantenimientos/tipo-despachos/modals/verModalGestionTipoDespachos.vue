<script setup>
import { computed, reactive, watch } from "vue";
import { swalError, swalSuccess, swalWarning } from "@/functions/swal-alert.js";
import { useDispatchTypeActions } from "@/composables/sistemas/mantenimientos/tipo-despachos/useDispatchTypeActions";

const props = defineProps({
  typeOption: { type: String, required: true },
  detail: { type: Object, default: null },
  pointSales: { type: Array, default: () => [] },
});
const emit = defineEmits(["closeModal", "saved"]);
const {
  saving,
  saveDispatchType,
  updateDispatchType,
} = useDispatchTypeActions();
const isEditing = computed(() => props.typeOption === "actualizar");
const form = reactive({ descripcion: "", observacion: "", responsable_pago: "", punto_venta_ids: [] });

function resetForm() {
  form.descripcion = "";
  form.observacion = "";
  form.responsable_pago = "";
  form.punto_venta_ids = [];
}

defineExpose({ resetForm });

watch(
  () => [props.typeOption, props.detail],
  () => {
    form.descripcion = props.detail?.descripcion ?? "";
    form.observacion = props.detail?.observacion ?? "";
    form.responsable_pago = props.detail?.responsable_pago ?? "";
    form.punto_venta_ids = (props.detail?.puntos_venta ?? []).map((point) => point.id);
  },
  { immediate: true }
);

async function submitForm() {
  if (saving.value || !form.descripcion.trim()) return;

  const payload = {
    descripcion: form.descripcion.trim(),
    observacion: form.observacion.trim(),
    responsable_pago: form.responsable_pago,
    punto_venta_ids : form.punto_venta_ids
  };
  const response = isEditing.value
    ? await updateDispatchType({ id: props.detail?.id, ...payload })
    : await saveDispatchType(payload);

  if (response?.ok) {
    emit("saved");
    swalSuccess(response.message);
    return;
  }

  const message =
    response?.message || "No se pudo guardar el tipo de despacho.";
  (response?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
}
</script>

<template>
  <form class="dispatch-type-form" @submit.prevent="submitForm">
    <div class="modal-header dispatch-modal-header">
      <div class="d-flex align-items-center gap-3">
        <div class="dispatch-modal-icon" aria-hidden="true">
          <i :class="isEditing ? 'fa fa-pen' : 'fa fa-truck-fast'"></i>
        </div>
        <h5
          id="dispatch-type-modal-title"
          class="modal-title dispatch-modal-title fw-bold"
        >
          {{ isEditing ? "Editar tipo de despacho" : "Nuevo tipo de despacho" }}
        </h5>
      </div>
      <button
        type="button"
        class="btn-close ms-2"
        aria-label="Cerrar"
        :disabled="saving"
        @click="emit('closeModal')"
      ></button>
    </div>

    <div class="modal-body px-4 py-4">
      <div class="mb-3">
        <label for="dispatch-type-description" class="form-label fw-semibold">
          Descripción <span class="text-danger" aria-hidden="true">*</span>
        </label>
        <input
          id="dispatch-type-description"
          v-model.trim="form.descripcion"
          type="text"
          class="form-control form-control-sm"
          required
          :disabled="saving"
        />
      </div>

      <div>
        <label for="dispatch-type-observation" class="form-label fw-semibold"
          >Observación</label
        >
        <textarea
          id="dispatch-type-observation"
          v-model.trim="form.observacion"
          class="form-control form-control-sm"
          rows="3"
          :disabled="saving"
        ></textarea>
      </div>
      <!-- responsable del pago -->
      <div>
        <label
          for="dispatch-type-responsable-pago"
          class="form-label fw-semibold"
          >Responsable Pago
        </label>
        <select
          class="form form-select form-select-sm"
          name=""
          id=""
          v-model="form.responsable_pago"
        >
          <option value="tuval">TUVAL</option>
          <option value="cliente">CLIENTE</option>
        </select>
      </div>

       <!-- select multiple de puntos de venta -->
         <div>
        <label
          for="dispatch-type-puntos-venta"
          class="form-label fw-semibold"
          >Puntos de Venta
        </label>
        <select
          class="form form-select form-select-sm"
          id="dispatch-type-puntos-venta"
          v-model="form.punto_venta_ids"
          multiple
          size="5"
          :disabled="saving"
        >
          <option v-for="point in pointSales" :key="point.id" :value="point.id">
            {{ point.codigo }} - {{ point.descripcion }}
          </option>
        </select>
      </div>
    </div>

    <div class="modal-footer dispatch-modal-footer px-2 py-2">
      <button
        type="button"
        class="btn btn-alt-secondary btn-sm"
        :disabled="saving"
        @click="emit('closeModal')"
      >
        Cancelar
      </button>
      <button
        type="submit"
        class="btn btn-primary btn-sm"
        :disabled="saving || !form.descripcion.trim()"
      >
        <i
          v-if="saving"
          class="fa fa-spinner fa-spin me-1"
          aria-hidden="true"
        ></i>
        <i v-else class="fa fa-check me-1" aria-hidden="true"></i>
        {{ isEditing ? "Guardar cambios" : "Crear registro" }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.dispatch-modal-header {
  padding: 1rem 1.5rem;
  background: var(--bs-body-bg);
}

.dispatch-modal-title {
  font-size: 1rem;
  line-height: 1.25;
  margin: 0;
}

.dispatch-modal-icon {
  display: grid;
  place-items: center;
  flex: 0 0 2.25rem;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.65rem;
  color: var(--bs-primary);
  background: rgba(var(--bs-primary-rgb), 0.12);
}

.dispatch-type-form .form-label {
  font-size: 12px;
}

.dispatch-modal-footer {
  background: rgba(var(--bs-primary-rgb), 0.04);
}
</style>
