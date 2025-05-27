import { watch } from "vue";
import { useGenericPagination } from "./useGenericPagination";

export function useReposicionesRecibidasPagination(puntoVentaId) {
    return useGenericPagination({
        cacheKey: `reposiciones-recibidas-${puntoVentaId}`,
        endpoint: `/despachos/reposicionesRecibidas/${puntoVentaId}`,
    });

   
}