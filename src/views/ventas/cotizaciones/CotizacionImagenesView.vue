<script setup>
import { computed, ref } from "vue";
import VueEasyLightbox from "vue-easy-lightbox";
import { onBeforeRouteLeave } from "vue-router";
import FiltrarCliente from "@/components/ventas/cliente/FiltrarCliente.vue";
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import { useQuotationImageDraft } from "@/composables/venta/cotizaciones/useQuotationImageDraft";
import { CUSTOMER_SEARCH_MIN_LENGTH } from "@/constants/customerSearch";
import { toast } from "@/functions/swal-alert";

const {
  customer,
  images,
  rows,
  observations,
  confirmed,
  extracted,
  extracting,
  creating,
  error,
  created,
  pendingRequest,
  pvId,
  pointLabel,
  busy,
  locked,
  validRows,
  selectCustomer,
  addFiles,
  removeFile,
  extract,
  addRow,
  removeRow,
  createDraft,
  reset,
} = useQuotationImageDraft();
const { clients, errorSearchClient, dataSearch, loadingSearch, searchClients } =
  useClientSearch();
const previewVisible = ref(false);
const previewIndex = ref(0);
const previewImages = computed(() =>
  images.value.map((image) => ({ src: image.url, title: image.file.name }))
);
const showResults = ref(false);
const searchError = ref("");
const disabled = computed(() => busy.value || locked.value);

async function search() {
  if (disabled.value || loadingSearch.value) return;
  const term = String(dataSearch.search || "").trim();
  errorSearchClient.value = term.length < CUSTOMER_SEARCH_MIN_LENGTH;
  if (errorSearchClient.value) return;
  dataSearch.search = term;
  dataSearch.tipo = "proceso";
  searchError.value = "";
  const result = await searchClients();
  showResults.value = result.ok;
  if (!result.ok && !result.handled) searchError.value = result.message;
}

function select(client) {
  if (disabled.value) return;
  selectCustomer(client);
  showResults.value = false;
}

function selectFiles(event) {
  addFiles(event.target.files);
  event.target.value = "";
}

function startAgain() {
  reset();
  clients.value = [];
  dataSearch.search = "";
  showResults.value = false;
  searchError.value = "";
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
  <div class="content">
    <div
      class="d-flex justify-content-between align-items-center gap-2 flex-wrap mb-3"
    >
      <div>
        <span class="text-muted">Punto de venta actual:</span>
        <strong>{{ pointLabel }}</strong>
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
    <div v-if="error || searchError" class="alert alert-danger" role="alert">
      {{ error || searchError }}
    </div>

    <BaseBlock content-full class="mb-3">
      <ol
        class="row g-3 list-unstyled mb-0"
        aria-label="Etapas de la cotización"
      >
        <li class="col-12 col-md-4">
          <div class="d-flex align-items-center gap-3">
            <i
              :class="
                customer
                  ? 'fa fa-circle-check text-primary fa-2x'
                  : 'fa fa-user text-muted fa-2x'
              "
              aria-hidden="true"
            ></i>
            <div>
              <div class="fw-semibold">1. Cliente</div>
              <div class="fs-sm text-muted">
                {{
                  customer
                    ? "Cliente seleccionado"
                    : "Busque y seleccione el cliente"
                }}
              </div>
            </div>
          </div>
        </li>
        <li class="col-12 col-md-4">
          <div class="d-flex align-items-center gap-3">
            <i
              class="fa fa-images fa-2x"
              :class="images.length ? 'text-primary' : 'text-muted'"
              aria-hidden="true"
            ></i>
            <div>
              <div class="fw-semibold">2. Imágenes</div>
              <div class="fs-sm text-muted">
                {{ images.length }} de 3 imágenes adjuntas
              </div>
            </div>
          </div>
        </li>
        <li class="col-12 col-md-4">
          <div class="d-flex align-items-center gap-3">
            <i
              class="fa fa-file-lines fa-2x"
              :class="extracted ? 'text-primary' : 'text-muted'"
              aria-hidden="true"
            ></i>
            <div>
              <div class="fw-semibold">3. Revisión y borrador</div>
              <div class="fs-sm text-muted">
                {{
                  created?.id
                    ? "Borrador creado"
                    : extracted
                    ? `${rows.length} líneas para revisar`
                    : "Revise el detalle de la lectura"
                }}
              </div>
            </div>
          </div>
        </li>
      </ol>
    </BaseBlock>
    <fieldset :disabled="disabled" class="mb-3">
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
      class="bg-body-light border rounded p-3 mb-3 d-flex flex-wrap justify-content-between gap-2"
    >
      <span
        ><strong>{{ customer.CLI_RAZON_SOCIAL }}</strong> ·
        {{ customer.CLI_RUC }}</span
      >
      <span>PV: {{ pointLabel }}</span>
    </div>

    <BaseBlock title="2. Adjuntar imágenes" content-full class="mb-3">
      <label for="quotation-images" class="form-label"
        >Imágenes de la solicitud</label
      >
      <input
        id="quotation-images"
        type="file"
        class="form-control"
        accept="image/jpeg,image/png,image/webp"
        multiple
        :disabled="disabled || images.length >= 3"
        aria-describedby="quotation-images-help"
        @change="selectFiles"
      />
      <div id="quotation-images-help" class="form-text mb-3">
        Hasta 3 imágenes JPG, PNG o WEBP de 2 MiB cada una. Use fotos claras y
        completas.
      </div>
      <div
        v-if="!images.length"
        class="bg-body-light border rounded text-center p-4 mb-3"
      >
        <i class="fa fa-images fa-2x text-primary mb-2" aria-hidden="true"></i>
        <p class="fw-semibold mb-1">Adjunte la solicitud del cliente</p>
        <p class="text-muted fs-sm mb-0">
          Compruebe que las descripciones y cantidades se vean completas.
        </p>
      </div>
      <div class="row g-3 mb-3">
        <div
          v-for="(image, index) in images"
          :key="image.url"
          class="col-12 col-sm-6 col-xl-4"
        >
          <div class="border rounded p-2 h-100">
            <button
              type="button"
              class="btn btn-alt-secondary w-100 mb-2 p-2"
              :aria-label="`Ampliar imagen ${index + 1}: ${image.file.name}`"
              @click="
                previewIndex = index;
                previewVisible = true;
              "
            >
              <img
                :src="image.url"
                :alt="`Solicitud ${index + 1}: ${image.file.name}`"
                class="img-fluid rounded"
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
              <span class="text-truncate fs-sm">{{ image.file.name }}</span>
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
        class="btn btn-primary"
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
      <span v-if="extracting" class="text-muted fs-sm ms-2" role="status"
        >La lectura puede tardar hasta un minuto.</span
      >
    </BaseBlock>

    <BaseBlock
      v-if="extracted"
      title="3. Revisar detalle"
      content-full
      class="mb-3"
    >
      <div v-if="observations.length" class="alert alert-warning">
        <ul class="mb-0">
          <li v-for="(observation, index) in observations" :key="index">
            {{ observation }}
          </li>
        </ul>
      </div>
      <div class="d-flex flex-wrap gap-2 mb-3">
        <span class="badge bg-primary">{{ rows.length }} / 20 líneas</span
        ><span class="text-muted fs-sm"
          >Verifique cada descripción y cantidad antes de confirmar.</span
        >
      </div>
      <p class="text-muted">
        Revise las medidas y complete todas las cantidades. Puede corregir,
        agregar o quitar líneas.
      </p>
      <div v-if="!rows.length" class="alert alert-info">
        No hay líneas para crear el borrador. Puede volver a leer imágenes más
        claras o agregar el detalle.
      </div>
      <div v-else class="table-responsive">
        <table
          class="table table-bordered table-vcenter table-hover align-middle"
        >
          <thead class="bg-body-light">
            <tr>
              <th scope="col">#</th>
              <th scope="col">Descripción</th>
              <th scope="col" class="w-25">Cantidad</th>
              <th scope="col"><span class="visually-hidden">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in rows" :key="row.id">
              <td>{{ index + 1 }}</td>
              <td class="w-50">
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
        :disabled="locked || rows.length >= 20"
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

    <BaseBlock v-if="created" title="Resultado" content-full class="mb-3">
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
