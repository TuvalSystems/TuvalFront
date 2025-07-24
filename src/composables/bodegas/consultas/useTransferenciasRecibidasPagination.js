import { useGenericPagination } from "./useGenericPagination";

export function useReposicionesRecibidasPagination(puntoVentaId) {
    return useGenericPagination({
        cacheKey: `transferencias-recibidas-${puntoVentaId}`,
        endpoint: `/despachos/transferenciasRecibidas/${puntoVentaId}`,
    });
}