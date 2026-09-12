<script setup>
import { computed } from 'vue';
import { formatPrice } from '@/functions';

const emit = defineEmits([
  'closeModal',
  'applyRecommendations',
]);

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
  processing: {
    type: Boolean,
    default: false,
  },
});

const excessItems = computed(() => {
  return props.items.filter((item) => item.hasExcess);
});

const doubleApplyItems = computed(() => {
  return props.items.filter((item) => item.hasDoubleApply);
});

const totalExcess = computed(() => {
  return excessItems.value.reduce((total, item) => {
    return total + Number(item.excessValue ?? 0);
  }, 0);
});

const hasDoubleApply = computed(() => {
  return doubleApplyItems.value.length > 0;
});

const hasExcess = computed(() => {
  return excessItems.value.length > 0;
});

const alertTitle = computed(() => {
  if (hasExcess.value && hasDoubleApply.value) {
    return 'Existen facturas con excedente y aplicaciones duplicadas.';
  }

  if (hasDoubleApply.value) {
    return 'Existen aplicaciones de cobro duplicadas.';
  }

  return 'Existen facturas con valores aplicados mayores al saldo disponible.';
});

const alertMessage = computed(() => {
  if (hasExcess.value && hasDoubleApply.value) {
    return 'Se aplicarán los valores recomendados y se eliminarán las aplicaciones duplicadas con recomendado en cero.';
  }

  if (hasDoubleApply.value) {
    return 'Las aplicaciones duplicadas serán removidas de la factura porque el valor recomendado es cero.';
  }

  return 'Puedes aplicar el valor recomendado para continuar con el registro del cobro.';
});

function cerrarModal() {
  emit('closeModal');
}

function aplicarRecomendados() {
  emit('applyRecommendations');
}




function hasDevolutions(item) {
  return Array.isArray(item?.row?.devoluciones_info)
    && item.row.devoluciones_info.length > 0;
}

function getIssueLabel(item) {
  if (item.hasDoubleApply && item.hasExcess) {
    return 'Doble aplicación + excedente';
  }

  if (item.hasDoubleApply) {
    return 'Doble aplicación';
  }

  return 'Excedente';
}

function getIssueBadgeClass(item) {
  if (item.hasDoubleApply && item.hasExcess) {
    return 'bg-danger';
  }

  if (item.hasDoubleApply) {
    return 'bg-danger';
  }

  return 'bg-warning text-dark';
}
</script>

<template>
  <BaseBlock title="Validación de montos aplicados" class="mb-0" transparent>
    <template #options>
      <button type="button" class="btn-block-option" aria-label="Close" @click="cerrarModal">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>

    <div class="block-content block-content-full">
      <div class="alert alert-warning validation-alert mb-3">
        <div class="d-flex align-items-start gap-2">
          <i class="fa fa-triangle-exclamation mt-1"></i>

          <div>
            <div class="fw-bold">
              {{ alertTitle }}
            </div>

            <div class="fs-xs mt-1">
              {{ alertMessage }}
            </div>
          </div>
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-md-3">
          <div class="summary-card">
            <small>Total novedades</small>
            <div class="summary-value text-warning">
              {{ items.length }}
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="summary-card">
            <small>Excedentes</small>
            <div class="summary-value text-danger">
              {{ excessItems.length }}
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="summary-card">
            <small>Doble aplicación</small>
            <div class="summary-value text-danger">
              {{ doubleApplyItems.length }}
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="summary-card">
            <small>Total excedente</small>
            <div class="summary-value text-danger">
              ${{ formatPrice(totalExcess) }}
            </div>
          </div>
        </div>
      </div>

      <div class="table-responsive excess-table-wrapper">
        <table class="table table-bordered align-middle mb-0 validation-table">
          <thead>
            <tr class="table-active">
              <th class="type-col">Tipo</th>
              <th class="issue-col">Novedad</th>
              <th class="invoice-col">Factura</th>
              <th class="devolutions-col">Detalle</th>
              <th class="amount-col text-end">Valor ingresado</th>
              <th class="amount-col text-end">Saldo disponible</th>
              <th class="amount-col text-end">Excedente</th>
              <th class="amount-col text-end">Recomendado</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(item, index) in items" :key="index">
              <td>
                <span class="badge bg-body-secondary text-muted border payment-badge">
                  {{ item.label }}
                </span>
              </td>

              <td>
                <span class="badge" :class="getIssueBadgeClass(item)">
                  {{ getIssueLabel(item) }}
                </span>
              </td>

              <td class="fw-semibold invoice-cell">
                {{ item.invoice }}
              </td>

              <td class="devolutions-cell">
                <div class="detail-stack">
                  <template v-if="item.hasDoubleApply">
                    <div class="devolution-item double-apply-item">
                      <i class="fa fa-ban mt-1"></i>
                      <span>
                        {{ item.validationMessage || 'Este documento de cobro ya fue aplicado a la factura.' }}
                      </span>
                    </div>
                  </template>

                  <template v-if="hasDevolutions(item)">
                    <div>
                      <div class="detail-section-title">
                        NC / Devoluciones no contabilizadas
                      </div>

                      <div class="devolutions-list">
                        <div v-for="(dev, devIndex) in item.row.devoluciones_info" :key="devIndex"
                          class="devolution-item">
                          <i class="fa fa-file-invoice-dollar mt-1"></i>
                          <span>{{ dev }}</span>
                        </div>
                      </div>
                    </div>
                  </template>

                  <span v-else-if="!item.hasDoubleApply" class="text-muted fst-italic">
                    Sin devoluciones pendientes
                  </span>

                  <span v-else class="text-muted fst-italic fs-xs">
                    Sin devoluciones pendientes adicionales.
                  </span>
                </div>
              </td>

              <td class="text-end amount-cell">
                ${{ formatPrice(item.enteredAmount) }}
              </td>

              <td class="text-end amount-cell">
                ${{ formatPrice(item.saldoDisponible) }}
              </td>

              <td class="text-end amount-cell text-danger fw-bold">
                ${{ formatPrice(item.excessValue) }}
              </td>

              <td class="text-end amount-cell fw-bold"
                :class="item.priceRecommend <= 0 ? 'text-danger' : 'text-success'">
                ${{ formatPrice(item.priceRecommend) }}
              </td>
            </tr>

            <tr v-if="items.length === 0">
              <td colspan="8" class="text-center text-muted py-4">
                No existen novedades pendientes.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </BaseBlock>

  <div class="content text-end mb-4 space-x-2 modal-actions">
    <button type="button" class="btn btn-alt-secondary btn-sm" :disabled="processing" @click="cerrarModal">
      Revisar manualmente
    </button>

    <button type="button" class="btn btn-sm btn-success" :disabled="items.length === 0 || processing"
      @click="aplicarRecomendados">
      <i class="fa fa-check me-1"></i>
      {{ processing ? 'Procesando...' : 'Aplicar recomendados y registrar' }}
    </button>
  </div>
</template>

<style scoped>
.fs-xs {
  font-size: 11px;
}

.validation-alert {
  border: 0;
  border-radius: 8px;
  padding: 14px 16px;
}

.summary-card {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  padding: 12px 14px;
  min-height: 72px;
}

.summary-card small {
  display: block;
  color: #8f9bad;
  text-transform: uppercase;
  font-weight: 700;
  font-size: 9px;
  letter-spacing: 0.03em;
  margin-bottom: 6px;
}

.summary-value {
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
}

.excess-table-wrapper {
  max-height: 360px;
  overflow-y: auto;
  border-radius: 6px;
}

.validation-table th {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  vertical-align: middle;
  white-space: nowrap;
  padding: 12px 14px;
}

.validation-table td {
  vertical-align: middle;
  padding: 12px 14px;
}

.type-col {
  width: 120px;
  min-width: 120px;
}

.invoice-col {
  width: 150px;
  min-width: 150px;
}

.devolutions-col {
  width: 400px;
  min-width: 400px;
}

.amount-col {
  width: 120px;
  min-width: 100px;
}

.invoice-cell {
  white-space: nowrap;
  font-size: 13px;
  letter-spacing: 0.02em;
}

.amount-cell {
  white-space: nowrap;
  font-size: 13px;
}

.devolutions-cell {
  min-width: 360px;
  max-width: 480px;
  white-space: normal;
}

.devolutions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.devolution-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f5f7fb;
  border: 1px solid #dbe3f0;
  color: #44546a;
  font-size: 11px;
  line-height: 1.4;
}

.issue-col {
  width: 140px;
  min-width: 140px;
}

.double-apply-item {
  background: #fff5f5;
  border-color: #f3b8b8;
  color: #9f2424;
}

.detail-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-section-title {
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6c757d;
  margin-bottom: 6px;
}

.double-apply-item+div {
  margin-top: 2px;
}
</style>