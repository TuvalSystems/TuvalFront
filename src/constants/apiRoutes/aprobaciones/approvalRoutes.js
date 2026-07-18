export const APPROVAL_API_ROUTES = {
    

    VERIFICAR_STOCK_PEDIDOS_APROBACIONES :"aprobaciones/verificar-stock-pedido",

    //cotizaciones
    // comercial
    COMERCIAL_LISTA_COTIZACIONES_PENDIENTES : "aprobaciones/comercial/lista-cotizaciones-pendientes",
    COMERCIAL_LISTA_COTIZACIONES_PENDIENTES_CONSULTA : "aprobaciones/comercial/consulta/lista-cotizaciones-pendientes",
    COMERCIAL_CAMBIAR_ESTADO_COTIZACION: "aprobaciones/comercial/rechazar-cotizacion-estado-espera",
    
    //pedidos 
    // comercial
    COMERCIAL_LISTA_PEDIDOS_PENDIENTES : "aprobaciones/comercial/lista-pedidos-pendientes",
    COMERCIAL_LISTA_PEDIDOS_PENDIENTES_CONSULTA : "aprobaciones/comercial/consulta/lista-pedidos-pendientes",
    COMERCIAL_CAMBIAR_ESTADO_PEDIDO : "aprobaciones/comercial/rechazar-pedido-estado-espera",

    COMERCIAL_APROBAR_PEDIDO: "aprobaciones/comercial/aprobar-pedido",
    COMERCIAL_RECHAZAR_PEDIDO: "aprobaciones/comercial/rechazar-pedido",
    COMERCIAL_RECHAZAR_PEDIDO_POR_STOCK: "aprobaciones/comercial/rechazar-pedido-stock",

    //crediticia
    CREDITICIA_LISTA_PEDIDOS_PENDIENTES : 'aprobaciones/crediticia/lista-pedidos-pendientes',
    CREDITICIA_DETALLE_PEDIDO : 'aprobaciones/crediticia/detalle-pedido',
    CREDITICIA_ESTADO_CUENTA_PEDIDO_CLIENTE : 'aprobaciones/crediticia/estado-cuenta',
    CREDITICIA_APROBAR_PEDIDO : "aprobaciones/crediticia/aprobar-pedido",
    CREDITICIA_RECHAZAR_PEDIDO :"aprobaciones/crediticia/rechazar-pedido",
    CREDITICIA_RECHAZAR_PEDIDO_STOCK :"aprobaciones/crediticia/rechazar-pedido-stock"
}