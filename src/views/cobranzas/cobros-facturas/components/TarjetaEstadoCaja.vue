<script setup>
import { computed } from 'vue';
const props = defineProps({
    cashBox: {
        type: Object,
        required: true
    },
    loading: {
        type: Boolean,
        default: false,
    },
});
const emit = defineEmits(['open-cash-box']);
const cashBoxStatus = computed(() => props.cashBox?.estado ?? null);

const isOpen = computed(() => cashBoxStatus.value === 'abierto');
const isClosed = computed(() => cashBoxStatus.value === 'cerrado');
const hasMissingClosure = computed(() => cashBoxStatus.value === 'sin_cierre');

const statusLabel = computed(() => {
    const labels = {
        abierto: 'Abierto',
        cerrado: 'Cerrado',
        sin_cierre: 'Sin cierre'
    }
    return labels[cashBoxStatus.value] ?? 'Sin estado';
});
const statusClass = computed(() => {
    const classes = {
        abierto: 'bg-success-light text-success',
        cerrado: 'bg-danger-light text-danger',
        sin_cierre: 'bg-warning-light text-warning',
    };

    return classes[cashBoxStatus.value] ?? 'bg-secondary-light text-secondary';
});

const iconClass = computed(() => {
  const classes = {
    abierto: 'fa-circle-check text-success',
    cerrado: 'fa-lock text-danger',
    sin_cierre: 'fa-triangle-exclamation text-warning',
  };

  return classes[cashBoxStatus.value] ?? 'fa-circle-info text-secondary';
});

async function requestOpenCashBox() {
    emit('open-cash-box');
}

</script>

<template>
    <BaseBlock v-if="cashBox" class="pb-2"  rounded fxShadow>
        <div class="cash-box-card">
            <div class="d-flex justify-content-between align-items-center gap-2">
                <div class="d-flex align-items-center gap-2">
                    <div class="cash-box-icon">
                        <i :class="['fa', iconClass]"></i>
                    </div>

                    <div>
                        <div class="d-flex align-items-center gap-2">
                            <span class="fw-bold text-uppercase fs-sm">Caja</span>

                            <span :class="statusClass" class="fs-xs fw-semibold d-inline-block py-1 px-2 rounded-pill">
                                {{ statusLabel }}
                            </span>
                        </div>

                        <div class="text-muted fs-xs mt-1">
                            {{ cashBox.descripcion }}
                            <span v-if="cashBox.cajaCodigo">
                                · {{ cashBox.cajaCodigo }}
                            </span>
                        </div>
                    </div>
                </div>

                <button v-if="isClosed" type="button" class="btn btn-success btn-sm" :disabled="loading"
                    @click="requestOpenCashBox">
                    <i class="fa fa-cash-register me-1"></i>
                    {{ loading ? 'Abriendo...' : 'Abrir' }}
                </button>
            </div>

            <div v-if="hasMissingClosure" class="cash-box-warning mt-2">
                <div class="d-flex justify-content-between align-items-center gap-2">
                    <div class="fs-xs">
                        <i class="fa fa-triangle-exclamation me-1"></i>
                        La caja no se cerró en la última fecha registrada.
                    </div>

                    <router-link :to="{ name: 'cobranzas-cierre-caja' }" class="btn btn-warning btn-sm py-1">
                        Cerrar caja
                    </router-link>
                </div>
            </div>

            <div v-if="isOpen" class="cash-box-success mt-2 fs-xs">
                <i class="fa fa-circle-check me-1"></i>
                Caja abierta para registrar cobros.
            </div>
        </div>
    </BaseBlock>
</template>

<style lang="css" scoped>
.cash-box-card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 12px 14px;
    /* background: #fff; */
}

.cash-box-icon {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    /* background: #f4f6f8; */
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
}

.cash-box-warning {
    border: 1px solid #f6d7a8;
    background: #fff7e6;
    color: #8a4b00;
    border-radius: 8px;
    padding: 8px 10px;
}

.cash-box-success {
    border: 1px solid #bfe8ce;
    background: #ecfdf3;
    color: #198754;
    border-radius: 8px;
    padding: 7px 10px;
    font-weight: 600;
}
</style>
