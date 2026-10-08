<script setup>
import { computed, onMounted, watch } from "vue";
import BaseSearchSelect from "@/components/BaseSearchSelect.vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { useDispatchTypeActions } from "@/composables/sistemas/mantenimientos/tipo-despachos/useDispatchTypeActions";
import { useCarrierDriverActions } from "@/composables/sistemas/mantenimientos/chofer-transportista/useCarrierDriverActions";

const props = defineProps({
  infoCliente: {
    type: Object,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  infoSegmento: {
    type: [Object, Array],
    default: null,
  },
  warehouseByUser: {
    type: Array,
    default: () => [],
  },
  sucursales: {
    type: Array,
    default: () => [],
  },
  loadingSucursales: {
    type: Boolean,
    default: false,
  },
  loadingWarehouseByUser: {
    type: Boolean,
    default: false,
  },
  loadingProyectSellers: {
    type: Boolean,
    default: false,
  },
  dataProyectSellers: {
    type: Array,
    default: () => [],
  },
});

const {
  // lista de tipo de despachos por repsonsable de pago
  loadingTypeDispatches,
  typeDispatchesResponsible,
  fetchTypeDispatchesResponsible,
} = useDispatchTypeActions();
const {
  //lista de proveedoress transportistas
  loadingProviderCarrier,
  providersCarriers,
  fetchListProvidersCarrier,
} = useCarrierDriverActions({});
const emit = defineEmits(["create-address", "update-field"]);
const client = computed(() => props.infoCliente);
const formRef = computed(() => props.form);

const fieldModel = (field) =>
  computed({
    get: () => props.form[field],
    set: (value) => emit("update-field", { field, value }),
  });
const bodegaFacturacion = fieldModel("bodega_facturacion");
const direccionFacturacionId = fieldModel("direccion_facturacion_id");
const direccionEntregaId = fieldModel("direccion_entrega_id");
const fechaEntrega = fieldModel("fecha_entrega");
const proyecto = fieldModel("proyecto");

const providerOptions = computed(() =>
  providersCarriers.value.map((item) => ({
    value: item.id,
    label: item.razon_social,
  }))
);

const freightPayer = fieldModel("responsable_flete");
const typeDispatchId = fieldModel("tipo_despacho_id");
const dispatchProviderId = fieldModel("proveedor_despacho_id");
const freightAmount = fieldModel("monto_flete");
// Valores provisionales para las modalidades a cargo del cliente.

const flatPickrState = {
  minDate: "today",
  monthSelectorType: "static",
  locale: Spanish,
  dateFormat: "Y-m-d",
};

function checkCoords(idSucursal) {
  if (!idSucursal) return false;
  const sucursal = props.sucursales.find((s) => s.id === idSucursal);
  return !!sucursal?.coordenadas;
}

const hasCoordinates = computed(() =>
  checkCoords(props.form.direccion_facturacion_id)
);
const hasCoordinates2 = computed(() =>
  checkCoords(props.form.direccion_entrega_id)
);

const isWarehouseSelectionDisabled = computed(
  () => props.loadingWarehouseByUser || props.form.origen === "reserva"
);

function getClientStatus(isSuspended) {
  return Number(isSuspended) === 0
    ? { text: "NO", class: "bg-success-light text-success" }
    : { text: "SI", class: "bg-danger-light text-danger" };
}

function getAvailableCreditClass() {
  return parseFloat(client.value.cupo_disponible) < 0 ? "text-danger" : "";
}

function openModalCreateAddress() {
  emit("create-address");
}

/** lista de tipo de despacho por responsable */
watch(
  () => freightPayer.value,
  async (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      typeDispatchId.value = null;
      await handleResponsibleChange(newVal);
    }
  },
  { immediate: true }
);
async function handleResponsibleChange(type) {
  await fetchTypeDispatchesResponsible(type);
}

/** actualizar direccion de entrega a null si cambia  */
watch(
  () => typeDispatchId.value,
  async (newVal, oldVal) => {
    if (newVal && newVal !== oldVal && newVal !== 2) {
      direccionEntregaId.value = direccionFacturacionId.value;
    }
  }
);

watch(
  () => typeDispatchId.value,
  async (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      dispatchProviderId.value = null;
      freightAmount.value = 0;
    }
  }
);

onMounted(async () => {
  await fetchListProvidersCarrier();
});
</script>

<template>
  <BaseBlock title="Información del Cliente" content-full rounded class="mb-2">
    <div class="content-fluid" :class="{ 'opacity-50': loading }">
      <div class="row g-1 mb-1">
        <div class="col-6 col-lg-4">
          <div class="kv">
            <small class="label-small">Ruc</small>
            <div class="fw-semibold text-truncate">
              {{ client.CLI_RUC }}
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-4">
          <div class="kv">
            <small class="label-small">Razón Social</small>
            <div class="fw-semibold text-truncate">
              {{ client.CLI_RAZON_SOCIAL }}
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-4">
          <div class="kv">
            <small class="label-small">Descuento Comercial</small>
            <div class="fw-semibold">{{ client.CLI_DSTO_COMERCIAL }} %</div>
          </div>
        </div>
        <div class="col-6 col-lg-4">
          <div class="kv">
            <small class="label-small">Ciudad</small>
            <div class="fw-semibold">{{ client.CLI_CIUDAD }}</div>
          </div>
        </div>
        <div class="col-6 col-lg-4">
          <div class="kv">
            <small class="label-small">Provincia</small>
            <div class="fw-semibold">
              {{ client.CLI_PROVINCIA }}
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-4">
          <div class="kv">
            <small class="label-small">Condición de Pago</small>
            <div class="d-flex flex-wrap align-items-center gap-2">
              <span class="fw-semibold">
                {{ client.CLI_CONDICION_PAGO }}
              </span>
              <span
                v-if="client.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0"
                class="badge bg-info"
              >
                {{ client.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} días de gracia
              </span>
            </div>
          </div>
        </div>
        <div class="col-6 col-lg-4">
          <div class="kv">
            <small class="label-small">Suspendido</small>
            <span
              class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
              :class="getClientStatus(client.suspendido).class"
            >
              {{ getClientStatus(client.suspendido).text }}
            </span>
          </div>
        </div>
        <div class="col-6 col-lg-4">
          <div class="kv">
            <small class="label-small">Cupo Asignado</small>
            <div class="fw-semibold">${{ client.cupo_asignado }}</div>
          </div>
        </div>
        <div class="col-6 col-lg-4">
          <div class="kv">
            <small class="label-small">Cupo Disponible</small>
            <div class="fw-semibold" :class="getAvailableCreditClass">
              ${{ client.cupo_disponible }}
            </div>
          </div>
        </div>
        <div v-if="infoSegmento" class="col-6 col-lg-4">
          <div class="kv">
            <small class="label-small">Segmento</small>
            <div class="fw-semibold">{{ formRef.segmento.segmento }}</div>
          </div>
        </div>
        <div v-if="infoSegmento" class="col-6 col-lg-4">
          <div class="kv">
            <small class="label-small">Sub segmento</small>
            <div class="fw-semibold">{{ formRef.segmento.subsegmento }}</div>
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <div class="kv space-y-2">
            <small class="label-small">Bodegas</small>
            <select
              class="form-select form-select-sm"
              v-model="bodegaFacturacion"
              :disabled="isWarehouseSelectionDisabled"
            >
              <option
                v-for="(bod, index) in warehouseByUser"
                :key="index"
                :value="bod.relacion_bodega.BOD_BODEGA"
              >
                {{ bod.relacion_bodega.BOD_BODEGA }}
              </option>
            </select>
          </div>
        </div>

        <div class="col-12">
          <div class="kv space-y-2">
            <small class="label-small">Dirección de Facturación</small>
            <div class="input-group input-group-sm">
              <select
                class="form-select"
                v-model="direccionFacturacionId"
                :disabled="loadingSucursales"
              >
                <option
                  v-for="(suc, index) in sucursales"
                  :key="index"
                  :value="suc.id"
                >
                  {{ suc.CLI_SUC_ID_DIRECCION }} -
                  {{ suc.CLI_SUC_DIRECCION }}
                  {{ !suc.emails_validated ? "⚠️ (Correo Inválido)" : "" }}
                </option>
              </select>
              <button
                class="btn btn-outline-secondary"
                type="button"
                :title="
                  hasCoordinates
                    ? 'Ver ubicación en mapa'
                    : 'Dirección sin coordenadas'
                "
                :class="{ 'opacity-50': !hasCoordinates }"
              >
                <img
                  v-if="hasCoordinates"
                  src="/assets/images/earth.png"
                  alt="Tiene coordenadas"
                  class="img-fluid"
                  style="max-width: 18px"
                />
                <img
                  v-else
                  src="/assets/images/earth2.png"
                  alt="No tiene coordenadas"
                  class="img-fluid"
                  style="max-width: 18px"
                />
              </button>
              <button
                class="btn btn-primary"
                type="button"
                @click="openModalCreateAddress"
              >
                <i class="fa fa-plus"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="col-12 commercial-controls">
          <div class="row g-2">
            <div class="col-12 col-lg-4">
              <div class="kv space-y-2">
                <label class="label-small" for="lista-proyectos">
                  Tipo de Venta
                </label>
                <select
                  id="lista-proyectos"
                  v-model="proyecto"
                  class="form-select form-select-sm"
                  :disabled="
                    loadingProyectSellers || dataProyectSellers.length === 0
                  "
                >
                  <option
                    v-for="proyect in dataProyectSellers"
                    :key="proyect.coMotproven"
                    :value="proyect.coMotproven"
                  >
                    {{ proyect.txDeslar }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-12 col-lg-8">
              <div class="kv space-y-2">
                <small class="label-small">Responsable</small>
                <div class="responsible-controls">
                  <div
                    class="btn-group btn-group-sm responsible-options"
                    role="group"
                    aria-label="Responsable"
                  >
                    <input
                      type="radio"
                      class="btn-check"
                      name="responsable"
                      id="responsable-tuval"
                      value="tuval"
                      v-model="freightPayer"
                      autocomplete="off"
                    />
                    <label
                      class="btn btn-outline-primary"
                      for="responsable-tuval"
                    >
                      <i class="fa fa-box me-2"></i>TUVAL
                    </label>

                    <input
                      type="radio"
                      class="btn-check"
                      name="responsable"
                      id="responsable-cliente"
                      value="cliente"
                      v-model="freightPayer"
                      autocomplete="off"
                    />
                    <label
                      class="btn btn-outline-primary"
                      for="responsable-cliente"
                    >
                      <i class="fa fa-truck me-2"></i>CLIENTE
                    </label>
                  </div>
                  <select
                    :disabled="loadingTypeDispatches"
                    v-model="typeDispatchId"
                    class="form-select form-select-sm responsible-select"
                    :aria-label="`Tipo de entrega a cargo de ${
                      freightPayer === 'tuval' ? 'Tuval' : 'Cliente'
                    }`"
                  >
                    <option :value="null" disabled>
                      Seleccione una opción
                    </option>
                    <option
                      v-for="opcion in typeDispatchesResponsible"
                      :key="opcion.id"
                      :value="opcion.id"
                      :disabled="loadingTypeDispatches"
                    >
                      {{ opcion.descripcion }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- para despacho en ruta -->
        <div v-show="typeDispatchId === 2" class="col-12">
          <section class="delivery-section" aria-labelledby="delivery-heading">
            <h3 id="delivery-heading" class="delivery-heading">
              Datos de entrega
            </h3>
            <div class="row g-2">
              <div class="col-12 col-lg-8">
                <div class="kv space-y-2">
                  <small class="label-small">Dirección de Entrega</small>
                  <div class="input-group input-group-sm">
                    <select
                      class="form-select form-select-sm"
                      v-model="direccionEntregaId"
                    >
                      <option
                        v-for="(suc, index) in sucursales"
                        :key="index"
                        :value="suc.id"
                      >
                        {{ suc.CLI_SUC_ID_DIRECCION }} -
                        {{ suc.CLI_SUC_DIRECCION }}
                      </option>
                    </select>
                    <button
                      class="btn btn-outline-secondary btn-sm"
                      type="button"
                      :title="
                        hasCoordinates2
                          ? 'Ver ubicación en mapa'
                          : 'Dirección sin coordenadas'
                      "
                      :class="{ 'opacity-50': !hasCoordinates2 }"
                    >
                      <img
                        v-if="hasCoordinates2"
                        src="/assets/images/earth.png"
                        alt="Tiene coordenadas"
                        class="img-fluid"
                        style="max-width: 18px"
                      />
                      <img
                        v-else
                        src="/assets/images/earth2.png"
                        alt="No tiene coordenadas"
                        class="img-fluid"
                        style="max-width: 18px"
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-4">
                <div class="kv space-y-2">
                  <small class="label-small">Fecha de Entrega</small>
                  <flat-pickr
                    id="fecha_entrega"
                    class="form-control form-control-sm"
                    v-model="fechaEntrega"
                    :config="flatPickrState"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
        <!-- para flete al cobro y proveedores  -->
        <div v-show="[4, 5].includes(Number(typeDispatchId))" class="col-12">
          <section class="delivery-section" aria-labelledby="delivery-heading">
            <h3 id="delivery-heading" class="delivery-heading">
              Flete al Cobro
            </h3>
            <div class="row g-2">
              <div class="col-12 col-lg-8">
                <div class="kv space-y-2">
                  <small class="label-small"> Proveedor</small>
                  <BaseSearchSelect
                    v-model="dispatchProviderId"
                    :options="providerOptions"
                    aria-label="Proveedor"
                    input-id="select-proveedor-responsable-id"
                    :loading="loadingProviderCarrier"
                  />
                </div>
              </div>
              <div class="col-12 col-lg-4">
                <div class="kv space-y-2">
                  <small class="label-small">Valor del flete</small>
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">
                      <i class="fa fa-dollar"></i>
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      v-model="freightAmount"
                      class="form-control form-control-sm text-end"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </BaseBlock>
</template>

<style lang="css" scoped>
.delivery-section {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--tuval-border, #dfe3e8);
  border-radius: 0.375rem;
  background: var(--tuval-surface-muted, #f4f5f7);
}

.delivery-heading {
  margin: 0 0 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
}

.commercial-controls {
  margin-top: 0.75rem;
}

.responsible-controls {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.responsible-select {
  min-width: 0;
}

@media (max-width: 575.98px) {
  .responsible-controls {
    grid-template-columns: minmax(0, 1fr);
  }
}

.responsible-options {
  display: flex;
  width: 100%;
}

.responsible-options .btn {
  flex: 1 1 0;
  padding-inline: 0.75rem;
}

.label-small {
  display: block;
  margin-bottom: 0.18rem;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.625rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.kv > small:not(.label-small) {
  display: block;
  line-height: 1;
}

.kv .badge2 {
  white-space: normal;
  text-align: left;
  display: block;
  line-height: 1.4;
  font-weight: 10px;
}

.kv .fw-semibold {
  line-height: 1.1;
}

.form-control-sm.flatpickr-input {
  height: calc(1.5em + 0.5rem + 2px);
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  font-size: 0.875rem;
}
</style>
