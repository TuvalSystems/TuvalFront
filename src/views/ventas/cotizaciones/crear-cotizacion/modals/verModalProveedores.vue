<script setup>
import { ref, reactive, computed, watch, toRaw } from "vue";
import flatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { useProcessCreateQuote } from "@/composables/venta/cotizaciones/crearCotizacion/useProcessCreateQuote";
import { formatPrice4, format } from "@/functions";
import { swalWarning } from "@/functions/swal-alert";
import { freightUnitPrice } from "@/functions/freightPrice";
import BaseModal from "@/components/BaseModal.vue";
import BaseSearchSelect from "@/components/BaseSearchSelect.vue";

const {
  //proceso de proveedores - modal
  itemsProvider,
  eliminarProveedor,
  margenPorDefecto,
  getMargenFotItemL,
  validateProviderBeforeStore,
} = useProcessCreateQuote();

const baseModal = ref(null);
defineExpose({
  show: () => {
    precioSugeridoProveedor.value = precioBaseProveedor.value;
    baseModal.value?.show();
  },
  hide: () => baseModal.value?.hide(),
});

const emit = defineEmits(["save", "update:providers"]);
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  providers: {
    type: Array,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  listProviders: {
    type: Array,
    required: true,
  },
  loadingListProviders: {
    type: Boolean,
    default: false,
  },
});
const flatPickrState = reactive({
  minDate: Date.now(),
  monthSelectorType: "static",
  locale: Spanish,
});

const listaProviders = computed(() =>
  props.listProviders.map((item) => ({
    value: item.id,
    label: item.razon_social,
  }))
);
const loadingListProviders = computed(() => props.loadingListProviders);
const article = computed(() => props.item);
// El precio sugerido se guarda como base: ART_VALOR ya puede incluir flete.
const precioBaseProveedor = computed(() =>
  article.value.precio_sin_flete
    ?? ((Number(article.value.ART_VALOR) || 0) - (freightUnitPrice(article.value) ?? 0))
);
const precioSugeridoProveedor = ref(precioBaseProveedor.value);
watch(
  () => props.providers,
  (newVal) => {
    if (newVal && newVal.length > 0) {
      const rawData = toRaw(newVal);
      itemsProvider.value = structuredClone(rawData).map((provider) => ({
        ...provider,
        proveedor_entrega: provider.proveedor_entrega == null
          ? true
          : [true, 1, "1"].includes(provider.proveedor_entrega),
      }));
    } else {
      itemsProvider.value = [];
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => article.value.ART_CODIGO,
  async (newVal) => {
    if (newVal) {
      await getMargenFotItemL(newVal);
    }
  },
  { immediate: true, deep: true }
);

watch(
  precioBaseProveedor,
  (newVal) => {
    precioSugeridoProveedor.value = newVal;
  },
  { immediate: true }
);

const addProvider = async () => {
  const newProveedor = {
    ID_PROVEEDOR: null,
    DESCRIPCION_ARTICULO: article.value.ART_DESCRIPCION,
    FECHA_ENTREGA: "",
    CANTIDAD: 0,
    COSTO_UNITARIO: "",
    IMPUESTO: "",
    TOTAL: "",
    TOTALCONIMPUESTO: "",
    NOTA: "",
    MARGEN: margenPorDefecto.value,
    proveedor_entrega: itemsProvider.value[0]?.proveedor_entrega ?? true,
  };
  itemsProvider.value.push(newProveedor);
};
const isValidAmout = (value) => Number(value) >= 0;

function actualizarProveedorEntrega(entrega) {
  itemsProvider.value.forEach((provider) => {
    provider.proveedor_entrega = entrega;
  });
}

function calculaTotalProveedor(index) {
  const row = itemsProvider.value[index];

  const costo = Number.parseFloat(row.COSTO_UNITARIO) || 0;
  if (Number.isNaN(costo) || !isValidAmout(costo)) {
    swalWarning("El costo unitario debe ser un número válido");
    row.COSTO_UNITARIO = 0;
    return;
  }
  const cantidad = Number.parseFloat(row.CANTIDAD) || 0;
  if (!isValidAmout(cantidad)) {
    row.CANTIDAD = 0;
    return;
  }
  const margen = Number.parseFloat(row.MARGEN) || 0;

  const impuestoPorcentaje = Number.parseFloat(article.value.ART_IMP_VTA) || 0;
  const descuentoItem = Number.parseFloat(article.value.descuento) || 0;

  const totalNeto = costo * cantidad;

  const iva = totalNeto * (impuestoPorcentaje / 100);
  const totalFinal = totalNeto + iva;

  row.TOTALCONIMPUESTO = totalFinal;
  row.IMPUESTO = iva;
  row.TOTAL = totalNeto; //por ahora solo visualizamos el total neto

  const denominadorMargen = 1 - margen / 100;
  const denominadorDescuento = 1 - descuentoItem / 100;

  if (denominadorMargen > 0 && denominadorDescuento > 0 && costo > 0) {
    const precioSugerido = costo / denominadorMargen / denominadorDescuento;

    precioSugeridoProveedor.value = precioSugerido.toFixed(4);
  }
}

function guardarProveedor() {
  const entrega = itemsProvider.value[0]?.proveedor_entrega;
  if (itemsProvider.value.some((provider) => provider.proveedor_entrega !== entrega)) {
    swalWarning("Todos los proveedores deben tener el mismo valor en Proveedor entrega. Marque o desmarque uno para aplicarlo a todos.");
    return;
  }
  if (!validateProviderBeforeStore()) {
    return;
  }
  emit("update:providers", {
    index: props.index,
    providers: itemsProvider.value,
    nuevoPrecio: precioSugeridoProveedor.value,
  });
}

const totalAsignado = computed(() => {
  return itemsProvider.value.reduce(
    (total, p) => total + (Number(p.TOTAL) || 0),
    0
  );
});
</script>

<template>
  <BaseModal
    id="modal-block-proveedor"
    ref="baseModal"
    title="Gestión de Proveedores"
    size="xl"
    backdrop="static"
    :keyboard="false"
    class="providers-modal"
    body-class="p-0 d-flex flex-column flex-grow-1 overflow-hidden"
    footer-class="d-flex justify-content-between align-items-center"
  >
    <template #title>
      <div class="d-flex align-items-center py-1">
        <div class="me-2">
          <div
            class="d-flex align-items-center justify-content-center bg-primary-light text-primary rounded-circle"
            style="width: 40px; height: 40px"
          >
            <i class="fa fa-cubes"></i>
          </div>
        </div>
        <div>
          <h6 class="mb-0 fw-bold">Gestión de Proveedores</h6>
          <div class="fs-xs text-muted">
            Item:
            <span class="fw-semibold text-dark">{{
              article.ART_DESCRIPCION
            }}</span>
            <span class="mx-1">|</span>
            Ref:
            <span class="text-success">$ {{ precioSugeridoProveedor }}</span>
          </div>
        </div>
      </div>
    </template>
    <template #header-actions>
      <div
        class="d-flex align-items-center px-3 py-1 bg-body-light rounded border"
      >
        <span class="fs-xs fw-bold text-muted me-2">REQUERIDO:</span>
        <span class="fs-6 fw-bold text-dark">{{
          article.ART_CANTIDAD || 0
        }}</span>
        <span class="fs-xs text-muted ms-1">{{
          article.ART_PLAN_UMEDIDA
        }}</span>
      </div>
    </template>

    <div
      class="block-content block-content-full p-0 d-flex flex-column flex-grow-1 overflow-hidden"
    >
      <div
        class="table-responsive providers-scroll"
      >
        <table
          class="table table-vcenter mb-0 fs-sm providers-table"
        >
          <thead
            class="bg-body-light text-uppercase fs-xs sticky-top"
            style="z-index: 10"
          >
            <tr>
              <th style="width: 30%" class="fw-bold text-muted ps-3">
                Proveedor
              </th>
              <th style="width: 120px" class="fw-bold text-muted text-center">
                Fecha de entrega
              </th>
              <th style="width: 80px" class="fw-bold text-muted text-center">
                Cant.
              </th>
              <th style="width: 120px" class="fw-bold text-muted text-end">
                Costo U.
              </th>
              <th style="width: 100px" class="fw-bold text-muted text-end">
                Margen
              </th>
              <th style="width: 100px" class="fw-bold text-muted text-end">
                IVA
              </th>
              <th style="width: 120px" class="fw-bold text-muted text-end pe-3">
                Total
              </th>
              <th style="width: 40px"></th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(prov, index) in itemsProvider" :key="index">
            <tr class="provider-main-row">
              <td class="ps-3 align-top py-3">
                <div class="mb-0">
                  <BaseSearchSelect
                    class="provider-select"
                    v-model="prov.ID_PROVEEDOR"
                    :options="listaProviders"
                    aria-label="Proveedor"
                    :input-id="`select-proveedor-${index}`"
                    :loading="loadingListProviders"
                  />
                </div>
              </td>
              <td class="align-top py-3">
                <flat-pickr
                  class="form-control form-control-sm text-center"
                  v-model="prov.FECHA_ENTREGA"
                  :config="flatPickrState"
                  placeholder="Fecha"
                />
              </td>
              <td class="align-top py-3">
                <input
                  type="number"
                  min="0"
                  class="form-control form-control-sm text-end fw-bold"
                  v-model.number="prov.CANTIDAD"
                  @input="calculaTotalProveedor(index)"
                />
              </td>
              <td class="align-top py-3">
                <div class="input-group input-group-sm">
                  <span
                    class="input-group-text bg-transparent border-0 text-muted px-1"
                    >$</span
                  >
                  <input
                    type="number"
                    class="form-control form-control-sm text-end"
                    v-model="prov.COSTO_UNITARIO"
                    @input="calculaTotalProveedor(index)"
                  />
                </div>
              </td>
              <td class="align-top py-3">
                <div class="input-group input-group-sm">
                  <input
                    type="number"
                    class="form-control form-control-sm text-end"
                    v-model="prov.MARGEN"
                    @input="calculaTotalProveedor(index)"
                  />
                  <span
                    class="input-group-text bg-transparent border-0 text-muted px-1"
                    >%</span
                  >
                </div>
              </td>
              <td class="align-top py-3">
                <div class="input-group input-group-sm">
                  <span
                    class="input-group-text bg-transparent border-0 text-muted px-1"
                    >$</span
                  >
                  <input
                    type="number"
                    class="form-control form-control-sm text-end"
                    v-model="prov.IMPUESTO"
                    @input="calculaTotalProveedor(index)"
                  />
                </div>
              </td>

              <td class="text-end pe-3 align-top py-3">
                <div class="fw-bold text-dark mb-1">
                  ${{ formatPrice4(prov.TOTAL) }}
                </div>
                <span
                  v-if="parseFloat(prov.TOTAL) >= 300"
                  class="badge bg-success-light text-success fs-xs rounded-pill px-2"
                >
                  <i class="fa fa-check me-1"></i> Ok
                </span>
                <span
                  v-else
                  class="badge bg-warning-light text-warning fs-xs rounded-pill px-2"
                  title="El pedido debe superar los $300"
                >
                  <i class="fa fa-exclamation-triangle me-1"></i> Min $300
                </span>
              </td>
              <td class="text-center align-top py-3">
                <button
                  type="button"
                  class="btn btn-sm btn-alt-danger"
                  :aria-label="`Eliminar proveedor ${index + 1}`"
                  title="Eliminar proveedor"
                  @click="eliminarProveedor(index)"
                >
                  <i class="fa fa-trash-can fs-lg"></i>
                </button>
              </td>
            </tr>
            <tr class="provider-details-row">
              <td colspan="8">
                <div class="provider-details">
                  <label class="provider-description">
                    <span class="provider-field-label">Descripción del artículo</span>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Descripción técnica..."
                      v-model="prov.DESCRIPCION_ARTICULO"
                    />
                  </label>
                  <label class="provider-note">
                    <span class="provider-field-label">Nota interna <span class="fw-normal">(opcional)</span></span>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Agregar una observación..."
                      v-model="prov.NOTA"
                    />
                  </label>
                  <label class="form-check form-switch provider-delivery">
                    <input
                      type="checkbox"
                      class="form-check-input"
                      v-model="prov.proveedor_entrega"
                      @change="actualizarProveedorEntrega($event.target.checked)"
                    />
                    <span class="form-check-label">Proveedor entrega</span>
                  </label>
                </div>
              </td>
            </tr>
            </template>
            <tr v-if="itemsProvider.length === 0">
              <td colspan="8" class="text-center py-5">
                <div class="py-4">
                  <i
                    class="fa fa-clipboard-list fa-3x text-muted opacity-25 mb-3"
                  ></i>
                  <p class="fs-sm text-muted mb-3">
                    No hay proveedores asignados a este ítem
                  </p>
                  <button
                    class="btn btn-alt-primary btn-sm px-4"
                    @click="addProvider()"
                  >
                    <i class="fa fa-plus me-1"></i> Asignar Primer Proveedor
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <template #footer>
      <button class="btn btn-sm btn-alt-success" @click="addProvider()">
        <i class="fa fa-plus me-1"></i> Agregar Otro
      </button>

      <div class="d-flex align-items-center gap-3">
        <div class="d-flex align-items-baseline" v-if="totalAsignado > 0">
          <span class="fs-xs text-muted me-2 text-uppercase"
            >Total Asignado:</span
          >
          <span class="fs-sm fw-bold text-dark"
            >${{ format(totalAsignado) }}</span
          >
        </div>
        <button
          type="button"
          class="btn btn-sm btn-primary px-4 shadow-sm"
          @click="guardarProveedor()"
        >
          <i class="fa fa-save me-1"></i> Guardar Cambios
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<style scoped>
.providers-modal :deep(.modal-dialog) {
  max-width: 90vw;
}

.providers-modal :deep(.modal-content) {
  max-height: 90vh;
}

.providers-modal :deep(.modal-content > .block) {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  min-height: 0;
}

.providers-modal :deep(.base-modal-footer) {
  flex-shrink: 0;
}

.providers-modal :deep(.block-options) {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.providers-scroll {
  max-height: 65vh;
  min-height: 240px;
  overflow-y: auto;
}

.providers-table thead th {
  padding-top: 0.875rem;
  padding-bottom: 0.875rem;
  white-space: nowrap;
  font-size: 0.7rem;
  letter-spacing: 0.03em;
}

.provider-main-row > td {
  border-bottom: 0;
  padding-bottom: 0.5rem !important;
}

.provider-details-row > td {
  padding: 0 1rem 1rem;
  border-bottom: 1px solid var(--bs-border-color);
}

.provider-details-row + .provider-main-row > td {
  padding-top: 1.25rem !important;
}

.provider-details {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 0.375rem;
  background: var(--bs-body-bg);
}

.provider-description { flex: 1.3; min-width: 0; }
.provider-note { flex: 1; min-width: 0; }
.provider-field-label {
  display: block;
  margin-bottom: 0.375rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--bs-secondary-color, #6c757d);
}
.provider-delivery {
  flex-shrink: 0;
  margin-bottom: 0.375rem;
  white-space: nowrap;
}
.providers-table input {
  font-variant-numeric: tabular-nums;
}

.providers-table {
  table-layout: fixed;
  width: 100%;
  min-width: 1030px;
}

.provider-select {
  width: 100%;
  min-width: 0;
  max-width: 100%;
}

.provider-select :deep(.vs__selected-options) {
  flex-wrap: nowrap;
}

.provider-select :deep(.vs__selected) {
  min-width: 0;
  flex-shrink: 1;
}

.provider-select :deep(.vs__search) {
  min-width: 0;
  width: 0;
}

/* CSS para ocultar los spinners de los inputs numéricos */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}

/* Cabecera pegajosa (Sticky Header) */
.sticky-top {
  position: sticky;
  top: 0;
  background-color: #f9fafc;
  /* Coincide con bg-body-light */
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  /* Sombra sutil al hacer scroll */
}
</style>
