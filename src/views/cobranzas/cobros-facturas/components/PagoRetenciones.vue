<script setup>
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import VueSelect from "vue-select";
import { onMounted, reactive, computed } from 'vue';
import { ref } from 'vue';
import { swalWarning } from '@/functions/swal-alert';
import useVuelidate from "@vuelidate/core";
import {
  required,
  maxLength,
  email,
  helpers,
} from "@vuelidate/validators";
import { parseLocalDate } from '@/utils/cobros/validateDate';
const emits = defineEmits(["add-retention", 'remove-retention']);
const props = defineProps({
  facturasRetenciones: {
    type: Array,
    required: true,
    default: () => []
  },
  retenciones: {
    type: [Array, Object],
    default: () => []
  }
});

const retentionOptions = computed(() => props.facturasRetenciones);
const retentions = computed(() => props.retenciones);
const flatPickrState = reactive({
  // Configuration, get more form https://chmln.github.io/flatpickr/options/
  emision: {
    minDate: Date.now(),
    maxDate: Date.now(),
    locale: Spanish,
  },
  caducidad: {
    minDate: Date.now(),
    locale: Spanish,
  },
});

const rules = computed(() => ({
  documento: {
    required: helpers.withMessage('Seleccione un Documento.', required),
  }
}));

function createEmptyRetention() {
  return {
    documento: null,
    fechaEmision: "",
    fechaVncimiento: "",
    facturaOriginal: "",
    subtotal: 0,
    ivaFactura: 0,
    iva: 0,
    porcentajeIva: 0,
    renta: 0,
    porcentajeRenta: 0,
    ivaSrv: 0,
    porcentajeIvaSrv: 0,
    rentaSrv: 0,
    porcentajeRentaSrv: 0,
    emision: "",
    caducidad: "",
    comprobante: "",
    autorizacion: "",
    total: 0
  }
}

const payloadRetention = reactive(createEmptyRetention());

function resetPayloadRetention() {
  Object.assign(payloadRetention, createEmptyRetention());
}

function selectedInvoice(selectedDocument) {
  const invoice = retentionOptions.value.find(it => it.documento === selectedDocument);
  if (!invoice) {
    swalWarning('Documento No encontrado');
    resetPayloadRetention();
    return;
  }
  assignInvoiceToRetention(invoice);
}

function assignInvoiceToRetention(invoice) {
  const isExisting = isInvoiceAlreadyAssigned(invoice.documento);
  if (isExisting) {
    resetPayloadRetention();
    swalWarning('Esta factura ya tiene una retención ingresada');
    return;
  }
  console.log(invoice.fechaEmision);

  const retentionDate = calculateAllowedRetentionDate(invoice.fechaEmision);
  console.log(retentionDate);
  if (!retentionDate) {
    resetPayloadRetention();
    swalWarning(
      'No puede ingresar una retención de una factura de hace más de un mes'
    );
    return false;
  }

}

function isInvoiceAlreadyAssigned(doc) {
  const retentionList = Array.isArray(retentions.value)
    ? retentions.value
    : Object.values(retentions.value ?? {});

  return retentionList.some(
    retention => retention?.documento === document
  );
}

function calculateAllowedRetentionDate(invoiceIssueDate) {
  const invoiceDate = parseLocalDate(invoiceIssueDate);

  console.log(invoiceDate, 'invoiceDate');
  if (!invoiceDate) {
    return null;
  }

  const currentDate = new Date();

  const currentMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  /*
 * JavaScript controla automáticamente el cambio de año:
 * si estamos en enero, mes -1 corresponde a diciembre
 * del año anterior.
 */
  const previousMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );

  const invoiceMonthStart = new Date(
    invoiceDate.getFullYear(),
    invoiceDate.getMonth(),
    1
  );

  const isCurrentMonth =
    invoiceMonthStart.getTime() === currentMonthStart.getTime();

  const isPreviousMonth =
    invoiceMonthStart.getTime() === previousMonthStart.getTime();

  /*
   * Factura del mes actual:
   * fecha de factura + 6 días.
   */
  if (isCurrentMonth) {
    const allowedDate = new Date(invoiceDate);

    allowedDate.setDate(
      allowedDate.getDate() + 6
    );

    return allowedDate;
  }

  /*
   * Factura del mes anterior:
   * día 5 del mes actual.
   */
  if (isPreviousMonth) {
    return new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      5
    );
  }

  /*
   * La factura tiene más de un mes.
   */
  return null;
}


onMounted(() => { });
</script>

<template>
  <section class="retention-entry">

    <div class="retention-toolbar">
      <div class="min-w-0">
        <span class="retention-kicker">Comprobante SRI</span>
        <h4 class="retention-title">Ingreso de retencion</h4>
      </div>

      <!-- boton de agregar -->
      <button type="button" class="btn btn-primary btn-sm d-none d-md-inline-flex align-items-center gap-2">
        <i class="fa fa-circle-plus"></i> INGRESAR
      </button>
    </div>
    <!-- seccion de retencion -->
    <div class="retention-section">
      <div class="section-heading">
        <div class="section-icon section-icon-info">
          <i class="fa fa-file-invoice-dollar"></i>
        </div>
        <div>
          <h5>Factura</h5>
          <span>Documento base</span>
        </div>
      </div>
      <!-- lista de facturas -->
      <div class="row g-3 align-items-end">
        <div class="col-lg-7">
          <small class="label-small">Facturas</small>
          <div class="invoice-selector">
            <VueSelect class="retention-select" v-model="payloadRetention.documento" :options="retentionOptions"
              :reduce="(option) => option.documento" placeholder="Buscar..." label="documento"></VueSelect>
            <button type="button" class="btn btn-alt-primary retention-icon-button" title="Cargar Factura"
              @click="selectedInvoice(payloadRetention.documento)">
              <i class="fa fa-upload"></i>
            </button>
          </div>
          <input type="hidden" name="ret_factura" id="ret_factura" v-model="payloadRetention.documento" />
        </div>
      </div>
    </div>
  </section>
  {{ retenciones }}
</template>

<style scoped>
.label-small {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #6c757d;
  margin-bottom: 0.35rem;

}

.min-w-0 {
  min-width: 0;
}

.retention-entry {
  display: grid;
  gap: 1rem;
}

.retention-form,
.retention-list {
  display: grid;
  gap: 1rem;
}

.retention-toolbar,
.retention-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.retention-kicker {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.retention-title {
  margin: 0.1rem 0 0;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 1.05rem;
  font-weight: 800;
  line-height: 1.25;
}

.retention-section {
  padding: 1rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--bs-body-bg);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.section-heading h5 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
}

.section-heading span {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.78rem;
}

.section-icon,
.retention-card-icon {
  display: grid;
  flex: 0 0 auto;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border-radius: var(--tuval-radius-md, 8px);
}

.section-icon-info {
  color: #0369a1;
  background: #e0f2fe;
}

.section-icon-success {
  color: #047857;
  background: #dcfce7;
}

.section-icon-warning {
  color: #b45309;
  background: #fef3c7;
}

.invoice-selector {
  display: flex;
  min-width: 0;
}

.retention-select {
  flex: 1 1 auto;
  min-width: 0;
}

.retention-select :deep(.vs__dropdown-toggle) {
  min-height: 2.375rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-color: var(--bs-border-color);
  background: var(--bs-body-bg);
}

.retention-select :deep(.vs__search),
.retention-select :deep(.vs__selected) {
  margin-top: 0;
  font-size: 0.875rem;
}

.retention-icon-button {
  display: inline-flex;
  width: 2.375rem;
  min-width: 2.375rem;
  height: 2.375rem;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.invoice-selector .retention-icon-button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.invoice-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;
}

.invoice-metric {
  min-width: 0;
}

.invoice-metric label {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.tax-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.tax-row {
  display: grid;
  grid-template-columns: minmax(7rem, 0.8fr) minmax(0, 1.6fr);
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--tuval-surface-muted, var(--bs-light));
}

.tax-row-label {
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.82rem;
  font-weight: 800;
}

.tax-row-controls {
  display: grid;
  grid-template-columns: minmax(5.25rem, 0.85fr) minmax(6.5rem, 1.15fr);
  gap: 0.5rem;
}

.retention-total {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 0.35rem 0.75rem;
  color: var(--bs-primary);
  background: var(--bs-primary-bg-subtle, #e7f1ff);
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.retention-cards {
  display: grid;
  gap: 0.75rem;
}

.retention-card {
  overflow: hidden;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--bs-body-bg);
}

.retention-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
}

.retention-card-icon {
  color: #2563eb;
  background: #dbeafe;
}

.retention-card-title {
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.95rem;
  font-weight: 800;
}

.retention-card-subtitle {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.78rem;
}

.retention-card-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
  background: var(--tuval-surface-muted, var(--bs-light));
}

.retention-card-meta span {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
}

.retention-card-meta strong {
  display: block;
  margin-top: 0.15rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.82rem;
}

.retention-detail-table th,
.retention-detail-table td {
  padding: 0.55rem 1rem;
  font-size: 0.82rem;
}

.retention-detail-table thead th {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.72rem;
  text-transform: uppercase;
}

.retention-detail-table tfoot th {
  border-top: 1px solid var(--tuval-border, var(--bs-border-color));
  background: var(--tuval-surface-muted, var(--bs-light));
}

.retention-empty {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 4rem;
  padding: 1rem;
  border: 1px dashed var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.85rem;
  font-weight: 700;
}

@media (max-width: 1199.98px) {
  .invoice-metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tax-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {

  .retention-toolbar,
  .retention-list-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .invoice-metrics,
  .retention-card-meta {
    grid-template-columns: 1fr;
  }

  .tax-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575.98px) {

  .retention-section,
  .retention-card-header,
  .retention-card-meta {
    padding: 0.85rem;
  }

  .tax-row-controls {
    grid-template-columns: 1fr;
  }
}
</style>
