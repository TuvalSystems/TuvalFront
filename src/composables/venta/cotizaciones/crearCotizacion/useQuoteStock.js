import { ref, computed } from "vue";
import axiosClient from "@/axios";
import { swalWarning } from "@/functions/swal-alert";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";

export function useQuoteStock({
    isInt,
    form,
    calculateTotals,
    selectedPointSaleCode,
    run,
}) {
    //proceso de stock total de un articulo 
    const shouldShowStock = (row) => {
        const excludeTypes = ['L', 'SERV'];
        return !excludeTypes.includes(row.ART_TIPO_COMPRA);
    };



    //proceso de modal stock y peso 
    const dataStockItem = ref({
        items: [],
        index: 0,
        permiteDecimales: false
    });
    const isStockDisabled = (row) => {
        return row.disableOpenModalStock || row.stockRowLoading;
    }

    //procesos de modal verModalSelecionStockBodegas 
    const getStockClass = (stock) => {
        const s = Number.parseFloat(stock);
        if (s <= 0) return 'text-danger fw-bold';
        if (s < 10) return 'text-warning fw-bold';
        return 'text-success';
    };

    const localStocks = ref([]);
    const totalAsignado = computed(() => {
        return localStocks.value.reduce((acc, item) => acc + (Number(item.seleccionado) || 0), 0);
    });

    const validateInput = (item, isDecimal) => {
        const maxStock = Number.parseFloat(item.STO_ART_STOCK_DISPONIBLE || 0);
        if (item.seleccionado < 0) item.seleccionado = 0;
        if (item.seleccionado > maxStock) {
            item.seleccionado = maxStock;
            swalWarning(`Stock insuficiente.<br>Máximo disponible: <b>${maxStock}</b>`);
            return false;
        }
        if (!isDecimal && !isInt(item.seleccionado)) {
            item.error = true;
            item.seleccionado = 0;
            swalWarning('Ingresar un número entero');
            return false;
        }
        if (isDecimal && Number.isNaN(item.seleccionado)) {
            item.error = true;
            item.seleccionado = 0;
            swalWarning('Ingresar un número');
            return false;
        }
        item.error = false;
        return true;

    }


    /** proceso de actualizacion de stock por lote  */
    const loadingStockMasivo = ref(false);

    async function updateStockByBatch() {
        if (!form.value.items || form.value.items.length === 0) return;
        loadingStockMasivo.value = true;

        const actualizaciones = form.value.items.map(async (item, index) => {
            if (item.ART_TIPO_COMPRA === 'L') {
                item.stockRowLoading = false;
                return;
            }
            form.value.items[index].stockRowLoading = true;
            form.value.items[index].disableOpenModalStock = true;
            form.value.items[index].stockListo = false;
            const respLote = await updateStockItemsByBatch(item, 'LOTE', form.value.cotizacion_id);

            if (!respLote?.ok) {
                form.value.items[index].stockListo = false;
                form.value.items[index].stockRowLoading = false;
                form.value.items[index].disableOpenModalStock = false;
                console.error(`Error en item ${item.ART_CODIGO}:`, respLote?.message);
                return;
            }
            form.value.items[index].stock = respLote.data.stock || [];
            form.value.items[index].ART_STOCK = respLote.data.ART_STOCK; // Revisa mayúsculas/minúsculas

            form.value.items[index].stockRowLoading = false;
            form.value.items[index].disableOpenModalStock = false;
        });
        await Promise.all(actualizaciones);
        loadingStockMasivo.value = false;
        calculateTotals(); // Recalcular validaciones de la cotización

    }


    const loadingUpdateStockItemsByBatch = ref(false);
    async function updateStockItemsByBatch(item, tipo, cotizacionId) {
        const payloadBatch = {
            'articulo': item,
            'bodega': selectedPointSaleCode.value,
            'tipo': tipo,
            'cotizacion_id': cotizacionId,
        }
        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.GET_ITEM_STOCK_BY_WAREHOUSE, payloadBatch), {
            loadingRef: loadingUpdateStockItemsByBatch,
            onError: (err) => {
                console.log(err, 'updateStockItemsByBatch');
            },
            // successMessage: 'Proceso realizado exitosamente',
        })
    }



    async function updateStockByBatchV2() {
        if (!form.value.items || form.value.items.length === 0) return;

        const itemsParaProcesar = form.value.items.filter(item => item.ART_TIPO_COMPRA !== 'L' && !item.es_servicio_logistico);
        if (itemsParaProcesar.length === 0) return;
        loadingStockMasivo.value = true;

        itemsParaProcesar.forEach(item => {
            item.stockRowLoading = true;
            item.disableOpenModalStock = true;
            item.stockListo = false;
        });
        const response = await updateStockItemsBatchAPI(itemsParaProcesar, 'LOTE', form.value.cotizacion_id);

        if (response?.ok) {
            const resultados = response.data;
            form.value.items.forEach(item => {
                if (resultados[item.id_temp]) {
                    const data = resultados[item.id_temp];
                    item.stock = data.stock || [];
                    item.ART_STOCK = data.ART_STOCK;
                    // item.stockListo = true;
                }
                item.stockRowLoading = false;
                item.disableOpenModalStock = false;
            });
        } else {
            itemsParaProcesar.forEach(item => {
                item.stockRowLoading = false;
                item.disableOpenModalStock = false;
                // item.stockListo = false;
            });
            console.error("Error en la petición por lote:", response?.message);
        }

        loadingStockMasivo.value = false;
        calculateTotals();

    }

    const loadingUpdateStockBatch = ref(false);
    async function updateStockItemsBatchAPI(item, tipo, cotizacionId) {
        const payloadBatch = {
            'articulos': item,
            'bodega': selectedPointSaleCode.value,
            'tipo': tipo,
            'cotizacion_id': cotizacionId,
        }
        return await run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.GET_ITEM_STOCK_BY_WAREHOUSE_V2, payloadBatch), {
            loadingRef: loadingUpdateStockBatch,
            onError: (err) => {
                console.log(err, 'updateStockItemsByBatch');
            }
        });
    }




    return {
        shouldShowStock,
        dataStockItem,
        isStockDisabled,
        getStockClass,
        localStocks,
        totalAsignado,
        validateInput,
        loadingStockMasivo,
        updateStockByBatch,
        loadingUpdateStockItemsByBatch,
        updateStockItemsByBatch,
        updateStockByBatchV2,
        loadingUpdateStockBatch,
        updateStockItemsBatchAPI,
    };
}
