<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import { useArticleSegmentClassification } from "@/composables/venta/cotizaciones/crearCotizacion/useArticleSegmentClassification";
import { swalError, swalWarning } from '@/functions/swal-alert';
const props = defineProps({
  'form': {
    type: Object,
    required: true
  }
});

const articles = ref(null);
const {
  loadingConfig,
  segmentFilters,

  categoryList,
  lineList,
  classList,
  marcaList,


  //limpieza
  clearSegmentFilters,
  //api que me trae la configuracion
  fetchSegmentClassificationConfig,

} = useArticleSegmentClassification(articles);

watch(
  () => props.form?.segmento?.coAtrHijo,
  async (codigoSegmento) => {
    if (!codigoSegmento) {
      clearSegmentFilters();
      return
    }

    clearSegmentFilters();
    segmentFilters.codigoSegmento = codigoSegmento;
    const resp = await fetchSegmentClassificationConfig();
    if (resp && !resp.ok) {
      const msg = resp?.message || "No se pudo actualizar el estado del usuario";
      (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    }
  },
  { immediate: true }
);

const filtersGroup = computed(() => [
  {
    title: "Categoria",
    options: categoryList.value ?? [],
    filterKey: "codigoCategoria",
    selected: segmentFilters.codigoCategoria
  },
  {
    title: "Linea",
    filterKey: "codigoLinea",
    options: lineList.value ?? [],
    selected: segmentFilters.codigoLinea,
  },
  {
    title: "Clase",
    filterKey: "codigoClase",
    options: classList.value ?? [],
    selected: segmentFilters.codigoClase,
  }, {
    title: "Marca",
    filterKey: "codigoMarca",
    options: marcaList.value ?? [],
    selected: segmentFilters.codigoMarca,
  }
]);



function normalizeStarsLevel(level) {
  const value = Number(level) || 0;
  return Math.min(Math.max(value, 0), 5);
}

function isSelectedOption(filterKey, option) {
  return segmentFilters[filterKey] === option.value;
}

function selectionOptions(filterKey, option) {

  const value = option.value;
  const isSameOption = segmentFilters[filterKey] === value;
  if (filterKey === "codigoCategoria") {
    segmentFilters.codigoCategoria = isSameOption ? "" : value;
    segmentFilters.codigoLinea = "";
    segmentFilters.codigoClase = "";
  }
  if (filterKey === "codigoLinea") {
    segmentFilters.codigoLinea = isSameOption ? "" : value;
    segmentFilters.codigoClase = "";
  }
  if (filterKey === "codigoClase") {
    segmentFilters.codigoClase = isSameOption ? "" : value;
    segmentFilters.codigoMarca = "";
  }
  if(filterKey === "codigoMarca"){
    segmentFilters.codigoMarca = isSameOption ? "" : value;
  }
}




onMounted(() => { });
</script>

<template>
  <BaseBlock title="Lineas potenciales" btn-option-content class="mb-2">
    <div class="segment-box mt-0 px-2 py-2 border rounded mb-2">
      <div class="row g-2 align-items-start">
        <div v-for="group in filtersGroup" :key="group.filterKey" class="col-12 col-md-4 col-lg-3">
          <div class="segment-group">


            <small class="fw-bold text-uppercase text-muted d-block mb-1">
              {{ group.title }}
            </small>
            <div v-if="loadingConfig" class="text-muted small mt-2">
              Cargando...
            </div>
            <div v-else class="mt-2">
              <div v-for="option in group.options" :key="`${group.filterKey}-${option.value}-${option.nivel}`"
                class="segment-option d-flex align-items-center justify-content-between text-start py-1 px-2 rounded  cursor-pointer w-100"
                :class="{ active: isSelectedOption(group.filterKey, option) }"
                @click="selectionOptions(group.filterKey, option)">
                <span class="text-truncate me-2">
                  {{ option.label }}
                </span>
                <span class="stars text-nowrap" :title="`Nivel ${normalizeStarsLevel(option.nivel)} de 5`">
                  <span v-for="star in 5" :key="star" class="star"
                    :class="{ filled: star <= normalizeStarsLevel(option.nivel) }">
                    ★
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </BaseBlock>
</template>

<style lang="css" scoped>
.segment-box {
  max-width: 100%;
}

.segment-group {
  max-width: 390px;
  margin: 0 auto;
}

.segment-option {
  font-size: small;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.segment-option:hover .star.filled {
  color: var(--bs-warning);
  transform: scale(1.08);
}

.segment-option.active {
  color: var(--tuval-primary, var(--bs-primary));
  background-color: var(--tuval-primary-soft, var(--bs-body-bg));
  font-weight: 600;
}

.stars {
  min-width: 78px;
  text-align: right;
  letter-spacing: 1px;
  display: inline-flex;
  justify-content: flex-end;
  gap: 1px;
}

.star {
  font-size: 13px;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  opacity: 0.45;
  line-height: 1;
  transition:
    transform 0.15s ease,
    color 0.15s ease,
    opacity 0.15s ease;
}

.star.filled {
  color: var(--bs-warning);
  opacity: 1;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
