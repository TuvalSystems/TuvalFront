import { watch, onScopeDispose } from "vue";
import axiosClient from "../../../axios";
import { usePaginationCacheStore } from "../../../stores/bodegas/consultas/usePaginationCacheStore";

export function useGenericPagination({ cacheKey, endpoint }) {
  const store = usePaginationCacheStore();
  store.initTable(cacheKey);
  const table = store.getTable(cacheKey); // todas las refs viven aquí
  let controller;
  const fetchItems = async (page = 1) => {
    controller?.abort();
    const request = new AbortController();
    controller = request;
    table.loading = true;
    table.error = "";
    table.currentPage = page;

    try {
      const response = await axiosClient.get(endpoint, {
        signal: request.signal,
        params: {
          page: table.currentPage,
          perPage: table.perPage,
          search: table.searchTerm,
          sortBy: table.sortField,
          sortOrder: table.sortOrder,
          fecha_desde: table.fecha_desde,
          fecha_hasta: table.fecha_hasta,
          cliente: table.cliente,
          ptovta: table.ptovta,
        },
      });

      if (request.signal.aborted) return;
      const data = response.data.data;
      if (response.data.success === false || !data) {
        throw new Error(response.data.error || response.data.message || "No se pudo consultar el listado.");
      }
      if (data) {
        table.items = data.data;
        table.totalPage = data.last_page;
        table.totalItems = data.total;
      }
    } catch (error) {
      if (!request.signal.aborted && error.code !== 'ERR_CANCELED' && !error.handledByRedirect) {
        table.error = error.response?.data?.error || error.response?.data?.message || error.message || "No se pudo consultar el listado.";
      }
    } finally {
      if (controller === request) table.loading = false;
    }
  };
  onScopeDispose(() => controller?.abort());

  watch(
    () => [
      table.searchTerm,
      table.perPage,
      table.sortField,
      table.sortOrder,
      table.cliente,
      table.ptovta,
    ],
    () => {
      if (table.searchTerm == "" || table.searchTerm.length >= 4) {
        fetchItems(1);
      }
    },
    { deep: true }
  );

  watch(
    () => [table.fecha_desde, table.fecha_hasta],
    () => {
      if (table.fecha_desde && table.fecha_hasta) {
        fetchItems(1);
      }
    },
    { deep: true }
  );

  const refresh = () => {
    // const newTable = store.getTable(cacheKey);
    store.clearTable(cacheKey); // borra cache
    store.initTable(cacheKey); // reinicia referencias
    table.fecha_desde = null;
    table.fecha_hasta = null;
    table.searchTerm = "";
    table.perPage = 10; // Reset to default perPage value
    table.sortField = "";
    table.sortOrder = "desc";
    table.currentPage = 1; // Reset to first page
    table.cliente = null; // Reset cliente filter
    table.ptovta = null;
    fetchItems(1); //consulta de nuevo
  };

  const onSort = ({ field, order }) => {
    table.sortField = field;
    table.sortOrder = order;
  };

  /** limpiar filto de fecha */
  const limpiarFecha = () => {
    table.fecha_desde = null;
    table.fecha_hasta = null;
    fetchItems(1);
  };


  return {
    table,
    fetchItems,
    refresh,
    onSort,
    limpiarFecha
  };
}
