export const PROVIDER_API_ROUTES = {
    LIST: 'ventas/proveedores/lista',
    UPDATED_CARRIER: 'ventas/proveedores/actualizar-estado-transportista',
    UPDATED_STATUS: 'ventas/proveedores/actualizar-estado',
    PROVIDER_CARRIER: 'ventas/proveedores/lista-proveedores-transportista',
    LIST_PROVIDER_ACTIVE: 'ventas/proveedores/lista-proveedores-activos',
    DETAIL: 'ventas/proveedores/detalle',
    SYNC_POINT_SALES_PROVIDER: 'ventas/proveedores/sincronizar-punto-ventas',

    EXTERNAL_FREIGHT: {
        LIST: 'ventas/proveedores/fletes-externos/lista',
        CREATE_REGISTER: 'ventas/proveedores/fletes-externos/crear-registro',
        GET_DETAIL: 'ventas/proveedores/fletes-externos/obtener-detalle',
        UPDATE_REGISTER: 'ventas/proveedores/fletes-externos/actualizar-registro',
        UPDATE_STATUS: 'ventas/proveedores/fletes-externos/actualizar-estado',
        VALIDATE_IDENTITY: 'ventas/proveedores/fletes-externos/validar-identificacion',
        LIST_BY_PROVIDER_SALES_POINT : 'ventas/proveedores/fletes-externos/lista-por-proveedor-punto-venta'
    }

};
