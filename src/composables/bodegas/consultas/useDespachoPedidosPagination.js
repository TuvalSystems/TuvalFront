
import { useGenericPagination } from "./useGenericPagination";

export function useDespachoPedidosPagination(puntoVentaId) {
    return  useGenericPagination({
        cacheKey: `despacho-pedidos-${puntoVentaId}`,
        endpoint: `/despachos/guiasdespachadas/${puntoVentaId}`,
    });

  
}