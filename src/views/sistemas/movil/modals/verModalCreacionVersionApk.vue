<script setup>
import { onMounted, watch } from 'vue';
import { useVersionManagementProcess } from "@/composables/sistemas/movil/useVersionManagementProcess";
import {
  swalWarning,
  swalError,
  swalSuccess
} from "@/functions/swal-alert.js";
const {
  //subir version 
  form,
  loadingCreate,
  fileName,
  isValidApk,
  fileSize,
  canSubmit,
  resetForm,
  isInvalidMinimumBuild,
  fileInputRef,
  uploadProgress,
  handleFileChange,
  createVersion
} = useVersionManagementProcess();
const emit = defineEmits(["closeModal", "refresh"]);

async function submitForm() {
  if (!canSubmit.value) return;

  const resp = await createVersion();
  if (resp?.ok) {
    swalSuccess(resp.message);
    resetForm();
    emit("closeModal");
    emit("refresh");
    return;
  }
  const msg = resp?.message || "No se pudo registrar la versión APK";
  (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);

}

function cerrarModal() {
  if (loadingCreate.value) return;
  resetForm();
  emit("closeModal");
}

watch(
  () => form.build_number,
  (value) => {
    if (!form.minimum_required_build && value) {
      form.minimum_required_build = value;
    }
  }
);

onMounted(() => { });
</script>

<template>
  <BaseBlock title="Nueva versión APK" transparent class="mb-0">
    <template #options>
      <div class="block-options-item">
        <button type="button" class="btn btn-sm btn-alt-secondary" data-bs-dismiss="modal" :disabled="loadingCreate"
          @click="cerrarModal">
          <i class="fa fa-fw fa-times"></i>
        </button>
      </div>
    </template>
    <template #content>
      <form @submit.prevent="submitForm">
        <div class="block-content fs-sm">
          <div class="row g-3 mb-3">
            <div class="col-12">
              <div class="d-flex align-items-center justify-content-between border-bottom pb-3">
                <div>
                  <div class="fw-semibold">
                    <i class="fa fa-mobile-screen-button text-primary me-1"></i>
                    Información de la versión
                  </div>
                  <div class="text-muted fs-sm">
                    Registra el build y el archivo APK que será publicado para la app móvil.
                  </div>
                </div>

                <span class="badge bg-primary-light text-primary text-uppercase">
                  {{ form.platform || 'android' }}
                </span>
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label" for="platform">
                Plataforma <span class="text-danger">*</span>
              </label>
              <select id="platform" v-model="form.platform" class="form-select form-select-sm"
                :disabled="loadingCreate">
                <option value="android">ANDROID</option>
              </select>
            </div>

            <div class="col-md-4">
              <label class="form-label" for="version_name">
                Versión <span class="text-danger">*</span>
              </label>
              <input id="version_name" v-model.trim="form.version_name" type="text" class="form-control form-control-sm"
                placeholder="Ej: 1.0.1" :disabled="loadingCreate" />
            </div>

            <div class="col-md-4">
              <label class="form-label" for="build_number">
                Build <span class="text-danger">*</span>
              </label>
              <input id="build_number" v-model="form.build_number" type="number" min="1"
                class="form-control form-control-sm" placeholder="Ej: 2" :disabled="loadingCreate" />
            </div>

            <div class="col-md-4">
              <label class="form-label" for="minimum_required_build">
                Build mínimo <span class="text-danger">*</span>
              </label>
              <input id="minimum_required_build" v-model="form.minimum_required_build" type="number" min="1"
                class="form-control form-control-sm" :class="{ 'is-invalid': isInvalidMinimumBuild }"
                placeholder="Ej: 1" :disabled="loadingCreate" />
              <div v-if="isInvalidMinimumBuild" class="invalid-feedback">
                El build mínimo no puede ser mayor al build publicado.
              </div>
            </div>

            <div class="col-md-8">
              <label class="form-label" for="message">
                Mensaje de actualización
              </label>
              <input id="message" v-model.trim="form.message" type="text" class="form-control form-control-sm"
                placeholder="Ej: Nueva versión disponible para descargar." :disabled="loadingCreate" />
            </div>

            <div class="col-12">
              <label class="form-label" for="release_notes">
                Notas de versión
              </label>
              <textarea id="release_notes" v-model.trim="form.release_notes" class="form-control form-control-sm"
                rows="3" placeholder="Detalle los cambios incluidos en esta versión..."
                :disabled="loadingCreate"></textarea>
            </div>

            <div class="col-12">
              <label class="form-label" for="apk">
                Archivo APK <span class="text-danger">*</span>
              </label>

              <input id="apk" ref="fileInputRef" type="file" class="form-control form-control-sm" accept=".apk"
                :disabled="loadingCreate" @change="handleFileChange" />

              <div v-if="form.apk"
                class="d-flex align-items-center justify-content-between mt-2 p-2 rounded bg-body-light">
                <div class="d-flex align-items-center min-w-0">
                  <i class="fab fa-android text-success me-2" style="font-size: 18px;"></i>

                  <div class="min-w-0">
                    <div class="fw-semibold text-truncate">
                      {{ fileName }}
                    </div>
                    <div class="fs-xs text-muted">
                      {{ fileSize }}
                    </div>
                  </div>
                </div>

                <span class="fs-xs fw-semibold d-inline-block py-1 px-2 rounded-pill ms-2"
                  :class="isValidApk ? 'bg-success-light text-success' : 'bg-danger-light text-danger'">
                  {{ isValidApk ? 'Válido' : 'Inválido' }}
                </span>
              </div>

              <div v-if="form.apk && !isValidApk" class="text-danger fs-sm mt-2">
                El archivo seleccionado debe tener extensión .apk.
              </div>
            </div>

            <div class="col-12">
              <div class="d-flex align-items-center justify-content-between bg-body-light rounded p-2">
                <div>
                  <div class="fw-semibold">Publicar versión</div>
                  <div class="fs-xs text-muted">
                    Al guardar, esta versión quedará disponible para validación desde la app.
                  </div>
                </div>

                <div class="form-check form-switch mb-0">
                  <input id="is_active" v-model="form.is_active" class="form-check-input" type="checkbox"
                    :disabled="loadingCreate" />
                </div>
              </div>
            </div>

            <div v-if="loadingCreate" class="col-12">
              <div class="d-flex justify-content-between mb-1">
                <span class="fs-sm text-muted">Subiendo archivo...</span>
                <span class="fs-sm fw-semibold">{{ uploadProgress }}%</span>
              </div>
              <div class="progress" style="height: 6px;">
                <div class="progress-bar progress-bar-striped progress-bar-animated"
                  :style="{ width: `${uploadProgress}%` }"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="content content-full text-end border-top bg-body-light">
          <button type="button" class="btn btn-sm btn-alt-secondary" data-bs-dismiss="modal" :disabled="loadingCreate"
            @click="cerrarModal">
            Cerrar
          </button>

          <button type="submit" class="btn btn-sm btn-primary" :disabled="!canSubmit">
            <i v-if="loadingCreate" class="fa fa-spinner fa-spin me-1"></i>
            <i v-else class="fa fa-upload me-1"></i>
            Guardar versión
          </button>
        </div>
      </form>
    </template>


  </BaseBlock>
</template>


<style scoped>
.form-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #6c757d;
  margin-bottom: 0.35rem;
}

.min-w-0 {
  min-width: 0;
}
</style>