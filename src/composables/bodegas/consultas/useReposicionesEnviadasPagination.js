
import { useGenericPagination } from "./useGenericPagination";

export function useReposicionesEnviadasPagination(puntoVentaId) {
    return  useGenericPagination({
        cacheKey: `reposiciones-enviadas-${puntoVentaId}`,
        endpoint: `/despachos/reposicionesEnviadas/${puntoVentaId}`,
    });

  
}