export const getInitialState = () => ({
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
    pv_id: null, //id del punto de venta 
    punto_venta_id: null,
    //variables de fecha y direccion de facturacion
    // tipo_entrega: 'retiro',  //despacho
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
    documentos_pdf: [],

    //seleccion de tipo de proyecto 
    proyecto: null,


    //parte de fletes 
    responsable_flete: 'tuval',
    tipo_despacho_id: 1,
    fle_proveedor_id: null,
    fle_valor: 0,
    fle_peso: 0,

    //campo para la facturación forzada a pesar de que tenga limite por fecha de facturacion

});
