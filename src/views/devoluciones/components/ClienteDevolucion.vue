<script setup>
defineProps({
  cliente: { type: Object, required: true },
  loadingDownloadExcel: { type: Boolean, default: false },
  loadingDownloadPdf: { type: Boolean, default: false },
  refreshing: { type: Boolean, default: false },
});
defineEmits(["download-excel", "download-pdf", "refresh"]);
</script>

<template>
  <BaseBlock class="mt-3" content-class="py-3">
    <div class="client-summary-header">
      <div class="client-identity">
        <div class="client-name">{{ cliente.CLI_RAZON_SOCIAL }}</div>
        <div class="client-meta">
          <span>RUC <strong>{{ cliente.CLI_RUC }}</strong></span>
          <span class="badge rounded-pill" :class="cliente.suspendido == 1 ? 'bg-danger-light text-danger' : 'bg-success-light text-success'">
            Suspendido: {{ cliente.suspendido == 1 ? 'Sí' : 'No' }}
          </span>
        </div>
      </div>
      <div class="client-actions">
          <button type="button" class="client-action-button client-action-excel"
              title="Descargar estado de cuenta en Excel" aria-label="Descargar estado de cuenta en Excel"
              @click="$emit('download-excel')" :disabled="loadingDownloadExcel">
              <span class="client-action-icon">
                  <span v-if="loadingDownloadExcel" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="fa fa-file-excel"></i>
              </span>
              <span class="client-action-label">
                  <span>{{ loadingDownloadExcel ? 'Generando...' : 'Excel' }}</span>
                  <small>Estado cuenta</small>
              </span>
          </button>

          <button type="button" class="client-action-button client-action-pdf"
              title="Descargar estado de cuenta en PDF" aria-label="Descargar estado de cuenta en PDF"
              @click="$emit('download-pdf')" :disabled="loadingDownloadPdf">
              <span class="client-action-icon">
                  <span v-if="loadingDownloadPdf" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="fa fa-print"></i>
              </span>
              <span class="client-action-label">
                  <span>{{ loadingDownloadPdf ? 'Generando...' : 'PDF' }}</span>
                  <small>Estado cuenta</small>
              </span>
          </button>

          <button type="button" class="client-action-button client-action-refresh"
              title="Actualizar pedidos y devoluciones" aria-label="Actualizar pedidos y devoluciones"
              @click="$emit('refresh')" :disabled="refreshing">
              <span class="client-action-icon">
                  <span v-if="refreshing" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="fa fa-arrows-rotate"></i>
              </span>
              <span class="client-action-label">
                  <span>{{ refreshing ? 'Actualizando...' : 'Actualizar' }}</span>
                  <small>Pedidos y devoluciones</small>
              </span>
          </button>
      </div>
    </div>
    <dl class="client-details">
      <div><dt>Ciudad / Provincia</dt><dd>{{ cliente.CLI_CIUDAD || '—' }} / {{ cliente.CLI_PROVINCIA || '—' }}</dd></div>
      <div><dt>Condición de pago</dt><dd>{{ cliente.CLI_CONDICION_PAGO || '—' }} <span v-if="cliente.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0" class="badge bg-info">{{ cliente.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} días de gracia</span></dd></div>
      <div><dt>Descuento comercial</dt><dd>{{ cliente.CLI_DSTO_COMERCIAL }}%</dd></div>
      <div><dt>Cupo asignado</dt><dd>$ {{ cliente.cupo_asignado }}</dd></div>
      <div><dt>Cupo disponible</dt><dd :class="parseFloat(cliente.cupo_disponible) < 0 ? 'text-danger' : 'text-success'">$ {{ cliente.cupo_disponible }}</dd></div>
    </dl>
  </BaseBlock>
</template>

<style scoped>
.client-summary-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: .75rem;
}

.client-identity { flex: 1 1 16rem; min-width: 0; }
.client-name { font-size: .95rem; font-weight: 700; line-height: 1.35; overflow-wrap: anywhere; }
.client-meta { display: flex; align-items: center; flex-wrap: wrap; gap: .6rem; margin-top: .25rem; font-size: .75rem; }
.client-meta strong { font-weight: 600; }
.client-details {
    display: grid;
    grid-template-columns: minmax(0, 1.3fr) minmax(0, 1.3fr) repeat(3, minmax(0, 1fr));
    gap: .625rem 1rem;
    margin: .75rem 0 0;
    padding-top: .625rem;
    border-top: 1px solid var(--bs-border-color, #e9ecef);
}
.client-details dt { font-size: .6875rem; font-weight: 500; opacity: .7; margin-bottom: .125rem; }
.client-details dd { margin: 0; font-size: .8125rem; font-weight: 600; overflow-wrap: anywhere; }

@media (max-width: 991.98px) {
    .client-details { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 575.98px) {
    .client-details { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

.client-actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(6.25rem, 1fr));
    gap: .35rem;
    min-width: min(100%, 22rem);
}

.client-action-button {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    min-height: 2.15rem;
    padding: .3rem .45rem;
    border: 1px solid var(--tuval-border, var(--bs-border-color));
    border-radius: var(--tuval-radius-md, 8px);
    background: var(--bs-body-bg);
    color: var(--tuval-text, var(--bs-body-color));
    line-height: 1.1;
    text-align: left;
    transition: border-color .15s ease, box-shadow .15s ease, background-color .15s ease;
}

.client-action-button:hover:not(:disabled) {
    border-color: rgba(var(--bs-primary-rgb), .35);
    background: rgba(var(--bs-primary-rgb), .04);
    box-shadow: 0 .25rem .75rem rgba(0, 0, 0, .04);
}

.client-action-button:focus {
    outline: 0;
    box-shadow: 0 0 0 .15rem rgba(var(--bs-primary-rgb), .18);
}

.client-action-button:disabled {
    cursor: not-allowed;
    opacity: .72;
}

.client-action-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 1.55rem;
    width: 1.55rem;
    height: 1.55rem;
    border-radius: 8px;
    font-size: .78rem;
}

.client-action-label {
    display: flex;
    flex-direction: column;
    min-width: 0;
    font-size: .7rem;
    font-weight: 800;
    text-transform: uppercase;
}

.client-action-label small {
    margin-top: .08rem;
    color: var(--tuval-text-muted, var(--bs-secondary-color));
    font-size: .6rem;
    font-weight: 700;
    text-transform: none;
    overflow-wrap: anywhere;
}

.client-action-excel .client-action-icon {
    color: var(--bs-success);
    background: rgba(var(--bs-success-rgb), .1);
}

.client-action-pdf .client-action-icon {
    color: var(--bs-primary);
    background: rgba(var(--bs-primary-rgb), .1);
}

.client-action-refresh .client-action-icon {
    color: var(--bs-warning);
    background: rgba(var(--bs-warning-rgb), .14);
}

@media (max-width: 1199.98px) {
    .client-actions {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        width: 100%;
    }
}

@media (max-width: 575.98px) {
    .client-actions {
        grid-template-columns: repeat(3, minmax(0, 1fr));
        min-width: 0;
    }
}
</style>
