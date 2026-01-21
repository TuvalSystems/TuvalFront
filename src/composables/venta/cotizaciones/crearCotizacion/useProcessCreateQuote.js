import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, watch, computed, nextTick } from "vue";
import { swalWarning } from "@/functions/swal-alert";
import { useSessionStorage } from '@vueuse/core';
import { useStore } from 'vuex'


function redondear(num, decimales = 2) {
    const factor = Math.pow(10, decimales);
    return Math.round((num + Number.EPSILON) * factor) / factor;
}

const initialState = {
    cotizacion_id: null,
    bodega_facturacion: null,
    cliente: null,
    sucursal: null,
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
    registro_copia: false,

    //calculos
    subtotal: 0,
    peso: 0,
    descuento: 0,
    iva: 0,
    total: 0,

    //
    modificador_global: 0,
    //items de cotizacion
    items: [],
    imagenesoperaciones: [],

}
export function useProcessCreateQuote() {
    const store = useStore();
    const ptoVtaSelect = store.state.puntodeventaselect;
    const { run } = useApiAction();
    const loadingCreate = ref(false);
    const apiCreateQuote = '/cotizaciones/crear-cotizacion';
    const form = useSessionStorage('quoteTemp_v1', { ...initialState });
    const today = new Date();


    //validadores maximos para notas
    const maxLength = 200;
    const maxLengthNote = 300;
    const maxOrder = 20;


    function clearForm() {
        form.value = { ...initialState };
    }


    //watch para limpiar campos cuando cambia el tipo de entrega
    watch(
        () => form.value.tipo_entrega,
        (newVal) => {
            if (newVal === 'retiro') {
                form.value.direccion_entrega_id = null;
                form.value.fecha_entrega = null;
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
        () => {
            validateBillingRules();
        },
        { deep: true, immediate: true }
    );


    //proceso de agregar items a mi form-items y me crea el registro en las tablas temporales
    const apiAddItem = 'cart/item/add';
    const loadingAddItem = ref(false);
    const addItems = async (itm) => {
        const payloadAdddItem = {
            'cliente_id': form.value.cliente.id,
            'punto_venta_id': ptoVtaSelect,
            'sucursal_id': form.value.direccion_facturacion_id,
            'articulo': itm,
        }
        return await run(() => axiosClient.post(apiAddItem, payloadAdddItem), {
            loadingRef: loadingAddItem,
            onSuccess: (res) => {
                form.value.items.push(res);
                calculateTotals();
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }

    const apiDeleteCart = 'cart/item/delete';
    const removeItem = async (row, i) => {
        if (form.value.items[i]) {
            form.value.items[i].disabled_delete = true;
        }
        return await run(() => axiosClient.delete(apiDeleteCart + `/${row.id}`), {
            loadingRef: loadingAddItem,
            onError: (error) => {
                console.error('Error al eliminar:', error);
            },
        })
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


    const apiUpdateDescription = 'cart/item/update/descripcion';
    const loadingUpdateDescription = ref(false);
    async function updateDescripcion(event, row, i) {
        if (event.target.value.length < 5) {
            form.value.items[i].errorDescripcion = true;
            swalWarning('La descripcion debe tener al menos 5 caracteres');
            return;
        }
        let payloadUpdateDescription = {
            'id': row.id,
            'descripcion': event.target.value,
        }
        return await run(() => axiosClient.post(apiUpdateDescription, payloadUpdateDescription), {
            loadingRef: loadingUpdateDescription,
            onSuccess: (res) => {
                form.value.items[i].errorDescripcion = false;
                form.value.items[i].ART_DESCRIPCION = event.target.value;
                form.value.items[i].cambiar_descripcion = false;
            },
            onError: (error) => {
                form.value.items[i].errorDescripcion = false;
                form.value.items[i].ART_DESCRIPCION = form.value.items[i].ART_DESCRIPCION_ORIGINAL;
                form.value.items[i].cambiar_descripcion = false;
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }


    //proceso de items alternativos
    //proceso para listado de items alternativos 
    const descripcionAlternativa = ref('');
    const apiSearchAlternativesItems = '/cotizaciones/lista-items-alternativos';
    const listItemsAlternatives = ref([]);
    const loadingListAlternative = ref(false);
    async function getAlternativeDescriptions(artCode) {
        return await run(() => axiosClient.post(apiSearchAlternativesItems, { item: artCode }), {
            loadingRef: loadingListAlternative,
            onSuccess: (res) => {
                listItemsAlternatives.value = res;
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }

    async function clearSelectionItemalternative() {
        listItemsAlternatives.value = [];
    }

    const apiUpdateCheckAlternative = 'cart/item/update/check-alternativo';
    const loadingUpdateCheckAlternative = ref(false);
    async function updateCheckAlternative(check, id, i) {
        return await run(() => axiosClient.post(apiUpdateCheckAlternative, { id: id, CHECK_ALTERNATIVO: check }), {
            loadingRef: loadingUpdateCheckAlternative,
            onSuccess: (res) => {
                form.value.items[i].CHECK_ALTERNATIVO = check;
            },
            onError: (error) => {
                form.value.items[i].CHECK_ALTERNATIVO = !check;
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }

    const apiUpdateDescriptionAlternative = 'cart/item/update/descripcion-alternativa';
    const loadingUpdateDescriptionAlternative = ref(false);
    async function updateDescriptionsForCheckAlternative(descripcion, i) {
        let idRow = form.value.items[i].id;
        return await run(() => axiosClient.post(apiUpdateDescriptionAlternative, { id: idRow, descripcion: descripcion.value }), {
            loadingRef: loadingUpdateDescriptionAlternative,
            onSuccess: () => {
                form.value.items[i].ART_DESCRIPCION = descripcion;
                form.value.items[i].ART_DESCRIPCION_ORIGINAL = descripcion;
                form.value.items[i].cambiar_descripcion = false;
            },
            onError: (error) => {
                form.value.items[i].ART_DESCRIPCION = form.value.items[i].ART_DESCRIPCION_ORIGINAL;
                form.value.items[i].cambiar_descripcion = false;
            },
            successMessage: 'Proceso realizado exitosamente',
        })

    }




    //proceso para manejo de cantidades

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



    const apiUpdateQuantityItem = 'cart/item/update/cantidad';
    const loadingUpdateQuantityItem = ref(false);

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
    async function updateQuantityItem(qty, row, i) {
        const formattedQty = formatQty(qty, row);
        return await run(() => axiosClient.post(apiUpdateQuantityItem, { id: row.id, cantidad: formattedQty }), {
            loadingRef: loadingUpdateQuantityItem,
            onError: (error) => {
                console.log(error, 'updateQuantityItem');
            },
        });
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


    const apiUpdateStockRowItem = 'cart/item/update/stock';
    const loadingUpdateStockRowItem = ref(false);
    async function updateStockRowItem(id, qty) {
        return await run(() => axiosClient.post(apiUpdateStockRowItem, { id: id, seleccionado: qty }), {
            loadingRef: loadingUpdateStockRowItem,
            onSuccess: () => {
                calculateTotals();
            },

            successMessage: 'Proceso realizado exitosamente',
        })
    }



    const dataPesoItem = ref({ item: {}, index: 0 });
    const apiUpdateWeinghtRowItem = 'cart/item/update/peso';
    const loadingUpdateWeinghtRowItem = ref(false);

    async function updateWeinghtRowItem(id, qty) {
        return await run(() => axiosClient.post(apiUpdateWeinghtRowItem, { id: id, peso: qty }), {
            loadingRef: loadingUpdateWeinghtRowItem,
            onSuccess: () => {
                calculateTotals();
            },
            successMessage: 'Proceso realizado exitosamente',
        })
    }






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
    const apiGetMarginItemL = '/cotizaciones/obtener-magen-item-l';

    async function getMargenFotItemL(artCode) {
        if (!artCode) return;
        return await run(() => axiosClient.post(apiGetMarginItemL, { articulo: artCode }), {
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

    const apiStoreProvidersForItemL = 'cart/item/store/proveedores';
    const loadingProvidersForItemL = ref(false);
    async function storeProvidersForItemL(itemId, providers, priceNow) {
        return await run(() => axiosClient.post(apiStoreProvidersForItemL, {
            id: itemId,
            proveedores: providers,
            precio_actual: priceNow
        }), {
            loadingRef: loadingProvidersForItemL,
            onError: () => {
                console.error('Error al guardar proveedores para el item L', itemId);
            },
        });
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
                valorUnitario = valorUnitario - ((valorUnitario * modificador) / 100);
                art.ART_VALOR = redondear(valorUnitario + 0.000001, 4);
            }
            // if (art.ART_TIPO_COMPRA !== 'L') {

            // } else {
            //     art.ART_VALOR = redondear(Number.parseFloat(art.ART_VALOR) + 0.000001, 4);
            // }

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
        verifyStockConsistency(true);
    }


    const verifyStockConsistency = (silent = false) => {
        let isValid = true;
        const globalStockUsage = {};
        form.value.items.forEach((item) => {
            if (item.ART_TIPO_COMPRA === 'L' || item.ART_TIPO_COMPRA === 'SERV') {
                item.stockListo = true; //los servicios y l siempre estan listos
                return;
            }
            const qtyReuired = Number.parseFloat(item.ART_CANTIDAD || 0);
            let qtyAsigned = 0;

            if (item.stock && item.stock.length > 0) {
                item.stock.forEach((bd) => {
                    const seleccionado = Number.parseFloat(bd.seleccionado || 0);
                    const disponible = Number.parseFloat(bd.STO_ART_STOCK_DISPONIBLE || 0);
                    qtyAsigned += seleccionado;

                    const key = `${item.ART_CODIGO}_${bd.STO_ART_BODEGA}`;
                    if (!globalStockUsage[key]) {
                        globalStockUsage[key] = { used: 0, available: disponible, artCode: item.ART_CODIGO, bodegaName: bd.STO_ART_BODEGA };
                    }
                    globalStockUsage[key].used += seleccionado;
                });
            }
            if (qtyAsigned.toFixed(item.ART_DECIMAL_CANTIDAD) !== qtyReuired.toFixed(item.ART_DECIMAL_CANTIDAD)) {
                item.stockListo = false;
                isValid = false;
            } else {
                item.stockListo = true;
            }
        });
        for (const key in globalStockUsage) {
            const data = globalStockUsage[key];
            if (data.used > data.available) {
                if (!silent) {
                    swalWarning(`Stock insuficiente en la bodega ${data.bodegaName} para el articulo ${data.artCode}.<br>Máximo disponible: <b>${data.available}</b>`);
                    return;
                }
                isValid = false;
            }
        }
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
        console.log('isProviderValidationOk', isProvidersValidationOk.value);

        return true;
    }




    /*
     *
     *  proceso de calculo de modificador y precio 
     */

    const calculatePriceFromModifier = (originalPrice, modifier) => {
        if (!originalPrice) return 0;
        if (modifier == 0) return originalPrice;
        let decimal = 1 - (modifier / 100);
        return originalPrice * decimal;
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
        row.cambiar_valor = false;
    }



    const loadingUpdateOnlyModifyPriceItem = ref(false);
    const apiUpdatePriceRow = 'cart/item/update/precio';
    async function updateModifyPriceRowItem(id, price, nuevoModificar) {
        return await run(() => axiosClient.post(apiUpdatePriceRow, { id: id, precio: price, modificador: nuevoModificar }), {
            loadingRef: loadingUpdateOnlyModifyPriceItem,
            onSuccess: () => {
                calculateTotals();
            },
            successMessage: 'Proceso realizado exitosamente',
        });
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

    const loadingDiscountItem = ref(false);
    const apiModifyDiscountItem = 'cart/item/update/descuento';
    const updateModifyDiscountRowItem = async (id, descuento) => {
        return await run(() => axiosClient.post(apiModifyDiscountItem, { id: id, descuento: descuento }), {
            loadingRef: loadingDiscountItem,
            onSuccess: () => {
                calculateTotals();
            },
            successMessage: 'Proceso realizado exitosamente',
        });
    }


    /**
     * 
     * proceso de limpieza de session storage al crear la cotizacion
     */

    const apiDeleteCartQuotation = 'cart/item/clear-temp';
    const loadingClearQuotation = ref(false);
    async function clearQuotation() {
        return await run(() => axiosClient.post(apiDeleteCartQuotation, {
            clienteId: form.value.cliente.id,
            puntoVentaId: ptoVtaSelect,
            sucursalId: form.value.direccion_facturacion_id
        }), {
            loadingRef: loadingClearQuotation,
            onError: (error) => {
                console.error('Error al eliminar el carrito de cotización:', error);
            },
        });
    }


    return {
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

        // proceso para apertura de modal de proveedores
        isItemL,

        //proceso para manejo de cantidades
        loadingUpdateQuantityItem,
        validateQtyBeforeUpdate,
        updateQuantityItem,
        formatQty,

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
        storeProvidersForItemL,
        validateProviderBeforeStore,
        //proceso de modal stock y peso 
        dataStockItem,
        isStockDisabled,
        getStockClass,
        localStocks,
        totalAsignado,
        validateInput,
        updateStockRowItem,

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

        //global
        calculateTotals

    };


}