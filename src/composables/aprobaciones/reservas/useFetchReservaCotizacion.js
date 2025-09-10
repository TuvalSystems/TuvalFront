import axiosClient from "@/axios";
import { watch, reactive } from "vue";

export function useFetchReservaCotizacion() {
  const endpoint = "/cotizaciones/reserva/lista-solicitudes-reserva";
  const table = reactive({
    items: [],
    currentPage: 1,
    totalPage: 0,
    totalItems: 0,
    searchTerm: "",
    perPage: "10",
    sortField: "",
    sortOrder: "asc",
  }); // todas las refs viven aqui

  const fetchItemsAproval = async (page = 1) => {
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
      }
    } catch (error) {
      console.error("Error obteniendo cotizaciones:", error);
    } finally {
      table.loading = false;
    }
  };

  const refresh = () => {
    table.searchTerm = "";
    table.perPage = "10"; // Reset to default perPage value
    table.sortField = "";
    table.sortOrder = "asc";
    table.currentPage = 1;
    fetchItemsAproval(1);
  };

  const onSort = ({ field, order }) => {
    table.sortField = field;
    table.sortOrder = order;
  };

  watch(
    () => [table.searchTerm, table.perPage, table.sortField, table.sortOrder],
    () => {
      if (table.searchTerm == "" || table.searchTerm.length >= 4) {
        fetchItemsAproval(1);
      }
    },
    { deep: true }
  );

  return {
    table,
    refresh,
    fetchItemsAproval,
    onSort,
  };
}
