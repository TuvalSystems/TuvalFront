<template>
    <!-- Hero -->
    <BasePageHeading title="Consultas" subtitle="Consulta de artículos, clientes, direcciones">
        <template #extra>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb breadcrumb-alt">
                    <li class="breadcrumb-item">
                        <a class="link-fx" href="javascript:void(0)">Ventas</a>
                    </li>
                    <li class="breadcrumb-item" aria-current="page">Consultas</li>
                </ol>
            </nav>
        </template>
    </BasePageHeading>
    <!-- END Hero -->

    <!-- Page Content -->
    <div class="content">
        <div class="row">
            <div class="row">
                <div class="col-md-12">
                    <!-- Block Tabs Default Style -->
                    <BaseBlock>
                        <template #content>
                            <ul class="nav nav-tabs nav-tabs-block" role="tablist">
                                <li class="nav-item">
                                    <button class="nav-link active" id="btabs-articulos-tab" data-bs-toggle="tab"
                                        data-bs-target="#btabs-articulos" role="tab" aria-controls="btabs-articulos"
                                        aria-selected="true">
                                        Artículos
                                    </button>
                                </li>
                                <li class="nav-item">
                                    <button class="nav-link" id="btabs-clientes-tab" data-bs-toggle="tab"
                                        data-bs-target="#btabs-clientes" role="tab" aria-controls="btabs-clientes"
                                        aria-selected="false">
                                        Clientes
                                    </button>
                                </li>
                            </ul>
                            <div class="block-content tab-content">
                                <!-- articulos -->
                                <div class="tab-pane active" id="btabs-articulos" role="tabpanel"
                                    aria-labelledby="btabs-articulos-tab">
                                    <!-- <div class="row">
                                        <div class="col-md-4">
                                            <label class="form-label" for="select_codigo">Código Zafiro</label>
                                            <div class="input-group mb-3">
                                                <select class="form-select btn btn-alt-primary fs-sm text-left"
                                                    id="select_codigo" v-model="buscar_articulo.select_codigo">
                                                    <option value="empieza">Empieza por </option>
                                                    <option value="termina">Termina en </option>
                                                    <option value="contiene">Contiene </option>
                                                </select>
                                                <input type="text" class="form-control"
                                                    v-model="buscar_articulo.text_codigo"
                                                    @keyup.enter="buscarArticulo" />
                                            </div>
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label" for="codigo3l">Código 3L</label>
                                            <div class="input-group mb-3">
                                                <input type="text" class="form-control" id="codigo3l"
                                                    v-model="buscar_articulo.codigo3l" @keyup.enter="buscarArticulo" />
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <label class="form-label" for="select_nombre">Nombre/Descripción</label>
                                            <div class="input-group mb-3">
                                                <select class="form-select btn btn-alt-primary fs-sm text-left"
                                                    id="select_nombre" v-model="buscar_articulo.select_nombre">
                                                    <option value="contiene">Contiene </option>
                                                    <option value="termina">Termina en </option>
                                                    <option value="empieza">Empieza por </option>
                                                </select>
                                                <input type="text" class="form-control"
                                                    v-model="buscar_articulo.text_nombre"
                                                    @keyup.enter="buscarArticulo" />
                                            </div>
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label" for="terminal">terminal</label>
                                            <div class="input-group mb-3">
                                                <input type="text" class="form-control" id="terminal"
                                                    v-model="buscar_articulo.terminal" @keyup.enter="buscarArticulo" />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-md-12 text-end">
                                            <button class="btn btn-warning mx-1" @click="limpiarBusqueda"><i
                                                    class="fa fa-eraser"></i> Limpiar</button>
                                            <button class="btn btn-success mx-1" @click="buscarArticulo"><i
                                                    class="fa fa-search"></i> Buscar</button>
                                        </div>
                                    </div>
                                    <div v-if="articulos.loading" class="text-center">
                                        <div class="spinner-border text-primary mt-4" role="status"><span
                                                class="visually-hidden">Loading...</span></div>
                                    </div>
                                    <BaseBlock v-if="articulos.data.length && !articulos.loading">
                                        <div class="table-responsive">
                                            <table class="table table-hover table-sm  table-vcenter">

                                                <thead>
                                                    <tr>
                                                        <th></th>
                                                        <th>Código</th>
                                                        <th>Código Zafiro</th>
                                                        <th>Descripción</th>
                                                        <th>MARCA</th>
                                                        <th>MATERIAL</th>
                                                        <th>CTL</th>
                                                        <th>Unidad de medida</th>
                                                        <th>Stock bodega</th>
                                                        <th class="text-end">Precio de lista</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="(articulo, index) in articulos.data" :key="index">
                                                        <td>
                                                            <a v-if="articulo.imagenes.length" href="javascript:void(0)"
                                                                @click="showPhoto(articulo.imagenes)">
                                                                <i class="fa fa-search"></i>
                                                            </a>
                                                        </td>
                                                        <td class="fs-sm">
                                                            {{ articulo.ART_CODIGO }}
                                                        </td>
                                                        <td class="fs-sm">
                                                            {{ articulo.ART_CODIGO_ZAFIRO }}
                                                        </td>
                                                        <td class="fw-semibold fs-sm">
                                                            {{ articulo.ART_DESCRIPCION }}
                                                        </td>
                                                        <td class="fs-sm">
                                                            {{ articulo.ART_MARCA }}
                                                        </td>
                                                        <td class="fs-sm">
                                                            {{ articulo.ART_MATERIAL }}
                                                        </td>
                                                        <td class="fs-sm">

                                                            {{ articulo.ART_CODIGO_TRES_LETRAS }}

                                                        </td>
                                                        <td class="fs-sm">
                                                            {{ articulo.ART_PLAN_UMEDIDA }}
                                                        </td>
                                                        <td>
                                                            <div
                                                                v-if="(articulo.ART_TIPO_COMPRA != 'L' && articulo.stock)">
                                                                <code v-for="stock in articulo.stock"
                                                                    :key="stock.STO_ART_BODEGA">{{ stock.STO_ART_BODEGA }} - {{ stock.STO_ART_STOCK_DISPONIBLE }}<br></code>
                                                            </div>
                                                            <div
                                                                v-if="(articulo.ART_TIPO_COMPRA != 'L' && !articulo.stock & !articulo.loading)">
                                                                <button class="btn btn-sm btn-primary"
                                                                    @click="consultarStock(articulo)"><i
                                                                        class="fa fa-magnifying-glass"></i> Ver
                                                                    stock</button>
                                                            </div>
                                                            <div v-if="articulo.loading" class="text-center">
                                                                <div class="spinner-border spinner-border-sm text-primary"
                                                                    role="status"><span
                                                                        class="visually-hidden">Loading...</span></div>
                                                            </div>
                                                        </td>

                                                        <td class="text-end">
                                                            <p class="fs-sm  text-muted mb-0"
                                                                v-for="precio in articulo.precios" :key="precio.id">
                                                                {{ precio.LST_PRC_ID }} <span class="fw-medium">${{
                                                                    format(parseFloat(precio.LST_PRC_VALOR)) }}</span>
                                                            </p>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </BaseBlock>
                                    <p>&nbsp;</p> -->
                                    <verTabArticulos></verTabArticulos>
                                </div>



                                <!-- clientes -->
                                <div class="tab-pane" id="btabs-clientes" role="tabpanel"
                                    aria-labelledby="btabs-clientes-tab">
                                    <form class="row row-cols-lg-auto g-3 align-items-center"
                                        @submit.prevent="onSubmit">
                                        <div class="col-12">
                                            <label class="visually-hidden" for="buscar-cliente">Buscar
                                                cliente...</label>
                                            <input type="text" class="form-control" id="buscar-cliente"
                                                name="buscar-cliente" placeholder="Buscar cliente..."
                                                @keyup.enter="buscarclientes" v-model="cliente.busqueda" />
                                        </div>
                                        <div>
                                            <button type="button" v-on:click="buscarclientes"
                                                class="btn btn-primary">Buscar</button>
                                        </div>
                                    </form>
                                    <div v-if="clientes.loading" class="text-center">
                                        <div class="spinner-border text-primary mt-4" role="status"><span
                                                class="visually-hidden">Loading...</span></div>
                                    </div>
                                    <BaseBlock v-if="verclientes && !clientes.loading">
                                        <div class="table-responsive">
                                            <table class="table table-hover  table-vcenter">

                                                <thead>
                                                    <tr>
                                                        <th>RUC</th>
                                                        <th>Razón Social</th>
                                                        <th>Contacto</th>
                                                        <th>Ciudad</th>
                                                        <th>Provincia</th>
                                                        <th>Teléfono</th>
                                                        <th>Correo</th>

                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="(cliente, index) in clientes.data" :key="index">
                                                        <td class="">
                                                            <a @click="vercliente(cliente)" href="javascript:void(0)">
                                                                {{ cliente.CLI_RUC }} </a>
                                                        </td>
                                                        <td class="fw-semibold fs-sm">
                                                            <a @click="vercliente(cliente)" href="javascript:void(0)">
                                                                {{ cliente.CLI_RAZON_SOCIAL }} </a>
                                                        </td>
                                                        <td class="fs-sm">
                                                            {{ cliente.CLI_CONTACTO }}
                                                        </td>
                                                        <td class="fs-sm">
                                                            {{ cliente.CLI_CIUDAD }}
                                                        </td>
                                                        <td class="fs-sm">
                                                            {{ cliente.CLI_PROVINCIA }}
                                                        </td>
                                                        <td class="fs-sm">
                                                            {{ cliente.CLI_TELEFONO_1 }}
                                                        </td>
                                                        <td class="fs-sm">
                                                            <a
                                                                :href="'mailto:' + cliente.CLI_CORREO_ELECT_SRI">{{ cliente.CLI_CORREO_ELECT_SRI }}</a>
                                                        </td>

                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </BaseBlock>
                                    <p>&nbsp;</p>
                                </div>
                            </div>
                        </template>
                    </BaseBlock>
                    <!-- END Block Tabs Default Style -->


                </div>

            </div>
            <!-- END Block Tabs -->
        </div>
    </div>
    <!-- END Page Content -->

    <!-- Large Block Modal -->
    <div class="modal" id="modal-cliente" tabindex="-1" role="dialog" aria-labelledby="modal-cliente" aria-hidden="true"
        ref="thisModal">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <BaseBlock title="Detalle de cliente" transparent class="mb-0" v-if="currentCliente">
                    <template #options>
                        <button type="button" class="btn-block-option" data-bs-dismiss="modal" aria-label="Close">
                            <i class="fa fa-fw fa-times"></i>
                        </button>
                    </template>

                    <template #content>
                        <BaseBlock>
                            <table class="table table-striped table-sm table-vcenter">
                                <tbody>
                                    <tr>
                                        <th class="fs-sm">RUC</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_RUC }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Razón Social</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_RAZON_SOCIAL }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Dirección</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_DIRECCION }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Ciudad</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_CIUDAD }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Provincia</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_PROVINCIA }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Territorio</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_TERRITORIO }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Estado</th>
                                        <td class="fs-sm">
                                            <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                                                :class="currentCliente.CLI_ESTADO == 'ACTIVO' ? 'bg-success-light text-success' : 'bg-danger-light text-danger'">{{ currentCliente.CLI_ESTADO }}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Suspendido</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_SUSPENDIDO }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Teléfono 1</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_TELEFONO_1 }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Teléfono 2</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_TELEFONO_2 }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Teléfono 3</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_TELEFONO_3 }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Teléfono 4</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_TELEFONO_4 }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Correo</th>
                                        <td class="fs-sm"><a
                                                :href="'mailto:' + currentCliente.CLI_CORREO_ELECT_SRI">{{ currentCliente.CLI_CORREO_ELECT_SRI }}</a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Vendedor</th>
                                        <td class="fs-sm">{{ currentCliente.vendedor.VEND_NOMBRES }}
                                            {{ currentCliente.vendedor.VEND_APELLIDOS }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Condición de pago</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_CONDICION_PAGO }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Nivel de precio</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_NIVEL_PRECIO }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Típo Crédito</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_TIPO_CREDITO }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Monto Crédito</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_MONTO_CREDITO }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Grupo</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_GRUPO }}</td>
                                    </tr>
                                    <tr>
                                        <th class="fs-sm">Subgrupo</th>
                                        <td class="fs-sm">{{ currentCliente.CLI_SUBGRUPO }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </BaseBlock>
                        <div class="block-content block-content-full text-end bg-body">
                            <div class="row" style="background-color:#EBEEF2">
                                <div class="col-sm-6" v-for="(sucursal, index) in currentCliente.sucursales"
                                    :key="index">
                                    <BaseBlock :title="sucursal.CLI_SUC_ID_DIRECCION"
                                        :subtitle="sucursal.CLI_SUC_TERRITORIO">
                                        <p class="fs-sm mb-0">{{ sucursal.CLI_SUC_DIRECCION }}</p>
                                        <p class="fs-sm mb-0">{{ sucursal.CLI_SUC_PROVINCIA }} -
                                            {{ sucursal.CLI_SUC_CIUDAD }}</p>
                                        <p v-if="sucursal.CLI_SUC_TELEFONO" class="fs-sm mb-0">Teléfono:
                                            {{ sucursal.CLI_SUC_TELEFONO }}</p>
                                        <p class="fs-sm">
                                            <a
                                                :href="'mailto:' + sucursal.CLI_SUC_CORREO_ELECTRONICO_SRI">{{ sucursal.CLI_SUC_CORREO_ELECTRONICO_SRI }}</a>
                                        </p>
                                    </BaseBlock>
                                </div>
                            </div>
                            <button type="button" class="btn btn-sm btn-primary" data-bs-dismiss="modal">
                                Cerrar
                            </button>
                        </div>
                    </template>
                </BaseBlock>
            </div>
        </div>
    </div>
    <VueEasyLightbox :visible="gallery.visible" :index="gallery.index" :imgs="gallery.photos" @hide="handleHide" />
    <!-- END Large Block Modal -->

</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useStore } from 'vuex';
import { Modal } from "bootstrap";
import { swalError } from "@/functions/swal-alert";
import { formatPrice, format } from "@/functions";
import VueEasyLightbox from "vue-easy-lightbox";
const buscar_articulo = computed(() => store.state.buscar_articulo);
import verTabArticulos from "@/views/ventas/modals/tabs/consultas/ArticulosTab.vue";

const store = useStore();

let errorMsg = ref('');

const articulo = ref('');

const verarticulos = ref(false);
store.commit('setArticuloLoading', false);

const articulos = computed(() => store.state.articulos);

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

function buscarArticulo() {
    if (!buscar_articulo.value.text_codigo && !buscar_articulo.value.codigo3l && !buscar_articulo.value.text_nombre && !buscar_articulo.value.terminal) {
        swalError('Es necesario ingresar alguno de los parámetros de búsqueda')
        return;
    }

    let nivel_precio = 'GENERAL';

    const consulta = reactive({
        select_codigo: buscar_articulo.value.select_codigo,
        text_codigo: buscar_articulo.value.text_codigo,
        codigo3l: buscar_articulo.value.codigo3l,
        select_nombre: buscar_articulo.value.select_nombre,
        text_nombre: buscar_articulo.value.text_nombre,
        terminal: buscar_articulo.value.terminal,
        puntodeventaselect: store.state.puntodeventaselect,
        tipo: 'consulta'
    })
    store.dispatch('buscararticulo', consulta).then((res) => {
    }).catch(err => {
        swalError(err.response.data.error);
        store.commit('setArticuloLoading', false);
        store.commit('resetArticulo');
    });
}
limpiarBusqueda()

function limpiarBusqueda() {
    store.commit('limpiarBusqueda');
    store.commit('resetArticulo');
}

async function buscararticulo(ev) {
    verarticulos.value = true;
    const consulta = reactive({
        busqueda: articulo,
        puntodeventaselect: store.state.puntodeventaselect,
        tipo: 'consulta'
    })
    ev.preventDefault();
    store.dispatch('buscararticulo', consulta)
        .catch(err => {
            verarticulos.value = false;
            swalError(err.response.data.error);
            store.commit('setArticuloLoading', false);
        });
}

const cliente = reactive({
    busqueda: null,
});


const verclientes = ref(false);

const clientes = computed(() => store.state.clientes);

async function buscarclientes(ev) {
    verclientes.value = true;
    ev.preventDefault();
    store.dispatch('buscarclientes', cliente)
        .catch(err => {
            verclientes.value = false;
            errorMsg.value = err.response.data.error
        });
}

let thisModal = ref(null);
let thisModalObj = null;

onMounted(() => {
    thisModalObj = new Modal(thisModal.value);
});

const currentCliente = ref();

function vercliente(cliente) {
    thisModalObj.show();
    currentCliente.value = cliente;
}

function consultarStock(articulo) {
    articulo.loading = true;

    let cliente_id = null;
    if (currentCliente.value) {
        cliente_id = currentCliente.value.id;
    }

    const consulta = reactive({
        articulo: articulo,
        sucursal_id: null,
        cliente_id: cliente_id,
        puntodeventa_id: store.state.puntodeventaselect,
    })
    store.dispatch('consultarStock', consulta).then(res => {
        articulo.stock = res.stock;
        articulo.ART_STOCK = res.ART_STOCK;
        articulo.loading = false;
    });
}
</script>