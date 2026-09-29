<script setup>
import { toRefs } from "vue";
import flatPickr from "vue-flatpickr-component";
import TablaFacturasDisponibles from "./TablaFacturasDisponibles.vue";
import { useInvoiceCollectionDeposits } from "@/composables/cobranzas/cobros-facturas/useInvoiceCollectionDeposits";
import { useInvoiceCollectionActions } from "@/composables/cobranzas/cobros-facturas/useInvoiceCollectionActions";
import {
  PAYMENT_AMOUNT_MAX_LENGTH,
  handlePaymentAmountInput,
} from "@/utils/cobros/paymentAmountInput";
const emit = defineEmits(["add-deposit", "remove-deposit"]);
const props = defineProps({
  facturas: {
    type: Array,
    required: true,
    default: () => [],
  },
  bancosTuval: {
    type: Array,
    required: true,
    default: () => [],
  },
  depositos: {
    type: Array,
    default: () => [],
  },
  cliente: {
    type: Object,
    default: () => ({}),
  },
  loadingDocs: {
    type: Boolean,
    default: () => false,
  },
  invoiceDataVersion: {
    type: Number,
    default: 0,
  },
  refreshBeforeApply: {
    type: Function,
    default: null,
  },
});

const { loadingDepositReceiptValidation, validateDepositReceiptNumber } =
  useInvoiceCollectionActions();

const DEPOSIT_RECEIPT_MAX_LENGTH = 30;

const { facturas, bancosTuval, depositos, cliente, invoiceDataVersion } =
  toRefs(props);

const {
  typeDeposits,
  depositPayload,
  v$,
  bankTuvalOptions,
  depositDateConfig,
  showTableInvoices,
  depositInvoices,
  validationMessage,
  formatDepositAmount,
  applyDeposit,
  resetDepositPayload,
  resetDepositApplicationState,
  updateInvoiceDepositAmount,
  applyFullDepositToInvoice,
  getInvoiceRemainingBalance,
  createDepositToAdd,
  getBankId,
  getBankName,
} = useInvoiceCollectionDeposits({
  facturas,
  bancosTuval,
  depositos,
  cliente,
  invoiceDataVersion,
  //function
  validateDepositReceiptNumber,
});

async function handleApplyDeposit() {
  if (!(await refreshInvoicesBeforeApply())) {
    return;
  }

  await applyDeposit();
}

async function refreshInvoicesBeforeApply() {
  if (typeof props.refreshBeforeApply !== "function") {
    return true;
  }

  return (await props.refreshBeforeApply()) !== false;
}

function handleRegisterDeposit() {
  const deposit = createDepositToAdd();

  if (!deposit) {
    return;
  }

  emit("add-deposit", deposit);
  resetDepositPayload();
}

function handleDepositDataChanged() {
  resetDepositApplicationState();
}

function handleDepositReceiptInput(event) {
  const receiptNumber = event.target.value.slice(0, DEPOSIT_RECEIPT_MAX_LENGTH);

  depositPayload.comprobante = receiptNumber;

  if (event.target.value !== receiptNumber) {
    event.target.value = receiptNumber;
  }
}

function handleDepositAmountInput(field, event) {
  handlePaymentAmountInput(depositPayload, field, event);
}
</script>

<template>
  <section class="deposit-entry">
    <div class="deposit-section">
      <div class="section-heading">
        <div class="section-icon section-icon-bank">
          <i class="fa fa-building-columns"></i>
        </div>
        <div>
          <h5>Datos del deposito</h5>
          <span>Banco, comprobante, fecha y monto</span>
        </div>
      </div>

      <div class="deposit-form-shell">
        <div class="deposit-grid">
          <div class="deposit-field">
            <small class="label-small">Tipo</small>
            <select
              class="form-select form-select-sm"
              v-model="depositPayload.tipo"
              :class="{ 'is-invalid': v$.tipo.$errors.length }"
              @change="handleDepositDataChanged"
              @blur="v$.tipo.$touch"
            >
              <option value="" disabled>Seleccione un tipo</option>
              <option
                v-for="depositType in typeDeposits"
                :key="depositType.value"
                :value="depositType.value"
              >
                {{ depositType.label }}
              </option>
            </select>
            <div v-if="v$.tipo.$error" class="invalid-feedback d-block">
              {{ validationMessage(v$.tipo) }}
            </div>
          </div>
          <div class="deposit-field">
            <small class="label-small">Fecha</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text"
                ><i class="far fa-calendar"></i
              ></span>
              <flat-pickr
                class="form-control"
                placeholder="Y-m-d"
                v-model="depositPayload.fechaDeposito"
                :config="depositDateConfig"
                :class="{ 'is-invalid': v$.fechaDeposito.$errors.length }"
                @change="handleDepositDataChanged"
                @blur="v$.fechaDeposito.$touch"
              />
            </div>
            <div
              v-if="v$.fechaDeposito.$error"
              class="invalid-feedback d-block"
            >
              {{ validationMessage(v$.fechaDeposito) }}
            </div>
          </div>

          <div class="deposit-field deposit-field-wide">
            <small class="label-small">Banco</small>
            <select
              class="form-select form-select-sm"
              v-model="depositPayload.banco_id"
              :class="{ 'is-invalid': v$.banco_id.$errors.length }"
              @change="handleDepositDataChanged"
              @blur="v$.banco_id.$touch"
              :disabled="loadingDocs"
            >
              <option value="" disabled>
                {{
                  bankTuvalOptions.length
                    ? "Seleccione un banco"
                    : "Sin bancos disponibles"
                }}
              </option>
              <option
                v-for="(bank, index) in bankTuvalOptions"
                :key="getBankId(bank) || index"
                :value="getBankId(bank)"
              >
                {{ getBankName(bank) }}
              </option>
            </select>
            <div v-if="v$.banco_id.$error" class="invalid-feedback d-block">
              {{ validationMessage(v$.banco_id) }}
            </div>
          </div>

          <div class="deposit-field">
            <small class="label-small">Comprobante *</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text"
                ><i class="far fa-hashtag"></i
              ></span>
              <input
                type="text"
                class="form-control form-control-sm"
                :value="depositPayload.comprobante"
                :class="{ 'is-invalid': v$.comprobante.$errors.length }"
                inputmode="text"
                :maxlength="DEPOSIT_RECEIPT_MAX_LENGTH"
                autocomplete="off"
                required
                aria-required="true"
                @input="handleDepositReceiptInput"
                @change="handleDepositDataChanged"
                @blur="v$.comprobante.$touch"
              />
            </div>

            <div v-if="v$.comprobante.$error" class="invalid-feedback d-block">
              {{ validationMessage(v$.comprobante) }}
            </div>
          </div>

          <div class="deposit-field">
            <small class="label-small">Monto</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text">$</span>
              <input
                type="text"
                class="form-control text-end"
                :value="depositPayload.montoRecibido"
                :maxlength="PAYMENT_AMOUNT_MAX_LENGTH"
                inputmode="decimal"
                autocomplete="off"
                :class="{ 'is-invalid': v$.montoRecibido.$errors.length }"
                @input="handleDepositAmountInput('montoRecibido', $event)"
                @change="handleDepositDataChanged"
                @blur="v$.montoRecibido.$touch"
              />
            </div>
            <div
              v-if="v$.montoRecibido.$error"
              class="invalid-feedback d-block"
            >
              {{ validationMessage(v$.montoRecibido) }}
            </div>
          </div>

          <div class="deposit-action">
            <button
              type="button"
              class="btn btn-outline-primary btn-sm deposit-apply-button"
              :disabled="loadingDepositReceiptValidation"
              @click="handleApplyDeposit"
            >
              <i class="fa fa-check"></i>
              Aplicar
            </button>
          </div>
        </div>
      </div>

      <div v-if="showTableInvoices" class="deposit-detail">
        <div class="deposit-summary-grid">
          <!-- <div class="deposit-summary-item">
            <span>Tipo</span>
            <strong>{{ selectedDepositTypeLabel }}</strong>
          </div>

          <div class="deposit-summary-item deposit-summary-bank">
            <span>Banco</span>
            <strong>{{ selectedBankName }}</strong>
          </div>

          <div class="deposit-summary-item">
            <span>Comprobante</span>
            <strong>{{ depositPayload.comprobante }}</strong>
          </div>

          <div class="deposit-summary-item">
            <span>Fecha</span>
            <strong>{{ depositPayload.fechaDeposito }}</strong>
          </div> -->

          <div class="deposit-summary-item">
            <span>Monto deposito</span>
            <strong
              >${{ formatDepositAmount(depositPayload.montoRecibido) }}</strong
            >
          </div>

          <div class="deposit-summary-item">
            <span>Aplicado</span>
            <strong
              >${{ formatDepositAmount(depositPayload.montoAplicado) }}</strong
            >
          </div>

          <div class="deposit-summary-item deposit-summary-warning">
            <span>
              <i class="fa fa-circle-exclamation" aria-hidden="true"></i>
              Monto no aplicado
            </span>
            <strong
              >${{
                formatDepositAmount(depositPayload.montoNoAplicado)
              }}</strong
            >
          </div>

          <div class="deposit-summary-item">
            <span>Facturas</span>
            <strong>{{ depositPayload.facturas.length }}</strong>
          </div>
        </div>
      </div>

      <TablaFacturasDisponibles
        v-if="showTableInvoices && !loadingDocs"
        :invoices="depositInvoices"
        title="Aplicacion del deposito"
        document-label="factura(s)"
        search-placeholder="Buscar factura..."
        apply-all-key="aplicarTodoDeposito"
        amount-key="aplicarMontoDeposito"
        balance-key="saldoDisponibleDeposito"
        balance-label="Saldo disponible"
        observation-key="observacionDeposito"
        empty-text="Sin facturas disponibles para aplicar deposito"
        :format-amount="formatDepositAmount"
        :remaining-balance-resolver="getInvoiceRemainingBalance"
        @apply-all-change="applyFullDepositToInvoice"
        @amount-change="updateInvoiceDepositAmount"
      />
    </div>

    <div v-if="showTableInvoices" class="deposit-register-actions">
      <button
        type="button"
        class="btn btn-primary btn-sm deposit-register-button"
        @click="handleRegisterDeposit"
      >
        <i class="fa fa-building-columns"></i>
        Registrar deposito
      </button>
    </div>
  </section>
</template>

<style lang="css" scoped>
.label-small {
  display: block;
  margin-bottom: 0.18rem;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.min-w-0 {
  min-width: 0;
}

.deposit-entry {
  display: grid;
  gap: 0.65rem;
  max-width: 100%;
}

.deposit-entry,
.deposit-entry * {
  min-width: 0;
}

.deposit-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.deposit-kicker {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
}

.deposit-title {
  margin: 0.1rem 0 0;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.25;
}

.deposit-section {
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

.section-icon-bank {
  color: var(--tuval-primary, var(--bs-primary));
  background: var(--tuval-primary-soft, rgba(var(--bs-primary-rgb), 0.08));
}

.deposit-form-shell {
  display: block;
}

.deposit-grid {
  display: grid;
  grid-template-columns:
    minmax(7rem, 0.8fr) minmax(11rem, 1.3fr) minmax(9rem, 1fr)
    minmax(8rem, 0.9fr) minmax(7rem, 0.8fr) minmax(7.5rem, auto);
  align-items: end;
  gap: 0.5rem;
}

.deposit-field,
.deposit-action {
  min-width: 0;
}

.deposit-action {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.deposit-apply-button,
.deposit-register-button {
  display: inline-flex;
  min-height: 1.95rem;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.25rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.deposit-summary-item span {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.56rem;
  font-weight: 800;
  line-height: 1.12;
  text-transform: uppercase;
}

.deposit-summary-item strong {
  display: block;
  margin-top: 0.06rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.deposit-detail {
  margin-top: 0.65rem;
}

.deposit-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  gap: 0.35rem;
}

.deposit-summary-item {
  min-width: 0;
  padding: 0.34rem 0.42rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--tuval-surface-muted, var(--bs-light));
}

.deposit-summary-item strong {
  text-align: right;
}

.deposit-summary-bank {
  grid-column: span 1;
}

.deposit-summary-warning {
  color: var(--bs-danger-text-emphasis, var(--bs-danger));
  border: 2px solid var(
    --bs-danger-border-subtle,
    rgba(var(--bs-danger-rgb), 0.55)
  );
  background: var(--bs-danger-bg-subtle, rgba(var(--bs-danger-rgb), 0.14));
  box-shadow: 0 0 0 0.18rem rgba(var(--bs-danger-rgb), 0.1);
}

.deposit-summary-warning span,
.deposit-summary-warning strong {
  color: inherit;
}

.deposit-summary-warning span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.deposit-summary-warning strong {
  font-size: 1rem;
}

.deposit-register-actions {
  display: flex;
  justify-content: flex-end;
}

.deposit-entry :deep(.form-control),
.deposit-entry :deep(.form-select),
.deposit-entry :deep(.input-group-text) {
  min-height: 1.95rem;
  padding: 0.25rem 0.45rem;
  font-size: 0.78rem;
}

.deposit-entry :deep(.invalid-feedback) {
  margin-top: 0.12rem;
  font-size: 0.68rem;
  line-height: 1.15;
}

@media (max-width: 1199.98px) {
  .deposit-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .deposit-action {
    grid-column: span 2;
  }

  .deposit-apply-button {
    width: 100%;
  }

  .deposit-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .deposit-section {
    padding: 0.55rem;
  }

  .deposit-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-heading {
    align-items: flex-start;
  }

  .deposit-grid,
  .deposit-summary-grid {
    grid-template-columns: 1fr;
  }

  .deposit-action {
    grid-column: auto;
  }

  .deposit-register-actions {
    justify-content: stretch;
  }

  .deposit-register-button {
    width: 100%;
  }
}
</style>
