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

const issueDateLabel = 'Fecha Emisión';
const dueDateLabel = 'Fecha Vencimiento';
const balanceDisplayLabel = 'Monto Pendiente';
const amountDisplayLabel = 'Aplicar monto';

const sortableColumnSettings = {
  document: {
    key: () => props.documentKey,
    type: 'text'
  },
  issueDate: {
    key: () => props.issueDateKey,
    type: 'date'
  },
  dueDate: {
    key: () => props.dueDateKey,
    type: 'date'
  },
  originalAmount: {
    key: () => props.originalAmountKey,
    type: 'number'
  },
  balance: {
    key: () => props.balanceKey,
    type: 'number'
  }
};

const searchTerm = ref('');
const sortColumn = ref(null);
const sortDirection = ref('asc');

const normalizedInvoices = computed(() =>
  Array.isArray(props.invoices)
    ? props.invoices
    : Object.values(props.invoices ?? {})
);

const filteredInvoices = computed(() => {
  const searchText = String(searchTerm.value ?? '').trim().toLowerCase();
  const invoices = !searchText
    ? normalizedInvoices.value
    : normalizedInvoices.value.filter((invoice) =>
      String(invoice?.[props.documentKey] ?? '').toLowerCase().includes(searchText)
    );

  return sortInvoices(invoices);
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

function setSortColumn(column) {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    return;
  }

  sortColumn.value = column;
  sortDirection.value = 'asc';
}

function isSortedBy(column) {
  return sortColumn.value === column;
}

function getAriaSort(column) {
  if (!isSortedBy(column)) {
    return 'none';
  }

  return sortDirection.value === 'asc' ? 'ascending' : 'descending';
}

function getSortIcon(column) {
  if (!isSortedBy(column)) {
    return 'fa-sort';
  }

  return sortDirection.value === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
}

function getSortButtonLabel(column, label) {
  if (!isSortedBy(column)) {
    return `Ordenar por ${label}`;
  }

  const nextDirection = sortDirection.value === 'asc' ? 'descendente' : 'ascendente';

  return `Ordenar por ${label} ${nextDirection}`;
}

function sortInvoices(invoices) {
  const sortSetting = sortableColumnSettings[sortColumn.value];

  if (!sortSetting) {
    return invoices;
  }

  const direction = sortDirection.value === 'desc' ? -1 : 1;
  const key = sortSetting.key();

  return [...invoices]
    .map((invoice, index) => ({ invoice, index }))
    .sort((left, right) => {
      const leftValue = getComparableValue(getValue(left.invoice, key), sortSetting.type);
      const rightValue = getComparableValue(getValue(right.invoice, key), sortSetting.type);
      const leftIsEmpty = leftValue === null || leftValue === '';
      const rightIsEmpty = rightValue === null || rightValue === '';

      if (leftIsEmpty && rightIsEmpty) {
        return left.index - right.index;
      }

      if (leftIsEmpty) {
        return 1;
      }

      if (rightIsEmpty) {
        return -1;
      }

      const result = compareComparableValues(leftValue, rightValue, sortSetting.type);

      return result === 0 ? left.index - right.index : result * direction;
    })
    .map(({ invoice }) => invoice);
}

function getComparableValue(value, type) {
  if (type === 'number') {
    const numericValue = toNumber(value);

    return Number.isFinite(numericValue) ? numericValue : null;
  }

  if (type === 'date') {
    return parseDateValue(value);
  }

  const textValue = String(value ?? '').trim();

  return textValue || null;
}

function compareComparableValues(leftValue, rightValue, type) {
  if (type === 'text') {
    return leftValue.localeCompare(rightValue, undefined, {
      numeric: true,
      sensitivity: 'base'
    });
  }

  return leftValue - rightValue;
}

function parseDateValue(value) {
  if (value instanceof Date) {
    const timestamp = value.getTime();

    return Number.isNaN(timestamp) ? null : timestamp;
  }

  const textValue = String(value ?? '').trim();

  if (!textValue) {
    return null;
  }

  const numericDate = textValue.match(/^(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})/);

  if (numericDate) {
    const firstPart = Number(numericDate[1]);
    const secondPart = Number(numericDate[2]);
    const thirdPart = Number(numericDate[3]);
    const year = firstPart > 31 ? firstPart : normalizeYear(thirdPart);
    const month = secondPart;
    const day = firstPart > 31 ? thirdPart : firstPart;
    const timestamp = Date.UTC(year, month - 1, day);
    const date = new Date(timestamp);

    if (
      date.getUTCFullYear() === year
      && date.getUTCMonth() === month - 1
      && date.getUTCDate() === day
    ) {
      return timestamp;
    }
  }

  const parsedDate = Date.parse(textValue);

  return Number.isNaN(parsedDate) ? null : parsedDate;
}

function normalizeYear(year) {
  return year < 100 ? 2000 + year : year;
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
            <th class="invoice-col-doc" :aria-sort="getAriaSort('document')">
              <button
                type="button"
                class="invoice-sort-button"
                :aria-label="getSortButtonLabel('document', 'Factura')"
                :aria-pressed="isSortedBy('document')"
                @click="setSortColumn('document')"
              >
                <span>Factura</span>
                <i class="fa" :class="getSortIcon('document')" aria-hidden="true"></i>
              </button>
            </th>
            <th class="invoice-col-date" :aria-sort="getAriaSort('issueDate')">
              <button
                type="button"
                class="invoice-sort-button"
                :aria-label="getSortButtonLabel('issueDate', issueDateLabel)"
                :aria-pressed="isSortedBy('issueDate')"
                @click="setSortColumn('issueDate')"
              >
                <span>{{ issueDateLabel }}</span>
                <i class="fa" :class="getSortIcon('issueDate')" aria-hidden="true"></i>
              </button>
            </th>
            <th class="invoice-col-date" :aria-sort="getAriaSort('dueDate')">
              <button
                type="button"
                class="invoice-sort-button"
                :aria-label="getSortButtonLabel('dueDate', dueDateLabel)"
                :aria-pressed="isSortedBy('dueDate')"
                @click="setSortColumn('dueDate')"
              >
                <span>{{ dueDateLabel }}</span>
                <i class="fa" :class="getSortIcon('dueDate')" aria-hidden="true"></i>
              </button>
            </th>
            <th class="text-end invoice-col-money" :aria-sort="getAriaSort('originalAmount')">
              <button
                type="button"
                class="invoice-sort-button invoice-sort-button-end"
                :aria-label="getSortButtonLabel('originalAmount', 'Monto original')"
                :aria-pressed="isSortedBy('originalAmount')"
                @click="setSortColumn('originalAmount')"
              >
                <span>Monto original</span>
                <i class="fa" :class="getSortIcon('originalAmount')" aria-hidden="true"></i>
              </button>
            </th>
            <th class="text-end invoice-col-money" :aria-sort="getAriaSort('balance')">
              <button
                type="button"
                class="invoice-sort-button invoice-sort-button-end"
                :aria-label="getSortButtonLabel('balance', balanceDisplayLabel)"
                :aria-pressed="isSortedBy('balance')"
                @click="setSortColumn('balance')"
              >
                <span>{{ balanceDisplayLabel }}</span>
                <i class="fa" :class="getSortIcon('balance')" aria-hidden="true"></i>
              </button>
            </th>
            <th v-if="showApplyAll" class="text-center invoice-col-check">{{ applyAllLabel }}</th>
            <th class="text-end invoice-col-amount">{{ amountDisplayLabel }}</th>
            <th class="text-end invoice-col-money">{{ remainingLabel }}</th>
            <th v-if="showObservation" class="invoice-col-observation">{{ observationLabel }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(invoice, index) in filteredInvoices" :key="getRowKey(invoice, index)">
            <td class="fw-semibold invoice-col-doc" data-label="Factura">
              {{ getValue(invoice, documentKey) }}
            </td>
            <td class="invoice-col-date" :data-label="issueDateLabel">
              {{ getValue(invoice, issueDateKey) }}
            </td>
            <td class="invoice-col-date" :data-label="dueDateLabel">
              {{ getValue(invoice, dueDateKey) }}
            </td>
            <td class="text-end invoice-col-money" data-label="Monto original">
              ${{ formatInvoiceAmount(getValue(invoice, originalAmountKey)) }}
            </td>
            <td class="text-end invoice-col-money" :data-label="balanceDisplayLabel">
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
            <td class="invoice-col-amount" :data-label="amountDisplayLabel">
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

.invoice-sort-button {
  display: inline-flex;
  align-items: center;
  width: 100%;
  gap: 0.25rem;
  padding: 0;
  border: 0;
  color: inherit;
  background: transparent;
  font: inherit;
  font-weight: inherit;
  line-height: inherit;
  text-align: left;
  text-transform: inherit;
  cursor: pointer;
}

.invoice-sort-button-end {
  justify-content: flex-end;
  text-align: right;
}

.invoice-sort-button span {
  min-width: 0;
  overflow-wrap: anywhere;
}

.invoice-sort-button i {
  flex: 0 0 auto;
  font-size: 0.64rem;
  opacity: 0.62;
}

.invoice-sort-button[aria-pressed='true'] i {
  opacity: 1;
}

.invoice-sort-button:focus-visible {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
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
