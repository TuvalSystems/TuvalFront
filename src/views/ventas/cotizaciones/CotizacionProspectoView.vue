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
        <div class="prospect-form block-content fs-sm pt-2 pb-3">
          <div class="row g-2">
            <div class="col-md-5">
              <label class="form-label prospect-form__label" for="input-CLI_RUC">
                Cédula / RUC <span class="text-danger">*</span>
              </label>
              <div class="input-group input-group-sm prospect-form__control">
                <span class="input-group-text"><i class="fa fa-id-card"></i></span>
                <input type="text" class="form-control" id="input-CLI_RUC" v-model="nuevoProspecto.CLI_RUC"
                  placeholder="Ingrese la identificación" :class="{
                    'is-invalid': v$.CLI_RUC.$errors.length,
                  }" @blur="v$.CLI_RUC.$touch" @change="checkRuc" />
              </div>
            </div>

            <div class="col-md-7">
              <label class="form-label prospect-form__label" for="input-CLI_RAZON_SOCIAL">
                Razón social <span class="text-danger">*</span>
              </label>
              <div class="input-group input-group-sm prospect-form__control">
                <span class="input-group-text"><i class="fa fa-user"></i></span>
                <input type="text" class="form-control" id="input-CLI_RAZON_SOCIAL"
                  v-model="nuevoProspecto.CLI_RAZON_SOCIAL" placeholder="Apellidos y nombres" :class="{
                    'is-invalid': v$.CLI_RAZON_SOCIAL.$errors.length,
                  }" @blur="v$.CLI_RAZON_SOCIAL.$touch" />
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label prospect-form__label" for="input-CLI_CORREO_ELECT_SRI">
                Correo electrónico
              </label>
              <div class="input-group input-group-sm prospect-form__control">
                <span class="input-group-text"><i class="fa fa-envelope"></i></span>
                <input type="text" class="form-control" id="input-CLI_CORREO_ELECT_SRI"
                  placeholder="correo@ejemplo.com" v-model="nuevoProspecto.CLI_CORREO_ELECT_SRI" />
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label prospect-form__label" for="input-CLI_TELEFONO_1">
                Teléfono <span class="text-danger">*</span>
              </label>
              <div class="input-group input-group-sm prospect-form__control">
                <span class="input-group-text"><i class="fa fa-phone"></i></span>
                <input type="text" class="form-control" id="input-CLI_TELEFONO_1" placeholder="Número de contacto"
                  :class="{
                    'is-invalid': v$.CLI_TELEFONO_1.$errors.length,
                  }" @blur="v$.CLI_TELEFONO_1.$touch" v-model="nuevoProspecto.CLI_TELEFONO_1" />
              </div>
            </div>

            <div class="col-12">
              <label class="form-label prospect-form__label" for="input-CLI_DIRECCION">Dirección</label>
              <textarea class="form-control form-control-sm prospect-form__textarea" id="input-CLI_DIRECCION"
                v-model="nuevoProspecto.CLI_DIRECCION" placeholder="Ingrese la dirección completa"
                :maxlength="122"></textarea>
              <div class="text-end mt-1">
                <small class="text-muted">{{ nuevoProspecto.CLI_DIRECCION.length }}/122</small>
              </div>
              <p v-if="122 - nuevoProspecto.CLI_DIRECCION.length == 0"
                class="text-danger fs-sm bg-danger-light rounded p-2 mt-2 mb-0">
                Máximo 122 caracteres
              </p>
            </div>
          </div>

          <div class="prospect-form__delivery mt-3">
            <div class="row g-2 align-items-end">
              <div class="col-lg-5">
                <label for="select-bodega-despacho" class="form-label prospect-form__label">
                  <i class="fa fa-warehouse me-1"></i> Bodega
                </label>
              <select class="form-select form-select-sm" id="select-bodega-despacho" name="select-bodega-despacho"
                v-model="bodegaFacturacion" @change="changebodega()">
                <option v-for="(bodega, index) in bodegas" :key="index" :value="bodega.PTO_VTA_BOD_REL_BODEGA">
                  {{ bodega.PTO_VTA_BOD_REL_BODEGA }}
                </option>
              </select>
              </div>

              <div class="col-lg-7">
                <span class="form-label prospect-form__label d-block">Tipo de entrega</span>
                <div class="prospect-form__dispatch-options">
                  <label class="prospect-form__dispatch-option" :class="{
                    'prospect-form__dispatch-option--active': despacho === 'Retiro en bodega',
                  }" for="despacho-punto">
                    <input class="form-check-input" type="radio" id="despacho-punto" value="Retiro en bodega"
                      v-model="despacho" />
                    <i class="fa fa-box me-1"></i>
                    <span>Retiro en bodega</span>
                  </label>
                  <label v-if="bodega_selected.PERMITE_DESPACHO" class="prospect-form__dispatch-option" :class="{
                    'prospect-form__dispatch-option--active': despacho === 'Despacho en ruta',
                  }" for="despacho-ruta">
                    <input class="form-check-input" type="radio" id="despacho-ruta" value="Despacho en ruta"
                      v-model="despacho" />
                    <i class="fa fa-truck me-1"></i>
                    <span>Despacho en ruta</span>
                  </label>
                </div>
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
          <div class="row g-3 mb-3">
            <div class="col-md-4">
              <label for="prospect-condicion-pago" class="form-label">Condición de pago</label>
              <input id="prospect-condicion-pago" class="form-control" :value="condiciondepago_id" disabled />
            </div>
            <div class="col-md-4">
              <label for="prospect-forma-pago" class="form-label">Forma de pago</label>
              <input id="prospect-forma-pago" class="form-control" value="CONTADO-EFECTIVO" disabled />
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
  <div class="modal" id="modal-articulo" tabindex="-1" aria-hidden="true" ref="articuloModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document" style="max-width: 90vw;">
      <div class="modal-content">
        <verModalBuscarArticulos
          v-if="dataSearchItem"
          :form="dataSearchItem"
          @closeModal="closeModalSearchItem"
          @select-item="handleItemSelected"
        ></verModalBuscarArticulos>
      </div>
    </div>
  </div>
  <VueEasyLightbox :visible="gallery.visible" :index="gallery.index" :imgs="gallery.photos" @hide="handleHide" />
</template>
<script setup>
import { ref, reactive, computed, watch } from "vue";

import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useTemplateStore } from "@/stores/template";
import { useBootstrapModal } from "@/composables/core/useBootstrapModal";
import { useQuoteProspectActions } from "@/composables/venta/cotizaciones/prospecto/useQuoteProspectActions";
import { useSearchConditionPayment } from "@/composables/venta/cotizaciones/crearCotizacion/useSearchConditionPayment";
import { useCustomerCreate } from "@/composables/venta/cliente/useCustomerCreate";
import {  swalSuccess, swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import verModalBuscarArticulos from "./crear-cotizacion/modals/verModalBuscarArticulos.vue";
import draggable from "vuedraggable";
import VueEasyLightbox from "vue-easy-lightbox";

import useVuelidate from "@vuelidate/core";
import { required, maxLength } from "@vuelidate/validators";
import {  format, } from "@/functions";

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


const nuevoProspecto = computed(() => store.state.nuevoProspecto);
const despacho = ref(store.state.despacho);
const bodegas = computed(() => store.state.bodegas);
const bodega_selected = ref(bodegas.value[0]);
const bodegaFacturacion = ref(bodegas.value[0].PTO_VTA_BOD_REL_BODEGA); //bodegas.value[0].PTO_VTA_BOD_REL_BODEGA
const cotizacion = computed(() => store.state.cotizacion);
const COMMERCIAL_DISCOUNT = 25;
const condiciondepago_id = "CONTADO";
const { fetchMethodPayment, methodPayment } = useSearchConditionPayment();
const cashPayment = computed(() => (methodPayment.value || []).find(payment =>
  ["CONTADOEFECTIVO", "EFECTIVO"].includes(
    String(payment.tipo).toUpperCase().replace(/[\s-]+/g, "")
  )
));
const formadepago_id = computed(() => cashPayment.value?.codigo);
const descuentoarticulo = computed(() => COMMERCIAL_DISCOUNT +
  Number(cashPayment.value?.porcentaje_rebaja || 0));
let pendingPaymentRequest = null;
const descuentooriginal = descuentoarticulo;
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
const dataSearchItem = ref(null);
const articuloModalObj = useBootstrapModal(articuloModal, {
  onHidden: () => {
    dataSearchItem.value = null;
  },
});
const { fetchDefaultPriceListBySalesPoint, restoreProspect } = useQuoteProspectActions();
const { validateIdentification, validateProspectIdentification } = useCustomerCreate();
let documentCheckSequence = 0;
let checkedDocument = null;
let pendingDocumentCheck = null;
watch(() => nuevoProspecto.value.CLI_RUC, () => {
  checkedDocument = null;
  pendingDocumentCheck = null;
  documentCheckSequence++;
}, { flush: "sync" });
const max_length = ref(20);

store.commit('resetCurrentcliente');

function isInt(value) {
  var x = parseFloat(value);
  return !isNaN(value) && (x | 0) === x;
}

async function checkRuc() {
  const documento = String(nuevoProspecto.value.CLI_RUC).trim();
  if (checkedDocument === documento) return true;
  if (pendingDocumentCheck?.documento === documento) {
    return pendingDocumentCheck.promise;
  }
  const sequence = ++documentCheckSequence;
  const promise = validateDocumentForQuotation(documento, sequence);
  pendingDocumentCheck = { documento, promise };
  try {
    const valid = await promise;
    if (valid && sequence === documentCheckSequence) checkedDocument = documento;
    return valid;
  } finally {
    if (pendingDocumentCheck?.promise === promise) pendingDocumentCheck = null;
  }
}

async function validateDocumentForQuotation(documento, sequence) {
  const isCurrent = () => sequence === documentCheckSequence &&
    documento === String(nuevoProspecto.value.CLI_RUC).trim();
  if (!await v$.value.CLI_RUC.$validate() || !documento) return;

  const clientResponse = await validateIdentification(documento);
  if (!isCurrent()) return;
  if (!clientResponse.ok) {
    // Los errores de transporte no confirman la existencia de un cliente.
    if (clientResponse.raw?.isAxiosError || clientResponse.canceled) {
      swalWarning(clientResponse.message);
      return;
    }
    swalWarning(clientResponse.message);
    await router.push({
      name: "ventas-crearcotizacion",
      query: { cliente_nuevo: documento },
    });
    return;
  }

  const prospectValidation = await validateProspectIdentification(documento, { showError: false });
  if (!isCurrent()) return;
  // true permite crear uno nuevo; false indica que el prospecto ya existe.
  if (prospectValidation.ok) return true;
  if (prospectValidation.raw?.isAxiosError || prospectValidation.canceled) {
    swalWarning(prospectValidation.message);
    return;
  }

  const response = await restoreProspect(documento);
  if (!isCurrent()) return;
  if (!response.ok) {
    swalWarning(response.message);
    return;
  }
  const prospect = response.data;
  if (!prospect?.identificacion) return;
  nuevoProspecto.value.CLI_RAZON_SOCIAL = prospect.razon_social;
  nuevoProspecto.value.CLI_CORREO_ELECT_SRI = prospect.correo_sri;
  nuevoProspecto.value.CLI_TELEFONO_1 = prospect.telefono1;
  nuevoProspecto.value.CLI_DIRECCION = prospect.direcciones[0]?.direccion ?? "";
  return true;
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
function changebodega() {
  bodega_selected.value = bodegas.value.find(
    (item) => item.PTO_VTA_BOD_REL_BODEGA === bodegaFacturacion.value
  );
}


async function buscararticulo() {
  if (!await validateCashPayment()) return;
  const resp = await fetchDefaultPriceListBySalesPoint();
  if (!resp?.ok) {
    const message = resp?.message || "No se pudo obtener la lista de precio por defecto";
    (resp?.status ?? 0) >= 500 ? swalError(message) : swalWarning(message);
    return;
  }

  dataSearchItem.value = {
    cliente: {
      id: null,
      CLI_NIVEL_PRECIO: resp.data?.listaPrecio || "",
      CLI_DSTO_COMERCIAL: COMMERCIAL_DISCOUNT,
    },
    direccion_facturacion_id: null,
  };
  articuloModalObj.show();
}

function closeModalSearchItem() {
  articuloModalObj.hide();
}

async function handleItemSelected(articulo) {
  if (!await validateCashPayment()) return;
  if (articulo.ART_TIPO_COMPRA === "L") {
    articulo.ART_STOCK = 0;
    articulo.stock = [];
  }

  articulo.ART_CANTIDAD = 0;

  try {
    await store.dispatch("addCotizacion", { articulo });
    applyDefaultDiscount();
    calcTotales();
    verificarProveedores();
    verificarStock();
  } catch (error) {
    swalError(error.response?.data?.error || "No se pudo agregar el artículo a la cotización");
  }
}

async function validateCashPayment() {
  if (!cashPayment.value) {
    if (!pendingPaymentRequest) {
      pendingPaymentRequest = fetchMethodPayment(condiciondepago_id)
        .finally(() => { pendingPaymentRequest = null; });
    }
    const response = await pendingPaymentRequest;
    if (!response.ok) {
      swalWarning(response.message || "No se pudieron cargar las formas de pago.");
      return false;
    }
  }
  if (formadepago_id.value == null || String(formadepago_id.value).trim() === "") {
    swalWarning("No se encontró la forma de pago Contado-Efectivo en el catálogo.");
    return false;
  }
  return true;
}

function applyDefaultDiscount() {
  nuevoProspecto.value.CLI_DSTO_COMERCIAL = COMMERCIAL_DISCOUNT;
  nuevoProspecto.value.CLI_CONDICION_PAGO = condiciondepago_id;
  store.commit('setDescuentoArticulo', descuentoarticulo.value);
  store.commit('setDescuentoOriginal', descuentooriginal.value);
  cotizacion.value.data.forEach(articulo => {
    articulo.descuento_original = descuentooriginal.value;
    articulo.descuento = descuentoarticulo.value;
  });
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
      if (!articulo.cambiar_valor) {
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
  if (!await validateCashPayment()) return;
  applyDefaultDiscount();
  calcTotales();
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
    COND_ID: condiciondepago_id,
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





</script>

<style scoped>
.prospect-form {
  max-width: 1180px;
  margin: 0 auto;
}

.prospect-form__label {
  margin-bottom: 0.2rem;
  color: var(--tuval-text, var(--bs-body-color));
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.035em;
  text-transform: uppercase;
}

.prospect-form__control .input-group-text {
  width: 2.25rem;
  justify-content: center;
  color: var(--tuval-text-muted, var(--bs-secondary-color));
  background-color: var(--tuval-surface-muted, var(--bs-body-bg));
}

.prospect-form__control .form-control,
.prospect-form__textarea,
.prospect-form__delivery .form-select {
  border-color: var(--tuval-border, var(--bs-border-color));
}

.prospect-form__control:focus-within .input-group-text {
  color: var(--tuval-primary, var(--bs-primary));
  border-color: var(--tuval-primary, var(--bs-primary));
}

.prospect-form__textarea {
  min-height: 58px;
  resize: vertical;
}

.prospect-form__delivery {
  padding: 0.65rem 0.75rem;
  background-color: var(--tuval-surface-muted, var(--bs-body-bg));
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: 0.5rem;
}

.prospect-form__dispatch-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.prospect-form__dispatch-option {
  display: inline-flex;
  flex: 1 1 11rem;
  align-items: center;
  justify-content: center;
  min-height: 31px;
  padding: 0.3rem 0.6rem;
  margin: 0;
  color: var(--tuval-text, var(--bs-body-color));
  background-color: var(--tuval-surface, var(--bs-body-bg));
  border: 1px solid var(--tuval-border, var(--bs-border-color));
  border-radius: 0.375rem;
  cursor: pointer;
  transition:
    color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out;
}

.prospect-form__dispatch-option:hover,
.prospect-form__dispatch-option--active {
  color: var(--tuval-primary, var(--bs-primary));
  background-color: var(--tuval-primary-soft, var(--bs-body-bg));
  border-color: var(--tuval-primary, var(--bs-primary));
}

.prospect-form__dispatch-option .form-check-input {
  flex: 0 0 auto;
  margin: 0 0.5rem 0 0;
}

@media (max-width: 575.98px) {
  .prospect-form__delivery {
    padding: 0.65rem;
  }

  .prospect-form__dispatch-option {
    flex-basis: 100%;
    justify-content: flex-start;
  }
}
</style>
