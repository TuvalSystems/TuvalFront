<script setup>
import { useQuoteImageGallery } from "@/composables/venta/cotizaciones/crearCotizacion/useQuoteImageGallery";

import { useQuoteItemInteractions } from "@/composables/venta/cotizaciones/crearCotizacion/useQuoteItemInteractions";

import { onMounted, ref, computed, watch, nextTick } from "vue";
import { freightUnitPrice } from "@/functions/freightPrice";
import {
  swalError,
  toast,
  swalSuccess,
  swalWarning,
} from "@/functions/swal-alert.js";
// composables
import { useBootstrapModal } from "@/composables/core/useBootstrapModal";
import { usePdfUpload } from "@/composables/core/usePdfUpload";
import { useClientSearch } from "@/composables/venta/cotizaciones/crearCotizacion/useClientSearch";
import { useProcessCreateQuote } from "@/composables/venta/cotizaciones/crearCotizacion/useProcessCreateQuote";
import { useSearchConditionPayment } from "@/composables/venta/cotizaciones/crearCotizacion/useSearchConditionPayment";
import { useCheckClientSegment } from "@/composables/venta/cotizaciones/useCheckClientSegment";
import { useImageUpload } from "@/composables/core/useImageUpload";
import { useSearchArticle } from "@/composables/venta/cotizaciones/crearCotizacion/useSearchArticle.js";
import { useProviderActions } from "@/composables/sistemas/mantenimientos/proveedores/useProviderActions.js";
import { useArticleActions } from "@/composables/sistemas/mantenimientos/articulos/useArticleActions.js";

import draggable from "vuedraggable";
import {
  formatPrice4,
  format,
  formatCleanPrice4,
  formatClean,
} from "@/functions";
import VueEasyLightbox from "vue-easy-lightbox";
// imports modales

import actualizarSegmentoClienteModal from "./modals/actualizarSegmentoClienteModal.vue";
import verModalCrearNuevaDireccion from "./modals/verModalCrearNuevaDireccion.vue";
import verModalBuscarArticulos from "./modals/verModalBuscarArticulos.vue";
import verModalItemAlternativo from "./modals/verModalItemAlternativo.vue";
import verModalSeleccionStockBodegas from "./modals/verModalSeleccionStockBodegas.vue";
import verModalModificacionPeso from "./modals/verModalModificacionPeso.vue";
import verModalProveedores from "./modals/verModalProveedores.vue";
import verModalListaBorradores from "./modals/verModalListaBorradores.vue";
import verModalHistoricoFacturas from "./modals/verModalHistoricoFacturas.vue";
import { useRouter, useRoute } from "vue-router";
import ConfiguracionSegmentacionCard from "@/views/ventas/cotizaciones/crear-cotizacion/components/ConfiguracionSegmentacionCard.vue";
import InformacionCliente from "./components/InformacionCliente.vue";
import FiltrarCliente from "@/components/ventas/cliente/FiltrarCliente.vue";
import verModalConfiguracionItemL from "@/views/ventas/cotizaciones/crear-cotizacion/modals/verModalConfiguracionItemL.vue";
//constantes
import { CUSTOMER_SEARCH_MIN_LENGTH } from "@/constants/customerSearch";

const router = useRouter();
const route = useRoute();
//logica para manejo de temps
const currentDraftId = computed(() => route.query.draft);

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
} = useClientSearch();
const {
  form,
  clearForm,
  addItems,
  removeItem,
  selectedPointSaleCode,
  //limitadores
  maxOrder,
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
  loadingStockMasivo,
  updateStockByBatchV2,
  //gloabl
  calculateTotals,

  //proceso de creacion de cotizacion
  loadingCreateQuotation,
  isQuoteValid,
  createQuote,
  loadingSaveOrder,
  saveOrder,
  isRecoveringQuote,

  //temp
  fetchCurrentDraft,
  getActiveDrafts,
  removeDraft,

  //recuperar cotizacion
  fetchAndFillQuotation,
  loadDataForReorder,
  copyRawQuoteOrOrder,
  reOrder,

  //lista de proyectos
  loadingProyectSellers,
  dataProyectSellers,
  fetchListProyectSellers,

  //monto flete
  isActivePricefreight,
  validateFreightTotal,
  validateDispatchFields,
  validateItemLWeights,
} = useProcessCreateQuote(currentDraftId.value);

const {
  fetchConditionPayment,
  conditionPayment,
  loadingMethodPayment,
  fetchMethodPayment,
  methodPayment,
} = useSearchConditionPayment();

// Extraes las variables y funciones
const {
  uploadedFiles,
  isDragging,
  isCompressing,
  handleDrop,
  handleInputFiles,
  removeFile,
} = useImageUpload();

const {
  uploadedPdfs,
  isDraggingPdf,
  isProcessingPdf,
  handleDropPdf,
  handleInputPdf,
  removePdf,
  restorePersistedPdfs,
} = usePdfUpload();

const {
  //busqueda de item L
  searchItemL,
  // loadingSearchItemL,
} = useSearchArticle();
const pdfInput = ref(null);

const triggerPdfInput = () => {
  pdfInput.value?.click();
};

const { loadingCheck, fetchCheckSegmentoClient } = useCheckClientSegment();
const { loadingActiveProviders, fetchActiveProviders, activeProviders } =
  useProviderActions();

const {
  //articulo logistico
  fetchArticleLogistic,
  // loadingArticleLogistic,
} = useArticleActions();
//variables de modales
const verModalActualizarSegmento = ref(null);
const newAddressModal = ref(null);
const verSearchItemModal = ref(null);
const verItemAltRef = ref(null);
const verSeleccionStockBodegasRef = ref(null);
const verModalPesoItemRef = ref(null);
const verProveedoresRef = ref(null);
const verModalBorradoresRef = ref(null);
const verHistorialFacturasRef = ref(null);
const verModalConfiguracionItemLRef = ref(null);
const verModalActualizarSegmentoObj = useBootstrapModal(
  verModalActualizarSegmento
);

const verSearchItemModalObj = useBootstrapModal(verSearchItemModal, {
  onHidden: () => {
    dataSearchItem.value = null;
  },
});
const verModalBorradoresObj = useBootstrapModal(verModalBorradoresRef);
const showHistoryInvoicesModal = ref(false);
const verHistorialFacturasObj = useBootstrapModal(verHistorialFacturasRef, {
  onHidden: () => {
    showHistoryInvoicesModal.value = false;
  },
});
const verItemAltObj = useBootstrapModal(verItemAltRef, {
  onHidden: () => {
    clearSelectionItemalternative();
  },
});
const verSeleccionStockBodegasObj = useBootstrapModal(
  verSeleccionStockBodegasRef,
  {
    onHidden: () => {
      calculateTotals();
    },
  }
);
const verModalPesoItemObj = useBootstrapModal(verModalPesoItemRef, {
  onHidden: () => {
    calculateTotals();
  },
});

// const verModalConfiguracionItemLObj = useBootstrapModal(
//   verModalConfiguracionItemLRef
// );

// variables para mostrar las busquedas
const showResultClients = ref(false);
const showInfoClient = ref(false);

function updateCustomerSearchTerm(value) {
  dataSearch.search = value ?? "";
  clients.value = [];
  showResultClients.value = false;
  errorSearchClient.value = false;
}

async function searchFilterClientes() {
  const search = dataSearch.search?.trim() ?? "";
  if (search.length < CUSTOMER_SEARCH_MIN_LENGTH) {
    errorSearchClient.value = true;
    return false;
  }
  await clearCotizacion();
  showResultClients.value = true;
  showInfoClient.value = false;
  errorSearchClient.value = false;
  dataSearch.search = search;
  dataSearch.tipo = "proceso";
  const resp = await searchClients();

  if (!resp?.ok) {
    errorSearchClient.value = true;
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

  if (form.value.cliente && form.value.cliente.CLI_RUC !== client.CLI_RUC) {
    form.value.direccion_facturacion_id = null;
    form.value.direccion_entrega_id = null;
    form.value.forma_pago_id = null;
  }
  const [respCredit, respBranches] = await Promise.all([
    fetchAvailableCreditCustomer(client.CLI_RUC), // Corregido 'Available'
    fetchCustomerBranches(client.CLI_RUC, "cotizacion"),
  ]);

  if (!respCredit?.ok) {
    swalError(respCredit?.message || "Error consultando crédito");
    return; // Opcional: ¿Quieres detener todo si falla el crédito?
  }

  // Validamos Sucursales
  if (!respBranches?.ok) {
    swalError(respBranches?.message || "Error consultando sucursales");
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
      form.value.direccion_facturacion_id = sucursales.value[0].id;
    }
    if (!form.value.direccion_entrega_id && !isRecoveringQuote.value) {
      form.value.direccion_entrega_id = sucursales.value[0].id;
    }
  }

  if (warehouseByUser.value.length > 0) {
    if (!form.value.bodega_facturacion) {
      form.value.bodega_facturacion =
        warehouseByUser.value[0].relacion_bodega.BOD_BODEGA;
    }
  }

  form.value.descuento_articulo = Number.parseFloat(
    infoClient.value.CLI_DSTO_COMERCIAL || 0
  );
  form.value.descuento_original = Number.parseFloat(
    infoClient.value.CLI_DSTO_COMERCIAL || 0
  );

  form.value.punto_venta_id = selectedPointSaleCode.value;
}

// proceso de crear direccion nueva para un cliente
const dataClient = ref(null);
async function openModalCreateAddress() {
  dataClient.value = form.value.cliente;
  await nextTick();
  newAddressModal.value?.show();
}

function updateClientInfoField({ field, value }) {
  form.value[field] = value;
}

async function closeModalCreateAddress() {
  dataClient.value = null;
}

async function handleSavedAddress() {
  if (form.value.cliente && form.value.cliente.CLI_RUC) {
    await fetchCustomerBranches(form.value.cliente.CLI_RUC, "cotizacion");
  }
  newAddressModal.value?.hide();
}

const asigmentWarehouse = (nuevoPuntoVenta) => {
  if (!warehouseByUser.value || warehouseByUser.value.length === 0) return;
  if (!nuevoPuntoVenta) return;

  if (form.value.bodega_facturacion) {
    const exists = warehouseByUser.value.some(
      (w) => w.relacion_bodega.BOD_BODEGA === form.value.bodega_facturacion
    );
    if (exists) return;
  }

  const warehouseSelect = warehouseByUser.value.find(
    (w) => w.PTO_VTA_BOD_REL_PUNTO_VENTA == nuevoPuntoVenta
  );
  if (warehouseSelect) {
    form.value.bodega_facturacion = warehouseSelect.relacion_bodega.BOD_BODEGA;
  }
};

//limpieza de form cuando cambia de punto de venta
watch(
  () => selectedPointSaleCode.value,
  async (newVal, oldVal) => {
    if (newVal && newVal !== oldVal) {
      isRecoveringQuote.value = true;
      const newId = `draft_${Date.now()}`;
      await clearForm(uploadedFiles, false, true, uploadedPdfs);
      form.value.draft_id = newId;
      form.value.punto_venta_id = newVal;
      await router.replace({ query: { ...route.query, draft: newId } });
      setTimeout(() => {
        isRecoveringQuote.value = false;
      }, 300);
    }
  },
  { immediate: false }
);

watch(
  () => selectedPointSaleCode.value,
  (nuevoPuntoVenta) => {
    if (nuevoPuntoVenta) {
      asigmentWarehouse(nuevoPuntoVenta);
    }
  }
);

watch(
  () => warehouseByUser.value,
  (nuevasBodegas) => {
    // Solo intentamos asignar si ya tenemos un punto de venta seleccionado
    if (nuevasBodegas && nuevasBodegas.length > 0 && selectedPointSaleCode) {
      asigmentWarehouse(selectedPointSaleCode.value);
    }
  }
);

//blindeja dependiendo del modo del form para evitar cargadar informacion innecesaria
watch(
  () => form.value.cliente,
  (newVal) => {
    if (!newVal) return;
    form.value.condicion_pago_original_id = newVal.CLI_CONDICION_PAGO;

    if (newVal.suspendido === 1) {
      form.value.condicion_pago_id = "CONTADO";
      return; // Salimos aquí, ya cumplimos la prioridad máxima
    }
    if (isRecoveringQuote.value) return;
    const modosIncludes = ["restore_quote", "volver_a_pedir"];
    if (
      modosIncludes.includes(form.value.mode) &&
      form.value.condicion_pago_id
    ) {
      if (newVal.CLI_RUC === form.value.cliente.CLI_RUC) {
        return;
      }
    }
    form.value.condicion_pago_id = newVal.CLI_CONDICION_PAGO;
  },
  { deep: true, immediate: true }
);

//condicion de pago

watch(
  () => form.value.condicion_pago_id,
  async (newVal) => {
    if (isRecoveringQuote.value) return;
    if (newVal) {
      await selectConditionPayment();
    }
  }
);

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
    const existeFormaActual = methodPayment.value.find(
      (m) => m.codigo === formaPagoActual
    );

    let formaSeleccionada = null;
    if (existeFormaActual) {
      formaSeleccionada = existeFormaActual;
    } else {
      formaSeleccionada = methodPayment.value[0];
      form.value.forma_pago_id = formaSeleccionada.codigo;
    }

    const descuentoCliente = Number.parseFloat(
      form.value.cliente.CLI_DSTO_COMERCIAL || 0
    );
    const rebajaMetodo = Number.parseFloat(
      formaSeleccionada.porcentaje_rebaja || 0
    ); // O 'porcentaje_rebaja'

    const nuevoDescuentoTotal = descuentoCliente + rebajaMetodo;

    form.value.descuento_original = nuevoDescuentoTotal;
    form.value.descuento_articulo = nuevoDescuentoTotal;

    if (form.value.items && form.value.items.length > 0) {
      form.value.items.forEach((articulo) => {
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
  let selectedMethod = methodPayment.value.find(
    (m) => m.codigo === form.value.forma_pago_id
  );
  if (!selectedMethod) return;
  const descuentoCliente =
    Number.parseFloat(form.value.cliente.CLI_DSTO_COMERCIAL) || 0;
  const descuentoFormaPago =
    Number.parseFloat(selectedMethod.porcentaje_rebaja) || 0;
  const nuevoDescuentoTotal = descuentoCliente + descuentoFormaPago;
  if (nuevoDescuentoTotal < 0) return;
  form.value.descuento_original = nuevoDescuentoTotal;
  form.value.descuento_articulo = nuevoDescuentoTotal;
  if (form.value.items && form.value.items.length > 0) {
    form.value.items.forEach((item) => {
      item.descuento = nuevoDescuentoTotal;
      item.descuento_original = nuevoDescuentoTotal;
    });
  }
  calculateTotals();
}

const {
    dataSearchItem,
    historyInvoiceClientId,
    openModalSearchItem,
    closeModalSearchItem,
    openModalHistoryInvoices,
    closeModalHistoryInvoices,
    handleItemSelected,
    itemAlternativo,
    openModalListItemAlternatives,
    onSelectItemAlternativo,
    openModalProviders,
    handleSaveProviders,
    searchItemLByType,
    dataItemLClasification,
    updateItemLClassification,
    selectItemLAlternative,
    updateItemLAlternativeStatus,
    openModalStockRowItem,
    closeModalStockRowItem,
    handleStockUpdate,
    openModalPesoRowItem,
    handleWeightUpdate,
    closeModalPesoRowItem,
} = useQuoteItemInteractions({
    form,
    verSearchItemModalObj,
    showHistoryInvoicesModal,
    verHistorialFacturasObj,
    addItems,
    verItemAltObj,
    updateDescriptionsForCheckAlternative,
    clearSelectionItemalternative,
    clearDataModalProviders,
    dataModalProviders,
    verProveedoresRef,
    isActivePricefreight,
    calculateTotals,
    searchItemL,
    dataStockItem,
    verSeleccionStockBodegasObj,
    formatQty,
    dataPesoItem,
    verModalPesoItemObj,
});

//proceso de validacion para modificar de item

async function applyModifyRow(item) {
  let modifierValue = item.modificador;
  if (Number.isNaN(modifierValue) || modifierValue === "") {
    modifierValue = 0;
  }
  let decimales =
    item.ART_DECIMAL_VALOR && item.ART_DECIMAL_VALOR > 0
      ? item.ART_DECIMAL_VALOR
      : 4;
  let originalPrice = Number(item.ART_VALOR_ORIGINAL);
  let calculatedPrice = calculatePriceFromModifier(
    originalPrice,
    modifierValue
  );
  calculatedPrice = Number.parseFloat(calculatedPrice.toFixed(decimales));
  item.ART_VALOR = calculatedPrice;
  item.errorModificador = false;
  calculateTotals();
}

//modificadotr general
async function applyGeneraModifier() {
  let globalModifier = parseFloat(form.value.modificador_global);
  if (isNaN(globalModifier)) {
    globalModifier = 0;
  }

  const updatePromises = form.value.items.map(async (item) => {
    const tipoCompra = (item.ART_TIPO_COMPRA || "").trim().toUpperCase();
    if (tipoCompra === "L" || Number(item.es_servicio_logistico) === 1) return;
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
  const valorFijo = formatCleanPrice4(element.ART_VALOR, 4);

  if (valorFijo === element.valor_temporal) {
    element.cambiar_valor = false;
    return;
  }
  element.ART_VALOR = valorFijo;
  element.precio_sin_flete = formatCleanPrice4(
    Number(valorFijo) - (freightUnitPrice(element) ?? 0), 4
  );
  if (Number(element.es_servicio_logistico) === 1) {
    element.valor_temporal = valorFijo;
    element.ART_VALOR_ORIGINAL = element.precio_sin_flete;
    form.value.fle_valor = valorFijo;
    element.modificador = 0;
  } else if (element.ART_TIPO_COMPRA === "L") {
    element.ART_VALOR_ORIGINAL = element.precio_sin_flete;
  } else {
    const original = Number.parseFloat(element.ART_VALOR_ORIGINAL || 0);
    if (original > 0) {
      let nuevoModificar = (Number(element.precio_sin_flete) / original - 1) * 100;
      element.modificador = formatClean(nuevoModificar, 4);
    }
  }
  element.cambiar_valor = false;
  calculateTotals();
};

function isApplyModifyPriceStyle(item) {
  return applyModifyPrice(item) ? "text-danger" : "text-primary";
}

const enableEditFreight = async (element, index) => {
  if (!isActivePricefreight(element)) return;
  element.fle_valor_temporal = element.fle_valor;
  element.cambiar_flete = true;
  await nextTick();
  document.getElementById(`input-monto-flete-${index}`)?.focus();
};

const saveModifyFreight = (element) => {
  element.cambiar_flete = false;
};

const exitEditFreight = (element) => {
  element.fle_valor = element.fle_valor_temporal;
  element.cambiar_flete = false;
};

/**
 *  proceso de modificacion de descuento
 */

const saveModifyDiscount = async (element) => {
  if (element.descuento === element.descuento_temporal) {
    element.cambiar_descuento = false;
    return;
  }
  element.cambiar_descuento = false;
  calculateTotals();
};

function isApplyModifyDiscountStyle(item) {
  return applyModifyDiscount(item) ? "text-danger" : "text-primary";
}

/** proceso de eliminacion de registro de item  */

async function confirmarEliminarArticulo(item, i) {
  const isParcelDispatch = Number(form.value.tipo_despacho_id) === 3;
  const isLogisticService = Number(item.es_servicio_logistico) === 1;

  if (isParcelDispatch && isLogisticService) {
    swalWarning(
      "No puede eliminar este artículo porque el servicio logístico es obligatorio para el tipo de despacho Paquetería."
    );
    return;
  }

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
        removeItem(i);
      }
    });
}

/** limpiar la cotizacion */

async function clearCotizacion() {
  await clearForm(uploadedFiles, true, false, uploadedPdfs);
  showInfoClient.value = false;
  showResultClients.value = false;
  infoClient.value = null;
  if (dataSearch.value) {
    dataSearch.value.search = "";
  }

  if (clients.value) {
    clients.value = [];
  }
}

const {
    gallery,
    showPhoto,
    handleHide,
    fileInput,
    triggerFileInput,
    previewUploadedImages,
} = useQuoteImageGallery({
    uploadedFiles,
    form,
});

/**
 * proceso de creacion de cotizacion
 */

//validacion de antes de crear una cotizacion o pedido

const btnDisabledStore = computed(() => {
  if (!(Number(form.value.tipo_despacho_id) > 0)) return true;
  if (loadingStockMasivo.value) return true;
  if (loadingCreateQuotation.value) return true;
  if (loadingSaveOrder.value) return true;
  if (!isQuoteValid.value) return true;
  if (!form.value.cliente) return true;
  if (!form.value.condicion_pago_id) return true;
  if (!form.value.items.length) return true;
  if (validateDispatchFields() || !validateFreightTotal()) return true;
  return false;
});

const btnDisableStoreQuotation = computed(() => {
  if (validateItemLWeights()) return true;
  if (!(Number(form.value.tipo_despacho_id) > 0)) return true;
  if (loadingStockMasivo.value) return true;
  if (loadingCreateQuotation.value) return true;
  if (loadingSaveOrder.value) return true;
  if (!form.value.cliente) return true;
  if (!form.value.condicion_pago_id) return true;
  if (validateDispatchFields() || !validateFreightTotal()) return true;
  return false;
});

async function createQuotation() {
  const respCreate = await createQuote("create");
  if (!respCreate?.ok) {
    swalError(respCreate?.message);
    return;
  }
  await clearCotizacion();
  swalSuccess(respCreate?.message);
  router.push({
    name: "ventas-cotizaciones",
  });
}

/**
 *
 * guardar cotizacion a pedido y actualizar el pedido
 */

async function saveToOrderAndUpdateQuotation() {
  if (loadingSaveOrder.value || loadingCreateQuotation.value) return;

  const respOrder = await saveOrder();

  if (!respOrder?.ok) {
    const msg = respOrder?.message || "No se pudo crear el pedido";
    (respOrder?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    return;
  }

  const respQuotation = await createQuote("update");

  if (!respQuotation?.ok) {
    const msg =
      respQuotation?.message ||
      "El pedido se creó, pero no se pudo actualizar la cotización";
    (respQuotation?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
    return;
  }

  await clearCotizacion();
  swalSuccess(respOrder?.message || "Pedido guardado correctamente");
  router.push({
    name: "ventas-pedidos",
  });
}

watch(
  uploadedFiles,
  (newFiles) => {
    const procesados = newFiles
      .map((item) => {
        // Si es un archivo recién subido (Blob/File)
        if (item.file) return item.file;

        // Si es una imagen que ya estaba en el servidor (URL)
        if (item.isPersisted) return item.preview;

        return null;
      })
      .filter((f) => f !== null);

    form.value.imagenesoperaciones = procesados;
  },
  { deep: true }
);

/** proceso de carga de pdfs */

watch(
  uploadedPdfs,
  (newFiles) => {
    const procesados = newFiles
      .map((item) => {
        if (item.file) return item.file;
        if (item.isPersisted) return item.preview;
        return null;
      })
      .filter((f) => f !== null);
    form.value.documentos_pdf = procesados;
  },
  { deep: true }
);

// --- LÓGICA PARA EL MODAL DE BORRADORES ---
const createNewDraft = async () => {
  const newId = `draft_${Date.now()}`;
  await clearForm(uploadedFiles, false, false, uploadedPdfs);
  showInfoClient.value = false;
  showResultClients.value = false;
  router.push({ query: { ...route.query, draft: newId } });
};

const listaBorradores = ref([]);

async function openDraftsModal() {
  const respListDraft = await getActiveDrafts();
  if (!respListDraft.ok) return;
  listaBorradores.value = respListDraft.data;
  verModalBorradoresObj.show();
}

const deleteDraftItem = (draftId) => {
  toast
    .fire({
      title: "¿Estás seguro?",
      text: "Se perderán los datos no guardados de este borrador.",
      icon: "warning",
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-danger m-1",
        cancelButton: "btn btn-secondary m-1",
      },
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    })
    .then(async (result) => {
      if (result.value) {
        await removeDraft(draftId);
        const resp = await getActiveDrafts();
        if (resp.ok) {
          listaBorradores.value = resp.data;
        }
        if (draftId === currentDraftId.value) {
          window.location.href = window.location.pathname;
        }
      }
    });
};

const loadSelectedDraft = (draftId) => {
  if (draftId === currentDraftId.value) {
    verModalBorradoresObj.hide();
    return;
  }
  verModalBorradoresObj.hide();
  setTimeout(() => {
    router.push({ query: { ...route.query, draft: draftId } });
  }, 350);
};

//watch para vigilar los cambios en el id del borrador en la URL
watch(
  () => route.query.draft,
  async (newDraftId, oldDraftId) => {
    if (isRecoveringQuote.value) return;
    if (newDraftId && newDraftId !== oldDraftId) {
      showInfoClient.value = false;
      uploadedFiles.value = [];
      await fetchCurrentDraft();
      if (form.value.cliente?.CLI_RUC) {
        showInfoClient.value = true;
        const promises = [
          fetchCustomerBranches(form.value.cliente.CLI_RUC, "cotizacion"),
          fetchAvailableCreditCustomer(form.value.cliente.CLI_RUC),
        ];
        if (form.value.condicion_pago_id) {
          promises.push(fetchMethodPayment(form.value.condicion_pago_id));
        }

        await Promise.all(promises);
        if (form.value.imagenesoperaciones?.length > 0) {
          uploadedFiles.value = form.value.imagenesoperaciones.map(
            (url, index) => ({
              id: `restored-${index}`,
              preview: url,
              isPersisted: true,
            })
          );
        }

        if (form.value.documentos_pdf?.length > 0) {
          restorePersistedPdfs(
            form.value.documentos_pdf.map((url, index) => ({
              id: `pdf-restored-${index}`,
              url,
              nombre: `Documento ${index + 1}.pdf`,
              mime_type: "application/pdf",
            }))
          );
        }
      }

      if (form.value.items && form.value.items.length > 0) {
        setTimeout(() => {
          updateStockByBatchV2();
        }, 300);
      }
    } else if (!newDraftId && oldDraftId) {
      await clearForm(uploadedFiles, false, false, uploadedPdfs);
      showInfoClient.value = false;
      showResultClients.value = false;
      const nextId = `draft_${Date.now()}`;
      router.replace({ query: { ...route.query, draft: nextId } });
    }
  }
);

const DEFAULT_PROJECT_ID = 1;
const isEmptyProject = (project) =>
  project === null || project === undefined || project === "";

function setDefaultProject() {
  if (!isEmptyProject(form.value.proyecto)) return;
  if (dataProyectSellers.value.length === 0) return;

  const defaultProject = dataProyectSellers.value.find(
    (project) => Number(project.coMotproven) === DEFAULT_PROJECT_ID
  );

  if (defaultProject) {
    form.value.proyecto = defaultProject.coMotproven;
  }
}

watch(
  () => [form.value.proyecto, dataProyectSellers.value.length],
  () => setDefaultProject()
);

/** proceso para asignación de item logistico de servicio */

watch(
  () => form.value.fle_valor,
  (montoFlete) => {
    const valorFijo = formatCleanPrice4(montoFlete, 4);
    let updated = false;
    form.value.items.forEach((item) => {
      if (Number(item.es_servicio_logistico) !== 1) return;
      item.ART_VALOR = valorFijo;
      item.precio_sin_flete = valorFijo;
      item.ART_VALOR_ORIGINAL = valorFijo;
      item.valor_temporal = valorFijo;
      item.modificador = 0;
      updated = true;
    });
    if (updated) calculateTotals();
  }
);

watch(
  () => form.value.tipo_despacho_id,
  async (newVal) => {
    if (newVal === 3) {
      await searchLogisticArticle();
    }
    if (newVal !== 3) {
      await removeLogisticServiceArticle();
    }
  }
);

async function searchLogisticArticle() {
  const hasLogisticService = form.value.items.some(
    (item) => item.es_servicio_logistico === true
  );
  if (hasLogisticService) {
    return;
  }
  const resp = await fetchArticleLogistic();
  let row = resp?.data;
  row.ART_VALOR = form.value.fle_valor;
  row.ART_VALOR_ORIGINAL = form.value.fle_valor;
  row.valor_temporal = form.value.fle_valor;
  addItems(row);
}

async function removeLogisticServiceArticle() {
  const index = form.value.items.findIndex(
    (item) => Number(item.es_servicio_logistico) === 1
  );
  if (index !== -1) {
    removeItem(index);
  }
}

function isDisableLogisticServiceArticle(item) {
  return item.es_servicio_logistico;
}

onMounted(async () => {
  await fetchActiveProviders();
  const mode = route.query.mode;
  const idDoc = route.query.id;
  if (mode && idDoc) {
    isRecoveringQuote.value = true;
    const newId = `draft_${Date.now()}`;
    if (mode === "restore_quote") {
      await fetchAndFillQuotation(idDoc, uploadedFiles, uploadedPdfs);
    } else if (mode === "reorder_quote") {
      await loadDataForReorder(idDoc, uploadedFiles, uploadedPdfs);
    } else if (mode === "reorder_order") {
      await reOrder(idDoc, uploadedFiles, uploadedPdfs);
    } else if (mode === "copy") {
      const tipo = route.query.tipo; // 'cotizacion' o 'pedido'
      const clienteId = route.query.cliente_id;
      const sucursalId = route.query.sucursal;

      await copyRawQuoteOrOrder(
        idDoc,
        tipo,
        clienteId,
        sucursalId,
        uploadedFiles,
        uploadedPdfs
      );
    }
    form.value.draft_id = newId;
    // 5. CAMBIAMOS LA URL (Transformándolo en un borrador activo normal)
    await router.replace({ query: { draft: newId } });

    // 6. 🟢 QUITAMOS EL CANDADO
    setTimeout(() => {
      isRecoveringQuote.value = false;
    }, 500);
  } else {
    if (!route.query.draft) {
      const newId = `draft_${Date.now()}`;
      await router.replace({ query: { ...route.query, draft: newId } });
    }
    await fetchCurrentDraft();
  }
  await fetchListProyectSellers();
  setDefaultProject();
  await Promise.all([fetchWarehouseByPtoVtaUser(), fetchConditionPayment()]);

  const newCustomerIdentification = String(
    route.query.cliente_nuevo ?? ""
  ).trim();
  if (newCustomerIdentification) {
    await processSelectClient({ CLI_RUC: newCustomerIdentification });
  }

  //logica para recuperar datos en memoria
  if (form.value.cliente && form.value.cliente.CLI_RUC) {
    loadingSearch.value = false;
    loadingAvailableCredit.value = false;
    showInfoClient.value = true;
    showResultClients.value = false;

    //esto es para aseguyrar que si viene de la tabla recuperar las fotos aparezcan
    if (
      form.value.imagenesoperaciones &&
      form.value.imagenesoperaciones.length > 0
    ) {
      if (uploadedFiles.value.length === 0) {
        uploadedFiles.value = form.value.imagenesoperaciones.map(
          (url, index) => {
            return {
              id: `restored-${index}`,
              preview: url,
              name: `Imagen recuperada ${index + 1}`,
              isPersisted: true,
            };
          }
        );
      }
    }

    //esto es para asegurar la carga de los pdfs si viene de la tabla
    if (form.value.documentos_pdf && form.value.documentos_pdf.length > 0) {
      if (uploadedPdfs.value.length === 0) {
        uploadedPdfs.value = form.value.documentos_pdf.map((url, index) => {
          return {
            id: `pdf-restored-${index}`,
            url,
            name: `Documento recuperado  ${index + 1}.pdf`,
            mime_type: "application/pdf",
          };
        });
      }
    }

    await nextTick();
    try {
      const promises = [];
      promises.push(
        fetchCustomerBranches(form.value.cliente.CLI_RUC, "cotizacion")
      );
      promises.push(fetchAvailableCreditCustomer(form.value.cliente.CLI_RUC)); //opcional veamos que hace
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

      if (form.value.items && form.value.items.length > 0) {
        // Un pequeño delay para dejar que Vue termine de pintar la tabla
        setTimeout(() => {
          updateStockByBatchV2();
        }, 400);
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
    <div :key="currentDraftId">
      <FiltrarCliente
        title="Buscar Cliente"
        class="mb-2"
        :search-value="dataSearch.search ?? ''"
        :clients="clients"
        :loading="loadingSearch"
        :error-search="errorSearchClient"
        :show-results="showResultClients"
        @search-term-change="updateCustomerSearchTerm"
        @search-customers="searchFilterClientes"
        @select-customer="selectClient"
      >
        <template #actions>
          <div class="col-12 col-lg-auto d-flex flex-wrap gap-2">
            <button
              class="btn btn-primary btn-sm fw-semibold"
              type="button"
              @click="createNewDraft"
              title="Crear nueva cotización en blanco"
            >
              <i class="fa fa-file-circle-plus me-1"></i> Nuevo
            </button>
            <button
              class="btn btn-outline-secondary btn-sm fw-semibold"
              type="button"
              @click="openDraftsModal"
              title="Ver cotizaciones pendientes"
            >
              <i class="fa fa-folder-open text-warning me-1"></i> Borradores
            </button>
            <router-link
              :to="{ name: 'ventas-cotizacion-imagenes' }"
              class="btn btn-outline-primary btn-sm fw-semibold"
              title="Crear un borrador desde imágenes"
            >
              <i class="fa fa-image me-1"></i> Desde imágenes
            </router-link>
            <router-link
              :to="{ name: 'ventas-crearcliente' }"
              class="btn btn-success btn-sm"
              :class="{ disabled: loadingSearch }"
            >
              <i class="fa fa-plus me-1"></i> Crear
            </router-link>
          </div>
        </template>
      </FiltrarCliente>

      <!-- detalle visual de informacion de cliente -->
      <div
        v-if="loadingAvailableCredit && !form.cliente?.id"
        class="text-center py-4"
      >
        <div class="spinner-border spinner-border-sm text-primary">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <div class="fs-sm text-muted mt-2">
          Obteniendo Información del Cliente...
        </div>
      </div>

      <!-- Informacion del cliente -->
      <InformacionCliente
        v-if="showInfoClient && form.cliente?.id"
        :info-cliente="form.cliente"
        :form="form"
        :loading="loadingAvailableCredit"
        :info-segmento="infoSegmento"
        :warehouse-by-user="warehouseByUser"
        :sucursales="sucursales"
        :loading-sucursales="loadingSucursales"
        :loading-warehouse-by-user="loadingWarehouseByUser"
        :loading-proyect-sellers="loadingProyectSellers"
        :data-proyect-sellers="dataProyectSellers"
        @create-address="openModalCreateAddress"
        @update-field="updateClientInfoField"
      />

      <!-- banner de seleccion de clasificacion -->
      <div v-if="showInfoClient && form.cliente?.id">
        <ConfiguracionSegmentacionCard
          :form="form"
        ></ConfiguracionSegmentacionCard>
      </div>
      <!-- seccion de seleccion de articulos  -->
      <BaseBlock v-if="showInfoClient && form.cliente?.id" class="mb-2">
        <template #title>
          <div
            class="d-flex flex-wrap align-items-center justify-content-between w-100"
          >
            <div class="d-flex align-items-center gap-3">
              <span class="fw-semibold">Cotización</span>
              <div
                v-if="form.cotizacion_id"
                class="d-flex align-items-center animate__animated animate__fadeIn"
              >
                <span
                  class="badge bg-warning-subtle text-dark border border-warning rounded-pill px-3 py-2 d-flex align-items-center shadow-sm"
                >
                  <i class="fa fa-pen-to-square me-2 opacity-75"></i>
                  <span class="fs-sm fw-bold"
                    >Editando #
                    {{ form.cotizacion_codigo || form.cotizacion_id }}</span
                  >
                </span>
              </div>
            </div>
          </div>
        </template>
        <div
          class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4"
        >
          <div class="d-flex flex-wrap align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-primary"
              @click="openModalSearchItem"
            >
              <i class="fa fa-search me-1"></i>Buscar artículo
            </button>

            <div class="btn-group btn-group-sm">
              <button
                type="button"
                class="btn btn-outline-secondary dropdown-toggle"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                :disabled="loadingStockMasivo"
              >
                <i class="fa fa-plus me-1"></i>Agregar ítem L
              </button>
              <ul class="dropdown-menu shadow-sm">
                <li>
                  <button
                    type="button"
                    class="dropdown-item"
                    @click="searchItemLByType(5)"
                  >
                    <i class="fa fa-percent fa-fw me-2"></i>Ítem L · IVA 5%
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="dropdown-item"
                    @click="searchItemLByType(15)"
                  >
                    <i class="fa fa-percent fa-fw me-2"></i>Ítem L · IVA 15%
                  </button>
                </li>
              </ul>
            </div>

            <button
              type="button"
              class="btn btn-sm btn-outline-success"
              :disabled="loadingStockMasivo"
              @click="updateStockByBatchV2"
            >
              <i class="fa fa-rotate me-1"></i>Actualizar stock
            </button>
          </div>
          <button
            type="button"
            class="btn btn-sm btn-outline-info ms-auto"
            :disabled="!historyInvoiceClientId"
            @click="openModalHistoryInvoices"
          >
            <i class="fa fa-file-invoice me-1"></i>Historial Facturas
          </button>
        </div>
        <div class="table-responsive mt-1 mb-2">
          <table
            v-if="form.items.length > 0"
            class="table table-hover table-sm table-vcenter mt-0"
          >
            <thead>
              <tr>
                <th scope="col" class="text-center" style="width: 40px">#</th>
                <th scope="col" style="min-width: 100px">Código</th>
                <th scope="col">Descripción</th>
                <th scope="col" style="width: 3rem"></th>
                <th scope="col" class="text-center" style="width: 50px">ALT</th>
                <th scope="col" class="text-center" style="width: 50px">CTL</th>
                <th scope="col" class="text-center" style="width: 50px">UDM</th>
                <th scope="col" style="width: 50px"></th>
                <th scope="col" class="text-center" style="width: 80px">
                  Cantidad
                </th>
                <th scope="col" style="width: 50px"></th>
                <th scope="col" class="text-end" style="width: 60px">Stock</th>
                <th scope="col" class="text-center" style="width: 90px">
                  Mod %
                </th>
                <th scope="col" class="text-end" style="width: 100px">
                  Precio
                </th>
                <th scope="col" class="text-end" style="width: 50px">
                  Monto flete
                </th>
                <th scope="col" class="text-end" style="width: 80px">
                  % Desc.
                </th>
                <th scope="col" class="text-end" style="width: 100px">
                  T. con Desc.
                </th>
                <th scope="col" style="width: 50px"></th>
              </tr>
            </thead>
            <draggable
              v-model="form.items"
              tag="tbody"
              :item-key="'id_temp'"
              handle=".handle"
              ghost-class="bg-light-info"
            >
              <template #item="{ element, index }">
                <tr :key="element.id_temp">
                  <td class="fs-sm text-center">{{ index + 1 }}</td>
                  <td class="fs-sm code">{{ element.ART_CODIGO }}</td>
                  <!-- descripcion -->
                  <td class="fs-sm">
                    <div
                      v-if="!isDescriptionEditable(index)"
                      @click="enableEditModeDescription(index)"
                      class="d-flex align-items-center"
                      style="cursor: pointer"
                      title="Click para editar"
                    >
                      <div class="d-flex flex-column lh-sm">
                        <span
                          :class="getDescriptionClass(element)"
                          class="fw-medium"
                        >
                          {{ element.ART_DESCRIPCION }}
                        </span>
                        <small
                          v-if="element.CHECK_ALTERNATIVO == 1"
                          class="text-warning fst-italic"
                          style="font-size: 0.75rem"
                        >
                          <i class="fa fa-info-circle me-1"></i>Alternativa
                        </small>
                      </div>
                    </div>
                    <input
                      v-else
                      type="text"
                      :id="`updatedescripcion-${element.id}`"
                      class="form-control form-control-sm"
                      :class="{ 'is-invalid': element.errorDescripcion }"
                      placeholder="Descripción del artículo"
                      v-model="element.ART_DESCRIPCION"
                      v-focus
                      @blur="updateDescripcion($event, element, index)"
                      @keyup.enter="updateDescripcion($event, element, index)"
                    />
                  </td>
                  <!-- obtener listado de descripciones -->
                  <td class="fs-sm text-center">
                    <button
                      v-if="!isDisableLogisticServiceArticle(element)"
                      type="button"
                      class="btn btn-sm btn-info"
                      @click="openModalListItemAlternatives(element, index)"
                    >
                      <i class="fa fa-search"></i>
                    </button>
                  </td>
                  <!-- check alternativo -->
                  <td class="fs-sm text-center">
                    <input
                      v-if="!isDisableLogisticServiceArticle(element)"
                      type="checkbox"
                      class="form-check-input"
                      :id="`checkAlternativo-${element.id}`"
                      @click="updateCheckAlternative($event, element, index)"
                      v-model="element.CHECK_ALTERNATIVO"
                      :true-value="1"
                      :false-value="0"
                    />
                  </td>
                  <!-- codigo 3 letras -->
                  <td class="fs-sm">{{ element.ART_CODIGO_TRES_LETRAS }}</td>
                  <!-- unidad de medida UDM -->
                  <td class="fs-sm">{{ element.ART_PLAN_UMEDIDA }}</td>
                  <!-- abrir modal de proveedores -->
                  <td class="fs-sm">
                    <div
                      v-if="isItemL(element)"
                      class="d-flex justify-content-center gap-1"
                    >
                      <button
                        type="button"
                        class="btn btn-sm"
                        :class="
                          element.proveedores_listo
                            ? 'btn-success'
                            : 'btn-danger'
                        "
                        @click="openModalProviders(element, index)"
                      >
                        <i class="fa fa-people-arrows-left-right"></i>
                      </button>
                      <!-- <button
                        type="button"
                        class="btn btn-sm btn-warning"
                        title="Configuración de ítem L"
                        @click="openModalSegmentationItemL(element, index)"
                      >
                        <i class="fa fa-gear"></i>
                      </button> -->
                    </div>
                  </td>
                  <!-- cantidad -->
                  <td class="fs-sm">
                    <input
                      type="text"
                      :id="`updatecantidad-${element.id}`"
                      class="form-control text-end"
                      :class="{ 'is-invalid': element.errorCantidad }"
                      placeholder="0"
                      min="0"
                      :disabled="isDisableLogisticServiceArticle(element)"
                      :value="element.ART_CANTIDAD"
                      @change="changeQuantityItem($event, element, index)"
                      :tablindex="index + 1"
                    />
                  </td>
                  <!-- modal para abrir stock de bodega -->
                  <td class="fs-sm">
                    <!-- boton stock -->
                    <button
                      v-if="shouldShowStock(element)"
                      type="button"
                      class="btn btn-sm"
                      :class="
                        element.stockListo ? 'btn-success' : 'btn-warning'
                      "
                      title="Seleccionar stock por bodega"
                      :disabled="isStockDisabled(element)"
                      @click="openModalStockRowItem(element, index)"
                    >
                      <i
                        v-if="isStockDisabled(element)"
                        class="fa fa-spinner fa-spin"
                      ></i>
                      <i v-else class="fa-solid fa-warehouse"></i>
                    </button>

                    <!-- boton peso -->
                    <button
                      v-else-if="!isDisableLogisticServiceArticle(element)"
                      class="btn btn-sm btn-info"
                      :title="isItemL(element) ? 'Peso obligatorio (mayor a cero)' : 'Peso de artículo'"
                      :class="{ 'btn-danger': isItemL(element) && (!Number.isFinite(Number(element.ART_PESO)) || Number(element.ART_PESO) <= 0) }"
                      @click="openModalPesoRowItem(element, index)"
                    >
                      <i class="fa-solid fa-scale-unbalanced"></i>
                    </button>
                  </td>

                  <!-- ART_STOCK -->
                  <td class="fs-sm text-end">
                    <span v-if="shouldShowStock(element)">
                      {{ element.ART_STOCK }}
                    </span>
                    <span
                      v-else
                      class="text-muted"
                      style="text-align: center"
                      title="No aplica stock"
                    >
                      &mdash;
                    </span>
                  </td>
                  <!-- modificador -->
                  <td class="fs-sm text-end">
                    <input
                      v-if="
                        element.ART_TIPO_COMPRA !== 'L' &&
                        !isDisableLogisticServiceArticle(element)
                      "
                      type="number"
                      class="form-control text-end no-spinners"
                      step="0.01"
                      :class="{ 'is-invalid': element.errorModificador }"
                      placeholder="0.00"
                      v-model.number="element.modificador"
                      @focus="$event.target.select()"
                      @change="applyModifyRow(element)"
                      @keydown.enter="$event.target.blur()"
                      :disabled="isDisableLogisticServiceArticle(element)"
                    />
                    <span
                      v-else
                      class="text-muted"
                      style="text-align: center"
                      title="No aplica modificador"
                    >
                      &mdash;
                    </span>
                  </td>
                  <!-- precio -->
                  <td class="fs-sm text-end col-1">
                    <div
                      v-if="!isPriceEditable(element)"
                      @click="enableEditPrice(element, index)"
                      class="cursor-pointer"
                      title="Clic para editar"
                    >
                      <span :class="isApplyModifyPriceStyle(element)">
                        ${{ formatPrice4(parseFloat(element.ART_VALOR)) }}
                      </span>
                    </div>
                    <input
                      v-else
                      :id="`input-precio-${index}`"
                      type="number"
                      step="0.0001"
                      min="0.0000"
                      class="form-control text-end no-spinners p-1"
                      :class="{ 'is-invalid': element.errorPrecio }"
                      v-model.number="element.ART_VALOR"
                      @focus="$event.target.select()"
                      @blur="saveModifyPrice(element, index)"
                      @keyup.enter="$event.target.blur()"
                      @keyup.esc="exitEditPrice(element)"
                    />
                  </td>
                  <!-- precio flete -->
                  <td class="fs-sm text-end col-1">
                    <span
                      v-if="!isActivePricefreight(element)"
                      class="text-muted"
                      style="text-align: center"
                      title="No aplica flete por artículo"
                    >
                      &mdash;
                    </span>
                    <div
                      v-else-if="!element.cambiar_flete"
                      @click="enableEditFreight(element, index)"
                      class="cursor-pointer"
                      title="Clic para editar"
                    >
                      <span :class="element.errorMontoFlete ? 'text-danger' : 'text-primary'">
                        ${{ format(Number(element.fle_valor || 0)) }}
                      </span>
                    </div>
                    <input
                      v-else
                      :id="`input-monto-flete-${index}`"
                      :class="{ 'is-invalid': element.errorMontoFlete }"
                      type="number"
                      class="form-control text-end no-spinners p-1"
                      placeholder="0"
                      v-model.number="element.fle_valor"
                      min="0"
                      step="0.01"
                      @focus="$event.target.select()"
                      @blur="saveModifyFreight(element)"
                      @keyup.enter="$event.target.blur()"
                      @keyup.esc="exitEditFreight(element)"
                    />
                  </td>
                  <!-- descuento con opcion de cambiar descuento-->
                  <td class="fs-sm text-end col-1">
                    <div
                      v-if="!isEditDiscount(element)"
                      @click="enableEditDiscount(element, index)"
                      class="cursor-pointer"
                      title="Clic para editar"
                    >
                      <span :class="isApplyModifyDiscountStyle(element)">
                        {{ format(parseFloat(element.descuento)) }}%
                      </span>
                    </div>
                    <input
                      v-else
                      :id="`input-descuento-${index}`"
                      type="number"
                      step="0.0000"
                      min="0.0000"
                      class="form-control text-end no-spinners p-1"
                      :class="{ 'is-invalid': element.errorDescuento }"
                      v-model.number="element.descuento"
                      @focus="$event.target.select()"
                      @blur="saveModifyDiscount(element, index)"
                      @keyup.enter="$event.target.blur()"
                      @keyup.esc="exitEditDiscount(element)"
                      :disabled="isDisableLogisticServiceArticle(element)"
                    />
                  </td>
                  <!-- total con descuento -->
                  <td class="fs-sm text-end col-1">${{ element.subtotal }}</td>
                  <!-- botones -->
                  <td class="text-center align-middle">
                    <div
                      class="btn-group btn-group-sm"
                      aria-label="Acciones del ítem"
                    >
                      <button
                        type="button "
                        class="btn btn-danger btn-sm"
                        @click="confirmarEliminarArticulo(element, index)"
                        :disabled="element.disabled_delete"
                        title="Eliminar"
                      >
                        <i class="fa fa-trash-can"></i>
                      </button>
                      <a
                        class="btn btn-primary btn-sm handle"
                        style="cursor: move"
                      >
                        <i class="fa fa-arrows-up-down-left-right"></i>
                      </a>
                      <button
                        v-if="element.imagenes && element.imagenes.length"
                        class="btn btn-success btn-sm"
                        type="button"
                        @click="showPhoto(element.imagenes)"
                      >
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
                <th scope="col" colspan="16" class="fs-sm text-end border-0">
                  Subtotal sin Descuento
                </th>
                <th scope="col" class="fs-sm text-end text-nowrap border-0">
                  ${{ format(form.subtotal + form.descuento) }}
                </th>
                <th scope="col" class="border-0"></th>
              </tr>
              <tr>
                <th scope="col" colspan="16" class="fs-sm text-end border-0">
                  Descuento
                </th>
                <th scope="col" class="fs-sm text-end text-nowrap border-0">
                  ${{ format(form.descuento) }}
                </th>
                <th scope="col" class="border-0"></th>
              </tr>
              <tr>
                <th scope="col" colspan="16" class="fs-sm text-end border-0">
                  Subtotal Neto
                </th>
                <th scope="col" class="fs-sm text-end text-nowrap border-0">
                  ${{ format(form.subtotal) }}
                </th>
                <th scope="col" class="border-0"></th>
              </tr>
              <tr>
                <th scope="col" colspan="16" class="fs-sm text-end border-0">
                  IVA
                </th>
                <th scope="col" class="fs-sm text-end text-nowrap border-0">
                  ${{ format(form.iva) }}
                </th>
                <th scope="col" class="border-0"></th>
              </tr>
              <tr class="table-active">
                <th scope="col" colspan="16" class="fs-sm text-end fw-bold">
                  TOTAL
                </th>
                <th scope="col" class="fs-sm text-end fw-bold text-nowrap">
                  ${{ format(parseFloat(form.total)) }}
                </th>
                <th scope="col" class="border-0"></th>
              </tr>
              <tr>
                <td colspan="17" class="border-0 p-1"></td>
              </tr>
              <tr>
                <th
                  scope="col"
                  colspan="16"
                  class="fs-sm text-end text-muted fst-italic border-0"
                >
                  Peso total aprox.
                </th>
                <th
                  scope="col"
                  class="fs-sm text-end text-muted fst-italic text-nowrap border-0"
                >
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
            <div
              class="mb-4"
              v-if="form.alerta_facturar != '' || form.pregunta_facturar"
            >
              <div
                class="alert alert-warning d-flex align-items-center flex-wrap gap-3 shadow-sm border-0 mb-0"
              >
                <div
                  v-if="form.alerta_facturar != ''"
                  class="d-flex align-items-center gap-2"
                >
                  <i class="fa fa-exclamation-triangle"></i>
                  <span class="fw-bold"
                    >Factura a demanda posterior al despacho</span
                  >
                </div>

                <div
                  v-if="form.pregunta_facturar"
                  class="d-flex align-items-center gap-3 flex-wrap ms-md-auto"
                >
                  <span class="small">
                    Último día:
                    <strong class="text-dark">{{
                      form.cliente.CLI_DIA_MAXIMO_MES_FACTURACION
                    }}</strong>
                  </span>
                  <div class="form-check form-switch mb-0">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="switch-facturar"
                      :true-value="true"
                      :false-value="false"
                      v-model="form.facturar_ahora"
                    />
                    <label
                      class="form-check-label fw-bold text-dark"
                      for="switch-facturar"
                    >
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
                  <label
                    for="condicionPagoSelect"
                    class="form-label small text-uppercase fw-bold text-body-secondary"
                    >Condición de pago</label
                  >
                  <select
                    id="condicionPagoSelect"
                    class="form-select"
                    :disabled="form.cliente.suspendido == 1"
                    v-model="form.condicion_pago_id"
                  >
                    <option
                      v-for="(cod, index) in conditionPayment"
                      :key="index"
                      :value="cod.condId"
                    >
                      {{ cod.condId }}
                    </option>
                  </select>
                </div>

                <div class="col-md-6 col-xl-5">
                  <div
                    class="d-flex justify-content-between align-items-center mb-1"
                  >
                    <label
                      for="metodoPagoSelect"
                      class="form-label small text-uppercase fw-bold text-body-secondary mb-0"
                      >Forma de pago</label
                    >
                    <span
                      v-if="
                        form.condicion_pago_id !==
                        form.cliente.CLI_CONDICION_PAGO
                      "
                      id="metodoPagoSelect"
                      class="badge bg-danger-subtle text-danger border border-danger-subtle rounded-pill"
                    >
                      Condición diferente
                    </span>
                  </div>

                  <select
                    class="form-select mb-2"
                    v-model="form.forma_pago_id"
                    :disabled="loadingMethodPayment"
                    @change="selectMethodPayment"
                  >
                    <option
                      v-for="(me, index) in methodPayment"
                      :key="index"
                      :value="me.codigo"
                    >
                      {{ me.tipo }}
                    </option>
                  </select>

                  <div
                    class="d-flex align-items-center justify-content-end small"
                  >
                    <span v-if="!isEditingGlobalDiscount">
                      <span class="text-body-secondary me-2"
                        >Descuento aplicado:</span
                      >
                      <a
                        href="javascript:void(0)"
                        class="fw-bold text-decoration-none text-info"
                        @click="enableGlobalDiscountEdit"
                        title="Clic para editar descuento global manualmente"
                        >{{ Number(form.descuento_articulo).toFixed(2) }}%</a
                      >
                    </span>
                    <div v-else class="d-flex align-items-center">
                      <span class="text-body-secondary me-2">Nuevo %:</span>
                      <input
                        id="input-global-discount"
                        ref="inputGlobalDiscountRef"
                        type="number"
                        class="form-control form-control-sm text-end no-spinners p-1"
                        style="width: 80px"
                        :value="form.descuento_articulo"
                        @blur="updateGlobalDiscount($event)"
                        @keyup.enter="$event.target.blur()"
                        @keyup.esc="cancelGlobalDiscountEdit"
                      />
                    </div>
                  </div>
                </div>

                <div class="col-md-5 col-xl-2">
                  <label
                    for="descuentoGeneralInput"
                    class="form-label small text-uppercase fw-bold text-body-secondary"
                    >Desc. General PVP</label
                  >
                  <div class="input-group">
                    <input
                      id="descuentoGeneralInput"
                      type="number"
                      class="form-control text-end no-spinners"
                      placeholder="0.00"
                      value="0.00"
                      v-model.number="form.modificador_global"
                      @change="applyGeneraModifier"
                    />
                    <span
                      class="input-group-text bg-body-tertiary text-body-secondary"
                      >%</span
                    >
                  </div>
                </div>

                <div class="col-md-6 col-xl-2">
                  <label
                    for="ordenCompraInput"
                    class="form-label small text-uppercase fw-bold text-body-secondary"
                    >Orden de Compra</label
                  >
                  <div class="position-relative">
                    <input
                      id="ordenCompraInput"
                      type="text"
                      class="form-control"
                      placeholder="Opcional"
                      value="OC-2024-999"
                      v-model="form.orden_de_compra"
                      :maxlength="maxOrder"
                    />
                    <span
                      class="position-absolute top-50 end-0 translate-middle-y me-2 badge bg-dark opacity-50 small"
                    >
                      {{ maxOrder - form.orden_de_compra.length }}
                    </span>
                  </div>
                </div>
              </div>
            </BaseBlock>
            <BaseBlock class="mb-2">
              <template #title>
                <div class="d-flex align-items-center gap-2">
                  <i class="fa fa-sticky-note text-body-secondary"></i>
                  <span class="fw-semibold">Notas</span>
                </div>
              </template>
              <div class="row g-4 mb-2">
                <div class="col-md-4">
                  <div class="d-flex justify-content-between mb-1">
                    <label
                      class="form-label small text-uppercase fw-bold text-body-secondary"
                      >Nota Cliente</label
                    >
                    <span
                      v-if="form.nota_cliente"
                      class="small text-body-secondary"
                      style="font-size: 0.7rem"
                      >{{ maxLengthNote - form.nota_cliente.length }}</span
                    >
                  </div>
                  <textarea
                    class="form-control border-start border-4 border-primary"
                    rows="3"
                    placeholder="Visible en factura..."
                    v-model.trim="form.nota_cliente"
                    :maxlength="maxLengthNote"
                  ></textarea>
                </div>
                <div class="col-md-4">
                  <label
                    class="form-label small text-uppercase fw-bold text-body-secondary"
                    >Nota Interna</label
                  >
                  <textarea
                    class="form-control border-start border-4 border-warning"
                    rows="3"
                    placeholder="Uso administrativo..."
                    v-model.trim="form.nota_interna"
                  ></textarea>
                </div>
                <div class="col-md-4">
                  <div class="d-flex justify-content-between mb-1">
                    <label
                      class="form-label small text-uppercase fw-bold text-body-secondary"
                      >Nota Operaciones</label
                    >
                    <span
                      v-if="form.nota_operaciones"
                      class="small text-body-secondary"
                      style="font-size: 0.7rem"
                      >{{ maxLengthNote - form.nota_operaciones.length }}</span
                    >
                  </div>
                  <textarea
                    class="form-control border-start border-4 border-danger"
                    rows="3"
                    placeholder="Logística y bodega..."
                    v-model.trim="form.nota_operaciones"
                    :maxlength="maxLengthNote"
                  ></textarea>
                </div>
              </div>
            </BaseBlock>
            <!-- seccion de manejo de imagenes de operaciones -->
            <BaseBlock title="Imágenes" content-full rounded class="mb-3">
              <div
                class="upload-zone position-relative d-flex align-items-center justify-content-center p-3 border border-2 border-dashed rounded-3"
                :class="
                  isDragging
                    ? 'border-primary bg-primary bg-opacity-10'
                    : 'border-secondary border-opacity-25 bg-body-tertiary'
                "
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
                @click="triggerFileInput"
                style="cursor: pointer; transition: all 0.2s ease"
              >
                <input
                  type="file"
                  ref="fileInput"
                  class="d-none"
                  multiple
                  accept="image/*"
                  @change="handleInputFiles"
                />

                <div
                  class="d-flex align-items-center gap-3 pointer-events-none text-muted"
                >
                  <i class="fa fa-cloud-upload-alt fs-3 text-primary"></i>

                  <div class="lh-1 text-start">
                    <span class="fw-semibold text-primary"
                      >Adjuntar imágenes</span
                    >
                    <span class="d-none d-sm-inline ms-1 text-muted small"
                      >(Clic o arrastrar)</span
                    >
                    <div
                      class="text-muted"
                      style="font-size: 0.75rem; margin-top: 4px"
                    >
                      JPG, PNG (Máx 5MB)
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="uploadedFiles.length > 0 || isCompressing"
                class="d-flex flex-wrap gap-3 mt-3"
              >
                <div
                  v-for="(file, index) in uploadedFiles"
                  :key="index"
                  class="position-relative border border-secondary border-opacity-25 rounded bg-body overflow-hidden group-hover-container"
                  style="width: 80px; height: 80px"
                  @click="previewUploadedImages(index)"
                >
                  <img
                    :src="file.preview"
                    class="img-fluid w-100 h-100 object-fit-cover"
                    alt="Preview"
                    style="opacity: 0.9"
                    title="Clic para ampliar"
                  />

                  <button
                    @click.stop="removeFile(index)"
                    type="button"
                    class="btn btn-sm btn-danger p-0 position-absolute top-0 end-0 d-flex align-items-center justify-content-center btn-remove-img"
                    style="
                      width: 20px;
                      height: 20px;
                      border-radius: 0 0 0 4px;
                      z-index: 10;
                    "
                    title="Eliminar imagen"
                  >
                    <i class="fa fa-times" style="font-size: 10px"></i>
                  </button>
                </div>
                <div
                  v-if="isCompressing"
                  class="d-flex flex-column align-items-center justify-content-center border rounded bg-light text-info"
                  style="width: 80px; height: 80px; font-size: 0.7rem"
                >
                  <i class="fa fa-circle-notch fa-spin fs-4 mb-1"></i>
                  <span>Procesando</span>
                </div>
              </div>
            </BaseBlock>

            <!-- seccion de manejo de documentos pdf -->
            <BaseBlock title="Documentos PDF" content-full rounded class="mb-3">
              <div
                class="upload-zone position-relative d-flex align-items-center justify-content-center p-3 border border-2 border-dashed rounded-3"
                :class="
                  isDraggingPdf
                    ? 'border-danger bg-danger bg-opacity-10'
                    : 'border-secondary border-opacity-25 bg-body-tertiary'
                "
                @dragover.prevent="isDraggingPdf = true"
                @dragleave.prevent="isDraggingPdf = false"
                @drop.prevent="handleDropPdf"
                @click="triggerPdfInput"
                style="cursor: pointer; transition: all 0.2s ease"
              >
                <input
                  type="file"
                  ref="pdfInput"
                  class="d-none"
                  multiple
                  accept=".pdf,application/pdf"
                  @change="handleInputPdf"
                />

                <div
                  class="d-flex align-items-center gap-3 pointer-events-none text-muted"
                >
                  <i class="fa fa-file-pdf fs-3 text-danger"></i>

                  <div class="lh-1 text-start">
                    <span class="fw-semibold text-danger"
                      >Adjuntar documentos PDF</span
                    >
                    <span class="d-none d-sm-inline ms-1 text-muted small"
                      >(Clic o arrastrar)</span
                    >
                    <div
                      class="text-muted"
                      style="font-size: 0.75rem; margin-top: 4px"
                    >
                      PDF (Máx 10MB)
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="uploadedPdfs.length > 0 || isProcessingPdf"
                class="d-flex flex-wrap gap-3 mt-3"
              >
                <div
                  v-for="(file, index) in uploadedPdfs"
                  :key="file.id || index"
                  class="position-relative border border-secondary border-opacity-25 rounded bg-body overflow-hidden"
                  style="width: 120px; min-height: 90px"
                >
                  <a
                    :href="file.preview"
                    target="_blank"
                    class="w-100 h-100 d-flex flex-column align-items-center justify-content-center text-decoration-none text-danger p-2"
                  >
                    <i class="fa fa-file-pdf fs-2 mb-2"></i>
                    <small
                      class="text-center"
                      style="font-size: 10px; line-height: 1.1"
                    >
                      {{ file.name }}
                    </small>
                  </a>

                  <button
                    @click.stop="removePdf(index)"
                    type="button"
                    class="btn btn-sm btn-danger p-0 position-absolute top-0 end-0 d-flex align-items-center justify-content-center"
                    style="
                      width: 20px;
                      height: 20px;
                      border-radius: 0 0 0 4px;
                      z-index: 10;
                    "
                    title="Eliminar PDF"
                  >
                    <i class="fa fa-times" style="font-size: 10px"></i>
                  </button>
                </div>

                <div
                  v-if="isProcessingPdf"
                  class="d-flex flex-column align-items-center justify-content-center border rounded bg-light text-danger"
                  style="width: 120px; min-height: 90px; font-size: 0.7rem"
                >
                  <i class="fa fa-circle-notch fa-spin fs-4 mb-1"></i>
                  <span>Procesando</span>
                </div>
              </div>
            </BaseBlock>
            <div
              class="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 pt-3 border-top gap-3 mb-2"
            >
              <button
                type="button"
                class="btn btn-danger px-4 w-100 w-md-auto order-2 order-md-1"
                @click="clearCotizacion"
              >
                Limpiar cotización
              </button>
              <p
                v-if="validateItemLWeights()"
                class="text-danger fs-sm mb-0"
                role="alert"
              >
                {{ validateItemLWeights() }}
              </p>
              <p
                v-else-if="validateDispatchFields()"
                class="text-danger fs-sm mb-0"
                role="alert"
              >
                {{ validateDispatchFields() }}
              </p>
              <p
                v-else-if="!validateFreightTotal()"
                class="text-danger fs-sm mb-0"
                role="alert"
              >
                Ingrese montos de flete válidos. Para paquetería, la suma del
                detalle debe coincidir con el valor del flete.
              </p>
              <div
                class="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto order-1 order-md-2"
              >
                <button
                  type="button"
                  class="btn btn-success px-4 fw-bold shadow-sm w-100 w-md-auto"
                  :disabled="btnDisableStoreQuotation"
                  @click="createQuotation"
                >
                  <i
                    v-if="loadingCreateQuotation"
                    class="fa fa-spinner fa-spin me-2"
                  ></i>
                  <i v-else class="fa fa-save me-2"></i>
                  Guardar Cotización
                </button>
                <button
                  v-if="form.cotizacion_id"
                  type="button"
                  class="btn btn-warning px-4 fw-bold text-white shadow-sm w-100 w-md-auto"
                  :disabled="btnDisabledStore"
                  @click="saveToOrderAndUpdateQuotation"
                >
                  <i
                    v-if="loadingSaveOrder"
                    class="fa fa-spinner fa-spin me-2"
                  ></i>
                  <i v-else class="fa fa-check-circle me-2"></i>Guardar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      </BaseBlock>
    </div>
  </div>

  <!-- seccion de modales -->

  <!-- modal para actualizacion de segmento -->
  <div
    class="modal"
    id="modal-segmento"
    tabindex="-1"
    aria-hidden="true"
    ref="verModalActualizarSegmento"
  >
    <div class="modal-dialog modal-md modal-dialog-centered">
      <div class="modal-content">
        <actualizarSegmentoClienteModal
          v-if="datosCliente"
          :cliente="datosCliente"
          @updated="processSelectClient"
        >
        </actualizarSegmentoClienteModal>
      </div>
    </div>
  </div>

  <!-- modal para la creacion de una nueva direccion -->

  <verModalCrearNuevaDireccion
    v-if="dataClient"
    ref="newAddressModal"
    :cliente="dataClient"
    @hidden="closeModalCreateAddress"
    @updated="handleSavedAddress"
  >
  </verModalCrearNuevaDireccion>

  <!-- modal de busqueda de articulos -->
  <div class="modal" id="modal-cliente" tabindex="-1" ref="verSearchItemModal">
    <div
      class="modal-dialog modal-xl modal-dialog-centered"
      style="max-width: 90vw"
    >
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

  <!-- Modal para listar y asignar item alternativo -->
  <div
    class="modal"
    id="modal-item-alternativo"
    tabindex="-1"
    ref="verItemAltRef"
  >
    <div
      class="modal-dialog modal-sm modal-dialog-centered"
      style="max-width: 400px"
    >
      <div class="modal-content">
        <verModalItemAlternativo
          v-if="itemAlternativo"
          :item="itemAlternativo.item"
          :indice="itemAlternativo.index"
          @seleccionarAlternativa="onSelectItemAlternativo"
        >
        </verModalItemAlternativo>
      </div>
    </div>
  </div>

  <!-- modal de historico de facturas por cliente -->
  <div
    class="modal fade"
    id="modal-historico-facturas"
    tabindex="-1"
    ref="verHistorialFacturasRef"
  >
    <div
      class="modal-dialog modal-xl modal-dialog-centered"
      style="max-width: 95vw"
    >
      <div class="modal-content">
        <verModalHistoricoFacturas
          v-if="showHistoryInvoicesModal && historyInvoiceClientId"
          :cliente-id="historyInvoiceClientId"
          @closeModal="closeModalHistoryInvoices"
        />
      </div>
    </div>
  </div>

  <!-- modal para la seleccion del stock de un articulo -->
  <div
    class="modal"
    id="modal-bodegas"
    tabindex="-1"
    ref="verSeleccionStockBodegasRef"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <verModalSeleccionStockBodegas
          v-if="dataStockItem.items.length > 0"
          :stocks="dataStockItem.items"
          :index="dataStockItem.index"
          :permiteDecimales="dataStockItem.permiteDecimales"
          @closeModal="closeModalStockRowItem"
          @update="handleStockUpdate"
        >
        </verModalSeleccionStockBodegas>
      </div>
    </div>
  </div>

  <!-- modal de modificacion de peso  -->
  <div class="modal" id="modal-peso" tabindex="-1" ref="verModalPesoItemRef">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <verModalModificacionPeso
          :item="dataPesoItem.item"
          :index="dataPesoItem.index"
          @cerrar="closeModalPesoRowItem()"
          @actualizar="handleWeightUpdate"
        >
        </verModalModificacionPeso>
      </div>
    </div>
  </div>

  <!-- modal de seleccion de proveedores para items L  -->
  <verModalProveedores
    ref="verProveedoresRef"
    :providers="dataModalProviders.proveedores"
    :index="dataModalProviders.index"
    :item="dataModalProviders.item"
    :loading-list-providers="loadingActiveProviders"
    :list-providers="activeProviders"
    @update:providers="handleSaveProviders"
  />

  <!-- modal de borradores -->
  <div
    class="modal fade"
    id="verModalBorradoresObj"
    tabindex="-1"
    aria-hidden="true"
    ref="verModalBorradoresRef"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow-xl">
        <verModalListaBorradores
          :borradores="listaBorradores"
          @cargar="loadSelectedDraft"
          @eliminar="deleteDraftItem"
        >
        </verModalListaBorradores>
      </div>
    </div>
  </div>

  <!-- modal de configuracion de items L -->
  <div
    class="modal fade"
    id="verModalConfiguracionItemLObj"
    tabindex="-1"
    aria-hidden="true"
    ref="verModalConfiguracionItemLRef"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content border-0 shadow-lg">
        <verModalConfiguracionItemL
          v-if="dataItemLClasification.item"
          :item="dataItemLClasification.item"
          :indice="dataItemLClasification.index"
          :form="form"
          @update-classification="updateItemLClassification"
          @select-alternative="selectItemLAlternative"
          @update-alternative-status="updateItemLAlternativeStatus"
        >
        </verModalConfiguracionItemL>
      </div>
    </div>
  </div>

  <VueEasyLightbox
    :visible="gallery.visible"
    :index="gallery.index"
    :imgs="gallery.photos"
    @hide="handleHide"
  />
</template>

<style scoped>
@media (min-width: 1200px) {
  .billing-sticky {
    position: sticky;
    top: 0.75rem;
  }
}

.text-monospace {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", monospace;
}

@media (min-width: 992px) {
  .table.table-sm > :not(caption) > * > * {
    padding-top: 0.35rem;
    padding-bottom: 0.35rem;
  }
}

/* columnas numéricas alineadas */
.code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", monospace;
  font-size: 14px;
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
