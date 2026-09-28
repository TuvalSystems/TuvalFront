
<script setup>
import { computed } from "vue";

const props = defineProps({
  detailLog: {
    type: [Object, Array],
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
});

defineEmits(["closeModal"]);

const fieldLabels = {
  id: "ID",
  action: "Acción",
  local_id: "ID local",
  external_id: "ID externo",
  message: "Mensaje",
  status: "Estado",
  created_at: "Fecha de creación",
  updated_at: "Fecha de actualización",
  model: "Modelo",
  table: "Tabla",
  endpoint: "Endpoint",
  method: "Método",
};

const detail = computed(() => {
  if (Array.isArray(props.detailLog)) {
    return props.detailLog.length ? { syncLogs: props.detailLog } : null;
  }

  if (!props.detailLog || typeof props.detailLog !== "object") {
    return props.detailLog;
  }

  const nestedDetail = props.detailLog.log ?? props.detailLog.syncLog ?? props.detailLog.sync_log;
  if (!nestedDetail || typeof nestedDetail !== "object") return props.detailLog;

  return {
    ...nestedDetail,
    syncLogs:
      props.detailLog.syncLogs ??
      props.detailLog.sync_logs ??
      nestedDetail.syncLogs ??
      nestedDetail.sync_logs,
  };
});

const syncLogs = computed(() => {
  const value = detail.value?.syncLogs ?? detail.value?.sync_logs ?? [];
  return Array.isArray(value) ? value : value ? [value] : [];
});

const detailFields = computed(() => {
  if (!detail.value || typeof detail.value !== "object") return [];

  return Object.entries(detail.value)
    .filter(([key, value]) =>
      !["syncLogs", "sync_logs", "payload"].includes(key) &&
      value !== null &&
      value !== undefined &&
      value !== "" &&
      typeof value !== "object"
    )
    .map(([key, value]) => ({
      key,
      label: fieldLabels[key] ?? humanize(key),
      value,
    }));
});

function humanize(value) {
  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function normalizeJson(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return value;

  let parsed = value;
  for (let index = 0; index < 2 && typeof parsed === "string"; index += 1) {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      break;
    }
  }
  return parsed;
}

function formatPayload(payload) {
  const normalized = normalizeJson(payload);
  if (normalized === null) return "Sin payload";
  if (typeof normalized === "string") return normalized;

  try {
    return JSON.stringify(normalized, null, 2);
  } catch {
    return String(normalized);
  }
}

function syncFields(syncLog) {
  if (!syncLog || typeof syncLog !== "object") return [];

  return Object.entries(syncLog)
    .filter(([key, value]) =>
      key !== "payload" &&
      value !== null &&
      value !== undefined &&
      value !== "" &&
      typeof value !== "object"
    )
    .map(([key, value]) => ({
      key,
      label: fieldLabels[key] ?? humanize(key),
      value,
    }));
}

function payloadFor(syncLog) {
  if (syncLog && typeof syncLog === "object" && "payload" in syncLog) {
    return syncLog.payload;
  }
  return syncLog;
}

const rootPayload = computed(() => detail.value?.payload ?? null);
</script>

<template>
  <div class="modal-header">
    <div class="d-flex align-items-center gap-2">
      <span class="modal-icon">
        <i class="fa fa-file-code"></i>
      </span>
      <div>
        <h5 id="modal-detalle-log-title" class="modal-title fs-6">
          Detalle del log
        </h5>
        <small v-if="detail?.id" class="text-muted">#{{ detail.id }}</small>
      </div>
    </div>
    <button
      type="button"
      class="btn-close"
      aria-label="Cerrar"
      @click="$emit('closeModal')"
    ></button>
  </div>

  <div class="modal-body">
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando detalle...</span>
      </div>
      <p class="text-muted mt-3 mb-0">Cargando detalle del log...</p>
    </div>

    <div v-else-if="error" class="alert alert-danger mb-0" role="alert">
      <i class="fa fa-triangle-exclamation me-2"></i>{{ error }}
    </div>

    <template v-else-if="detail">
      <section v-if="detailFields.length" class="mb-3">
        <h6 class="section-title">Información general</h6>
        <div class="detail-grid">
          <div
            v-for="field in detailFields"
            :key="field.key"
            class="detail-field"
          >
            <small>{{ field.label }}</small>
            <span class="text-break">{{ field.value }}</span>
          </div>
        </div>
      </section>

      <section v-if="rootPayload !== null && syncLogs.length === 0">
        <h6 class="section-title">Payload</h6>
        <pre class="json-viewer mb-0"><code>{{ formatPayload(rootPayload) }}</code></pre>
      </section>

      <section v-if="syncLogs.length">
        <div class="d-flex align-items-center justify-content-between mb-2">
          <h6 class="section-title mb-0">Registros sincronizados</h6>
          <span class="sync-count">{{ syncLogs.length }}</span>
        </div>

        <div
          v-for="(syncLog, index) in syncLogs"
          :key="syncLog?.id ?? index"
          class="sync-item"
        >
          <div class="sync-header">
            <div class="d-flex align-items-center gap-2">
              <span class="sync-index">{{ index + 1 }}</span>
              <span class="fw-semibold">Sync #{{ syncLog?.id ?? index + 1 }}</span>
            </div>
            <span v-if="syncLog?.status" class="status-pill">{{ syncLog.status }}</span>
          </div>
          <div class="sync-content">
            <div v-if="syncFields(syncLog).length" class="sync-meta">
              <div
                v-for="field in syncFields(syncLog)"
                :key="field.key"
                class="sync-meta-item"
              >
                <small>{{ field.label }}</small>
                <span class="text-break">{{ field.value }}</span>
              </div>
            </div>

            <div class="payload-block">
              <small class="payload-label">Payload</small>
              <pre class="json-viewer mb-0"><code>{{ formatPayload(payloadFor(syncLog)) }}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <div v-if="!syncLogs.length && rootPayload === null" class="alert alert-info mb-0">
        Este log no contiene payloads para mostrar.
      </div>
    </template>

    <div v-else class="text-center text-muted py-5">
      <i class="fa fa-file-circle-question fa-2x mb-2"></i>
      <p class="mb-0">No hay información disponible.</p>
    </div>
  </div>

  <div class="modal-footer">
    <button type="button" class="btn btn-sm btn-alt-secondary" @click="$emit('closeModal')">
      Cerrar
    </button>
  </div>
</template>

<style scoped>
.modal-header,
.modal-footer {
  padding: 0.7rem 1rem;
}

.modal-body {
  padding: 0.85rem 1rem;
}

.modal-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 7px;
  color: var(--bs-primary);
  background: rgba(6, 101, 208, 0.1);
}

.section-title {
  margin-bottom: 0.45rem;
  color: #88909a;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1px;
  overflow: hidden;
  border: 1px solid var(--bs-border-color, #dfe3e7);
  border-radius: 6px;
  background: var(--bs-border-color, #dfe3e7);
}

.detail-field {
  min-width: 0;
  padding: 0.45rem 0.6rem;
  background: var(--bs-body-bg, #fff);
}

.detail-field small,
.sync-meta-item small {
  display: block;
  margin-bottom: 1px;
  color: #8a929c;
  font-size: 10px;
  line-height: 1.2;
}

.detail-field span,
.sync-meta-item span {
  font-size: 12px;
}

.sync-count {
  min-width: 22px;
  padding: 1px 7px;
  border-radius: 10px;
  color: var(--bs-primary);
  background: rgba(6, 101, 208, 0.1);
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.sync-item {
  overflow: hidden;
  margin-bottom: 0.5rem;
  border: 1px solid var(--bs-border-color, #dfe3e7);
  border-radius: 6px;
}

.sync-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  padding: 0.35rem 0.6rem;
  border-bottom: 1px solid var(--bs-border-color, #dfe3e7);
  background: rgba(127, 127, 127, 0.04);
  font-size: 12px;
}

.sync-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: #747b85;
  background: rgba(127, 127, 127, 0.12);
  font-size: 10px;
  font-weight: 700;
}

.status-pill {
  padding: 2px 7px;
  border-radius: 10px;
  color: #69717c;
  background: rgba(127, 127, 127, 0.12);
  font-size: 10px;
  font-weight: 600;
}

.sync-content {
  padding: 0.55rem;
}

.sync-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.4rem 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0 0.15rem;
}

.sync-meta-item {
  min-width: 0;
}

.payload-label {
  display: block;
  margin: 0 0 0.25rem 0.15rem;
  color: #8a929c;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.json-viewer {
  max-height: 300px;
  overflow: auto;
  padding: 0.65rem 0.75rem;
  border-radius: 5px;
  background: #161b22;
  color: #e6edf3;
  font-size: 11px;
  line-height: 1.45;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  tab-size: 2;
}

.json-viewer code {
  color: inherit;
  font-family: Consolas, Monaco, "Courier New", monospace;
}
</style>
