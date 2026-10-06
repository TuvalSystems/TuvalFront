<script setup>
import { onMounted, computed, watch, nextTick, ref } from "vue";
import BaseModal from "@/components/BaseModal.vue";

// composables
import { useAdminLocation } from "@/composables/sistemas/useAdminLocation";
import { useDireccionProcess } from "@/composables/venta/cotizaciones/crearCotizacion/useDireccionProcess";
import { swalError, swalSuccess, swalWarning } from "@/functions/swal-alert";

import useVuelidate from "@vuelidate/core";
import { required, maxLength, email, helpers } from "@vuelidate/validators";

/** modal  */
const baseModal = ref(null);

/** end modal  */
const emit = defineEmits(["updated", "hidden"]);

const props = defineProps({
  cliente: {
    type: Object,
    default: null,
  },
});

const { loading, form, createNewAddress, resetModalForm } =
  useDireccionProcess();

const {
  //regiones
  loadingRegions,
  fetchRegions,
  regions,
  //provincias
  loadingProvinces,
  fetchProvinces,
  provinces,
  //cantones
  loadingParishes,
  parishes,
  fetchParishes,
} = useAdminLocation();

const infoClient = computed(() => props.cliente);

// funciones del modal
async function show() {
  await nextTick();
  baseModal.value?.show();
}

function hide() {
  baseModal.value?.hide();
}

defineExpose({ show, hide });

/*
 * Reglas de validación adaptadas a la estructura nueva del formulario.
 */
const rules = computed(() => ({
  direccion: {
    required: helpers.withMessage("La dirección es obligatoria.", required),
    maxLength: helpers.withMessage(
      "La dirección no puede superar los 122 caracteres.",
      maxLength(122)
    ),
  },

  contacto: {
    required: helpers.withMessage("El contacto es obligatorio.", required),
    maxLength: helpers.withMessage(
      "El contacto no puede superar los 61 caracteres.",
      maxLength(61)
    ),
  },

  referencia: {
    required: helpers.withMessage("La referencia es obligatoria.", required),
    maxLength: helpers.withMessage(
      "La referencia no puede superar los 100 caracteres.",
      maxLength(100)
    ),
  },

  region_id: {
    required: helpers.withMessage("Debe seleccionar una Región.", required),
  },

  provincia_id: {
    required: helpers.withMessage("Debe seleccionar una provincia.", required),
  },

  canton_id: {
    required: helpers.withMessage("Debe seleccionar una ciudad.", required),
  },
  telefono: {
    required: helpers.withMessage("Debe ingresar el teléfono.", required),
  },
  email: {
    required: helpers.withMessage(
      "El correo electrónico es obligatorio.",
      required
    ),
    email: helpers.withMessage("Ingrese un correo electrónico válido.", email),
    maxLength: helpers.withMessage(
      "El correo no puede superar los 200 caracteres.",
      maxLength(200)
    ),
  },
}));
const v$ = useVuelidate(rules, form);

async function crearDireccion() {
  const isValid = await v$.value.$validate();
  if (!isValid) {
    swalWarning("Revise los campos obligatorios antes de crear la dirección.");
    return;
  }
  const response = await createNewAddress(form.value);
  if (!response?.ok) {
    swalError(response?.message || "No se pudo crear la dirección.");
    return;
  }

  await swalSuccess(response?.message || "Dirección creada correctamente.");
  v$.value.$reset();
  emit("updated");
}

async function resetAddressForm() {
  resetModalForm();
  await nextTick();
  v$.value.$reset();
}

const sanitizeText = (event) => {
  const sanitized = event.target.value.replace(
    /[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s_-]/g,
    ""
  );
  event.target.value = sanitized;
  form.value.direccion = sanitized;
};

watch(
  () => props.cliente,
  async (newValue) => {
    if (!newValue) {
      return;
    }
    form.value.email = newValue.CLI_CORREO_ELECT_SRI || "";
    form.value.cliente_id = newValue.id;
    await nextTick();
    v$.value.$reset();
  },
  { immediate: true }
);

async function handleAddressRegionChange() {
  form.value.provincia_id = null;
  form.value.canton_id = null;

  if (form.value.region_id) {
    await fetchProvinces(form.value.region_id);
  }
}

async function handleAddressProvinceChange() {
  form.value.canton_id = null;

  if (form.value.provincia_id) {
    await fetchParishes(form.value.provincia_id);
  }
}

function handleHidden() {
  resetAddressForm();
  emit("hidden");
}

onMounted(() => {
  fetchRegions();
});
</script>

<template>
  <BaseModal
    id="modal-nueva-direccion"
    ref="baseModal"
    title="Nueva Dirección"
    size="lg"
    body-class="p-0"
    :busy="loading"
    @hidden="handleHidden"
  >
    <!-- contenido -->
    <div class="block-content fs-sm pb-2 space-y-2">
      <div class="content-fluid">
        <!-- cabecera -->
        <div class="row g-2 mb-2">
          <div class="col-12 col-lg-8">
            <div class="kv">
              <small class="text-muted">Cliente</small>
              <div class="fw-semibold">
                {{ infoClient?.CLI_RAZON_SOCIAL || "-" }}
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-4">
            <div class="kv">
              <small class="text-muted">Cliente</small>
              <div class="fw-semibold">{{ infoClient?.CLI_RUC || "-" }}</div>
            </div>
          </div>
        </div>

        <!-- detalle -->
        <div class="row g-2">
          <div class="col-12 col-lg-12">
            <div class="kv">
              <small class="text-muted">Dirección</small>

              <textarea
                id="input-direccion"
                v-model="form.direccion"
                class="form-control form-control-sm"
                :class="{ 'is-invalid': v$.direccion.$error }"
                rows="3"
                maxlength="122"
                placeholder="Dirección completa..."
                @blur="v$.direccion.$touch()"
                @input="sanitizeText"
              ></textarea>

              <div v-if="v$.direccion.$error" class="invalid-feedback">
                {{ v$.direccion.$errors[0].$message }}
              </div>

              <small class="text-muted text-end mt-1">
                {{ form.direccion?.length ?? 0 }}/122
              </small>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="kv">
              <small class="text-muted">Contacto</small>

              <div class="fw-semibold">
                <input
                  id="input-contacto"
                  v-model="form.contacto"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': v$.contacto.$error }"
                  maxlength="61"
                  placeholder="Contacto..."
                  @blur="v$.contacto.$touch()"
                />

                <div v-if="v$.contacto.$error" class="invalid-feedback">
                  {{ v$.contacto.$errors[0].$message }}
                </div>
              </div>
            </div>
          </div>

          <div class="col-12 col-lg-6">
            <div class="kv">
              <small class="text-muted">Referencia</small>

              <div class="fw-semibold">
                <input
                  id="input-referencia"
                  v-model="form.referencia"
                  type="text"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': v$.referencia.$error }"
                  maxlength="100"
                  placeholder="Referencia..."
                  @blur="v$.referencia.$touch()"
                />

                <div v-if="v$.referencia.$error" class="invalid-feedback">
                  {{ v$.referencia.$errors[0].$message }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="kv">
              <small class="text-muted">Región</small>
              <div class="fw-semibold">
                <select
                  :disabled="loadingRegions"
                  id="select-territorio"
                  v-model="form.region_id"
                  class="form-select form-select-sm"
                  :class="{ 'is-invalid': v$.region_id.$error }"
                  @blur="v$.region_id.$touch()"
                  @change="handleAddressRegionChange"
                >
                  <option :value="null" disabled>Seleccione una región</option>

                  <option
                    v-for="region in regions"
                    :key="region.id"
                    :value="region.id"
                  >
                    {{ region.nombre }}
                  </option>
                </select>

                <div v-if="v$.region_id.$error" class="invalid-feedback">
                  {{ v$.region_id.$errors[0].$message }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="kv">
              <small class="text-muted">Provincia</small>

              <div class="fw-semibold">
                <select
                  :disabled="loadingProvinces"
                  id="select-provincia_id"
                  v-model="form.provincia_id"
                  class="form-select form-select-sm"
                  :class="{ 'is-invalid': v$.provincia_id.$error }"
                  @change="handleAddressProvinceChange()"
                  @blur="v$.provincia_id.$touch()"
                >
                  <option value="" disabled>Seleccione una provincia</option>

                  <option
                    v-for="(province, index) in provinces"
                    :key="index"
                    :value="province.id"
                  >
                    {{ province.nombre }}
                  </option>
                </select>

                <div v-if="v$.provincia_id.$error" class="invalid-feedback">
                  {{ v$.provincia_id.$errors[0].$message }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="kv">
              <small class="text-muted">Ciudad</small>

              <div class="fw-semibold">
                <select
                  :disabled="loadingParishes"
                  id="select-ciudad"
                  v-model="form.canton_id"
                  class="form-select form-select-sm"
                  :class="{ 'is-invalid': v$.canton_id.$error }"
                  @blur="v$.canton_id.$touch()"
                >
                  <option :value="null" disabled>Seleccione una ciudad</option>

                  <option
                    v-for="(city, index) in parishes"
                    :key="index"
                    :value="city.id"
                  >
                    {{ city.nombre }}
                  </option>
                </select>

                <div v-if="v$.canton_id.$error" class="invalid-feedback">
                  {{ v$.canton_id.$errors[0].$message }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-6">
            <div class="kv">
              <small class="text-muted">Telefono</small>
              <div class="fw-semibold">
                <input
                  id="input-telefono"
                  type="text"
                  class="form-control form-control-sm"
                  v-model="form.telefono"
                  :class="{ 'is-invalid': v$.telefono.$error }"
                  maxlength="200"
                  placeholder="Teléfono..."
                  @blur="v$.telefono.$touch()"
                />
                <div v-if="v$.telefono.$error" class="invalid-feedback">
                  {{ v$.telefono.$errors[0].$message }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-12 col-lg-12">
            <div class="kv">
              <small class="text-muted">Correo electrónico</small>
              <div class="fw-semibold">
                <input
                  id="input-email"
                  v-model="form.email"
                  type="email"
                  class="form-control form-control-sm"
                  :class="{ 'is-invalid': v$.email.$error }"
                  maxlength="200"
                  placeholder="Correo electrónico..."
                  @blur="v$.email.$touch()"
                />
                <div v-if="v$.email.$error" class="invalid-feedback">
                  {{ v$.email.$errors[0].$message }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer="{ close }">
      <div class="content text-end mb-2 space-x-2">
        <button
          type="button"
          class="btn btn-sm btn-alt-secondary"
          :disabled="loading"
          @click="close"
        >
          Cerrar
        </button>
        <button
          type="button"
          class="btn btn-sm btn-primary"
          :disabled="loading"
          @click="crearDireccion"
        >
          <span
            v-if="loading"
            class="spinner-border spinner-border-sm me-2"
            aria-hidden="true"
          ></span>
          Crear
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.kv small {
  display: block;
  line-height: 1;
}

.kv .badge2 {
  white-space: normal;
  /* CLAVE: Permite que el texto haga salto de línea */
  text-align: left;
  /* Alinea el texto a la izquierda para leer mejor párrafos */
  display: block;
  /* Hace que ocupe el ancho disponible de la columna */
  line-height: 1.4;
  /* Da un poco de aire entre las líneas de texto */
  font-weight: 12px;
  /* Opcional: quita la negrita si el texto es muy largo */
}

.kv .fw-semibold {
  line-height: 1.2;
}
</style>
