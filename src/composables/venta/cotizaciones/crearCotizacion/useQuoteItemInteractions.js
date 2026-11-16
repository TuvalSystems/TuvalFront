import { ref, computed, reactive, nextTick } from "vue";
import { freightUnitPrice } from "@/functions/freightPrice";
import { swalSuccess, swalError, swalWarning } from "@/functions/swal-alert.js";

export function useQuoteItemInteractions({
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
}) {
/** apertura de modal de consulta de items */
const dataSearchItem = ref({});
const historyInvoiceClientId = computed(() => form.value.cliente?.id ?? null);

const openModalSearchItem = () => {
  dataSearchItem.value = {};
  dataSearchItem.value = form.value;
  verSearchItemModalObj.show();
};

const closeModalSearchItem = () => {
  dataSearchItem.value = {};
  verSearchItemModalObj.hide();
};

async function openModalHistoryInvoices() {
  if (!historyInvoiceClientId.value) return;

  showHistoryInvoicesModal.value = true;
  await nextTick();
  verHistorialFacturasObj.show();
}

function closeModalHistoryInvoices() {
  verHistorialFacturasObj.hide();
}

//proceso de seleccion de items para llenar el form-items
const handleItemSelected = (row) => {
  addItems(row);
};

//proceso de items alternativos

const itemAlternativo = reactive({
  index: 0,
  item: "",
});
async function openModalListItemAlternatives(item, i) {
  itemAlternativo.item = "";
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
    item: item,
  };
  await nextTick();
  verProveedoresRef.value?.show();
}

const handleSaveProviders = async ({ index, providers, nuevoPrecio }) => {
  const item = form.value.items[index];
  item.proveedores = providers;
  if (!isActivePricefreight(item)) {
    // Conservar la base antes de retirar el flete del valor mostrado.
    item.precio_sin_flete ??= Number(item.ART_VALOR || 0) - (freightUnitPrice(item) ?? 0);
    item.fle_valor = 0;
    item.fle_valor_temporal = 0;
    item.cambiar_flete = false;
  }
  if (
    nuevoPrecio !== null &&
    nuevoPrecio !== undefined &&
    nuevoPrecio !== "" &&
    Number(nuevoPrecio) !== Number(item.valor_original_l)
  ) {
    item.ART_VALOR = nuevoPrecio;
    item.precio_sin_flete = nuevoPrecio;
    item.ART_VALOR_ORIGINAL = nuevoPrecio;
    item.valor_original_l = nuevoPrecio;
  }
  calculateTotals();
  verProveedoresRef.value?.hide();
};

/** logica para seleccion y asignación de item L  */
const filterItemsL = computed(() => {
  return form.value.items
    .filter((it) => it.ART_TIPO_COMPRA === "L")
    .map((it) => it.ART_CODIGO);
});

async function searchItemLByType(porcentil) {
  const payloadItemL = {
    items: filterItemsL.value,
    porcentaje: porcentil,
  };

  const resp = await searchItemL(payloadItemL);
  if (resp?.ok) {
    let row = resp?.data;
    row.descuento = form.value.cliente?.CLI_DSTO_COMERCIAL || 0;
    row.descuento_original = form.value.cliente?.CLI_DSTO_COMERCIAL || 0;
    addItems(row);

    swalSuccess("Item L asignado correctamente");
    return;
  }
  const msg = resp?.message || "No se pudo obtener un item L valido";
  (resp?.status ?? 0) >= 500 ? swalError(msg) : swalWarning(msg);
}

// proceso de clasificacion de item L
const dataItemLClasification = ref({
  item: {},
  index: 0,
});
// async function openModalSegmentationItemL(item, i) {
//   dataItemLClasification.value.item = item;
//   dataItemLClasification.value.index = i;
//   verModalConfiguracionItemLObj.show();
// }

function updateItemLClassification({ index, categoria, linea, clase }) {
  const item = form.value.items[index];
  if (!item) return;

  item.cod_categoria = categoria;
  item.cod_linea = linea;
  item.cod_clase = clase;
}

function selectItemLAlternative({ index, alternative }) {
  const item = form.value.items[index];
  if (!item || !alternative?.ART_DESCRIPCION) return;

  item.ART_DESCRIPCION = alternative.ART_DESCRIPCION;
  item.ART_DESCRIPCION_ORIGINAL = alternative.ART_DESCRIPCION;
}

function updateItemLAlternativeStatus({ index, message }) {
  const item = form.value.items[index];
  if (!item) return;

  item.resultado_configuracion_item_l = message;
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


    return {
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
        filterItemsL,
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
    };
}
