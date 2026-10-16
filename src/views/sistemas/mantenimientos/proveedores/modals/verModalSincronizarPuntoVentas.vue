
<script setup>
import { computed, nextTick, ref, watch } from "vue";
import BaseModal from "@/components/BaseModal.vue";
import { useProviderActions } from "@/composables/sistemas/mantenimientos/proveedores/useProviderActions";
import { swalError, swalSuccess, swalWarning } from "@/functions/swal-alert";
const props = defineProps({
  provider: {
    type: Object,
    default: null,
  },
  loadingPointSales: {
    type: Boolean,
    default: false,
  },
  pointSales: { type: Array, default: () => [] },
});

const {
  //para sincronizar los punto de venta de proveedores
  formProvider,
  loadingSyncProviders,
  syncPointSalesByProvider,
  resetFormProvider,
} = useProviderActions();
const emit = defineEmits(["saved", "hidden"]);
const baseModal = ref(null);
const pointSalesOptions = computed(() => props.pointSales);
const loadingPointSales = computed(() => props.loadingPointSales);

watch(
  () => props.provider,
  () => {
    formProvider.punto_venta_ids = (props.provider?.puntos_venta ?? []).map(
      (point) => point.id
    );
  },
  { immediate: true }
);

async function submitForm() {
  if (loadingSyncProviders.value || loadingPointSales.value || props.provider?.id == null) return;
  const response = await syncPointSalesByProvider(props.provider.id);
  if (response?.ok) {
    await nextTick();
    hide();
    emit("saved");
    swalSuccess(response.message || "Puntos de venta sincronizados correctamente.");
    return;
  }
  if (response?.canceled || response?.handled) return;
  const message = response?.message || "No se pudieron sincronizar los puntos de venta.";
  (response?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
}

async function show() {
  baseModal.value?.show();
}

function hide() {
  baseModal.value?.hide();
}

function handleHidden() {
  resetFormProvider();
  emit("hidden");
}

defineExpose({ show, hide });
</script>

<template>
  <BaseModal
    id="modal-proveedor-puntos-venta"
    ref="baseModal"
    title="Gestionar puntos de venta del proveedor"
    size="lg"
    scrollable
    body-class="p-0"
    :busy="loadingSyncProviders"
    @hidden="handleHidden"
  >
    <form id="provider-point-sales-form" class="p-3 p-md-4" @submit.prevent="submitForm">
      <div class="row g-3">
        <div class="col-md-4">
          <label for="provider-point-sales-ruc" class="form-label">RUC</label>
          <input id="provider-point-sales-ruc" class="form-control form-control-sm" :value="provider?.PROV_RUC ?? ''" readonly />
        </div>
        <div class="col-md-8">
          <label for="provider-point-sales-name" class="form-label">Nombre del proveedor</label>
          <input id="provider-point-sales-name" class="form-control form-control-sm" :value="provider?.PROV_RAZON_SOCIAL ?? ''" readonly />
        </div>
        <div class="col-12">
          <label for="provider-point-sales-select" class="form-label">Puntos de venta</label>
          <div v-if="loadingPointSales" class="text-muted mb-2" role="status">Cargando puntos de venta...</div>
          <select
            id="provider-point-sales-select"
            v-model="formProvider.punto_venta_ids"
            class="form-select form-select-sm"
            multiple
            size="6"
            :disabled="loadingPointSales || loadingSyncProviders"
            aria-describedby="provider-point-sales-help"
          >
            <option v-for="point in pointSalesOptions" :key="point.id" :value="point.id">
              {{ point.codigo }} - {{ point.descripcion }}
            </option>
          
          </select>
          <small id="provider-point-sales-help" class="text-muted">Usa Ctrl o Cmd para seleccionar varios puntos de venta o quitar una selección.</small>
          <p v-if="!loadingPointSales && !pointSalesOptions.length" class="text-muted mt-2 mb-0">No hay puntos de venta disponibles.</p>
        </div>
      </div>
    </form>
    <template #footer>
      <div class="d-flex justify-content-end gap-2">
        <button type="button" class="btn btn-alt-secondary btn-sm" :disabled="loadingSyncProviders" @click="hide">Cancelar</button>
        <button type="submit" form="provider-point-sales-form" class="btn btn-primary btn-sm" :disabled="loadingSyncProviders || loadingPointSales || provider?.id == null">
          <span v-if="loadingSyncProviders" class="spinner-border spinner-border-sm me-1" aria-hidden="true"></span>
          {{ loadingSyncProviders ? "Sincronizando..." : "Guardar cambios" }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<style lang="css" scoped>
</style>
