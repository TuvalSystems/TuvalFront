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
      size="xl" scrollable @hidden="cleanup">
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
              <img v-else :src="preview.url" :alt="preview.file.nombre" class="img-fluid d-block mx-auto" style="max-height: 60vh; background: white">
            </div>
      <template #footer="{ close }">
        <div class="text-end">
          <button type="button" class="btn btn-secondary" @click="close">Cerrar</button>
        </div>
      </template>
    </BaseModal>
  </Teleport>
</template>
<style scoped>
.dropdown-menu .dropdown-item i {
  width: 20px;
  text-align: center;
}
.dropdown-menu {
  z-index: 9999 !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}
</style>