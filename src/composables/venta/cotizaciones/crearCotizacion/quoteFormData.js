export function buildQuotationFormData(data, mode) {
    const formData = new FormData();

    //datos de la cotizacion 
    if (data.cotizacion_id) {
        formData.append('cotizacion_id', data.cotizacion_id);
    }
    formData.append('mode', mode);
    //datos del cliente
    formData.append('cliente_id', data.cliente.id);
    // formData.append('ruc', data.cliente.CLI_RUC);
    // formData.append('razon_social', data.cliente.CLI_RAZON_SOCIAL);
    formData.append('correo_electronico_sri', data.cliente.CLI_CORREO_ELECT_SRI);
    // formData.append('vendedor_id', data.cliente.gpvendedor.VEND_ID);
    // formData.append('vendedor_nombres', data.cliente.gpvendedor.VEND_NOMBRES);
    // formData.append('vendedor_apellidos', data.cliente.gpvendedor.VEND_APELLIDOS);

    //variables de punto de venta y bodega de facturacion
    formData.append('punto_venta_id', data.punto_venta_id);
    formData.append('pv_id', data.pv_id);
    formData.append('bodega_facturacion', data.bodega_facturacion);

    //variables de fecha y direccion de facturacion
    // formData.append('tipo_entrega', data.tipo_entrega); //despacho o retiro
    formData.append('fecha_entrega', data.fecha_entrega);
    formData.append('direccion_facturacion_id', data.direccion_facturacion_id);
    formData.append('direccion_entrega_id', data.direccion_entrega_id);
    // variables de facturacion posterior (Booleanos)
    formData.append('factura_posterior_despacho', data.factura_posterior_despacho);
    formData.append('factura_a_demanda', data.factura_a_demanda);
    formData.append('factura_siguiente_mes', data.factura_siguiente_mes);

    /**
     * condicion para que se genere la factura sin considerar las factura a demanda
     * factura posterior despacho y factura a siguiente mes
     */
    formData.append('facturar_ahora', data.facturar_ahora)

    //condiciones y formas de pago 
    formData.append('condicion_pago_id', data.condicion_pago_id);
    formData.append('condicion_pago_original_id', data.condicion_pago_original_id);
    formData.append('forma_pago_id', data.forma_pago_id);

    //descuentos de articulo y descuento original
    formData.append('descuento_articulo', data.descuento_articulo);
    formData.append('descuento_original', data.descuento_original);

    //notas
    formData.append('nota_interna', data.nota_interna);
    formData.append('nota_cliente', data.nota_cliente);
    formData.append('nota_operaciones', data.nota_operaciones);

    //orden de compra
    formData.append('orden_de_compra', data.orden_de_compra);

    //registro copia
    formData.append('registro_copia', data.registro_copia);

    //calculos
    formData.append('subtotal', data.subtotal);
    formData.append('peso', data.peso);
    formData.append('descuento', data.descuento);
    formData.append('iva', data.iva);
    formData.append('total', data.total);

    //modificador global
    formData.append('modificador_global', data.modificador_global);
    formData.append('proyecto', data.proyecto);
    //items de cotizacion
    formData.append('items', JSON.stringify(data.items));
    formData.append('origen', data.origen || 'cotizacion');
    //imagenes de operaciones
    if (data.imagenesoperaciones && data.imagenesoperaciones.length > 0) {
        data.imagenesoperaciones.forEach((item, index) => {
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
    if (data.documentos_pdf && data.documentos_pdf.length > 0) {
        data.documentos_pdf.forEach((item, index) => {
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

    //paqueteria
    formData.append('responsable_flete', data.responsable_flete);
    formData.append('tipo_despacho_id', data.tipo_despacho_id);
    formData.append('fle_proveedor_id', data.fle_proveedor_id);
    formData.append('fle_valor', data.fle_valor);
    formData.append('fle_peso', data.fle_peso);
    return formData;
}

export function buildOrderFormData(data) {
    const formData = new FormData();
    formData.append('mode', 'crear_pedido');
    formData.append('cotizacion_id', data.cotizacion_id);
    formData.append('cliente_id', data.cliente.id);
    formData.append('ruc', data.cliente.CLI_RUC);
    formData.append('razon_social', data.cliente.CLI_RAZON_SOCIAL);
    formData.append('correo_electronico_sri', data.cliente.CLI_CORREO_ELECT_SRI);
    formData.append('vendedor_id', data.cliente.gpvendedor.VEND_ID);
    formData.append('vendedor_nombres', data.cliente.gpvendedor.VEND_NOMBRES);
    formData.append('vendedor_apellidos', data.cliente.gpvendedor.VEND_APELLIDOS);


    //variables de punto de venta y bodega de facturacion
    formData.append('punto_venta_id', data.punto_venta_id);
    formData.append('pv_id', data.pv_id);
    formData.append('bodega_facturacion', data.bodega_facturacion);

    //variables de fecha y direccion de facturacion
    formData.append('tipo_entrega', data.tipo_entrega); //despacho o retiro
    formData.append('fecha_entrega', data.fecha_entrega);
    formData.append('direccion_facturacion_id', data.direccion_facturacion_id);
    formData.append('direccion_entrega_id', data.direccion_entrega_id);
    // variables de facturacion posterior (Booleanos)
    formData.append('factura_posterior_despacho', data.factura_posterior_despacho);
    formData.append('factura_a_demanda', data.factura_a_demanda);
    formData.append('factura_siguiente_mes', data.factura_siguiente_mes);


    //condiciones y formas de pago 
    formData.append('condicion_pago_id', data.condicion_pago_id);
    formData.append('condicion_pago_original_id', data.condicion_pago_original_id);
    formData.append('forma_pago_id', data.forma_pago_id);

    //descuentos de articulo y descuento original
    formData.append('descuento_articulo', data.descuento_articulo);
    formData.append('descuento_original', data.descuento_original);

    //notas
    formData.append('nota_interna', data.nota_interna);
    formData.append('nota_cliente', data.nota_cliente);
    formData.append('nota_operaciones', data.nota_operaciones);

    //orden de compra
    formData.append('orden_de_compra', data.orden_de_compra);

    //registro copia
    formData.append('registro_copia', data.registro_copia);

    //calculos
    formData.append('subtotal', data.subtotal);
    formData.append('peso', data.peso);
    formData.append('fle_peso', data.fle_peso);
    formData.append('descuento', data.descuento);
    formData.append('iva', data.iva);
    formData.append('total', data.total);

    //modificador global
    formData.append('modificador_global', data.modificador_global);
    formData.append('origen', data.origen);
    formData.append('items', JSON.stringify(data.items));

    formData.append('proyecto', data.proyecto);
    //imagenes de operaciones
    if (data.imagenesoperaciones && data.imagenesoperaciones.length > 0) {
        data.imagenesoperaciones.forEach((item, index) => {
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
    if (data.documentos_pdf && data.documentos_pdf.length > 0) {
        data.documentos_pdf.forEach((item, index) => {
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

    //paqueteria
    formData.append('responsable_flete', data.responsable_flete);
    formData.append('tipo_despacho_id', data.tipo_despacho_id);
    formData.append('fle_proveedor_id', data.fle_proveedor_id);
    formData.append('fle_valor', data.fle_valor);
    formData.append('facturar_ahora', data.facturar_ahora);
    return formData;
}
