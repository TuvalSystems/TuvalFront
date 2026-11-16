// Solo se excluyen indicadores de interfaz al comparar. El payload de la API se conserva.
const itemUiFields = new Set([
    'stockRowLoading', 'disableOpenModalStock', 'disable_delete', 'stockListo',
    'loadingStockWarehouse', 'loadingStockTransit', 'loadingStockExposicion',
    'errorCantidad', 'errorPrecio', 'errorDescripcion', 'errorMontoFlete',
    'cambiar_descripcion', 'cambiar_valor', 'cambiar_descuento', 'cambiar_flete',
]);

export function getDraftSignature(payload) {
    const data = payload.data;
    const comparable = {
        ...payload,
        data: {
            ...data,
            items: (data.items || []).map(item => {
                const fields = Object.fromEntries(Object.entries(item).filter(([key]) => !itemUiFields.has(key)));
                if (Array.isArray(fields.stock)) {
                    fields.stock = fields.stock.map(stock => Object.fromEntries(
                        Object.entries(stock).filter(([key]) => key !== 'error')
                    ));
                }
                return fields;
            }),
        },
    };
    // El orden de propiedades no representa un cambio; el orden de artículos sí.
    return JSON.stringify(comparable, (_key, value) => {
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            return Object.fromEntries(Object.keys(value).sort().map(key => [key, value[key]]));
        }
        return value;
    });
}
