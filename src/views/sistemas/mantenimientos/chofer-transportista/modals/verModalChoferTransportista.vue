<script setup>
import { computed, onMounted, ref } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { useTypeIdentifyStore } from "@/stores/catalogos/useTypeIdentifyStore";
import { useCarrierDriverActions } from "@/composables/sistemas/mantenimientos/chofer-transportista/useCarrierDriverActions";
import { swalError, swalSuccess, swalWarning } from "@/functions/swal-alert";
const props = defineProps({
  carrierDriver: {
    type: Object,
    default: null,
  },
  typeModal: {
    type: String,
    required: true,
    validator: (value) => ["create", "edit"].includes(value),
  },
  loadingPointSales: {
    type: Boolean,
    default: false,
  },
  pointSales: { type: Array, default: () => [] },
});

// Tipo de identificaciones
const typeIdentifyStore = useTypeIdentifyStore();
const listTypeIdentify = computed(() => typeIdentifyStore.list);
const loadingIdentify = computed(() => typeIdentifyStore.loading);
const typeOpenModal = computed(() => props.typeModal);
const pointSalesOptions = computed(() => props.pointSales);
const loadingPointSales = computed(() => props.loadingPointSales);
const {
  form,
  v$,
  resetForm,
  selectedTypeIdentify,
  identifyName,
  identifyMaxAllowed,
  identifyLengthMessage,
  identifyInputMode,
  onIdentificationInput,
  onIdentificationTypeChange,
  loadingSaved,
  savedCarrierDriver,

  loadingUpdated,
  updatedCarrierDriver,

  //validar identificacion
  loadingValidateIdentity,
  validateIdentity,

  //lista de proveedoress transportistas
  loadingProviderCarrier,
  providersCarriers,
  fetchListProvidersCarrier,

  loadingDetail,
  getDetailCarrierDriver,
} = useCarrierDriverActions(listTypeIdentify);

const emit = defineEmits(["saved", "hidden"]);
const baseModal = ref(null);

const title = computed(() =>
  typeOpenModal.value === "edit"
    ? "Editar chofer transportista"
    : "Nuevo chofer transportista"
);

const textButton = computed(() =>
  typeOpenModal.value === "edit" ? "Actualizar" : "Guardar"
);

const loadingHandleUpdateCreate = computed(
  () =>
    loadingSaved.value || loadingUpdated.value || loadingValidateIdentity.value
);

async function show() {
  if (loadingHandleUpdateCreate.value || loadingDetail.value) return false;

  resetForm();

  if (typeOpenModal.value === "edit") {
    const resp = await getDetailCarrierDriver(props.carrierDriver?.id);
    if (!resp?.ok) {
      const msg =
        resp?.message ||
        "No se pudo obtener el detalle del chofer transportista.";
      (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
      return false;
    }

    const detail = Array.isArray(resp.data) ? resp.data[0] : resp.data;
    if (!detail || typeof detail !== "object") {
      swalWarning("No se encontró el detalle del chofer transportista.");
      return false;
    }

    resetForm({ ...detail, id: detail.id ?? props.carrierDriver?.id });
  }

  baseModal.value?.show();
  return true;
}

function hide() {
  baseModal.value?.hide();
}

defineExpose({ show, hide });

function handleHidden() {
  resetForm();
  emit("hidden");
}

async function handleSaveUpdate() {
  if (loadingHandleUpdateCreate.value) return;

  const valid = await v$.value.$validate();
  if (!valid) return;

  const validIdentity = await validateDocumentIdentity();
  if (!validIdentity) return;

  const resp =
    typeOpenModal.value === "edit"
      ? await updatedCarrierDriver()
      : await savedCarrierDriver();

  if (!resp?.ok) {
    const msg = resp?.message || "No se pudo guardar el chofer transportista.";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    return;
  }

  swalSuccess(resp?.message);
  emit("saved");
  hide();
}
async function validateDocumentIdentity() {
  if (loadingValidateIdentity.value) return false;

  const validIdentity = await v$.value.identificacion.$validate();
  if (!validIdentity) return false;

  const resp = await validateIdentity();
  if (!resp?.ok) {
    const msg =
      resp?.message ||
      "El documento ya se encuentra almacenado con anterioridad.";
    await swalWarning(msg);
    return false;
  }

  return true;
}

onMounted(async () => {
  typeIdentifyStore.fetchAll();
  await fetchListProvidersCarrier();
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
    :busy="loadingHandleUpdateCreate"
    @hidden="handleHidden"
  >
    <div class="p-3 p-md-4">
      <section class="modal-form-section">
        <div class="modal-form-section-header">
          <div>
            <h5 class="mb-1">Datos de identificación</h5>
          </div>
          <span
            class="badge rounded-pill flex-shrink-0"
            :class="
              typeOpenModal === 'edit'
                ? 'bg-info-light text-info'
                : 'bg-success-light text-success'
            "
          >
            {{ typeOpenModal === "edit" ? "Edición" : "Nuevo registro" }}
          </span>
        </div>

        <div class="row g-3">
          <div class="col-12 col-md-6">
            <label class="text-label-muted mb-1" for="carrier-driver-provider">
              Seleccione el Proveedor *
            </label>
            <select
              id="carrier-driver-provider"
              v-model="form.proveedor_id"
              class="form-select form-select-sm"
              :disabled="loadingProviderCarrier"
              :class="{ 'is-invalid': v$.proveedor_id.$error }"
              @blur="v$.proveedor_id.$touch"
            >
              <option :value="null">
                {{
                  loadingProviderCarrier
                    ? "Cargando proveedores..."
                    : "Selecciona un proveedor"
                }}
              </option>
              <option
                v-for="prov in providersCarriers"
                :key="prov.id"
                :value="prov.id"
              >
                {{ prov.razon_social }}
              </option>
            </select>
            <div v-if="v$.proveedor_id.$error" class="invalid-feedback d-block">
              {{ v$.proveedor_id.$errors[0]?.$message }}
            </div>
          </div>
          <div class="col-12 col-md-6">
            <label
              class="text-label-muted mb-1"
              for="carrier-driver-identification-type"
            >
              Tipo de identificación *
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
              @change="onIdentificationTypeChange"
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
              Identificación *
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
              :disabled="loadingValidateIdentity"
              @change="validateDocumentIdentity"
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
          <div class="col-12 col-md-6">
            <label class="text-label-muted mb-1" for="carrier-driver-placa">
              Placa
            </label>
            <input
              id="carrier-driver-placa"
              type="text"
              class="form-control form-control-sm"
              v-model.trim="form.placa"
              autocomplete="off"
              :class="{ 'is-invalid': v$.placa.$errors.length }"
              @input="form.placa = $event.target.value.toUpperCase()"
              @blur="v$.placa.$touch"
            />
            <div
              v-if="v$.placa.$errors.length"
              class="invalid-feedback d-block"
            >
              {{ v$.placa.$errors[0].$message }}
            </div>
          </div>
          <div class="col-12 col-md-12">
            <label class="text-label-muted mb-1" for="carrier-driver-nombre">
              Nombre *
            </label>
            <input
              id="carrier-driver-nombre"
              type="text"
              class="form-control form-control-sm"
              v-model.trim="form.nombre"
              autocomplete="off"
              :class="{ 'is-invalid': v$.nombre.$errors.length }"
              @input="form.nombre = $event.target.value.toUpperCase()"
              @blur="v$.nombre.$touch"
            />
            <div
              v-if="v$.nombre.$errors.length"
              class="invalid-feedback d-block"
            >
              {{ v$.nombre.$errors[0].$message }}
            </div>
          </div>

          <div class="col-12 col-md-12">
            <label
              class="text-label-muted mb-1"
              for="carrier-driver-point-sales"
            >
              Puntos de Venta
            </label>
            <select
              class="form form-select form-select-sm"
              id="dispatch-type-puntos-venta"
              v-model="form.punto_venta_ids"
              multiple
              size="5"
              :disabled="loadingPointSales"
            >
              <option
                v-for="point in pointSalesOptions"
                :key="point.id"
                :value="point.id"
              >
                {{ point.codigo }} - {{ point.descripcion }}
              </option>
            </select>
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
          :disabled="loadingHandleUpdateCreate"
          @click="close"
        >
          <i class="fa fa-times me-1"></i>
          Cerrar
        </button>
        <button
          type="button"
          class="btn btn-sm btn-primary"
          :disabled="loadingHandleUpdateCreate"
          @click="handleSaveUpdate"
        >
          <i
            v-if="loadingHandleUpdateCreate"
            class="fa fa-spinner fa-spin me-1"
          ></i>
          {{ textButton }}
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
  /* background: var(--bs-body-bg); */
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
