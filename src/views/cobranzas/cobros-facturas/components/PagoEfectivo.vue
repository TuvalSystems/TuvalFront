<script setup>
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js";
import { useInvoiceCollectionCash } from '@/composables/cobranzas/cobros-facturas/useInvoiceCollectionCash';
import { onMounted, toRefs } from 'vue';
import TablaFacturasDisponibles from './TablaFacturasDisponibles.vue';


const emits = defineEmits(["add-cash", "remove-cash"]);
const props = defineProps({
  facturas: {
    type: Array,
    required: true,
    default: () => []
  },
  efectivo: {
    type: Object,
    default: () => ({})
  },
  cliente: {
    type: Object,
    default: () => ({})
  },
  loadingDocs : {
    type : Boolean,
    default : () => false
  }
});

const {
  facturas,
  efectivo,
  cliente,
} = toRefs(props);

const {
  cashPayload,
  invoicesOptions,
  resetCashPayload,
  v$,
  validationMessage,
  updateCashChangeAmount,
  applyCash,
  showTableInvoices,
  cashInvoices,
  formatCashAmount,
  updateInvoiceCashAmount,
  applyFullCashToInvoice,
  getInvoiceRemainingBalance
} = useInvoiceCollectionCash({
  facturas,
  efectivo,
  cliente,
});

const cashDateConfig = {
  locale: Spanish,
};

function hasRegisteredCash() {
  return efectivo.value && Object.keys(efectivo.value).length > 0;
}

async function handleApplyCash() {
  const shouldRemovePreviousCash = hasRegisteredCash();
  const applied = await applyCash();

  if (applied && shouldRemovePreviousCash) {
    emits("remove-cash");
  }
}

function registerCash() {
  emits("add-cash", cashPayload);
  resetCashPayload();
}

onMounted(() => { });
</script>

<template>
  <section class="cash-entry">
    <div class="cash-toolbar">
      <div class="min-w-0">
        <span class="cash-kicker">Pago directo</span>
        <h4 class="cash-title">Ingreso de efectivo</h4>
      </div>
    </div>

    <div class="cash-section">
      <div class="section-heading">
        <div class="section-icon section-icon-success">
          <i class="fa fa-money-bill-wave"></i>
        </div>
        <div>
          <h5>Valores de efectivo</h5>
          <span>Monto recibido y cambio</span>
        </div>
      </div>
      <!-- ingreso de valores de efectivo -->
      <div class="cash-grid">
        <div class="cash-field">
          <small class="label-small">Monto a recibir</small>
          <div class="input-group input-group-sm">
            <span class="input-group-text">$</span>
            <input type="text" class="form-control text-end" v-model="cashPayload.montoRecibido"
              @change="updateCashChangeAmount()" :class="{ 'is-invalid': v$.montoRecibido.$errors.length }"
              @blur="v$.montoRecibido.$touch">
            <div v-if="v$.montoRecibido.$error" class="invalid-feedback d-block">
              {{ validationMessage(v$.montoRecibido) }}
            </div>
          </div>
        </div>

        <div class="cash-field">
          <small class="label-small">Monto a cobrar</small>
          <div class="input-group input-group-sm">
            <span class="input-group-text">$</span>
            <input type="text" class="form-control text-end" v-model="cashPayload.montoACobrar"
              @change="updateCashChangeAmount()" :class="{ 'is-invalid': v$.montoACobrar.$errors.length }"
              @blur="v$.montoACobrar.$touch" />
            <div v-if="v$.montoACobrar.$error" class="invalid-feedback d-block">
              {{ validationMessage(v$.montoACobrar) }}
            </div>
          </div>
        </div>

        <div class="cash-field">
          <small class="label-small">Monto devuelto</small>
          <div class="input-group input-group-sm">
            <span class="input-group-text">$</span>
            <input type="text" class="form-control text-end" v-model="cashPayload.montoDevuelto" readonly>
          </div>
        </div>

        <div class="cash-field">
          <small class="label-small">Fecha efectivo</small>
          <div class="input-group input-group-sm  text-muted">
            <span class="input-group-text"><i class="far fa-calendar"></i></span>
            <flat-pickr class="form-control fs-sm" placeholder="Y-m-d" :disabled="true"
              v-model="cashPayload.fechaEfectivo" :config="cashDateConfig" />
          </div>
        </div>

        <div class="cash-action">
          <button type="button" class="btn btn-outline-primary btn-sm cash-apply-button" @click="handleApplyCash()">
            <i class="fa fa-check"></i> APLICAR
          </button>
        </div>
      </div>

      <!-- detalle del efectivo -->
      <div v-if="showTableInvoices" class="cash-detail">
        <div class="cash-summary-grid">
          <div class="cash-summary-item">
            <span>Recibido</span>
            <strong>${{ formatCashAmount(cashPayload.montoRecibido) }}</strong>
          </div>

          <div class="cash-summary-item">
            <span>A cobrar</span>
            <strong>${{ formatCashAmount(cashPayload.montoACobrar) }}</strong>
          </div>

          <div class="cash-summary-item">
            <span>Vuelto</span>
            <strong>${{ formatCashAmount(cashPayload.montoDevuelto) }}</strong>
          </div>

          <div class="cash-summary-item">
            <span>Aplicado</span>
            <strong>${{ formatCashAmount(cashPayload.montoAplicado) }}</strong>
          </div>

          <div class="cash-summary-item cash-summary-warning">
            <span>No Aplicado</span>
            <strong>${{ formatCashAmount(cashPayload.montoNoAplicado) }}</strong>
          </div>
        </div>
      </div>

      <!-- tabla de facturas -->
      <TablaFacturasDisponibles v-if="showTableInvoices && !loadingDocs" :invoices="cashInvoices" apply-all-key="aplicarTodoEfectivo"
        amount-key="aplicarMontoEfectivo" observation-key="observacionEfectivo"
        empty-text="Sin facturas disponibles para aplicar efectivo" :format-amount="formatCashAmount"
        :remaining-balance-resolver="getInvoiceRemainingBalance" @apply-all-change="applyFullCashToInvoice"
        @amount-change="updateInvoiceCashAmount" />
    </div>
    <div v-if="showTableInvoices" class="cash-register-actions">
      <button type="button" class="btn btn-primary btn-sm cash-register-button" @click="registerCash()">
        <i class="fa fa-money-bill-wave"></i> Registrar Efectivo
      </button>
    </div>
  </section>
</template>

<style lang="css" scoped>
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

.cash-entry {
  display: grid;
  gap: 0.65rem;
  max-width: 100%;
}

.cash-entry,
.cash-entry * {
  min-width: 0;
}

.cash-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.cash-kicker {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
}

.cash-title {
  margin: 0.1rem 0 0;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.25;
}

.cash-section {
  padding: 0.65rem 0.75rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--bs-body-bg);
  max-width: 100%;
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

.section-icon {
  display: grid;
  flex: 0 0 auto;
  width: 1.85rem;
  height: 1.85rem;
  place-items: center;
  border-radius: var(--tuval-radius-md, 8px);
  font-size: 0.78rem;
}

.section-icon-success {
  color: #047857;
  background: #dcfce7;
}

.cash-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr)) minmax(7.5rem, auto);
  align-items: end;
  gap: 0.5rem;
}

.cash-field {
  min-width: 0;
}

.cash-action {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  min-width: 0;
}

.cash-apply-button {
  display: inline-flex;
  min-height: 1.95rem;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.25rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.cash-register-actions {
  display: flex;
  justify-content: flex-end;
}

.cash-register-button {
  display: inline-flex;
  min-height: 2rem;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.32rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.cash-detail {
  margin-top: 0.65rem;
}

.cash-summary-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.5rem;
}

.cash-summary-item {
  min-width: 0;
  padding: 0.48rem 0.55rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--tuval-surface-muted, var(--bs-light));
}

.cash-summary-item span {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
}

.cash-summary-item strong {
  display: block;
  margin-top: 0.12rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.82rem;
  font-weight: 800;
  line-height: 1.2;
  text-align: right;
}

.cash-summary-warning {
  color: var(--bs-warning-text-emphasis, var(--bs-body-color));
  border-color: var(--bs-warning-border-subtle, rgba(var(--bs-warning-rgb), 0.35));
  background: var(--bs-warning-bg-subtle, rgba(var(--bs-warning-rgb), 0.1));
}

.cash-summary-warning span,
.cash-summary-warning strong {
  color: inherit;
}

.cash-entry :deep(.form-control),
.cash-entry :deep(.input-group-text) {
  min-height: 1.95rem;
  padding: 0.25rem 0.45rem;
  font-size: 0.78rem;
}

.cash-entry :deep(.invalid-feedback) {
  margin-top: 0.12rem;
  font-size: 0.68rem;
  line-height: 1.15;
}

@media (max-width: 1199.98px) {
  .cash-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cash-action {
    grid-column: span 2;
  }

  .cash-summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .cash-section {
    padding: 0.55rem;
  }

  .cash-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-heading {
    align-items: flex-start;
  }

  .cash-grid {
    grid-template-columns: 1fr;
  }

  .cash-action {
    grid-column: auto;
  }

  .cash-apply-button {
    width: 100%;
  }

  .cash-register-actions {
    justify-content: stretch;
  }

  .cash-register-button {
    width: 100%;
  }

  .cash-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cash-summary-item {
    padding: 0.45rem;
  }

  .cash-summary-warning {
    grid-column: 1 / -1;
  }
}

@media (max-width: 575.98px) {
  .cash-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 380px) {
  .cash-summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
