
<script setup>
import { useInvoiceCollectionActions } from "@/composables/cobranzas/cobros-facturas/useInvoiceCollectionActions";
import { useCloseCashBox } from "@/composables/cobranzas/cierre-caja/useCloseCashBox.js";
import { onMounted, watch } from "vue";
import TarjetaCierreCaja from "./components/TarjetaCierreCaja.vue";
import {
  swalError,
  swalSuccess,
  swalWarning,
  toast,
} from "@/functions/swal-alert.js";
import ResumenCierreCaja from "./components/ResumenCierreCaja.vue";

const {
  //obtener estado de caja
  loadingCashBoxStatus,
  getUserCashBoxStatus,
  dataCashBoxStatus,
} = useInvoiceCollectionActions();

const {
  //cierre de caja
  loadingCloseCashBox,
  closeCashBox,
  cashClosurePayload,
  //asignación de caja id
  setSelectedCashBox,

  //resumen de cierre de caja
  loadingCashClosureSummary,
  fetchCashClosureSummary,
  cashClosureSummary,
  //generacion de pdf
  loadingSummaryPdfDownload,
  downloadCashClosureSummaryPdf,
} = useCloseCashBox();

watch(
  () => dataCashBoxStatus.value,
  (cashBox) => {
    setSelectedCashBox(cashBox);
  },
  { immediate: true }
);
async function confirmCloseCashBox() {
  const result = await toast.fire({
    title: "¿Cerrar caja?",
    text: `Se cerrará la caja ${dataCashBoxStatus.value.cajaCodigo}. Esta acción finalizará las operaciones de la caja actual.`,
    icon: "warning",
    showCancelButton: true,
    cancelButtonText: "Cancelar",
    confirmButtonText: "Sí, cerrar caja",
    reverseButtons: false,
    focusCancel: true,
    customClass: {
      cancelButton: "btn btn-secondary m-1",
      confirmButton: "btn btn-danger m-1",
    },
    buttonsStyling: false,
  });

  if (result.isConfirmed) {
    await responseCloseCashBox();
  }
}

async function responseCloseCashBox() {
  const resp = await closeCashBox();
  if (resp?.ok) {
    swalSuccess(resp?.message);
    await getUserCashBoxStatus();
    return;
  }
  const msg = resp?.message || "No se pudo generar el documento";
  (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}

// watch para la consulta automatica del resumen
watch(
  () => [cashClosurePayload.fecha, dataCashBoxStatus.value?.id],
  async () => {
    if (!dataCashBoxStatus.value?.id || !cashClosurePayload.fecha) return;
    setSelectedCashBox(dataCashBoxStatus.value);
    await fetchCashClosureSummary();
  },
  { immediate: true }
);

async function handleSummaryPdfDownload() {
  const res = await downloadCashClosureSummaryPdf(); 
  if (!res?.ok) {
    const msg = res?.message || "No se pudo generar el documento";
    (res?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    return;
  }
  swalSuccess(res?.message);
}

onMounted(() => {
  getUserCashBoxStatus();
});
</script>

<template>
  <!-- Hero -->
  <BasePageHeading title="Cierre de caja">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Cobranzas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Cierre de caja</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <!-- END Hero -->
  <!-- contenido -->
  <div class="content-full m-2">
    <!-- cabecera de estado de caja -->
    <div v-if="loadingCashBoxStatus" class="text-center py-3">
      <div class="spinner-border text-primary spinner-border-sm">
        <span class="visually-hidden"> Cargando...</span>
      </div>
      <div class="fs-sm text-muted mt-2">Consultando estado de Caja...</div>
    </div>
    <!-- tarjeta de estado de cierre de caja -->
    <TarjetaCierreCaja
      v-else-if="dataCashBoxStatus"
      :cash-box="dataCashBoxStatus"
      :loading="loadingCloseCashBox"
      @close-cash-box="confirmCloseCashBox()"
    />

    <!-- mensaje en caso de que no tenga caja asignada -->
    <div v-else class="cash-box-empty-state" role="alert">
      <div class="cash-box-empty-icon">
        <i class="fa fa-triangle-exclamation"></i>
      </div>
      <div class="cash-box-empty-content">
        <div class="d-flex align-items-center flex-wrap gap-2 mb-1">
          <h2 class="cash-box-empty-title mb-0">Caja no Asignada</h2>
          <span
            class="fs-xs fw-semibold bg-warning-light text-warning px-2 py-1 rounded-pill"
          >
            Acción Requerida
          </span>
        </div>
        <p class="cash-box-empty-message mb-0">
          No hay una caja asociada a su usuario para el punto de venta
          seleccionado. Verifique el punto de venta o solicite la asignación
          antes de registrar cobros.
        </p>
      </div>
      <button
        type="button"
        class="btn btn-alt-warning btn-sm cash-box-empty-action"
        :disabled="loadingCashBoxStatus"
        @click="getUserCashBoxStatus()"
      >
        <i class="fa fa-rotate-right me-1"></i>
        Reintentar
      </button>
    </div>

    <ResumenCierreCaja
      v-if="dataCashBoxStatus"
      :cash-box="dataCashBoxStatus"
      :summary="cashClosureSummary"
      :loading-summary="loadingCashClosureSummary"
      :downloading-pdf="loadingSummaryPdfDownload"
      v-model:fecha="cashClosurePayload.fecha"
      @download-summary-pdf="handleSummaryPdfDownload"
    />
  </div>
  <!-- end contenido -->
</template>

<style lang="css" scoped>
.cash-box-empty-state {
  --cash-box-empty-accent: var(--bs-warning);
  --cash-box-empty-bg: var(
    --bs-warning-bg-subtle,
    rgba(var(--bs-warning-rgb), 0.1)
  );
  --cash-box-empty-border: var(
    --bs-warning-border-subtle,
    rgba(var(--bs-warning-rgb), 0.35)
  );
  --cash-box-empty-icon-bg: rgba(var(--bs-warning-rgb), 0.14);
  --cash-box-empty-text: var(
    --bs-warning-text-emphasis,
    var(--tuval-text, var(--bs-body-color))
  );

  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.9rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--cash-box-empty-border);
  border-left: 4px solid var(--cash-box-empty-accent);
  border-radius: var(--tuval-radius-md, var(--bs-border-radius));
  background: var(--cash-box-empty-bg);
  color: var(--cash-box-empty-text);
}

.cash-box-empty-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 2.3rem;
  width: 2.3rem;
  height: 2.3rem;
  border-radius: var(--tuval-radius-md, var(--bs-border-radius));
  background: var(--cash-box-empty-icon-bg);
  color: var(--cash-box-empty-accent);
  font-size: 1rem;
}
.cash-box-empty-content {
  flex: 1 1 auto;
  min-width: 0;
}

.cash-box-empty-title {
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.2;
  color: var(--cash-box-empty-text);
}

.cash-box-empty-message {
  max-width: 58rem;
  font-size: 0.78rem;
  line-height: 1.45;
}

.cash-box-empty-action {
  flex: 0 0 auto;
}
</style>

