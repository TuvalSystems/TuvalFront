import axiosClient from "@/axios";
import { watch, reactive , ref} from "vue";

export function useQuotationReserveRequests() {
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

  const ctrl = ref(null); // AbortController actual
  let debounceId;

  const fetchReservationRequests = async (page = 1) => {
    table.loading = true;
    table.currentPage = page;

    if (ctrl.value) ctrl.value.abort();
    ctrl.value = new AbortController();

    try {
      const response = await axiosClient.get(endpoint, {
        params: {
          page: table.currentPage,
          perPage: table.perPage,
          search: table.searchTerm,
          sortBy: table.sortField,
          sortOrder: table.sortOrder,
        },
        signal: ctrl.value.signal,
      });
      const data = response.data.data;

      if (data) {
        table.items = data.data;
        table.totalPage = data.last_page;
        table.totalItems = data.total;
      }
    } catch (e) {
      table.loading = false;
      if (e?.code !== "ERR_CANCELED" && e?.name !== "CanceledError") {
        error = e?.response?.data?.error || "Error obteniendo cotizaciones";
        console.error(error, e);
      }
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
    fetchReservationRequests(1);
  };

  const onSort = ({ field, order }) => {
    table.sortField = field;
    table.sortOrder = order;
  };

  watch(
    () => [table.searchTerm, table.perPage],
    () => {
      clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        if (table.searchTerm === "" || table.searchTerm.length >= 4) {
          fetchReservationRequests(1);
        }
      }, 250);
    }
  );

  watch(
    () => [table.sortField, table.sortOrder],
    () => fetchReservationRequests(1)
  );

  return {
    table,
    refresh,
    // fetchItemsAproval,
    fetchReservationRequests,
    onSort,
  };
}
