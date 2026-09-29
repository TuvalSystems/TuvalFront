<script setup>
import { computed, onMounted, ref } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { useTypeIdentifyStore } from "@/stores/catalogos/useTypeIdentifyStore";
import { useCarrierDriverActions } from "@/composables/sistemas/mantenimientos/chofer-transportista/useCarrierDriverActions";
const props = defineProps({
  carrierDriver: {
    type: Object,
    default: null,
  },
});

// Tipo de identificaciones
const typeIdentifyStore = useTypeIdentifyStore();
const listTypeIdentify = computed(() => typeIdentifyStore.list);
const loadingIdentify = computed(() => typeIdentifyStore.loading);

const {
  form,
  v$,
  selectedTypeIdentify,
  identifyName,
  identifyMaxAllowed,
  identifyLengthMessage,
  identifyInputMode,
  onIdentificationInput,
} = useCarrierDriverActions(listTypeIdentify);

const emit = defineEmits(["hidden"]);
const baseModal = ref(null);

const title = computed(() =>
  props.carrierDriver
    ? "Editar chofer transportista"
    : "Nuevo chofer transportista"
);

function show() {
  baseModal.value?.show();
}

function hide() {
  baseModal.value?.hide();
}

defineExpose({ show, hide });

onMounted(() => {
  typeIdentifyStore.fetchAll();
});
</script>

<template>
  <BaseModal
    id="modal-chofer-transportista"
    ref="baseModal"
    :title="title"
    size="lg"
    scrollable
    body-class="p-0"
    @hidden="emit('hidden')"
  >
    <div class="p-3 p-md-4">
      <section class="modal-form-section">
        <div class="modal-form-section-header">
          <div>
            <h5 class="mb-1">Datos de identificación</h5>
            <!-- <p class="text-muted fs-sm mb-0">
              Ingresa los datos que identifican al chofer transportista.
            </p> -->
          </div>
          <span
            class="badge rounded-pill flex-shrink-0"
            :class="
              carrierDriver
                ? 'bg-info-light text-info'
                : 'bg-success-light text-success'"
          >
            {{ carrierDriver ? "Edición" : "Nuevo registro" }}
          </span>
        </div>

        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label
              class="text-label-muted mb-1"
              for="carrier-driver-identification-type"
            >
              Tipo de identificación
            </label>
            <select
              id="carrier-driver-identification-type"
              v-model="form.tipo_identificacion_id"
              class="form-select form-select-sm"
              :disabled="loadingIdentify"
              :class="{
                'is-invalid': v$.tipo_identificacion_id.$errors.length,
              }"
              @blur="v$.tipo_identificacion_id.$touch"
            >
              <option :value="null">
                {{
                  loadingIdentify ? "Cargando tipos..." : "Selecciona un tipo"
                }}
              </option>
              <option
                v-for="tipo in listTypeIdentify"
                :key="tipo.id"
                :value="tipo.id"
              >
                {{ tipo.nombre }}
              </option>
            </select>
            <div
              v-if="v$.tipo_identificacion_id.$errors.length"
              class="invalid-feedback d-block"
            >
              {{ v$.tipo_identificacion_id.$errors[0].$message }}
            </div>
          </div>
          <div class="col-12 col-md-6">
            <label
              class="text-label-muted mb-1"
              for="carrier-driver-identification"
            >
              Identificación
            </label>
            <input
              id="carrier-driver-identification"
              type="text"
              class="form-control form-control-sm"
              v-model.trim="form.identificacion"
              :maxlength="identifyMaxAllowed"
              :placeholder="identifyName"
              :inputmode="identifyInputMode"
              autocomplete="off"
              :class="{ 'is-invalid': v$.identificacion.$errors.length }"
              @input="onIdentificationInput"
              @blur="v$.identificacion.$touch"
            />
            <div
              v-if="v$.identificacion.$errors.length"
              class="invalid-feedback d-block"
            >
              {{ v$.identificacion.$errors[0].$message }}
            </div>
            <div v-else-if="selectedTypeIdentify" class="form-text">
              {{ identifyLengthMessage }}
            </div>
          </div>

          <div class="col-12 col-md-8">
            <label class="text-label-muted mb-1" for="carrier-driver-nombre">
              Nombre
            </label>
            <input
              id="carrier-driver-nombre"
              type="text"
              class="form-control form-control-sm"
              v-model.trim="form.nombre"
              autocomplete="off"
              :class="{ 'is-invalid': v$.nombre.$errors.length }"
              @blur="v$.nombre.$touch"
            />
            <div
              v-if="v$.nombre.$errors.length"
              class="invalid-feedback d-block"
            >
              {{ v$.nombre.$errors[0].$message }}
            </div>
          </div>
          <div class="col-12 col-md-4">
            <label class="text-label-muted mb-1" for="carrier-driver-placa">
              Placa
            </label>
            <input
              id="carrier-driver-placa"
              type="text"
              class="form-control form-control-sm"
              v-model.trim="form.placa"
              autocomplete="off"
              :class="{ 'is-invalid': v$.nombre.$errors.length }"
              @blur="v$.placa.$touch"
            />
            <div
              v-if="v$.placa.$errors.length"
              class="invalid-feedback d-block"
            >
              {{ v$.placa.$errors[0].$message }}
            </div>
          </div>

          <!-- Los siguientes campos se incorporarán dentro de esta cuadrícula responsive. -->
        </div>
      </section>
    </div>

    <template #footer="{ close }">
      <div
        class="d-flex flex-column-reverse flex-sm-row justify-content-sm-end gap-2"
      >
        <button
          type="button"
          class="btn btn-sm btn-alt-secondary modal-action"
          @click="close"
        >
          <i class="fa fa-times me-1"></i>
          Cerrar
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.modal-form-section {
  padding: 1rem;
  border: 1px solid var(--bs-border-color);
  border-radius: 0.75rem;
  background: var(--bs-body-bg);
}

.modal-form-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--bs-border-color);
}

.text-label-muted {
  display: block;
  color: var(--bs-secondary-color, #6c757d);
  text-transform: uppercase;
  font-weight: 700;
  font-size: 10px;
  line-height: 1.2;
}

@media (max-width: 575.98px) {
  .modal-form-section {
    padding: 0.875rem;
  }

  .modal-action {
    width: 100%;
  }
}
</style>
