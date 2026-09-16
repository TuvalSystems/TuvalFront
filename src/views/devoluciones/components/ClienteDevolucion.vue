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
  <BaseBlock title="Cliente" class="mt-4" content-class="pb-2">
    <div class="table-responsive">
      <table class="table table-striped table-sm table-vcenter">
        <tbody>
          <tr>
            <th class="fs-sm">RUC</th>
            <td class="fs-sm">{{ cliente.CLI_RUC }}</td>
            <th class="fs-sm">Razón Social</th>
            <td class="fs-sm">
              {{ cliente.CLI_RAZON_SOCIAL }}
            </td>
            <th class="fs-sm">Descuento Comercial</th>
            <td class="fs-sm">{{ cliente.CLI_DSTO_COMERCIAL }}%</td>
          </tr>
          <tr>
            <th class="fs-sm">Ciudad</th>
            <td class="fs-sm">
              {{ cliente.CLI_CIUDAD }}
            </td>

            <th class="fs-sm">Provincia</th>
            <td class="fs-sm">
              {{ cliente.CLI_PROVINCIA }}
            </td>

            <th class="fs-sm">Condición de pago</th>
            <td class="fs-sm">
              {{ cliente.CLI_CONDICION_PAGO }}
              <span
                class="badge bg-info"
                v-if="cliente.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0"
                >{{ cliente.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} días de
                gracia</span
              >
            </td>
          </tr>
          <tr>
            <th class="fs-sm">Suspendido</th>
            <td class="fs-sm">
              <span
                class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                :class="
                  cliente.suspendido == 0
                    ? 'bg-success-light text-success'
                    : 'bg-danger-light text-danger'
                "
                >{{ cliente.suspendido == 1 ? "Si" : "No" }}</span
              >
            </td>
            <th class="fs-sm">Cupo Asignado</th>
            <td class="fs-sm">${{ cliente.cupo_asignado }}</td>
            <th class="fs-sm">Cupo Disponible</th>
            <td
              class="fs-sm"
              :class="
                parseFloat(cliente.cupo_disponible) < 0 ? 'text-danger' : ''
              "
            >
              ${{ cliente.cupo_disponible }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="d-flex justify-content-end mb-2">
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
              title="Actualizar informacion del cliente" aria-label="Actualizar informacion del cliente"
              @click="$emit('refresh')" :disabled="refreshing">
              <span class="client-action-icon">
                  <span v-if="refreshing" class="spinner-border spinner-border-sm"></span>
                  <i v-else class="fa fa-arrows-rotate"></i>
              </span>
              <span class="client-action-label">
                  <span>{{ refreshing ? 'Actualizando...' : 'Actualizar' }}</span>
                  <small>Datos del cliente</small>
              </span>
          </button>
      </div>
    </div>
  </BaseBlock>
</template>

<style scoped>
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
    white-space: nowrap;
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
        grid-template-columns: 1fr;
    }
}
</style>
