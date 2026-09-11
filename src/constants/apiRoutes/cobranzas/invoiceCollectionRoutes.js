export const INVOICE_COLLECTION_API_ROUTES = {
    CASH_BOX: {
        STATUS: 'cobranzas/cobros-facturas/estado-caja',
        OPEN: 'cobranzas/cobros-facturas/aperturar-caja',
        CLOSE: 'cobranzas/cierre-cajas/cerrar',
        SUMMARY: 'cobranzas/cierre-cajas/resumen',
        PRINT_PDF: 'cobranzas/pdf/cierre-caja',
    },

    ACCOUNT_STATEMENTS: {
        DOWNLOAD_PDF: 'cobranzas/cobros-facturas/imprimir-estado-cuenta-pdf',
        DOWNLOAD_EXCEL: 'cobranzas/cobros-facturas/imprimir-estado-cuenta-excel',
    },

    CLIENTS: {
        INVOICES: 'cobranzas/cobros-facturas/facturas-cliente',
        PENDING_APPLICATIONS: 'cobranzas/cobros-facturas/aplicaciones-pendientes',
    },

    BANKS: {
        LIST: 'cobranzas/cobros-facturas/obtener-bancos',
    },

    RECEIPTS: {
        VALIDATE_NUMBER: 'cobranzas/cobros-facturas/verificar-comprobante',
        VALIDATE_DEPOSIT_NUMBER: 'cobranzas/cobros-facturas/verificar-comprobante-deposito',
        VALIDATE_CHECK: 'cobranzas/cobros-facturas/verificar-cheque',
    },

    COLLECTIONS: {
        VALIDATE: 'cobranzas/cobros-facturas/validar-cobros',
        LIST: 'cobranzas/cobros-facturas/lista-cobros-registrados',
        REGISTER: 'cobranzas/cobros-facturas/registrar-cobro',
        DOWNLOAD_PDF: 'cobranzas/cobros-facturas/imprimir-cobro',
    },
};
