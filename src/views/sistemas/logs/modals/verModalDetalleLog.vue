
<script setup>
import { computed } from "vue";

const props = defineProps({
  detailLog: {
    type: Object,
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
  module: "Módulo",
  action: "Acción",
  method: "Método",
  local_id: "ID local",
  external_id: "ID externo",
  message: "Mensaje",
  attempts: "Intentos",
};

const detail = computed(() => props.detailLog);

const detailFields = computed(() => {
  if (!detail.value) return [];

  return ["module", "action", "method", "external_id", "local_id", "attempts", "message"]
    .map((key) => ({
      key,
      label: fieldLabels[key],
      value: detail.value[key],
    }))
    .filter(({ value }) => value !== null && value !== undefined && value !== "");
});

function formatPayload(payload) {
  return JSON.stringify(payload, null, 2);
}
</script>

<template>
  <BaseBlock
    :subtitle="detail ? `#${detail.id} · ${detail.created_at}` : ''"
    transparent
    class="mb-0"
  >
    <template #title>
      <span id="modal-detalle-log-title">Detalle del log</span>
    </template>

    <template #options>
      <span v-if="detail?.status" class="status-pill">{{ detail.status }}</span>
      <button
        type="button"
        class="btn-block-option"
        aria-label="Cerrar"
        @click="$emit('closeModal')"
      >
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>

    <template #content>
      <div class="block-content block-content-full p-3">
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
                <span :title="String(field.value)">{{ field.value }}</span>
              </div>
            </div>
          </section>

          <section v-if="detail.payload">
            <h6 class="section-title">Payload</h6>
            <pre class="json-viewer mb-0"><code>{{ formatPayload(detail.payload) }}</code></pre>
          </section>

          <div v-else class="alert alert-info mb-0 py-2">
            Este log no contiene un payload.
          </div>
        </template>

        <div v-else class="text-center text-muted py-5">
          <i class="fa fa-file-circle-question fa-2x mb-2"></i>
          <p class="mb-0">No hay información disponible.</p>
        </div>
      </div>

      <div class="content content-full py-2 text-end border-top bg-body-light">
        <button type="button" class="btn btn-sm btn-alt-secondary" @click="$emit('closeModal')">
          Cerrar
        </button>
      </div>
    </template>
  </BaseBlock>
</template>

<style scoped>
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
  grid-template-columns:
    minmax(0, 1.2fr)
    minmax(0, 1.3fr)
    minmax(0, 1.3fr)
    minmax(0, 0.9fr)
    minmax(0, 0.65fr)
    minmax(52px, 0.4fr)
    minmax(0, 1.8fr);
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

.detail-field small {
  display: block;
  margin-bottom: 1px;
  color: #8a929c;
  font-size: 10px;
  line-height: 1.2;
}

.detail-field span {
  display: block;
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 991.98px) {
  .detail-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 575.98px) {
  .detail-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.status-pill {
  padding: 2px 7px;
  border-radius: 10px;
  color: #69717c;
  background: rgba(127, 127, 127, 0.12);
  font-size: 10px;
  font-weight: 600;
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
