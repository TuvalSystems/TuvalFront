export const APPROVAL_API_ROUTES = {
    ORDERS: {
        VERIFY_STOCK: 'aprobaciones/verificar-stock-pedido',
    },

    COMMERCIAL: {
        QUOTES: {
            LIST_PENDING: 'aprobaciones/comercial/lista-cotizaciones-pendientes',
            LIST_PENDING_QUERY: 'aprobaciones/comercial/consulta/lista-cotizaciones-pendientes',
            CHANGE_STATUS: 'aprobaciones/comercial/rechazar-cotizacion-estado-espera',
        },

        ORDERS: {
            LIST_PENDING: 'aprobaciones/comercial/lista-pedidos-pendientes',
            LIST_PENDING_QUERY: 'aprobaciones/comercial/consulta/lista-pedidos-pendientes',
            CHANGE_STATUS: 'aprobaciones/comercial/rechazar-pedido-estado-espera',
            APPROVE: 'aprobaciones/comercial/aprobar-pedido',
            REJECT: 'aprobaciones/comercial/rechazar-pedido',
            REJECT_BY_STOCK: 'aprobaciones/comercial/rechazar-pedido-stock',
        },
    },

    CREDIT: {
        ORDERS: {
            LIST_PENDING: 'aprobaciones/crediticia/lista-pedidos-pendientes',
            DETAIL: 'aprobaciones/crediticia/detalle-pedido',
            CUSTOMER_ACCOUNT_STATUS: 'aprobaciones/crediticia/estado-cuenta',
            APPROVE: 'aprobaciones/crediticia/aprobar-pedido',
            REJECT: 'aprobaciones/crediticia/rechazar-pedido',
            REJECT_BY_STOCK: 'aprobaciones/crediticia/rechazar-pedido-stock',
        },
    },
};
