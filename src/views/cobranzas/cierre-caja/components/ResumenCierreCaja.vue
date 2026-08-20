
<script setup>
import { reactive, computed } from "vue";
import FlatPickr from "vue-flatpickr-component";
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { formatPriceJm } from "@/functions";

const props = defineProps({
  cashBox: {
    type: Object,
    required: true,
  },
  summary: {
    type: [Array, Object],
    default: null,
  },
  fecha: {
    type: String,
    required: true,
  },
  loadingSummary: {
    type: Boolean,
    default: false,
  },
  downloadingPdf: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:fecha", "download-summary-pdf"]);

const cashBoxDateConfig = reactive({
  maxDate: "today",
  dateFormat: "Y-m-d",
  locale: Spanish,
});

const summaryData = computed(() => {
  if (props.summary && typeof props.summary === "object") {
    return Array.isArray(props.summary) ? props.summary[0] ?? null : props.summary;
  }

  return null;
});

const hasSummaryData = computed(() => {
  return Boolean(
    summaryData.value &&
      typeof summaryData.value === "object" &&
      Object.keys(summaryData.value).length > 0
  );
});

const summaryRows = computed(() => [
  {
    key: "retencion-iva",
    label: "Retenciones IVA",
    icon: "fa-receipt",
    value:
      summaryData.value?.retencionIva ??
      summaryData.value?.retenciones?.ret_iva ??
      0,
  },
  {
    key: "retencion-renta",
    label: "Retenciones Renta",
    icon: "fa-file-invoice",
    value:
      summaryData.value?.retencionRenta ??
      summaryData.value?.retenciones?.ret_renta ??
      0,
  },
  {
    key: "efectivo",
    label: "Efectivo",
    icon: "fa-money-bill-wave",
    value: summaryData.value?.efectivo ?? 0,
  },
  {
    key: "cheques",
    label: "Cheques al dia",
    icon: "fa-money-check",
    value: summaryData.value?.cheques ?? 0,
  },
  {
    key: "cheques-p",
    label: "Cheques posfechados",
    icon: "fa-money-check-dollar",
    value: summaryData.value?.cheques_p ?? 0,
  },
  {
    key: "depositos",
    label: "Depósitos/Transferencias",
    icon: "fa-building-columns",
    value: summaryData.value?.depositos ?? 0,
  },
  {
    key: "tarjetas",
    label: "Tarjetas",
    icon: "fa-credit-card",
    value: summaryData.value?.tarjetas ?? 0,
  },
]);

const summaryTotal = computed(() => {
  if (summaryData.value?.total != null) {
    return summaryData.value.total;
  }

  return summaryRows.value.reduce(
    (total, row) => total + normalizeAmount(row.value),
    0
  );
});

function normalizeAmount(value) {
  const number =
    typeof value === "string"
      ? Number(value.replace(/[^\d.-]/g, ""))
      : Number(value);

  return Number.isFinite(number) ? number : 0;
}

function formatAmount(value) {
  return formatPriceJm(value ?? 0) ?? "0.00";
}

function handleDateChange(value) {
  emit("update:fecha", value);
}

function requestSummaryPdfDownload() {
  emit("download-summary-pdf");
}
</script>

<template>
  <BaseBlock class="cash-summary-block mb-1" rounded fxShadow content-full>
    <template #title>
      <span class="cash-summary-title">
        <span class="cash-summary-title-icon">
          <i class="fa fa-file-invoice-dollar"></i>
        </span>
        Resumen y descarga
      </span>
    </template>

    <div class="cash-summary">
      <div class="cash-summary-context">
        <div class="cash-summary-context-icon">
          <i class="fa fa-cash-register"></i>
        </div>
        <div class="cash-summary-context-copy">
          <small class="label-small">Caja actual</small>
          <div class="cash-summary-name">
            {{ cashBox.descripcion || "Caja asignada" }}
          </div>
          <div v-if="cashBox.cajaCodigo" class="cash-summary-code">
            {{ cashBox.cajaCodigo }}
          </div>
        </div>
      </div>

      <div class="cash-summary-controls">
        <div class="cash-summary-field">
          <label class="label-small" for="cash-summary-date"> Fecha </label>
          <div class="input-group input-group-sm cash-summary-date-group">
            <span class="input-group-text">
              <i class="far fa-calendar"></i>
            </span>
            <flat-pickr
              id="cash-summary-date"
              class="form-control form-control-alt fs-sm cash-summary-date"
              placeholder="Y-m-d"
              :model-value="fecha"
              @update:model-value="handleDateChange"
              :config="cashBoxDateConfig"
            />
          </div>
        </div>

        <button
          type="button"
          class="btn btn-alt-primary btn-sm cash-apply-button"
          aria-label="Descargar resumen de cierre de caja"
          :disabled="loadingSummary || downloadingPdf"
          @click="requestSummaryPdfDownload"
        >
          <span
            v-if="downloadingPdf"
            class="spinner-border spinner-border-sm me-1"
            aria-hidden="true"
          ></span>
          <i v-else class="fa fa-download me-1"></i>
          {{ downloadingPdf ? "Generando..." : "Descargar" }}
        </button>
      </div>
    </div>

    <div class="cash-summary-result">
      <div v-if="loadingSummary" class="cash-summary-state">
        <span class="spinner-border spinner-border-sm text-primary"></span>
        <span>Consultando resumen de caja...</span>
      </div>

      <div v-else-if="hasSummaryData" class="cash-summary-details">
        <div class="cash-summary-list">
          <h4 class="cash-summary-list-title">Resumen</h4>
          <div class="table-responsive">
            <table
              class="table table-striped table-sm cash-summary-table mb-0"
              aria-label="Resumen de cierre de caja"
            >
              <thead>
                <tr>
                  <th>Forma de pago</th>
                  <th class="text-end">Valor cobrado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in summaryRows" :key="row.key">
                  <td>{{ row.label }}</td>
                  <td class="text-end">${{ formatAmount(row.value) }}</td>
                </tr>
                <tr class="cash-summary-total-row">
                  <th>Total</th>
                  <th class="text-end">${{ formatAmount(summaryTotal) }}</th>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div v-else class="cash-summary-state cash-summary-state-muted">
        <i class="fa fa-circle-info"></i>
        <span>No hay resumen para la fecha seleccionada.</span>
      </div>
    </div>
  </BaseBlock>
</template>

<style lang="css" scoped>
.cash-summary-block :deep(.block-content) {
  padding: 0.9rem 1rem 1rem;
}

.cash-summary-title {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.cash-summary-title-icon,
.cash-summary-context-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  color: var(--tuval-primary-strong, var(--bs-primary));
  background: var(--tuval-primary-soft, rgba(var(--bs-primary-rgb), 0.1));
  border-radius: var(--tuval-radius-md, var(--bs-border-radius));
}

.cash-summary-title-icon {
  width: 1.65rem;
  height: 1.65rem;
  font-size: 0.75rem;
}

.cash-summary {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  min-width: 0;
}

.cash-summary-context {
  display: flex;
  align-items: center;
  flex: 1 1 18rem;
  gap: 0.75rem;
  min-width: 0;
  padding: 0.75rem 0.85rem;
  border-left: 4px solid var(--tuval-primary, var(--bs-primary));
  border-radius: var(--tuval-radius-md, var(--bs-border-radius));
  background: var(--tuval-surface-muted, var(--bs-light));
}

.cash-summary-context-icon {
  width: 2.4rem;
  height: 2.4rem;
  font-size: 0.95rem;
}

.cash-summary-context-copy {
  min-width: 0;
}

.cash-summary-name {
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.86rem;
  font-weight: 700;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cash-summary-code {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.25;
  margin-top: 0.18rem;
}

.cash-summary-controls {
  display: grid;
  grid-template-columns: minmax(12rem, 16rem) auto;
  align-items: end;
  flex: 0 1 28rem;
  gap: 0.75rem;
  min-width: min(100%, 28rem);
}

.cash-summary-field {
  min-width: 0;
}

.label-small {
  display: block;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  margin-bottom: 0.18rem;
}

.cash-summary-date-group {
  min-width: 0;
}

.cash-summary-date-group .input-group-text {
  color: var(--tuval-primary-strong, var(--bs-primary));
  background: var(--tuval-surface-muted, var(--bs-light));
}

.cash-summary-date {
  min-height: 2rem;
  font-weight: 600;
}

.cash-apply-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2rem;
  padding-inline: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

.cash-summary-result {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--tuval-border, var(--bs-border-color));
}

.cash-summary-state {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-height: 3rem;
  padding: 0.7rem 0.85rem;
  border-radius: var(--tuval-radius-md, var(--bs-border-radius));
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  background: var(--tuval-surface-muted, var(--bs-light));
}

.cash-summary-state-muted {
  border: 1px dashed var(--tuval-border, var(--bs-border-color));
}

.cash-summary-details {
  min-width: 0;
}

.cash-summary-list {
  max-width: 34rem;
  margin: 0 auto;
}

.cash-summary-list-title {
  margin: 0 0 0.75rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 1.1rem;
  font-weight: 700;
}

.cash-summary-table {
  color: var(--tuval-text, var(--bs-body-color));
}

.cash-summary-table th,
.cash-summary-table td {
  vertical-align: middle;
  white-space: nowrap;
}

.cash-summary-table tbody td:first-child,
.cash-summary-table tbody th:first-child {
  white-space: normal;
}

.cash-summary-total-row th {
  border-top-width: 2px;
}

@media (max-width: 767.98px) {
  .cash-summary {
    flex-direction: column;
  }

  .cash-summary-controls {
    grid-template-columns: 1fr;
    min-width: 0;
  }

  .cash-apply-button {
    width: 100%;
  }
}

@media (max-width: 420px) {
  .cash-summary-context {
    align-items: flex-start;
  }

  .cash-summary-name {
    white-space: normal;
  }
  .cash-summary-table {
    font-size: 0.78rem;
  }
}
</style>
