<script setup>
import { toRefs } from "vue";
import flatPickr from "vue-flatpickr-component";
import TablaFacturasDisponibles from "./TablaFacturasDisponibles.vue";

// componentes
import { useInvoiceCollectionActions } from "@/composables/cobranzas/cobros-facturas/useInvoiceCollectionActions";
import { useInvoiceCollectionChecks } from "@/composables/cobranzas/cobros-facturas/useInvoiceCollectionChecks";

const emit = defineEmits(["add-check", "remove-check"]);

const props = defineProps({
  facturas: {
    type: Array,
    required: true,
    default: () => [],
  },
  cheque: {
    type: Object,
    default: () => {},
  },
  cliente: {
    type: Object,
    default: () => ({}),
  },
  bancoClientes: {
    type: Array,
    required: true,
    default: () => [],
  },
  loadingDocs: {
    type: Boolean,
    required: true,
    default: () => false,
  },
});

const { facturas, cheque, cliente, bancoClientes } = toRefs(props);

const { loadingCheckReceiptValidation, validateCheckReceiptNumber } =
  useInvoiceCollectionActions();

const {
  bankClientsOptions,
  flatPickrState,
  checkPayload,
  v$,
  showTableInvoices,
  checkInvoices,
  selectedBankName,
  validationMessage,
  formatCheckAmount,
  applyCheck,
  resetCheckPayload,
  resetCheckApplicationState,
  updateInvoiceCheckAmount,
  applyFullCheckToInvoice,
  getInvoiceRemainingBalance,
  createCheckToAdd,
  getBankId,
  getBankName,
} = useInvoiceCollectionChecks({
  facturas,
  cheque,
  cliente,
  bancoClientes,
  validateCheckReceiptNumber,
});

function hasRegisteredCheck() {
  return cheque.value && Object.keys(cheque.value).length > 0;
}

async function handleApplyCheck() {
  const shouldRemovePreviousCheck = hasRegisteredCheck();
  const applied = await applyCheck();

  if (applied && shouldRemovePreviousCheck) {
    emit("remove-check");
  }
}

function handleRegisterCheck() {
  const check = createCheckToAdd();

  if (!check) {
    return;
  }

  emit("add-check", check);
  resetCheckPayload();
}

function handleCheckDataChanged() {
  resetCheckApplicationState();
}
</script>

<template>
  <section class="check-entry">
    <!-- titulo -->
    <!-- <div class="check-toolbar">
      <div class="min-w-0">
        <span class="check-kicker"> Cheques</span>
        <h4 class="check-title">Ingreso de Cheques</h4>
      </div>
    </div> -->

    <div class="check-section">
      <!-- cabecera -->
      <div class="section-heading">
        <div class="section-icon section-icon-bank">
          <i class="fa-solid fa-money-check-dollar"></i>
        </div>
        <div>
          <h5>Datos del Cheque</h5>
          <span>Banco, numero, fecha y monto</span>
        </div>
      </div>

      <div class="check-form-shell">
        <div class="check-grid">
          <!-- selector de banco -->
          <div class="check-field">
            <small class="label-small">Banco</small>
            <select
              class="form-select form-select-sm"
              v-model="checkPayload.banco_id"
              :class="{ 'is-invalid': v$.banco_id.$errors.length }"
              @change="handleCheckDataChanged"
              @blur="v$.banco_id.$touch"
              :disabled="loadingDocs"
            >
              <option value="" disabled>Seleccion un Banco</option>
              <option
                v-for="(bank, index) in bankClientsOptions"
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
          <!-- fecha emision -->
          <div class="check-field">
            <small class="label-small">F. Emision</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text"
                ><i class="far fa-calendar"></i
              ></span>
              <flat-pickr
                class="form-control fs-sm"
                placeholder="Y-m-d"
                v-model="checkPayload.fechaEmision"
                :config="flatPickrState.emision"
                disabled
              />
            </div>
          </div>
          <!-- fecha vencimiento -->
          <div class="check-field">
            <small class="label-small">F. Vencimiento</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text"
                ><i class="far fa-calendar"></i
              ></span>
              <flat-pickr
                class="form-control fs-sm"
                placeholder="Y-m-d"
                v-model="checkPayload.fechaVencimiento"
                :config="flatPickrState.vencimiento"
                :class="{ 'is-invalid': v$.fechaVencimiento.$errors.length }"
                @change="handleCheckDataChanged"
                @blur="v$.fechaVencimiento.$touch"
              />
            </div>
            <div
              v-if="v$.fechaVencimiento.$error"
              class="invalid-feedback d-block"
            >
              {{ validationMessage(v$.fechaVencimiento) }}
            </div>
          </div>

          <!-- numero de cuenta -->
          <div class="check-field">
            <small class="label-small">N° Cuenta</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text"
                ><i class="far fa-hashtag"></i
              ></span>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="checkPayload.cuenta"
                placeholder="Ingrese el número de cuenta"
                :class="{ 'is-invalid': v$.cuenta.$errors.length }"
                @change="handleCheckDataChanged"
                @blur="v$.cuenta.$touch()"
              />
            </div>
            <div v-if="v$.cuenta.$error" class="invalid-feedback d-block">
              {{ validationMessage(v$.cuenta) }}
            </div>
          </div>

          <!-- numero de cheque -->
          <div class="check-field">
            <small class="label-small"> N° cheque</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text"
                ><i class="fa fa-hashtag"></i
              ></span>
              <input
                type="text"
                class="form-control form-control-sm"
                v-model="checkPayload.cheque"
                placeholder="Ingrese el Cheque"
                :class="{ 'is-invalid': v$.cheque.$errors.length }"
                @change="handleCheckDataChanged"
                @blur="v$.cheque.$touch()"
              />
            </div>
            <div v-if="v$.cheque.$error" class="invalid-feedback d-block">
              {{ validationMessage(v$.cheque) }}
            </div>
          </div>

          <!-- monto del cheque -->
          <div class="check-field">
            <small class="label-small"> Monto</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text"
                ><i class="far fa-dollar"></i
              ></span>
              <input
                type="text"
                class="form-control form-control-sm text-end"
                v-model="checkPayload.montoRecibido"
                placeholder="Monto del Cheque"
                :class="{ 'is-invalid': v$.montoRecibido.$errors.length }"
                @change="handleCheckDataChanged"
                @blur="v$.montoRecibido.$touch()"
              />
            </div>
            <div
              v-if="v$.montoRecibido.$error"
              class="invalid-feedback d-block"
            >
              {{ validationMessage(v$.montoRecibido) }}
            </div>
          </div>

          <!-- boton de aplicar cheque a facturas -->
          <div class="check-action">
            <button
              type="button"
              class="btn btn-outline-primary btn-sm check-apply-button"
              :disabled="loadingCheckReceiptValidation"
              @click="handleApplyCheck"
            >
              <i class="fa fa-check"></i>
              Aplicar
            </button>
          </div>
        </div>
      </div>

      <div v-if="showTableInvoices" class="check-detail">
        <div class="check-summary-grid">
          <div class="check-summary-item check-summary-bank">
            <span>Banco</span>
            <strong>{{ selectedBankName }}</strong>
          </div>

          <div class="check-summary-item">
            <span>Cuenta</span>
            <strong>{{ checkPayload.cuenta }}</strong>
          </div>

          <div class="check-summary-item">
            <span>Cheque</span>
            <strong>{{ checkPayload.cheque }}</strong>
          </div>

          <div class="check-summary-item">
            <span>Emision</span>
            <strong>{{ checkPayload.fechaEmision }}</strong>
          </div>

          <div class="check-summary-item">
            <span>Vencimiento</span>
            <strong>{{ checkPayload.fechaVencimiento }}</strong>
          </div>

          <div class="check-summary-item">
            <span>Monto cheque</span>
            <strong
              >${{ formatCheckAmount(checkPayload.montoRecibido) }}</strong
            >
          </div>

          <div class="check-summary-item">
            <span>Aplicado</span>
            <strong
              >${{ formatCheckAmount(checkPayload.montoAplicado) }}</strong
            >
          </div>

          <div class="check-summary-item check-summary-warning">
            <span>No aplicado</span>
            <strong
              >${{ formatCheckAmount(checkPayload.montoNoAplicado) }}</strong
            >
          </div>

          <div class="check-summary-item">
            <span>Facturas</span>
            <strong>{{ checkPayload.facturas.length }}</strong>
          </div>
        </div>
      </div>

      <TablaFacturasDisponibles
        v-if="showTableInvoices && !loadingDocs"
        :invoices="checkInvoices"
        title="Aplicacion del cheque"
        document-label="factura(s)"
        search-placeholder="Buscar factura..."
        apply-all-key="aplicarTodoCheque"
        amount-key="aplicarMontoCheque"
        balance-key="saldoDisponibleCheque"
        balance-label="Saldo disponible"
        observation-key="observacionCheque"
        empty-text="Sin facturas disponibles para aplicar cheque"
        :format-amount="formatCheckAmount"
        :remaining-balance-resolver="getInvoiceRemainingBalance"
        @apply-all-change="applyFullCheckToInvoice"
        @amount-change="updateInvoiceCheckAmount"
      />
    </div>

    <div v-if="showTableInvoices" class="check-register-actions">
      <button
        type="button"
        class="btn btn-primary btn-sm check-register-button"
        @click="handleRegisterCheck"
      >
        <i class="fa-solid fa-money-check-dollar"></i>
        Registrar cheque
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

.check-entry {
  display: grid;
  gap: 0.65rem;
  max-width: 100%;
}

.check-entry,
.check-entry * {
  min-width: 0;
}

.check-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.check-kicker {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
}

.check-title {
  margin: 0.1rem 0 0;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.25;
}

.check-section {
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

.check-form-shell {
  display: block;
}

.check-grid {
  display: grid;
  grid-template-columns:
    minmax(7rem, 0.9fr) minmax(8rem, 1fr) minmax(8rem, 1fr)
    minmax(8rem, 1fr) minmax(7rem, 0.9fr) minmax(7rem, 0.8fr) minmax(7.5rem, auto);
  align-items: end;
  gap: 0.5rem;
}

.check-field,
.check-action {
  min-width: 0;
}

.check-action {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.check-apply-button,
.check-register-button {
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

.check-summary-item span {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.56rem;
  font-weight: 800;
  line-height: 1.12;
  text-transform: uppercase;
}

.check-summary-item strong {
  display: block;
  margin-top: 0.06rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.check-detail {
  margin-top: 0.65rem;
}

.check-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  gap: 0.35rem;
}

.check-summary-item {
  min-width: 0;
  padding: 0.34rem 0.42rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--tuval-surface-muted, var(--bs-light));
}

.check-summary-item strong {
  text-align: right;
}

.check-summary-bank {
  grid-column: span 1;
}

.check-summary-warning {
  color: var(--bs-warning-text-emphasis, var(--bs-body-color));
  border-color: var(
    --bs-warning-border-subtle,
    rgba(var(--bs-warning-rgb), 0.35)
  );
  background: var(--bs-warning-bg-subtle, rgba(var(--bs-warning-rgb), 0.1));
}

.check-summary-warning span,
.check-summary-warning strong {
  color: inherit;
}

.check-register-actions {
  display: flex;
  justify-content: flex-end;
}

.check-entry :deep(.form-control),
.check-entry :deep(.form-select),
.check-entry :deep(.input-group-text) {
  min-height: 1.95rem;
  padding: 0.25rem 0.45rem;
  font-size: 0.78rem;
}

.check-entry :deep(.invalid-feedback) {
  margin-top: 0.12rem;
  font-size: 0.68rem;
  line-height: 1.15;
}

@media (max-width: 1199.98px) {
  .check-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .check-action {
    grid-column: span 2;
  }

  .check-apply-button {
    width: 100%;
  }

  .check-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .check-section {
    padding: 0.55rem;
  }

  .check-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-heading {
    align-items: flex-start;
  }

  .check-grid,
  .check-summary-grid {
    grid-template-columns: 1fr;
  }

  .check-action {
    grid-column: auto;
  }

  .check-register-actions {
    justify-content: stretch;
  }

  .check-register-button {
    width: 100%;
  }
}
</style>
