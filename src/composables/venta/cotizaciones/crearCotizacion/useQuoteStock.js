import { ref, computed, onScopeDispose, watch } from "vue";
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

    const stockError = ref('');
    let stockSequence = 0;
    let disposed = false;
    const owners = new WeakMap();
    let activeItems = [];
    watch(() => [form.value, form.value.cotizacion_id, selectedPointSaleCode.value], () => {
        stockSequence++;
        activeItems.forEach(item => {
            item.stockRowLoading = false;
            item.disableOpenModalStock = false;
            owners.delete(item);
        });
        activeItems = [];
        loadingStockMasivo.value = false;
        stockError.value = '';
    }, { flush: 'sync' });
    onScopeDispose(() => { disposed = true; stockSequence++; });

    async function refreshStock(batch) {
        const sequence = ++stockSequence;
        const currentForm = form.value;
        const warehouse = selectedPointSaleCode.value;
        const quoteId = currentForm.cotizacion_id;
        const items = (currentForm.items || []).filter(item => item.ART_TIPO_COMPRA !== 'L' && (!batch || !item.es_servicio_logistico));
        const snapshots = items.map(item => ({ item, code: item.ART_CODIGO, id: item.id_temp }));
        const isCurrent = () => !disposed && sequence === stockSequence && form.value === currentForm &&
            selectedPointSaleCode.value === warehouse && form.value.cotizacion_id === quoteId;
        const isCurrentItem = ({ item, code, id }) => isCurrent() && form.value.items.includes(item) &&
            item.ART_CODIGO === code && item.id_temp === id;
        activeItems = items;
        stockError.value = '';
        loadingStockMasivo.value = items.length > 0;
        items.forEach(item => {
            owners.set(item, sequence);
            item.stockRowLoading = true;
            item.disableOpenModalStock = true;
            item.stockListo = false;
        });
        try {
            if (!items.length) return;
            const payload = JSON.parse(JSON.stringify(items));
            const responses = batch
                ? [await updateStockItemsBatchAPI(payload, 'LOTE', quoteId)]
                : await Promise.all(payload.map(item => updateStockItemsByBatch(item, 'LOTE', quoteId)));
            snapshots.forEach((snapshot, index) => {
                if (!isCurrentItem(snapshot)) return;
                const response = responses[batch ? 0 : index];
                const data = batch ? response?.data?.[snapshot.id] : response?.data;
                if (!response?.ok || !data) {
                    stockError.value = 'No se pudo actualizar todo el stock. Reintenta la consulta.';
                    return;
                }
                snapshot.item.stock = data.stock || [];
                snapshot.item.ART_STOCK = data.ART_STOCK;
            });
            if (isCurrent()) calculateTotals();
        } catch {
            if (isCurrent()) stockError.value = 'No se pudo actualizar el stock. Reintenta la consulta.';
        } finally {
            items.forEach(item => {
                if (owners.get(item) !== sequence) return;
                item.stockRowLoading = false;
                item.disableOpenModalStock = false;
                owners.delete(item);
            });
            if (sequence === stockSequence) loadingStockMasivo.value = false;
        }
    }

    const updateStockByBatch = () => refreshStock(false);
    const updateStockByBatchV2 = () => refreshStock(true);

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
        stockError,
        updateStockByBatch,
        loadingUpdateStockItemsByBatch,
        updateStockItemsByBatch,
        updateStockByBatchV2,
        loadingUpdateStockBatch,
        updateStockItemsBatchAPI,
    };
}
