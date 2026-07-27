<script setup>
import { formatPriceJm } from '@/functions';
import { computed } from 'vue';
import { useInvoiceCollectionActions } from '@/composables/cobranzas/cobros-facturas/useInvoiceCollectionActions';
import { swalError, swalSuccess, swalWarning } from '@/functions/swal-alert';
const {
    //download pdf 
    loadingDownloadPdf,
    printPdfStatusAccountClient,

    //download excel
    loadingDownloadExcel,
    printExcelStatusAccountClient

} = useInvoiceCollectionActions();
const emit = defineEmits(["refresh-info"]);

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    client: {
        type: [Object, Array],
        default: null
    },
    segment: {
        type: [Object, Array],
        default: null
    },
    loadingInfo: {
        type: Boolean,
        default: false
    }
});

const infoClient = computed(() => props.client);
async function printAccountStatementExcel() {
    const resp = await printExcelStatusAccountClient(infoClient.value.id);
    if (!resp?.ok) {
        const msg = resp?.message || "Opps! No se pudo generar el archivo Excel";
        (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
        return;
    }
    swalSuccess(resp?.message || 'Excel Generado exitosamente');
}

async function printAccountStatementPdf() {
    const resp = await printPdfStatusAccountClient(infoClient.value.id);
    if (!resp?.ok) {
        const msg = resp?.message || "Opps! No se pudo generar el archivo Pdf";
        (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
        return;
    }
    swalSuccess(resp?.message || 'Pdf Generado exitosamente');

}

async function refreshCollection() {
    emit("refresh-info", infoClient.value);
}
</script>

<template>
    <div class="mt-3">
        <div v-if="loading" class="text-center py-3">
            <div class="spinner-border text-primary spinner-border-sm" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>

            <div class="fs-sm text-muted mt-2">
                Obteniendo información del cliente...
            </div>
        </div>

        <div v-else-if="client">
            <section class="cobro-client-header">
                <div class="d-flex flex-column flex-xl-row justify-content-between gap-3">
                    <div class="d-flex align-items-start gap-3">
                        <div class="client-avatar">
                            <i class="fa fa-building"></i>
                        </div>
                        <div class="min-w-0">
                            <div class="d-flex flex-wrap align-items-center gap-2 mb-1">
                                <h2 class="h4 mb-0 text-break">{{ client.CLI_RAZON_SOCIAL }}</h2>
                                <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                                    :class="client.CLI_ESTADO == 'ACTIVO' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'">
                                    {{ client.CLI_ESTADO == 'ACTIVO' ? 'ACTIVO' : 'INACTIVO' }}
                                </span>
                            </div>
                            <div class="client-meta text-muted fs-sm">
                                <span><i class="fa fa-id-card me-1"></i>{{ client.CLI_RUC }}</span>
                                <span><i class="fa fa-location-dot me-1"></i>{{ client.CLI_CIUDAD }} / {{
                                    client.CLI_PROVINCIA }}</span>
                                <span><i class="fa fa-file-signature me-1"></i>{{ client.CLI_CONDICION_PAGO }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="client-actions">
                        <button type="button" class="client-action-button client-action-excel"
                            title="Descargar estado de cuenta en Excel" aria-label="Descargar estado de cuenta en Excel"
                            @click="printAccountStatementExcel()" :disabled="loadingDownloadExcel">
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
                            @click="printAccountStatementPdf()" :disabled="loadingDownloadPdf">
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
                            @click="refreshCollection()" :disabled="loadingInfo">
                            <span class="client-action-icon">
                                <span v-if="loadingInfo" class="spinner-border spinner-border-sm"></span>
                                <i v-else class="fa fa-arrows-rotate"></i>
                            </span>
                            <span class="client-action-label">
                                <span>{{ loadingInfo ? 'Actualizando...' : 'Actualizar' }}</span>
                                <small>Datos de cobro</small>
                            </span>
                        </button>
                    </div>
                </div>
                <div class="row g-2 mt-3 client-metrics-row">
                    <div class="col-md-3">

                        <div class="cobro-metric cobro-status-metric" :class="client.suspendido == 1
                            ? 'cobro-status-suspended'
                            : 'cobro-status-active'">
                            <div class="d-flex align-items-center gap-3">
                                <div class="status-icon">
                                    <i class="fa" :class="client.suspendido == 1
                                        ? 'fa-user-lock'
                                        : 'fa-circle-check'"></i>
                                </div>

                                <div>
                                    <span class="metric-label d-block mb-1">
                                        Suspendido
                                    </span>

                                    <strong class="status-value">
                                        {{ client.suspendido == 1
                                            ? 'SI'
                                            : 'NO' }}
                                    </strong>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="cobro-metric">
                            <span class="metric-label">Cupo disponible</span>
                            <strong class="metric-value"
                                :class="parseFloat(client.cupo_disponible) < 0 ? 'text-danger' : 'text-success'">
                                ${{ formatPriceJm(client.cupo_disponible) }}
                            </strong>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="cobro-metric">
                            <span class="metric-label">Cupo asignado</span>
                            <strong class="metric-value">${{ formatPriceJm(client.cupo_asignado) }}</strong>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="cobro-metric">
                            <span class="metric-label">Descuento comercial</span>
                            <strong class="metric-value">{{ client.CLI_DSTO_COMERCIAL }}%</strong>
                            <span class="metric-note" v-if="client.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0">
                                {{ client.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} dias de gracia
                            </span>
                        </div>
                    </div>
                </div>
            </section>

        </div>

        <div v-else class="alert alert-warning mb-0">
            <i class="fa fa-triangle-exclamation me-1"></i>
            No se pudo obtener la información del cliente.
        </div>
    </div>
</template>

<style lang="css" scoped>
.min-w-0 {
    min-width: 0;
}


.cobro-client-header {
    padding: 0.75rem;
    border: 1px solid var(--tuval-border, var(--bs-border-color));
    border-radius: var(--tuval-radius-md, 8px);
}

.cobro-client-header h2 {
    font-size: 1rem;
    line-height: 1.2;
}

.cobro-client-header .rounded-pill {
    padding: 0.15rem 0.55rem !important;
    font-size: 0.62rem;
}

.cobro-client-header > .d-flex {
    gap: 0.65rem !important;
}

.cobro-client-header .row.mt-3 {
    margin-top: 0.55rem !important;
}

.client-avatar {
    display: grid;
    flex: 0 0 auto;
    width: 2.25rem;
    height: 2.25rem;
    place-items: center;
    border-radius: var(--tuval-radius-md, 8px);
    color: var(--tuval-primary, var(--bs-primary));
    font-size: 0.85rem;
}

.client-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem 0.75rem;
    font-size: 0.72rem;
}

.client-meta span {
    display: inline-flex;
    align-items: center;
    min-width: 0;
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

.cobro-metric {
    display: flex;
    width: 100%;
    height: 100%;
    min-height: 2.65rem;
    flex-direction: column;
    justify-content: center;
    padding: 0.45rem 0.6rem;
    border: 1px solid var(--tuval-border, var(--bs-border-color));
    border-radius: var(--tuval-radius-md, 8px);
    background: var(--tuval-surface-muted, var(--bs-light));
}

.metric-label {
    margin-bottom: 0.12rem;
    color: var(--tuval-text-muted, var(--bs-secondary-color));
    font-size: 0.62rem;
    font-weight: 700;
    text-transform: uppercase;
}

.metric-value {
    color: var(--tuval-text, var(--bs-body-color));
    font-size: 0.95rem;
    font-weight: 800;
    line-height: 1.25;
    overflow-wrap: anywhere;
}

.metric-note {
    margin-top: 0.12rem;
    color: var(--tuval-text-muted, var(--bs-secondary-color));
    font-size: 0.65rem;
}

.client-metrics-row > [class*="col-"] {
    display: flex;
}

.cobro-status-metric {
    position: relative;
    padding-left: 2.35rem;
}

.cobro-status-metric .d-flex {
    display: block !important;
    gap: 0.5rem !important;
}

.cobro-status-metric .metric-label {
    margin-bottom: 0.12rem !important;
}

.status-icon {
    position: absolute;
    top: 50%;
    left: 0.65rem;
    transform: translateY(-50%);
    width: 1.1rem;
    text-align: center;
    font-size: 0.85rem;
}

.status-value {
    display: block;
    font-weight: 800;
    font-size: 0.95rem;
    line-height: 1.25;
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
