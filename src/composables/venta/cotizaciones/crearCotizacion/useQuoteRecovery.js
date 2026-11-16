import { ref } from "vue";
import axiosClient from "@/axios";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";
import { getInitialState } from "./quoteInitialState";

export function useQuoteRecovery({
    form, run, route, isRecoveringQuote, selectedPointSaleCode, selectedPointSaleId,
    validateBillingRules, calculateTotals,
}) {
    const loadingGetQuoteData = ref(false);

    async function fetchAndFillQuotation(quoteId, uploadedFilesRef, uploadedPdfsRef) {
        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.RECOVER, { id: quoteId }), {
            loadingRef: loadingGetQuoteData,
            onSuccess: async (res) => {
                isRecoveringQuote.value = true;
                const initialState = getInitialState();
                Object.assign(form.value, initialState);
                form.value.items = [];
                form.value.imagenesoperaciones = [];
                const { cotizacion, cliente, items, segmento, imagenesOperaciones, documentosPdf, mode } = res;

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
                    stock: item.stock || [],
                    cod_categoria: item.cod_categoria || "",
                    cod_linea: item.cod_linea || "",
                    cod_clase: item.cod_clase || "",
                    resultado_configuracion_item_l: item.resultado_configuracion_item_l || "",
                    fle_valor: item.fle_valor ?? 0,
                    errorMontoFlete: false
                }));


                // 4. Configuración de Cabecera y Logística
                form.value.punto_venta_id = cotizacion.PTO_VTA_ID;
                form.value.pv_id = cotizacion.pv_id;
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
                // proyecto
                form.value.proyecto = cotizacion.proyecto
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
                        uploadedPdfsRef.value = documentosPdf.map((doc) => ({
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

                //paqueteria
                form.value.responsable_flete = cotizacion.responsable_flete ?? 'tuval';
                form.value.tipo_despacho_id = cotizacion.tipo_despacho_id;
                form.value.fle_proveedor_id = cotizacion.fle_proveedor_id ?? null;
                form.value.fle_valor = cotizacion.fle_valor ?? 0;
                form.value.fle_peso = cotizacion.fle_peso ?? 0;
                form.value.facturar_ahora = cotizacion.facturar_ahora ?? false;
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

        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.RECREATE, { id: quoteId }), {
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
                form.value.pv_id = cotizacion.pv_id;
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

                // proyecto
                form.value.proyecto = cotizacion.proyecto

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
                    imagenes: item.imagenes || [],
                    fle_valor: 0

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
                        uploadedPdfsRef.value = documentosPdf.map((doc) => ({
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

                //paqueteria
                form.value.responsable_flete = 'tuval';
                form.value.tipo_despacho_id = null;
                form.value.fle_proveedor_id = null;
                form.value.fle_valor = 0;
                form.value.facturar_ahora = false;
                

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
        return run(() => axiosClient.post(QUOTE_API_ROUTES.ORDERS.COPY_QUOTE_OR_ORDER, {
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

                form.value.punto_venta_id = selectedPointSaleCode.value;
                form.value.pv_id = selectedPointSaleId.value;
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
                // proyecto
                form.value.proyecto = '';
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
                    imagenes: item.imagenes || [],
                    fle_valor: 0

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
                        uploadedPdfsRef.value = documentosPdf.map((doc) => ({
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

                //paqueteria
                form.value.responsable_flete = 'tuval';
                form.value.tipo_despacho_id = null;
                form.value.fle_proveedor_id = null;
                form.value.fle_valor = 0;
                form.value.facturar_ahora = false;

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
        return run(() => axiosClient.post(QUOTE_API_ROUTES.ORDERS.REORDER, { id: rowId }), {
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
                form.value.pv_id = pedido.pv_id;

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
                // proyecto
                form.value.proyecto = pedido.proyecto;
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

                //paqueteria
                form.value.responsable_flete = 'tuval';
                form.value.tipo_despacho_id = null;
                form.value.fle_proveedor_id = null;
                form.value.fle_valor = 0;


                validateBillingRules();
                calculateTotals();
            },

            onError: (err) => {
                console.error("Error al volver a pedir pedido:", err);
            }
        });

    }

    return {
        loadingGetQuoteData, fetchAndFillQuotation,
        loadingReorder, loadDataForReorder,
        loadingCopyQuoteOrOrder, copyRawQuoteOrOrder,
        loadingIsReordering, reOrder,
    };
}
