<script setup>
import flatPickr from 'vue-flatpickr-component';
import VueSelect from "vue-select";
import { useInvoiceCollectionActions } from '@/composables/cobranzas/cobros-facturas/useInvoiceCollectionActions';
import { useInvoiceCollectionRetentions } from '@/composables/cobranzas/cobros-facturas/useInvoiceCollectionRetentions';
import { formatPriceJm } from '@/functions';

const {
  validateRetentionReceiptNumber
} = useInvoiceCollectionActions();

const emit = defineEmits(["add-retention", "remove-retention"]);
const props = defineProps({
  facturasRetenciones: {
    type: Array,
    required: true,
    default: () => []
  },
  retenciones: {
    type: [Array, Object],
    default: () => []
  },
  cliente: {
    type: Object,
    default: () => ({})
  }
});

const {
  flatPickrState,
  payloadRetention,
  retentionOptions,
  retentions,
  totalRetention,
  v$,
  validationMessage,
  selectedInvoice,
  changePorcentilIva,
  changePorcentilRenta,
  validateReceiptNumber,
  getRetentionRows,
  createRetentionToAdd,
} = useInvoiceCollectionRetentions({
  facturasRetenciones: () => props.facturasRetenciones,
  retenciones: () => props.retenciones,
  cliente: () => props.cliente,
  validateRetentionReceiptNumber,
});

async function addRetention() {
  const retention = await createRetentionToAdd();
  if (retention) {
    emit("add-retention", retention);
  }
}

function removeRetention(index) {
  emit("remove-retention", index);
}
</script>

<template>
  <section class="retention-entry">

    <div class="retention-toolbar">
      <div class="min-w-0">
        <span class="retention-kicker">Comprobante SRI</span>
        <h4 class="retention-title">Ingreso de retencion</h4>
      </div>

      <!-- boton de agregar -->
      <button type="button" class="btn btn-primary btn-sm d-none d-md-inline-flex align-items-center gap-2"
        @click="addRetention()">
        <i class="fa fa-circle-plus"></i> INGRESAR
      </button>
    </div>
    <!-- seccion de factura -->
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
      <div class="row g-2 align-items-end">
        <!-- lista de facturas -->
        <div class="col-lg-7">
          <small class="label-small">Facturas</small>
          <div class="invoice-selector">
            <VueSelect class="retention-select" v-model="payloadRetention.documento" :options="retentionOptions"
              :reduce="(option) => option.documento" placeholder="Buscar..." label="documento"
              :class="{ 'is-invalid': v$.documento.$errors.length }"></VueSelect>
            <button type="button" class="btn btn-alt-primary retention-icon-button" title="Cargar Factura"
              @click="selectedInvoice(payloadRetention.documento)">
              <i class="fa fa-upload"></i>
            </button>
          </div>
          <div v-if="v$.documento.$error" class="invalid-feedback d-block">
            {{ validationMessage(v$.documento) }}
          </div>
          <input type="hidden" v-model="payloadRetention.documento" />
        </div>
        <!-- fecha emision -->
        <div class="col-sm-6 col-lg-2">
          <small class="label-small">Emisión</small>
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="far fa-calendar"></i></span>
            <input type="text" class="form-control text-end fs-sm" v-model="payloadRetention.fechaEmision" readonly>
          </div>
        </div>
        <!-- fecha vencimiento -->
        <div class="col-sm-6 col-lg-2">
          <small class="label-small">Vencimiento</small>
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="far fa-calendar"></i></span>
            <input type="text" class="form-control text-end fs-sm" v-model="payloadRetention.fechaVencimiento" readonly>
          </div>
        </div>
      </div>

      <div class="invoice-metrics">
        <!-- subtotales -->
        <div class="invoice-metric">
          <small class="label-small">Subtotal</small>
          <div class="input-group input-group-sm">
            <span class="input-group-text">$</span>
            <input type="text" class="form-control text-end" v-model="payloadRetention.subtotal" readonly>
          </div>
        </div>

        <!-- iva factura -->
        <div class="invoice-metric">
          <small class="label-small">Iva</small>
          <div class="input-group input-group-sm">
            <span class="input-group-text">$</span>
            <input type="text" class="form-control text-end" v-model="payloadRetention.ivaFactura" readonly>
          </div>
        </div>

        <!-- total de factura -->
        <div class="invoice-metric">
          <small class="label-small">total</small>
          <div class="input-group input-group-sm">
            <span class="input-group-text">$</span>
            <input type="text" class="form-control text-end" v-model="payloadRetention.montoOriginal" readonly>
          </div>
        </div>

        <!-- saldo de facturaa -->
        <div class="invoice-metric">
          <small class="label-small">Saldo</small>
          <div class="input-group input-group-sm">
            <span class="input-group-text">$</span>
            <input type="text" class="form-control text-end" v-model="payloadRetention.saldoFactura" readonly>
          </div>
        </div>
      </div>
    </div>

    <!-- seccion de retencion -->
    <div class="retention-section">
      <div class="section-heading">
        <div class="section-icon section-icon-success">
          <i class="fa fa-percent"></i>
        </div>
        <div>
          <h5>Valores retenidos</h5>
          <span>Impuestos y fechas</span>
        </div>
      </div>

      <div class="row g-2">
        <!-- fecha emision -->
        <div class="col-lg-3">
          <small class="label-small">F. Emision</small>
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="far fa-calendar"></i></span>
            <flat-pickr class="form-control fs-sm" placeholder="Y-m-d" v-model="payloadRetention.retEmision"
              :config="flatPickrState.emision" :class="{ 'is-invalid': v$.retEmision.$errors.length }"
              @blur="v$.retEmision.$touch" />
          </div>
          <div v-if="v$.retEmision.$error" class="invalid-feedback d-block">
            {{ validationMessage(v$.retEmision) }}
          </div>
        </div>

        <!-- iva y renta -->
        <div class="col-lg-9">
          <div class="tax-grid">
            <div class="tax-row">
              <small class="label-small">ret. iva</small>
              <div class="tax-row-controls">
                <div class="tax-control">
                  <div class="input-group input-group-sm">
                    <input type="text" class="form-control text-end" v-model="payloadRetention.porcentajeIva"
                      :class="{ 'is-invalid': v$.porcentajeIva.$errors.length }" @blur="v$.porcentajeIva.$touch"
                      @change="changePorcentilIva" />
                    <span class="input-group-text">%</span>
                  </div>
                  <div v-if="v$.porcentajeIva.$error" class="invalid-feedback d-block">
                    {{ validationMessage(v$.porcentajeIva) }}
                  </div>
                </div>
                <div class="tax-control">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">$</span>
                    <input type="text" class="form-control text-end" v-model="payloadRetention.iva"
                      :class="{ 'is-invalid': v$.iva.$errors.length }" @blur="v$.iva.$touch" />
                  </div>
                  <div v-if="v$.iva.$error" class="invalid-feedback d-block">
                    {{ validationMessage(v$.iva) }}
                  </div>
                </div>

              </div>
            </div>
            <div class="tax-row">
              <small class="label-small">ret. renta</small>
              <div class="tax-row-controls">
                <div class="tax-control">
                  <div class="input-group input-group-sm">
                    <input type="text" class="form-control text-end" v-model="payloadRetention.porcentajeRenta"
                      :class="{ 'is-invalid': v$.porcentajeRenta.$errors.length }" @blur="v$.porcentajeRenta.$touch"
                      @change="changePorcentilRenta" />
                    <span class="input-group-text">%</span>
                  </div>
                  <div v-if="v$.porcentajeRenta.$error" class="invalid-feedback d-block">
                    {{ validationMessage(v$.porcentajeRenta) }}
                  </div>
                </div>
                <div class="tax-control">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text">$</span>
                    <input type="text" class="form-control text-end" v-model="payloadRetention.renta"
                      :class="{ 'is-invalid': v$.renta.$errors.length }" @blur="v$.renta.$touch">
                  </div>
                  <div v-if="v$.renta.$error" class="invalid-feedback d-block">
                    {{ validationMessage(v$.renta) }}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- fecha caducidad -->
        <div class="col-lg-3">
          <small class="label-small">F. caducidad</small>
          <div class="input-group input-group-sm">
            <span class="input-group-text"><i class="far fa-calendar"></i></span>
            <flat-pickr class="form-control fs-sm" placeholder="Y-m-d" v-model="payloadRetention.retCaducidad"
              :config="flatPickrState.caducidad" :class="{ 'is-invalid': v$.retCaducidad.$errors.length }"
              @blur="v$.retCaducidad.$touch" />
          </div>
          <div v-if="v$.retCaducidad.$error" class="invalid-feedback d-block">
            {{ validationMessage(v$.retCaducidad) }}
          </div>

        </div>

        <div class="col-lg-9">
          <div class="tax-grid">
            <!-- retenciones de ivas -->
            <div class="tax-row">
              <small class="label-small">Ret. IVA SRV</small>
              <div class="tax-row-controls">
                <div class="input-group input-group-sm">
                  <input type="text" class="form-control text-end" v-model="payloadRetention.porcentajeIvaSrv"
                    :class="{ 'is-invalid': v$.porcentajeIvaSrv.$errors.length }" @blur="v$.porcentajeIvaSrv.$touch">
                  <span class="input-group-text">%</span>
                </div>
                <div class="input-group input-group-sm">
                  <span class="input-group-text">$</span>
                  <input type="text" class="form-control text-end" v-model="payloadRetention.ivaSrv"
                    :class="{ 'is-invalid': v$.ivaSrv.$errors.length }" @blur="v$.ivaSrv.$touch">
                </div>
              </div>
            </div>

            <!-- retenciones de renta -->
            <div class="tax-row">
              <small class="label-small">Ret. Renta SRV</small>
              <div class="tax-row-controls">
                <div class="input-group input-group-sm">
                  <input type="text" class="form-control text-end" v-model="payloadRetention.porcentajeRentaSrv"
                    :class="{ 'is-invalid': v$.porcentajeRentaSrv.$errors.length }"
                    @blur="v$.porcentajeRentaSrv.$touch" />
                  <span class="input-group-text">%</span>
                </div>
                <div class="input-group input-group-sm">
                  <span class="input-group-text">$</span>
                  <input type="text" class="form-control text-end required" v-model="payloadRetention.rentaSrv"
                    :class="{ 'is-invalid': v$.rentaSrv.$errors.length }" @blur="v$.rentaSrv.$touch">
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- seccion de comprobante -->
    <div class="retention-section">
      <div class="section-heading">
        <div class="section-icon section-icon-warning">
          <i class="fa fa-receipt"></i>
        </div>
        <div>
          <h5>Datos del comprobante</h5>
          <span>Numeracion y autorizacion</span>
        </div>
      </div>
      <div class="row g-2">
        <!-- numero de comprobante -->
        <div class="col-lg-4">
          <small class="label-small">Numero de Comprobante</small>
          <input type="text" v-model="payloadRetention.comprobante" @change="validateReceiptNumber()"
            class="form-control fs-sm" v-maska="'###-###-#########'"
            :class="{ 'is-invalid': v$.comprobante.$errors.length }" @blur="v$.comprobante.$touch" />
          <div v-if="v$.comprobante.$error" class="invalid-feedback d-block">
            {{ validationMessage(v$.comprobante) }}
          </div>
        </div>
        <!-- numero de autorizacion -->
        <div class="col-lg-8">
          <small class="label-small">Numero de Autorización</small>
          <input type="text" v-model="payloadRetention.autorizacion" class="form-control fs-sm"
            :class="{ 'is-invalid': v$.autorizacion.$errors.length }" @blur="v$.autorizacion.$touch" />
          <div v-if="v$.autorizacion.$error" class="invalid-feedback d-block">
            {{ validationMessage(v$.autorizacion) }}
          </div>
        </div>
      </div>
    </div>
    <section class="retention-list">
      <div class="retention-list-header">
        <div class="min-w-0">
          <span class="retention-kicker">Retenciones agregadas</span>
          <h4 class="retention-title mb-0">{{ retentions.length }} comprobante(s)</h4>
        </div>

        <span class="retention-total">
          Total ${{ formatPriceJm(totalRetention) }}
        </span>
      </div>

      <div v-if="retentions.length" class="retention-cards"
        :class="{ 'retention-cards-scroll': retentions.length > 2 }">
        <article v-for="(retencion, index) in retentions"
          :key="`${retencion.documento}-${retencion.comprobante}-${index}`" class="retention-card">
          <header class="retention-card-header">
            <div class="d-flex align-items-start gap-3 min-w-0">
              <div class="retention-card-icon">
                <i class="fa fa-file-shield"></i>
              </div>
              <div class="min-w-0">
                <div class="retention-card-title text-truncate">
                  {{ retencion.comprobante }}
                </div>
                <div class="retention-card-subtitle">
                  Factura {{ retencion.documento }}
                </div>
              </div>
            </div>

            <button class="btn btn-sm btn-alt-danger retention-icon-button" type="button" title="Eliminar retencion"
              @click="removeRetention(index)">
              <i class="fa fa-trash"></i>
            </button>
          </header>

          <div class="retention-card-meta">
            <div>
              <span>Emision</span>
              <strong>{{ retencion.retEmision }}</strong>
            </div>
            <div>
              <span>Caducidad</span>
              <strong>{{ retencion.retCaducidad }}</strong>
            </div>
            <div>
              <span>Autorizacion</span>
              <strong class="text-break">{{ retencion.autorizacion }}</strong>
            </div>
          </div>

          <div class="retention-detail">
            <table class="table table-sm table-vcenter mb-0 retention-detail-table">
              <thead>
                <tr>
                  <th>Impuesto</th>
                  <th class="text-end">% Retencion</th>
                  <th class="text-end">Valor retenido</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in getRetentionRows(retencion)" :key="row.label">
                  <td>{{ row.label }}</td>
                  <td class="text-end">{{ row.percentage }}%</td>
                  <td class="text-end">${{ row.amount }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <th colspan="2" class="text-end">Total retenido</th>
                  <th class="text-end">${{ formatPriceJm(retencion.total) }}</th>
                </tr>
              </tfoot>
            </table>
          </div>
        </article>
      </div>

      <div v-else class="retention-empty">
        <i class="fa fa-receipt"></i>
        <span>Sin retenciones ingresadas</span>
      </div>
    </section>
  </section>
</template>

<style scoped>
.label-small {
  display: block;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  margin-bottom: 0.18rem;

}

.min-w-0 {
  min-width: 0;
}

.retention-entry {
  display: grid;
  gap: 0.65rem;
}

.retention-form,
.retention-list {
  display: grid;
  gap: 0.65rem;
}

.retention-toolbar,
.retention-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.retention-kicker {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
}

.retention-title {
  margin: 0.1rem 0 0;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.25;
}

.retention-section {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--bs-body-bg);
}

.section-heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.55rem;
}

.section-heading h5 {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 800;
}

.section-heading span {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.68rem;
}

.section-icon,
.retention-card-icon {
  display: grid;
  flex: 0 0 auto;
  width: 1.85rem;
  height: 1.85rem;
  place-items: center;
  border-radius: var(--tuval-radius-md, 8px);
  font-size: 0.78rem;
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
  min-height: 1.95rem;
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-color: var(--bs-border-color);
  background: var(--bs-body-bg);
}

.retention-select :deep(.vs__search),
.retention-select :deep(.vs__selected) {
  margin-top: 0;
  font-size: 0.78rem;
}

.retention-icon-button {
  display: inline-flex;
  width: 1.95rem;
  min-width: 1.95rem;
  height: 1.95rem;
  align-items: center;
  justify-content: center;
  padding: 0;
  font-size: 0.78rem;
}

.invoice-selector .retention-icon-button {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.invoice-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
  margin-top: 0.6rem;
}

.invoice-metric {
  min-width: 0;
}

.invoice-metric label {
  display: block;
  margin-bottom: 0.18rem;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
}

.tax-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.5rem;
}

.tax-row {
  display: grid;
  grid-template-columns: minmax(5.25rem, 0.65fr) minmax(0, 1.8fr);
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--tuval-surface-muted, var(--bs-light));
}

.tax-row-label {
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.74rem;
  font-weight: 800;
}

.tax-row-controls {
  display: grid;
  grid-template-columns: minmax(4.2rem, 0.85fr) minmax(5.5rem, 1.15fr);
  gap: 0.35rem;
}

.tax-control {
  min-width: 0;
}

.retention-total {
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 0.25rem 0.55rem;
  color: var(--bs-primary);
  background: var(--bs-primary-bg-subtle, #e7f1ff);
  font-size: 0.72rem;
  font-weight: 800;
  white-space: nowrap;
}

.retention-cards {
  display: grid;
  gap: 0.5rem;
  align-content: start;
}

.retention-cards-scroll {
  max-height: min(36rem, calc(100vh - 16rem));
  overflow-x: hidden;
  overflow-y: auto;
  padding-right: 0.35rem;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
}

.retention-cards-scroll::-webkit-scrollbar {
  width: 0.45rem;
}

.retention-cards-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(108, 117, 125, 0.45);
}

.retention-cards-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.retention-card {
  overflow: visible;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--bs-body-bg);
}

.retention-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.65rem;
  padding: 0.55rem 0.65rem;
  border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
}

.retention-card-icon {
  color: #2563eb;
  background: #dbeafe;
}

.retention-card-title {
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.82rem;
  font-weight: 800;
}

.retention-card-subtitle {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.7rem;
}

.retention-card-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
  padding: 0.5rem 0.65rem;
  border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
  background: var(--tuval-surface-muted, var(--bs-light));
}

.retention-card-meta span {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
}

.retention-card-meta strong {
  display: block;
  margin-top: 0.15rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.74rem;
}

.retention-detail {
  min-width: 0;
  overflow: visible;
}

.retention-detail-table {
  width: 100%;
  table-layout: fixed;
}

.retention-detail-table th,
.retention-detail-table td {
  padding: 0.32rem 0.65rem;
  font-size: 0.74rem;
}

.retention-detail-table thead th {
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.64rem;
  text-transform: uppercase;
}

.retention-detail-table tfoot th {
  border-top: 1px solid var(--tuval-border, var(--bs-border-color));
  background: var(--tuval-surface-muted, var(--bs-light));
}

.retention-empty {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.8rem;
  padding: 0.65rem;
  border: 1px dashed var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.78rem;
  font-weight: 700;
}

.retention-entry :deep(.form-control),
.retention-entry :deep(.input-group-text) {
  min-height: 1.95rem;
  padding: 0.25rem 0.45rem;
  font-size: 0.78rem;
}

.retention-entry :deep(.invalid-feedback) {
  margin-top: 0.12rem;
  font-size: 0.68rem;
  line-height: 1.15;
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

  .retention-cards-scroll {
    max-height: 34rem;
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
