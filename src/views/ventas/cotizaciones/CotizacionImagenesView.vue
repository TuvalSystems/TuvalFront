<script setup>
import { computed } from "vue";
import VueEasyLightbox from "vue-easy-lightbox";
import { onBeforeRouteLeave } from "vue-router";
import FiltrarCliente from "@/components/ventas/cliente/FiltrarCliente.vue";
import { useQuotationImageDraft } from "@/composables/venta/cotizaciones/useQuotationImageDraft";
import { useQuotationImageUpload } from "@/composables/venta/cotizaciones/useQuotationImageUpload";
import { useQuotationImageCustomerSearch } from "@/composables/venta/cotizaciones/useQuotationImageCustomerSearch";
import { toast, swalError, swalWarning, swalSuccess } from "@/functions/swal-alert";

const {
  customer, images, rows, observations, usage, confirmed, extracted, extracting,
  creating, created, pendingRequest, pvId, pointLabel, busy, locked, validRows,
  selectCustomer, addFiles: adjuntarArchivos, removeFile, extract: extraerImagenes,
  addRow, removeRow, createDraft: crearBorrador, reset,
} = useQuotationImageDraft();
const disabled = computed(() => busy.value || locked.value);
const {
  clients, errorSearchClient, dataSearch, loadingSearch, showResults,
  search: buscarClientes, select, resetSearch,
} = useQuotationImageCustomerSearch({ disabled, selectCustomer });
const {
  previewVisible, previewIndex, previewImages, canAddImages, draggingImages,
  dragEnter, dragOver, dragLeave, pasteImages, dropImages, selectFiles,
} = useQuotationImageUpload({ images, disabled, addFiles });

function mostrarError(result) {
  if (!result || result.ok || result.handled || result.canceled || result.stale) return;
  (result.status >= 500 ? swalError : swalWarning)(result.message);
}
function addFiles(files) {
  mostrarError(adjuntarArchivos(files));
}
async function search() {
  mostrarError(await buscarClientes());
}
async function extract() {
  mostrarError(await extraerImagenes());
}
async function createDraft() {
  const result = await crearBorrador();
  if (result?.ok && result.data?.id) swalSuccess(`Borrador ${result.data.numero} creado correctamente.`);
  else if (result?.ok) swalWarning("No se creó un borrador: no se encontraron artículos disponibles.");
  else mostrarError(result);
}
function startAgain() {
  if (busy.value || pendingRequest.value) return;
  reset();
  resetSearch();
}

onBeforeRouteLeave(async () => {
  if (!pendingRequest.value && !creating.value) return true;
  const result = await toast.fire({
    title: "Creación pendiente",
    text: "La solicitud puede haberse procesado. Reintente desde esta vista para comprobar el resultado antes de salir.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Permanecer",
    cancelButtonText: "Salir de la vista",
  });
  return result.dismiss === "cancel";
});
</script>

<template>
  <BasePageHeading
    title="Cotización desde imágenes"
    subtitle="Seleccione un cliente y revise el detalle antes de crear el borrador."
  >
    <template #extra>
      <router-link
        :to="{ name: 'ventas-crearcotizacion' }"
        class="btn btn-alt-secondary btn-sm"
      >
        <i class="fa fa-arrow-left me-1"></i> Crear cotización
      </router-link>
    </template>
  </BasePageHeading>
  <div class="content quotation-images-page ai-page">
    <div
      class="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3"
    >
      <div>
        <span class="text-muted">Punto de venta:</span>
        <strong class="ms-1">{{ pointLabel }}</strong>
      </div>
      <button
        type="button"
        class="btn btn-alt-secondary btn-sm"
        :disabled="busy || !!pendingRequest"
        @click="startAgain"
      >
        Nueva lectura
      </button>
    </div>
    <div v-if="!pvId" class="alert alert-warning" role="alert">
      Seleccione un punto de venta en la cabecera del sistema para continuar.
    </div>

    <ol class="quotation-steps list-unstyled" aria-label="Etapas de la cotización">
      <li :class="{ 'text-primary': customer }">
        <span class="step-number bg-body-light"><i v-if="customer" class="fa fa-check" aria-hidden="true"></i><template v-else>1</template></span>
        <span>Cliente</span>
      </li>
      <li :class="{ 'text-primary': images.length }">
        <span class="step-number bg-body-light">2</span>
        <span>Imágenes <span class="text-muted">{{ images.length }}/3</span></span>
      </li>
      <li :class="{ 'text-primary': extracted }">
        <span class="step-number bg-body-light">3</span>
        <span>{{ created?.id ? "Borrador creado" : "Revisar y crear" }}</span>
      </li>
    </ol>
    <fieldset :disabled="disabled" class="customer-search mb-3">
      <FiltrarCliente
        title="1. Seleccionar cliente"
        :search-value="dataSearch.search || ''"
        :clients="clients"
        :loading="loadingSearch"
        :error-search="errorSearchClient"
        :show-results="showResults"
        @search-term-change="dataSearch.search = $event"
        @search-customers="search"
        @select-customer="select"
      />
    </fieldset>
    <div
      v-if="customer"
      class="bg-body-light border rounded px-3 py-2 mb-3 d-flex flex-wrap align-items-center gap-2"
    >
      <span
        ><strong>{{ customer.CLI_RAZON_SOCIAL }}</strong> ·
        {{ customer.CLI_RUC }}</span
      >
      <span class="badge bg-primary-light text-primary ms-auto">Cliente seleccionado</span>
    </div>

    <div class="quotation-workspace" :class="{ 'has-results': extracted }">
      <BaseBlock title="2. Imágenes de la solicitud" content-full class="image-panel mb-0">
        <template #options><span class="badge bg-body-light text-muted">{{ images.length }} / 3</span></template>
        <div
          class="image-dropzone rounded mb-3"
          tabindex="0"
          role="region"
          aria-label="Adjuntar imágenes: seleccione archivos, arrástrelos o pegue con Ctrl + V"
          :aria-disabled="disabled"
          @paste="pasteImages"
          :class="{ 'is-dragging': draggingImages, 'is-disabled': !canAddImages }"
          @dragenter.prevent.stop="dragEnter"
          @dragover.prevent.stop="dragOver"
          @dragleave.prevent.stop="dragLeave"
          @drop.prevent.stop="dropImages"
        >
          <p class="fw-semibold mb-2" role="status" aria-live="polite">
            {{ draggingImages ? "Suelte las imágenes para adjuntarlas" : "Arrastre imágenes, seleccione archivos o pegue con Ctrl + V" }}
          </p>
        <label for="quotation-images" class="visually-hidden"
          >Imágenes de la solicitud</label
        >
        <input
          id="quotation-images"
          type="file"
          class="form-control form-control-sm"
          accept="image/jpeg,image/png,image/webp"
          multiple
          :disabled="disabled || images.length >= 3"
          aria-describedby="quotation-images-help"
          @change="selectFiles"
        />
        <div id="quotation-images-help" class="form-text mb-3">
          Haga clic en esta zona y presione Ctrl + V para pegar una imagen copiada.
          Hasta 3 imágenes JPG, PNG o WEBP de 2 MiB cada una. Use fotos claras y
          completas.
        </div>
        <div
          v-if="!images.length"
          class="image-empty bg-body-light rounded d-flex align-items-center gap-3 p-3 mb-3"
        >
          <i class="fa fa-images fa-2x text-primary flex-shrink-0" aria-hidden="true"></i>
          <div>
          <p class="fw-semibold mb-1">Arrastre aquí las imágenes de la solicitud</p>
          <p class="text-muted fs-sm mb-0">
            Compruebe que las descripciones y cantidades se vean completas.
          </p>
          </div>
        </div>
        </div>
        <div v-if="images.length" class="image-gallery mb-3">
          <div
            v-for="(image, index) in images"
            :key="image.url"
            class="image-card border rounded"
          >
            <div class="p-2 h-100">
              <button
                type="button"
                class="image-preview btn btn-alt-secondary w-100 mb-2 p-2"
                :aria-label="`Ampliar imagen ${index + 1}: ${image.file.name}`"
                @click="
                  previewIndex = index;
                  previewVisible = true;
                "
              >
                <img
                  :src="image.url"
                  :alt="`Solicitud ${index + 1}: ${image.file.name}`"
                  class="image-thumbnail rounded"
                />
                <span class="d-block fs-sm mt-2"
                  ><i
                    class="fa fa-magnifying-glass-plus me-1"
                    aria-hidden="true"
                  ></i>
                  Ampliar imagen {{ index + 1 }}</span
                >
              </button>
              <div
                class="d-flex align-items-center justify-content-between gap-2"
              >
                <span class="text-truncate fs-sm" :title="image.file.name">{{ image.file.name }}</span>
                <button
                  type="button"
                  class="btn btn-alt-danger btn-sm"
                  :disabled="disabled"
                  :aria-label="`Quitar ${image.file.name}`"
                  @click="removeFile(index)"
                >
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          class="read-images-button btn btn-primary"
          :disabled="disabled || !customer || !pvId || !images.length"
          @click="extract"
        >
          <i
            :class="
              extracting ? 'fa fa-spinner fa-spin me-1' : 'fa fa-image me-1'
            "
          ></i>
          {{ extracting ? "Leyendo imágenes…" : "Leer imágenes" }}
        </button>
        <p v-if="!customer && !disabled" class="text-muted fs-sm mt-2 mb-0">
          Seleccione un cliente para poder leer las imágenes.
        </p>
        <span v-if="extracting" class="d-block text-muted fs-sm mt-2" role="status"
          >La lectura puede tardar hasta un minuto.</span
        >
      </BaseBlock>

      <BaseBlock
        v-if="extracted"
        title="3. Revisar detalle"
        content-full
        class="review-panel mb-0"
      >
        <details v-if="usage" class="bg-body-light rounded px-3 py-2 mb-3 fs-sm">
          <summary class="text-muted">Consumo de la lectura · {{ usage.totalTokens ?? 'No informado' }} tokens</summary>
          <div class="d-flex flex-wrap gap-3 mt-2">
            <span>Entrada: <strong>{{ usage.inputTokens ?? 'No informado' }}</strong></span>
            <span>Salida: <strong>{{ usage.outputTokens ?? 'No informado' }}</strong></span>
            <span>Modelo: {{ usage.model }}</span>
          </div>
        </details>
        <div v-if="observations.length" class="alert alert-warning">
          <ul class="mb-0">
            <li v-for="(observation, index) in observations" :key="index">
              {{ observation }}
            </li>
          </ul>
        </div>
        <div class="d-flex flex-wrap gap-2 mb-3">
          <span class="badge bg-primary">{{ rows.length }} / 100 líneas</span
          ><span class="text-muted fs-sm"
            >Verifique cada descripción y cantidad antes de confirmar.</span
          >
        </div>

        <div v-if="!rows.length" class="alert alert-info">
          No hay líneas para crear el borrador. Puede volver a leer imágenes más
          claras o agregar el detalle.
        </div>
        <div v-else class="table-responsive">
          <table
            class="quotation-detail table table-bordered table-vcenter table-hover align-middle"
          >
            <thead class="bg-body-light">
              <tr>
                <th scope="col">#</th>
                <th scope="col">Descripción</th>
                <th scope="col" class="quantity-column">Cantidad</th>
                <th scope="col"><span class="visually-hidden">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, index) in rows" :key="row.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <textarea
                    v-model="row.texto"
                    class="form-control form-control-sm"
                    rows="2"
                    maxlength="200"
                    :disabled="locked"
                    :aria-label="`Descripción de línea ${index + 1}`"
                  ></textarea>
                  <div v-if="row.review" class="text-warning fs-sm mt-1">
                    <i class="fa fa-triangle-exclamation me-1"></i
                    >{{ row.review }}
                  </div>
                </td>
                <td>
                  <input
                    v-model="row.cantidad"
                    type="number"
                    min="0.01"
                    max="1000000"
                    step="0.01"
                    class="form-control form-control-sm"
                    :disabled="locked"
                    :aria-label="`Cantidad de línea ${index + 1}`"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    class="btn btn-alt-danger btn-sm"
                    :disabled="locked"
                    :aria-label="`Quitar línea ${index + 1}`"
                    @click="removeRow(index)"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <button
          type="button"
          class="btn btn-alt-secondary btn-sm mb-3"
          :disabled="locked || rows.length >= 100"
          @click="addRow"
        >
          <i class="fa fa-plus me-1"></i> Agregar línea
        </button>
        <div class="alert alert-warning">
          Cuando una descripción tenga varias coincidencias, el borrador puede
          incluir varios artículos para esa línea. Revise el resultado antes de
          continuar con la cotización.
        </div>
        <div v-if="pendingRequest" class="alert alert-info" role="status">
          Hay una creación pendiente para el punto de venta
          {{ pendingRequest.pv_id }}. Reintente para consultar o completar la
          misma solicitud.
        </div>
        <div class="form-check mb-3">
          <input
            id="confirm-image-details"
            v-model="confirmed"
            type="checkbox"
            class="form-check-input"
            :disabled="locked || !validRows"
          />
          <label for="confirm-image-details" class="form-check-label"
            >Revisé las descripciones y cantidades y confirmo la creación del
            borrador.</label
          >
        </div>
        <button
          type="button"
          class="btn btn-primary"
          :disabled="
            busy ||
            !!created?.id ||
            (!pendingRequest && (!confirmed || !validRows))
          "
          @click="createDraft"
        >
          <i
            :class="
              creating
                ? 'fa fa-spinner fa-spin me-1'
                : 'fa fa-file-circle-plus me-1'
            "
          ></i>
          {{
            creating
              ? "Creando borrador…"
              : pendingRequest
              ? "Reintentar misma solicitud"
              : "Crear borrador"
          }}
        </button>
        <span v-if="!validRows && rows.length" class="text-danger fs-sm ms-2"
          >Complete cantidades positivas con hasta 2 decimales y descripciones
          válidas.</span
        >
      </BaseBlock>

    </div>

    <BaseBlock v-if="created" title="Resultado" content-full class="mt-3 mb-3">
      <div
        :class="created.id ? 'alert alert-success' : 'alert alert-warning'"
        role="status"
      >
        <strong>{{
          created.id
            ? `Borrador ${created.numero} creado.`
            : "No se creó un borrador: no se encontraron artículos disponibles."
        }}</strong>
        <span v-if="created.replayed">
          Se recuperó el resultado de la misma solicitud.</span
        >
      </div>
      <p>
        {{ created.incluidos?.length || 0 }} artículos incluidos ·
        {{ created.omitidos?.length || 0 }} omitidos.
      </p>
      <div v-if="created.incluidos?.length" class="table-responsive">
        <table class="table table-sm">
          <thead class="bg-body-light">
            <tr>
              <th>Código</th>
              <th>Cantidad</th>
              <th>Unidad</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in created.incluidos" :key="index">
              <td>{{ item.codigo }}</td>
              <td>{{ item.cantidad }}</td>
              <td>{{ item.unidad }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <ul v-if="created.omitidos?.length" class="text-warning">
        <li v-for="(item, index) in created.omitidos" :key="index">
          {{ item.codigo }}: {{ (item.razones || []).join("; ") }}
        </li>
      </ul>
      <ul v-if="created.advertencias?.length" class="text-warning">
        <li v-for="(item, index) in created.advertencias" :key="index">
          {{ item.mensaje || item }}
        </li>
      </ul>
      <router-link
        v-if="created.id"
        :to="{
          name: 'ventas-crearcotizacion',
          query: { id: created.id, mode: 'restore_quote' },
        }"
        class="btn btn-primary"
      >
        <i class="fa fa-arrow-right me-1"></i> Continuar con la cotización
      </router-link>
    </BaseBlock>
  </div>
  <VueEasyLightbox
    :visible="previewVisible"
    :imgs="previewImages"
    :index="previewIndex"
    @hide="previewVisible = false"
  />
</template>

<style scoped>
.quotation-images-page {
  padding-top: 1rem;
}
.quotation-steps {
  display: flex;
  flex-wrap: wrap;
  gap: .75rem 2rem;
  margin-bottom: 1rem;
  font-size: .78rem;
  font-weight: 600;
}
.quotation-steps li {
  display: flex;
  align-items: center;
  gap: .5rem;
}
.step-number {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  font-size: .75rem;
}
.customer-search {
  min-width: 0;
}
.customer-search :deep(.block) {
  padding-bottom: .5rem !important;
}
.quotation-images-page :deep(.block-header) {
  padding: .75rem 1rem;
}
.quotation-images-page :deep(.block-content) {
  padding: 1rem;
}
.quotation-workspace {
  display: grid;
  gap: 1rem;
  align-items: start;
}
.image-panel,
.review-panel {
  min-width: 0;
}
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: .75rem;
}
.image-card {
  min-width: 0;
  overflow: hidden;
}
.image-thumbnail {
  display: block;
  width: 100%;
  height: 220px;
  object-fit: contain;
}
.image-preview:focus-visible {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}
.image-dropzone {
  padding: 0.65rem 0.75rem;
  border: 1px dashed var(--tuval-border, var(--bs-border-color));
  transition: border-color .15s, background-color .15s;
}
.image-dropzone:focus-visible {
  outline: 2px solid var(--bs-primary);
  outline-offset: 2px;
}
.image-dropzone.is-dragging {
  border-color: var(--bs-primary);
  background: rgba(var(--bs-primary-rgb), 0.08);
}
.image-dropzone.is-disabled {
  opacity: .65;
}
.image-empty {
  border: 1px dashed var(--bs-border-color);
}
.has-results .read-images-button {
  width: 100%;
}
.quotation-detail {
  min-width: 480px;
}
.quotation-detail .quantity-column {
  width: 115px;
}
.quotation-detail textarea {
  min-height: 58px;
  resize: vertical;
}
@media (min-width: 1200px) {
  .quotation-workspace.has-results {
    grid-template-columns: minmax(280px, 1fr) minmax(0, 2.2fr);
  }
  .has-results .image-gallery {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 575.98px) {
  .quotation-steps {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: .5rem;
    font-size: .75rem;
  }
  .quotation-steps li {
    flex-direction: column;
    text-align: center;
    gap: .25rem;
  }
  .read-images-button {
    width: 100%;
  }
  .image-gallery {
    grid-template-columns: 1fr;
  }
}
</style>

<style scoped lang="scss" src="@/assets/scss/ai-views.scss"></style>
