
<script setup>
import { toRefs } from "vue";
import flatPickr from "vue-flatpickr-component";

// componentes
import TablaFacturasDisponibles from "./TablaFacturasDisponibles.vue";

const emits = defineEmits(["add-application", "remove-application"]);
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
</script>

<template>
  <section class="application-entry">
    <div class="application-section">
      <div class="section-heading">
        <div class="section-icon section-icon-bank">
          <i class="fa fa-scale-balanced"></i>
        </div>
        <div>
          <h5>Aplicación de Saldos</h5>
          <span> Documento</span>
        </div>
      </div>

      <div class="application-form-shell">
        <div class="application-grid">
          <!-- selector de documento -->
          <div class="application-field">
            <small class="label-small"> Cobro</small>
            <select class="form-select form-select-sm" :default="loadingDocs">
              <option value="" disabled>Seleccione un Cobro</option>
            </select>
          </div>

          <!-- visualizacion de datos del cobro -->
          <!-- documento -->
          <div class="application-field">
            <small class="label-small"> documento</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text"
                ><i class="fa fa-hashtag"></i
              ></span>
              <input
                type="text"
                class="form-control form-control-sm text-end"
                disabled
              />
            </div>
          </div>

          <!-- fecha -->
          <div class="application-field">
            <small class="label-small"> fecha</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text">
                <i class="far fa-calendar"></i
              ></span>
              <flat-pickr
                class="form-control fs-sm"
                placeholder="Y-m-d"
                disabled
              />
            </div>
          </div>

          <!-- monto original -->
          <div class="application-field">
            <small class="label-small"> monto original </small>
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="fa fa-dollar"></i></span>
              <input
                type="text"
                class="form-control form-control-sm text-end"
                disabled
              />
            </div>
          </div>

          <!-- saldo pendiente -->
          <div class="application-field">
            <small class="label-small">Saldo Pendiente</small>
            <div class="input-group input-group-sm">
              <span class="input-group-text"><i class="fa fa-dollar"></i></span>
              <input
                type="text"
                class="form-control form-control-sm text-end"
                disabled
              />
            </div>
          </div>

          <div class="application-action">
            <button
              type="button"
              class="btn btn-outline-primary btn-sm application-apply-button"
            >
              <i class="fa fa-check"></i>
              Aplicar
            </button>
          </div>
        </div>
      </div>
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
  grid-template-columns:
    minmax(10rem, 1.2fr) minmax(8rem, 1.2fr) minmax(9rem, 1fr)
    minmax(7rem, 0.8fr) minmax(7rem, 0.8fr) minmax(7.5rem, auto);
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
  .application-summary-grid {
    grid-template-columns: 1fr;
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
