<template>
  <!-- Page Content -->
  <BasePageHeading title="Cotización Prospecto">
    <template #extra>
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb breadcrumb-alt">
          <li class="breadcrumb-item">
            <a class="link-fx" href="javascript:void(0)">Ventas</a>
          </li>
          <li class="breadcrumb-item" aria-current="page">Cotización Prospecto</li>
        </ol>
      </nav>
    </template>
  </BasePageHeading>
  <div class="content">
    <BaseBlock title="Datos Cliente" content-full>
      <form @submit.prevent="onSubmit">
        <div class="block-content fs-sm pb-4 space-y-2">
          <div class="row mb-4">
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_RUC">Cédula / RUC</label>
                <div class="col-sm-9">
                  <input type="text" class="form-control" id="input-CLI_RUC" v-model="nuevoProspecto.CLI_RUC"
                    placeholder="Cédula / RUC" :class="{
                      'is-invalid': v$.CLI_RUC.$errors.length,
                    }" @blur="v$.CLI_RUC.$touch" @change="checkRuc" />
                </div>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_RAZON_SOCIAL">Razón Social</label>
                <div class="col-sm-9">
                  <input type="text" class="form-control" id="input-CLI_RAZON_SOCIAL"
                    v-model="nuevoProspecto.CLI_RAZON_SOCIAL" placeholder="Apellidos y Nombres" :class="{
                      'is-invalid': v$.CLI_RAZON_SOCIAL.$errors.length,
                    }" @blur="v$.CLI_RAZON_SOCIAL.$touch" />
                </div>
              </div>
            </div>
          </div>

          <div class="row mb-4">
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_CORREO_ELECT_SRI">Correo
                  electrónico</label>
                <div class="col-sm-9">
                  <input type="text" class="form-control" id="input-CLI_CORREO_ELECT_SRI"
                    placeholder="Correo electrónico..." v-model="nuevoProspecto.CLI_CORREO_ELECT_SRI" />
                </div>
              </div>
            </div>
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_TELEFONO_1">Teléfono</label>
                <div class="col-sm-9">
                  <input type="text" class="form-control" id="input-CLI_TELEFONO_1" placeholder="Teléfono" :class="{
                    'is-invalid': v$.CLI_TELEFONO_1.$errors.length,
                  }" @blur="v$.CLI_TELEFONO_1.$touch" v-model="nuevoProspecto.CLI_TELEFONO_1" />
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-sm-6">
              <div class="row">
                <label class="col-sm-3 col-form-label text-end" for="input-CLI_DIRECCION">Dirección</label>
                <div class="col-sm-9">
                  <textarea class="form-control" id="input-CLI_DIRECCION" v-model="nuevoProspecto.CLI_DIRECCION"
                    placeholder="Dirección completa..." :maxlength="122"></textarea>
                  <p v-if="122 - nuevoProspecto.CLI_DIRECCION.length == 0"
                    class="text-danger fs-sm bg-danger-light rounded p-2 mt-2 mb-0">
                    máximo 122 caracteres
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <label for="select-bodega-despacho" class="col-sm-1 col-form-label text-left">Bodega:</label>
            <div class="col-sm-4">
              <select class="form-select" id="select-bodega-despacho" name="select-bodega-despacho"
                v-model="bodegaFacturacion" @change="changebodega()">
                <option v-for="(bodega, index) in bodegas" :key="index" :value="bodega.PTO_VTA_BOD_REL_BODEGA">
                  {{ bodega.PTO_VTA_BOD_REL_BODEGA }}
                </option>
              </select>
            </div>
            <div class="col-sm-7 text-end">
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" id="despacho-punto" value="Retiro en bodega"
                  v-model="despacho" />
                <label class="form-check-label" for="despacho-punto">Retiro en bodega</label>
              </div>
              <div v-if="bodega_selected.PERMITE_DESPACHO" class="form-check form-check-inline">
                <input class="form-check-input" type="radio" id="despacho-ruta" value="Despacho en ruta"
                  v-model="despacho" />
                <label class="form-check-label" for="despacho-ruta">Despacho en ruta</label>
              </div>
            </div>
          </div>
        </div>
      </form>
    </BaseBlock>

    <BaseBlock title="Cotizacion" class="pb-4">
      <form class="row row-cols-lg-auto g-3 align-items-center">
        <div>
          <button type="button" @click="buscararticulo" class="btn btn-primary">Buscar Artículo</button>
        </div>
      </form>
      <div v-if="cotizacion.loading" class="text-center">
        <div class="spinner-border text-primary mt-4" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <div class="table-responsive">
        <table v-if="cotizacion.data.length && !cotizacion.loading"
          class="table table-hover table-sm table-vcenter mt-4">
          <thead>
            <tr>
              <th>#</th>
              <th>Código</th>
              <th>Descripción</th>
              <th>CTL</th>
              <th>UDM</th>
              <th>Cantidad</th>
              <!-- <th class="text-end"></th> -->
              <th class="text-end">Precio</th>
              <th class="text-end">Descuento</th>
              <th class="text-end">Total</th>
              <th></th>
            </tr>
          </thead>

          <draggable v-model="cotizacion.data" tag="tbody" item-key="orden" handle=".handle">
            <template #item="{ element, index }">
              <tr>
                <td class="fs-sm">{{ index + 1 }}</td>
                <td class="fs-sm">
                  {{ element.ART_CODIGO }}
                </td>
                <td class="fs-sm">
                  {{ element.ART_DESCRIPCION }}
                </td>
                <td class="fs-sm">
                  {{ element.ART_CODIGO_TRES_LETRAS }}
                </td>
                <td class="fs-sm">
                  {{ element.ART_PLAN_UMEDIDA }}
                </td>
                <td class="fs-sm col-1">
                  <input type="text" :id="`updatecantidad-${element.id}`" class="form-control text-end"
                    placeholder="Cantidad" :class="element.errorCantidad || element.ART_CANTIDAD == 0
                      ? 'is-invalid'
                      : ''
                      " :value="element.ART_CANTIDAD" @change="updateCantidad($event, element, index)"
                    :tablindex="index" />
                </td>
                <!-- <td class="fs-sm text-end">
                  {{ element.ART_STOCK }}
                </td> -->

                <td class="fs-sm text-end col-1">
                  ${{ format(parseFloat(element.ART_VALOR)) }}
                </td>
                <td class="fs-sm text-end col-1">
                  {{ format(parseFloat(element.descuento)) }}%
                </td>
                <td class="fs-sm text-end">${{ format(parseFloat(element.subtotal || 0)) }}</td>
                <td class="fs-sm text-end nowrap">
                  <button type="button" class="btn btn-danger btn-sm mx-1"
                    @click="confirmeliminarArticulo(element, index)">
                    <i class="fa fa-trash-can"></i>
                  </button>
                  <a class="btn btn-primary btn-sm handle mx-1" style="cursor: move"><i
                      class="fa fa-arrows-up-down-left-right"></i></a>
                  <button class="btn btn-success btn-sm mx-1" v-if="element.imagenes && element.imagenes.length"
                    href="javascript:void(0)" @click="showPhoto(element.imagenes)">
                    <i class="fa fa-search"></i>
                  </button>
                </td>
              </tr>
            </template>
          </draggable>
          <tr>
            <th colspan="9" class="fs-sm text-end">Subtotal sin descuento</th>
            <th class="fs-sm text-end">${{ format(subtotal + descuento) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="9" class="fs-sm text-end">Descuento</th>
            <th class="fs-sm text-end">${{ format(descuento) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="9" class="fs-sm text-end">Subtotal - descuento </th>
            <th class="fs-sm text-end">${{ format(subtotal) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="9" class="fs-sm text-end">IVA</th>
            <th class="fs-sm text-end">${{ format(iva) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="9" class="fs-sm text-end">Total</th>
            <th class="fs-sm text-end">${{ format(parseFloat(total)) }}</th>
            <th></th>
          </tr>
          <tr>
            <th colspan="9" class="fs-sm text-end">&nbsp;</th>
            <th class="fs-sm text-end"></th>
            <th></th>
          </tr>
          <tr>
            <th colspan="9" class="fs-sm text-end">Peso total</th>
            <th class="fs-sm text-end">{{ format(peso) }}Kg</th>
            <th></th>
          </tr>
        </table>
      </div>
      <div class="row" v-if="cotizacion.data.length > 0">
        <div class="col-md-12">
          <div class="row">
            <div class="col-md-4">
              <label for="select-condicion-pago" class="col-auto col-form-label text-right">Condición de pago:</label>
              <div class="col-auto">
                <select class="form-select" id="select-condicion-pago" name="select-condicion-pago"
                  v-model="condiciondepago_id" @change="selectcondicionpago($event)" :disabled="1">
                  <option v-for="(condicion, index) in condiciondepago" :key="index" :value="condicion.COND_ID">
                    {{ condicion.COND_ID }}
                  </option>
                </select>
              </div>
            </div>
            <div class="col-md-4">
              <label for="select-forma-pago" class="col-auto col-form-label text-right">Forma de pago:</label>
              <div class="col-auto">
                <select disabled class="form-select" id="select-forma-pago" name="select-forma-pago"
                  v-model="formadepago_id" @change="selectformapago($event)">
                  <option v-for="(pago, index) in formadepago" :key="index" :value="pago.DESC_FORMA_PAGO_CODIGO">
                    {{ pago.DESC_FORMA_PAGO_TIPO_CREDITO }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <div class="row mb-4">
            <div class="col-md-4">
              <div class="row">
                <div class="col-sm-6">
                  <label for="orden-de-compra" class="col-auto col-form-label text-right">Orden de compra:</label>
                  <div class="input-group">
                    <input v-model="orden_de_compra" type="text" id="orden-de-compra" class="form-control"
                      placeholder="Orden de compra" :maxlength="max_length" />
                    <span v-if="orden_de_compra" class="input-group-text">{{ max_length - orden_de_compra.length
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-4">
              <label for="nota-cliente" class="col-auto col-form-label text-right">Nota cliente:</label>
              <div class="col-auto">
                <textarea class="form-control" v-model="nota_cliente"></textarea>
              </div>
            </div>
            <div class="col-md-4">
              <label for="nota-interna" class="col-auto col-form-label text-right">Nota interna:</label>
              <div class="col-auto">
                <textarea class="form-control" v-model="nota_interna"></textarea>
              </div>
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 text-left">
              <button type="button" class="btn btn-danger" @click="limpiarCotizacion">
                Limpiar cotización
              </button>
            </div>
            <div class="col-md-6 text-end">
              <button type="button" class="btn btn-success mx-4" :disabled="!validaCantidad" @click="guardarCotizacion">
                Guardar Cotización
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseBlock>
  </div>
  <div class="modal" id="modal-articulo" tabindex="-1" role="dialog" aria-labelledby="modal-articulo" aria-hidden="true"
    ref="articuloModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document" style="max-width: 90vw;">
      <div class="modal-content">

        <ArticulosModal @verificarProveedores="verificarProveedores()" @verificarStock="verificarStock()"
          @calcTotales="calcTotales()"></ArticulosModal>
        <div class="block-content block-content-full text-end bg-body">
          <button type="button" class="btn btn-sm btn-alt-secondary me-1" data-bs-dismiss="modal">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>
  <VueEasyLightbox :visible="gallery.visible" :index="gallery.index" :imgs="gallery.photos" @hide="handleHide" />
</template>
<script setup>
import { ref, reactive, computed, onMounted } from "vue";

import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { Modal } from "bootstrap";
import { useTemplateStore } from "@/stores/template";
import { swalSimple, swalInfo, swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import ArticulosModal from "../modals/ArticulosModal.vue";
import VueSelect from "vue-select";
import draggable from "vuedraggable";
import VueEasyLightbox from "vue-easy-lightbox";

import useVuelidate from "@vuelidate/core";
import { required, maxLength, email } from "@vuelidate/validators";
import { formatPrice, format, formatPrice4 } from "@/functions";

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

const store = useStore();
const templateStore = useTemplateStore();
const router = useRouter();

limpiarCotizacion();

let errorMsg = ref("");

const nuevoProspecto = computed(() => store.state.nuevoProspecto);
const despacho = ref(store.state.despacho);
const bodegas = computed(() => store.state.bodegas);
const bodega_selected = ref(bodegas.value[0]);
const bodegaFacturacion = ref(bodegas.value[0].PTO_VTA_BOD_REL_BODEGA); //bodegas.value[0].PTO_VTA_BOD_REL_BODEGA
const cotizacion = computed(() => store.state.cotizacion);
const descuentoarticulo = ref(store.state.descuentoarticulo);
const descuentooriginal = ref(store.state.descuentooriginal);
const formadepago_id = ref(store.state.formadepago_id);
const formadepago = computed(() => store.state.formadepago);
const condiciondepago_id = ref(store.state.condiciondepago_id);
const condiciondepago = ref(store.state.condiciondepago);
const subtotal = ref(store.state.subtotal);
const peso = ref(store.state.peso);
const descuento = ref(store.state.descuento);
const iva = ref(store.state.iva);
const total = ref(store.state.total);
const orden_de_compra = ref(store.state.orden_de_compra);
const nota_interna = ref(store.state.nota_interna);
const nota_cliente = ref(store.state.nota_cliente);
const verbodegas = ref(false);
let articuloModal = ref(null);
let articuloModalObj = null;
const max_length = ref(20);

store.commit('resetCurrentcliente');

function isInt(value) {
  var x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}
function isLetter(str) {
  return str.length === 1 && str.match(/[a-z]/i);
}


function checkRuc() {
  store
    .dispatch("checkRucProspecto", nuevoProspecto.value)
    .then((res) => {
      if (res.prospecto) {
        nuevoProspecto.value.CLI_RAZON_SOCIAL = res.prospecto.CLI_RAZON_SOCIAL;
        nuevoProspecto.value.CLI_CORREO_ELECT_SRI = res.prospecto.CLI_CORREO_ELECT_SRI;
        nuevoProspecto.value.CLI_DIRECCION = res.prospecto.CLI_DIRECCION;
        nuevoProspecto.value.CLI_TELEFONO_1 = res.prospecto.CLI_TELEFONO_1;
      } else if (res.cliente) {
        confirmCliente(res.cliente);
      } else {
        return;
      }
    })
    .catch((err) => {
      swalError(err.response.data.error);
    });
}

function confirmCliente(cliente) {
  swalInfo('El cliente ' + cliente.CLI_RAZON_SOCIAL + ' ya existe, se ha cargado la ventana de pedido regular')
  cargarCliente(cliente);
}

function cargarCliente(cliente) {
  store.commit("setCurrentcliente", cliente);
  store.commit("setCurrentSucursal", cliente.sucursales[0].id)
  router.push({
    name: "ventas-crearcotizacion",
  });
}

function updateCantidad(event, articulo, index) {
  if (!isInt(event.target.value) && articulo.ART_DECIMAL_CANTIDAD == 0) {
    cotizacion.value.data[index].errorCantidad = true;
    swalError("Ingresar un número entero");
    return false;
  } else if (articulo.ART_DECIMAL_CANTIDAD > 0 && isNaN(event.target.value)) {
    cotizacion.value.data[index].errorCantidad = true;
    swalError("Ingresar un número");
    return false;
  }

  if (articulo.ART_DECIMAL_CANTIDAD > 0) {
    event.target.value = parseFloat(event.target.value).toFixed(2);
  }
  cotizacion.value.data[index].errorCantidad = false;
  cotizacion.value.data[index].ART_CANTIDAD = event.target.value;
  calcTotales();
}

function confirmeliminarArticulo(articulo, index) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De eliminar el producto " + articulo.ART_CODIGO + "",
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-danger m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Si, eliminarlo!",
      html: false,
      preConfirm: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 50);
        });
      },
    })
    .then((result) => {
      if (result.value) {
        eliminarArticulo(index);
      }
    });
}

async function eliminarArticulo(index) {
  verbodegas.value = false;
  cotizacion.value.data.splice(index, 1);
  calcTotales();
}
store.commit('setDescuentoArticulo', nuevoProspecto.value.CLI_DSTO_COMERCIAL);
store.commit('setDescuentoOriginal', nuevoProspecto.value.CLI_DSTO_COMERCIAL);
condiciondepago_id.value = nuevoProspecto.value.CLI_CONDICION_PAGO;
store.commit("llenaformadepago", condiciondepago_id);

formadepago_id.value = formadepago.value[0].DESC_FORMA_PAGO_CODIGO;
function changebodega() {
  bodega_selected.value = bodegas.value.find(
    (item) => item.PTO_VTA_BOD_REL_BODEGA === bodegaFacturacion.value
  );
}

let errorbuscararticulo = ref(false);

function buscararticulo() {
  store.commit('resetArticulo');
  store.commit('limpiarBusqueda');
  articuloModalObj.show();
}

function selectcondicionpago(event) {
  store.commit('setDescuentoArticulo', nuevoProspecto.value.CLI_DSTO_COMERCIAL);
  store.commit('setDescuentoOriginal', nuevoProspecto.value.CLI_DSTO_COMERCIAL);
  store.commit("llenaformadepago", condiciondepago_id);
  formadepago_id.value = formadepago.value[0].DESC_FORMA_PAGO_CODIGO;
}

function selectformapago() {
  store.commit('setDescuentoArticulo', nuevoProspecto.value.CLI_DSTO_COMERCIAL);
  store.commit('setDescuentoOriginal', nuevoProspecto.value.CLI_DSTO_COMERCIAL);

  const restardescuento = formadepago.value.find(
    (item) => item.DESC_FORMA_PAGO_CODIGO === formadepago_id.value
  ).DESC_FORMA_PAGO_PORCENTAJE_REBAJAR;
  formadepago_id.value = formadepago.value.find(
    (item) => item.DESC_FORMA_PAGO_CODIGO === formadepago_id.value
  ).DESC_FORMA_PAGO_CODIGO;
  store.commit('setDescuentoArticulo', parseFloat(descuentoarticulo.value) + parseFloat(restardescuento));
  store.commit('setDescuentoOriginal', parseFloat(descuentooriginal.value) + parseFloat(restardescuento));
  cotizacion.value.data.map((articulo) => {
    articulo.descuento_original =
      parseFloat(nuevoProspecto.value.CLI_DSTO_COMERCIAL) + parseFloat(restardescuento);
    articulo.descuento =
      parseFloat(nuevoProspecto.value.CLI_DSTO_COMERCIAL) + parseFloat(restardescuento);
  });

  if (descuentoarticulo.value < 0) {
    swalWarning("Descuento menor que cero");
    return;
  }
  calcTotales();
}

let validaCantidad = ref(true);
const validaPrecio = ref(true);
function redondear(num, decimales = 2) {
  const factor = Math.pow(10, decimales);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

const  calcTotales = () =>{
  let tempSubtotal = 0;
  let tempDiscount = 0;
  let tempIva = 0;
  let tempPeso = 0;
  subtotal.value = 0;
  descuento.value = 0;
  iva.value = 0;
  total.value = 0;
  peso.value = 0;
  validaCantidad.value = true;
  cotizacion.value.data.forEach((articulo) => {
    const qty = Number.parseFloat(articulo.ART_CANTIDAD) || 0;
    const ivaPorcentaje = Number.parseFloat(articulo.ART_IMP_VTA) || 0;
    const tipoCompra = (articulo.ART_TIPO_COMPRA || '').trim().toUpperCase();
    if (tipoCompra != 'L') {
      let unitPrice = Number.parseFloat(articulo.ART_VALOR_ORIGINAL || 0);
      const modifier = Number.parseFloat(articulo.modificador || 0);
      let priceCalculated = unitPrice + (unitPrice * modifier / 100);
      const diference = Math.abs(priceCalculated - Number.parseFloat(articulo.ART_VALOR || 0));
      if (articulo.cambiar_valor) {

      } else {
        if (diference < 0.001) {
          articulo.ART_VALOR = redondear(articulo.ART_VALOR, 4);
        } else {
          articulo.ART_VALOR = redondear(priceCalculated, 4);
        }
      }
    }

    const priceCaculated = articulo.ART_VALOR;
    const discountPorcentil = Number.parseFloat(articulo.descuento);
    const discountAmount = priceCaculated * (discountPorcentil / 100);

    articulo.ART_DESCUENTO = redondear(discountAmount + 0.000001, 4);
    const priceWithDiscount = priceCaculated - discountAmount;
    const subtotalLine = redondear((priceWithDiscount * qty) + 0.000001, 4);


    articulo.subtotal = subtotalLine;
    tempSubtotal += subtotalLine;
    tempDiscount += (discountAmount * qty);

    const ivaLinea = subtotalLine * (ivaPorcentaje / 100);
    articulo.ART_IVA = redondear(ivaLinea + 0.000001, 2); //se aplico por bloque de seguridad
    tempIva += ivaLinea;

    if (articulo.ART_CANTIDAD == 0) {
      validaCantidad.value = false;
    }

    if (articulo.ART_VALOR == 0) {
      validaPrecio.value = false;
    }

   tempPeso += (Number.parseFloat(articulo.ART_PESO) || 0) * qty;
  });
  peso.value = redondear(tempPeso + 0.000001, 2);
  descuento.value = redondear(tempDiscount + 0.000001, 2);
  subtotal.value = redondear(tempSubtotal + 0.000001, 2);
  iva.value = redondear(tempIva + 0.000001, 2);
  total.value = redondear((subtotal.value + iva.value) + 0.000001, 2);
}

function limpiarCotizacion() {
  store.commit("resetCotizacionProspecto");
  store.commit("resetProspecto");
}

let validaStock = ref(true);

function verificarProveedores() {
}

function verificarStock() {
  validaStock.value = true;
  let cantidadStock = 0;
  cotizacion.value.data.map((articulo) => {
    articulo.stockListo = true;
    cantidadStock = parseFloat(articulo.ART_CANTIDAD);
    articulo.stock.map((stock) => {
      cantidadStock -= parseFloat(stock.seleccionado);
    });
    if (cantidadStock != 0) {
      articulo.stockListo = false;
    }
    if (
      articulo.ART_TIPO_COMPRA != "L" &&
      articulo.ART_TIPO_COMPRA != "SERV" &&
      cantidadStock != 0
    ) {
      validaStock.value = false;
    }
  });
}

const rules = computed(() => {
  return {
    CLI_RUC: {
      required,
      maxLength: maxLength(15),
    },
    CLI_RAZON_SOCIAL: {
      required,
      maxLength: maxLength(65),
    },
    CLI_TELEFONO_1: {
      required,
      maxLength: maxLength(21),
    },
  };
});
const v$ = useVuelidate(rules, nuevoProspecto);

async function guardarCotizacion() {
  const result = await v$.value.$validate();

  if (!result) {
    swalError("Cédula / RUC y Razón Social son obligatorios");
    return;
  }

  templateStore.pageLoader({ mode: "on" });
  const infocotizacion = reactive({
    prospecto: nuevoProspecto.value,
    sucursal_id: null,
    sucursal_facturacion_id: null,
    cliente_id: null,
    factura_posterior_despacho: 0,
    factura_a_demanda: 0,
    factura_siguiente_mes: 0,
    PTO_VTA_ID: store.state.puntodeventaselect,
    bodega_facturacion: bodegaFacturacion.value,
    porcentage_descuentooriginal: descuentooriginal.value,
    porcentage_descuento: descuentoarticulo.value,
    DESC_FORMA_PAGO_CODIGO: formadepago_id.value,
    CLI_RUC: nuevoProspecto.value.CLI_RUC,
    COND_ID: condiciondepago_id.value,
    COND_ID_ORIGINAL: nuevoProspecto.value.CLI_CONDICION_PAGO,
    CLI_RAZON_SOCIAL: nuevoProspecto.value.CLI_RAZON_SOCIAL,
    CLI_CORREO_ELECT_SRI: nuevoProspecto.value.CLI_CORREO_ELECT_SRI,
    VEND_ID: null,
    VEND_NOMBRES: null,
    VEND_APELLIDOS: null,
    subtotal: subtotal.value,
    descuento: descuento.value,
    iva: iva.value,
    total: total.value,
    cotizacion: cotizacion.value.data,
    despacho: despacho.value,
    nota_interna: nota_interna.value,
    nota_cliente: nota_cliente.value,
    orden_de_compra: orden_de_compra.value,
  });
  store
    .dispatch("guardarCotizacionProspecto", infocotizacion)
    .then((res) => {
      templateStore.pageLoader({ mode: "off" });
      swalSuccess(res.data.message);
      router.push({
        name: "ventas-cotizaciones",
      });
    })
    .catch((err) => {
      templateStore.pageLoader({ mode: "off" });
      swalError(err.response.data.error);
    });
}

const cols = reactive([
  {
    name: "Código",
    field: "ART_CODIGO",
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
    name: "U. medida",
    field: "ART_PLAN_UMEDIDA",
    sort: "",
  },
  {
    name: "Stock bodega",
    field: "ART_STOCK",
    sort: "",
  },
  {
    name: "P.Lista",
    field: "ART_VALOR",
    sort: "",
  },
  {
    name: "P. + IVA",
    field: "ART_VALOR",
    sort: "",
  },
  {
    name: "Peso",
    field: "ART_PESO",
    sort: "",
  },
]);

// Sort by functionality
const sortBy = computed(() => {
  return cols.reduce((acc, o) => {
    if (o.sort) {
      o.sort === "asc" ? acc.push(o.field) : acc.push("-" + o.field);
    }
    return acc;
  }, []);
});

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

onMounted(() => {
  articuloModalObj = new Modal(articuloModal.value);
});
</script>
