import { ref } from "vue";
import axiosClient from "../../../axios";
import { usePaginationCacheStore } from "../../../stores/bodegas/consultas/usePaginationCacheStore";

export function useGenericPagination({ cacheKey, endpoint }) {
  const store = usePaginationCacheStore();
  store.initTable(cacheKey);
  const table = store.getTable(cacheKey); // todas las refs viven aquí
;

  const fetchItems = async (page = 1) => {
    table.loading = true;
    table.currentPage = page;

    try {
      const response = await axiosClient.get(endpoint, {
        params: {
          page: table.currentPage,
          perPage: table.perPage,
          search: table.searchTerm,
          sortBy: table.sortField,
          sortOrder: table.sortOrder,
        },
      });

      const data = response.data.data;
      if (data) {
        table.items = data.data;
        table.totalPage = data.last_page;
        table.totalItems = data.total;

        // Guardar en caché
        // store.setData(cacheKey, {
        //   items: items.value,
        //   currentPage: currentPage.value,
        //   totalPage: totalPage.value,
        //   totalItems: totalItems.value,
        //   sortField: sortField.value,
        //   sortOrder: sortOrder.value,
        //   perPage: perPage.value,
        // });
      }
    } catch (error) {
      console.error("Error fetching items:", error);
    } finally {
      table.loading = false;
    }
  };

  const refresh = () => {
    store.clearTable(cacheKey); // borra cache
    store.initTable(cacheKey); // reinicia referencias
    const newTable = store.getTable(cacheKey);
    fetchItems(1); //consulta de nuevo
  };

  return {
    table,
    fetchItems,
    refresh,
  };
}
