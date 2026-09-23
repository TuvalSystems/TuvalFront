<script setup>
import { useSearchArticle } from "@/composables/venta/cotizaciones/crearCotizacion/useSearchArticle";
import { onMounted, watch } from "vue";
import { swalError } from "@/functions/swal-alert";
import VueEasyLightbox from "vue-easy-lightbox";
import { formatPrice } from "@/functions";

const props = defineProps({
  form: Object,
});
const emit = defineEmits(["closeModal", "select-item"]);

const {
  payload,
  cols,
  onSort,
  sortBy,
  searchOptions,
  //galeria
  gallery,
  showPhoto,
  handleHide,

  //validacion busqueda
  validateSearch,

  //reset
  resetSearch,

  //busqueda
  articles,
  loadingArt,
  fetchSearchArticles,

  //opciones de articulos
  isSelectable,
  getFinalPrice,

  //opciones transito
  fetchStockTransit,
  isShowTransit,
  isButtonTransit,
  isEmptyTransit,

  //opciones stock bodegas
  fetchStockWarehouse,
  isShowStock,
  isButtonStockWarehouse,
  isEmptyStockWarehouse,

  //opciones exposicion
  isEmptyStockExposicion,
  isButtonStockExposicion,
  isShowStockExposicion,
  fetchStockExposicion,
} = useSearchArticle();

watch(
  () => props.form?.cliente?.CLI_NIVEL_PRECIO,
  (newVal) => {
    if (newVal) {
      payload.nivel_precio = newVal;
    }
  },
  { immediate: true, deep: true }
);

async function buscarArticulo() {
  if (!validateSearch()) return;
  const resp = await fetchSearchArticles();
  if (!resp.ok) {
    swalError(resp.message);
    return;
  }
}

async function searchStockTransit(row) {
  const resp = await fetchStockTransit(row, props.form);
  if (!resp.ok) {
    swalError(resp.message);
    return;
  }
}

async function searchStockWarehouse(row) {
  const resp = await fetchStockWarehouse(row, props.form);
  if (!resp.ok) {
    swalError(resp.message);
    return;
  }
}

async function searchStockExposicion(row) {
  const resp = await fetchStockExposicion(row);
  if (!resp.ok) {
    swalError(resp.message);
    return;
  }
}

async function addItemToQuote(row) {
  await searchStockWarehouse(row);
  row.descuento = props.form.cliente?.CLI_DSTO_COMERCIAL || 0;
  row.descuento_original = props.form.cliente?.CLI_DSTO_COMERCIAL || 0;
  emit("select-item", row);
}

async function closeModal() {
  await resetSearch();
  emit("closeModal");
}

onMounted(() => {});
</script>

<template>
  <BaseBlock title="Seleccionar artículo" class="mb-0" transparent>
    <template #options>
      <button
        type="button"
        class="btn-block-option"
        data-bs-dismiss="modal"
        aria-label="Close"
        @click="closeModal"
      >
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <!-- cabecera de busqueda -->
    <div class="block-content fs-sm p-0 rounded">
      <div class="row g-2 align-items-end">
        <div class="col-md-5">
          <small
            class="fw-bold text-uppercase text-muted"
            style="font-size: 10px"
            >Código Zafiro</small
          >
          <div class="input-group input-group-sm">
            <select
              class="form-select border-1 shadow-sm"
              style="flex: 0 0 170px"
              v-model="payload.select_codigo"
            >
              <option
                v-for="(op, index) in searchOptions"
                :key="index"
                :value="op.value"
              >
                {{ op.label }}
              </option>
            </select>
            <input
              type="text"
              class="form-control border-1 shadow-sm"
              v-model="payload.text_codigo"
              @keyup.enter="buscarArticulo"
            />
          </div>
        </div>
        <div class="col-12 col-md-1">
          <small
            class="fw-bold text-uppercase text-muted"
            style="font-size: 10px"
            >Codigo 3L</small
          >
          <input
            type="text"
            class="form-control form-control-sm border-1 shadow-sm"
            id="codigo3l"
            v-model="payload.codigo3l"
            @keyup.enter="buscarArticulo"
          />
        </div>
        <div class="col-md-5">
          <small
            class="fw-bold text-uppercase text-muted"
            style="font-size: 10px"
            >NOMBRE/Descripción</small
          >
          <div class="input-group input-group-sm">
            <select
              class="form-select border-1 shadow-sm"
              style="flex: 0 0 170px"
              v-model="payload.select_nombre"
            >
              <option
                v-for="(op, index) in searchOptions"
                :key="index"
                :value="op.value"
              >
                {{ op.label }}
              </option>
            </select>
            <input
              type="text"
              class="form-control border-1 shadow-sm"
              v-model="payload.text_nombre"
              @keyup.enter="buscarArticulo"
            />
          </div>
        </div>
        <div class="col-12 text-end mt-3">
          <button
            class="btn btn-sm btn-alt-secondary me-2"
            @click="resetSearch"
          >
            <i class="fa fa-eraser"></i>
          </button>
          <button class="btn btn-sm btn-primary px-4" @click="buscarArticulo">
            <i class="fa fa-search me-1"></i> Buscar
          </button>
        </div>
      </div>
    </div>

    <div v-if="loadingArt" class="text-center py-4">
      <div class="spinner-border text-primary mt-4">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <!-- detalle de busqueda -->
    <div
      v-if="articles.length > 0 && !loadingArt"
      class="block-content block-content-full"
    >
      <Dataset
        v-slot="{ ds }"
        :ds-data="articles"
        :ds-sortby="sortBy"
        :ds-search-in="[
          'ART_CODIGO',
          'ART_DESCRIPCION',
          'ART_CODIGO_TRES_LETRAS',
          'ART_PLAN_UMEDIDA',
          'ART_STOCK',
          'ART_VALOR',
        ]"
      >
        <div class="row" :data-page-count="ds.dsPagecount">
          <div id="datasetLengthPedidos" class="col-md-8 py-1">
            <DatasetShow :ds-show-entries="100" />
          </div>
          <div class="col-md-4 py-0">
            <DatasetSearch ds-search-placeholder="Buscar..." />
          </div>
        </div>
        <div
          class="d-flex flex-md-row flex-column justify-content-between align-items-center"
        >
          <DatasetInfo class="py-3 fs-sm" />
          <DatasetPager class="flex-wrap py-1 fs-sm" />
        </div>
        <hr />

        <!-- table de items cargados -->
        <div class="table-responsive">
          <table class="table table-sm table-hover table-vcenter mb-0">
            <thead>
              <tr>
                <th></th>
                <th
                  v-for="(th, index) in cols"
                  :key="th.field"
                  :class="['sort', th.sort]"
                  @click="onSort($event, index)"
                  class="text-center"
                >
                  {{ th.name }} <i class="gg-select float-end"></i>
                </th>
              </tr>
            </thead>
            <DatasetItem tag="tbody" class="fs-sm">
              <template #default="{ row }">
                <tr :class="row.debe_resaltar ? 'table-danger fs-sm' : ''">
                  <td>
                    <a
                      v-if="row.imagenes.length"
                      href="javascript:void(0)"
                      @click="showPhoto(row.imagenes)"
                    >
                      <i class="fa fa-search"></i>
                    </a>
                  </td>
                  <td
                    class="fs-sm"
                    style="width: 7.5rem; justify-content: center"
                  >
                    <a
                      v-if="isSelectable(row)"
                      href="javascript:void(0)"
                      @click="addItemToQuote(row)"
                      >{{ row.ART_CODIGO }}</a
                    >
                    <span v-else>{{ row.ART_CODIGO }}</span>
                  </td>
                  <td
                    class="fs-sm"
                    style="width: 7.5rem; justify-content: center"
                  >
                    <a
                      v-if="isSelectable(row)"
                      href="javascript:void(0)"
                      @click="addItemToQuote(row)"
                      >{{ row.ART_CODIGO_ZAFIRO }}</a
                    >
                    <span v-else>{{ row.ART_CODIGO_ZAFIRO }}</span>
                  </td>
                  <td class="fs-sm">
                    <a
                      v-if="isSelectable(row)"
                      href="javascript:void(0)"
                      @click="addItemToQuote(row)"
                      >{{ row.ART_DESCRIPCION }}</a
                    >
                    <span v-else>{{ row.ART_DESCRIPCION }}</span>
                  </td>
                  <td
                    class="fs-sm"
                    style="width: 4rem; justify-content: center"
                  >
                    {{ row.ART_CODIGO_TRES_LETRAS }}
                  </td>
                  <td
                    class="fs-sm"
                    style="width: 4rem; justify-content: center"
                  >
                    {{ row.ART_PLAN_UMEDIDA }}
                  </td>
                  <!-- stock transito -->
                  <td
                    class="fs-sm fw-medium text-muted mb-0 text-center"
                    style="width: 7rem; justify-content: center"
                  >
                    <div v-if="row.loadingStockTransit" class="text-center">
                      <div
                        class="spinner-border spinner-border-sm text-primary"
                      >
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <div v-else-if="isShowTransit(row)">
                      <code
                        >{{ row.stockTransito.bodega }} -
                        {{ row.stockTransito.pendiente }}<br
                      /></code>
                    </div>
                    <div v-else-if="isButtonTransit(row)">
                      <button
                        class="btn btn-sm btn-warning"
                        @click="searchStockTransit(row)"
                      >
                        <i class="fa fa-search"></i>
                      </button>
                    </div>
                    <div v-else-if="isEmptyTransit(row)">
                      <code> - </code>
                    </div>
                  </td>

                  <!-- stock bodegas -->
                  <td
                    class="fs-sm fw-medium text-muted mb-0 text-center"
                    style="width: 7.5rem; justify-content: center"
                  >
                    <div v-if="row.loadingStockWarehouse" class="text-center">
                      <div
                        class="spinner-border spinner-border-sm text-primary"
                      >
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <div v-else-if="isShowStock(row)">
                      <code
                        v-for="stock in row.stock"
                        class="d-block mb-0 fs-xs text-nowrap"
                        :key="stock.STO_ART_BODEGA"
                        >{{ stock.STO_ART_BODEGA }} -
                        {{ stock.STO_ART_STOCK_DISPONIBLE }}</code
                      >
                    </div>
                    <div v-else-if="isButtonStockWarehouse(row)">
                      <button
                        class="btn btn-sm btn-primary"
                        @click="searchStockWarehouse(row)"
                      >
                        <i class="fa fa-search"></i>
                      </button>
                    </div>
                    <div v-else-if="isEmptyStockWarehouse(row)">
                      <code> - </code>
                    </div>
                  </td>

                  <!-- stock Exposicion -->
                  <td
                    class="fs-sm fw-medium text-muted mb-0 text-center"
                    style="width: 7.5rem; justify-content: center"
                  >
                    <div v-if="row.loadingStockExposicion" class="text-center">
                      <div
                        class="spinner-border spinner-border-sm text-primary"
                      >
                        <span class="visually-hidden">Loading...</span>
                      </div>
                    </div>
                    <div v-else-if="isShowStockExposicion(row)">
                      <code class="d-block mb-0 fs-xs text-nowrap"
                        >{{ row.stockExposicion.bodega }} -
                        {{ row.stockExposicion.disponible }}</code
                      >
                    </div>
                    <div v-else-if="isButtonStockExposicion(row)">
                      <button
                        class="btn btn-sm btn-primary"
                        @click="searchStockExposicion(row)"
                      >
                        <i class="fa fa-search"></i>
                      </button>
                    </div>
                    <div v-else-if="isEmptyStockExposicion(row)">
                      <code> - </code>
                    </div>
                  </td>
                  <td class="text-end" style="width: 3.5rem">
                    ${{ formatPrice(row.ART_VALOR) }}
                  </td>
                  <td class="text-end" style="width: 4rem">
                    ${{ formatPrice(getFinalPrice(row)) }}
                  </td>
                  <td class="text-end" style="width: 4rem">
                    {{ formatPrice(row.ART_PESO) }}Kg
                  </td>
                </tr>
              </template>
            </DatasetItem>
          </table>
        </div>
      </Dataset>
    </div>
    <div v-if="articles.length === 0 && !loadingArt" class="text-center py-4">
      <i class="fa fa-box-open fa-2x text-muted mb-2"></i>
      <p class="text-muted mb-0">No se encontraron registros para mostrar</p>
    </div>
  </BaseBlock>
  <div class="content text-end mb-2 space-x-2">
    <button
      type="button"
      class="btn btn-sm btn-alt-secondary me-0"
      data-bs-dismiss="modal"
      @click="closeModal"
    >
      Cerrar
    </button>
  </div>
  <VueEasyLightbox
    :visible="gallery.visible"
    :index="gallery.index"
    :imgs="gallery.photos"
    @hide="handleHide"
  />
</template>
