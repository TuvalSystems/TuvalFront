<script setup>
import { onMounted, computed, ref, watch } from 'vue';
import { useUnapplicationProcess } from '@/composables/cobranzas/desaplicaciones/useUnapplicationProcess';
import {
  swalSuccess,
  swalError,
  swalWarning
} from "@/functions/swal-alert.js";
const emit = defineEmits(["closeModal", "refresh"]);
const props = defineProps({
  detalle: {
    type: Object,
    default: null,
  },
  activos: {
    type: Array,
    required: true,
  },
  inactivos: {
    type: Array,
    default: () => [],
  },
  documentosGp: {
    type: Array,
    default: () => [],
  },
  documentosWeb: {
    type: Array,
    default: () => [],
  }
});


const {
  loadingUpdate,
  updateUnapplicationItems,
} = useUnapplicationProcess();

function cerrarModal() {
  emit('closeModal');
}

const detalle = computed(() => props.detalle ?? {});
const totalActivos = computed(() => props.activos.length);
const totalInactivos = computed(() => props.inactivos.length);


async function unapplicationItems(items) {
  const payload = items.map((item) => ({
    origen: item.origen,
    aplicacion_factura_id: item.aplicacion_factura_id,
    observacion_desaplicacion: item.observacion_desaplicacion
  }));
  const resp = await updateUnapplicationItems(payload);
  if (!resp?.ok) {
    const msg = resp?.message || "No se pudo actualizar el estado del usuario";
    (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    return;
  }
  await resetSelectedApplications();
  emit('closeModal');
  swalSuccess(resp?.message);
  emit('refresh');
}



const selectedApplications = ref([]);

function getApplicationKey(item) {
  return `${item.origen}-${item.aplicacion_factura_id}`;
}

watch(
  () => [
    props.detalle?.ruc,
    props.detalle?.factura,
    props.detalle?.cobro_ids,
  ],
  () => {
    resetSelectedApplications();
  }, { immediate: true }
);

function resetSelectedApplications() {
  selectedApplications.value = [];
}

const selectedItems = computed(() => {
  return props.activos.filter(item =>
    selectedApplications.value.includes(getApplicationKey(item))
  );
});

const totalSelected = computed(() => selectedApplications.value.length);

onMounted(() => { });
</script>

<template>
  <BaseBlock title="Gestión de Desaplicaciones" class="mb-2" transparent>
    <template #options>
      <button type="button" class="btn-block-option" aria-label="Cerrar" @click="cerrarModal">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>

    <div class="block-content block-content-full">
      <!-- Cabecera resumen -->
      <div class="border rounded-3 p-2 mb-1 bg-body-light">
        <div class="row g-2 align-items-center">
          <div class="col-md-6">
            <small class="text-label-muted">Cliente</small>
            <div class="fw-semibold">
              {{ detalle.cliente ?? 'N/A' }}
            </div>
            <div class="fs-sm text-muted text-uppercase">
              <span class="text-muted text-uppercase">RUC: {{ detalle.ruc ?? 'N/A' }}</span>
            </div>
          </div>

          <div class="col-md-3">
            <small class="text-label-muted">factura</small>
            <div class="fw-semibold">
              {{ detalle.factura ?? 'N/A' }}
            </div>
          </div>

          <div class="col-md-3 text-md-end">
            <small class="text-label-muted">Total Aplicado</small>
            <div class="fw-bold text-success">
              ${{ detalle.total_aplicado ?? '0.00' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Documentos encontrados en GP / Web -->
      <div class="row g-3 mb-3">
        <div class="col-md-6">
          <div class="doc-card h-100">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="fw-semibold">
                <i class="fa fa-file-invoice-dollar me-1 text-primary"></i>
                <small class="text-label-muted"> Documentos Aplicados GP</small>
              </span>
              <span class="badge bg-primary-subtle text-primary">
                {{ documentosGp.length }}
              </span>
            </div>

            <div v-if="documentosGp.length" class="d-flex flex-wrap gap-2">
              <span v-for="doc in documentosGp" :key="doc" class="doc-chip doc-chip-gp">
                {{ doc }}
              </span>
            </div>

            <div v-else class="text-muted fs-sm">
              <small class="text-label-muted"> No existen documentos GP relacionados.</small>
            </div>
          </div>
        </div>

        <div class="col-md-6">
          <div class="doc-card h-100">
            <div class="d-flex align-items-center justify-content-between mb-2">
              <span class="fw-semibold">
                <i class="fa fa-receipt me-1 text-info"></i>
                <small class="text-label-muted"> Recibos Aplicados Web</small>
              </span>
              <span class="badge bg-info-subtle text-info">
                {{ documentosWeb.length }}
              </span>
            </div>

            <div v-if="documentosWeb.length" class="d-flex flex-wrap gap-1">
              <span v-for="doc in documentosWeb" :key="doc" class="doc-chip doc-chip-web">
                {{ doc }}
              </span>
            </div>

            <div v-else class="text-muted fs-sm">
              <small class="text-label-muted"> No existen recibos web relacionados.</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Aplicaciones activas -->
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h6 class="mb-0 section-title">
          Aplicaciones Activas
        </h6>
        <span class="badge bg-success-subtle text-success">
          {{ totalActivos }}
        </span>
      </div>
      <div v-if="!activos.length" class="empty-state mb-3">
        No existen aplicaciones activas.
      </div>

      <div v-else class="table-responsive mb-4">
        <table class="table table-sm table-vcenter table-clean">
          <thead>
            <tr>
              <th>Recibo</th>
              <th>Documento GP</th>
              <th>Medio</th>
              <th class="text-end">Monto</th>
              <th>Estado GP</th>
              <th>Observación</th>
              <th class="text-end">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in activos" :key="`${item.origen}-${item.aplicacion_factura_id}`">
              <td><span class="doc-code">
                  {{ item.numero_recibo ?? 'N/A' }}
                </span></td>

              <td>
                <span class="badge bg-primary-subtle text-primary" style="font-size:11px">
                  {{ item.documento_gp ?? 'WEB' }}
                </span>
              </td>

              <td>
                {{ item.tipo_medio }}
              </td>

              <td class="text-end fw-semibold">
                ${{ item.monto_aplicado }}
              </td>

              <td>
                <span class="status-badge" :class="item.can_unapplication ? 'status-available' : 'status-blocked'">
                  {{ item.can_unapplication ? 'Disponible' : 'Bloqueado' }}
                </span>

                <div class="fs-xs text-muted mt-0">
                  {{ item.unapplication_message }}
                </div>
              </td>
              <td>
                <input type="text" class="form-control form-control-sm " :disabled="!item.can_unapplication"
                  v-model="item.observacion_desaplicacion">
              </td>

              <td class="text-end">
                <div class="form-check d-flex justify-content-end m-0">
                  <template v-if="item.can_unapplication">
                    <input class="form-check-input" type="checkbox"
                      :id="`unapply-${item.origen}-${item.aplicacion_factura_id}`" :value="getApplicationKey(item)"
                      v-model="selectedApplications">
                  </template>

                  <span v-else class="lock-indicator" :title="item.unapplication_message">
                    <i class="fa fa-lock"></i>
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Aplicaciones inactivas -->
      <div class="d-flex align-items-center justify-content-between mb-2">
        <h6 class="mb-0 section-title">
          Aplicaciones Inactivas
        </h6>
        <span class="badge bg-secondary-subtle text-secondary">
          {{ totalInactivos }}
        </span>
      </div>

      <div v-if="!inactivos.length" class="empty-state">
        No existen aplicaciones inactivas.
      </div>

      <div v-else class="table-responsive">
        <table class="table table-sm table-vcenter">
          <thead>
            <tr>
              <th>Recibo</th>
              <th>Documento GP</th>
              <th>Medio</th>
              <th class="text-end">Monto</th>
              <th>Usuario Desaplicación</th>
              <th>Fecha Desaplicacion</th>
              <th> Observación</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in inactivos" :key="`${item.origen}-${item.aplicacion_factura_id}`" class="opacity-75">
              <td><span class="doc-code">
                  {{ item.numero_recibo ?? 'N/A' }}
                </span></td>
              <td>
                <span class="badge bg-primary-subtle text-primary" style="font-size:11px">
                  {{ item.documento_gp ?? 'WEB' }}
                </span>
              </td>
              <td>{{ item.tipo_medio }}</td>
              <td class="text-end">${{ item.monto_aplicado }}</td>
              <td> {{ item.usuario_desaplicacion }}</td>
              <td> {{ item.fecha_desaplicacion }}</td>
              <td>{{ item.observacion_desaplicacion }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="d-flex justify-content-end mb-2" v-if="totalSelected > 0">
      <button type="button" class="btn btn-sm btn-success" @click="unapplicationItems(selectedItems)">
        <i class="fa fa-rotate-left me-1"></i>
        Desaplicar seleccionados ({{ totalSelected }})
      </button>
    </div>
  </BaseBlock>
</template>
<style scoped>
.text-label-muted {
  color: var(--bs-secondary-color);
  text-transform: uppercase;
  font-weight: 800;
  font-size: 10px;
  letter-spacing: 0.045em;
  line-height: 1.2;
}

/* Contenedor general */
.block-content {
  --jm-border: var(--bs-border-color-translucent);
  --jm-muted: var(--bs-secondary-color);
  --jm-soft-bg: rgba(108, 117, 125, 0.07);
  --jm-soft-bg-2: rgba(108, 117, 125, 0.045);
  --jm-primary-soft: rgba(13, 110, 253, 0.08);
  --jm-info-soft: rgba(13, 202, 240, 0.08);
  --jm-success-soft: rgba(25, 135, 84, 0.10);
  --jm-danger-soft: rgba(220, 53, 69, 0.10);
}

/* Cabecera resumen */
.block-content>.bg-body-light {
  padding: 0.94rem 1rem !important;
  border: 1px solid var(--jm-border) !important;
  border-radius: 0.85rem !important;
  background: var(--jm-soft-bg-2) !important;
  box-shadow: none;
}

.block-content>.bg-body-light .fw-semibold {
  color: var(--bs-emphasis-color);
  font-size: 0.9rem;
  line-height: 1.25;
}

.block-content>.bg-body-light .fw-bold {
  font-size: 1rem;
  letter-spacing: -0.02em;
}

/* Tarjetas de documentos */
.doc-card {
  padding: 0.9rem 1rem;
  border: 1px solid var(--jm-border);
  border-radius: 0.85rem;
  background: var(--jm-soft-bg-2);
  box-shadow: none;
}

.doc-card i {
  font-size: 0.78rem;
  opacity: 0.75;
}

.doc-card .badge {
  min-width: 1.65rem;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 800;
}

/* Chips más sobrios */
.doc-chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.52rem;
  border-radius: 999px;
  font-size: 0.69rem;
  font-weight: 800;
  line-height: 1.1;
  border: 1px solid transparent;
  background: var(--jm-soft-bg);
}

.doc-chip-gp {
  color: var(--bs-primary);
  background: var(--jm-primary-soft);
  border-color: rgba(13, 110, 253, 0.14);
}

.doc-chip-web {
  color: var(--bs-info);
  background: var(--jm-info-soft);
  border-color: rgba(13, 202, 240, 0.16);
}

/* Secciones */
.section-title {
  color: var(--jm-muted);
  text-transform: uppercase;
  font-weight: 900;
  font-size: 10px;
  letter-spacing: 0.06em;
}

.d-flex>.badge.bg-success-subtle,
.d-flex>.badge.bg-secondary-subtle {
  background: transparent !important;
  border: 0;
  font-weight: 900;
  font-size: 0.76rem;
}

/* Tablas */
.table-clean,
.table-vcenter {
  font-size: 0.78rem;
}

.table-clean thead th,
.table-vcenter thead th {
  color: var(--jm-muted);
  text-transform: uppercase;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.045em;
  border-bottom: 1px solid var(--jm-border);
  padding-top: 0.65rem;
  padding-bottom: 0.65rem;
}

.table-clean tbody td,
.table-vcenter tbody td {
  padding-top: 0.05rem;
  padding-bottom: 0.05rem;
  border-bottom: 1px solid rgba(108, 117, 125, 0.10);
}

.table-clean tbody tr:last-child td,
.table-vcenter tbody tr:last-child td {
  border-bottom: 0;
}

.table-clean tbody tr:hover,
.table-vcenter tbody tr:hover {
  background: rgba(108, 117, 125, 0.045);
}

/* Códigos/documentos */
.doc-code {
  font-family: Consolas, Monaco, monospace;
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--bs-emphasis-color);
}

/* Documento GP dentro de tabla: menos "badge", más etiqueta técnica */
.table-clean td .badge.bg-primary-subtle,
.table-vcenter td .badge.bg-primary-subtle {
  padding: 0;
  border: 0;
  background: transparent !important;
  color: var(--bs-primary) !important;
  font-size: 0.72rem !important;
  font-weight: 800;
}

/* Estado */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.26rem 0.55rem;
  border-radius: 999px;
  font-size: 0.67rem;
  font-weight: 900;
  line-height: 1.1;
}

.status-badge::before {
  content: "";
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 999px;
  display: inline-block;
}

.status-available {
  color: var(--bs-success);
  background: var(--jm-success-soft);
}

.status-available::before {
  background: var(--bs-success);
}

.status-blocked {
  color: var(--bs-danger);
  background: var(--jm-danger-soft);
}

.status-blocked::before {
  background: var(--bs-danger);
}

/* Mensaje de validación */
.table-clean td .fs-xs,
.table-vcenter td .fs-xs,
td .text-muted.mt-1 {
  max-width: 420px;
  color: var(--jm-muted) !important;
  font-size: 0.7rem;
  line-height: 1.25;
}

/* Botones: menos saturados */
.btn.btn-sm {
  border-radius: 0.45rem;
  font-size: 0.75rem;
  font-weight: 800;
}

.btn-success {
  color: var(--bs-success) !important;
  background: var(--jm-success-soft) !important;
  border-color: rgba(25, 135, 84, 0.20) !important;
}

.btn-success:hover {
  color: #fff !important;
  background: var(--bs-success) !important;
  border-color: var(--bs-success) !important;
}

.btn-secondary,
.btn-secondary:disabled {
  color: var(--jm-muted) !important;
  background: rgba(108, 117, 125, 0.10) !important;
  border-color: rgba(108, 117, 125, 0.12) !important;
  opacity: 0.8;
}

/* Empty states */
.empty-state {
  padding: 1.35rem;
  border: 1px dashed var(--jm-border);
  border-radius: 0.85rem;
  color: var(--jm-muted);
  font-size: 0.8rem;
  text-align: center;
  background: var(--jm-soft-bg-2);
}

/* Separación visual */
.table-responsive {
  border-radius: 0.65rem;
}

/* Ajuste responsive */
@media (max-width: 768px) {
  .block-content>.bg-body-light {
    padding: 0.8rem !important;
  }

  .doc-card {
    padding: 0.8rem;
  }

  .table-clean,
  .table-vcenter {
    font-size: 0.74rem;
  }
}
</style>