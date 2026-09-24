
<script setup>
import { computed, ref, watch } from "vue";
import { useArticleSegmentClassification } from "@/composables/venta/cotizaciones/crearCotizacion/useArticleSegmentClassification";
import { useItemLAlternativeSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useItemLAlternativeSearch";
import { swalError, swalWarning } from "@/functions/swal-alert";

const props = defineProps({
  item: {
    type: [Object, Array],
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
  indice: {
    type: Number,
    required: true,
  },
});
const emit = defineEmits([
  "update-classification",
  "select-alternative",
  "update-alternative-status",
]);

const {
  itemLSearchFilters,
  itemLAlternatives,
  loadingItemLSearch,
  itemLSearchError,
  fetchItemLDescriptionAlternatives,
} = useItemLAlternativeSearch();
const {
  loadingConfig,
  segmentFilters,

  categoryList,
  lineList,
  classList,

  //limpieza
  clearSegmentFilters,
  //api que me trae la configuracion
  fetchSegmentClassificationConfig,
} = useArticleSegmentClassification();

const article = computed(() => props.item);
const hasSearched = ref(false);
const filtersGroup = computed(() => [
  {
    title: "Categoría",
    filterKey: "codigoCategoria",
    options: categoryList.value ?? [],
    emptyText: "No hay categorías disponibles",
  },
  {
    title: "Línea",
    filterKey: "codigoLinea",
    options: lineList.value ?? [],
    emptyText: segmentFilters.codigoCategoria
      ? "No hay líneas disponibles"
      : "Selecciona una categoría",
  },
  {
    title: "Clase",
    filterKey: "codigoClase",
    options: classList.value ?? [],
    emptyText: segmentFilters.codigoLinea
      ? "No hay clases disponibles"
      : "Selecciona una línea",
  },
]);

const isSearchReady = computed(
  () =>
    Boolean(itemLSearchFilters.categoria) &&
    Boolean(itemLSearchFilters.linea) &&
    Boolean(itemLSearchFilters.clase)
);

function isSelectedOption(filterKey, option) {
  return segmentFilters[filterKey] === option.value;
}

function selectOption(filterKey, option) {
  const value = option.value;
  const nextValue = segmentFilters[filterKey] === value ? "" : value;

  if (filterKey === "codigoCategoria") {
    segmentFilters.codigoCategoria = nextValue;
    segmentFilters.codigoLinea = "";
    segmentFilters.codigoClase = "";
  }

  if (filterKey === "codigoLinea") {
    segmentFilters.codigoLinea = nextValue;
    segmentFilters.codigoClase = "";
  }

  if (filterKey === "codigoClase") {
    segmentFilters.codigoClase = nextValue;
  }

  hasSearched.value = false;
  itemLAlternatives.value = [];
  itemLSearchError.value = null;
  emit("update-classification", {
    index: props.indice,
    categoria: segmentFilters.codigoCategoria,
    linea: segmentFilters.codigoLinea,
    clase: segmentFilters.codigoClase,
  });
  emit("update-alternative-status", {
    index: props.indice,
    message: "",
  });
}

async function searchAlternatives() {
  if (!isSearchReady.value) {
    swalWarning("Selecciona una categoría, una línea y una clase");
    return;
  }

  await fetchItemLDescriptionAlternatives();
  hasSearched.value = true;

  if (!itemLSearchError.value) {
    emit("update-alternative-status", {
      index: props.indice,
      message: itemLAlternatives.value.length
        ? ""
        : "No existen descripciones alternativas para la configuración seleccionada.",
    });
  }
}

function selectAlternative(alternative) {
  emit("select-alternative", {
    index: props.indice,
    alternative,
  });
  emit("update-alternative-status", {
    index: props.indice,
    message: "",
  });
}

function isAlternativeSelected(alternative) {
  return (
    article.value?.ART_DESCRIPCION === alternative.ART_DESCRIPCION &&
    article.value?.ART_DESCRIPCION_ORIGINAL === alternative.ART_DESCRIPCION
  );
}

function loadItemClassification(item) {
  segmentFilters.codigoCategoria = item?.cod_categoria || "";
  segmentFilters.codigoLinea = item?.cod_linea || "";
  segmentFilters.codigoClase = item?.cod_clase || "";
  hasSearched.value = false;
  itemLAlternatives.value = [];
  itemLSearchError.value = null;
}

watch(
  () => [
    segmentFilters.codigoCategoria,
    segmentFilters.codigoLinea,
    segmentFilters.codigoClase,
  ],
  ([categoria, linea, clase]) => {
    itemLSearchFilters.categoria = categoria;
    itemLSearchFilters.linea = linea;
    itemLSearchFilters.clase = clase;
  },
  { immediate: true }
);

watch(
  () => props.form?.segmento?.coAtrHijo,
  async (codigoSegmento) => {
    if (!codigoSegmento) {
      clearSegmentFilters();
      return;
    }

    clearSegmentFilters();
    segmentFilters.codigoSegmento = codigoSegmento;
    const resp = await fetchSegmentClassificationConfig();
    if (resp && !resp.ok) {
      const msg =
        resp?.message || "No se pudo actualizar el estado del usuario";
      (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    }

    loadItemClassification(props.item);
  },
  { immediate: true }
);

watch(
  () => props.item,
  (item) => loadItemClassification(item),
  { immediate: true }
);
</script>

<template>
  <BaseBlock
    :title="`Clasificación y descripción del ítem L · ${
      article?.ART_CODIGO || ''
    }`"
    class="mb-0"
    transparent
  >
    <template #options>
      <button
        type="button"
        class="btn-block-option"
        data-bs-dismiss="modal"
        aria-label="Cerrar"
      >
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>

    <template #content>
      <div class="block-content">
        <p class="text-muted fs-sm mb-3">
          Selecciona la clasificación del artículo para consultar sus
          descripciones alternativas.
        </p>

        <div class="segment-box border rounded p-3">
          <div class="row g-3 align-items-start">
            <div
              v-for="group in filtersGroup"
              :key="group.filterKey"
              class="col-12 col-md-4"
            >
              <div class="segment-group">
                <small class="fw-bold text-uppercase text-muted d-block mb-2">
                  {{ group.title }}
                </small>

                <div
                  v-if="loadingConfig"
                  class="text-muted small py-2 d-flex align-items-center gap-2"
                >
                  <span
                    class="spinner-border spinner-border-sm"
                    aria-hidden="true"
                  ></span>
                  Cargando...
                </div>

                <div v-else-if="group.options.length" class="option-list">
                  <button
                    v-for="option in group.options"
                    :key="`${group.filterKey}-${option.value}`"
                    type="button"
                    class="segment-option border-0 text-start py-2 px-2 rounded w-100"
                    :class="{
                      active: isSelectedOption(group.filterKey, option),
                    }"
                    @click="selectOption(group.filterKey, option)"
                  >
                    <span class="text-truncate d-block">
                      {{ option.label }}
                    </span>
                  </button>
                </div>

                <div v-else class="empty-options text-muted small rounded p-2">
                  {{ group.emptyText }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="itemLSearchError" class="alert alert-danger mt-3 mb-0">
          {{ itemLSearchError }}
        </div>

        <div v-if="hasSearched && !itemLSearchError" class="mt-4">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <h6 class="mb-0">Descripciones alternativas</h6>
            <span
              v-if="itemLAlternatives.length"
              class="badge bg-primary-subtle text-primary"
            >
              {{ itemLAlternatives.length }} resultado(s)
            </span>
          </div>

          <div v-if="itemLAlternatives.length" class="alternative-list">
            <button
              v-for="alternative in itemLAlternatives"
              :key="alternative.id"
              type="button"
              class="alternative-option border rounded p-3 text-start w-100 mb-2"
              :class="{
                active: isAlternativeSelected(alternative),
              }"
              @click="selectAlternative(alternative)"
            >
              <span class="d-flex align-items-start gap-2">
                <i
                  class="fa mt-1"
                  :class="
                    isAlternativeSelected(alternative)
                      ? 'fa-circle-check text-success'
                      : 'fa-file-lines text-muted'
                  "
                ></i>
                <span class="flex-grow-1">
                  <span class="fw-semibold d-block mb-1">
                    {{ alternative.ART_CODIGO }}
                  </span>
                  <span class="fs-sm d-block">
                    {{ alternative.ART_DESCRIPCION }}
                  </span>
                </span>
              </span>
            </button>
          </div>

          <div v-else class="empty-results text-center rounded py-4 px-3">
            <i class="fa fa-circle-info text-muted fa-2x mb-2"></i>
            <p class="text-muted mb-0">
              No se encontraron descripciones alternativas para esta
              clasificación.
            </p>
          </div>
        </div>
      </div>
    </template>
  </BaseBlock>

  <div class="block-content block-content-full bg-body-light">
    <div class="d-flex justify-content-end gap-2">
      <button
        type="button"
        class="btn btn-sm btn-outline-secondary"
        data-bs-dismiss="modal"
      >
        Cerrar
      </button>
      <button
        type="button"
        class="btn btn-sm btn-primary"
        :disabled="!isSearchReady || loadingConfig || loadingItemLSearch"
        @click="searchAlternatives"
      >
        <i
          class="fa me-1"
          :class="loadingItemLSearch ? 'fa-spinner fa-spin' : 'fa-search'"
        ></i>
        {{ loadingItemLSearch ? "Buscando..." : "Buscar alternativas" }}
      </button>
    </div>
  </div>
</template>

<style lang="css" scoped>
.segment-box {
  max-width: 100%;
  background-color: var(--bs-body-bg);
}

.segment-group {
  min-width: 0;
}

.option-list {
  max-height: 230px;
  overflow-y: auto;
}

.segment-option {
  color: inherit;
  background-color: transparent;
  font-size: small;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.segment-option:hover {
  color: var(--tuval-primary, var(--bs-primary));
  background-color: var(--bs-light);
}

.segment-option.active {
  color: var(--tuval-primary, var(--bs-primary));
  background-color: var(--tuval-primary-soft, var(--bs-light));
  font-weight: 600;
}

.empty-options {
  background-color: var(--bs-light);
}

.alternative-list {
  max-height: 280px;
  overflow-y: auto;
}

.alternative-option {
  color: inherit;
  background-color: var(--bs-body-bg);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.alternative-option:hover {
  border-color: var(--bs-primary) !important;
  background-color: var(--bs-light);
}

.alternative-option.active {
  border-color: var(--bs-success) !important;
  background-color: rgba(var(--bs-success-rgb), 0.08);
  box-shadow: 0 0 0 1px rgba(var(--bs-success-rgb), 0.2);
}

.empty-results {
  background-color: var(--bs-light);
}
</style>
