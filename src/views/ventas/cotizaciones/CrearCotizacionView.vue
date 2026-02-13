<script setup>
import { onMounted, ref, computed, watch, reactive, nextTick } from "vue";
import { swalWarning, swalError, toast, swalSuccess } from "@/functions/swal-alert.js";
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import { useProcessCreateQuote } from "@/composables/venta/cotizaciones/crearCotizacion/useProcessCreateQuote";
import { useSearchConditionPayment } from "@/composables/venta/cotizaciones/crearCotizacion/useSearchConditionPayment";
import { useCheckClientSegment } from "@/composables/venta/cotizaciones/useCheckClientSegment";
import { useImageUpload } from "@/composables/core/useImageUpload";
import actualizarSegmentoClienteComponent from "@/views/ventas/modals/actualizarSegmentoClienteModal.vue";
import flatPickr from 'vue-flatpickr-component';
import { Spanish } from "flatpickr/dist/l10n/es.js"
import { useBootstrapModal } from '@/composables/core/useBootstrapModal';
import draggable from 'vuedraggable'
import { formatPrice4, format } from "@/functions";
import VueEasyLightbox from "vue-easy-lightbox";
// imports modales
import verModalCrearNuevaDireccion from "@/views/ventas/modals/verModalCrearNuevaDireccion.vue";
import verModalBuscarArticulos from "@/views/ventas/modals/verModalBuscarArticulos.vue";
import verModalItemAlternativo from "@/views/ventas/modals/verModalItemAlternativo.vue";
import verModalSeleccionStockBodegas from "@/views/ventas/modals/verModalSeleccionStockBodegas.vue";
import verModalModificacionPeso from "@/views/ventas/modals/verModalModificacionPeso.vue";
import verModalProveedores from "@/views/ventas/modals/verModalProveedores.vue";
import { useRouter } from "vue-router";

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
  ptoVtaSelect,
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
  updateDescriptionsForCheckAlternative,
  clearSelectionItemalternative,

  //proceso de checkbox alternativos
  updateCheckAlternative,

  //proceso para manejo de cantidades
  validateQtyBeforeUpdate,
  formatQty,
  changeQuantityItem,
  //proceso de proveedores
  isItemL,
  dataModalProviders,
  clearDataModalProviders,
  //proceso de stock total de un articulo 
  shouldShowStock,

  //proceso de modal stock y peso 
  dataStockItem,
  isStockDisabled,
  //peso  
  dataPesoItem,
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
  //descuento global
  isEditingGlobalDiscount,
  enableGlobalDiscountEdit,
  inputGlobalDiscountRef,
  cancelGlobalDiscountEdit,
  updateGlobalDiscount,

  //update stock por lote
  updateStockByBatch,
  loadingStockMasivo,
  //gloabl
  calculateTotals,

  //proceso de creacion de cotizacion
  loadingCreateQuotation,
  isQuoteValid,
  createQuote,
  loadingSaveOrder,
  saveOrder,
  isRecoveringQuote
} = useProcessCreateQuote();
const {
  loadingConditionPayment,
  fetchConditionPayment,
  conditionPayment,
  loadingMethodPayment,
  fetchMethodPayment,
  methodPayment
} = useSearchConditionPayment();

// Extraes las variables y funciones
const {
  uploadedFiles,
  isDragging,
  isCompressing,
  handleDrop,
  handleInputFiles,
  removeFile,
  clearFiles
} = useImageUpload();

const { loadingCheck, fetchCheckSegmentoClient } = useCheckClientSegment();
const flatPickrState = reactive({
  minDate: "today",
  monthSelectorType: "static",
  locale: Spanish,
  dateFormat: "Y-m-d"
});

const router = useRouter();
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
const verSearchItemModalObj = useBootstrapModal(verSearchItemModal, {
  onHidden: () => {
    dataSearchItem.value = null
  }
})
const verItemAltObj = useBootstrapModal(verItemAltRef, {
  onHidden: () => {
    clearSelectionItemalternative();
  }
})
const verSeleccionStockBodegasObj = useBootstrapModal(verSeleccionStockBodegasRef, {
  onHidden: () => {
    calculateTotals();
  }
})
const verModalPesoItemObj = useBootstrapModal(verModalPesoItemRef, {
  onHidden: () => {
    calculateTotals();
  }
})
const verProveedoresObj = useBootstrapModal(verProveedoresRef, {
  backdrop: 'static',
  keyboard: false
});
// variables para mostrar las busquedas
const showResultClients = ref(false);
const showInfoClient = ref(false);

async function searchFilterClientes() {
  clearForm(uploadedFiles);//limpia el formulario 
  showResultClients.value = true;
  showInfoClient.value = false;
  if (dataSearch.search == null || dataSearch.search.length < 4) {
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

  //asignacion de cliente y segmento
  form.value.cliente = infoClient.value;
  if (infoSegmento.value) {
    form.value.segmento = infoSegmento.value;
  }

  //asignacion de sucursal 
  if (sucursales.value.length > 0) {
    if (!form.value.direccion_facturacion_id && !isRecoveringQuote.value) {
      form.value.direccion_facturacion_id = sucursales.value[0].id
    }
    if (!form.value.direccion_entrega_id && !isRecoveringQuote.value) {
      form.value.direccion_entrega_id = sucursales.value[0].id
    }
  }

  if (warehouseByUser.value.length > 0) {
    if (!form.value.bodega_facturacion) {
      form.value.bodega_facturacion = warehouseByUser.value[0].relacion_bodega.BOD_BODEGA
    }
  }

  form.value.descuento_articulo = Number.parseFloat(client.CLI_DSTO_COMERCIAL || 0);
  form.value.descuento_original = Number.parseFloat(client.CLI_DSTO_COMERCIAL || 0);

  form.value.punto_venta_id = ptoVtaSelect.value;
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
  dataClient.value = form.value.cliente;
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

const asigmentWarehouse = (nuevoPuntoVenta) => {

  if (!warehouseByUser.value || warehouseByUser.value.length === 0) return;
  if (!nuevoPuntoVenta) return;

  if (form.value.bodega_facturacion) {
    const exists = warehouseByUser.value.some(w => w.relacion_bodega.BOD_BODEGA === form.value.bodega_facturacion);
    if (exists) return;
  }

  const warehouseSelect = warehouseByUser.value.find(w => w.PTO_VTA_BOD_REL_PUNTO_VENTA == nuevoPuntoVenta);
  if (warehouseSelect) {
    form.value.bodega_facturacion = warehouseSelect.relacion_bodega.BOD_BODEGA;
  }
}
watch(
  () => ptoVtaSelect.value,
  (nuevoPuntoVenta) => {
    if (nuevoPuntoVenta) {
      asigmentWarehouse(nuevoPuntoVenta);
    }
  },
);

watch(
  () => warehouseByUser.value,
  (nuevasBodegas) => {
    // Solo intentamos asignar si ya tenemos un punto de venta seleccionado
    if (nuevasBodegas && nuevasBodegas.length > 0 && ptoVtaSelect) {
      asigmentWarehouse(ptoVtaSelect.value);
    }
  }
);



//blindeja dependiendo del modo del form para evitar cargadar informacion innecesaria
watch(
  () => form.value.cliente, (newVal) => {
    if (!newVal) return;
    form.value.condicion_pago_original_id = newVal.CLI_CONDICION_PAGO;
    if (isRecoveringQuote.value) return;

    const modosIncludes = ['restore_quote', 'volver_a_pedir'];
    if (modosIncludes.includes(form.value.mode) && form.value.condicion_pago_id) {
      if (newVal.CLI_RUC === form.value.cliente.CLI_RUC) {
        return;
      }
    }
    // Lógica normal
    if (newVal.suspendido === 1) {
      form.value.condicion_pago_id = 'CONTADO';
    } else {
      form.value.condicion_pago_id = newVal.CLI_CONDICION_PAGO;
    }

  }, { deep: true, immediate: true });



//condicion de pago 

watch(() => form.value.condicion_pago_id, async (newVal) => {
  if (isRecoveringQuote.value) return;
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

    const formaPagoActual = form.value.forma_pago_id;
    const existeFormaActual = methodPayment.value.find(m => m.codigo === formaPagoActual);;

    let formaSeleccionada = null;
    if (existeFormaActual) {
      formaSeleccionada = existeFormaActual;
    } else {
      formaSeleccionada = methodPayment.value[0];
      form.value.forma_pago_id = formaSeleccionada.codigo;
    }

    const descuentoCliente = Number.parseFloat(form.value.cliente.CLI_DSTO_COMERCIAL || 0);
    const rebajaMetodo = Number.parseFloat(formaSeleccionada.porcentaje_rebaja || 0); // O 'porcentaje_rebaja'

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
    form.value.forma_pago_id = null;
  }
}

async function selectMethodPayment() {
  let selectedMethod = methodPayment.value.find(m => m.codigo === form.value.forma_pago_id);
  if (!selectedMethod) return;
  const descuentoCliente = Number.parseFloat(form.value.cliente.CLI_DSTO_COMERCIAL) || 0;
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
  dataSearchItem.value = {};
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
  itemAlternativo.item = '';
  itemAlternativo.index = 0;

  // 2. Esperamos un "tick" del ciclo de vida de Vue
  await nextTick();
  itemAlternativo.index = i;
  itemAlternativo.item = item.ART_CODIGO;
  verItemAltObj.show();
}

async function onSelectItemAlternativo(descripcion, i) {
  await updateDescriptionsForCheckAlternative(descripcion, i);
  clearSelectionItemalternative();
  verItemAltObj.hide();
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
 const item = form.value.items[index];
 item.proveedores = providers;
 if (nuevoPrecio && Number(nuevoPrecio) !== Number(item.valor_original_l)) {
    item.ART_VALOR = nuevoPrecio;
    item.ART_VALOR_ORIGINAL = nuevoPrecio;
    item.valor_original_l = nuevoPrecio;
  }
  calculateTotals();
  verProveedoresObj.hide();
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
  let itemInitial = form.value.items[index];
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
  calculateTotals();
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
  let originalPrice = Number(item.ART_VALOR_ORIGINAL);
  let calculatedPrice = calculatePriceFromModifier(originalPrice, modifierValue);
  calculatedPrice = Number.parseFloat(calculatedPrice.toFixed(decimales));
  item.ART_VALOR = calculatedPrice;
  item.errorModificador = false;
  calculateTotals();
}


//modificadotr general
async function applyGeneraModifier() {
  let globalModifier = parseFloat(form.value.modificador_global);
  if (isNaN(globalModifier)) {
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
  if(element.ART_TIPO_COMPRA === 'L'){
    element.ART_VALOR_ORIGINAL = element.ART_VALOR;
  }
  let nuevoModificar = calculateRowModifier(element, element.ART_VALOR);
  nuevoModificar = Number.parseFloat(nuevoModificar.toFixed(4) || 0);
  element.modificador = nuevoModificar;
  element.cambiar_valor = false;
  calculateTotals();
}


/**
 *  proceso de modificacion de descuento
 */

const saveModifyDiscount = async (element, index) => {
  if (element.descuento === element.descuento_temporal) {
    element.cambiar_descuento = false;
    return;
  }
  element.cambiar_descuento = false;
  calculateTotals();
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
        removeItem(i)
      }
    });
}





/** limpiar la cotizacion */

async function clearCotizacion() {
  clearForm(uploadedFiles);
  showInfoClient.value = false;
  showResultClients.value = false;
  infoClient.value = null;
  if (dataSearch.value) {
    dataSearch.value.search = '';
  }

  if (clients.value) {
    clients.value = [];
  }
}


/** visualizacion de imagenes  */
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

function handleHide() {
  gallery.visible = false;
}




/** proceso de imagen de operaciones  */
const fileInput = ref(null);
const triggerFileInput = () => {
  fileInput.value.click();
}


const previewUploadedImages = (index) => {
  const photoUrl = uploadedFiles.value.map(file => file.preview);
  gallery.photos = photoUrl;
  gallery.index = index;
  gallery.visible = true;

}

/** asignacion de imagenes a mi form de cotizacion para que se mantengan 
 * en el store cuando se recargue la pagina y no se pierdan
 */
watch(uploadedFiles, (newFiles) => {
  const procesados = newFiles.map(item => {
    if (item.file) return item.file;
    if (item.isPersisted) return item.preview;
    return null;
  }).filter(f => f !== null);
  form.value.imagenesoperaciones = procesados;
}, { deep: true });


/**
 * proceso de creacion de cotizacion
 */


//validacion de antes de crear una cotizacion o pedido 

const btnDisabledStore = computed(() => {
  if (loadingStockMasivo.value) return true;
  if (loadingCreateQuotation.value) return true;
  if (loadingSaveOrder.value) return true;
  if (!isQuoteValid.value) return true;
  if (!form.value.cliente) return true;
  if (!form.value.condicion_pago_id) return true;
  return false;
});

const btnDisableStoreQuotation = computed(() => {
  if (loadingStockMasivo.value) return true;
  if (loadingCreateQuotation.value) return true;
  if (!form.value.cliente) return true;
  if (!form.value.condicion_pago_id) return true;
  return false;
});

async function createQuotation() {
  const respCreate = await createQuote('create');
  if (!respCreate?.ok) {
    swalError(respCreate?.message);
    return;
  }
  await clearCotizacion();
  swalSuccess(respCreate?.message);
  router.push({
    name: 'ventas-cotizaciones'
  });

}





/**
 * 
 * guardar cotizacion a pedido y actualizar el pedido 
 */

async function saveToOrderAndUpdateQuotation() {
  const respOrder = await saveOrder();
  await createQuote('update');
  if (!respOrder?.ok) {
    swalError(respOrder?.message);
    return;
  }
  await clearCotizacion();
  swalSuccess(respOrder?.message);
  router.push({
    name: 'ventas-pedidos'
  });
}


watch(uploadedFiles, (newFiles) => {
  const procesados = newFiles.map(item => {
    // Si es un archivo recién subido (Blob/File)
    if (item.file) return item.file;

    // Si es una imagen que ya estaba en el servidor (URL)
    if (item.isPersisted) return item.preview;

    return null;
  }).filter(f => f !== null);

  form.value.imagenesoperaciones = procesados;
}, { deep: true });



onMounted(async () => {
  await Promise.all([
    fetchWarehouseByPtoVtaUser(),
    fetchConditionPayment()
  ]);
  //logica para recuperar datos en memoria
  if (form.value.cliente && form.value.cliente.CLI_RUC) {
    loadingSearch.value = false;
    loadingAvailableCredit.value = false;
    showInfoClient.value = true;
    showResultClients.value = false;

    //esto es para aseguyrar que si viene de la tabla recuperar las fotos aparezcan 
    if (form.value.imagenesoperaciones && form.value.imagenesoperaciones.length > 0) {
      if (uploadedFiles.value.length === 0) {
        uploadedFiles.value = form.value.imagenesoperaciones.map((url, index) => {

          return {
            id: `restored-${index}`,
            preview: url,
            name: `Imagen recuperada ${index + 1}`,
            isPersisted: true
          };
        });
      }
    }

    await nextTick();
    try {
      const promises = [];
      promises.push(fetchCustomerBranches(form.value.cliente.CLI_RUC));
      if (form.value.condicion_pago_id) {
        promises.push(fetchMethodPayment(form.value.condicion_pago_id));
      }

      await Promise.all(promises);
      if (form.value.forma_pago_id) {
        const temp = form.value.forma_pago_id;
        form.value.forma_pago_id = null;
        await nextTick();
        form.value.forma_pago_id = temp;
      } else if (methodPayment.value && methodPayment.value.length > 0) {
        form.value.forma_pago_id = methodPayment.value[0].codigo;
      }
    } catch (e) {
      console.error("Error cargando datos del cliente recuperado", e);
    } finally {
      loadingSearch.value = false;
      loadingAvailableCredit.value = false;

    }
  }
});

</script>
<template>
  <div class="content">
    <BaseBlock title="Cliente" content-full rounded class="mb-3">
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
      <div v-if="loadingSearch && showResultClients && !form.cliente?.id" class="text-center py-4">
        <output class="spinner-border text-primary mt-4">
          <span class="visually-hidden">Loading...</span>
        </output>
      </div>

      <!-- mensaje de visualizacion en caso de que no haya clientes -->
      <div v-if="clients.length === 0 && !loadingSearch && showResultClients && !form.cliente?.id"
        class="text-center py-4">
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
                <td class="fs-sm" @click="selectClient(client)" style="cursor:pointer">
                  <span class="text-primary">{{ client.CLI_RUC }}</span>
                </td>
                <td class="fs-sm" @click="selectClient(client)" style="cursor:pointer">
                  <span class="text-primary">{{ client.CLI_RAZON_SOCIAL }}</span>
                </td>
                <td class="fs-sm">{{ client.CLI_CONTACTO }}</td>
                <td class="fs-sm">{{ client.CLI_CIUDAD }}</td>
                <td class="fs-sm">{{ client.CLI_PROVINCIA }}</td>
                <td class="fs-sm">{{ client.CLI_TELEFONO_1 }}</td>
                <td class="fs-sm">
                  <a :href="'mailto:' + client.CLI_CORREO_ELECT_SRI">{{ client.CLI_CORREO_ELECT_SRI }} 
                    <span class="badge bg-danger text-white" v-if="!client.emails_validated"> correo no valido</span>
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </BaseBlock>


      <!-- detalle visual de informacion de cliente -->
      <div v-if="loadingAvailableCredit && !form.cliente?.id" class="text-center py-4">
        <div class="spinner-border text-primary mt-4" role="status"><span class="visually-hidden">Loading...</span>
        </div>
      </div>
      <BaseBlock v-if="showInfoClient && form.cliente?.id" class="mb-0">
        <div class="content-fluid" :class="{ 'opacity-50': loadingAvailableCredit }">
          <div class="row g-1 mb-2">
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Ruc</small>
                <div class="fw-semibold text-truncate">{{ form.cliente.CLI_RUC }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Razón Social</small>
                <div class="fw-semibold text-truncate">{{ form.cliente.CLI_RAZON_SOCIAL }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Descuento Comercial</small>
                <div class="fw-semibold ">{{ form.cliente.CLI_DSTO_COMERCIAL }} %</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Ciudad</small>
                <div class="fw-semibold ">{{ form.cliente.CLI_CIUDAD }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Provincia</small>
                <div class="fw-semibold ">{{ form.cliente.CLI_PROVINCIA }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Condición de Pago</small>
                <div class="fw-semibold ">{{ form.cliente.CLI_CONDICION_PAGO }}</div>
                <span class="badge bg-info" v-if="form.cliente.CLI_DIA_GRACIA_CHEQUE_A_FECHA > 0">{{
                  form.cliente.CLI_DIA_GRACIA_CHEQUE_A_FECHA }} días de gracia</span>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Suspendido</small>
                <span class="fs-xs fw-semibold d-inline-block py-1 px-3 rounded-pill"
                  :class="getClientStatus(form.cliente.suspendido).class">
                  {{ getClientStatus(form.cliente.suspendido).text }}
                </span>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Cupo Asignado</small>
                <div class="fw-semibold ">${{
                  form.cliente.cupo_asignado }}</div>
              </div>
            </div>
            <div class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Cupo Disponible</small>
                <div class="fw-semibold " :class="parseFloat(form.cliente.cupo_disponible) < 0 ? 'text-danger' : ''">${{
                  form.cliente.cupo_disponible }}</div>
              </div>
            </div>
            <div v-if="infoSegmento" class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Segmento</small>
                <div class="fw-semibold ">{{ form.segmento.segmento }}</div>
              </div>
            </div>
            <div v-if="infoSegmento" class="col-6 col-lg-4">
              <div class="kv">
                <small class="text-muted">Segmento</small>
                <div class="fw-semibold ">{{ form.segmento.subsegmento }}</div>
              </div>
            </div>
            <div class="col-12 col-lg-4">
              <div class="kv space-y-2">
                <small class="text-muted">Bodegas</small>
                <select class="form-select form-select-sm" v-model="form.bodega_facturacion"
                  :disabled="loadingWarehouseByUser">
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
                  <select class="form-select" v-model="form.direccion_facturacion_id" :disabled="loadingSucursales">
                    <option v-for="(suc, index) in sucursales" :key="index" :value="suc.id">
                      {{ suc.CLI_SUC_ID_DIRECCION }} - {{ suc.CLI_SUC_DIRECCION }} 
                       {{ !suc.emails_validated ? '⚠️ (Correo Inválido)' : '' }}
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
    <BaseBlock v-if="showInfoClient && form.cliente?.id" class="mb-0">
      <template #title>
        <div class="d-flex flex-wrap align-items-center justify-content-between w-100">
          <div class="d-flex align-items-center gap-3">
            <span class="fw-semibold">Cotización</span>
            <div v-if="form.cotizacion_id" class="d-flex align-items-center animate__animated animate__fadeIn">
              <span
                class="badge bg-warning-subtle text-dark border border-warning rounded-pill px-3 py-2 d-flex align-items-center shadow-sm">
                <i class="fa fa-pen-to-square me-2 opacity-75"></i>
                <span class="fs-sm fw-bold">Editando # {{ form.cotizacion_codigo || form.cotizacion_id }}</span>
              </span>
            </div>
          </div>
        </div>
      </template>
      <div class="d-flex align-items-center mb-4">
        <div class="btn-group btn-group-sm" role="group">
          <button type="button" class="btn btn-outline-primary" @click="openModalSearchItem"><i
              class="fa fa-search me-1"></i>
            Buscar
            Articulo</button>
          <button type="button" class="btn btn-outline-success" :disabled="loadingStockMasivo"
            @click="updateStockByBatch"> <i class="fa fa-rotate me-1"></i>Stock</button>
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
                    @click="updateCheckAlternative($event, element, index)" v-model="element.CHECK_ALTERNATIVO"
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
                <td class="text-center align-middle">
                  <div class="btn-group btn-group-sm" role="group" aria-label="Acciones del ítem">
                    <button type="button " class="btn btn-danger btn-sm"
                      @click="confirmarEliminarArticulo(element, index)" :disabled="element.disabled_delete"
                      title="Eliminar">
                      <i class="fa fa-trash-can"></i>
                    </button>
                    <a class="btn btn-primary btn-sm handle" style="cursor: move;">
                      <i class="fa fa-arrows-up-down-left-right"></i>
                    </a>
                    <button v-if="element.imagenes && element.imagenes.length" class="btn btn-success btn-sm"
                      type="button" @click="showPhoto(element.imagenes)">
                      <i class="fa fa-search"></i>
                    </button>
                  </div>
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
              <th scope="col" colspan="15" class="fs-sm text-end  border-0"> Descuento</th>
              <th scope="col" class="fs-sm text-end  text-nowrap border-0"> ${{ format(form.descuento) }}
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
      <div v-if="form.items.length > 0" class="row mb-2">
        <div class="col-12">
          <div class="mb-4" v-if="(form.alerta_facturar != '') || form.pregunta_facturar">

            <div class="alert alert-warning d-flex align-items-center flex-wrap gap-3 shadow-sm border-0 mb-0">

              <div v-if="form.alerta_facturar != ''" class="d-flex align-items-center gap-2">
                <i class="fa fa-exclamation-triangle"></i>
                <span class="fw-bold">Factura a demanda posterior al despacho</span>
              </div>

              <div v-if="form.pregunta_facturar" class="d-flex align-items-center gap-3 flex-wrap ms-md-auto">
                <span class="small">
                  Último día: <strong class="text-dark">{{ form.cliente.CLI_DIA_MAXIMO_MES_FACTURACION }}</strong>
                </span>
                <div class="form-check form-switch mb-0">
                  <input class="form-check-input" type="checkbox" id="switch-facturar" :true-value="0" :false-value="1"
                    v-model="form.factura_siguiente_mes">
                  <label class="form-check-label fw-bold text-dark" for="switch-facturar">
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
                <select id="condicionPagoSelect" class="form-select" :disabled="form.cliente.suspendido == 1"
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
                  <span v-if="form.condicion_pago_id !== form.cliente.CLI_CONDICION_PAGO" id="metodoPagoSelect"
                    class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill">
                    Condición diferente
                  </span>
                </div>

                <select class="form-select mb-2" v-model="form.forma_pago_id" :disabled="loadingMethodPayment"
                  @change="selectMethodPayment">
                  <option v-for="(me, index) in methodPayment" :key="index" :value="me.codigo"> {{ me.tipo }}</option>
                </select>

                <div class="d-flex align-items-center justify-content-end small">
                  <span v-if="!isEditingGlobalDiscount">
                    <span class="text-body-secondary me-2">Descuento aplicado:</span>
                    <a href="javascript:void(0)" class="fw-bold text-decoration-none text-info"
                      @click="enableGlobalDiscountEdit" title="Clic para editar descuento global manualmente">{{
                        Number(form.descuento_articulo).toFixed(2) }}%</a>
                  </span>
                  <div v-else class="d-flex align-items-center">
                    <span class="text-body-secondary me-2">Nuevo %:</span>
                    <input id="input-global-discount" ref="inputGlobalDiscountRef" type="number"
                      class="form-control form-control-sm text-end no-spinners p-1" style="width: 80px;"
                      :value="form.descuento_articulo" @blur="updateGlobalDiscount($event)"
                      @keyup.enter="$event.target.blur()" @keyup.esc="cancelGlobalDiscountEdit">
                  </div>
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
                <div class="d-flex justify-content-between mb-1">
                  <label class="form-label small text-uppercase fw-bold text-body-secondary">Nota Operaciones</label>
                  <span v-if="form.nota_operaciones" class="small text-body-secondary" style="font-size: 0.7rem;">{{
                    maxLengthNote
                    - form.nota_operaciones.length }}</span>
                </div>
                <textarea class="form-control border-start border-4 border-danger" rows="3"
                  placeholder="Logística y bodega..." v-model.trim="form.nota_operaciones"
                  :maxlength="maxLengthNote"></textarea>
              </div>
            </div>
          </BaseBlock>
          <!-- seccion de manejo de imagenes de operaciones -->
          <BaseBlock title="Imágenes" content-full rounded class="mb-3">
            <div
              class="upload-zone position-relative d-flex align-items-center justify-content-center p-3 border border-2 border-dashed rounded-3"
              :class="isDragging ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary border-opacity-25 bg-body-tertiary'"
              @dragover.prevent="isDragging = true" @dragleave.prevent="isDragging = false" @drop.prevent="handleDrop"
              @click="triggerFileInput" style="cursor: pointer; transition: all 0.2s ease;">
              <input type="file" ref="fileInput" class="d-none" multiple accept="image/*" @change="handleInputFiles">

              <div class="d-flex align-items-center gap-3 pointer-events-none text-muted">
                <i class="fa fa-cloud-upload-alt fs-3 text-primary"></i>

                <div class="lh-1 text-start">
                  <span class="fw-semibold text-primary">Adjuntar imágenes</span>
                  <span class="d-none d-sm-inline ms-1 text-muted small">(Clic o arrastrar)</span>
                  <div class="text-muted" style="font-size: 0.75rem; margin-top: 4px;">JPG, PNG (Máx 5MB)</div>
                </div>
              </div>
            </div>

            <div v-if="uploadedFiles.length > 0 || isCompressing" class="d-flex flex-wrap gap-3 mt-3">

              <div v-for="(file, index) in uploadedFiles" :key="index"
                class="position-relative border border-secondary border-opacity-25 rounded bg-body overflow-hidden group-hover-container"
                style="width: 80px; height: 80px;" @click="previewUploadedImages(index)">
                <img :src="file.preview" class="img-fluid w-100 h-100 object-fit-cover" alt="Preview"
                  style="opacity: 0.9;" title="Clic para ampliar">

                <button @click.stop="removeFile(index)" type="button"
                  class="btn btn-sm btn-danger p-0 position-absolute top-0 end-0 d-flex align-items-center justify-content-center btn-remove-img"
                  style="width: 20px; height: 20px; border-radius: 0 0 0 4px; z-index: 10;" title="Eliminar imagen">
                  <i class="fa fa-times" style="font-size: 10px;"></i>
                </button>
              </div>
              <div v-if="isCompressing"
                class="d-flex flex-column align-items-center justify-content-center border rounded bg-light text-info"
                style="width: 80px; height: 80px; font-size: 0.7rem;">
                <i class="fa fa-circle-notch fa-spin fs-4 mb-1"></i>
                <span>Procesando</span>
              </div>
            </div>
          </BaseBlock>

          <div
            class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pt-3 border-top gap-3 mb-2">
            <button type="button" class="btn btn-danger px-4 w-100 w-md-auto order-2 order-md-1"
              @click="clearCotizacion">
              Limpiar cotización
            </button>
            <div class="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto order-1 order-md-2">
              <button type="button" class="btn btn-success px-4 fw-bold shadow-sm w-100 w-md-auto"
                :disabled="btnDisableStoreQuotation" @click="createQuotation">
                <i v-if="loadingCreateQuotation" class="fa fa-spinner fa-spin me-2"></i>
                <i v-else class="fa fa-save me-2"></i>
                Guardar Cotización
              </button>
              <button v-if="form.cotizacion_id" type="button"
                class="btn btn-warning px-4 fw-bold text-white shadow-sm w-100 w-md-auto" :disabled="btnDisabledStore"
                @click="saveToOrderAndUpdateQuotation">
                <i v-if="loadingSaveOrder" class="fa fa-spinner fa-spin me-2"></i>
                <i v-else class="fa fa-check-circle me-2"></i>Guardar Pedido
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseBlock>
  </div>


  <!-- seccion de modales -->

  <!-- modal para actualizacion de segmento -->
  <div class="modal" id="modal-segmento" tabindex="-1" aria-hidden="true" ref="verModalActualizarSegmento">
    <div class="modal-dialog modal-md modal-dialog-centered">
      <div class="modal-content">
        <actualizarSegmentoClienteComponent v-if="datosCliente" :cliente="datosCliente" @updated="processSelectClient">
        </actualizarSegmentoClienteComponent>
      </div>
    </div>
  </div>

  <!-- modal para la creacion de una nueva direccion -->
  <div class="modal" id="modal-crear-direccion" tabindex="-1" aria-hidden="true" ref="verModalCrearDireccionModal">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <verModalCrearNuevaDireccion v-if="dataClient" :cliente="dataClient" @closeModal="closeModalCreateAddress">
        </verModalCrearNuevaDireccion>
      </div>
    </div>
  </div>

  <!-- modal de busqueda de articulos -->
  <div class="modal" id="modal-cliente" tabindex="-1" ref="verSearchItemModal">
    <div class="modal-dialog modal-xl modal-dialog-centered" style="max-width: 90vw;">
      <div class="modal-content">
        <verModalBuscarArticulos v-if="dataSearchItem" :form="dataSearchItem" @closeModal="closeModalSearchItem"
          @select-item="handleItemSelected"></verModalBuscarArticulos>
      </div>
    </div>
  </div>


  <!-- Modal para listar y asignar item alternativo -->
  <div class="modal" id="modal-item-alternativo" tabindex="-1" ref="verItemAltRef">
    <div class="modal-dialog modal-sm modal-dialog-centered" style="max-width: 400px">
      <div class="modal-content">
        <verModalItemAlternativo v-if="itemAlternativo" :item="itemAlternativo.item" :indice="itemAlternativo.index"
          @seleccionarAlternativa="onSelectItemAlternativo">
        </verModalItemAlternativo>
      </div>
    </div>
  </div>

  <!-- modal para la seleccion del stock de un articulo -->
  <div class="modal" id="modal-bodegas" tabindex="-1" ref="verSeleccionStockBodegasRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <verModalSeleccionStockBodegas v-if="dataStockItem.items.length > 0" :stocks="dataStockItem.items"
          :index="dataStockItem.index" :permiteDecimales="dataStockItem.permiteDecimales"
          @closeModal="closeModalStockRowItem" @update="handleStockUpdate">
        </verModalSeleccionStockBodegas>
      </div>
    </div>
  </div>



  <!-- modal de modificacion de peso  -->
  <div class="modal" id="modal-peso" tabindex="-1" ref="verModalPesoItemRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <verModalModificacionPeso :item="dataPesoItem.item" :index="dataPesoItem.index"
          @cerrar="closeModalPesoRowItem()" @actualizar="handleWeightUpdate">
        </verModalModificacionPeso>
      </div>
    </div>
  </div>

  <!-- modal de seleccion de proveedores para items L  -->
  <div class="modal fade" id="modal-block-proveedor" tabindex="-1" ref="verProveedoresRef">
    <div class="modal-dialog modal-xl modal-dialog-centered" style="max-width: 90vw;">
      <div class="modal-content" style="height: 90vh;">

        <!-- <div class="block block-rounded block-transparent mb-0 d-flex flex-column" style="height: 100%; flex: 1;"> -->

        <verModalProveedores v-if="dataModalProviders.proveedores" :providers="dataModalProviders.proveedores"
          :index="dataModalProviders.index" :item="dataModalProviders.item" @update:providers="handleSaveProviders"
          class="h-100">
        </verModalProveedores>

        <!-- </div> -->
      </div>
    </div>
  </div>

  <VueEasyLightbox :visible="gallery.visible" :index="gallery.index" :imgs="gallery.photos" @hide="handleHide" />
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




/***
 estilos para el drop de imagenes 

*/
/* Efecto hover para la zona de carga */
.upload-zone:hover {
  background-color: rgba(var(--bs-primary-rgb), 0.05) !important;
  border-color: var(--bs-primary) !important;
}

/* Efecto hover para las miniaturas */
.group-hover-container img {
  transition: opacity 0.2s;
}

.group-hover-container:hover img {
  opacity: 1 !important;
}

/* Botón de eliminar oculto por defecto, visible al hover */
.btn-remove-img {
  opacity: 0;
  transition: opacity 0.2s;
}

.group-hover-container:hover .btn-remove-img {
  opacity: 1;
}

/* Utilidad object-fit por si tu versión de Bootstrap es antigua */
.object-fit-cover {
  object-fit: cover;
}
</style>