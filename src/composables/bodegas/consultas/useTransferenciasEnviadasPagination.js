import { useGenericPagination } from "./useGenericPagination";

export function useTransferenciasEnviadasPagination(puntoVentaId) {
    return useGenericPagination({
        cacheKey: `transferencias-enviadas-${puntoVentaId}`,
        endpoint: `/despachos/transferenciasEnviadas/${puntoVentaId}`,
    });
}