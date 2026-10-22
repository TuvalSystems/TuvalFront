<script setup>
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue';
import { Dropdown } from 'bootstrap';
import axiosClient from '@/axios';
import BaseModal from '@/components/BaseModal.vue';

const props = defineProps({
  guide: { type: Object, required: true },
  type: { type: String, required: true },
  printDisabled: { type: Boolean, default: false },
});
const emit = defineEmits(['print']);
const dropdownButton = ref(null);
let dropdown = null;
onMounted(() => {
  dropdown = new Dropdown(dropdownButton.value, {
    popperConfig: (config) => ({ ...config, strategy: 'fixed' }),
  });
});
onBeforeUnmount(() => dropdown?.dispose());
function choose(action) {
  dropdown?.hide();
  if (action === 'print') emit('print');
  else open(action);
}
const modal = ref(null);
const modalId = 'guia-archivos-' + getCurrentInstance().uid;
const section = ref('firmas');
const files = ref([]);
const loading = ref(false);
const opening = ref(false);
const error = ref('');
const preview = ref(null);
let request = null;
let generation = 0;
const title = computed(() => section.value === 'firmas' ? 'Firma de recepción' : 'Documentos adjuntos');
const basePath = computed(() => `/bodegas/guias-remision/${props.type}/${props.guide.id}/archivos`);
const number = computed(() => props.guide.numero_guia || props.guide.GUI_REM_GUIA_REMISION || props.guide.id);

const signatureLocation = computed(() => {
  if (section.value !== 'firmas' || !preview.value) return null;
  const file = preview.value.file;
  const coordinate = (value) => {
    if (typeof value !== 'number' && typeof value !== 'string') return NaN;
    if (typeof value === 'string' && !value.trim()) return NaN;
    return Number(value);
  };
  const latitude = coordinate(file.latitud);
  const longitude = coordinate(file.longitud);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)
    || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  const accuracy = coordinate(file.precision_ubicacion);
  const bbox = [
    Math.max(-180, longitude - 0.005), Math.max(-90, latitude - 0.005),
    Math.min(180, longitude + 0.005), Math.min(90, latitude + 0.005),
  ];
  const params = new URLSearchParams({ bbox: bbox.join(','), layer: 'mapnik', marker: `${latitude},${longitude}` });
  return {
    latitude, longitude,
    accuracy: Number.isFinite(accuracy) && accuracy >= 0 ? accuracy : null,
    embedUrl: `https://www.openstreetmap.org/export/embed.html?${params}`,
    mapUrl: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`,
  };
});

function clearPreview() {
  if (preview.value) URL.revokeObjectURL(preview.value.url);
  preview.value = null;
}
function cleanup() {
  generation++;
  request?.abort();
  clearPreview();
}

onBeforeUnmount(cleanup);

async function errorMessage(cause) {
  let data = cause.response?.data;
  if (data instanceof Blob) {
    try { data = JSON.parse(await data.text()); } catch { data = null; }
  }
  return data?.message || data?.error || 'No se pudieron obtener los archivos. Intente nuevamente.';
}
async function open(kind) {
  cleanup();
  request = new AbortController();
  const current = generation;
  section.value = kind;
  files.value = [];
  error.value = '';
  loading.value = true;
  opening.value = false;
  modal.value?.show();
  try {
    const response = await axiosClient.get(basePath.value, { signal: request.signal });
    if (current !== generation) return;
    files.value = response.data.data[kind] || [];
    if (kind === 'firmas' && files.value.length) await showFile(files.value[0]);
  } catch (cause) {
    if (current === generation) error.value = await errorMessage(cause);
  } finally {
    if (current === generation) loading.value = false;
  }
}
async function showFile(file) {
  const current = generation;
  opening.value = true;
  error.value = '';
  clearPreview();
  try {
    const response = await axiosClient.get(`${basePath.value}/${file.id}`, {
      responseType: 'blob', signal: request.signal,
    });
    if (current !== generation) return;
    const mime = file.mime_type;
    if (!['application/pdf', 'image/png', 'image/jpeg', 'image/webp'].includes(mime)) {
      throw new Error('unsupported');
    }
    preview.value = { file, url: URL.createObjectURL(new Blob([response.data], { type: mime })) };
  } catch (cause) {
    if (current === generation) error.value = await errorMessage(cause);
  } finally {
    if (current === generation) opening.value = false;
  }
}
function dateLabel(value) {
  if (!value) return 'No registrada';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'No registrada' : date.toLocaleString('es-EC', { timeZone: 'America/Guayaquil' });
}
</script>

<template>
  <div class="dropdown d-inline-block">
    <button ref="dropdownButton" type="button" class="btn btn-sm btn-alt-secondary"
      data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false"
      :aria-label="`Acciones de la guía ${number}`" title="Acciones">
      <i class="fa fa-fw fa-ellipsis-v"></i>
    </button>
    <ul class="dropdown-menu dropdown-menu-end shadow-sm" :aria-label="`Acciones de la guía ${number}`">
      <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">Exportar</li>
      <li><button type="button" class="dropdown-item d-flex align-items-center gap-2 py-2" :disabled="printDisabled" @click="choose('print')">
        <i class="fa-solid fa-file-pdf fa-fw text-primary"></i><span>Guía PDF</span>
      </button></li>
      <li class="dropdown-divider my-2"></li>
      <li class="dropdown-header text-uppercase fs-xs fw-bold mt-1">Archivos</li>
      <li><button type="button" class="dropdown-item d-flex align-items-center gap-2 py-2" @click="choose('firmas')">
        <i class="fa-solid fa-signature fa-fw text-success"></i><span>Ver firma</span>
      </button></li>
      <li><button type="button" class="dropdown-item d-flex align-items-center gap-2 py-2" @click="choose('documentos')">
        <i class="fa-solid fa-paperclip fa-fw text-info"></i><span>Ver adjuntos</span>
      </button></li>
    </ul>
  </div>
  <Teleport to="body">
    <BaseModal ref="modal" :id="modalId" :title="`${title} — Guía ${number}`"
      size="xl" scrollable content-class="guia-files-modal" body-class="guia-files-modal-body" @hidden="cleanup">
            <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
            <p v-if="loading" role="status"><span class="spinner-border spinner-border-sm me-2"></span>Cargando archivos...</p>
            <template v-else>
              <p v-if="!files.length && !error" class="text-muted">
                {{ section === 'firmas' ? 'Esta guía todavía no tiene firma.' : 'Esta guía no tiene documentos adjuntos.' }}
              </p>
              <div v-if="files.length" class="table-responsive">
                <table class="table table-sm table-vcenter">
                  <thead><tr><th>Archivo</th><th v-if="section === 'firmas'">Firmante</th><th v-if="section === 'firmas'">Identificación</th><th>Subido por</th><th>Fecha de carga (Ecuador)</th><th></th></tr></thead>
                  <tbody>
                    <tr v-for="file in files" :key="file.id">
                      <td>{{ file.nombre }}<small class="d-block text-muted">{{ file.mime_type }} · {{ Math.ceil(file.tamano / 1024) }} KB</small></td>
                      <td v-if="section === 'firmas'">{{ file.nombre_firmante || 'No registrado' }}</td>
                      <td v-if="section === 'firmas'">{{ file.identificacion_firmante || 'No registrada' }}</td>
                      <td>{{ file.subido_por?.nombre || file.subido_por?.usuario || 'No registrado' }}<small v-if="file.subido_por?.nombre && file.subido_por?.usuario" class="d-block text-muted">{{ file.subido_por.usuario }}</small></td>
                      <td>{{ dateLabel(file.subido_en || file.creado_en) }}</td>
                      <td><button type="button" class="btn btn-sm btn-primary" :disabled="opening" @click="showFile(file)">Visualizar</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </template>
            <p v-if="opening" role="status">Abriendo archivo...</p>
            <div v-if="preview" class="border rounded p-3 text-center">
              <a class="btn btn-sm btn-outline-primary mb-3" :href="preview.url" :download="preview.file.nombre">Descargar archivo</a>
              <iframe v-if="preview.file.mime_type === 'application/pdf'" :src="preview.url" :title="preview.file.nombre" class="w-100 border-0" style="height: 65vh"></iframe>
              <img v-else :src="preview.url" :alt="preview.file.nombre" class="img-fluid d-block mx-auto" :class="{ 'signature-preview': section === 'firmas' }" style="max-height: 60vh; background: white">
            </div>
            <section v-if="section === 'firmas' && preview" class="border rounded p-3 mt-3" aria-label="Ubicación de la firma">
              <h3 class="h5 mb-3">Ubicación de la firma</h3>
              <template v-if="signatureLocation">
                <p class="mb-2">
                  Latitud: {{ signatureLocation.latitude }} · Longitud: {{ signatureLocation.longitude }}
                  <span v-if="signatureLocation.accuracy !== null" class="d-block text-muted">Precisión reportada: {{ signatureLocation.accuracy }} metros</span>
                  <span class="d-block text-muted">Fecha de firma (Ecuador): {{ dateLabel(preview.file.fecha_firma) }}</span>
                </p>
                <iframe :key="signatureLocation.embedUrl" :src="signatureLocation.embedUrl"
                  title="Mapa con la ubicación registrada al firmar" class="w-100 border-0 rounded"
                  style="height: clamp(180px, 32vh, 280px)" loading="lazy" referrerpolicy="no-referrer"></iframe>
                <a :href="signatureLocation.mapUrl" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-primary mt-2">Abrir mapa en otra pestaña</a>
              </template>
              <p v-else class="text-muted mb-0">Esta firma no tiene una ubicación registrada válida.</p>
            </section>
      <template #footer="{ close }">
        <div class="text-end">
          <button type="button" class="btn btn-secondary" @click="close">Cerrar</button>
        </div>
      </template>
    </BaseModal>
  </Teleport>
</template>
<style scoped>
/* BaseModal wraps its body in BaseBlock instead of Bootstrap's modal-body. */
:global(.guia-files-modal) {
  max-height: calc(100vh - 3.5rem);
  max-height: calc(100dvh - 3.5rem);
}
:global(.guia-files-modal > .block) {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}
:global(.guia-files-modal > .block > .block-header),
:global(.guia-files-modal > .block > .base-modal-footer) {
  flex-shrink: 0;
}
:global(.guia-files-modal-body) {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior-y: contain;
}
.signature-preview {
  max-height: min(24vh, 180px) !important;
  width: auto;
  object-fit: contain;
}
.dropdown-menu .dropdown-item i {
  width: 20px;
  text-align: center;
}
.dropdown-menu {
  z-index: 9999 !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>