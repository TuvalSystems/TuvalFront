
<script setup>
import { onMounted, computed } from "vue";

//store
import { useTypeIdentifyStore } from "@/stores/catalogos/useTypeIdentifyStore";

//composables
import { useCustomerCreate } from "@/composables/venta/cliente/useCustomerCreate";
import { useGetSegmentClients } from "@/composables/venta/cliente/useGetSegmentClients";
import { useAdminLocation } from "@/composables/sistemas/useAdminLocation";
import { swalError, swalWarning } from "@/functions/swal-alert";

const typeIdentifyStore = useTypeIdentifyStore();
const listTypeIdentify = computed(() => typeIdentifyStore.list);
const loadingIdentify = computed(() => typeIdentifyStore.loading);
const {
  form,
  resetForm,
  v$,

  //validacion ruc
  identifyName,
  selectedTypeIdentify,
  identifyMaxAllowed,
  identifyLengthMessage,
  identifyInputMode,
  onIdentificationInput,
  onIdentificationTypeChange,
  identifyCurrentLength,
  identifyCounterClass,

  //nombre corto
  shortNameMaxAllowed,
  shortNameCurrentLength,
  shortNameCounterClass,

  //direcciones
  MAX_ADDRESSES,
  addAddress,
  removeAddress,
  sanitizeAddressText,

  //validacion de existencia de ruc
  loadingValidateIdentification,
  validateIdentification,
  //validacion de existencia de ruc prospecto
  loadingValidateProspectIdentification,
  validateProspectIdentification,

  //lista de grupos
  loadingGroups,
  fetchGroups,
  groups,

  //creacion de cliente
  loadingSaveCustomer,
  saveCustomer,
} = useCustomerCreate(listTypeIdentify);
const {
  segmentos,
  subsegmentos,
  loadingSegmentos,
  loadingSubSegmentos,
  fetchSegmentos,
  fetchSubSegmentos,
} = useGetSegmentClients();
const {
  //regiones
  loadingRegions,
  fetchRegions,
  regions,
  //provincias
  loadingProvinces,
  fetchProvinces,
  //cantones
  fetchCantons,
  loadingCantons,
} = useAdminLocation();

const loadingChangeValidation = computed(
  () =>
    loadingValidateIdentification.value ||
    loadingValidateProspectIdentification.value
);

const loadingCustomerProcess = computed(
  () => loadingChangeValidation.value || loadingSaveCustomer.value
);

const addressListError = computed(
  () =>
    v$.value.direcciones.$errors.find(
      (error) => error.$validator !== "$each"
    )?.$message ?? ""
);

async function validateDocumentIdentity() {
  if (loadingChangeValidation.value) return false;

  const validIdentity = await v$.value.identificacion.$validate();
  if (!validIdentity) return false;

  const response = await validateIdentification(form.identificacion);
  if (!response?.ok) {
    const message =
      response?.message || "No se pudo validar la existencia del documento.";
    (response?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
    return false;
  }
  return true;
}

async function validateProspectDocumentIdentity() {
  if (loadingChangeValidation.value) return false;

  const validIdentity = await v$.value.identificacion.$validate();
  if (!validIdentity) return false;

  const response = await validateProspectIdentification(form.identificacion);
  if (!response?.ok) {
    const message =
      response?.message || "No se pudo validar la existencia del documento.";
    (response?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
    return false;
  }
  return true;
}

async function handleSaveCustomer() {
  if (loadingCustomerProcess.value) return;

  const validForm = await v$.value.$validate();
  if (!validForm) {
    swalWarning("Revise los campos obligatorios o inválidos.");
    return;
  }

  const validIdentification = await validateDocumentIdentity();
  if (!validIdentification) return;

  const validProspectIdentification = await validateProspectDocumentIdentity();
  if (!validProspectIdentification) return;

  const response = await saveCustomer();
  if (!response?.ok && !response?.busy) {
    swalWarning(response?.message || "No se pudo procesar el cliente.");
  }
}

function getAddressErrors(index, field) {
  if (!v$.value.direcciones.$dirty) return [];

  return (
    v$.value.direcciones.$each.$response?.$errors?.[index]?.[field] ?? []
  );
}

async function handleAddressRegionChange(address) {
  address.provincia_id = null;
  address.canton_id = null;
  address.provinces = [];
  address.cantons = [];

  if (address.region_id == null) return;

  const response = await fetchProvinces(address.region_id);
  address.provinces = response?.ok && Array.isArray(response.data)
    ? response.data
    : [];
}

async function handleAddressProvinceChange(address) {
  address.canton_id = null;
  address.cantons = [];

  if (address.provincia_id == null) return;

  const response = await fetchCantons(address.provincia_id);
  address.cantons = response?.ok && Array.isArray(response.data)
    ? response.data
    : [];
}

async function getFetchsPromises() {
  await Promise.allSettled([fetchGroups(), fetchSegmentos(), fetchRegions()]);
}

onMounted(async () => {
  typeIdentifyStore.fetchAll();
  getFetchsPromises();
});
</script>

<template>
  <BasePageHeading title="Crear cliente">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt mb-0">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Ventas</a>
          </li>
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Clientes</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Nuevo</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>

  <div class="content">
    <form class="client-form" @submit.prevent="handleSaveCustomer">
      <BaseBlock class="client-form__block" content-full>
        <div class="client-form__section">
          <div class="client-form__section-heading">
            <span class="client-form__section-icon"
              ><i class="fa fa-id-card"></i
            ></span>
            <h3 class="text-uppercase">Identificación</h3>
          </div>

          <div class="row g-3">
            <div class="col-lg-4">
              <label class="text-label-muted mb-1" for="select-CLI_TIPO_ID"
                >Tipo de identificación
                <span class="text-danger">*</span></label
              >
              <select
                id="select-CLI_TIPO_ID"
                class="form-select form-select-sm"
                v-model="form.tipo_identificacion_id"
                :disabled="loadingIdentify"
                :class="{
                  'is-invalid': v$.tipo_identificacion_id.$errors.length,
                }"
                @blur="v$.tipo_identificacion_id.$touch"
                @change="onIdentificationTypeChange"
              >
                <option :value="null" disabled>
                  {{
                    loadingIdentify ? "Cargando tipos..." : "Selecciona un tipo"
                  }}
                </option>
                <option
                  v-for="(tipo, index) in listTypeIdentify"
                  :key="index"
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
            <div class="col-lg-4">
              <label class="text-label-muted mb-1" for="input-CLI_RUC"
                >Identificación <span class="text-danger">*</span></label
              >
              <div class="input-group input-group-sm">
                <span class="input-group-text"
                  ><i class="fa fa-fingerprint"></i
                ></span>
                <input
                  id="input-CLI_RUC"
                  class="form-control form-control-sm"
                  type="text"
                  autocomplete="off"
                  v-model.trim="form.identificacion"
                  :maxlength="identifyMaxAllowed"
                  :placeholder="identifyName"
                  :inputmode="identifyInputMode"
                  :class="{ 'is-invalid': v$.identificacion.$errors.length }"
                  @input="onIdentificationInput"
                  @blur="v$.identificacion.$touch"
                  @change="validateDocumentIdentity"
                />
                <span
                  class="input-group-text fw-semibold"
                  :class="identifyCounterClass"
                  style="justify-content: center"
                >
                  {{ identifyCurrentLength }}/{{ identifyMaxAllowed }}
                </span>
                <div
                  v-if="v$.identificacion.$errors.length"
                  class="invalid-feedback"
                >
                  {{ v$.identificacion.$errors[0].$message }}
                </div>
              </div>

              <div
                v-if="!v$.identificacion.$errors.length && selectedTypeIdentify"
                class="form-text"
              >
                {{ identifyLengthMessage }}
              </div>
            </div>
            <div class="col-lg-4">
              <label class="text-label-muted mb-1" for="input-CLI_RAZON_SOCIAL"
                >Razón social <span class="text-danger">*</span></label
              >
              <input
                id="input-CLI_RAZON_SOCIAL"
                class="form-control form-control-sm"
                type="text"
                placeholder="Apellidos y nombres o razón social"
                maxlength="65"
                v-model="form.razon_social"
                :class="{ 'is-invalid': v$.razon_social.$errors.length }"
                @blur="v$.razon_social.$touch"
                @input="form.razon_social = form.razon_social?.toUpperCase()"
              />
              <div
                v-if="v$.razon_social.$errors.length"
                class="invalid-feedback"
              >
                {{ v$.razon_social.$errors[0].$message }}
              </div>
            </div>
            <div class="col-lg-4">
              <label class="text-label-muted mb-1" for="input-CLI_NOMBRE_CORTO"
                >Nombre corto <span class="text-danger">*</span></label
              >
              <div class="input-group input-group-sm">
                <input
                  id="input-CLI_NOMBRE_CORTO"
                  class="form-control form-control-sm"
                  type="text"
                  placeholder="Nombre comercial"
                  :maxlength="shortNameMaxAllowed"
                  v-model="form.nombre_corto"
                  :class="{ 'is-invalid': v$.nombre_corto.$errors.length }"
                  @blur="v$.nombre_corto.$touch"
                  @input="form.nombre_corto = form.nombre_corto?.toUpperCase()"
                />
                <span
                  class="input-group-text fw-semibold"
                  :class="shortNameCounterClass"
                  style="min-width: 58px; justify-content: center"
                >
                  {{ shortNameCurrentLength }}/{{ shortNameMaxAllowed }}
                </span>
                <div
                  v-if="v$.nombre_corto.$errors.length"
                  class="invalid-feedback"
                >
                  {{ v$.nombre_corto.$errors[0].$message }}
                </div>
              </div>
              <div v-if="!v$.nombre_corto.$errors.length" class="form-text">
                Nombre corto máximo 15 caracteres.
              </div>
            </div>
            <div class="col-lg-4">
              <label class="text-label-muted mb-1" for="input-CLI_CONTACTO"
                >Contacto <span class="text-danger">*</span></label
              >
              <input
                id="input-CLI_CONTACTO"
                class="form-control form-control-sm"
                type="text"
                placeholder="Nombre de la persona de contacto"
                maxlength="30"
                :class="{ 'is-invalid': v$.contacto.$errors.length }"
                v-model="form.contacto"
                @blur="v$.contacto.$touch"
                @input="form.contacto = form.contacto?.toUpperCase()"
              />
              <div v-if="v$.contacto.$errors.length" class="invalid-feedback">
                {{ v$.contacto.$errors[0].$message }}
              </div>
            </div>
          </div>
        </div>

        <div class="client-form__section">
          <div class="client-form__section-heading">
            <span class="client-form__section-icon"
              ><i class="fa fa-location-dot"></i
            ></span>
            <h3 class="text-uppercase">Direcciones</h3>
            <div class="d-flex align-items-center gap-2 ms-auto">
              <span class="badge bg-body-secondary text-muted">
                {{ form.direcciones.length }}/{{ MAX_ADDRESSES }}
              </span>
              <button
                type="button"
                class="btn btn-sm btn-alt-primary"
                :disabled="form.direcciones.length >= MAX_ADDRESSES"
                @click="addAddress"
              >
                <i class="fa fa-plus me-1"></i>Agregar
              </button>
            </div>
          </div>

          <div v-if="addressListError" class="alert alert-danger py-2 mb-3">
            {{ addressListError }}
          </div>

          <div class="d-grid gap-3">
            <div
              v-for="(address, index) in form.direcciones"
              :key="index"
              class="client-form__address"
            >
              <div class="d-flex align-items-center justify-content-between mb-3">
                <span class="fw-semibold fs-sm">Dirección {{ index + 1 }}</span>
                <button
                  type="button"
                  class="btn btn-sm btn-alt-danger"
                  :disabled="form.direcciones.length === 1"
                  :aria-label="`Eliminar dirección ${index + 1}`"
                  @click="removeAddress(index)"
                >
                  <i class="fa fa-trash-can"></i>
                </button>
              </div>

              <div class="row g-3">
                <div class="col-md-4">
                  <label class="text-label-muted mb-1" :for="`select-region-${index}`">
                    Región <span class="text-danger">*</span>
                  </label>
                  <select
                    :id="`select-region-${index}`"
                    v-model="address.region_id"
                    class="form-select form-select-sm"
                    :disabled="loadingRegions"
                    :class="{ 'is-invalid': getAddressErrors(index, 'region_id').length }"
                    @change="handleAddressRegionChange(address)"
                  >
                    <option :value="null" disabled>Selecciona una región</option>
                    <option v-for="region in regions" :key="region.id" :value="region.id">
                      {{ region.nombre }}
                    </option>
                  </select>
                  <div v-if="getAddressErrors(index, 'region_id').length" class="invalid-feedback">
                    {{ getAddressErrors(index, "region_id")[0].$message }}
                  </div>
                </div>

                <div class="col-md-4">
                  <label class="text-label-muted mb-1" :for="`select-provincia-${index}`">
                    Provincia <span class="text-danger">*</span>
                  </label>
                  <select
                    :id="`select-provincia-${index}`"
                    v-model="address.provincia_id"
                    class="form-select form-select-sm"
                    :disabled="loadingProvinces || address.region_id == null"
                    :class="{ 'is-invalid': getAddressErrors(index, 'provincia_id').length }"
                    @change="handleAddressProvinceChange(address)"
                  >
                    <option :value="null" disabled>Selecciona una provincia</option>
                    <option
                      v-for="province in address.provinces"
                      :key="province.id"
                      :value="province.id"
                    >
                      {{ province.nombre }}
                    </option>
                  </select>
                  <div v-if="getAddressErrors(index, 'provincia_id').length" class="invalid-feedback">
                    {{ getAddressErrors(index, "provincia_id")[0].$message }}
                  </div>
                </div>

                <div class="col-md-4">
                  <label class="text-label-muted mb-1" :for="`select-canton-${index}`">
                    Ciudad <span class="text-danger">*</span>
                  </label>
                  <select
                    :id="`select-canton-${index}`"
                    v-model="address.canton_id"
                    class="form-select form-select-sm"
                    :disabled="loadingCantons || address.provincia_id == null"
                    :class="{ 'is-invalid': getAddressErrors(index, 'canton_id').length }"
                  >
                    <option :value="null" disabled>Selecciona una ciudad</option>
                    <option v-for="canton in address.cantons" :key="canton.id" :value="canton.id">
                      {{ canton.nombre }}
                    </option>
                  </select>
                  <div v-if="getAddressErrors(index, 'canton_id').length" class="invalid-feedback">
                    {{ getAddressErrors(index, "canton_id")[0].$message }}
                  </div>
                </div>

                <div class="col-12">
                  <label class="text-label-muted mb-1" :for="`input-direccion-${index}`">
                    Dirección <span class="text-danger">*</span>
                  </label>
                  <textarea
                    :id="`input-direccion-${index}`"
                    v-model="address.direccion"
                    class="form-control form-control-sm"
                    placeholder="Calle principal, numeración, intersección y referencia"
                    maxlength="122"
                    rows="2"
                    :class="{ 'is-invalid': getAddressErrors(index, 'direccion').length }"
                    @input="sanitizeAddressText($event, index)"
                  ></textarea>
                  <div v-if="getAddressErrors(index, 'direccion').length" class="invalid-feedback">
                    {{ getAddressErrors(index, "direccion")[0].$message }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="client-form__section">
          <div class="client-form__section-heading">
            <span class="client-form__section-icon"
              ><i class="fa fa-address-book"></i
            ></span>
            <h3 class="text-uppercase">Canales de contacto</h3>
          </div>

          <div class="row g-3">
            <div class="col-md-6 col-xl-3">
              <label class="text-label-muted mb-1" for="input-CLI_TELEFONO_1"
                >Teléfono 1 <span class="text-danger">*</span></label
              >
              <div class="input-group input-group-sm">
                <span class="input-group-text">
                  <i class="fa fa-phone"></i>
                </span>
                <input
                  id="input-CLI_TELEFONO_1"
                  class="form-control form-control-sm"
                  type="tel"
                  placeholder="Teléfono principal"
                  maxlength="21"
                  v-model="form.telefono1"
                  :class="{ 'is-invalid': v$.telefono1.$errors.length }"
                  @blur="v$.telefono1.$touch"
                />
                <div
                  v-if="v$.telefono1.$errors.length"
                  class="invalid-feedback"
                >
                  {{ v$.telefono1.$errors[0].$message }}
                </div>
              </div>
            </div>
            <div class="col-md-6 col-xl-3">
              <label class="text-label-muted mb-1" for="input-CLI_TELEFONO_2"
                >Teléfono 2</label
              >
              <div class="input-group input-group-sm">
                <span class="input-group-text"><i class="fa fa-phone"></i></span
                ><input
                  id="input-CLI_TELEFONO_2"
                  class="form-control form-control-sm"
                  type="tel"
                  placeholder="Teléfono alterno"
                  maxlength="21"
                  v-model="form.telefono2"
                  :class="{ 'is-invalid': v$.telefono2.$errors.length }"
                  @blur="v$.telefono2.$touch"
                />
                <div
                  v-if="v$.telefono2.$errors.length"
                  class="invalid-feedback"
                >
                  {{ v$.telefono2.$errors[0].$message }}
                </div>
              </div>
            </div>
            <div class="col-md-6 col-xl-3">
              <label class="text-label-muted mb-1" for="input-CLI_TELEFONO_3"
                >Teléfono 3</label
              >
              <div class="input-group input-group-sm">
                <span class="input-group-text"><i class="fa fa-phone"></i></span
                ><input
                  id="input-CLI_TELEFONO_3"
                  class="form-control form-control-sm"
                  type="tel"
                  placeholder="Teléfono alterno"
                  maxlength="21"
                  v-model="form.telefono3"
                  :class="{ 'is-invalid': v$.telefono3.$errors.length }"
                  @blur="v$.telefono3.$touch"
                />
                <div
                  v-if="v$.telefono3.$errors.length"
                  class="invalid-feedback"
                >
                  {{ v$.telefono3.$errors[0].$message }}
                </div>
              </div>
            </div>
            <div class="col-md-6 col-xl-3">
              <label class="text-label-muted mb-1" for="input-CLI_TELEFONO_4"
                >Teléfono 4</label
              >
              <div class="input-group input-group-sm">
                <span class="input-group-text"><i class="fa fa-phone"></i></span
                ><input
                  id="input-CLI_TELEFONO_4"
                  class="form-control form-control-sm"
                  type="tel"
                  placeholder="Teléfono alterno"
                  maxlength="21"
                  v-model="form.telefono4"
                  :class="{ 'is-invalid': v$.telefono4.$errors.length }"
                  @blur="v$.telefono4.$touch"
                />
                <div
                  v-if="v$.telefono4.$errors.length"
                  class="invalid-feedback"
                >
                  {{ v$.telefono4.$errors[0].$message }}
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <label
                class="text-label-muted mb-1"
                for="input-CLI_CORREO_ELECT_SRI"
                >Correo electrónico SRI
                <span class="text-danger">*</span></label
              >
              <div class="input-group input-group-sm">
                <span class="input-group-text"
                  ><i class="fa fa-envelope"></i></span
                ><input
                  id="input-CLI_CORREO_ELECT_SRI"
                  class="form-control form-control-sm"
                  type="email"
                  placeholder="facturacion@empresa.com"
                  maxlength="200"
                  v-model="form.correo_sri"
                  :class="{
                    'is-invalid': v$.correo_sri.$errors.length,
                  }"
                  @blur="v$.correo_sri.$touch"
                  @input="form.correo_sri = form.correo_sri?.toUpperCase()"
                />
                <div
                  v-if="v$.correo_sri.$errors.length"
                  class="invalid-feedback"
                >
                  {{ v$.correo_sri.$errors[0].$message }}
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <label
                class="text-label-muted mb-1"
                for="input-CLI_CORREO_ELECT_NOTIFICACION_INTERNA"
                >Correo electrónico de contacto</label
              >
              <div class="input-group input-group-sm">
                <span class="input-group-text"
                  ><i class="fa fa-envelope-open"></i></span
                ><input
                  id="input-CLI_CORREO_ELECT_NOTIFICACION_INTERNA"
                  class="form-control form-control-sm"
                  type="email"
                  placeholder="contacto@empresa.com"
                  maxlength="200"
                  v-model="form.correo_contacto"
                  :class="{ 'is-invalid': v$.correo_contacto.$errors.length }"
                  @blur="v$.correo_contacto.$touch"
                  @input="
                    form.correo_contacto = form.correo_contacto?.toLowerCase()
                  "
                />
                <div
                  v-if="v$.correo_contacto.$errors.length"
                  class="invalid-feedback"
                >
                  {{ v$.correo_contacto.$errors[0].$message }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="client-form__section client-form__section--last">
          <div class="client-form__section-heading">
            <span class="client-form__section-icon"
              ><i class="fa fa-layer-group"></i
            ></span>
            <h3 class="text-uppercase">Clasificación comercial</h3>
          </div>

          <div class="row g-3">
            <div class="col-md-6 col-xl-3">
              <label class="text-label-muted mb-1" for="select-CLI_GRUPO"
                >Grupo</label
              >
              <select
                id="select-CLI_GRUPO"
                class="form-select form-select-sm"
                v-model="form.grupo_id"
                :disabled="loadingGroups"
              >
                <option :value="null" disabled>Selecciona un grupo</option>
                <option
                  v-for="group in groups"
                  :key="group.id"
                  :value="group.id"
                >
                  {{ group.GRUPO_CODIGO }}
                </option>
              </select>
            </div>

            <div class="col-md-6 col-xl-3">
              <label class="text-label-muted mb-1" for="select-CLI_SEGMENTO"
                >Segmento <span class="text-danger">*</span></label
              >
              <select
                id="select-CLI_SEGMENTO"
                class="form-select form-select-sm"
                v-model="form.segmento_id"
                :disabled="loadingSegmentos"
                :class="{ 'is-invalid': v$.segmento_id.$errors.length }"
                @blur="v$.segmento_id.$touch"
                @change="fetchSubSegmentos($event.target.value)"
              >
                <option :value="null" disabled>Selecciona un segmento</option>
                <option
                  v-for="segmento in segmentos"
                  :key="segmento.coAtrPadre"
                  :value="segmento.coAtrPadre"
                >
                  {{ segmento.segmento }}
                </option>
              </select>
              <div
                v-if="v$.segmento_id.$errors.length"
                class="invalid-feedback"
              >
                {{ v$.segmento_id.$errors[0].$message }}
              </div>
            </div>
            <div class="col-md-6 col-xl-3">
              <label class="text-label-muted mb-1" for="select-CLI_SUBSEGMENTO"
                >Subsegmento <span class="text-danger">*</span></label
              >
              <select
                id="select-CLI_SUBSEGMENTO"
                class="form-select form-select-sm"
                v-model="form.subsegmento_id"
                :disabled="loadingSubSegmentos"
                :class="{ 'is-invalid': v$.subsegmento_id.$errors.length }"
                @blur="v$.subsegmento_id.$touch"
              >
                <option :value="null" disabled>
                  Selecciona un subsegmento
                </option>
                <option
                  v-for="subsegmento in subsegmentos"
                  :key="subsegmento.coAtrHijo"
                  :value="subsegmento.coAtrHijo"
                >
                  {{ subsegmento.subsegmento }}
                </option>
              </select>
              <div
                v-if="v$.subsegmento_id.$errors.length"
                class="invalid-feedback"
              >
                {{ v$.subsegmento_id.$errors[0].$message }}
              </div>
            </div>
          </div>
        </div>

        <div class="client-form__footer">
          <div class="d-flex gap-2 ms-auto">
            <button
              type="button"
              class="btn btn-alt-secondary px-4"
              :disabled="loadingCustomerProcess"
              @click="resetForm"
            >
              <i class="fa fa-xmark me-2"></i>Cancelar
            </button>
            <button
              type="submit"
              class="btn btn-success px-4"
              :disabled="loadingCustomerProcess"
            >
              <i
                class="fa me-2"
                :class="
                  loadingCustomerProcess ? 'fa-spinner fa-spin' : 'fa-check'
                "
              ></i>
              {{ loadingCustomerProcess ? "Validando..." : "Guardar cliente" }}
            </button>
          </div>
        </div>
      </BaseBlock>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.client-form {
  --client-soft-bg: rgba(var(--bs-primary-rgb), 0.08);
  --client-soft-border: rgba(var(--bs-primary-rgb), 0.18);

  &__block {
    overflow: hidden;
    border-radius: 0.5rem;
  }
  &__section-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    color: var(--bs-primary);
    border: 1px solid var(--client-soft-border);
    background-color: var(--client-soft-bg);
  }
  &__section {
    padding: 1.1rem 0;
    border-bottom: 1px solid var(--bs-border-color);
  }
  &__section:first-child {
    padding-top: 0;
  }
  &__section--last {
    border-bottom: 0;
  }
  &__section-heading {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    margin-bottom: 0.875rem;
    h3 {
      margin: 0;
      font-size: 0.9375rem;
      font-weight: 700;
    }
  }
  &__section-icon {
    width: 2rem;
    height: 2rem;
    border-radius: 0.5rem;
  }
  &__textarea {
    min-height: 4.75rem;
    resize: vertical;
  }
  &__address {
    padding: 1rem;
    border: 1px solid var(--bs-border-color);
    border-radius: 0.5rem;
    background-color: var(--bs-body-bg);
  }
  &__footer {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 1.5rem;
    margin: 0 -1.5rem -1.5rem;
    border-top: 1px solid var(--bs-border-color);
    background-color: var(--bs-tertiary-bg);
  }
}

@media (max-width: 767.98px) {
  .client-form {
    &__section {
      padding: 1rem 0;
    }
    &__footer {
      padding: 1rem;
      margin: 0 -1rem -1rem;
      .btn {
        flex: 1 1 auto;
      }
    }
  }
}

.text-label-muted {
  display: block;
  color: var(--bs-secondary-color, #6c757d);
  text-transform: uppercase;
  font-weight: 700;
  font-size: 10px;
  line-height: 1.2;
}
</style>
