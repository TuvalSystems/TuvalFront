<template>

  <BaseBlock title="Seleccionar artículo" class="mb-0">
    <template #options>
      <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
        <i class="fa fa-fw fa-times"></i>
      </button>
    </template>
    <template #content>
      <div class="block-content fs-sm">
        <div class="row">
          <div class="col-md-4">
            <label class="form-label" for="select_codigo">Código Zafiro</label>
            <div class="input-group mb-3">
              <select class="form-select btn btn-alt-primary fs-sm text-left" id="select_codigo"
                v-model="buscar_articulo.select_codigo">
                <option value="empieza">Empieza por </option>
                <option value="termina">Termina en </option>
                <option value="contiene">Contiene </option>
              </select>
              <input type="text" class="form-control" v-model="buscar_articulo.text_codigo"
                @keyup.enter="buscarArticulo" />
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label" for="codigo3l">Código 3L</label>
            <div class="input-group mb-3">
              <input type="text" class="form-control" id="codigo3l" v-model="buscar_articulo.codigo3l"
                @keyup.enter="buscarArticulo" />
            </div>
          </div>
          <div class="col-md-4">
            <label class="form-label" for="select_nombre">Nombre/Descripción</label>
            <div class="input-group mb-3">
              <select class="form-select btn btn-alt-primary fs-sm text-left" id="select_nombre"
                v-model="buscar_articulo.select_nombre">
                <option value="contiene">Contiene </option>
                <option value="termina">Termina en </option>
                <option value="empieza">Empieza por </option>
              </select>
              <input type="text" class="form-control" v-model="buscar_articulo.text_nombre"
                @keyup.enter="buscarArticulo" />
            </div>
          </div>
          <div class="col-md-2">
            <label class="form-label" for="terminal">terminal</label>
            <div class="input-group mb-3">
              <input type="text" class="form-control" id="terminal" v-model="buscar_articulo.terminal"
                @keyup.enter="buscarArticulo" />
            </div>
          </div>
        </div>
        <div class="row mb-2">
          <div class="col-md-12 text-end">
            <button class="btn btn-warning mx-1" @click="limpiarBusqueda"><i class="fa fa-eraser"></i> Limpiar</button>
            <button class="btn btn-success mx-1" @click="buscarArticulo"><i class="fa fa-search"></i> Buscar</button>
          </div>
        </div>
      </div>
      <div v-if="articulos.loading" class="text-center">
        <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div class="block-content fs-sm pt-0" v-if="!articulos.loading && articulos.data.length">
        <Dataset v-slot="{ ds }" :ds-data="articulos.data" :ds-sortby="sortBy"
          :ds-search-in="['ART_CODIGO', 'ART_DESCRIPCION', 'ART_CODIGO_TRES_LETRAS', 'ART_PLAN_UMEDIDA', 'ART_STOCK', 'ART_VALOR']">
          <div class="row" :data-page-count="ds.dsPagecount">
            <div id="datasetLengthPedidos" class="col-md-8 py-2">
              <DatasetShow :ds-show-entries="100" />
            </div>
            <div class="col-md-4 py-2">
              <DatasetSearch ds-search-placeholder="Buscar..." />
            </div>
          </div>
          <div class="d-flex flex-md-row flex-column justify-content-between align-items-center">
            <DatasetInfo class="py-3 fs-sm" />
            <DatasetPager class="flex-wrap py-3 fs-sm" />
          </div>
          <hr />
          <!-- <div v-if="pedidos.loading" class="text-center">
            <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span></div>
          </div> -->
          <div class="row" v-if="articulos.data.length">
            <div class="col-md-12">
              <div class="table-responsive">
                <table class="table table-sm table-hover table-vcenter mb-0 ">
                  <thead>
                    <tr>
                      <th></th>
                      <th v-for="(th, index) in cols" :key="th.field" :class="['sort', th.sort]"
                        @click="onSort($event, index)">
                        {{ th.name }} <i class="gg-select float-end"></i>
                      </th>
                    </tr>
                  </thead>
                  <DatasetItem tag="tbody" class="fs-sm">
                    <template #default="{ row }">
                      <tr>
                        <td>
                          <a v-if="row.imagenes.length" href="javascript:void(0)" @click="showPhoto(row.imagenes)">
                            <i class="fa fa-search"></i>
                          </a>
                        </td>
                        <td class="fs-sm">
                          <a v-if="(row.ART_TIPO_COMPRA === 'L' && row.disponible) || (row.ART_TIPO_COMPRA !== 'L' && row.ART_VALOR > 0)"
                            @click="selectArticulo(row)" href="javascript:void(0)">{{ row.ART_CODIGO }}</a>
                          <span v-else>{{ row.ART_CODIGO }}</span>
                        </td>
                        <td class="fs-sm">
                          <a v-if="(row.ART_TIPO_COMPRA === 'L' && row.disponible) || (row.ART_TIPO_COMPRA !== 'L' && row.ART_VALOR > 0)"
                            @click="selectArticulo(row)" href="javascript:void(0)">{{ row.ART_CODIGO_ZAFIRO }}</a>
                          <span v-else>{{ row.ART_CODIGO_ZAFIRO }}</span>
                        </td>
                        <td class="fs-sm">
                          <a v-if="(row.ART_TIPO_COMPRA === 'L' && row.disponible) || (row.ART_TIPO_COMPRA !== 'L' && row.ART_VALOR > 0)"
                            @click="selectArticulo(row)" href="javascript:void(0)">{{ row.ART_DESCRIPCION }}</a>
                          <span v-else>{{ row.ART_DESCRIPCION }}</span>
                        </td>
                        <td class="fs-sm">
                          {{ row.ART_CODIGO_TRES_LETRAS }}
                        </td>
                        <td class="fs-sm">
                          {{ row.ART_PLAN_UMEDIDA }}
                        </td>
                        <td class="fs-sm fw-medium text-muted mb-0 text-right" style="width: 7rem;">
                          <div v-if="(row.ART_TIPO_COMPRA != 'L' && row.stock)">
                            <code v-for="stock in row.stock"
                              :key="stock.STO_ART_BODEGA">{{ stock.STO_ART_BODEGA }} - {{ stock.STO_ART_STOCK_DISPONIBLE }}<br></code>
                          </div>
                          <div v-if="(row.ART_TIPO_COMPRA != 'L' && !row.stock & !row.loading)">
                            <button class="btn btn-sm btn-primary" @click="consultarStock(row)"><i
                                class="fa fa-magnifying-glass"></i> Ver stock</button>
                          </div>
                          <div v-if="row.loading" class="text-center">
                            <div class="spinner-border spinner-border-sm text-primary" role="status"><span
                                class="visually-hidden">Loading...</span></div>
                          </div>
                        </td>

                        <td class="fs-sm fw-medium text-muted mb-0 text-right" style="width: 7rem;">
                          <div v-if="(row.ART_TIPO_COMPRA != 'L' && row.stockImport)">
                            <code v-for="stock in row.stockImport"
                              :key="stock.STO_ART_BODEGA">{{ stock.STO_ART_BODEGA }} - {{ stock.STO_ART_STOCK_DISPONIBLE }}<br></code>
                          </div>
                          <div v-if="(row.ART_TIPO_COMPRA != 'L' && !row.stockImport & !row.loading1)">
                            <button class="btn btn-sm btn-primary" @click="consultOtherStocksImports(row)"><i
                                class="fa fa-magnifying-glass"></i>Ver stocks</button>
                          </div>
                          <div v-if="row.loading1" class="text-center">
                            <div class="spinner-border spinner-border-sm text-primary" role="status"><span
                                class="visually-hidden">Loading...</span></div>
                          </div>
                        </td>

                        <td class="text-end">
                          ${{ formatPrice(row.ART_VALOR) }}
                        </td>
                        <td class="text-end">
                          ${{ formatPrice((row.ART_VALOR - (row.ART_VALOR * 0.25)) * (1 + (row.ART_IMP_VTA / 100))) }}
                        </td>
                        <td class="text-end">
                          {{ formatPrice(row.ART_PESO) }}Kg
                        </td>
                      </tr>
                    </template>
                  </DatasetItem>
                </table>
              </div>
            </div>
          </div>
          <div class="d-flex flex-md-row flex-column justify-content-between align-items-center">
            <DatasetInfo class="py-3 fs-sm" />
            <DatasetPager class="flex-wrap py-3 fs-sm" />
          </div>
        </Dataset>
      </div>
    </template>
  </BaseBlock>
  <VueEasyLightbox :visible="gallery.visible" :index="gallery.index" :imgs="gallery.photos" @hide="handleHide" />
</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore } from 'vuex'
import { formatPrice, formatPrice4, formatPrice3, formatPriceClean, format, format4 } from "@/functions";
import { swalError } from "@/functions/swal-alert";
import VueEasyLightbox from "vue-easy-lightbox";
const store = useStore();
const articulos = computed(() => store.state.articulos);
const currentCliente = computed(() => store.state.currentCliente);
const descuentoarticulo = computed(() => store.state.descuentoarticulo);
const currentSucursal = computed(() => store.state.currentSucursal);
const buscar_articulo = computed(() => store.state.buscar_articulo);
const emit = defineEmits(["verificarProveedores", "verificarStock", "calcTotales"]);
// Sort by functionality
const sortBy = computed(() => {
  return cols.reduce((acc, o) => {
    if (o.sort) {
      o.sort === "asc" ? acc.push(o.field) : acc.push("-" + o.field);
    }
    return acc;
  }, []);
});

const gallery = reactive({
  visible: false,
  index: 0,
  photos: [],
});

function showPhoto(imagenes) {
  gallery.index = 0;
  gallery.visible = true;
  gallery.photos = imagenes;
}

// Helper function to hide the lightbox
function handleHide() {
  gallery.visible = false;
}

function limpiarBusqueda() {
  store.commit('limpiarBusqueda');
  store.commit('resetArticulo');
}

// On sort th click
function onSort(event, i) {
  let toset;
  const sortEl = cols[i];

  if (!event.shiftKey) {
    cols.forEach((o) => {
      if (o.field !== sortEl.field) {
        o.sort = "";
      }
    });
  }

  if (!sortEl.sort) {
    toset = "asc";
  }

  if (sortEl.sort === "desc") {
    toset = event.shiftKey ? "" : "asc";
  }

  if (sortEl.sort === "asc") {
    toset = "desc";
  }

  sortEl.sort = toset;
}

function buscarArticulo() {
  if (!buscar_articulo.value.text_codigo && !buscar_articulo.value.codigo3l && !buscar_articulo.value.text_nombre && !buscar_articulo.value.terminal) {
    swalError('Es necesario ingresar alguno de los parámetros de búsqueda')
    return;
  }

  let nivel_precio = 'GENERAL';
  if (currentCliente.value) {
    nivel_precio = currentCliente.value.CLI_NIVEL_PRECIO
  }

  const consulta = reactive({
    select_codigo: buscar_articulo.value.select_codigo,
    text_codigo: buscar_articulo.value.text_codigo,
    codigo3l: buscar_articulo.value.codigo3l,
    select_nombre: buscar_articulo.value.select_nombre,
    text_nombre: buscar_articulo.value.text_nombre,
    terminal: buscar_articulo.value.terminal,
    puntodeventaselect: store.state.puntodeventaselect,
    nivel_precio: nivel_precio,
  })
  store.dispatch('buscararticulo', consulta).then((res) => {
  }).catch(err => {
    swalError(err.response.data.error);
    store.commit('setArticuloLoading', false);
    store.commit('resetArticulo');
  });
}

const cols = reactive([

  {
    name: "Código GP",
    field: "ART_CODIGO",
    sort: "",
  },
  {
    name: "Código Zafiro",
    field: "ART_CODIGO_ZAFIRO",
    sort: "",
  },

  {
    name: "Descripción",
    field: "ART_DESCRIPCION",
    sort: "",
  },
  {
    name: "CTL",
    field: "ART_CODIGO_TRES_LETRAS",
    sort: "",
  },
  {
    name: "U.Med",
    field: "ART_PLAN_UMEDIDA",
    sort: "",
  },
  {
    name: "Stock bodega",
    field: "ART_STOCK",
    sort: "",
  },
  {
    name: "Otros Stock",
    field: "ART_STOCK_IMPORT",
    sort: "",
  },
  {
    name: "P.Lista",
    field: "ART_VALOR",
    sort: "",
  },
  {
    name: "P.+IVA",
    field: "ART_VALOR",
    sort: "",
  },
  {
    name: "Peso",
    field: "ART_PESO",
    sort: "",
  },
]);

function consultarStock(articulo) {
  articulo.loading = true;

  let cliente_id = null;
  if (currentCliente.value) {
    cliente_id = currentCliente.value.id;
  }

  const consulta = reactive({
    articulo: articulo,
    sucursal_id: currentSucursal.value,
    cliente_id: cliente_id,
    puntodeventa_id: store.state.puntodeventaselect,
  })
  store.dispatch('consultarStock', consulta).then(res => {
    articulo.stock = res.stock;
    articulo.ART_STOCK = res.ART_STOCK;
    articulo.loading = false;
  });
}

function consultOtherStocksImports(articulo) {
  articulo.loading1 = true;

  let cliente_id = null;
  if (currentCliente.value) {
    cliente_id = currentCliente.value.id;
  }

  const consulta = reactive({
    articulo: articulo,
    sucursal_id: currentSucursal.value,
    cliente_id: cliente_id,
    puntodeventa_id: store.state.puntodeventaselect,
  })
  store.dispatch('consultaStockOthers', consulta).then(res => {
    articulo.stockImport = res.stock;
    articulo.ART_STOCK_IMPORT = res.ART_STOCK;
    articulo.loading1 = false;
  });
}

async function selectArticulo(articulo) {
  articulo.loading = true;

  let cliente_id = null;
  if (currentCliente.value) {
    cliente_id = currentCliente.value.id;
  }

  if (articulo.ART_TIPO_COMPRA === 'L') {
    articulo.ART_STOCK = 0;
    articulo.stock = [];
    articulo.descuento = parseFloat(descuentoarticulo.value)
    articulo.descuento_original = parseFloat(descuentoarticulo.value)
    if (!cliente_id) {
      articulo.ART_CANTIDAD = 0;

      const consulta = reactive({
        articulo: articulo,
      });
      await store.dispatch("addCotizacion", consulta);
      emit('calcTotales')
    } else {
      const consulta = reactive({
        articulo: articulo,
        sucursal_id: currentSucursal.value,
        cliente_id: cliente_id,
        puntodeventa_id: store.state.puntodeventaselect,
      })
      store.dispatch('selectarticulo', consulta).then((res) => {
        //inputbuscararticulo.value.focus();
        emit('calcTotales')
      }).catch(err => {
        errorMsg.value = err.response.data.error
      });
    }

    articulo.loading = false;
    emit('verificarProveedores')
    emit('verificarStock')
  } else {
    const consulta = reactive({
      articulo: articulo,
      sucursal_id: currentSucursal.value,
      cliente_id: cliente_id,
      puntodeventa_id: store.state.puntodeventaselect,
    })
    store.dispatch('consultarStock', consulta).then(res => {
      articulo.stock = res.stock;
      articulo.ART_STOCK = res.ART_STOCK;
      articulo.descuento = parseFloat(descuentoarticulo.value)
      articulo.descuento_original = parseFloat(descuentoarticulo.value)
      articulo.loading = false;

      if (!cliente_id) {
        articulo.ART_CANTIDAD = 0;

        const consulta = reactive({
          articulo: articulo,
        });
      } else {
        const consulta = reactive({
          articulo: articulo,
          sucursal_id: currentSucursal.value,
          cliente_id: cliente_id,
          puntodeventa_id: store.state.puntodeventaselect,
        })
      }
      if (!cliente_id) {
        store.dispatch("addCotizacion", consulta);
        emit('calcTotales')
      } else {
        store.dispatch('selectarticulo', consulta).then((res) => {
          emit('calcTotales')
        }).catch(err => {
          errorMsg.value = err.response.data.error
        });
      }

      emit('verificarProveedores')
      emit('verificarStock')
    });
  }
}

</script>