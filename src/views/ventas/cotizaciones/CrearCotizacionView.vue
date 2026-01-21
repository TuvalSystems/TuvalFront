<script setup>
import { onMounted, ref, computed, watch, reactive, nextTick } from "vue";
import { swalWarning, swalError, toast } from "@/functions/swal-alert.js";
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import { useProcessCreateQuote } from "@/composables/venta/cotizaciones/crearCotizacion/useProcessCreateQuote";
import { useSearchConditionPayment } from "@/composables/venta/cotizaciones/crearCotizacion/useSearchConditionPayment";
import { useCheckClientSegment } from "@/composables/venta/cotizaciones/useCheckClientSegment";
import actualizarSegmentoClienteComponent from "@/views/ventas/modals/actualizarSegmentoClienteModal.vue";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import { useBootstrapModal } from '@/composables/core/useBootstrapModal';
import draggable from 'vuedraggable'
import { formatPrice4, format } from "@/functions";

// imports modales
import verModalCrearNuevaDireccion from "@/views/ventas/modals/verModalCrearNuevaDireccion.vue";
import verModalBuscarArticulos from "@/views/ventas/modals/verModalBuscarArticulos.vue";
import verModalItemAlternativo from "@/views/ventas/modals/verModalItemAlternativo.vue";
import verModalSeleccionStockBodegas from "@/views/ventas/modals/verModalSeleccionStockBodegas.vue";
import verModalModificacionPeso from "@/views/ventas/modals/verModalModificacionPeso.vue";
import verModalProveedores from "@/views/ventas/modals/verModalProveedores.vue";


const {
  clients,
  errorSearchClient,
  dataSearch,
  loadingSearch,
  searchClients,

  //customer
  infoClient,
  infoSegmento,
  loadingAvailableCredit,
  fetchAvailableCreditCustomer,

  //sucursales
  loadingSucursales,
  sucursales,
  fetchCustomerBranches,

  //bodegas por punto de venta
  loadingWarehouseByUser,
  warehouseByUser,
  fetchWarehouseByPtoVtaUser,

  //validations
  getClientStatus,

} = useClientSearch();
const {
  form,
  clearForm,
  addItems,
  removeItem,
  loadingClearQuotation,
  clearQuotation,
  //limitadores 
  maxOrder,
  maxLength,
  maxLengthNote,
  //proceso de descripcion de item 
  getDescriptionClass,
  updateDescripcion,
  isDescriptionEditable,
  enableEditModeDescription,

  //proceso item alternativo 
  loadingListAlternative,
  getAlternativeDescriptions,
  listItemsAlternatives,
  clearSelectionItemalternative,
  descripcionAlternativa,
  updateDescriptionsForCheckAlternative,

  //proceso de checkbox alternativos
  loadingUpdateCheckAlternative,
  updateCheckAlternative,

  //proceso para manejo de cantidades
  loadingUpdateQuantityItem,
  validateQtyBeforeUpdate,
  updateQuantityItem,
  formatQty,
  //proceso de proveedores
  isItemL,
  dataModalProviders,
  storeProvidersForItemL,
  clearDataModalProviders,
  //proceso de stock total de un articulo 
  shouldShowStock,

  //proceso de modal stock y peso 
  dataStockItem,
  isStockDisabled,
  //peso  
  dataPesoItem,
  updateWeinghtRowItem,
  //proceso para manejo de modificador y precio
  calculatePriceFromModifier,
  isPriceEditable,
  enableEditPrice,
  applyModifyPrice,
  exitEditPrice,
  calculateRowModifier,
  updateModifyPriceRowItem,

  //proceso de modificacion de descuento 
  isEditDiscount,
  enableEditDiscount,
  applyModifyDiscount,
  exitEditDiscount,
  updateModifyDiscountRowItem,

  //gloabl
  calculateTotals

} = useProcessCreateQuote();
const {
  loadingConditionPayment,
  fetchConditionPayment,
  conditionPayment,
  loadingMethodPayment,
  fetchMethodPayment,
  methodPayment
} = useSearchConditionPayment();
const { loadingCheck, fetchCheckSegmentoClient } = useCheckClientSegment();
const flatPickrState = reactive({
  minDate: Date.now(),
  monthSelectorType: "static",
  locale: Spanish,
});


//variables de modales 
const verModalActualizarSegmento = ref(null)
const verModalCrearDireccionModal = ref(null)
const verSearchItemModal = ref(null);
const verItemAltRef = ref(null)
const verSeleccionStockBodegasRef = ref(null)
const verModalPesoItemRef = ref(null)
const verProveedoresRef = ref(null);
const verModalActualizarSegmentoObj = useBootstrapModal(verModalActualizarSegmento)
const verModalCrearDireccionModalObj = useBootstrapModal(verModalCrearDireccionModal)
const verSearchItemModalObj = useBootstrapModal(verSearchItemModal)
const verItemAltObj = useBootstrapModal(verItemAltRef)
const verSeleccionStockBodegasObj = useBootstrapModal(verSeleccionStockBodegasRef)
const verModalPesoItemObj = useBootstrapModal(verModalPesoItemRef)
const verProveedoresObj = useBootstrapModal(verProveedoresRef, {
  backdrop: 'static',
  keyboard: false
});
// variables para mostrar las busquedas
const showResultClients = ref(false);
const showInfoClient = ref(false);

async function searchFilterClientes() {
  clearForm();//limpia el formulario 
  showResultClients.value = true;
  showInfoClient.value = false;
  if (dataSearch.search == null || dataSearch.search.length >= 0 && dataSearch.search.length < 4) {
    showResultClients.value = false;
    showInfoClient.value = false;
    errorSearchClient.value = true
    return false;
  }
  const resp = await searchClients();

  if (!resp?.ok) {
    errorSearchClient.value = true
    showResultClients.value = false;
    showInfoClient.value = false;

    swalError(resp?.message);
    return;
  }
  errorSearchClient.value = false;
}

const datosCliente = ref(null);
async function selectClient(client) {
  if (loadingCheck.value) return;
  const respSeg = await fetchCheckSegmentoClient(client.CLI_RUC);

  if (respSeg?.ok === false) {
    datosCliente.value = client;
    verModalActualizarSegmentoObj.show();
  }
  if (respSeg?.ok === true) {
    showResultClients.value = false;
    await processSelectClient(client);
  }

}



async function processSelectClient(client) {

  if (verModalActualizarSegmentoObj) {
    verModalActualizarSegmentoObj.hide();
  }
  datosCliente.value = null;
  showResultClients.value = false;

  const [respCredit, respBranches] = await Promise.all([
    fetchAvailableCreditCustomer(client.CLI_RUC), // Corregido 'Available'
    fetchCustomerBranches(client.CLI_RUC)
  ]);

  if (!respCredit?.ok) {
    swalError(respCredit?.message || 'Error consultando crédito');
    return; // Opcional: ¿Quieres detener todo si falla el crédito?
  }

  // Validamos Sucursales
  if (!respBranches?.ok) {
    swalError(respBranches?.message || 'Error consultando sucursales');
    return;
  }
  showInfoClient.value = true;

  //asignacion de sucursal 
  if (sucursales.value.length > 0) {
    if (!form.value.direccion_facturacion_id) {
      form.value.direccion_facturacion_id = sucursales.value[0].id
    }
  }

  if (warehouseByUser.value.length > 0) {
    if (!form.value.bodega_facturacion) {
      form.value.bodega_facturacion = warehouseByUser.value[0].relacion_bodega.BOD_BODEGA
    }
  }

  form.value.descuento_articulo = Number.parseFloat(client.CLI_DSTO_COMERCIAL || 0);
  form.value.descuento_original = Number.parseFloat(client.CLI_DSTO_COMERCIAL || 0);


}


const checkCoords = (idSucursal) => {
  if (!idSucursal) return false;
  const sucursal = sucursales.value.find(s => s.id === idSucursal);
  // Aquí podrías agregar validaciones extra si las coordenadas vienen como JSON o string raro
  return sucursal && sucursal.coordenadas;
};

// Tus computadas quedan más limpias
const hasCoordinates = computed(() => checkCoords(form.value.direccion_facturacion_id));
const hasCoordinates2 = computed(() => checkCoords(form.value.direccion_entrega_id));

const hasDispatch = computed(() => {
  const warehouse = warehouseByUser.value.find(w => w.relacion_bodega.BOD_BODEGA === form.value.bodega_facturacion);
  return !!warehouse?.relacion_bodega.PERMITE_DESPACHO;
});


// proceso de crear direccion nueva para un cliente 
let dataClient = ref({});
async function openModalCreateAddress() {
  dataClient.value = infoClient.value;
  await nextTick();
  verModalCrearDireccionModalObj.show()

}

async function closeModalCreateAddress(client) {
  verModalCrearDireccionModalObj.hide();
  if (client && client.CLI_RUC) {
    await fetchCustomerBranches(client.CLI_RUC);
  }
  dataClient.value = {};

}

watch(
  () => infoClient.value,
  (newValue) => {
    if (newValue) {
      form.value.cliente = newValue
    }
  }
)

watch(
  () => infoClient.value,
  (newValue) => {
    if (newValue.suspendido === 1) {
      form.value.condicion_pago_id = 'CONTADO';
    } else {
      form.value.condicion_pago_id = newValue.CLI_CONDICION_PAGO
    }
  },
  { immediate: true }
)


//condicion de pago 

watch(() => form.value.condicion_pago_id, async (newVal) => {
  if (newVal) {
    await selectConditionPayment();
  }
});


//metodos de pago 

async function selectConditionPayment() {
  const condId = form.value.condicion_pago_id;
  if (!condId) {
    methodPayment.value = [];
    form.value.forma_pago_id = null;
    return;
  }
  await fetchMethodPayment(condId);
  if (methodPayment.value && methodPayment.value.length > 0) {
    const primeraForma = methodPayment.value[0];
    form.value.forma_pago_id = primeraForma.codigo;

    const descuentoCliente = Number.parseFloat(infoClient.value.CLI_DSTO_COMERCIAL || 0);
    const rebajaMetodo = Number.parseFloat(primeraForma.porcentaje_rebaja || 0); // O 'porcentaje_rebaja'

    const nuevoDescuentoTotal = descuentoCliente + rebajaMetodo;

    form.value.descuento_original = nuevoDescuentoTotal;
    form.value.descuento_articulo = nuevoDescuentoTotal;
    if (form.value.items && form.value.items.length > 0) {
      form.value.items.forEach(articulo => {
        articulo.descuento = nuevoDescuentoTotal;
        articulo.descuento_original = nuevoDescuentoTotal;
      });
    }
    calculateTotals();
  } else {
    // Si la condición de pago no tiene métodos asociados
    form.value.forma_pago_id = null;
    console.log("No se encontraron formas de pago para esta condición");
  }
}

async function selectMethodPayment() {
  let selectedMethod = methodPayment.value.find(m => m.codigo === form.value.forma_pago_id);
  if (!selectedMethod) return;
  const descuentoCliente = Number.parseFloat(infoClient.value.CLI_DSTO_COMERCIAL) || 0;
  const descuentoFormaPago = Number.parseFloat(selectedMethod.porcentaje_rebaja) || 0;
  const nuevoDescuentoTotal = descuentoCliente + descuentoFormaPago;
  if (nuevoDescuentoTotal < 0) return;
  form.value.descuento_original = nuevoDescuentoTotal;
  form.value.descuento_articulo = nuevoDescuentoTotal;
  if (form.value.items && form.value.items.length > 0) {
    form.value.items.forEach(item => {
      item.descuento = nuevoDescuentoTotal;
      item.descuento_original = nuevoDescuentoTotal;
    });
  }
  calculateTotals();
}






/** apertura de modal de consulta de items */
const dataSearchItem = ref({});
const openModalSearchItem = () => {
  dataSearchItem.value = form.value;
  verSearchItemModalObj.show();
}

const closeModalSearchItem = () => {
  dataSearchItem.value = {};
  verSearchItemModalObj.hide();
}

//proceso de seleccion de items para llenar el form-items 
const handleItemSelected = (row) => {
  addItems(row);
}



//proceso de items alternativos

const itemAlternativo = reactive({
  index: 0,
  item: ''
});
async function openModalListItemAlternatives(item, i) {
  itemAlternativo.index = i;
  itemAlternativo.item = item.ART_CODIGO;
  verItemAltObj.show();
}

async function onSelectItemAlternativo(descripcion, i) {
  const repsOnSelect = await updateDescriptionsForCheckAlternative(descripcion, i);
  if (!repsOnSelect?.ok) {
    swalError(repsOnSelect?.message || 'Error al actualizar la descripcion');
    return;
  }
  itemAlternativo.item = '';
  itemAlternativo.index = 0;
  verItemAltObj.hide();
}


//proceso de checkAlternative
async function actualizarCheckAlternative(event, art, i) {
  let valEvent = event.target.checked ? 1 : 0;
  const respCheck = await updateCheckAlternative(valEvent, art.id, i);
  if (!respCheck?.ok) {
    swalError(respCheck?.message || 'Error consultando sucursales');
  }
}




//proceso de proveedores de items 
async function openModalProviders(item, i) {
  clearDataModalProviders();
  dataModalProviders.value = {
    proveedores: item.proveedores || [],
    index: i,
    item: item
  };
  await nextTick();
  verProveedoresObj.show();

}

const handleSaveProviders = async ({ index, providers, nuevoPrecio }) => {
  form.value.items[index].proveedores = providers;
  if (nuevoPrecio) {
    form.value.items[index].ART_VALOR = nuevoPrecio
  }
  let itemId = form.value.items[index].id;
  await storeProvidersForItemL(itemId, providers, nuevoPrecio);
  calculateTotals();

  verProveedoresObj.hide();
}





//proceso de validaciones y proceso de cantidad del item 
async function changeQuantityItem(event, item, i) {
  const qty = event.target.value;
  const oldVal = item.ART_CANTIDAD;
  const resValidate = await validateQtyBeforeUpdate(qty, item);
  if (!resValidate?.ok) {
    form.value.items[i].ART_CANTIDAD = oldVal;
    form.value.items[i].errorCantidad = true;
    event.target.value = oldVal;
    swalWarning(resValidate?.message);
    return;
  }
  const respQty = await updateQuantityItem(qty, item, i);
  if (!respQty?.ok) {
    form.value.items[i].ART_CANTIDAD = oldVal;
    form.value.items[i].errorCantidad = true;
    event.target.value = oldVal;
    swalError(respQty?.message);
    return;
  }
  const formattedQty = formatQty(qty, item);
  form.value.items[i].ART_CANTIDAD = formattedQty;
  event.target.value = formattedQty;
  form.value.items[i].errorCantidad = false;
  calculateTotals();
}






//proceso de modales stock y peso 
async function openModalStockRowItem(item, i) {

  form.value.items[i].stockListo = false;
  dataStockItem.value.items = item.stock;
  dataStockItem.value.index = i;
  dataStockItem.value.permiteDecimales = item.ART_DECIMAL_CANTIDAD > 0;

  await nextTick();
  verSeleccionStockBodegasObj.show();
}

async function closeModalStockRowItem() {

  dataStockItem.value.items = [];
  dataStockItem.value.index = 0;
  dataStockItem.value.permiteDecimales = false;
  verSeleccionStockBodegasObj.hide();
}

async function handleStockUpdate({ stocks, total, index }) {

  const qty = Number(total || 0);
  // 1. Actualizamos el estado local del formulario
  form.value.items[index].stock = stocks;
  form.value.items[index].stockListo = qty > 0;
  // 2. Si es necesario actualizar la cantidad total en BD cada vez que cambian una bodega:
  // NOTA: Esto actualizará el total visualmente y en BD
  let itemInitial = form.value.items[index];
  await updateQuantityItem(qty, itemInitial, index);

  const formattedQty = formatQty(qty, itemInitial);
  form.value.items[index].ART_CANTIDAD = formattedQty;
  form.value.items[index].errorCantidad = false;
  calculateTotals();
}



async function openModalPesoRowItem(item, i) {
  dataPesoItem.value.item = item;
  dataPesoItem.value.index = i;
  verModalPesoItemObj.show();
}


async function handleWeightUpdate({ index, peso }) {

  form.value.items[index].ART_PESO = peso;
  let itemId = form.value.items[index].id;
  await updateWeinghtRowItem(itemId, peso);

}
async function closeModalPesoRowItem() {
  dataPesoItem.value.item = {};
  dataPesoItem.value.index = 0;
  verModalPesoItemObj.hide();
}


//proceso de validacion para modificar de item



async function applyModifyRow(item) {
  let modifierValue = item.modificador;
  if (Number.isNaN(modifierValue) || modifierValue === '') {
    modifierValue = 0
  }
  let decimales = (item.ART_DECIMAL_VALOR && item.ART_DECIMAL_VALOR > 0)
    ? item.ART_DECIMAL_VALOR
    : 4;
  let originalPrice = item.ART_VALOR_ORIGINAL;
  let calculatedPrice = calculatePriceFromModifier(originalPrice, modifierValue);
  calculatedPrice = Number.parseFloat(calculatedPrice.toFixed(decimales));
  item.ART_VALOR = calculatedPrice;
  item.errorModificador = false;
  await updateModifyPriceRowItem(item.id, calculatedPrice, modifierValue);
}


//modificadotr general
async function applyGeneraModifier() {
  let globalModifier = form.value.modificador_global;
  if (Number.isNaN(globalModifier) || globalModifier === '') {
    globalModifier = 0
  }


  const updatePromises = form.value.items.map(async (item) => {
    const tipoCompra = (item.ART_TIPO_COMPRA || '').trim().toUpperCase();
    if (tipoCompra === 'L') return;
    item.modificador = globalModifier;
    return applyModifyRow(item);
  });

  try {
    await Promise.all(updatePromises);
    console.log("Actualización masiva terminada");
  } catch (error) {
    console.error("Error al actualizar items:", error);
  }
}



//proceso de modificaicon de precios

const saveModifyPrice = async (element) => {
  if (element.ART_VALOR === element.valor_temporal) {
    element.cambiar_valor = false;
    return;
  }
  let nuevoModificar = calculateRowModifier(element, element.ART_VALOR);
  nuevoModificar = Number.parseFloat(nuevoModificar.toFixed(4));
  element.modificador = nuevoModificar;
  element.cambiar_valor = false;
  const resp = await updateModifyPriceRowItem(element.id, element.ART_VALOR, nuevoModificar);
  if (!resp?.ok) {
    element.ART_VALOR = element.valor_temporal;
    element.modificador = calculateRowModifier(element, element.valor_temporal);
    swalError(resp?.message);
  }
}


/**
 *  proceso de modificacion de descuento
 */

const saveModifyDiscount = async (element) => {
  if (element.descuento === element.descuento_temporal) {
    element.cambiar_descuento = false;
    return;
  }
  element.cambiar_descuento = false;
  const resp = await updateModifyDiscountRowItem(element.id, element.descuento);
  if (!resp?.ok) {
    element.descuento = element.descuento_temporal;
    swalError(resp?.message);
    // return;
  }
}


/** proceso de eliminacion de registro de item  */

async function confirmarEliminarArticulo(item, i) {
  toast
    .fire({
      title: "Estás seguro?",
      text: "De eliminar el producto " + item.ART_CODIGO + "",
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
        removeRowItem(item, i)
      }
    });
}
async function removeRowItem(item, i) {
  form.value.items[i].disabled_delete = true;
  await removeItem(item, i);
  form.value.items.splice(i, 1);
  await nextTick();
  calculateTotals();
}




/** limpiar la cotizacion */

async function clearCotizacion() {
  await clearQuotation();
  clearForm();
}


onMounted(async () => {
  await fetchWarehouseByPtoVtaUser();
  await fetchConditionPayment();
  //logica para recuperar datos en memoria
  if (form.value.cliente && form.value.cliente.CLI_RUC) {
    loadingSearch.value = true;
    loadingAvailableCredit.value = false;
    infoClient.value = form.value.cliente;
    showInfoClient.value = true;
    showResultClients.value = false;
    await nextTick();
    try {

      await Promise.all([
        fetchAvailableCreditCustomer(form.value.cliente.CLI_RUC),
        fetchCustomerBranches(form.value.cliente.CLI_RUC)
      ]);
    } catch (e) {
      console.error("Error cargando datos del cliente recuperado", e);
    } finally {
      loadingSearch.value = false;
      showInfoClient.value = true;
      loadingAvailableCredit.value = false;

    }
  }

});

</script>
<template>
  <div class="content">
    <BaseBlock title="Cliente" content-full rounded>
      <div class="row g-2">
        <div class="col">
          <div class="input-group input-group-sm">
            <input type="text" class="form-control" :class="errorSearchClient ? 'is-invalid' : ''"
              placeholder="Buscar cliente..." autocomplete="off" @keyup.enter="searchFilterClientes"
              v-model="dataSearch.search" />
            <button class="btn btn-primary" type="button" @click="searchFilterClientes" :disabled="loadingSearch">
              <i class="fa fa-search"></i>
            </button>
          </div>
        </div>
        <div class="col-auto">
          <router-link :to="{ name: 'ventas-crearcliente' }" class="btn btn-success btn-sm"
            :class="{ 'disabled': loadingSearch }">
            <i class="fa fa-plus me-1"></i> Crear
          </router-link>
        </div>
      </div>

      <!-- loading de carga de clientes -->
      <div v-if="loadingSearch" class="text-center py-4">
        <output class="spinner-border text-primary mt-4">
          <span class="visually-hidden">Loading...</span>
        </output>
      </div>

      <!-- mensaje de visualizacion en caso de que no haya clientes -->
      <div v-if="clients.length === 0 && !loadingSearch && showResultClients" class="text-center py-4">
        <i class="fa fa-box-open fa-2x text-muted mb-2"></i>
        <p class="text-muted mb-0">
          No se encontraron registros para mostrar
        </p>
      </div>

      <!-- table de clientes  -->
      <BaseBlock v-if="showResultClients && clients.length > 0 && !loadingSearch" class="mb-2">
        <div class="table-responsive">
          <table class="table table-hover table-sm ">
            <thead>
              <tr>
                <th>Ruc</th>
                <th>Razón Social</th>
                <th>Contacto</th>
                <th>Ciudad</th>
                <th>Provincia</th>
                <th>Teléfono</th>
                <th>Correo</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(client, index) in clients" :key="index">
                <td class="fs-sm" @click="selectClient(client)">
                  <span class="text-primary">{{ client.CLI_RUC }}</span>
                </td>
                <td class="fs-sm" @click="selectClient(client)">
                  <span class="text-primary">{{ client.CLI_RAZON_SOCIAL }}</span>
                </td>
                <td class="fs-sm">{{ client.CLI_CONTACTO }}</td>
                <td class="fs-sm">{{ client.CLI_CIUDAD }}</td>
                <td class="fs-sm">{{ client.CLI_PROVINCIA }}</td>
                <td class="fs-sm">{{ client.CLI_TELEFONO_1 }}</td>
                <td class="fs-sm">
                  <a :href="'mailto:' + client.CLI_CORREO_ELECT_SRI">{{ client.CLI_CORREO_ELECT_SRI }}</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseBlock>


      <!-- detalle visual de informacion de cliente -->
      <div v-if="loadingAvailableCredit" class="text-center py-4">
        <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <BaseBlock v-if="showInfoClient && infoClient && !loadingAvailableCredit" class="mb-0">
        <div class="content-fluid">
          <div class="row g-1 mb-2">
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Ruc</small>
                <div class="fw-semibold text-truncate">{{ infoClient.CLI_RUC }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Razón Social</small>
                <div class="fw-semibold text-truncate">{{ infoClient.CLI_RAZON_SOCIAL }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Descuento Comercial</small>
                <div class="fw-semibold ">{{ infoClient.CLI_DSTO_COMERCIAL }} %</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Ciudad</small>
                <div class="fw-semibold ">{{ infoClient.CLI_CIUDAD }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Provincia</small>
                <div class="fw-semibold ">{{ infoClient.CLI_PROVINCIA }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Condición de Pago</small>
                <div class="fw-semibold ">{{ infoClient.CLI_CONDICION_PAGO }}</div>
                <span class="badge bg-info" v-if="infoClient.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0">{{
                  infoClient.CLI_DIA_GRACIA_CHEQUE_A_FECHA }}</span>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Suspendido</small>
                <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                  :class="getClientStatus(infoClient.suspendido).class">
                  {{ getClientStatus(infoClient.suspendido).text }}
                </span>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Cupo Asignado</small>
                <div class="fw-semibold ">${{
                  infoClient.cupo_asignado }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Cupo Disponible</small>
                <div class="fw-semibold " :class="parseFloat(infoClient.cupo_disponible) < 0 ? 'text-danger' : ''">${{
                  infoClient.cupo_disponible }}</div>
              </div>
            </div>
            <div v-if="infoSegmento" class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Segmento</small>
                <div class="fw-semibold ">{{ infoSegmento.segmento }}</div>
              </div>
            </div>
            <div v-if="infoSegmento" class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Segmento</small>
                <div class="fw-semibold ">{{ infoSegmento.subsegmento }}</div>
              </div>
            </div>
            <div class="col-12 col-lg-4">
              <div class="kv space-y-2">
                <small class="text-muted">Bodegas</small>
                <select class="form-select form-select-sm" v-model="form.bodega_facturacion">
                  <option v-for="(bod, index) in warehouseByUser" :key="index" :value="bod.relacion_bodega.BOD_BODEGA">
                    {{ bod.relacion_bodega.BOD_BODEGA }}
                  </option>
                </select>
              </div>
            </div>

            <div class="col-12 col-lg-8">
              <div class="kv space-y-2">
                <small class="text-muted">Dirección de Facturación</small>
                <div class="input-group input-group-sm">
                  <select class="form-select" v-model="form.direccion_facturacion_id">
                    <option v-for="(suc, index) in sucursales" :key="index" :value="suc.id">
                      {{ suc.CLI_SUC_ID_DIRECCION }} - {{ suc.CLI_SUC_DIRECCION }}
                    </option>
                  </select>
                  <button class="btn btn-outline-secondary" type="button"
                    :title="hasCoordinates ? 'Ver ubicación en mapa' : 'Dirección sin coordenadas'"
                    :class="{ 'opacity-50': !hasCoordinates }">
                    <img v-if="hasCoordinates" src="/assets/images/earth.png" alt="Tiene coordenadas" class="img-fluid"
                      style="max-width: 18px;">
                    <img v-else src="/assets/images/earth2.png" alt="No tiene coordenadas" class="img-fluid"
                      style="max-width: 18px;">
                  </button>
                  <button class="btn btn-primary" type="button" @click="openModalCreateAddress">
                    <i class="fa fa-plus"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="col-12 col-lg-4">
              <div class="kv space-y-2">
                <small class="text-muted">Modalidad de Entrega</small>
                <div class="btn-group btn-group-sm" role="group">
                  <input type="radio" class="btn-check" name="tipoEntrega" id="retiro" value="retiro"
                    v-model="form.tipo_entrega" autocomplete="off">
                  <label class="btn btn-outline-primary" for="retiro">
                    <i class="fa fa-box me-2"></i>Retiro en Bodega
                  </label>

                  <input v-if="hasDispatch" type="radio" class="btn-check" name="tipoEntrega" id="despacho"
                    value="despacho" v-model="form.tipo_entrega" autocomplete="off">
                  <label v-if="hasDispatch" class="btn btn-outline-primary" for="despacho">
                    <i class="fa fa-truck me-2"></i>Despacho en Ruta
                  </label>
                </div>
              </div>
            </div>
            <div v-show="form.tipo_entrega === 'retiro'"></div>
            <div v-show="form.tipo_entrega === 'despacho'" class="row g-1 mb-2">
              <div class="col-12 col-lg-6">
                <div class="kv space-y-2">
                  <small class="text-muted">Dirección de Entrega</small>
                  <div class="input-group input-group-sm">
                    <select class="form-select form-select-sm" v-model="form.direccion_entrega_id">
                      <option v-for="(suc, index) in sucursales" :key="index" :value="suc.id">
                        {{ suc.CLI_SUC_ID_DIRECCION }} - {{ suc.CLI_SUC_DIRECCION }}
                      </option>
                    </select>
                    <button class="btn btn-outline-secondary btn-sm" type="button"
                      :title="hasCoordinates2 ? 'Ver ubicación en mapa' : 'Dirección sin coordenadas'"
                      :class="{ 'opacity-50': !hasCoordinates2 }">
                      <img v-if="hasCoordinates2" src="/assets/images/earth.png" alt="Tiene coordenadas"
                        class="img-fluid" style="max-width: 18px;">
                      <img v-else src="/assets/images/earth2.png" alt="No tiene coordenadas" class="img-fluid"
                        style="max-width: 18px;">
                    </button>

                  </div>
                </div>
              </div>
              <div class="col-12 col-lg-6">
                <div class="kv space-y-2">
                  <small class="text-muted">Fecha de Entrega</small>
                  <flat-pickr id="fecha_entrega" class="form-control form-control-sm" v-model="form.fecha_entrega"
                    :config="flatPickrState" />
                </div>
              </div>
            </div>

          </div>
        </div>
      </BaseBlock>
    </BaseBlock>
    <BaseBlock v-if="showInfoClient && infoClient && !loadingAvailableCredit" title="Cotización" class="mb-0">
      <div class="d-flex align-items-center mb-4">
        <div class="btn-group btn-group-sm" role="group">
          <button type="button" class="btn btn-outline-primary" @click="openModalSearchItem"><i
              class="fa fa-search me-1"></i> Buscar
            Articulo</button>
          <button type="button" class="btn btn-outline-success"> <i class="fa fa-rotate me-1"></i>Stock</button>
        </div>
      </div>
      <div class="table-responsive mt-1 mb-2">
        <table v-if="form.items.length > 0" class="table table-hover table-sm table-vcenter mt-0">
          <thead>
            <tr>
              <th scope="col" class="text-center" style="width: 40px;">#</th>
              <th scope="col" style="min-width: 100px;">Código</th>
              <th scope="col">Descripción</th>
              <th scope="col" style="width:3rem"></th>
              <th scope="col" class="text-center" style="width: 50px;">ALT</th>
              <th scope="col" class="text-center" style="width: 50px;">CTL</th>
              <th scope="col" class="text-center" style="width: 50px;">UDM</th>
              <th scope="col" style="width: 50px;"></th>
              <th scope="col" class="text-center" style="width: 80px;">Cantidad</th>
              <th scope="col" style="width: 50px;"></th>
              <th scope="col" class="text-end" style="width: 60px;">Stock</th>
              <th scope="col" class="text-center" style="width: 90px;">Mod %</th>
              <th scope="col" class="text-end" style="width: 100px;">Precio</th>
              <th scope="col" class="text-end" style="width: 80px;">% Desc.</th>
              <th scope="col" class="text-end" style="width: 100px;">T. con Desc.</th>
              <th scope="col" style="width: 50px;"></th>

            </tr>
          </thead>
          <draggable v-model="form.items" tag="tbody" :item-key="'id'" handle=".handle">
            <template #item="{ element, index }">
              <tr>
                <td class="fs-sm text-center"> {{ index + 1 }}</td>
                <td class="fs-sm code">{{ element.ART_CODIGO }}</td>
                <!-- descripcion -->
                <td class="fs-sm">
                  <div v-if="!isDescriptionEditable(index)" @click="enableEditModeDescription(index)"
                    class="d-flex align-items-center" style="cursor:pointer" title="Click para editar">
                    <div class="d-flex flex-column lh-sm">
                      <span :class="getDescriptionClass(element)" class="fw-medium">
                        {{ element.ART_DESCRIPCION }}
                      </span>
                      <small v-if="element.CHECK_ALTERNATIVO == 1" class="text-warning fst-italic"
                        style="font-size: 0.75rem;">
                        <i class="fa fa-info-circle me-1"></i>Alternativa
                      </small>
                    </div>
                  </div>
                  <input v-else type="text" :id="`updatedescripcion-${element.id}`" class="form-control form-control-sm"
                    :class="{ 'is-invalid': element.errorDescripcion }" placeholder="Descripción del artículo"
                    v-model="element.ART_DESCRIPCION" v-focus @blur="updateDescripcion($event, element, index)"
                    @keyup.enter="updateDescripcion($event, element, index)">
                </td>
                <!-- obtener listado de descripciones -->
                <td class="fs-sm text-center">
                  <button type="button" class="btn btn-sm btn-info"
                    @click="openModalListItemAlternatives(element, index)">
                    <i class="fa fa-search"></i>
                  </button>
                </td>
                <!-- check alternativo -->
                <td class="fs-sm text-center">
                  <input type="checkbox" class="form-check-input" :id="`checkAlternativo-${element.id}`"
                    @click="actualizarCheckAlternative($event, element, index)" v-model="element.CHECK_ALTERNATIVO"
                    :true-value="1" :false-value="0">
                </td>
                <!-- codigo 3 letras -->
                <td class="fs-sm"> {{ element.ART_CODIGO_TRES_LETRAS }} </td>
                <!-- unidad de medida UDM -->
                <td class="fs-sm">{{ element.ART_PLAN_UMEDIDA }}</td>
                <!-- abrir modal de proveedores -->
                <td class="fs-sm">
                  <div v-if="isItemL(element)">
                    <button type="button" class="btn btn-sm"
                      :class="element.proveedores_listo ? 'btn-success' : 'btn-danger'"
                      @click="openModalProviders(element, index)">
                      <i class="fa fa-people-arrows-left-right"></i>
                    </button>
                  </div>
                </td>
                <!-- cantidad -->
                <td class="fs-sm">
                  <input type="text" :id="`updatecantidad-${element.id}`" class="form-control text-end"
                    :class="{ 'is-invalid': element.errorCantidad }" placeholder="0" min="0"
                    :value="element.ART_CANTIDAD" @change="changeQuantityItem($event, element, index)"
                    :tablindex="index + 1">
                </td>

                <!-- modal para abrir stock de bodega -->
                <td class="fs-sm">

                  <!-- boton stock -->
                  <button v-if="shouldShowStock(element)" type="button" class="btn btn-sm"
                    :class="element.stockListo ? 'btn-success' : 'btn-warning'" title="Seleccionar stock por bodega"
                    :disabled="isStockDisabled(element)" @click="openModalStockRowItem(element, index)">
                    <i v-if="isStockDisabled(element)" class="fa fa-spinner fa-spin"></i>
                    <i v-else class="fa-solid fa-warehouse"></i>
                  </button>



                  <!-- boton peso -->
                  <button v-else class="btn btn-sm btn-info" title="Peso de artículo"
                    @click="openModalPesoRowItem(element, index)">
                    <i class="fa-solid fa-scale-unbalanced"></i>
                  </button>


                </td>

                <!-- ART_STOCK -->
                <td class="fs-sm text-end">
                  <span v-if="shouldShowStock(element)">
                    {{ element.ART_STOCK }}
                  </span>
                  <span v-else class="text-muted" style="text-align:center" title="No aplica stock">
                    &mdash;
                  </span>
                </td>
                <!-- modificador -->
                <td class="fs-sm  text-end">
                  <input v-if="element.ART_TIPO_COMPRA !== 'L'" type="number" class="form-control text-end no-spinners"
                    step="0.01" :class="{ 'is-invalid': element.errorModificador }" placeholder="0.00"
                    v-model.number="element.modificador" @focus="$event.target.select()"
                    @change="applyModifyRow(element)" @keydown.enter="$event.target.blur()">
                  <span v-else class="text-muted" style="text-align:center" title="No aplica modificador">
                    &mdash;
                  </span>
                </td>
                <!-- precio -->
                <td class="fs-sm text-end col-1">
                  <div v-if="!isPriceEditable(element)" @click="enableEditPrice(element, index)" class="cursor-pointer"
                    title="Clic para editar">
                    <span :class="applyModifyPrice(element) ? 'text-danger' : 'text-primary'">
                      ${{ formatPrice4(parseFloat(element.ART_VALOR)) }}
                    </span>

                  </div>
                  <input v-else :id="`input-precio-${index}`" type="number" step="0.0001" min="0.0000"
                    class="form-control text-end no-spinners p-1" :class="{ 'is-invalid': element.errorPrecio }"
                    v-model.number="element.ART_VALOR" @focus="$event.target.select()"
                    @blur="saveModifyPrice(element, index)" @keyup.enter="$event.target.blur()"
                    @keyup.esc="exitEditPrice(element)">
                </td>
                <!-- descuento con opcion de cambiar descuento-->
                <td class="fs-sm text-end col-1">
                  <div v-if="!isEditDiscount(element)" @click="enableEditDiscount(element, index)"
                    class="cursor-pointer" title="Clic para editar">
                    <span :class="applyModifyDiscount(element) ? 'text-danger' : 'text-primary'">
                      {{ format(parseFloat(element.descuento)) }}%
                    </span>

                  </div>
                  <input v-else :id="`input-descuento-${index}`" type="number" step="0.0000" min="0.0000"
                    class="form-control text-end no-spinners p-1" :class="{ 'is-invalid': element.errorDescuento }"
                    v-model.number="element.descuento" @focus="$event.target.select()"
                    @blur="saveModifyDiscount(element, index)" @keyup.enter="$event.target.blur()"
                    @keyup.esc="exitEditDiscount(element)">
                </td>
                <!-- total con descuento -->
                <td class="fs-sm  text-end col-1">
                  ${{ (element.subtotal) }}
                </td>
                <!-- botones -->
                <td>
                  <button type="button " class="btn btn-danger btn-sm mx-1"
                    @click="confirmarEliminarArticulo(element, index)" :disabled="element.disabled_delete">
                    <i class="fa fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            </template>
          </draggable>
          <!-- fotter -->
          <tfoot v-if="form.items.length > 0">
            <tr>
              <th scope="col" colspan="15" class="fs-sm text-end border-0"> Subtotal sin Descuento</th>
              <th scope="col" class="fs-sm text-end text-nowrap border-0"> ${{ format(form.subtotal + form.descuento) }}
              </th>
              <th scope="col" class="border-0"></th>
            </tr>
            <tr>
              <th scope="col" colspan="15" class="fs-sm text-end text-danger border-0"> Descuento</th>
              <th scope="col" class="fs-sm text-end text-danger text-nowrap border-0"> - ${{ format(form.descuento) }}
              </th>
              <th scope="col" class="border-0"></th>
            </tr>
            <tr>
              <th scope="col" colspan="15" class="fs-sm text-end border-0">Subtotal Neto</th>
              <th scope="col" class="fs-sm text-end text-nowrap border-0">
                ${{ format(form.subtotal) }}
              </th>
              <th scope="col" class="border-0"></th>
            </tr>
            <tr>
              <th scope="col" colspan="15" class="fs-sm text-end border-0">IVA</th>
              <th scope="col" class="fs-sm text-end text-nowrap border-0">
                ${{ format(form.iva) }}
              </th>
              <th scope="col" class="border-0"></th>
            </tr>
            <tr class="table-active">
              <th scope="col" colspan="15" class="fs-sm text-end fw-bold">TOTAL</th>
              <th scope="col" class="fs-sm text-end fw-bold text-nowrap">
                ${{ format(parseFloat(form.total)) }}
              </th>
              <th scope="col" class="border-0"></th>
            </tr>
            <tr>
              <td colspan="16" class="border-0 p-1"></td>
            </tr>
            <tr>
              <th scope="col" colspan="15" class="fs-sm text-end text-muted fst-italic border-0">Peso total aprox.</th>
              <th scope="col" class="fs-sm text-end text-muted fst-italic text-nowrap border-0">
                {{ format(form.peso) }} Kg
              </th>
              <th scope="col" class="border-0"></th>
            </tr>
          </tfoot>
          <!-- end fotter -->
        </table>
      </div>

      <!-- condiciones de pago  -->

      <div class="row mb-2">
        <div class="col-12">

          <div v-if="form.alerta_factura" class="mb-4">
            <div class="alert alert-warning d-flex align-items-center flex-wrap gap-3 shadow-sm border-0 mb-0">

              <div class="d-flex align-items-center gap-2">
                <i class="fa fa-exclamation-triangle"></i>
                <span class="fw-bold">Factura a demanda posterior al despacho</span>
              </div>

              <div v-if="form.preguntar_facturar" class="d-flex align-items-center gap-3 flex-wrap ms-md-auto">
                <span class="small opacity-75">
                  Último día: <strong class="text-primary">{{ form.cliente.CLI_DIA_MAXIMO_MES_FACTURACION }}</strong>
                </span>
                <div class="form-check form-switch mb-0">
                  <input class="form-check-input" type="checkbox" id="switch-facturar" :true-value="0" :false-value="1"
                    v-model="form.factura_siguiente_mes">
                  <label class="form-check-label fw-bold text-primary" for="switch-facturar">
                    Facturar ahora
                  </label>
                </div>
              </div>

            </div>
          </div>

          <BaseBlock class="mb-4">

            <template #title>
              <div class="d-flex align-items-center gap-2">
                <i class="fa fa-file-invoice-dollar text-body-secondary"></i>
                <span class="fw-semibold">Condiciones de venta</span>
              </div>
            </template>

            <div class="row g-4">
              <div class="col-md-6 col-xl-3">
                <label for="condicionPagoSelect"
                  class="form-label small text-uppercase fw-bold text-body-secondary">Condición
                  de pago</label>
                <select id="condicionPagoSelect" class="form-select" :disabled="loadingConditionPayment"
                  v-model="form.condicion_pago_id">

                  <option v-for="(cod, index) in conditionPayment" :key="index" :value="cod.condId">{{ cod.condId }}
                  </option>
                </select>
              </div>

              <div class="col-md-6 col-xl-5">
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <label for="metodoPagoSelect"
                    class="form-label small text-uppercase fw-bold text-body-secondary mb-0">Forma
                    de pago</label>
                  <span v-if="form.condicion_pago_id !== infoClient.CLI_CONDICION_PAGO" id="metodoPagoSelect"
                    class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill">
                    Condición diferente
                  </span>
                </div>

                <select class="form-select mb-2" v-model="form.forma_pago_id" :disabled="loadingMethodPayment"
                  @change="selectMethodPayment">
                  <option v-for="(me, index) in methodPayment" :key="index" :value="me.codigo"> {{ me.tipo }}</option>
                </select>

                <div class="d-flex align-items-center justify-content-end small">
                  <span class="text-body-secondary me-2">Descuento aplicado:</span>
                  <a href="javascript:void(0)" class="fw-bold text-decoration-none text-info">{{
                    Number(form.descuento_articulo).toFixed(2) }}%</a>
                </div>
              </div>

              <div class="col-md-5 col-xl-2">
                <label for="descuentoGeneralInput"
                  class="form-label small text-uppercase fw-bold text-body-secondary">Desc.
                  General PVP</label>
                <div class="input-group">
                  <input id="descuentoGeneralInput" type="number" class="form-control text-end no-spinners"
                    placeholder="0.00" value="0.00" v-model.number="form.modificador_global"
                    @change="applyGeneraModifier">
                  <span class="input-group-text bg-body-tertiary text-body-secondary">%</span>
                </div>
              </div>

              <div class="col-md-6 col-xl-2">
                <label for="ordenCompraInput" class="form-label small text-uppercase fw-bold text-body-secondary">Orden
                  de
                  Compra</label>
                <div class="position-relative">
                  <input id="ordenCompraInput" type="text" class="form-control " placeholder="Opcional"
                    value="OC-2024-999" v-model="form.orden_de_compra" :maxlength="maxOrder">
                  <span class="position-absolute top-50 end-0 translate-middle-y me-2 badge bg-dark opacity-50 small">
                    {{ maxOrder -
                      form.orden_de_compra.length
                    }}
                  </span>
                </div>
              </div>

            </div>
          </BaseBlock>

          <BaseBlock class="mb-4">
            <template #title>
              <div class="d-flex align-items-center gap-2">
                <i class="fa fa-sticky-note text-body-secondary"></i>
                <span class="fw-semibold">Notas</span>
              </div>
            </template>

            <div class="row g-4">
              <div class="col-md-4">
                <div class="d-flex justify-content-between mb-1">
                  <label class="form-label small text-uppercase fw-bold text-body-secondary">Nota Cliente</label>
                  <span v-if="form.nota_cliente" class="small text-body-secondary" style="font-size: 0.7rem;">{{
                    maxLengthNote
                    - form.nota_cliente.length }}</span>
                </div>
                <textarea class="form-control border-start border-4 border-primary" rows="3"
                  placeholder="Visible en factura..." v-model.trim="form.nota_cliente"
                  :maxlength="maxLengthNote"></textarea>
              </div>

              <div class="col-md-4">
                <label class="form-label small text-uppercase fw-bold text-body-secondary">Nota Interna</label>
                <textarea class="form-control border-start border-4 border-warning" rows="3"
                  placeholder="Uso administrativo..." v-model.trim="form.nota_interna"></textarea>
              </div>

              <div class="col-md-4">
                <label class="form-label small text-uppercase fw-bold text-body-secondary">Nota Operaciones</label>
                <textarea class="form-control border-start border-4 border-danger" rows="3"
                  placeholder="Logística y bodega..." v-model.trim="form.nota_operaciones"></textarea>
              </div>
            </div>
          </BaseBlock>

          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pt-3 border-top gap-3">

            <button type="button" class="btn btn-outline-danger px-4 w-100 w-md-auto order-2 order-md-1" @click="clearCotizacion" :disabled="loadingClearQuotation">
              Limpiar cotización
            </button>

            <div class="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto order-1 order-md-2">

              <button type="button" class="btn btn-success px-4 fw-bold shadow-sm w-100 w-md-auto">
                <i class="fa fa-save me-2"></i>Guardar Cotización
              </button>

              <button type="button" class="btn btn-warning px-4 fw-bold text-dark shadow-sm w-100 w-md-auto">
                <i class="fa fa-check-circle me-2"></i>Guardar Pedido
              </button>

            </div>

          </div>

        </div>
      </div>
    </BaseBlock>
    <!-- {{ form }} -->

  </div>


  <!-- seccion de modales -->

  <!-- modal para actualizacion de segmento -->
  <div class="modal" id="modal-segmento" tabindex="-1" role="dialog" aria-labelledby="modal-segmento" aria-hidden="true"
    ref="verModalActualizarSegmento">
    <div class="modal-dialog modal-md modal-dialog-centered" role="document">
      <div class="modal-content">
        <actualizarSegmentoClienteComponent v-if="datosCliente" :cliente="datosCliente" @updated="processSelectClient">
        </actualizarSegmentoClienteComponent>
      </div>
    </div>
  </div>

  <!-- modal para la creacion de una nueva direccion -->
  <div class="modal" id="modal-crear-direccion" tabindex="-1" role="dialog" aria-labelledby="modal-crear-direccion"
    aria-hidden="true" ref="verModalCrearDireccionModal">
    <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
      <div class="modal-content">
        <verModalCrearNuevaDireccion v-if="dataClient" :cliente="dataClient" @closeModal="closeModalCreateAddress">
        </verModalCrearNuevaDireccion>
      </div>
    </div>
  </div>

  <!-- modal de busqueda de articulos -->
  <div class="modal" id="modal-cliente" tabindex="-1" role="dialog" aria-labelledby="modal-cliente" aria-hidden="true"
    ref="verSearchItemModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" role="document" style="max-width: 90vw;">
      <div class="modal-content">
        <verModalBuscarArticulos v-if="dataSearchItem" :form="dataSearchItem" @closeModal="closeModalSearchItem"
          @select-item="handleItemSelected"></verModalBuscarArticulos>
      </div>
    </div>
  </div>

  <!-- Modal para listar y asignar item alternativo -->
  <div class="modal" id="modal-item-alternativo" tabindex="-1" role="dialog" aria-labelledby="modal-item-alternativo"
    aria-hidden="true" ref="verItemAltRef">
    <div class="modal-dialog modal-sm modal-dialog-centered" role="document" style="max-width: 400px">
      <div class="modal-content">
        <verModalItemAlternativo v-if="itemAlternativo" :item="itemAlternativo.item" :indice="itemAlternativo.index"
          @seleccionarAlternativa="onSelectItemAlternativo">
        </verModalItemAlternativo>
      </div>
    </div>
  </div>

  <!-- modal para la seleccion del stock de un articulo -->
  <div class="modal" id="modal-bodegas" tabindex="-1" role="dialog" aria-labelledby="modal-bodegas" aria-hidden="true"
    ref="verSeleccionStockBodegasRef">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <verModalSeleccionStockBodegas v-if="dataStockItem.items.length > 0" :stocks="dataStockItem.items"
          :index="dataStockItem.index" :permiteDecimales="dataStockItem.permiteDecimales"
          @closeModal="closeModalStockRowItem" @update="handleStockUpdate">
        </verModalSeleccionStockBodegas>
      </div>
    </div>
  </div>


  <!-- modal de modificacion de peso  -->
  <div class="modal" id="modal-peso" tabindex="-1" role="dialog" aria-labelledby="modal-peso" aria-hidden="true"
    ref="verModalPesoItemRef">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <verModalModificacionPeso :item="dataPesoItem.item" :index="dataPesoItem.index"
          @cerrar="closeModalPesoRowItem()" @actualizar="handleWeightUpdate">
        </verModalModificacionPeso>
      </div>
    </div>
  </div>

  <!-- modal de seleccion de proveedores para items L  -->
  <div class="modal fade" id="modal-block-proveedor" tabindex="-1" role="dialog" data-bs-backdrop="static"
    data-bs-keyboard="false" aria-hidden="true" ref="verProveedoresRef">
    <div class="modal-dialog modal-xl" role="document" style="max-width: 90vw;">
      <div class="modal-content">
        <verModalProveedores v-if="dataModalProviders.proveedores" :providers="dataModalProviders.proveedores"
          :index="dataModalProviders.index" :item="dataModalProviders.item" @update:providers="handleSaveProviders">
        </verModalProveedores>
      </div>
    </div>
  </div>

</template>

<style scoped>
@media (min-width: 1200px) {
  .billing-sticky {
    position: sticky;
    top: .75rem;
  }
}

.kv small {
  display: block;
  line-height: 1;
}

.kv .badge2 {
  white-space: normal;
  /* CLAVE: Permite que el texto haga salto de línea */
  text-align: left;
  /* Alinea el texto a la izquierda para leer mejor párrafos */
  display: block;
  /* Hace que ocupe el ancho disponible de la columna */
  line-height: 1.4;
  /* Da un poco de aire entre las líneas de texto */
  font-weight: 10px;
  /* Opcional: quita la negrita si el texto es muy largo */
}


.kv .fw-semibold {
  line-height: 1.1;
}

.text-monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
}

@media (min-width: 992px) {
  .table.table-sm> :not(caption)>*>* {
    padding-top: .35rem;
    padding-bottom: .35rem;
  }
}


/* columnas numéricas alineadas */
.code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace;
  font-size: 14px;
}

.form-control-sm.flatpickr-input {
  height: calc(1.5em + 0.5rem + 2px);
  /* Altura estándar de sm en BS5 */
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  font-size: 0.875rem;
}


/* Ocultar flechas en Chrome, Safari, Edge, Opera */
input.no-spinners::-webkit-outer-spin-button,
input.no-spinners::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Ocultar flechas en Firefox */
input.no-spinners {
  -moz-appearance: textfield;
}

td input.form-control {
  min-width: 60px;
  /* Asegura que nunca sean inusables */
  width: 100%;
  /* Ocupa toda la celda */
  padding: 0.25rem;
  /* Padding pequeño */
}
</style>