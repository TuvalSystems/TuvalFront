import { useQuoteStock } from "@/composables/venta/cotizaciones/crearCotizacion/useQuoteStock";
import { useQuoteAlternativeItems } from "@/composables/venta/cotizaciones/crearCotizacion/useQuoteAlternativeItems";
import { useQuoteDrafts } from "@/composables/venta/cotizaciones/crearCotizacion/useQuoteDrafts";
import { getInitialState } from "./quoteInitialState";
import { useQuoteSubmission } from "./useQuoteSubmission";
import { useQuoteRecovery } from "./useQuoteRecovery";
import { useQuoteValidation } from "./useQuoteValidation";
import axiosClient from "@/axios";
import { freightUnitPrice } from "@/functions/freightPrice";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, watch, computed, nextTick } from "vue";
import { swalWarning } from "@/functions/swal-alert";
import { useStore } from 'vuex'

import { useRoute } from "vue-router";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";

function redondear(num, decimales = 2) {
    const factor = Math.pow(10, decimales);
    return Math.round((num + Number.EPSILON) * factor) / factor;
}
export function useProcessCreateQuote(draftId = 'default') {
    const store = useStore();
    const selectedPointSaleId = computed(() => store.state.puntoventaselectid);
    const selectedPointSaleCode = computed(() => store.state.puntodeventaselect);

    const { run } = useApiAction();
    const today = new Date();
    const route = useRoute();

    // nuevo proceso para almacenar en bd 
    const isRecoveringQuote = ref(false);
    const form = ref(getInitialState());
    form.value.draft_id = draftId;
    const {
        loadingGetCurrentDraft,
        draftLoadError,
        draftSaveState,
        draftSaveError,
        retryDraftSave,
        flushDraftSave,
        fetchCurrentDraft,
        getActiveDrafts,
        removeDraft,
    } = useQuoteDrafts({
        route,
        draftId,
        isRecoveringQuote,
        run,
        form,
        calculateTotals: () => calculateTotals(),
        selectedPointSaleCode,
        selectedPointSaleId,
    });

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
        if (selectedPointSaleCode.value) {
            form.value.punto_venta_id = selectedPointSaleCode.value;
            form.value.pv_id = selectedPointSaleId.value;
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
            ART_CANTIDAD: Number(rawItem?.es_servicio_logistico) === 1 ? 1 : 0,
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
            validador_l: false,
            cod_categoria: rawItem.cod_categoria || "",
            cod_linea: rawItem.cod_linea || "",
            cod_clase: rawItem.cod_clase || "",
            resultado_configuracion_item_l: rawItem.resultado_configuracion_item_l || "",

            //campos para paqueteria
            fle_valor: 0,
            errorMontoFlete: false,
            precio_sin_flete: artValor,
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
        return form.value.items[i].cambiar_descripcion === true && Number(form.value.items[i].es_servicio_logistico) !== 1
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

    const {
        descripcionAlternativa,
        listItemsAlternatives,
        loadingListAlternative,
        getAlternativeDescriptions,
        clearSelectionItemalternative,
        updateCheckAlternative,
        updateDescriptionsForCheckAlternative,
    } = useQuoteAlternativeItems({
        run,
        form,
    });

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
            return {
                ok: false,
                message: 'La cantidad debe ser un número',
            };
        }
        if (!allowsDecimals && !isInt(qty)) {
            return {
                ok: false,
                message: 'La cantidad debe ser un número entero',
            };
        }
        return {
            ok: true,
            code: 0,
        };
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

    const {
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
        updateStockByBatchV2,
    } = useQuoteStock({
        isInt,
        form,
        calculateTotals: () => calculateTotals(),
        selectedPointSaleCode,
        run,
    });

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
        let tempPesoFlete = 0;
        let tempPesoPaqueteria = 0;


        //se reinician las variables
        isQuantityValid.value = true;
        isPriceValid.value = true;
        isDescriptionLValid.value = true;

        form.value.items.forEach((art) => {
            const montoFleteUnitario = freightUnitPrice(art);
            const tipoCompra = (art.ART_TIPO_COMPRA || '').trim().toUpperCase();
            if (tipoCompra === 'L' && (art.ART_DESCRIPCION == art.ART_DESCRIPCION_ORIGINAL)) {
                art.errorDescripcion = true;
                isDescriptionLValid.value = false;
            }
            // El precio base nunca se obtiene del valor que ya incluye flete.
            if (art.precio_sin_flete == null) {
                art.precio_sin_flete = (Number.parseFloat(art.ART_VALOR) || 0) - (montoFleteUnitario ?? 0);
            }
            if (tipoCompra !== 'L' && Number(art.es_servicio_logistico) !== 1 && !art.cambiar_valor) {
                const valorUnitario = Number.parseFloat(art.ART_VALOR_ORIGINAL) || 0;
                const modificador = Number.parseFloat(art.modificador) || 0;
                art.precio_sin_flete = valorUnitario * (1 + modificador / 100);
            }
            art.precio_sin_flete = redondear((Number.parseFloat(art.precio_sin_flete) || 0) + 0.000001, 4);
            if (!art.cambiar_valor) {
                art.ART_VALOR = redondear(art.precio_sin_flete + (montoFleteUnitario ?? 0), 4);
            }

            const cantidad = Number.parseFloat(art.ART_CANTIDAD) || 0;
            if (cantidad <= 0) {
                art.errorCantidad = true;
                isQuantityValid.value = false;
            } else {
                art.errorCantidad = false;
            }

            art.errorPrecio = art.ART_VALOR <= 0 || montoFleteUnitario === null;
            if (art.errorPrecio) isPriceValid.value = false;
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
            const pesoLinea = (Number.parseFloat(art.ART_PESO) || 0) * cantidad;
            tempPeso += pesoLinea;
            const proveedores = art.proveedores || [];
            const requiereTransporteItemL = proveedores.some((provider) =>
                provider.proveedor_entrega != null
                && ![true, 1, '1'].includes(provider.proveedor_entrega)
            );
            if (tipoCompra === 'L') {
                const cantidadSinEntrega = proveedores.reduce((total, provider) => {
                    if (provider.proveedor_entrega == null
                        || [true, 1, '1'].includes(provider.proveedor_entrega)) return total;
                    const cantidadProveedor = Number(provider.CANTIDAD);
                    return total + (Number.isFinite(cantidadProveedor) && cantidadProveedor > 0
                        ? cantidadProveedor : 0);
                }, 0);
                tempPesoFlete += (Number.parseFloat(art.ART_PESO) || 0) * cantidadSinEntrega;
            } else if (Number(art.fle_valor) > 0) {
                tempPesoFlete += pesoLinea;
            }
            if (tipoCompra !== 'L' || requiereTransporteItemL) {
                tempPesoPaqueteria += pesoLinea;
            }
        });
        form.value.subtotal = redondear(tempSubtotal + 0.000001, 2);
        form.value.descuento = redondear(tempDescuento + 0.000001, 2);
        form.value.iva = redondear(tempIva + 0.000001, 2);
        form.value.peso = redondear(tempPeso, 2);
        const tipoDespacho = Number(form.value.tipo_despacho_id);
        form.value.fle_peso = tipoDespacho === 4
            ? redondear(tempPesoFlete, 2)
            : tipoDespacho === 3
                ? redondear(tempPesoPaqueteria, 2)
                : form.value.peso;
        // Total General = Subtotal + IVA
        form.value.total = redondear((form.value.subtotal + form.value.iva) + 0.000001, 2);
        validateAllProvidersStock();
        verifyStockConsistency();
    }

    watch(
        () => [form.value.tipo_despacho_id,
        form.value.items.map((item) => [item.fle_valor, item.ART_PESO, item.ART_CANTIDAD, item.descuento,
            item.ART_TIPO_COMPRA, (item.proveedores || []).map((provider) => [provider.proveedor_entrega, provider.CANTIDAD])])],
        () => calculateTotals(),
        { deep: true }
    );

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
        calculateTotals();
    }


    /**
     *  proceso de modificacion de descuento 
     */

    const isEditDiscount = (row) => {
        return row.cambiar_descuento === true && !row.es_servicio_logistico;
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


    /* 
     * proceso de monto de flete para detalle 
     * 
     */

    // Solo el despacho 4 distribuye el flete entre los artículos.
    const isActivePricefreight = (item) => {
        if (Number(form.value.tipo_despacho_id) !== 4) return false;
        if (!item || !isItemL(item)) return true;
        return (item.proveedores || []).some((provider) =>
            provider.proveedor_entrega != null
            && ![true, 1, '1'].includes(provider.proveedor_entrega)
        );
    };

    watch(
        () => form.value.items.map((item) => isActivePricefreight(item)),
        () => {
            if (isRecoveringQuote.value) return;
            let changed = false;
            form.value.items.forEach((item) => {
                if (isItemL(item) && !isActivePricefreight(item)) {
                    changed = changed || Number(item.fle_valor || 0) !== 0;
                    item.fle_valor = 0;
                    item.fle_valor_temporal = 0;
                    item.cambiar_flete = false;
                }
            });
            if (changed) calculateTotals();
        }
    );

    watch(
        () => form.value.tipo_despacho_id,
        (newVal, oldVal) => {
            if (!isRecoveringQuote.value && Number(newVal) !== Number(oldVal)) {
                cleanFreightPrice();
            }
        },
        { flush: 'sync' }
    );

    function cleanFreightPrice() {
        form.value.items.forEach((item) => {
            item.fle_valor = 0;
            item.errorMontoFlete = false;
        });
    }

    const { validateItemLWeights, validateDispatchFields, validateFreightTotal, isQuoteValid } = useQuoteValidation({
        form, isActivePricefreight,
    });

    watch(
        () => [form.value.tipo_despacho_id, form.value.fle_valor,
        form.value.items.map((item) => item.fle_valor)],
        () => {
            const hasError = isActivePricefreight() && !validateFreightTotal();
            form.value.items.forEach((item) => {
                item.errorMontoFlete = hasError;
            });
        },
        { immediate: true }
    );

    /*** 
     * 
     * 
     * proceso de creacion de cotizacion  
     * 
     * 
     * */

    const { loadingCreateQuotation, createQuote, loadingSaveOrder, saveOrder, saveOrderAndUpdateQuote } = useQuoteSubmission({
        form, run, validateItemLWeights, validateDispatchFields, validateFreightTotal,
    });


    /***
     * 
     *  PROCESO DE RECUPERAR COTIZACION 
     * 
     */

    const {
        fetchAndFillQuotation,
        loadDataForReorder,
        copyRawQuoteOrOrder,
        reOrder,
    } = useQuoteRecovery({
        form, run, route, isRecoveringQuote, selectedPointSaleCode, selectedPointSaleId,
        validateBillingRules, calculateTotals,
    });


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


    const loadingProyectSellers = ref(false);
    const dataProyectSellers = ref([]);
    async function fetchListProyectSellers() {
        return run(() => axiosClient.get(QUOTE_API_ROUTES.PROJECTS.LIST_SELLERS), {
            loadingRef: loadingProyectSellers,
            onSuccess: (info) => {
                dataProyectSellers.value = Array.isArray(info) ? info : [];
            },
            onError: (error) => {
                console.error('Error al obtener la lista de proyectos:', error);
            },
        });
    }

    return {
        form,
        clearForm,
        addItems,
        removeItem,
        selectedPointSaleCode,
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
        stockError,
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
        saveOrderAndUpdateQuote,

        //prospecto 
        loadingUpdateQuoteProspect,
        updateQuoteProspect,


        //manejo de borradores 
        loadingGetCurrentDraft,
        draftLoadError,
        draftSaveState,
        draftSaveError,
        retryDraftSave,
        flushDraftSave,
        fetchCurrentDraft,
        getActiveDrafts,
        removeDraft,


        //lista de proyectos
        loadingProyectSellers,
        dataProyectSellers,
        fetchListProyectSellers,

        //monto flete
        isActivePricefreight,
        cleanFreightPrice,
        validateFreightTotal,
        validateDispatchFields,
        validateItemLWeights
    };


}
