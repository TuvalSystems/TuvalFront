<script setup>
import { toRefs } from "vue";
import flatPickr from "vue-flatpickr-component";
import TablaFacturasDisponibles from "./TablaFacturasDisponibles.vue";
import { useInvoiceCollectionCards } from "@/composables/cobranzas/cobros-facturas/useInvoiceCollectionCards.js";

const emit = defineEmits(["add-card", "remove-card"]);

const props = defineProps({
  facturas: {
    type: Array,
    required: true,
    default: () => [],
  },
  bancoTarjetas: {
    type: Array,
    required: true,
    default: () => [],
  },
  tarjeta: {
    type: Object,
    default: null,
  },
  cliente: {
    type: Object,
    default: () => ({}),
  },
  loadingDocs: {
    type: Boolean,
    default: () => false,
  },
});

const { facturas, bancoTarjetas, tarjeta, cliente } = toRefs(props);

const CARD_APPROVAL_MAX_LENGTH = 30;
const CARD_COMMENT_MAX_LENGTH = 100;

const {
  cardPayload,
  bankCardsOptions,
  cardDateConfig,
  showTableInvoices,
  cardInvoices,
  selectedBankName,
  v$,
  resetCardPayload,
  resetCardApplicationState,
  validationMessage,
  formatCardAmount,
  applyCard,
  updateInvoiceCardAmount,
  applyFullCardToInvoice,
  getInvoiceRemainingBalance,
  createCardToAdd,
  getBankId,
  getBankName,
} = useInvoiceCollectionCards({
  facturas,
  bancoTarjetas,
  cliente,
});

async function handleApplyCard() {
  const shouldRemovePreviousCard = hasRegisteredCard();
  const applied = await applyCard();

  if (applied && shouldRemovePreviousCard) {
    emit("remove-card");
  }
}

function handleRegisterCard() {
  const card = createCardToAdd();

  if (!card) {
    return;
  }

  emit("add-card", card);
  resetCardPayload();
}

function handleCardDataChanged() {
  resetCardApplicationState();
}

function handleCardNumericInput(field, event, maxLength) {
  const numericValue = event.target.value.replace(/\D/g, "").slice(0, maxLength);

  cardPayload[field] = numericValue;

  if (event.target.value !== numericValue) {
    event.target.value = numericValue;
  }
}

function hasRegisteredCard() {
  return tarjeta.value && Object.keys(tarjeta.value).length > 0;
}
</script>

<template>
  <section class="cards-entry">
    <!-- <div class="cards-toolbar">
      <div class="min-w-0">
        <span class="cards-kicker">Tarjetas de credito</span>
        <h4 class="cards-title">Ingreso de tarjeta</h4>
      </div>
    </div> -->

    <div class="cards-section">
      <div class="section-heading">
        <div class="section-icon section-icon-card">
          <i class="fa fa-credit-card"></i>
        </div>
        <div>
          <h5>Datos de la tarjeta</h5>
          <span>Emisor, aprobacion, fecha y monto</span>
        </div>
      </div>

      <div class="cards-form-shell">
        <div class="cards-grid">
          <div class="cards-field cards-field-wide">
            <small class="label-small">Emisor</small>
            <select
              class="form-select form-select-sm"
              v-model="cardPayload.banco_id"
              :class="{ 'is-invalid': v$.banco_id.$errors.length }"
              :disabled="loadingDocs"
              @change="handleCardDataChanged"
              @blur="v$.banco_id.$touch"
            >
              <option value="" disabled>
                {{
                  bankCardsOptions.length
                    ? "Seleccione un emisor"
                    : "Sin emisores disponibles"
                }}
              </option>
              <option
                v-for="(bank, index) in bankCardsOptions"
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

          <div class="cards-field">
            <small class="label-small">Fecha</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text"
                ><i class="far fa-calendar"></i
              ></span>
              <flat-pickr
                class="form-control"
                placeholder="Y-m-d"
                v-model="cardPayload.fechaTarjeta"
                :config="cardDateConfig"
                disabled
              />
            </div>
          </div>

          <div class="cards-field">
            <small class="label-small"># Aprobacion</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text"
                ><i class="fa fa-hashtag"></i
              ></span>
              <input
                type="text"
                class="form-control form-control-sm"
                :value="cardPayload.comprobante"
                :class="{ 'is-invalid': v$.comprobante.$errors.length }"
                inputmode="numeric"
                pattern="[0-9]*"
                :maxlength="CARD_APPROVAL_MAX_LENGTH"
                autocomplete="off"
                @input="handleCardNumericInput('comprobante', $event, CARD_APPROVAL_MAX_LENGTH)"
                @change="handleCardDataChanged"
                @blur="v$.comprobante.$touch"
              />
            </div>
            <div v-if="v$.comprobante.$error" class="invalid-feedback d-block">
              {{ validationMessage(v$.comprobante) }}
            </div>
          </div>

          <div class="cards-field">
            <small class="label-small">Lote ref</small>
            <input
              type="text"
              class="form-control form-control-sm"
              :value="cardPayload.comentario"
              :class="{ 'is-invalid': v$.comentario.$errors.length }"
              inputmode="numeric"
              pattern="[0-9]*"
              :maxlength="CARD_COMMENT_MAX_LENGTH"
              autocomplete="off"
              @input="handleCardNumericInput('comentario', $event, CARD_COMMENT_MAX_LENGTH)"
              @change="handleCardDataChanged"
              @blur="v$.comentario.$touch"
            />
            <div v-if="v$.comentario.$error" class="invalid-feedback d-block">
              {{ validationMessage(v$.comentario) }}
            </div>
          </div>

          <div class="cards-field">
            <small class="label-small">Monto</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text">$</span>
              <input
                type="text"
                class="form-control text-end"
                v-model="cardPayload.montoRecibido"
                :class="{ 'is-invalid': v$.montoRecibido.$errors.length }"
                @change="handleCardDataChanged"
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

          <div class="cards-action">
            <button
              type="button"
              class="btn btn-outline-primary btn-sm cards-apply-button"
              @click="handleApplyCard"
            >
              <i class="fa fa-check"></i>
              Aplicar
            </button>
          </div>
        </div>
      </div>

      <div v-if="showTableInvoices " class="cards-detail">
        <div class="cards-summary-grid">
          <div class="cards-summary-item cards-summary-bank">
            <span>Emisor</span>
            <strong>{{ selectedBankName }}</strong>
          </div>

          <div class="cards-summary-item">
            <span>Aprobacion</span>
            <strong>{{ cardPayload.comprobante }}</strong>
          </div>

          <div class="cards-summary-item">
            <span>Fecha</span>
            <strong>{{ cardPayload.fechaTarjeta }}</strong>
          </div>

          <div class="cards-summary-item">
            <span>Lote ref</span>
            <strong>{{ cardPayload.comentario }}</strong>
          </div>

          <div class="cards-summary-item">
            <span>Monto tarjeta</span>
            <strong>${{ formatCardAmount(cardPayload.montoRecibido) }}</strong>
          </div>

          <div class="cards-summary-item">
            <span>Aplicado</span>
            <strong>${{ formatCardAmount(cardPayload.montoAplicado) }}</strong>
          </div>

          <div class="cards-summary-item cards-summary-warning">
            <span>No aplicado</span>
            <strong
              >${{ formatCardAmount(cardPayload.montoNoAplicado) }}</strong
            >
          </div>

          <div class="cards-summary-item">
            <span>Facturas</span>
            <strong>{{ cardPayload.facturas.length }}</strong>
          </div>
        </div>
      </div>

      <TablaFacturasDisponibles
        v-if="showTableInvoices && !loadingDocs"
        :invoices="cardInvoices"
        title="Aplicacion de la tarjeta"
        document-label="factura(s)"
        search-placeholder="Buscar factura..."
        apply-all-key="aplicarTodoTarjeta"
        amount-key="aplicarMontoTarjeta"
        balance-key="saldoDisponibleTarjeta"
        balance-label="Saldo disponible"
        observation-key="observacionTarjeta"
        empty-text="Sin facturas disponibles para aplicar tarjeta"
        :format-amount="formatCardAmount"
        :remaining-balance-resolver="getInvoiceRemainingBalance"
        @apply-all-change="applyFullCardToInvoice"
        @amount-change="updateInvoiceCardAmount"
      />
    </div>

    <div v-if="showTableInvoices" class="cards-register-actions">
      <button
        type="button"
        class="btn btn-primary btn-sm cards-register-button"
        @click="handleRegisterCard"
      >
        <i class="fa fa-credit-card"></i>
        Registrar tarjeta
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

.cards-entry {
  display: grid;
  gap: 0.65rem;
  max-width: 100%;
}

.cards-entry,
.cards-entry * {
  min-width: 0;
}

.cards-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.cards-kicker {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
}

.cards-title {
  margin: 0.1rem 0 0;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.25;
}

.cards-section {
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

.section-icon-card {
  color: var(--tuval-primary, var(--bs-primary));
  background: var(--tuval-primary-soft, rgba(var(--bs-primary-rgb), 0.08));
}

.cards-form-shell {
  display: block;
}

.cards-grid {
  display: grid;
  grid-template-columns: minmax(11rem, 1.3fr) minmax(8rem, 0.9fr) minmax(
      8rem,
      0.9fr
    ) minmax(8rem, 0.9fr) minmax(7rem, 0.8fr) minmax(7.5rem, auto);
  align-items: end;
  gap: 0.5rem;
}

.cards-field,
.cards-action {
  min-width: 0;
}

.cards-action {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.cards-apply-button,
.cards-register-button {
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

.cards-detail {
  margin-top: 0.65rem;
}

.cards-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  gap: 0.35rem;
}

.cards-summary-item {
  min-width: 0;
  padding: 0.34rem 0.42rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--tuval-surface-muted, var(--bs-light));
}

.cards-summary-item span {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.56rem;
  font-weight: 800;
  line-height: 1.12;
  text-transform: uppercase;
}

.cards-summary-item strong {
  display: block;
  margin-top: 0.06rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.15;
  overflow-wrap: anywhere;
  text-align: right;
}

.cards-summary-bank {
  grid-column: span 1;
}

.cards-summary-warning {
  color: var(--bs-warning-text-emphasis, var(--bs-body-color));
  border-color: var(
    --bs-warning-border-subtle,
    rgba(var(--bs-warning-rgb), 0.35)
  );
  background: var(--bs-warning-bg-subtle, rgba(var(--bs-warning-rgb), 0.1));
}

.cards-summary-warning span,
.cards-summary-warning strong {
  color: inherit;
}

.cards-register-actions {
  display: flex;
  justify-content: flex-end;
}

.cards-entry :deep(.form-control),
.cards-entry :deep(.form-select),
.cards-entry :deep(.input-group-text) {
  min-height: 1.95rem;
  padding: 0.25rem 0.45rem;
  font-size: 0.78rem;
}

.cards-entry :deep(.invalid-feedback) {
  margin-top: 0.12rem;
  font-size: 0.68rem;
  line-height: 1.15;
}

@media (max-width: 1199.98px) {
  .cards-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cards-action {
    grid-column: span 2;
  }

  .cards-apply-button {
    width: 100%;
  }

  .cards-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .cards-section {
    padding: 0.55rem;
  }

  .cards-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-heading {
    align-items: flex-start;
  }

  .cards-grid,
  .cards-summary-grid {
    grid-template-columns: 1fr;
  }

  .cards-action {
    grid-column: auto;
  }

  .cards-register-actions {
    justify-content: stretch;
  }

  .cards-register-button {
    width: 100%;
  }
}
</style>
