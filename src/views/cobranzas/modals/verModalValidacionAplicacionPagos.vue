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
});

const totalExcess = computed(() => {
  return props.items.reduce((total, item) => {
    return total + Number(item.excessValue ?? 0);
  }, 0);
});

function cerrarModal() {
  emit('closeModal');
}

function aplicarRecomendados() {
  emit('applyRecommendations');
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
              Existen facturas con valores aplicados mayores al saldo disponible.
            </div>

            <div class="fs-xs mt-1">
              Puedes aplicar el valor recomendado para continuar con el registro del cobro.
            </div>
          </div>
        </div>
      </div>

      <div class="row g-2 mb-3">
        <div class="col-md-4">
          <div class="summary-card">
            <small>Facturas con exceso</small>
            <div class="summary-value text-danger">
              {{ items.length }}
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="summary-card">
            <small>Total excedente</small>
            <div class="summary-value text-danger">
              ${{ formatPrice(totalExcess) }}
            </div>
          </div>
        </div>

        <div class="col-md-4">
          <div class="summary-card">
            <small>Acción sugerida</small>
            <div class="summary-value text-success">
              Aplicar recomendados
            </div>
          </div>
        </div>
      </div>

      <div class="table-responsive excess-table-wrapper">
        <table class="table table-bordered align-middle mb-0 validation-table">
          <thead>
            <tr class="table-active">
              <th class="type-col">Tipo</th>
              <th class="invoice-col">Factura</th>
              <th class="devolutions-col">NC No Contabilizadas</th>
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
              <td class="fw-semibold invoice-cell">
                {{ item.invoice }}
              </td>
              <td class="devolutions-cell">
                <template v-if="item.row.devoluciones_info?.length">
                  <div class="devolutions-list">
                    <div v-for="(dev, devIndex) in item.row.devoluciones_info" :key="devIndex" class="devolution-item">
                      <span>{{ dev }}</span>
                    </div>
                  </div>
                </template>

                <span v-else class="text-muted fst-italic">
                  Sin devoluciones
                </span>
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

              <td class="text-end amount-cell text-success fw-bold">
                ${{ formatPrice(item.priceRecommend) }}
              </td>
            </tr>

            <tr v-if="items.length === 0">
              <td colspan="6" class="text-center text-muted py-4">
                No existen excesos pendientes.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </BaseBlock>

  <div class="content text-end mb-4 space-x-2 modal-actions">
    <button type="button" class="btn btn-alt-secondary btn-sm" @click="cerrarModal">
      Revisar manualmente
    </button>

    <button type="button" class="btn btn-sm btn-success" :disabled="items.length === 0" @click="aplicarRecomendados">
      <i class="fa fa-check me-1"></i>
      Aplicar recomendados y registrar
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
</style>