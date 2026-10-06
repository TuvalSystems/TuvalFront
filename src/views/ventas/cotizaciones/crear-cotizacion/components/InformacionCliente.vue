<script setup>
import { computed } from "vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";

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

const emit = defineEmits(["create-address", "update-field"]);
const client = computed(() => props.infoCliente);
const fieldModel = (field) =>
  computed({
    get: () => props.form[field],
    set: (value) => emit("update-field", { field, value }),
  });
const bodegaFacturacion = fieldModel("bodega_facturacion");
const direccionFacturacionId = fieldModel("direccion_facturacion_id");
const tipoEntrega = fieldModel("tipo_entrega");
const direccionEntregaId = fieldModel("direccion_entrega_id");
const fechaEntrega = fieldModel("fecha_entrega");
const proyecto = fieldModel("proyecto");
const formRef = computed(() => props.form);
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

const hasCoordinates = computed(() => checkCoords(props.form.direccion_facturacion_id));
const hasCoordinates2 = computed(() => checkCoords(props.form.direccion_entrega_id));
const hasDispatch = computed(() => {
  const warehouse = props.warehouseByUser.find(
    (w) => w.relacion_bodega.BOD_BODEGA === props.form.bodega_facturacion
  );
  return !!warehouse?.relacion_bodega.PERMITE_DESPACHO;
});
const isWarehouseSelectionDisabled = computed(
  () => props.loadingWarehouseByUser || props.form.origen === "reserva"
);

function getClientStatus(isSuspended) {
  return Number(isSuspended) === 0
    ? { text: "NO", class: "bg-success-light text-success" }
    : { text: "SI", class: "bg-danger-light text-danger" };
}

function openModalCreateAddress() {
  emit("create-address");
}
</script>

<template>
  <BaseBlock
    title="Información del Cliente"
    content-full
    rounded
    class="mb-2"
  >
    <div
      class="content-fluid"
      :class="{ 'opacity-50': loading }"
    >
      <div class="row g-1 mb-2">
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
            <div class="fw-semibold">
              {{ client.CLI_DSTO_COMERCIAL }} %
            </div>
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
            <div class="fw-semibold">
              {{ client.CLI_CONDICION_PAGO }}
            </div>
            <span
              class="badge bg-info"
              v-if="client.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0"
              >{{ client.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} días de
              gracia</span
            >
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
            <div
              class="fw-semibold"
              :class="
                parseFloat(client.cupo_disponible) < 0
                  ? 'text-danger'
                  : ''
              "
            >
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

        <div class="col-12 col-lg-8">
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
        <div class="col-12 col-lg-4">
          <div class="kv space-y-2">
            <small class="label-small">Modalidad de Entrega</small>
            <div class="btn-group btn-group-sm" role="group">
              <input
                type="radio"
                class="btn-check"
                name="tipoEntrega"
                id="retiro"
                value="retiro"
                v-model="tipoEntrega"
                autocomplete="off"
              />
              <label class="btn btn-outline-primary" for="retiro">
                <i class="fa fa-box me-2"></i>Retiro en Bodega
              </label>

              <input
                v-if="hasDispatch"
                type="radio"
                class="btn-check"
                name="tipoEntrega"
                id="despacho"
                value="despacho"
                v-model="tipoEntrega"
                autocomplete="off"
              />
              <label
                v-if="hasDispatch"
                class="btn btn-outline-primary"
                for="despacho"
              >
                <i class="fa fa-truck me-2"></i>Despacho en Ruta
              </label>
            </div>
          </div>
        </div>
        <div v-show="form.tipo_entrega === 'retiro'"></div>
        <div v-show="form.tipo_entrega === 'despacho'" class="row g-1 mb-2">
          <div class="col-12 col-lg-6">
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
          <div class="col-12 col-lg-6">
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
        <div class="col-12 col-lg-8">
          <div class="kv space-y-2">
            <label class="label-small" for="lista-proyectos">
              Tipo de Venta
            </label>
            <select
              id="lista-proyectos"
              v-model="proyecto"
              class="form-select form-select-sm project-select"
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
      </div>
    </div>
  </BaseBlock>
</template>

<style lang="css" scoped>
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

.project-select {
  max-width: 22rem;
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
