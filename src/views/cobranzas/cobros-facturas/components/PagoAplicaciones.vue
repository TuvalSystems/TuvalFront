
<script setup>
import { toRefs } from "vue";

// componentes
import TablaFacturasDisponibles from "./TablaFacturasDisponibles.vue";
import { useInvoiceCollectionApplications } from "@/composables/cobranzas/cobros-facturas/useInvoiceCollectionApplications.js";
import { formatPriceJm } from "@/functions/index.js";

const emit = defineEmits(["add-application", "remove-application"]);
const props = defineProps({
  facturas: {
    type: Array,
    required: true,
    default: () => [],
  },
  aplicacionesPendientes: {
    type: Array,
    required: true,
    default: () => [],
  },
  aplicaciones: {
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
});

const { facturas, aplicacionesPendientes, aplicaciones, cliente } =
  toRefs(props);

const APPLICATION_COMMENT_MAX_LENGTH = 100;

const {
  //data
  applicationPayload,
  applicationInvoices,
  pendingApplicationOptions,
  //validaciones
  v$,
  validationMessage,
  //estados
  showTableInvoices,
  // funciones
  selectPendingApplicationDocument,
  applySelectedPendingDocument,
  resetApplicationPayload,
  createApplicationToAdd,

  //funciones de componente de tabla
  formatApplicationAmount,
  getInvoiceRemainingBalance,
  applyFullApplicationToInvoice,
  updateInvoiceApplicationAmount,
} = useInvoiceCollectionApplications({
  facturas,
  aplicacionesPendientes,
  aplicaciones,
  cliente,
});

async function handleApplyApplication() {
  await applySelectedPendingDocument();
}

function handlePendingDocumentSelected() {
  selectPendingApplicationDocument();
}

function handleRegisterApplication() {
  const application = createApplicationToAdd();

  if (!application) {
    return;
  }

  emit("add-application", application);
  resetApplicationPayload();
}

function handleApplicationCommentInput(event) {
  const comment = event.target.value.slice(0, APPLICATION_COMMENT_MAX_LENGTH);

  applicationPayload.comentario = comment;

  if (event.target.value !== comment) {
    event.target.value = comment;
  }
}
</script>

<template>
  <section class="application-entry">
    <div class="application-section">
      <div class="section-heading">
        <div class="section-icon section-icon-bank">
          <i class="fa fa-file-invoice-dollar"></i>
        </div>
        <div>
          <h5>Aplicacion de saldos</h5>
          <span
            >Seleccione el documento pendiente y revise el saldo
            disponible</span
          >
        </div>
      </div>

      <div class="application-form-shell">
        <div class="application-grid">
          <div class="application-field">
            <small class="label-small">Documento pendiente</small>
            <select
              class="form-select form-select-sm"
              v-model="applicationPayload.documento"
              :class="{ 'is-invalid': v$.documento.$errors.length }"
              @blur="v$.documento.$touch()"
              @change="handlePendingDocumentSelected"
              :disabled="loadingDocs"
            >
              <option value="" disabled>Seleccione un documento</option>
              <option
                v-for="doc in pendingApplicationOptions"
                :key="doc.documento"
                :value="doc.documento"
              >
                {{ doc.documento }}
              </option>
            </select>
            <div v-if="v$.documento.$error" class="invalid-feedback d-block">
              {{ validationMessage(v$.documento) }}
            </div>
          </div>

          <div class="application-field">
            <small class="label-small">Comentario</small>
            <input
              type="text"
              class="form-control form-control-sm"
              :value="applicationPayload.comentario"
              :class="{ 'is-invalid': v$.comentario.$errors.length }"
              :maxlength="APPLICATION_COMMENT_MAX_LENGTH"
              placeholder="Ingrese comentario"
              @input="handleApplicationCommentInput"
              @blur="v$.comentario.$touch()"
            />
            <div v-if="v$.comentario.$error" class="invalid-feedback d-block">
              {{ validationMessage(v$.comentario) }}
            </div>
          </div>

          <div class="application-action">
            <button
              type="button"
              class="btn btn-outline-primary btn-sm application-apply-button"
              @click="handleApplyApplication"
            >
              <i class="fa fa-check"></i>
              Aplicar
            </button>
          </div>
        </div>

        <div class="application-document-grid">
          <div class="application-document-card application-document-main">
            <span>Documento</span>
            <strong>{{
              applicationPayload.documento || "Sin seleccionar"
            }}</strong>
          </div>

          <div class="application-document-card">
            <span>Tipo</span>
            <strong>{{ applicationPayload.tipo || "-" }}</strong>
          </div>

          <div class="application-document-card">
            <span>Fecha</span>
            <strong>{{ applicationPayload.fechaEmision || "-" }}</strong>
          </div>

          <div class="application-document-card">
            <span>Monto original</span>
            <strong
              >${{
                formatPriceJm(applicationPayload.montoOriginal) || "0.00"
              }}</strong
            >
          </div>

          <div class="application-document-card">
            <span>Saldo cliente</span>
            <strong
              >${{
                formatPriceJm(applicationPayload.saldoCliente) || "0.00"
              }}</strong
            >
          </div>

          <div class="application-document-card application-document-available">
            <span>Disponible a aplicar</span>
            <strong
              >${{
                formatPriceJm(applicationPayload.montoDisponible) || "0.00"
              }}</strong
            >
          </div>

          <div
            v-if="showTableInvoices"
            class="application-document-card application-document-applied"
          >
            <span>Monto aplicado</span>
            <strong
              >${{
                formatPriceJm(applicationPayload.montoAplicado) || "0.00"
              }}</strong
            >
          </div>

          <div
            v-if="showTableInvoices"
            class="application-document-card application-document-pending"
          >
            <span>Monto no aplicado</span>
            <strong
              >${{
                formatPriceJm(applicationPayload.montoNoAplicado) || "0.00"
              }}</strong
            >
          </div>
        </div>
      </div>

      <TablaFacturasDisponibles
        v-if="showTableInvoices && !loadingDocs"
        :invoices="applicationInvoices"
        title="Aplicacion de Saldos"
        document-label="factura(s)"
        search-placeholder="Buscar factura..."
        apply-all-key="aplicarTodoAplicacion"
        amount-key="aplicarMontoAplicacion"
        balance-key="saldoDisponibleAplicacion"
        balance-label="Saldo Disponible"
        observation-key="observacionAplicacion"
        empty-text="Sin facturas disponibles para aplicar saldo"
        :format-amount="formatApplicationAmount"
        :remaining-balance-resolver="getInvoiceRemainingBalance"
        @apply-all-change="applyFullApplicationToInvoice"
        @amount-change="updateInvoiceApplicationAmount"
      />
    </div>

    <div v-if="showTableInvoices" class="application-register-actions">
      <button
        type="button"
        class="btn btn-primary btn-sm application-register-button"
        @click="handleRegisterApplication"
      >
        <i class="fa fa-building-columns"></i>
        Registrar aplicacion
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

.application-entry {
  display: grid;
  gap: 0.65rem;
  max-width: 100%;
}

.application-entry,
.application-entry * {
  min-width: 0;
}

.application-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.application-kicker {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.64rem;
  font-weight: 800;
  text-transform: uppercase;
}

.application-title {
  margin: 0.1rem 0 0;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.25;
}

.application-section {
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

.application-form-shell {
  display: block;
}

.application-grid {
  display: grid;
  grid-template-columns: minmax(14rem, 1.1fr) minmax(12rem, 1fr) minmax(
      7.5rem,
      auto
    );
  align-items: end;
  gap: 0.5rem;
}

.application-field,
.application-action {
  min-width: 0;
}

.application-action {
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
}

.application-document-grid {
  display: grid;
  grid-template-columns: minmax(8.4rem, 1.35fr) repeat(7, minmax(5.25rem, 1fr));
  gap: 0.28rem;
  margin-top: 0.5rem;
}

.application-document-card {
  min-width: 0;
  padding: 0.28rem 0.34rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--tuval-surface-muted, var(--bs-light));
}

.application-document-card span {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.5rem;
  font-weight: 800;
  line-height: 1.08;
  text-transform: uppercase;
}

.application-document-card strong {
  display: block;
  margin-top: 0.06rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.66rem;
  font-weight: 800;
  line-height: 1.1;
  overflow-wrap: anywhere;
  text-align: right;
}

.application-document-main strong {
  text-align: left;
}

.application-document-available {
  color: var(--bs-primary, var(--tuval-primary));
  border-color: rgba(var(--bs-primary-rgb), 0.25);
  background: var(--tuval-primary-soft, rgba(var(--bs-primary-rgb), 0.08));
}

.application-document-available span,
.application-document-available strong {
  color: inherit;
}

.application-document-applied {
  color: var(--bs-success-text-emphasis, var(--bs-success));
  border-color: var(
    --bs-success-border-subtle,
    rgba(var(--bs-success-rgb), 0.3)
  );
  background: var(--bs-success-bg-subtle, rgba(var(--bs-success-rgb), 0.1));
}

.application-document-pending {
  color: var(--bs-warning-text-emphasis, var(--bs-body-color));
  border-color: var(
    --bs-warning-border-subtle,
    rgba(var(--bs-warning-rgb), 0.35)
  );
  background: var(--bs-warning-bg-subtle, rgba(var(--bs-warning-rgb), 0.1));
}

.application-document-applied span,
.application-document-applied strong,
.application-document-pending span,
.application-document-pending strong {
  color: inherit;
}

.application-apply-button,
.application-register-button {
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

.application-summary-item span {
  display: block;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  font-size: 0.56rem;
  font-weight: 800;
  line-height: 1.12;
  text-transform: uppercase;
}

.application-summary-item strong {
  display: block;
  margin-top: 0.06rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.application-detail {
  margin-top: 0.65rem;
}

.application-summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
  gap: 0.35rem;
}

.application-summary-item {
  min-width: 0;
  padding: 0.34rem 0.42rem;
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: var(--tuval-radius-md, 8px);
  background: var(--tuval-surface-muted, var(--bs-light));
}

.application-summary-item strong {
  text-align: right;
}

.application-summary-bank {
  grid-column: span 1;
}

.application-summary-warning {
  color: var(--bs-warning-text-emphasis, var(--bs-body-color));
  border-color: var(
    --bs-warning-border-subtle,
    rgba(var(--bs-warning-rgb), 0.35)
  );
  background: var(--bs-warning-bg-subtle, rgba(var(--bs-warning-rgb), 0.1));
}

.application-summary-warning span,
.application-summary-warning strong {
  color: inherit;
}

.application-register-actions {
  display: flex;
  justify-content: flex-end;
}

.application-entry :deep(.form-control),
.application-entry :deep(.form-select),
.application-entry :deep(.input-group-text) {
  min-height: 1.95rem;
  padding: 0.25rem 0.45rem;
  font-size: 0.78rem;
}

.application-entry :deep(.invalid-feedback) {
  margin-top: 0.12rem;
  font-size: 0.68rem;
  line-height: 1.15;
}

@media (max-width: 1199.98px) {
  .application-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .application-action {
    grid-column: span 2;
  }

  .application-apply-button {
    width: 100%;
  }

  .application-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .application-document-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .application-document-main {
    grid-column: span 1;
  }
}

@media (max-width: 767.98px) {
  .application-section {
    padding: 0.55rem;
  }

  .application-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-heading {
    align-items: flex-start;
  }

  .application-grid,
  .application-document-grid,
  .application-summary-grid {
    grid-template-columns: 1fr;
  }

  .application-document-main {
    grid-column: auto;
  }

  .application-action {
    grid-column: auto;
  }

  .application-register-actions {
    justify-content: stretch;
  }

  .application-register-button {
    width: 100%;
  }
}
</style>
