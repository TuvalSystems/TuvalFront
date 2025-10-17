import axiosClient from "@/axios";
import { watch, reactive, ref } from "vue";

export function useQuotationReserveRequests() {
  const endpoint = "/reservas/lista-solicitudes-reserva";
  const table = reactive({
    items: [],
    currentPage: 1,
    totalPage: 0,
    totalItems: 0,
    searchTerm: "",
    perPage: "10",
    sortField: "",
    sortOrder: "desc",
    cliente: null,
    ptovta: null,
    tipoReserva: null,
  }); // todas las refs viven aqui

  const columns = [
    {
      label: "Pto. Venta",
      key: "PTO_VTA_DESCRIPCION",
      clickable: false,
      sortable: true,
      render: (value) => value,
      thClass: " text-center",
      tdClass: " text-center",
    },
    {
      label: "Cotizacion",
      key: "cotizacion",
      clickable: true,
      sortable: true,
      thClass: " text-center",
      tdClass: " text-center",
    },
    {
      label: "Fecha",
      key: "cot_created_at",
      clickable: false,
      sortable: true,
      thClass: "d-none d-md-table-cell text-center",
      tdClass: "d-none d-md-table-cell text-center",
    },
    {
      label: "Cliente",
      key: "CLI_RAZON_SOCIAL",
      clickable: false,
      sortable: true,
      thClass: "d-none d-md-table-cell  text-start",
      tdClass: "d-none d-md-table-cell  text-start",
    },
    {
      label: "Total",
      key: "total",
      clickable: false,
      sortable: false,
      render: (value) => value,
      thClass: "text-end",
      tdClass: "text-end",
    },
    {
      label: "Tipo Reserva",
      key: "tipo_reserva",
      clickable: false,
      sortable: true,
      thClass: "d-none d-md-table-cell text-center",
      tdClass: "d-none d-md-table-cell text-center",
    },
    {
      label: "F. Solicitud",
      key: "fe_solicitud_reserva",
      clickable: false,
      sortable: true,
      thClass: "d-none d-md-table-cell",
      tdClass: "d-none d-md-table-cell",
    },
    {
      label: "Estado",
      key: "estado",
      clickable: false,
      sortable: true,
      thClass: "d-none d-md-table-cell",
      tdClass: "d-none d-md-table-cell",
    },
    {
      label: "Mult.Bod.",
      key: "tipo_traslado",
      clickable: false,
      sortable: true,
      thClass: "d-none d-md-table-cell",
      tdClass: "d-none d-md-table-cell",
    },
    {
      label: "Usuario",
      key: "usuario_solicita",
      clickable: false,
      sortable: true,
      thClass: "text-center",
      tdClass: "text-center",
    },
  ];

  const listPerpage = ref([
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "20", value: "20" },
    { label: "50", value: "50" },
  ]);

  const ctrl = ref(null); // AbortController actual
  let debounceId;

  const fetchReservationRequests = async (page = 1) => {
    if (ctrl.value) ctrl.value.abort();
    ctrl.value = new AbortController();

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
          tipoReserva: table.tipoReserva,
          ptovta: table.ptovta,
          cliente: table.cliente,
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
    table.sortOrder = "desc";
    table.currentPage = 1;
    table.cliente = null;
    table.ptovta = null;
    table.tipoReserva = null;
    fetchReservationRequests(1);
  };

  const onSort = ({ field, order }) => {
    table.sortField = field;
    table.sortOrder = order;
  };

  const estadoClass = (st) => {
    switch (st || "") {
      case "pendiente":
        return "badge bg-dark text-light fw-semibold";
      case "aprobado":
        return "badge bg-success  fw-semibold";
      case "rechazada":
        return "badge bg-danger  fw-semibold";
      case "cancelada":
        return "badge bg-warning  fw-semibold";
      case "facturado":
        return "badge bg-success  fw-semibold";
      default:
        return "badge bg-secondary";
    }
  };

  const totalClass = (total) => {
    if (total > 0) {
      return "text-end fw-semibold";
    }
    return "text-end fw-semibold";
  };

  watch(
    () => [table.searchTerm, table.perPage, table.ptovta, table.cliente, table.tipoReserva],
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
    //state
    columns,
    listPerpage,
    table,
    refresh,
    //actions
    fetchReservationRequests,
    onSort,
    estadoClass,
    totalClass,
  };
}
