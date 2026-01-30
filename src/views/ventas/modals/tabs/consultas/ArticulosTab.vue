<script setup>
import { onMounted } from 'vue';
import { useSearchArticle } from "@/composables/venta/cotizaciones/crearCotizacion/useSearchArticle";
import { formatPrice, formatPrice4, formatPrice3, formatPriceClean, format, format4 } from "@/functions";
import VueEasyLightbox from "vue-easy-lightbox";
import { swalError } from "@/functions/swal-alert";
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
    getFinlaPrice,

    //opciones transito
    fetchStockTransit,
    isShowTransit,
    isButtonTransit,
    isEmptyTransit,


    //opciones stock bodegas
    fetchStockWarehouse,
    fetchStockWarehouseConsult,
    isShowStock,
    isButtonStockWarehouse,
    isEmptyStockWarehouse,

    //opciones stock import
    fetchStockImport,
    isShowStockImport,
    isButtonStockImport,
    isEmptyStockImport
} = useSearchArticle();


async function buscarArticulo() {
    if (!validateSearch()) return;
    const resp = await fetchSearchArticles();
    if (!resp.ok) {
        swalError(resp.message);
    }
}

async function searchStockWarehouse(row) {
    const resp = await fetchStockWarehouseConsult(row);
    if (!resp.ok) {
        swalError(resp.message);
    }
    console.log(resp.data.stock, 'respuesta');

    row.stock = Array.isArray(resp.data.stock) ? resp.data.stock : [];
}

onMounted(() => { });
</script>

<template>
    <BaseBlock class="mb-3" transparent>
        <div class="block-content fs-sm  p-0 rounded mb-2">
            <div class="row g-2 align-items-end">
                <div class="col-md-5">
                    <small class="fw-bold text-uppercase text-muted" style="font-size: 10px;">Código Zafiro</small>
                    <div class="input-group input-group-sm">
                        <select class="form-select border-1 shadow-sm" style="flex: 0 0 170px;"
                            v-model="payload.select_codigo">
                            <option v-for="(op, index) in searchOptions" :key="index" :value="op.value"> {{ op.label
                                }}</option>
                        </select>
                        <input type="text" class="form-control border-1 shadow-sm" v-model="payload.text_codigo"
                            @keyup.enter="buscarArticulo" />
                    </div>
                </div>
                <div class="col-12 col-md-1">
                    <small class="fw-bold text-uppercase text-muted" style="font-size: 10px;">Codigo 3L</small>
                    <input type="text" class="form-control form-control-sm border-1 shadow-sm" id="codigo3l"
                        v-model="payload.codigo3l" @keyup.enter="buscarArticulo" />
                </div>
                <div class="col-md-5">
                    <small class="fw-bold text-uppercase text-muted" style="font-size: 10px;">NOMBRE/Descripción</small>
                    <div class="input-group input-group-sm">
                        <select class="form-select border-1 shadow-sm" style="flex: 0 0 170px;"
                            v-model="payload.select_nombre">
                            <option v-for="(op, index) in searchOptions" :key="index" :value="op.value"> {{ op.label
                                }}</option>
                        </select>
                        <input type="text" class="form-control border-1 shadow-sm" v-model="payload.text_nombre"
                            @keyup.enter="buscarArticulo" />
                    </div>
                </div>
                <div class="col-12 col-md-1">
                    <small class="fw-bold text-uppercase text-muted" style="font-size: 10px;">Terminal</small>
                    <input type="text" class="form-control form-control-sm border-1 shadow-sm"
                        v-model="payload.terminal" @keyup.enter="buscarArticulo" />
                </div>
                <div class="col-12 text-end mt-3 ">
                    <button type="button" class="btn btn-sm btn-alt-secondary me-2" @click="resetSearch">
                        <i class="fa fa-eraser"></i>
                    </button>
                    <button class="btn btn-sm btn-primary px-4" @click="buscarArticulo">
                        <i class="fa fa-search me-1"></i> Buscar
                    </button>
                </div>
            </div>
        </div>
        <div v-if="loadingArt" class="text-center py-4">
            <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
            </div>
        </div>
        <!-- detalle de busqueda -->
        <div v-if="articles.length > 0 && !loadingArt" class="table-responsive">
           <table class="table table-sm table-hover align-middle mb-0 ">
                <thead>
                    <tr>
                        <th class="fs-sm"></th>
                        <th class="fs-sm"><small class="fw-bold text-uppercase text-muted"
                                style="font-size: 12px;">CODIGO</small> </th>
                        <th class="fs-sm"><small class="fw-bold text-uppercase text-muted" style="font-size: 12px;">COD.
                                ZAFIRO</small> </th>
                        <th class="fs-sm"><small class="fw-bold text-uppercase text-muted"
                                style="font-size: 12px;">DESCRIPCION</small> </th>
                        <th class="fs-sm"><small class="fw-bold text-uppercase text-muted"
                                style="font-size: 12px;">MARCA</small> </th>
                        <th class="fs-sm"><small class="fw-bold text-uppercase text-muted"
                                style="font-size: 12px;">MATERIAL</small> </th>
                        <th class="fs-sm"><small class="fw-bold text-uppercase text-muted"
                                style="font-size: 12px;">CTL</small> </th>
                        <th class="fs-sm"><small class="fw-bold text-uppercase text-muted" style="font-size: 12px;">UND.
                                MEDIDA</small> </th>
                        <th class="fs-sm text-center"><small class="fw-bold text-uppercase text-muted"
                                style="font-size: 12px;">STOCK</small> </th>
                        <th class="fs-sm text-end"><small class="fw-bold text-uppercase text-muted"
                                style="font-size: 12px;">PRECIO LISTA</small> </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in articles" :key="index"
                        :class="item.debe_resaltar ? 'table-danger fs-sm' : ''">
                        <td>
                            <a v-if="item.imagenes.length" href="javascript:void(0)" @click="showPhoto(item.imagenes)">
                                <i class="fa fa-search"></i>
                            </a>
                        </td>
                        <td class="fs-sm code nums kv">{{ item.ART_CODIGO }}</td>
                        <td class="fs-sm  code nums kv">{{ item.ART_CODIGO_ZAFIRO }}</td>
                        <td class="fs-sm mini text-wrap">{{ item.ART_DESCRIPCION }}</td>
                        <td class="fs-sm">{{ item.ART_MARCA }}</td>
                        <td class="fs-sm">{{ item.ART_MATERIAL }}</td>
                        <td class="fs-sm">{{ item.ART_CODIGO_TRES_LETRAS }}</td>
                        <td class="fs-sm">{{ item.ART_PLAN_UMEDIDA }}</td>
                        <td class="fs-sm fw-medium text-muted mb-0 text-center"
                            style="width: 7.5rem; justify-content: center;">
                            <div v-if="item.loadingStockWarehouse" class="text-center">
                                <div class="spinner-border spinner-border-sm text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                            <div v-else-if="isShowStock(item)">
                                <code v-for="stock in item.stock" class="d-block mb-0 fs-xs text-nowrap"
                                    :key="stock.STO_ART_BODEGA">{{ stock.STO_ART_BODEGA }} - {{ stock.STO_ART_STOCK_DISPONIBLE }}</code>
                            </div>
                            <div v-else-if="isButtonStockWarehouse(item)">
                                <button class="btn btn-sm btn-primary" @click="searchStockWarehouse(item)">
                                    <i class="fa fa-search"></i>
                                </button>
                            </div>
                            <div v-else-if="isEmptyStockWarehouse(item)">
                                <code> - </code>
                            </div>
                        </td>
                        <td class="text-end">
                            <p  v-for="precio in item.precios" :key="precio.id" class="fs-sm text-muted mb-0 text-nowrap">
                                {{ precio.idLista }} <span class="fw-medium mini">${{
                                    format(parseFloat(precio.valor || 0)) }}</span>
                            </p>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </BaseBlock>
    <VueEasyLightbox :visible="gallery.visible" :index="gallery.index" :imgs="gallery.photos" @hide="handleHide" />

</template>

<style lang="css" scoped>
.table.table-sm>:not(caption)>*>* {
    padding-top: .35rem;
    padding-bottom: .25rem;
}

.sticky-header thead th {
    position: sticky;
    top: 0;
    background: var(--bs-body-bg);
    z-index: 1;
}


/* Números monoespaciados */
.code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
    font-size: 14px;
}

.nums {
    font-variant-numeric: tabular-nums;
}

.mini {
    font-size: .85rem;
}


/* Chips de cotización */
.chips-wrap {
    display: flex;
    flex-wrap: wrap;
    gap: .375rem;
}

.chip {
    padding: .15rem .5rem;
    border-radius: 999px;
    background: #0b1727;
    color: #e6e9ef;
    border: 1px solid #334155;
    font-size: .72rem;
}

/* Key–value */
.kv .fw-semibold {
    line-height: 1.1;
}
</style>
