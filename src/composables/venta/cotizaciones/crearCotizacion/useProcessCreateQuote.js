import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, watch, computed, nextTick } from "vue";
import { swalWarning } from "@/functions/swal-alert";
import { useStore } from 'vuex'
import { watchDebounced } from '@vueuse/core';
import { useRoute } from "vue-router";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";

function redondear(num, decimales = 2) {
    const factor = Math.pow(10, decimales);
    return Math.round((num + Number.EPSILON) * factor) / factor;
}
const getInitialState = () => ({
    //variables nuevas para manejo de varias cotizaciones
    created_temp_at: Date.now(),
    draft_id: null,
    nota_temporal: '',

    cotizacion_id: null,
    cotizacion_codigo: null,
    mode: 'crear',
    bodega_facturacion: null,
    cliente: null,
    segmento: null,
    punto_venta_id: null,
    //variables de fecha y direccion de facturacion
    tipo_entrega: 'retiro',  //despacho
    fecha_entrega: null,
    direccion_facturacion_id: null,
    direccion_entrega_id: null,

    // variables de facturacion posterior (Booleanos)
    factura_posterior_despacho: false,
    factura_a_demanda: false,
    factura_siguiente_mes: false,
    alerta_facturar: '',
    pregunta_facturar: false,
    facturar_ahora: false,

    //forma de pago 
    condicion_pago_id: null,
    condicion_pago_original_id: null,
    forma_pago_id: null,


    //descuentos
    descuento_articulo: 0,
    descuento_original: 0,

    //notas
    nota_interna: '',
    nota_cliente: '',
    nota_operaciones: '',
    orden_de_compra: '',


    //registro copia
    registro_copia: null,

    //calculos
    subtotal: 0,
    peso: 0,
    descuento: 0,
    iva: 0,
    total: 0,

    //modificador global
    modificador_global: 0,
    //items de cotizacion
    items: [],

    //imagenes de operaciones
    imagenesoperaciones: [],
    origen: '',

    //pdf
    documentos_pdf: []

});
export function useProcessCreateQuote(draftId = 'default') {
    const store = useStore();
    const ptoVtaSelect = computed(() => store.state.puntodeventaselect);
    const { run } = useApiAction();
    const today = new Date();
    const route = useRoute();

    // nuevo proceso para almacenar en bd 
    const form = ref(getInitialState());
    form.value.draft_id = draftId;

    const loadingGetCurrentDraft = ref(false);
    async function fetchCurrentDraft() {
        const idToFetch = route.query.draft || draftId;
        isRecoveringQuote.value = true;
        return await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.GET, { draft_id: idToFetch }), {
            loadingRef: loadingGetCurrentDraft,
            onSuccess: (info) => {
                const rawData = info.data;
                const savedForm = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
                const nextState = {
                    ...getInitialState(),
                    ...(savedForm || {}),
                    draft_id: idToFetch,
                    imagenesoperaciones: [],
                    documentos_pdf: []
                };
                if (!nextState.items) nextState.items = [];
                if (!nextState.orden_de_compra) nextState.orden_de_compra = '';
                form.value = nextState;
                nextTick(() => {
                    calculateTotals();
                    setTimeout(() => {
                        isRecoveringQuote.value = false;
                    }, 500);
                });
            },
            onError: (err) => {
                console.log("Iniciando borrador nuevo en blanco", err);
                const emptyState = getInitialState();
                emptyState.draft_id = idToFetch;
                form.value = emptyState;
                isRecoveringQuote.value = false;
            }
        })
    }


    const loadingSyncDraft = ref(false);
    watchDebounced(
        () => form.value, async (newVal) => {
            if (!newVal.cliente && newVal.items.length === 0) {
                return;
            }
            const currentId = newVal.draft_id;
            if (!currentId || currentId === 'undefined') return;
            const { imagenesoperaciones, documentos_pdf, ...cleanData } = newVal;
            return await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.SYNC, {
                draft_id: currentId,
                pto_vta_id: ptoVtaSelect.value,
                data: {
                    ...cleanData,
                    imagenesoperaciones: [], // Aseguramos que viajen vacíos
                    documentos_pdf: []      // Aseguramos que viajen vacíos
                }
            }), {
                loadingRef: loadingSyncDraft
            })
        }, { deep: true, debounce: 1000 });


    const loadingListDrafts = ref(false);
    async function getActiveDrafts() {
        return await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.LIST, { pto_vta_id: ptoVtaSelect.value }), {
            loadingRef: loadingListDrafts
        });
    }

    const loadingRemoveDraft = ref(false);
    async function removeDraft(draftIdToRemove) {
        return await run(() => axiosClient.post(QUOTE_API_ROUTES.DRAFTS.DELETE, { draft_id: draftIdToRemove }), {
            loadingRef: loadingRemoveDraft,
            onError: (err) => {
                console.error("Error al eliminar borrador:", err);
            }
        });
    }








    //validadores maximos para notas
    const maxLength = 200;
    const maxLengthNote = 300;
    const maxOrder = 20;



    async function clearForm(uploadedFilesRef = null, forceDeleteBD = false, forceResetDraft = false, uploadedPdfsRef = null) {
        if (forceDeleteBD) {
            const idToDelete = form.value.draft_id || route.query.draft;
            if (idToDelete) {
                await removeDraft(idToDelete);
            }
        }
        form.value = getInitialState();
        if (forceResetDraft) {
            form.value.draft_id = null;
        } else {
            form.value.draft_id = route.query.draft || null;
        }
        if (ptoVtaSelect.value) {
            form.value.punto_venta_id = ptoVtaSelect.value;
        }
        if (uploadedFilesRef) {
            uploadedFilesRef.value = [];
        }
        if (uploadedPdfsRef) {
            uploadedPdfsRef.value = [];
        }
        nextTick(() => calculateTotals());
    }


    //watch para limpiar campos cuando cambia el tipo de entrega
    watch(
        () => form.value.tipo_entrega,
        (newVal) => {
            if (isRecoveringQuote.value) return;
            if (newVal === 'retiro') {
                form.value.direccion_entrega_id = form.value.direccion_facturacion_id;
                form.value.fecha_entrega = null;
            } else if (newVal === 'despacho') {
                form.value.direccion_entrega_id = form.value.direccion_facturacion_id;
                const hoy = new Date();
                const year = hoy.getFullYear();
                const month = String(hoy.getMonth() + 1).padStart(2, '0');
                const day = String(hoy.getDate()).padStart(2, '0');

                form.value.fecha_entrega = `${year}-${month}-${day}`;
            }
        }
    );


    //validador de reglas de facturacion 
    function validateBillingRules() {
        form.value.factura_posterior_despacho = false;
        form.value.factura_a_demanda = false;
        form.value.factura_siguiente_mes = false;
        form.value.pregunta_facturar = false;
        form.value.alerta_facturar = '';

        const client = form.value.cliente;
        if (!client) return;

        const isPostDispatch = client.CLI_FACTURA_POSTERIOR_AL_DESPACHO === 'SI';
        const maxBillingDay = client.CLI_DIA_MAXIMO_MES_FACTURACION;
        const currentDay = today.getDate();

        if (isPostDispatch) {
            if (maxBillingDay === 1) {
                form.value.factura_posterior_despacho = true;
                form.value.factura_a_demanda = true;
                form.value.alerta_facturar = 'Factura a demanda posterior al despacho';
                return;
            }

            if (currentDay <= maxBillingDay) {
                form.value.factura_posterior_despacho = true;
                return;
            }
            form.value.factura_posterior_despacho = true;
            form.value.pregunta_facturar = true;
            form.value.factura_siguiente_mes = true;
        }
    }


    watch(
        () => form.value.cliente,
        (newClient) => {
            if (!newClient) {
                form.value.factura_posterior_despacho = false;
                form.value.alerta_facturar = '';
                return;
            }
            validateBillingRules();
        },
        { deep: true, immediate: true }
    );


    //proceso de agregar items a mi form-items y me crea el registro en las tablas temporales
    const addItems = async (rawItem) => {

        if (rawItem.ART_CLASE_ARTICULO === 'VTA-SERV') {
            rawItem.ART_TIPO_COMPRA = 'SERV'; //id temporal para servicios 
        }

        if (rawItem.ART_CLASE_ARTICULO === 'VTA-SERV-L') {
            rawItem.ART_TIPO_COMPRA = 'L'; //id temporal para servicios 
        }
        const artValor = Number.parseFloat(rawItem.ART_VALOR || 0);
        const artValorOriginal = Number.parseFloat(rawItem.ART_VALOR_ORIGINAL || 0);
        const itemEstandarizado = {
            ...rawItem,
            id_temp: `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`, //id temporal  
            ART_CANTIDAD: 0,
            ART_VALOR: artValor,
            ART_VALOR_ORIGINAL: artValorOriginal,
            ART_IVA: 0,
            ART_DESCUENTO: 0,
            orden: form.value.items.length + 1,
            disable_delete: false,
            modificador: 0,
            imagenes: rawItem.imagenes || [],
            stock: (rawItem.stock || []).map(bodega => ({
                ...bodega,
                seleccionado: 0,
                error: false,
            })),
            stockListo: (rawItem.ART_TIPO_COMPRA === 'L' || rawItem.ART_TIPO_COMPRA === 'SERV'),
            cambiar_descripcion: false,
            cambiar_valor: false,
            cambiar_descuento: false,
            errorCantidad: false,
            errorPrecio: false,
            errorDescripcion: false,
            stockRowLoading: false,
            disableOpenModalStock: false,
            CHECK_ALTERNATIVO: false,
            proveedores: [],
            proveedores_listo: false,
            descuento_temporal: 0,
            validador_l : false,
        }
        form.value.items.push(itemEstandarizado);
        calculateTotals();

    }

    const removeItem = async (i) => {
        form.value.items[i].disable_delete = true;
        form.value.items.splice(i, 1);
        await nextTick();
        calculateTotals();
    }



    //proceso de cambio de descripcion de item 
    const getDescriptionClass = (ele) => {
        const descActual = (ele.ART_DESCRIPCION || '').toString().trim();
        const descOriginal = (ele.ART_DESCRIPCION_ORIGINAL || '').toString().trim();
        const isModified = descActual !== descOriginal;

        const isTypeL = (ele.ART_TIPO_COMPRA || '').trim() === 'L';
        if ((isModified && !isTypeL) || (!isModified && isTypeL)) {
            return 'text-danger fw-bold';
        }
        return 'text-primary';
    }

    const isDescriptionEditable = (i) => {
        return form.value.items[i].cambiar_descripcion === true
    }

    const enableEditModeDescription = (i) => {
        form.value.items[i].cambiar_descripcion = true
    }


    async function updateDescripcion(event, row, i) {
        if (event.target.value.length < 5) {
            form.value.items[i].errorDescripcion = true;
            swalWarning('La descripcion debe tener al menos 5 caracteres');
            return;
        }
        form.value.items[i].errorDescripcion = false;
        form.value.items[i].ART_DESCRIPCION = event.target.value;
        form.value.items[i].cambiar_descripcion = false;

    }


    //proceso de items alternativos
    //proceso para listado de items alternativos 
    const descripcionAlternativa = ref('');
    const listItemsAlternatives = ref([]);
    const loadingListAlternative = ref(false);
    async function getAlternativeDescriptions(artCode) {
        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.LIST_ALTERNATIVE_ITEMS, { item: artCode }), {
            loadingRef: loadingListAlternative,
            onSuccess: (res) => {
                listItemsAlternatives.value = res;
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }

    async function clearSelectionItemalternative() {
        listItemsAlternatives.value = [];
        descripcionAlternativa.value = '';
    }

    async function updateCheckAlternative(event, element, i) {
        let valEvent = event.target.checked ? 1 : 0;
        form.value.items[i].CHECK_ALTERNATIVO = valEvent;

    }

    async function updateDescriptionsForCheckAlternative(descripcion, i) {
        form.value.items[i].ART_DESCRIPCION = descripcion;
        form.value.items[i].ART_DESCRIPCION_ORIGINAL = descripcion;
        form.value.items[i].cambiar_descripcion = false;
    }




    //proceso para manejo de cantidades

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

        const formattedQty = formatQty(qty, item);
        form.value.items[i].ART_CANTIDAD = formattedQty;
        event.target.value = formattedQty;
        form.value.items[i].errorCantidad = false;
        calculateTotals();
    }

    const validateQtyBeforeUpdate = async (qty, row) => {
        const allowsDecimals = row.ART_DECIMAL_CANTIDAD > 0;
        if (qty < 0) return { ok: false, message: 'La cantidad no puede ser negativa' };
        if (allowsDecimals && Number.isNaN(qty)) {
            return { ok: false, message: 'La cantidad debe ser un número' };
        }
        if (!allowsDecimals && !isInt(qty)) {
            return { ok: false, message: 'La cantidad debe ser un número entero' };
        }
        return { ok: true, code: 0 };
    }
    const formatQty = (qty, row) => {
        const valor = Number.parseFloat(qty) || 0;
        if (row.ART_DECIMAL_CANTIDAD > 0) {
            return valor.toFixed(row.ART_DECIMAL_CANTIDAD);
        }
        return Math.trunc(valor).toString();
    }

    const isInt = (value) => {
        const x = Number.parseFloat(value);
        return !Number.isNaN(value) && (x | 0) === x;
    }




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
            };
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
            'bodega': ptoVtaSelect.value,
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

        const itemsParaProcesar = form.value.items.filter(item => item.ART_TIPO_COMPRA !== 'L');
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
            'bodega': ptoVtaSelect.value,
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



    const dataPesoItem = ref({ item: {}, index: 0 });


    // proceso para apertura de modal de proveedores

    const isItemL = (row) => row.ART_TIPO_COMPRA === 'L'


    const initialDataModalProvider = () => ({
        proveedores: [],
        index: 0,
        item: {}
    });
    const dataModalProviders = ref(initialDataModalProvider());
    const clearDataModalProviders = () => {
        dataModalProviders.value = initialDataModalProvider();
    }
    //obtener margen item L 
    const loadingMarginItemL = ref(false);
    const margenItemL = ref(null);

    async function getMargenFotItemL(artCode) {
        if (!artCode) return;
        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.GET_ITEM_MARGIN, { articulo: artCode }), {
            loadingRef: loadingMarginItemL,
            onSuccess: (res) => {
                margenItemL.value = res;
            },
            onError: (err) => {
                console.error(err);
                // Opcional: margenItemL.value = { DATOS_ITEMS_L_MARGEN: 16 }; // Fallback en error
            },
        });
    }
    //obtener el margen actualizado 
    const margenPorDefecto = computed(() =>
        Number.parseFloat(margenItemL.value?.DATOS_ITEMS_L_MARGEN ?? 16)
    );

    /** proeso de agregar proveedores */
    const itemsProvider = ref([]);

    function eliminarProveedor(index) {
        itemsProvider.value.splice(index, 1);
    }


    const validateProviderBeforeStore = () => {
        for (const prov of itemsProvider.value) {
            if (!prov.DESCRIPCION_ARTICULO || prov.DESCRIPCION_ARTICULO === "Item L descripción por completar") {
                swalWarning('Actualice la descripción del item L');
                return false;
            }

            if (
                prov.CANTIDAD === '' || prov.CANTIDAD === null ||
                prov.COSTO_UNITARIO === '' || prov.COSTO_UNITARIO === null ||
                !prov.FECHA_ENTREGA || // Cubre null y ''
                !prov.ID_PROVEEDOR ||  // Cubre null y ''
                prov.MARGEN === '' || prov.MARGEN === null
            ) {
                swalWarning('Todos los campos deben ser llenados');
                return false;
            }

        }
        return true;
    }


    /**
     *  
     * 
     *    validacion global de stocks 
     */

    //variables de controles globales para bloque de guardado 
    const isQuantityValid = ref(true);
    const isPriceValid = ref(true);
    const isDescriptionLValid = ref(true);
    const calculateTotals = () => {
        let tempSubtotal = 0;
        let tempDescuento = 0;
        let tempIva = 0;
        let tempPeso = 0;


        //se reinician las variables
        isQuantityValid.value = true;
        isPriceValid.value = true;
        isDescriptionLValid.value = true;

        form.value.items.forEach((art) => {
            const tipoCompra = (art.ART_TIPO_COMPRA || '').trim().toUpperCase();
            if (tipoCompra === 'L' && (art.ART_DESCRIPCION == art.ART_DESCRIPCION_ORIGINAL)) {
                art.errorDescripcion = true;
                isDescriptionLValid.value = false;
            }
            if (tipoCompra === 'L') {
                art.ART_VALOR = redondear(Number.parseFloat(art.ART_VALOR) + 0.000001, 4);

            } else {
                let valorUnitario = Number.parseFloat(art.ART_VALOR_ORIGINAL || 0);
                const modificador = Number.parseFloat(art.modificador || 0);
                let precioCalculado = valorUnitario + ((valorUnitario * modificador) / 100);
                const diferencia = Math.abs(precioCalculado - Number.parseFloat(art.ART_VALOR || 0));
                if (art.cambiar_valor) {
                        
                } else {
                    if (diferencia < 0.001) {
                        art.ART_VALOR = redondear(Number.parseFloat(art.ART_VALOR), 4);
                    } else {
                        art.ART_VALOR = redondear(precioCalculado, 4);
                    }
                }

            }

            const cantidad = Number.parseFloat(art.ART_CANTIDAD) || 0;
            if (cantidad <= 0) {
                art.errorCantidad = true;
                isQuantityValid.value = false;
            } else {
                art.errorCantidad = false;
            }

            if (art.ART_VALOR === 0) {
                art.errorPrecio = true;
                isPriceValid.value = false;
            }
            // --- Cálculos Matemáticos (Todo Numérico) ---
            const precioParaCalculo = art.ART_VALOR;
            const descuentoPorcentaje = Number.parseFloat(art.descuento) || 0;

            //calcular descuento unitario
            const descuentoUnitario = precioParaCalculo * (descuentoPorcentaje / 100);
            art.ART_DESCUENTO = redondear(descuentoUnitario + 0.000001, 4); //se aplico por bloque de seguridad

            //calcular SUBTOTAL de la linea (precio - descuento) * cantidad
            const precioConDescuento = precioParaCalculo - descuentoUnitario;
            const subtotalLinea = redondear((precioConDescuento * cantidad) + 0.000001, 2);

            //guardamos el valor numerico crudo para calculos
            // art.subTotalRaw = subtotalLinea;
            art.subtotal = subtotalLinea;

            //Acumuladores Globales
            tempSubtotal += subtotalLinea;
            tempDescuento += (descuentoUnitario * cantidad);

            //calculo del IVA
            const ivaPorcentaje = Number.parseFloat(art.ART_IMP_VTA) || 0;
            const ivaLinea = subtotalLinea * (ivaPorcentaje / 100);

            art.ART_IVA = redondear(ivaLinea + 0.000001, 2); //se aplico por bloque de seguridad
            tempIva += ivaLinea;
            //calculo del peso
            tempPeso += (Number.parseFloat(art.ART_PESO) || 0) * cantidad;
        });
        form.value.subtotal = redondear(tempSubtotal + 0.000001, 2);
        form.value.descuento = redondear(tempDescuento + 0.000001, 2);
        form.value.iva = redondear(tempIva + 0.000001, 2);
        form.value.peso = redondear(tempPeso, 2);

        // Total General = Subtotal + IVA
        form.value.total = redondear((form.value.subtotal + form.value.iva) + 0.000001, 2);
        validateAllProvidersStock();
        verifyStockConsistency();
    }


    const verifyStockConsistency = (silent = false) => {
        let isValid = true;
        const globalStockUsage = {};

        //primer paso para mapear el uso de totales por bodega/articulo
        //Y cacular cuanto tiene asignado cada fila individualmente
        form.value.items.forEach((item) => {
            if (item.ART_TIPO_COMPRA === 'L' || item.ART_TIPO_COMPRA === 'SERV') {
                item.stockListo = true; //los servicios y l siempre estan listos
                return;
            }
            let currentItemQtyAsigned = 0;
            if (item.stock && item.stock.length > 0) {
                item.stock.forEach((bd) => {
                    const disponible = Number.parseFloat(bd.STO_ART_STOCK_DISPONIBLE || 0);

                    const key = `${item.ART_CODIGO}_${bd.STO_ART_BODEGA}`;
                    if (!globalStockUsage[key]) {
                        globalStockUsage[key] = { used: 0, available: disponible, artCode: item.ART_CODIGO, bodegaName: bd.STO_ART_BODEGA };
                    }
                    // const stockRestante = globalStockUsage[key].available - globalStockUsage[key].used;
                    // if (stockRestante <= 0) {
                    //     bd.seleccionado = 0;
                    // }
                    const seleccionado = Number.parseFloat(bd.seleccionado || 0);
                    currentItemQtyAsigned += seleccionado;
                    globalStockUsage[key].used += seleccionado;
                });
            }
            item.tempQtyAsigned = currentItemQtyAsigned;
        });

        //Segundo paso, valuidar si la suma global excede el disponible
        let globalOverstock = false;
        for (const key in globalStockUsage) {
            const data = globalStockUsage[key];
            const totalUsado = Number(data.used.toFixed(4));
            const totalDisponible = Number(data.available.toFixed(4));
            if (totalUsado > totalDisponible) {
                if (!silent) {
                    swalWarning(`Stock insuficiente (Total todas las filas).<br>Artículo: ${data.artCode} en ${data.bodegaName}<br>Digitado: <b>${data.used}</b> | Disponible: <b>${data.available}</b>`);
                }
                globalOverstock = true;
                isValid = false;
                // if (!silent) return false; // No hacemos return aquí para que el Paso 3 pueda limpiar los campos
            }
        }

        //Tercer paso determina stockListo de cada Fila
        form.value.items.forEach((item) => {
            if (item.ART_TIPO_COMPRA === 'L' || item.ART_TIPO_COMPRA === 'SERV') {
                item.stockListo = true;
                return;
            }
            const qtyRequired = Number.parseFloat(item.ART_CANTIDAD || 0);
            const qtyAsigned = item.tempQtyAsigned || 0;
            const matchesRequired = qtyAsigned.toFixed(item.ART_DECIMAL_CANTIDAD) === qtyRequired.toFixed(item.ART_DECIMAL_CANTIDAD);

            let itemHasError = false;
            if (globalOverstock && item.stock) {
                itemHasError = item.stock.some(bd => {
                    const key = `${item.ART_CODIGO}_${bd.STO_ART_BODEGA}`;
                    const infoGlobal = globalStockUsage[key];
                    if (infoGlobal && infoGlobal.used > infoGlobal.available) {
                    if (Number(bd.seleccionado) > 0) {
                        bd.seleccionado = 0;
                        itemHasError = true;
                    }
                }
                });
            }

          if (qtyRequired > 0 && matchesRequired && !itemHasError && !globalOverstock) {
                item.stockListo = true;
            } else {
                item.stockListo = false;
                isValid = false;
            }
            delete item.tempQtyAsigned;
        });
        return isValid;
    }


    const isProvidersValidationOk = ref(true);
    const validateAllProvidersStock = () => {
        isProvidersValidationOk.value = true;
        let hayErrores = false;

        form.value.items.forEach(item => {
            if (item.ART_TIPO_COMPRA === 'L') {
                const requerido = Number.parseFloat(item.ART_CANTIDAD);

                const proveedores = item.proveedores || [];
                const asignado = proveedores.reduce((acc, prov) => {
                    return acc + Number.parseFloat(prov.CANTIDAD);
                }, 0);
                const diferencia = Math.abs(requerido - asignado);
                const estaCompleto = diferencia <= 0.0001;
                item.proveedores_listo = estaCompleto;
                if (!estaCompleto) {
                    hayErrores = true;
                }
            }
        });
        if (hayErrores) {
            isProvidersValidationOk.value = false;
            return false;
        }
        return true;
    }




    /*
     *
     *  proceso de calculo de modificador y precio 
     */

    const calculatePriceFromModifier = (originalPrice, modifier) => {
        if (!originalPrice) return 0;
        const original = Number(originalPrice);
        const mod = Number(modifier);
        let factor = 1 + (mod / 100);
        return original * factor;
    }
    const calculateRowModifier = (row, newPrice) => {
        if (row.ART_TIPO_COMPRA === 'L') {
            return 0;
        }
        return (((newPrice / row.ART_VALOR_ORIGINAL) - 1) * (-100));
    }


    const isPriceEditable = (row) => {
        return row.cambiar_valor === true;
    }

    const enableEditPrice = async (element, i) => {
        element.valor_temporal = element.ART_VALOR;
        element.cambiar_valor = true;

        await nextTick();
        const input = document.getElementById(`input-precio-${i}`);
        if (input) input.focus();
    }
    const applyModifyPrice = (row) => {
        return row.ART_VALOR != row.ART_VALOR_ORIGINAL && row.ART_TIPO_COMPRA != 'L';
    }

    const exitEditPrice = (row) => {
        row.ART_VALOR = row.valor_temporal;
        if (row.ART_TIPO_COMPRA === 'l') {
            row.ART_VALOR_ORIGINAL = row.valor_temporal
        }
        row.cambiar_valor = false;
    }


    /**
     *  proceso de modificacion de descuento 
     */

    const isEditDiscount = (row) => {
        return row.cambiar_descuento === true;
    }

    const enableEditDiscount = async (element, i) => {
        element.descuento_temporal = element.descuento;
        element.cambiar_descuento = true;

        await nextTick();
        const input = document.getElementById(`input-descuento-${i}`);
        if (input) input.focus();
    }
    const applyModifyDiscount = (row) => {
        return row.descuento != row.descuento_original;
    }

    const exitEditDiscount = (row) => {
        row.descuento = row.descuento_temporal;
        row.cambiar_descuento = false;
    }

    /** actualizacion de descuento global  */
    const isEditingGlobalDiscount = ref(false);
    const inputGlobalDiscountRef = ref(null);
    const enableGlobalDiscountEdit = async () => {
        isEditingGlobalDiscount.value = true;
        const inputElement = document.getElementById('input-global-discount');
        await nextTick();
        if (inputElement) {
            inputElement.focus();
            inputElement.select();
        }
    }

    const cancelGlobalDiscountEdit = () => {
        isEditingGlobalDiscount.value = false;
    };

    async function updateGlobalDiscount(event) {
        const nuevoValorRaw = event.target.value;
        if (nuevoValorRaw === '' || Number.isNaN(nuevoValorRaw)) {
            swalWarning('Ingrese un valor numérico válido para el descuento global.');
            isEditingGlobalDiscount.value = false;
            return;
        }

        const nuevoDescuento = Number.parseFloat(nuevoValorRaw);
        form.value.descuento_articulo = nuevoDescuento;
        const updatePromiseDiscount = form.value.items.map(async (item) => {
            if (item.descuento === nuevoDescuento) return;
            item.descuento = nuevoDescuento;
        });

        try {
            await Promise.all(updatePromiseDiscount);
        } catch (err) {
            console.error('Error al actualizar el descuento global:', err);
        }
        isEditingGlobalDiscount.value = false;
        calculateTotals();
    }




    /*** 
     * 
     * 
     * proceso de creacion de cotizacion  
     * 
     * 
     * */

    const loadingCreateQuotation = ref(false);
    async function createQuote(mode) {
        if (!form.value.cliente) {
            swalWarning('Debe seleccionar un cliente.');
            return;
        }
        if (!form.value.items.length) {
            swalWarning('Debe agregar al menos un artículo.');
            return;
        }
        const formData = new FormData();

        //datos de la cotizacion 
        if (form.value.cotizacion_id) {
            formData.append('cotizacion_id', form.value.cotizacion_id);
        }
        formData.append('mode', mode);
        //datos del cliente
        formData.append('cliente_id', form.value.cliente.id);
        formData.append('ruc', form.value.cliente.CLI_RUC);
        formData.append('razon_social', form.value.cliente.CLI_RAZON_SOCIAL);
        formData.append('correo_electronico_sri', form.value.cliente.CLI_CORREO_ELECT_SRI);
        formData.append('vendedor_id', form.value.cliente.gpvendedor.VEND_ID);
        formData.append('vendedor_nombres', form.value.cliente.gpvendedor.VEND_NOMBRES);
        formData.append('vendedor_apellidos', form.value.cliente.gpvendedor.VEND_APELLIDOS);

        //variables de punto de venta y bodega de facturacion
        formData.append('punto_venta_id', form.value.punto_venta_id);
        formData.append('bodega_facturacion', form.value.bodega_facturacion);

        //variables de fecha y direccion de facturacion
        formData.append('tipo_entrega', form.value.tipo_entrega); //despacho o retiro
        formData.append('fecha_entrega', form.value.fecha_entrega);
        formData.append('direccion_facturacion_id', form.value.direccion_facturacion_id);
        formData.append('direccion_entrega_id', form.value.direccion_entrega_id);
        // variables de facturacion posterior (Booleanos)
        formData.append('factura_posterior_despacho', form.value.factura_posterior_despacho);
        formData.append('factura_a_demanda', form.value.factura_a_demanda);
        formData.append('factura_siguiente_mes', form.value.factura_siguiente_mes);


        //condiciones y formas de pago 
        formData.append('condicion_pago_id', form.value.condicion_pago_id);
        formData.append('condicion_pago_original_id', form.value.condicion_pago_original_id);
        formData.append('forma_pago_id', form.value.forma_pago_id);

        //descuentos de articulo y descuento original
        formData.append('descuento_articulo', form.value.descuento_articulo);
        formData.append('descuento_original', form.value.descuento_original);

        //notas
        formData.append('nota_interna', form.value.nota_interna);
        formData.append('nota_cliente', form.value.nota_cliente);
        formData.append('nota_operaciones', form.value.nota_operaciones);

        //orden de compra
        formData.append('orden_de_compra', form.value.orden_de_compra);

        //registro copia
        formData.append('registro_copia', form.value.registro_copia);

        //calculos
        formData.append('subtotal', form.value.subtotal);
        formData.append('peso', form.value.peso);
        formData.append('descuento', form.value.descuento);
        formData.append('iva', form.value.iva);
        formData.append('total', form.value.total);

        //modificador global
        formData.append('modificador_global', form.value.modificador_global);

        //items de cotizacion
        formData.append('items', JSON.stringify(form.value.items));
        formData.append('origen', form.value.origen || 'cotizacion');
        //imagenes de operaciones
        if (form.value.imagenesoperaciones && form.value.imagenesoperaciones.length > 0) {
            form.value.imagenesoperaciones.forEach((item, index) => {
                let archivoReal = (item && item.file) ? item.file : item;
                if (archivoReal instanceof File || archivoReal instanceof Blob) {
                    let nombre = archivoReal.name || `imagen_${index}.jpg`;
                    const archivoLimpio = new File([archivoReal], nombre, {
                        type: archivoReal.type || 'image/png', // Usa el tipo real o png por defecto
                        lastModified: new Date().getTime()
                    });


                    formData.append('imagenes_nuevas[]', archivoLimpio);

                }
                else if (typeof item === 'string') {
                    formData.append('imagenes_existentes[]', item);
                }
                else {
                    console.log('Objeto ignorado al guardar (no es archivo ni url):', item);
                }
            });
        }


        //archivos pdf
        if (form.value.documentos_pdf && form.value.documentos_pdf.length > 0) {
            form.value.documentos_pdf.forEach((item, index) => {
                let archivoReal = (item && item.file) ? item.file : item;
                if (archivoReal instanceof File || archivoReal instanceof Blob) {
                    let nombre = archivoReal.name || `documento_${index}.pdf`;
                    const archivoLimpio = new File([archivoReal], nombre, {
                        type: archivoReal.type || 'application/pdf',
                        lastModified: new Date().getTime()
                    });

                    formData.append('pdfs_nuevos[]', archivoLimpio);
                } else if (typeof item === 'string') {
                    formData.append('pdfs_existentes[]', item);
                } else {
                    console.log('Objeto PDF ignorado al guardar:', item);
                }
            });
        }
        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.CREATE_QUOTE, formData), {
            loadingRef: loadingCreateQuotation,
            onError: (error) => {
                console.error('Error al crear la cotización:', error);
            },
        });

    }




    /*** proceso validador para verificar que se puede guardar esta cotizacion y pedido  */

    const isQuoteValid = computed(() => {
        if (!form.value.items || form.value.items.length === 0) return false;

        return form.value.items.every((item) => {
            const tipoCompra = (item.ART_TIPO_COMPRA || '').trim().toUpperCase();

            // A. Validación de Cantidad
            const cantidad = Number.parseFloat(item.ART_CANTIDAD || 0);
            if (cantidad <= 0 || item.errorCantidad) return false;

            // B. Validación de Precio (Costo)
            const precio = Number.parseFloat(item.ART_VALOR || 0);
            if (precio <= 0 && tipoCompra !== 'SERV') return false;

            if (tipoCompra === 'L') {
                const descActual = (item.ART_DESCRIPCION || '').toString().trim();
                const descOriginal = (item.ART_DESCRIPCION_ORIGINAL || '').toString().trim();
                if (descActual === descOriginal || descActual.length < 5) return false;
            }
            if (tipoCompra === 'L') {
                if (!item.proveedores_listo) return false;
            } else if (tipoCompra !== 'SERV') {
                // C. Validación de Stock para tipos que no son 'L' ni 'SERV'
                if (!item.stockListo) return false;
            }

            return true;
        });

    });


    /***
     * 
     *  PROCESO DE RECUPERAR COTIZACION 
     * 
     */
    const isRecoveringQuote = ref(false); // Variable para controlar la recuperación y manejarla en los watchs
    const loadingGetQuoteData = ref(false);

    async function fetchAndFillQuotation(quoteId, uploadedFilesRef, uploadedPdfsRef) {
        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.RECOVER_QUOTE, { id: quoteId }), {
            loadingRef: loadingGetQuoteData,
            onSuccess: async (res) => {
                isRecoveringQuote.value = true;
                const initialState = getInitialState();
                Object.assign(form.value, initialState);
                form.value.items = [];
                form.value.imagenesoperaciones = [];
                const { cotizacion, cliente, items, segmento, imagenesOperaciones, documentosPdf, mode } = res;

                // clearForm(uploadedFilesRef);

                //cargamos el cliente y los datos de identificacion 
                form.value.cliente = cliente;
                form.value.segmento = segmento;
                form.value.cotizacion_id = cotizacion.id;
                form.value.cotizacion_codigo = cotizacion.cotizacion;
                form.value.mode = mode;

                form.value.draft_id = route.query.draft;
                // 3. Mapeamos los Items (inyectando estados de UI necesarios)
                form.value.items = items.map(item => ({
                    ...item,
                    id_temp: item.id ? `db-${item.id}` : `temp-${Date.now()}-${Math.random()}`,
                    ART_CANTIDAD: Number(item.ART_CANTIDAD).toFixed(Number(item.ART_DECIMAL_CANTIDAD)),
                    ART_STOCK: Number(item.ART_STOCK || 0).toFixed(Number(item.ART_DECIMAL_CANTIDAD)),
                    stockListo: false, // Al ser recuperado, asumimos validación previa
                    cambiar_descripcion: false,
                    cambiar_valor: false,
                    cambiar_descuento: false,
                    errorCantidad: false,
                    errorPrecio: false,
                    stockRowLoading: false,
                    disableOpenModalStock: false,
                    descuento: Number(item.descuento || 0),
                    descuento_original: Number(item.descuento_original || 0),
                    // Aseguramos que existan como arrays
                    proveedores: item.proveedores || [],
                    stock: item.stock || []
                }));


                // 4. Configuración de Cabecera y Logística
                form.value.punto_venta_id = cotizacion.PTO_VTA_ID;
                form.value.bodega_facturacion = cotizacion.BOD_BODEGA;
                form.value.direccion_facturacion_id = cotizacion.sucursal_facturacion_id;
                form.value.direccion_entrega_id = cotizacion.sucursal_id;
                const esRetiro = cotizacion.despacho === 'Retiro en bodega';
                form.value.tipo_entrega = esRetiro ? 'retiro' : 'despacho';
                form.value.fecha_entrega = cotizacion.fecha_entrega;

                //descuentos articulo y descuento original
                form.value.descuento_articulo = Number(cotizacion.porcentage_descuento || 0);
                form.value.descuento_original = Number(cotizacion.porcentage_descuentooriginal || 0);
                // 6. Notas y Otros
                form.value.nota_cliente = cotizacion.nota_cliente || '';
                form.value.nota_interna = cotizacion.nota_interna || '';
                form.value.nota_operaciones = cotizacion.nota_operaciones || '';
                form.value.orden_de_compra = cotizacion.orden_de_compra || '';
                form.value.modificador_global = Number(cotizacion.modificador_global || 0);
                //origen
                form.value.origen = cotizacion.origen;

                //imagenes
                if (imagenesOperaciones && imagenesOperaciones.length > 0) {
                    if (uploadedFilesRef) {
                        uploadedFilesRef.value = imagenesOperaciones.map(img => ({
                            id: img.id,
                            preview: img.url,
                            name: img.nombre,
                            isPersisted: true
                        }));
                    }
                    form.value.imagenesoperaciones = imagenesOperaciones.map(img => img.url);
                } else {
                    if (uploadedFilesRef) uploadedFilesRef.value = [];
                    form.value.imagenesoperaciones = [];
                }

                //documentos pdf
                if (documentosPdf && documentosPdf.length > 0) {
                    if (uploadedPdfsRef) {
                        uploadedPdfsRef.value = documentosPdf.map((doc, index) => ({
                            id: doc.id,
                            preview: doc.url,
                            name: doc.nombre,
                            type: doc.mime_type || 'application/pdf',
                            size: doc.size || 0,
                            isPersisted: true
                        }));
                    }
                    form.value.documentos_pdf = documentosPdf.map(doc => doc.url);
                } else {
                    if (uploadedPdfsRef) uploadedPdfsRef.value = [];
                    form.value.documentos_pdf = [];
                }

                validateBillingRules();
                calculateTotals();


                //condicion de pago revision 
                form.value.condicion_pago_id = cotizacion.COND_ID;
                form.value.forma_pago_id = cotizacion.DESC_FORMA_PAGO_CODIGO;
                form.value.condicion_pago_original_id = cliente.CLI_CONDICION_PAGO;
                // setTimeout(() => {
                //     isRecoveringQuote.value = false;

                // }, 500);
            },
            onError: (err) => {
                console.error("Error recuperando cotización:", err);
                isRecoveringQuote.value = false;
            }
        });
    }




    /**
     *  PROCESO DE VOLVER A PEDIR COTIZACION
     * 
     */

    const loadingReorder = ref(false);
    async function loadDataForReorder(quoteId, uploadedFilesRef, uploadedPdfsRef) {

        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.RECREATE_QUOTE, { id: quoteId }), {
            loadingRef: loadingReorder,
            onSuccess: (res) => {
                const initialState = getInitialState();
                Object.assign(form.value, initialState);
                form.value.items = [];
                form.value.imagenesoperaciones = [];
                const { cotizacion, cliente, items, imagenesOperaciones, documentosPdf, segmento, registro_copia, mode } = res;

                form.value.draft_id = route.query.draft || initialState.draft_id;

                form.value.mode = mode;
                form.value.cotizacion_id = null; // Nueva cotización, sin ID previo
                form.value.cotizacion_codigo = null; // Nueva cotización, sin código previo
                form.value.registro_copia = registro_copia;

                // Asignamos cliente y datos básicos
                form.value.cliente = cliente;
                form.value.segmento = segmento;

                form.value.punto_venta_id = cotizacion.PTO_VTA_ID;
                form.value.bodega_facturacion = cotizacion.BOD_BODEGA;
                form.value.condicion_pago_id = cotizacion.COND_ID;
                form.value.forma_pago_id = cotizacion.DESC_FORMA_PAGO_CODIGO;
                form.value.condicion_pago_original_id = cliente.COND_ID_ORIGINAL;

                // Reseteamos fechas a HOY
                form.value.fecha_entrega = cotizacion.fecha_entrega;

                // Direcciones (Mantenemos las de la copia)
                form.value.direccion_facturacion_id = cotizacion.sucursal_facturacion_id;
                form.value.direccion_entrega_id = cotizacion.sucursal_id;
                form.value.tipo_entrega = cotizacion.despacho === 'Retiro en bodega' ? 'retiro' : 'despacho';

                form.value.descuento_articulo = Number(cotizacion.porcentage_descuento || 0);
                form.value.descuento_original = Number(cotizacion.porcentage_descuentooriginal || 0);

                // Notas (Opcional: puedes limpiarlas o dejarlas)
                form.value.nota_cliente = cotizacion.nota_cliente;
                form.value.nota_interna = cotizacion.nota_interna;
                form.value.nota_operaciones = cotizacion.nota_operaciones;

                form.value.modificador_global = Number(cotizacion.modificador_global || 0);
                form.value.origen = cotizacion.origen;
                form.value.items = items.map((item, index) => ({
                    ...item,
                    id: null,
                    id_temp: `loadData-${Date.now()}-${index}`,
                    cotizacion_id: null,
                    stock: (item.stock || []).map(st => ({
                        ...st,
                        id: null,
                        detalle_id: null,
                        seleccionado: 0 // Importante resetear selección previa
                    })),
                    ART_CANTIDAD: Number(item.ART_CANTIDAD).toFixed(Number(item.ART_DECIMAL_CANTIDAD)),
                    ART_STOCK: Number(item.ART_STOCK || 0).toFixed(Number(item.ART_DECIMAL_CANTIDAD)),
                    stockListo: false,
                    stockRowLoading: false,
                    disableOpenModalStock: false,
                    proveedores: item.proveedores || [],
                    imagenes: item.imagenes || []

                }));

                //imagenes
                if (imagenesOperaciones && imagenesOperaciones.length > 0) {
                    if (uploadedFilesRef) {

                        uploadedFilesRef.value = imagenesOperaciones.map(img => ({
                            id: img.id,
                            preview: img.url,
                            name: img.nombre,
                            isPersisted: true
                        }));
                    }
                    form.value.imagenesoperaciones = imagenesOperaciones.map(img => img.url);
                } else {
                    if (uploadedFilesRef) uploadedFilesRef.value = [];
                    form.value.imagenesoperaciones = [];
                }
                //documentos pdf
                if (documentosPdf && documentosPdf.length > 0) {
                    if (uploadedPdfsRef) {
                        uploadedPdfsRef.value = documentosPdf.map((doc, index) => ({
                            id: doc.id,
                            preview: doc.url,
                            name: doc.nombre,
                            type: doc.mime_type || 'application/pdf',
                            size: doc.size || 0,
                            isPersisted: true
                        }));
                    }
                    form.value.documentos_pdf = documentosPdf.map(doc => doc.url);
                } else {
                    if (uploadedPdfsRef) uploadedPdfsRef.value = [];
                    form.value.documentos_pdf = [];
                }
                validateBillingRules();
                calculateTotals();
            },
            onError: (err) => {
                console.error("Error al volver a pedir cotización:", err);
            }
        });
    }

    /** 
     * PROCESO DE COPIAR COTIZACION
     */

    const loadingCopyQuoteOrOrder = ref(false);
    async function copyRawQuoteOrOrder(originalId, type, clienteId, sucursalId, uploadedFilesRef, uploadedPdfsRef) {
        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.COPY_QUOTE_OR_ORDER, {
            rowId: originalId,
            tipo: type,
            cliente_id: clienteId,
            sucursal_id: sucursalId
        }), {
            loadingRef: loadingCopyQuoteOrOrder,
            onSuccess: (res) => {
                const initialState = getInitialState();
                Object.assign(form.value, initialState);
                form.value.items = [];
                const { cliente, segmento, mode, registro_copia, sucursal_id, items, imagenesOperaciones, documentosPdf } = res;
                form.value.draft_id = route.query.draft || initialState.draft_id;

                form.value.mode = mode;
                form.value.cotizacion_id = null;        // Nueva cotización, sin ID previo
                form.value.cotizacion_codigo = null;    // Nueva cotización, sin código previo
                form.value.registro_copia = registro_copia;

                // Asignamos cliente y datos básicos
                form.value.cliente = cliente;
                form.value.segmento = segmento;

                form.value.punto_venta_id = ptoVtaSelect.value;
                form.value.bodega_facturacion = null;           //se carga automaticamente basado en el punto de venta
                form.value.direccion_facturacion_id = sucursal_id;
                form.value.direccion_entrega_id = sucursal_id;
                form.value.tipo_entrega = 'retiro';
                form.value.fecha_entrega = null;
                form.value.condicion_pago_id = cliente.CLI_CONDICION_PAGO;
                form.value.condicion_pago_original_id = cliente.CLI_CONDICION_PAGO;
                form.value.forma_pago_id = null;                // no ponemos porque se carga con la condificion de pago 

                form.value.nota_cliente = '';
                form.value.nota_interna = '';
                form.value.nota_operaciones = '';
                form.value.modificador_global = 0;
                form.value.imagenesoperaciones = [];
                form.value.origen = 'cotizacion';
                form.value.items = items.map((item, index) => ({
                    ...item,
                    id: null,
                    id_temp: `copy-${Date.now()}-${index}`,
                    cotizacion_id: null,
                    stock: (item.stock || []).map(st => ({
                        ...st,
                        id: null,
                        detalle_id: null,
                        seleccionado: 0                           // Importante resetear selección previa
                    })),
                    ART_CANTIDAD: Number(item.ART_CANTIDAD).toFixed(Number(item.ART_DECIMAL_CANTIDAD)),
                    ART_STOCK: Number(item.ART_STOCK || 0).toFixed(Number(item.ART_DECIMAL_CANTIDAD)),
                    stockListo: false,
                    stockRowLoading: false,
                    disableOpenModalStock: false,
                    proveedores: [],
                    imagenes: item.imagenes || []

                }));

                if (imagenesOperaciones && imagenesOperaciones.length > 0) {
                    if (uploadedFilesRef) {

                        uploadedFilesRef.value = imagenesOperaciones.map(img => ({
                            id: img.id,
                            preview: img.url,
                            name: img.nombre,
                            isPersisted: true
                        }));
                    }
                    form.value.imagenesoperaciones = imagenesOperaciones.map(img => img.url);
                } else {
                    if (uploadedFilesRef) uploadedFilesRef.value = [];
                    form.value.imagenesoperaciones = [];
                }

                //documentos pdf
                if (documentosPdf && documentosPdf.length > 0) {
                    if (uploadedPdfsRef) {
                        uploadedPdfsRef.value = documentosPdf.map((doc, index) => ({
                            id: doc.id,
                            preview: doc.url,
                            name: doc.nombre,
                            type: doc.mime_type || 'application/pdf',
                            size: doc.size || 0,
                            isPersisted: true
                        }));
                    }
                    form.value.documentos_pdf = documentosPdf.map(doc => doc.url);
                } else {
                    if (uploadedPdfsRef) uploadedPdfsRef.value = [];
                    form.value.documentos_pdf = [];
                }

                validateBillingRules();
                calculateTotals();
            },
            onError: (err) => {
                console.error("Error al copiar cotización o pedido:", err);
            }
        });
    }


    /** 
     * PROCESO DE VOLVER A PEDIR UN  PEDIDO 
     */

    
    const loadingIsReordering = ref(false);
    async function reOrder(rowId, uploadedFilesRef, uploadedPdfsRef) {
        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.REORDER, { id: rowId }), {
            loadingRef: loadingIsReordering,
            onSuccess: (res) => {
                const initialState = getInitialState();
                Object.assign(form.value, initialState);
                const { pedido, cliente, items, imagenesOperaciones, documentosPdf, segmento, registro_copia, mode } = res;


                form.value.draft_id = route.query.draft || initialState.draft_id;
                form.value.mode = mode;
                form.value.cotizacion_id = null;        // Nueva cotización, sin ID previo
                form.value.cotizacion_codigo = null;    // Nueva cotización, sin código previo
                form.value.registro_copia = registro_copia;

                // Asignamos cliente y datos básicos
                form.value.cliente = cliente;
                form.value.segmento = segmento;

                form.value.punto_venta_id = pedido.PTO_VTA_ID;
                form.value.bodega_facturacion = pedido.BOD_BODEGA;
                form.value.condicion_pago_id = pedido.COND_ID;
                form.value.forma_pago_id = pedido.DESC_FORMA_PAGO_CODIGO;
                form.value.condicion_pago_original_id = pedido.COND_ID_ORIGINAL;

                form.value.fecha_entrega = pedido.fecha_entrega;

                form.value.direccion_facturacion_id = pedido.sucursal_facturacion_id;
                form.value.direccion_entrega_id = pedido.sucursal_id;
                form.value.tipo_entrega = pedido.despacho === 'Retiro en bodega' ? 'retiro' : 'despacho';
                form.value.nota_cliente = pedido.nota_cliente || '';
                form.value.nota_interna = pedido.nota_interna || '';
                form.value.nota_operaciones = pedido.nota_operaciones || '';
                form.value.modificador_global = Number(pedido.modificador_global || 0);
                form.value.origen = 'cotizacion';
                form.value.items = items.map((item, index) => ({
                    ...item,
                    id: null,
                    id_temp: `reorder-pedido-${Date.now()}-${index}`,
                    cotizacion_id: null,
                    stock: (item.stock || []).map(st => ({
                        ...st,
                        id: null,
                        detalle_id: null,
                        seleccionado: 0 // Importante resetear selección previa
                    })),
                    ART_CANTIDAD: Number(item.ART_CANTIDAD).toFixed(Number(item.ART_DECIMAL_CANTIDAD)),
                    ART_STOCK: Number(item.ART_STOCK || 0).toFixed(Number(item.ART_DECIMAL_CANTIDAD)),
                    stockListo: false,
                    stockRowLoading: false,
                    disableOpenModalStock: false,
                    proveedores: item.proveedores || [],
                    imagenes: item.imagenes || []

                }));

                if (imagenesOperaciones && imagenesOperaciones.length > 0) {
                    if (uploadedFilesRef) {

                        uploadedFilesRef.value = imagenesOperaciones.map(img => ({
                            id: img.id,
                            preview: img.url,
                            name: img.nombre,
                            isPersisted: true
                        }));
                    }
                    form.value.imagenesoperaciones = imagenesOperaciones.map(img => img.url);
                } else {
                    if (uploadedFilesRef) uploadedFilesRef.value = [];
                    form.value.imagenesoperaciones = [];
                }

                if (documentosPdf && documentosPdf.length > 0) {
                    if (uploadedPdfsRef) {
                        uploadedPdfsRef.value = documentosPdf.map((doc, index) => ({
                            id: doc.id || `pdf-restored-${index}`,
                            preview: doc.url,
                            name: doc.nombre || `Documento ${index + 1}.pdf`,
                            isPersisted: true
                        }));
                    }
                    form.value.documentos_pdf = documentosPdf.map(doc => doc.url);
                } else {
                    if (uploadedPdfsRef) uploadedPdfsRef.value = [];
                    form.value.documentos_pdf = [];
                }
                validateBillingRules();
                calculateTotals();
            },

            onError: (err) => {
                console.error("Error al volver a pedir pedido:", err);
            }
        });

    }


    /**
     * 
     * PROCESO DE GUARDAR UN PEDIDO 
     */

    const loadingSaveOrder = ref(false);
    async function saveOrder() {
        if (!form.value.cliente) {
            swalWarning('Debe seleccionar un cliente.');
            return;
        }
        if (!form.value.items.length) {
            swalWarning('Debe agregar al menos un artículo.');
            return;
        }
        const formData = new FormData();
        formData.append('mode', 'crear_pedido');
        formData.append('cotizacion_id', form.value.cotizacion_id);
        formData.append('cliente_id', form.value.cliente.id);
        formData.append('ruc', form.value.cliente.CLI_RUC);
        formData.append('razon_social', form.value.cliente.CLI_RAZON_SOCIAL);
        formData.append('correo_electronico_sri', form.value.cliente.CLI_CORREO_ELECT_SRI);
        formData.append('vendedor_id', form.value.cliente.gpvendedor.VEND_ID);
        formData.append('vendedor_nombres', form.value.cliente.gpvendedor.VEND_NOMBRES);
        formData.append('vendedor_apellidos', form.value.cliente.gpvendedor.VEND_APELLIDOS);


        //variables de punto de venta y bodega de facturacion
        formData.append('punto_venta_id', form.value.punto_venta_id);
        formData.append('bodega_facturacion', form.value.bodega_facturacion);

        //variables de fecha y direccion de facturacion
        formData.append('tipo_entrega', form.value.tipo_entrega); //despacho o retiro
        formData.append('fecha_entrega', form.value.fecha_entrega);
        formData.append('direccion_facturacion_id', form.value.direccion_facturacion_id);
        formData.append('direccion_entrega_id', form.value.direccion_entrega_id);
        // variables de facturacion posterior (Booleanos)
        formData.append('factura_posterior_despacho', form.value.factura_posterior_despacho);
        formData.append('factura_a_demanda', form.value.factura_a_demanda);
        formData.append('factura_siguiente_mes', form.value.factura_siguiente_mes);


        //condiciones y formas de pago 
        formData.append('condicion_pago_id', form.value.condicion_pago_id);
        formData.append('condicion_pago_original_id', form.value.condicion_pago_original_id);
        formData.append('forma_pago_id', form.value.forma_pago_id);

        //descuentos de articulo y descuento original
        formData.append('descuento_articulo', form.value.descuento_articulo);
        formData.append('descuento_original', form.value.descuento_original);

        //notas
        formData.append('nota_interna', form.value.nota_interna);
        formData.append('nota_cliente', form.value.nota_cliente);
        formData.append('nota_operaciones', form.value.nota_operaciones);

        //orden de compra
        formData.append('orden_de_compra', form.value.orden_de_compra);

        //registro copia
        formData.append('registro_copia', form.value.registro_copia);

        //calculos
        formData.append('subtotal', form.value.subtotal);
        formData.append('peso', form.value.peso);
        formData.append('descuento', form.value.descuento);
        formData.append('iva', form.value.iva);
        formData.append('total', form.value.total);

        //modificador global
        formData.append('modificador_global', form.value.modificador_global);
        formData.append('origen', form.value.origen);
        formData.append('items', JSON.stringify(form.value.items));
        //imagenes de operaciones
        if (form.value.imagenesoperaciones && form.value.imagenesoperaciones.length > 0) {
            form.value.imagenesoperaciones.forEach((item, index) => {
                let archivoReal = (item && item.file) ? item.file : item;
                if (archivoReal instanceof File || archivoReal instanceof Blob) {
                    let nombre = archivoReal.name || `imagen_${index}.jpg`;
                    const archivoLimpio = new File([archivoReal], nombre, {
                        type: archivoReal.type || 'image/png', // Usa el tipo real o png por defecto
                        lastModified: new Date().getTime()
                    });


                    formData.append('imagenes_nuevas[]', archivoLimpio);

                }
                else if (typeof item === 'string') {
                    formData.append('imagenes_existentes[]', item);
                }
                else {
                    console.log('Objeto ignorado al guardar (no es archivo ni url):', item);
                }
            });
        }



        //logica de guarado de pdf
        if (form.value.documentos_pdf && form.value.documentos_pdf.length > 0) {
            form.value.documentos_pdf.forEach((item, index) => {
                let archivoReal = (item && item.file) ? item.file : item;
                if (archivoReal instanceof File || archivoReal instanceof Blob) {
                    let nombre = archivoReal.name || `documento_${index}.pdf`;
                    const archivoLimpio = new File([archivoReal], nombre, {
                        type: archivoReal.type || 'application/pdf',
                        lastModified: new Date().getTime()
                    });

                    formData.append('pdfs_nuevos[]', archivoLimpio);
                } else if (typeof item === 'string') {
                    formData.append('pdfs_existentes[]', item);
                } else {
                    console.log('Objeto PDF ignorado al guardar:', item);
                }
            });
        }
        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.CREATE_ORDER, formData), {
            loadingRef: loadingSaveOrder,
            onError: (error) => {
                console.error('Error al crear el pedido:', error);
            },
        });
    }




    /** proceso de cotizaciones de prospecto  */

    const loadingUpdateQuoteProspect = ref(false);
    async function updateQuoteProspect(params) {
        return await run(() => axiosClient.post(QUOTE_API_ROUTES.PROSPECTS.UPDATE, params), {
            loadingRef: loadingUpdateQuoteProspect,
            onError: (error) => {
                console.error('Error al actualizar el pedido:', error);
            },
        });
    }


    return {
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
        loadingListAlternative,
        getAlternativeDescriptions,
        listItemsAlternatives,
        clearSelectionItemalternative,
        descripcionAlternativa,
        updateDescriptionsForCheckAlternative,

        //proceso de checkbox alternativos
        updateCheckAlternative,

        // proceso para apertura de modal de proveedores
        isItemL,

        //proceso para manejo de cantidades
        validateQtyBeforeUpdate,
        formatQty,
        changeQuantityItem,

        //proceso de stock total de un articulo 
        shouldShowStock,
        //proceso de proveedores - modal
        itemsProvider,
        eliminarProveedor,
        margenPorDefecto,
        dataModalProviders,
        clearDataModalProviders,
        loadingMarginItemL,
        margenItemL,
        getMargenFotItemL,
        validateProviderBeforeStore,
        //proceso de modal stock y peso 
        dataStockItem,
        isStockDisabled,
        getStockClass,
        localStocks,
        totalAsignado,
        validateInput,




        //peso  
        dataPesoItem,
        //proceso para manejo de modificador y precio

        calculatePriceFromModifier,
        isPriceEditable,
        enableEditPrice,
        applyModifyPrice,
        exitEditPrice,
        calculateRowModifier,

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
        updateStockByBatchV2,

        //global
        calculateTotals,


        //proceso de creacion de cotizacion
        loadingCreateQuotation,
        isQuoteValid,
        createQuote,

        // proceso de recuperar cotizacion 
        isRecoveringQuote,
        fetchAndFillQuotation,
        loadDataForReorder,
        copyRawQuoteOrOrder,

        //voler a pedir un pedido 
        reOrder,
        //gaurdar una cotizacion a pedido
        loadingSaveOrder,
        saveOrder,

        //prospecto 
        loadingUpdateQuoteProspect,
        updateQuoteProspect,


        //manejo de borradores 
        fetchCurrentDraft,
        getActiveDrafts,
        removeDraft
    };


}