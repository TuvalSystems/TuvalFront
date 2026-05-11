import axiosClient from "@/axios";
import { watch, reactive, ref, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
export function useQuotationReserveRequests() {
  const apiList = "/reservas/lista-solicitudes-reserva";
  const { run } = useApiAction();
    const ctrl = ref(null); // AbortController actual
  let debounceId;
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
    loading: false,
  });
  const loadingRef = toRef(table, "loading");
  const columns = [
    {
      label: "Pto. Venta",
      key: "PTO_VTA_DESCRIPCION",
      clickable: false,
      sortable: true,
      render: (value) => value,
      thClass: " text-center text-muted  text-uppercase fw-bold",
      tdClass: " text-center",
    },
    {
      label: "Cotizacion",
      key: "cotizacion",
      clickable: true,
      sortable: true,
      thClass: " text-center text-muted  text-uppercase fw-bold",
      tdClass: " text-center",
    },
    {
      label: "Fecha",
      key: "created_at",
      clickable: false,
      sortable: true,
      thClass: "d-none d-md-table-cell text-center text-muted  text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell text-center",
    },
    {
      label: "Cliente",
      key: "CLI_RAZON_SOCIAL",
      clickable: false,
      sortable: true,
      thClass: "d-none d-md-table-cell  text-start text-muted  text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell  text-start",
    },
    {
      label: "Total",
      key: "total",
      clickable: false,
      sortable: false,
      render: (value) => value,
      thClass: "text-end text-muted  text-uppercase fw-bold",
      tdClass: "text-end",
    },
    {
      label: "Tipo Reserva",
      key: "tipo_reserva",
      clickable: false,
      sortable: true,
      thClass: "d-none d-md-table-cell text-center text-muted  text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell text-center",
    },
    {
      label: "F. Solicitud",
      key: "fe_solicitud_reserva",
      clickable: false,
      sortable: true,
      thClass: "d-none d-md-table-cell text-muted  text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell",
    },
    {
      label: "Estado",
      key: "estado",
      clickable: false,
      sortable: true,
      thClass: "d-none d-md-table-cell text-muted  text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell",
    },
    {
      label: "Mult.Bod.",
      key: "bodegas_uso",
      clickable: false,
      sortable: true,
      thClass: "d-none d-md-table-cell text-muted  text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell",
    },
    {
      label: "Usuario",
      key: "usuario_solicita",
      clickable: false,
      sortable: true,
      thClass: "text-center text-muted  text-uppercase fw-bold",
      tdClass: "text-center",
    },
  ];

  const listPerpage = ref([
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "20", value: "20" },
    { label: "50", value: "50" },
  ]);



  const fetchReservationRequests = async (page = 1) => {
    if (ctrl.value) ctrl.value.abort();
    ctrl.value = new AbortController();
    table.currentPage = page;
    const payload = {
      page: table.currentPage,
      perPage: table.perPage,
      search: table.searchTerm,
      sortBy: table.sortField,
      sortOrder: table.sortOrder,
      tipoReserva: table.tipoReserva,
      ptovta: table.ptovta,
      cliente: table.cliente,
    }
    return  run(() => axiosClient.post(apiList, payload, { signal: ctrl.value.signal }), {
      loadingRef,
      latestOnly: true,                         // 👈 activa takeLatest
      key: `lista-solicitudes-reserva`,      // 👈 clave para este endpoint
      successMessage: "Proceso realizado exitosamente.",
      onSuccess: (paginador) => {
        const rows = paginador?.data ?? [];
        table.items = rows;
        table.totalPage = paginador?.last_page ?? 1;
        table.totalItems = paginador?.total ?? 0;
      }
    })
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
  switch (String(st || "").toLowerCase()) {
    case "pendiente":
      return "badge rounded-pill bg-dark-subtle text-dark border border-dark-subtle fw-semibold px-3 py-2";

    case "aprobado":
      return "badge rounded-pill bg-success-subtle text-success border border-success-subtle fw-semibold px-3 py-2";

    case "rechazada":
      return "badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle fw-semibold px-3 py-2";

    case "cancelada":
      return "badge rounded-pill bg-warning-subtle text-warning border border-warning-subtle fw-semibold px-3 py-2";

    case "facturado":
      return "badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle fw-semibold px-3 py-2";

    default:
      return "badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle fw-semibold px-3 py-2";
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
