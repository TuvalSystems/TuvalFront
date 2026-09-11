export const QUOTE_API_ROUTES = {
    DRAFTS: {
        LIST: 'borradores/list',
        GET: 'borradores/get',
        SYNC: 'borradores/sync',
        DELETE: 'borradores/delete',
    },
    PROSPECTS: {
        UPDATE: 'cotizaciones/prospecto/actualizar',
        GET_DEFAULT_PRICE_LIST: 'cotizaciones/prospecto/obtener-lista-precio-defecto',
    },

    REMINDERS: {
        LIST_NO_SALE_REASONS: 'cotizaciones/lista-motivos-no-venta',
    },

    QUOTES: {
        LIST_ALTERNATIVE_ITEMS: 'cotizaciones/lista-items-alternativos',
        GET_ITEM_STOCK_BY_WAREHOUSE: 'cotizaciones/articulo-stock-por-bodega',
        GET_ITEM_STOCK_BY_WAREHOUSE_V2: 'cotizaciones/articulo-stock-por-bodega-v2',
        GET_ITEM_MARGIN: 'cotizaciones/obtener-magen-item-l',
        CREATE: 'cotizaciones/crear-cotizacion-v2',
        RECOVER: 'cotizaciones/recuperar-cotizacion-v2',
        RECREATE: 'cotizaciones/volver-a-pedir-cotizacion-v2',
        LIST_HISTORY_INVOICES: 'cotizaciones/lista-facturas-historicas',
    },

    ORDERS: {
        COPY_QUOTE_OR_ORDER: 'pedidos/copiar-cotizacion-o-pedido-v2',
        REORDER: 'pedidos/voler-a-pedir-pedido-v2',
        CREATE: 'pedidos/crear-pedido-v2',
    },

    PROJECTS: {
        LIST_SELLERS: 'cotizaciones/obtener-lista-proyectos',
    },
};
