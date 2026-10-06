<script setup>
import { formatPriceJm, toNum } from '@/functions';
import { swalInfo, swalWarning, swalError, swalSuccess } from '@/functions/swal-alert';
import { onMounted, computed, watch, ref } from 'vue';
import { useCreditOrdersActions } from '@/composables/aprobaciones/pedidos/useCreditOrdersActions';
import { useApprovalOrder } from '@/composables/aprobaciones/pedidos/useApprovalOrder';

const emit = defineEmits(["closeModal", "refresh"]);

const props = defineProps({
  info: {
    type: Object,
    required: true,
    default: () => ({
      pedido: {},
      cupoDisponible: {},
      documentosVencidos: [],
      documentosSinSoporte: [],
      pendiente_aprobacion_comercial: false,
      cliente : {}
    }),
  }
});


const {
  //process
  approveCreditOrder,
  rejectCreditOrder,
  rejectCreditOrderForStock
} = useCreditOrdersActions();

const {
  validateStockForOrderApproval
} = useApprovalOrder();
async function closeModalEvent() {
  emit('closeModal');
}


const orderHeader = computed(() => props.info?.pedido ?? {});
const availableCredit = computed(() => props.info?.cupoDisponible ?? {});
const expiredDocuments = computed(() => props.info?.documentosVencidos ?? []);
const unsupportedDocuments = computed(() => props.info?.documentosSinSoporte ?? []);
const customer = computed(() => props.info?.cliente ?? {});
const isPendingCommercialApproval = computed(() => {
  return Boolean(props.info?.pendiente_aprobacion_comercial);
});

const approvalMessage = ref("");
watch(
  () => orderHeader.value?.aprobado_crediticio_mensaje,
  (value) => {
    approvalMessage.value = value ?? "";
  },
  { immediate: true }
);


const hasAvailableCredit = computed(() => {
  return availableCredit.value && Object.keys(availableCredit.value).length > 0;
});


const isCreditExceeded = computed(() => {
  if (!hasAvailableCredit.value) return false;

  return toNum(orderHeader.value?.total) > toNum(availableCredit.value?.cupoDisponibleGp);
});

function showCreditExceededMessage() {
  swalInfo("Validación de cupo", "El total del pedido supera el cupo disponible.");
}


async function approveOrder() {
  const resp = await validateStockForOrderApproval(orderHeader.value?.id);
  if (!resp?.ok) {
    const respRejection = await rejectCreditOrderForStock(orderHeader.value?.id, resp?.message)
    swalWarning(respRejection?.message);
    await closeModalEvent();
    emit('refresh');
    return;
  }

  const respApproval = await approveCreditOrder(orderHeader.value?.id, approvalMessage.value);
  if (respApproval?.ok) {
    swalSuccess(respApproval?.message);
    await closeModalEvent();
    emit('refresh');

    return;
  }
  const msg = resp?.message || "Opps! Ocurrio un problema al momento de aprobar el pedido";
  (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);

}

async function rejectOrder() {
  const resp = await rejectCreditOrder(orderHeader.value?.id, approvalMessage.value);
  if (resp?.ok) {
    swalSuccess(resp?.message);
    await closeModalEvent();
    emit('refresh');
    return;
  }
  const msg = resp?.message || "No se pudo actualizar el acceso a la App móvil";
  (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}


onMounted(() => { });
</script>

<template>
  <BaseBlock title="Pedido por Aprobar" class="mb-0" transparent>
    <template #options>
      <button type="button" class="btn-block-option" aria-label="Close" @click="closeModalEvent">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content fs-sm m-0 mb-2">
        <div class="order-header-grid">
          <div class="order-header-item">
            <div class="kv">
              <small class="label-small">pedido</small>
              <div class="fw-semibold">{{ orderHeader.pedido }}</div>
            </div>
          </div>
          <div class="order-header-item">
            <div class="kv">
              <small class="label-small">ruc</small>
              <div class="fw-semibold">{{ orderHeader.CLI_RUC }}</div>
            </div>
          </div>
          <div class="order-header-item">
            <div class="kv">
              <small class="label-small">razón social</small>
              <div class="fw-semibold">{{ orderHeader.CLI_RAZON_SOCIAL }}</div>
            </div>
          </div>
          <div class="order-header-item">
            <div class="kv">
              <small class="label-small">P. venta</small>
              <div class="fw-semibold">{{ orderHeader.PTO_VTA_DESCRIPCION }}</div>
            </div>
          </div>
          <div class="order-header-item">
            <div class="kv">
              <small class="label-small">cond. pago</small>
              <div class="fw-semibold">
                <span>
                  {{ orderHeader.COND_ID }}
                </span>
              </div>
            </div>
          </div>
           <div class="order-header-item">
            <div class="kv">
              <small class="label-small">días de gracia</small>
              <div class="fw-semibold text-center">
                <span>
                {{ customer?.CLI_DIA_GRACIA_CHEQUE_A_FECHA }}
                </span>
              </div>
            </div>
          </div>
          <div class="order-header-item">
            <div class="kv">
              <small class="label-small">usuario</small>
              <div class="fw-semibold">{{ orderHeader.USERID }}</div>
            </div>
          </div>
          <div class="order-header-item">
            <div class="kv">
              <small class="label-small">Origen</small>
              <div class="fw-semibold">
                <span :class="[
                  'badge rounded-pill fw-semibold d-inline-block py-1 px-2 fs-xs ',
                  {
                    'bg-info-light text-info': orderHeader.origen === 'cotizacion',
                    'bg-warning-light text-warning': orderHeader.origen === 'reserva',
                    'bg-success-light text-success': orderHeader.origen === 'factura_demanda',
                    'bg-light text-primary': orderHeader.origen === 'facturar_existente',
                    'bg-light text-danger': orderHeader.origen === 'devolucion',
                    'bg-info-light text-warning': orderHeader.origen === 'app_movil',
                  }
                ]">
                  {{
                    orderHeader.origen === 'factura_demanda' ? 'Factura Demanda' :
                      orderHeader.origen === 'facturar_existente' ? 'Factura Existente' :
                        orderHeader.origen === 'devolucion' ? 'Refacturación' :
                          orderHeader.origen === 'app_movil' ? 'App Móvil' :
                            orderHeader.origen
                  }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="orderHeader.nota_interna" class="order-header-note">
            <div class="alert alert-danger py-2 mb-0">
              <div class="fw-bold text-uppercase small mb-1">
                Nota interna
              </div>
              <div>{{ orderHeader.nota_interna }}</div>
            </div>
          </div>
        </div>
        <!-- resumen -->
        <div class="order-summary-inline mb-2">
          <div class="summary-inline-item">
            <span class="summary-inline-label">Subtotal</span>
            <strong class="summary-inline-value nums">
              ${{ formatPriceJm(orderHeader.subtotalmenosdescuento) }}
            </strong>
          </div>

          <div class="summary-inline-item">
            <span class="summary-inline-label">IVA</span>
            <strong class="summary-inline-value nums">
              ${{ formatPriceJm(orderHeader.iva) }}
            </strong>
          </div>

          <div class="summary-inline-item">
            <span class="summary-inline-label">Total</span>

            <a v-if="isCreditExceeded" href="javascript:void(0)" class="summary-inline-value summary-inline-danger nums"
              @click="showCreditExceededMessage">
              ${{ formatPriceJm(orderHeader.total) }}
            </a>

            <strong v-else class="summary-inline-value summary-inline-total nums">
              ${{ formatPriceJm(orderHeader.total) }}
            </strong>
          </div>
        </div>


        <!-- Cupo disponible -->
        <div v-if="hasAvailableCredit" class="credit-section-card mb-2">
          <div class="credit-section-header">
            <div>
              <div class="credit-section-title">
                Cupo disponible
              </div>
              <div class="credit-section-subtitle">
                Validación del cupo asignado al cliente
              </div>
            </div>

            <span class="badge rounded-pill border fw-semibold" :class="isCreditExceeded
              ? 'bg-danger-subtle text-danger border-danger-subtle'
              : 'bg-success-subtle text-success border-success-subtle'">
              <i class="me-1" :class="isCreditExceeded ? 'fa fa-triangle-exclamation' : 'fa fa-check'"></i>
              {{ isCreditExceeded ? 'Cupo insuficiente' : 'Cupo válido' }}
            </span>
          </div>

          <div class="credit-metrics-grid">
            <div class="credit-metric">
              <span class="credit-metric-label">Cupo asignado</span>
              <strong class="credit-metric-value nums">
                ${{ formatPriceJm(availableCredit.cupoAsignado) }}
              </strong>
            </div>

            <div class="credit-metric" :class="{ 'credit-metric-danger': isCreditExceeded }">
              <span class="credit-metric-label">Cupo disponible GP</span>

              <a v-if="isCreditExceeded" href="javascript:void(0)" class="credit-metric-value credit-link-danger nums"
                @click="showCreditExceededMessage">
                ${{ formatPriceJm(availableCredit.cupoDisponibleGp) }}
              </a>

              <strong v-else class="credit-metric-value nums">
                ${{ formatPriceJm(availableCredit.cupoDisponibleGp) }}
              </strong>
            </div>

            <div class="credit-metric">
              <span class="credit-metric-label">Cliente suspendido</span>

              <span class="badge rounded-pill fw-semibold border align-self-start" :class="availableCredit.suspendido
                ? 'bg-danger-subtle text-danger border-danger-subtle'
                : 'bg-success-subtle text-success border-success-subtle'">
                {{ availableCredit.suspendido ? 'Sí' : 'No' }}
              </span>
            </div>
          </div>
        </div>


        <!-- Documentos vencidos -->
        <div class="credit-section-card mb-2">
          <div class="credit-section-header">
            <div>
              <div class="credit-section-title">
                Documentos vencidos
              </div>
              <div class="credit-section-subtitle">
                Facturas con saldo pendiente y días vencidos
              </div>
            </div>

            <span class="badge rounded-pill border fw-semibold" :class="expiredDocuments.length
              ? 'bg-danger-subtle text-danger border-danger-subtle'
              : 'bg-success-subtle text-success border-success-subtle'">
              {{ expiredDocuments.length }} documento(s)
            </span>
          </div>

          <div v-if="!expiredDocuments.length" class="credit-empty-state">
            <i class="fa fa-circle-check"></i>
            <span>No registra documentos vencidos.</span>
          </div>

          <div v-else class="table-responsive">
            <table class="table credit-table align-middle fs-sm mb-0">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th class="text-end">Saldo pendiente</th>
                  <th class="text-end">Días vencidos</th>
                  <th class="text-end">Fecha emisión</th>
                  <th class="text-end">Fecha vencimiento</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(document, index) in expiredDocuments" :key="index">
                  <td class="fw-semibold">
                    {{ document.factura }}
                  </td>

                  <td class="text-end nums fw-semibold text-danger">
                    ${{ formatPriceJm(document.pendienteGpMc) }}
                  </td>

                  <td class="text-end">
                    <span class="badge rounded-pill bg-warning-subtle text-warning border border-warning-subtle">
                      {{ document.diasVencidos }} día(s)
                    </span>
                  </td>

                  <td class="text-end text-muted">
                    {{ document.fEmision }}
                  </td>

                  <td class="text-end text-muted">
                    {{ document.fVencimiento }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Documentos sin soporte -->
        <div class="credit-section-card mb-2">
          <div class="credit-section-header">
            <div>
              <div class="credit-section-title">
                Documentos sin soporte
              </div>
              <div class="credit-section-subtitle">
                Documentos pendientes de respaldo o aplicación
              </div>
            </div>

            <span class="badge rounded-pill border fw-semibold" :class="unsupportedDocuments.length
              ? 'bg-warning-subtle text-warning border-warning-subtle'
              : 'bg-success-subtle text-success border-success-subtle'">
              {{ unsupportedDocuments.length }} documento(s)
            </span>
          </div>

          <div v-if="!unsupportedDocuments.length" class="credit-empty-state">
            <i class="fa fa-circle-check"></i>
            <span>No registra documentos sin soporte.</span>
          </div>

          <div v-else class="table-responsive">
            <table class="table credit-table align-middle fs-sm mb-0">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th class="text-end">Saldo pendiente</th>
                  <th class="text-end">Fecha emisión</th>
                  <th class="text-end">Fecha vencimiento</th>
                </tr>
              </thead>

              <tbody>
                <tr v-for="(document, index) in unsupportedDocuments" :key="index">
                  <td class="fw-semibold">
                    {{ document.factura }}
                  </td>

                  <td class="text-end nums fw-semibold text-warning">
                    ${{ formatPriceJm(document.saldoPendiente) }}
                  </td>

                  <td class="text-end text-muted">
                    {{ document.fEmision }}
                  </td>

                  <td class="text-end text-muted">
                    {{ document.fVencimiento }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      <div class="block-content block-content-full bg-body border-top">
        <div v-if="isPendingCommercialApproval" class="alert alert-warning d-flex align-items-center mb-0" role="alert">
          <i class="fa fa-triangle-exclamation me-2"></i>

          <div>
            <div class="fw-bold">
              Pedido pendiente de aprobación comercial
            </div>
            <div class="small">
              Este pedido aún requiere aprobación comercial. Primero debe ser aprobado comercialmente para
              continuar
              con la aprobación crediticia.
            </div>
          </div>
        </div>
        <div v-else class="row g-2 align-items-center">
          <label for="approval-message" class="col-sm-2 col-form-label text-sm-end fw-semibold">
            Mensaje:
          </label>
          <div class="col-sm-7">
            <input id="approval-message" v-model="approvalMessage" type="text" class="form-control form-control-sm"
              placeholder="Motivo de rechazo" />
          </div>
          <div class="col-sm-3 text-sm-end">
            <button type="button" class="btn btn-success btn-sm me-1" @click="approveOrder">
              <i class="fa fa-check me-1"></i>
              Aprobar
            </button>

            <button type="button" class="btn btn-danger btn-sm" @click="rejectOrder">
              <i class="fa fa-times me-1"></i>
              Rechazar
            </button>
          </div>
        </div>
      </div>
    </template>
  </BaseBlock>
</template>

<style lang="css" scoped>
.table-head-sticky th {
  position: sticky;
  top: 0;
  background: var(--tuval-surface, #fff);
  z-index: 1;
}

.kv small {
  display: block;
  line-height: 1;
}

.kv .badge {
  white-space: normal;
  text-align: left;
  display: inline-flex;
  align-items: center;
  line-height: 1.25;
  font-size: 12px;
  font-weight: 500;
}

.kv .fw-semibold {
  line-height: 1.2;
}

.order-header-grid {
  display: grid;
  grid-template-columns:
    minmax(76px, 0.8fr)
    minmax(105px, 0.95fr)
    minmax(180px, 1.7fr)
    minmax(145px, 1.25fr)
    minmax(78px, 0.75fr)
    minmax(66px, 0.7fr)
    minmax(86px, 0.5fr)
    minmax(108px, max-content);
  gap: 0.45rem 0.65rem;
  margin-bottom: 0.55rem;
}

.order-header-item,
.order-header-note {
  min-width: 0;
}

.order-header-item .fw-semibold {
  overflow-wrap: anywhere;
}

.order-header-note {
  grid-column: 1 / -1;
}

.text-monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

@media (min-width: 992px) {
  .table.table-sm> :not(caption)>*>* {
    padding-top: .35rem;
    padding-bottom: .35rem;
  }
}

.nums {
  font-variant-numeric: tabular-nums;
}

/* columnas numéricas alineadas */
.code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
}

.label-small {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #6c757d;
  margin-bottom: 0.2rem;
}


/* resumen */


/* estado de cuenta */
.credit-section-card {
  padding: 0.65rem;
  background: var(--tuval-surface, #fff);
  border: 1px solid var(--tuval-border, #e2e8f0);
  border-radius: var(--tuval-radius-lg, 0.5rem);
  box-shadow: var(--tuval-shadow-sm, 0 1px 2px rgba(15, 23, 42, 0.06));
}

.credit-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.55rem;
  padding-bottom: 0.45rem;
  margin-bottom: 0.45rem;
  border-bottom: 1px solid var(--tuval-border, #e2e8f0);
}

.credit-section-title {
  color: var(--tuval-text, #1e293b);
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.credit-section-subtitle {
  margin-top: 0.08rem;
  color: var(--tuval-text-muted, #64748b);
  font-size: 0.72rem;
}

.credit-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.5rem;
}

.credit-metric {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  min-height: 60px;
  padding: 0.55rem 0.6rem;
  background: var(--tuval-surface-muted, #f8fafc);
  border: 1px solid var(--tuval-border, #e2e8f0);
  border-radius: var(--tuval-radius-md, 0.5rem);
}

.credit-metric-danger {
  background: rgba(220, 38, 38, 0.06);
  border-color: rgba(220, 38, 38, 0.18);
}

.credit-metric-label {
  color: var(--tuval-text-muted, #64748b);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
}

.credit-metric-value {
  color: var(--tuval-text, #1e293b);
  font-size: 0.95rem;
  font-weight: 800;
  text-decoration: none;
}

.credit-link-danger {
  color: #dc2626;
}

.credit-link-danger:hover {
  text-decoration: underline;
}

.credit-table {
  --bs-table-border-color: var(--tuval-border, #e2e8f0);
  border-collapse: separate;
  border-spacing: 0;
}

.credit-table> :not(caption)>*>* {
  padding: 0.35rem 0.5rem;
}

.credit-table thead th {
  color: var(--tuval-text-muted, #64748b);
  background: var(--tuval-surface-muted, #f8fafc);
  border-bottom: 1px solid var(--tuval-border, #e2e8f0);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  white-space: nowrap;
}

.credit-table tbody td {
  border-bottom: 1px solid var(--tuval-border, #e2e8f0);
}

.credit-table .badge {
  padding: 0.2rem 0.45rem;
}

.credit-table tbody tr:last-child td {
  border-bottom: 0;
}

.credit-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0.65rem;
  color: var(--tuval-text-muted, #64748b);
  background: var(--tuval-surface-muted, #f8fafc);
  border: 1px dashed var(--tuval-border, #e2e8f0);
  border-radius: var(--tuval-radius-md, 0.5rem);
  font-weight: 600;
}

.credit-empty-state i {
  color: #16a34a;
}

@media (max-width: 1199.98px) {
  .order-header-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .order-header-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .credit-metrics-grid {
    grid-template-columns: 1fr;
  }

  .credit-section-header {
    flex-direction: column;
  }
}



/* resumen compacto */
.order-summary-inline {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  background: var(--tuval-surface, #fff);
  border: 1px solid var(--tuval-border, #e2e8f0);
  border-radius: var(--tuval-radius-lg, 0.5rem);
  box-shadow: var(--tuval-shadow-sm, 0 1px 2px rgba(15, 23, 42, 0.06));
}

.summary-inline-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.55rem;
  padding: 0.48rem 0.65rem;
}

.summary-inline-item+.summary-inline-item {
  border-left: 1px solid var(--tuval-border, #e2e8f0);
}

.summary-inline-label {
  color: var(--tuval-text-muted, #64748b);
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
}

.summary-inline-value {
  color: var(--tuval-text, #1e293b);
  font-size: 0.9rem;
  font-weight: 800;
  text-decoration: none;
}

.summary-inline-total {
  color: var(--tuval-primary-strong, #1d4ed8);
}

.summary-inline-danger {
  color: #dc2626;
}

.summary-inline-danger:hover {
  text-decoration: underline;
}

@media (max-width: 767.98px) {
  .order-summary-inline {
    grid-template-columns: 1fr;
  }

  .summary-inline-item+.summary-inline-item {
    border-left: 0;
    border-top: 1px solid var(--tuval-border, #e2e8f0);
  }
}

@media (max-width: 575.98px) {
  .order-header-grid {
    grid-template-columns: 1fr;
  }
}
</style>
