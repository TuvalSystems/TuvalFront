<script setup>
import { formatPriceJm } from '@/functions';
import { computed } from 'vue';
import { onMounted } from 'vue';
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
    }
});

const infoClient = computed(() => props.client);
async function printAccountStatementExcel() {
    console.log(infoClient.value);

}

async function printAccountStatement() {
    console.log(infoClient.value);
}

onMounted(() => { });
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
                    <div class="client-actions d-flex flex-wrap gap-2 justify-content-xl-end">
                        <button class="btn btn-sm btn-alt-primary" @click="printAccountStatementExcel()">
                            <i class="fa fa-file-excel me-1"></i> Excel
                        </button>
                        <button class="btn btn-sm btn-alt-success" @click="printAccountStatement()">
                            <i class="fa fa-print me-1"></i> PDF
                        </button>
                        <!-- <button class="btn btn-sm btn-alt-warning" @click="selectcliente(client)">
                            <i class="fa fa-refresh me-1"></i> Actualizar
                        </button> -->
                    </div>
                </div>
                <div class="row g-2 mt-3">
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
    padding: 1.25rem;
    border: 1px solid var(--tuval-border, var(--bs-border-color));
    border-radius: var(--tuval-radius-md, 8px);
}

.client-avatar {
    display: grid;
    flex: 0 0 auto;
    width: 3rem;
    height: 3rem;
    place-items: center;
    border-radius: var(--tuval-radius-md, 8px);
    color: var(--tuval-primary, var(--bs-primary));
}

.client-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem 1.25rem;
}

.client-meta span {
    display: inline-flex;
    align-items: center;
    min-width: 0;
}

.client-actions .btn {
    min-height: 2.125rem;
}

.cobro-metric {
    display: flex;
    min-height: 3.5rem;
    flex-direction: column;
    justify-content: center;
    padding: 0.875rem 1rem;
    border: 1px solid var(--tuval-border, var(--bs-border-color));
    border-radius: var(--tuval-radius-md, 8px);
    background: var(--tuval-surface-muted, var(--bs-light));
}

.metric-label {
    margin-bottom: 0.25rem;
    color: var(--tuval-text-muted, var(--bs-secondary-color));
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
}

.metric-value {
    color: var(--tuval-text, var(--bs-body-color));
    font-size: 1.2rem;
    font-weight: 800;
    line-height: 1.25;
    overflow-wrap: anywhere;
}

.metric-note {
    margin-top: 0.25rem;
    color: var(--tuval-text-muted, var(--bs-secondary-color));
    font-size: 0.78rem;
}
</style>
