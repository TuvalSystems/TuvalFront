<script setup>
import { computed, ref } from 'vue';
import { formatPriceJm, roundTo, toNumber } from '@/functions';

const props = defineProps({
  invoices: {
    type: [Array, Object],
    default: () => []
  },
  title: {
    type: String,
    default: 'Facturas disponibles'
  },
  documentLabel: {
    type: String,
    default: 'documento(s)'
  },
  searchPlaceholder: {
    type: String,
    default: 'Buscar documento...'
  },
  documentKey: {
    type: String,
    default: 'documento'
  },
  issueDateKey: {
    type: String,
    default: 'fechaEmision'
  },
  dueDateKey: {
    type: String,
    default: 'fechaVencimiento'
  },
  originalAmountKey: {
    type: String,
    default: 'montoOriginal'
  },
  balanceKey: {
    type: String,
    default: 'saldoCliente'
  },
  balanceLabel: {
    type: String,
    default: 'Saldo'
  },
  applyAllKey: {
    type: String,
    default: 'aplicarTodo'
  },
  amountKey: {
    type: String,
    default: 'aplicarMonto'
  },
  observationKey: {
    type: String,
    default: 'observacion'
  },
  applyAllLabel: {
    type: String,
    default: 'Todo'
  },
  amountLabel: {
    type: String,
    default: 'Aplicar'
  },
  remainingLabel: {
    type: String,
    default: 'Saldo final'
  },
  observationLabel: {
    type: String,
    default: 'Observacion'
  },
  showApplyAll: {
    type: Boolean,
    default: true
  },
  showObservation: {
    type: Boolean,
    default: true
  },
  emptyText: {
    type: String,
    default: 'Sin facturas disponibles para aplicar'
  },
  emptySearchText: {
    type: String,
    default: 'Sin resultados para el documento buscado'
  },
  formatAmount: {
    type: Function,
    default: null
  },
  remainingBalanceResolver: {
    type: Function,
    default: null
  }
});

const emit = defineEmits([
  'apply-all-change',
  'amount-change',
  'observation-change'
]);

const searchTerm = ref('');

const normalizedInvoices = computed(() =>
  Array.isArray(props.invoices)
    ? props.invoices
    : Object.values(props.invoices ?? {})
);

const filteredInvoices = computed(() => {
  const searchText = String(searchTerm.value ?? '').trim().toLowerCase();

  if (!searchText) {
    return normalizedInvoices.value;
  }

  return normalizedInvoices.value.filter((invoice) =>
    String(invoice?.[props.documentKey] ?? '').toLowerCase().includes(searchText)
  );
});

function getRowKey(invoice, index) {
  return invoice?.id ?? invoice?.[props.documentKey] ?? index;
}

function getValue(invoice, key) {
  return invoice?.[key];
}

function formatInvoiceAmount(value) {
  if (typeof props.formatAmount === 'function') {
    return props.formatAmount(value);
  }

  return formatPriceJm(value) ?? '0.00';
}

function getRemainingBalance(invoice) {
  if (typeof props.remainingBalanceResolver === 'function') {
    return props.remainingBalanceResolver(invoice);
  }

  const balance = toNumber(invoice?.[props.balanceKey]) ?? 0;
  const appliedAmount = toNumber(invoice?.[props.amountKey]) ?? 0;

  return roundTo(Math.max(balance - appliedAmount, 0), 2);
}

function handleApplyAllChange(invoice) {
  emit('apply-all-change', invoice);
}

function handleAmountChange(invoice) {
  emit('amount-change', invoice);
}

function handleObservationChange(invoice) {
  emit('observation-change', invoice);
}
</script>

<template>
  <div class="invoice-application">
    <div class="invoice-application-header">
      <div class="min-w-0">
        <span class="invoice-application-kicker">{{ title }}</span>
        <h4 class="invoice-application-title mb-0">
          {{ filteredInvoices.length }} de {{ normalizedInvoices.length }} {{ documentLabel }}
        </h4>
      </div>

      <div class="input-group input-group-sm invoice-application-search">
        <span class="input-group-text"><i class="fa fa-magnifying-glass"></i></span>
        <input
          type="text"
          class="form-control"
          v-model="searchTerm"
          :placeholder="searchPlaceholder"
        >
      </div>
    </div>

    <div v-if="normalizedInvoices.length && filteredInvoices.length" class="invoice-application-scroll">
      <table class="table table-sm table-vcenter mb-0 invoice-application-table">
        <thead>
          <tr>
            <th class="invoice-col-doc">Factura</th>
            <th class="invoice-col-date">Emision</th>
            <th class="invoice-col-date">Vencimiento</th>
            <th class="text-end invoice-col-money">Monto original</th>
            <th class="text-end invoice-col-money">{{ balanceLabel }}</th>
            <th v-if="showApplyAll" class="text-center invoice-col-check">{{ applyAllLabel }}</th>
            <th class="text-end invoice-col-amount">{{ amountLabel }}</th>
            <th class="text-end invoice-col-money">{{ remainingLabel }}</th>
            <th v-if="showObservation" class="invoice-col-observation">{{ observationLabel }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(invoice, index) in filteredInvoices" :key="getRowKey(invoice, index)">
            <td class="fw-semibold invoice-col-doc" data-label="Factura">
              {{ getValue(invoice, documentKey) }}
            </td>
            <td class="invoice-col-date" data-label="Emision">
              {{ getValue(invoice, issueDateKey) }}
            </td>
            <td class="invoice-col-date" data-label="Vencimiento">
              {{ getValue(invoice, dueDateKey) }}
            </td>
            <td class="text-end invoice-col-money" data-label="Monto original">
              ${{ formatInvoiceAmount(getValue(invoice, originalAmountKey)) }}
            </td>
            <td class="text-end invoice-col-money" :data-label="balanceLabel">
              ${{ formatInvoiceAmount(getValue(invoice, balanceKey)) }}
            </td>
            <td v-if="showApplyAll" class="text-center invoice-col-check" :data-label="applyAllLabel">
              <input
                type="checkbox"
                class="form-check-input"
                v-model="invoice[applyAllKey]"
                @change="handleApplyAllChange(invoice)"
              >
            </td>
            <td class="invoice-col-amount" :data-label="amountLabel">
              <div class="input-group input-group-sm invoice-application-amount">
                <span class="input-group-text">$</span>
                <input
                  type="text"
                  class="form-control text-end"
                  v-model="invoice[amountKey]"
                  @change="handleAmountChange(invoice)"
                >
              </div>
            </td>
            <td class="text-end invoice-col-money" :data-label="remainingLabel">
              ${{ formatInvoiceAmount(getRemainingBalance(invoice)) }}
            </td>
            <td v-if="showObservation" class="invoice-col-observation" :data-label="observationLabel">
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="invoice[observationKey]"
                @change="handleObservationChange(invoice)"
              >
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="normalizedInvoices.length" class="invoice-application-empty">
      <i class="fa fa-magnifying-glass"></i>
      <span>{{ emptySearchText }}</span>
    </div>

    <div v-else class="invoice-application-empty">
      <i class="fa fa-file-invoice"></i>
      <span>{{ emptyText }}</span>
    </div>
  </div>
</template>

<style scoped>
.min-w-0 {
  min-width: 0;
}

.invoice-application {
  max-width: 100%;
  margin-top: 0.65rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  overflow: hidden;
  background: var(--bs-body-bg);
}

.invoice-application,
.invoice-application * {
  min-width: 0;
}

.invoice-application-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.65rem;
  border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
  background: var(--tuval-surface-muted, var(--bs-light));
}

.invoice-application-kicker {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
}

.invoice-application-title {
  margin: 0.1rem 0 0;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.25;
}

.invoice-application-search {
  width: min(100%, 16rem);
}

.invoice-application-scroll {
  max-width: 100%;
  max-height: min(28rem, calc(100vh - 16rem));
  overflow: auto;
  scrollbar-gutter: stable;
  overscroll-behavior: contain;
}

.invoice-application-scroll::-webkit-scrollbar {
  width: 0.45rem;
  height: 0.45rem;
}

.invoice-application-scroll::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(108, 117, 125, 0.45);
}

.invoice-application-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.invoice-application-table {
  min-width: 58rem;
  table-layout: fixed;
}

.invoice-application-table th,
.invoice-application-table td {
  padding: 0.35rem 0.5rem;
  font-size: 0.74rem;
  vertical-align: middle;
}

.invoice-application-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid var(--tuval-border, var(--bs-border-color));
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  background: var(--bs-body-bg);
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
}

.invoice-col-doc {
  width: 9rem;
}

.invoice-col-date {
  width: 6.5rem;
}

.invoice-col-money {
  width: 7rem;
}

.invoice-col-check {
  width: 3.5rem;
}

.invoice-col-amount {
  width: 7rem;
}

.invoice-col-observation {
  width: 12rem;
}

.invoice-application-amount {
  min-width: 0;
}

.invoice-application-empty {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 2.8rem;
  padding: 0.65rem;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.78rem;
  font-weight: 700;
}

.invoice-application :deep(.form-control),
.invoice-application :deep(.input-group-text) {
  min-height: 1.95rem;
  padding: 0.25rem 0.45rem;
  font-size: 0.78rem;
}

@media (max-width: 767.98px) {
  .invoice-application-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 0.55rem;
  }

  .invoice-application-search {
    width: 100%;
  }

  .invoice-application-scroll {
    max-height: min(30rem, calc(100vh - 12rem));
    overflow-x: hidden;
    overflow-y: auto;
    padding: 0.55rem;
  }

  .invoice-application-table {
    display: block;
    min-width: 0;
    width: 100%;
  }

  .invoice-application-table thead {
    display: none;
  }

  .invoice-application-table tbody {
    display: grid;
    gap: 0.55rem;
  }

  .invoice-application-table tr {
    display: grid;
    gap: 0.42rem;
    padding: 0.6rem;
    border: 1px solid var(--tuval-border, var(--bs-border-color));
    border-radius: var(--tuval-radius-md, 8px);
    background: var(--bs-body-bg);
  }

  .invoice-application-table td {
    display: grid;
    width: 100% !important;
    grid-template-columns: minmax(6.75rem, 0.78fr) minmax(0, 1fr);
    align-items: center;
    gap: 0.45rem;
    padding: 0 !important;
    border: 0 !important;
    text-align: right !important;
    overflow-wrap: anywhere;
  }

  .invoice-application-table td::before {
    content: attr(data-label);
    color: var(--tuval-text-muted, var(--bs-secondary-color));
    font-size: 0.62rem;
    font-weight: 800;
    line-height: 1.1;
    text-align: left;
    text-transform: uppercase;
  }

  .invoice-application-table td:first-child {
    display: block;
    padding-bottom: 0.42rem !important;
    border-bottom: 1px solid var(--tuval-border, var(--bs-border-color)) !important;
    text-align: left !important;
    font-size: 0.82rem;
  }

  .invoice-application-table td:first-child::before {
    display: block;
    margin-bottom: 0.08rem;
  }

  .invoice-application-table td.invoice-col-amount,
  .invoice-application-table td.invoice-col-observation {
    grid-template-columns: 1fr;
    text-align: left !important;
  }

  .invoice-application-table td.invoice-col-amount::before,
  .invoice-application-table td.invoice-col-observation::before {
    margin-bottom: -0.2rem;
  }

  .invoice-application-amount,
  .invoice-application-table td.invoice-col-observation .form-control {
    width: 100%;
  }
}

@media (max-width: 380px) {
  .invoice-application-table td {
    grid-template-columns: 1fr;
    text-align: left !important;
  }
}
</style>
