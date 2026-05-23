import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
export function useApprovedReservationsTable() {
  const { run } = useApiAction();
  const ctrl = ref(null); // AbortController actual
  let debounceId;
  const apiList = "/reservas/lista-reserva-aprobadas";
  const table = reactive({
    items: [],
    currentPage: 1,
    totalPage: 0,
    totalItems: 0,
    searchTerm: "",
    perPage: "10",
    sortField: "",
    sortOrder: "desc",
    loading: false,
    fecha_desde: null,
    fecha_hasta: null,
    status: "aprobado",
    cliente: null,
    ptovta: null,
  });
  const loadingRef = toRef(table, "loading");

  const columns = [
    {
      label: "Pto. Venta",
      key: "PTO_VTA_DESCRIPCION",
      clickable: false,
      sortable: true,
      render: (value) => value,
      align: "text-start",
      thClass: "text-muted text-uppercase fw-bold",
      width: "150px",
    },
    {
      label: "Cotización",
      key: "cotizacion",
      clickable: true,
      sortable: true,
      align: "text-center",
      thClass: "text-muted text-uppercase fw-bold",
      width: "120px",
    },
    {
      label: "Fecha",
      key: "cot_created_at",
      clickable: false,
      sortable: true,
      align: "text-center",
      thClass: "d-none d-md-table-cell text-muted text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell",
      width: "150px",
    },
    {
      label: "Cliente",
      key: "CLI_RAZON_SOCIAL",
      clickable: false,
      sortable: true,
      align: "text-start",
      thClass: "d-none d-md-table-cell text-muted text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell",
      width: "260px",
    },
    {
      label: "Total",
      key: "total",
      clickable: false,
      sortable: false,
      render: (value) => value,
      align: "text-end",
      thClass: "text-muted text-uppercase fw-bold",
      width: "120px",
    },
    {
      label: "Tipo Reserva",
      key: "tipo_reserva",
      clickable: false,
      sortable: true,
      align: "text-center",
      thClass: "d-none d-md-table-cell text-muted text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell",
      width: "150px",
    },
    {
      label: "F. Solicitud",
      key: "fe_solicitud_reserva",
      clickable: false,
      sortable: true,
      align: "text-center",
      thClass: "d-none d-md-table-cell text-muted text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell",
      width: "150px",
    },
    {
      label: "Estado",
      key: "estado",
      clickable: false,
      sortable: true,
      align: "text-center",
      thClass: "d-none d-md-table-cell text-muted text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell",
      width: "140px",
    },
    {
      label: "Mult. Bod.",
      key: "bodegas_uso",
      clickable: false,
      sortable: true,
      align: "text-center",
      thClass: "d-none d-md-table-cell text-muted text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell",
      width: "120px",
    },
    {
      label: "F. Aprobación",
      key: "fe_autorizacion_reserva",
      clickable: false,
      sortable: true,
      align: "text-center",
      thClass: "d-none d-md-table-cell text-muted text-uppercase fw-bold",
      tdClass: "d-none d-md-table-cell",
      width: "150px",
    },
  ];

  const listPerpage = ref([
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "20", value: "20" },
    { label: "50", value: "50" },
  ]);

  const listStatus = reactive([
    { label: "Todos", value: "" },
    { label: "Pendientes", value: "pendiente" },
    { label: "Aprobadas", value: "aprobado" },
    { label: "Rechazadas", value: "rechazada" },
    { label: "Canceladas", value: "cancelado" },
    { label: "Procesadas", value: "procesado" },
    { label: "Traslados", value: "traslado" },
  ]);

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

      case "procesado":
        return "badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle fw-semibold px-3 py-2";

      case "traslado":
        return "badge rounded-pill bg-info-subtle text-info border border-info-subtle fw-semibold px-3 py-2";

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



  async function fetchList(page = 1) {
    if (ctrl.value) ctrl.value.abort();
    ctrl.value = new AbortController();
    table.currentPage = page;
    const payload = {
      page: table.currentPage,
      perPage: table.perPage,
      search: table.searchTerm,
      sortBy: table.sortField,
      sortOrder: table.sortOrder,
      fecha_desde: table.fecha_desde,
      fecha_hasta: table.fecha_hasta,
      status: table.status,
      ptovta: table.ptovta,
      cliente: table.cliente,
    }
    return run(() => axiosClient.post(apiList, payload, { signal: ctrl.value.signal }), {
      loadingRef,
      latestOnly: true,                         // 👈 activa takeLatest
      key: `lista-reserva-aprobadas`,      // 👈 clave para este endpoint
      successMessage: "Proceso realizado exitosamente.",
      onSuccess: (paginador) => {
        const rows = paginador?.data ?? [];
        table.items = rows;
        table.totalPage = paginador?.last_page ?? 1;
        table.totalItems = paginador?.total ?? 0;
      }
    })

  }

  const refresh = () => {
    table.fecha_desde = null;
    table.fecha_hasta = null;
    table.searchTerm = "";
    table.perPage = "10"; // Reset to default perPage value
    table.sortField = "";
    table.sortOrder = "desc";
    table.currentPage = 1; // Reset to first page
    table.status = "aprobado";
    table.ptovta = null;
    table.cliente = null; // Reset cliente filter
    fetchList(1); //consulta de nuevo
  };

  const onSort = ({ field, order }) => {
    table.sortField = field;
    table.sortOrder = order;
  };

  watch(
    () => [
      table.searchTerm,
      table.perPage,
      table.status,
      table.ptovta,
      table.cliente,
    ],
    () => {
      clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        if (table.searchTerm === "" || table.searchTerm.length >= 4) {
          fetchList(1);
        }
      }, 250);
    }
  );

  watch(
    () => [table.sortField, table.sortOrder],
    () => fetchList(1)
  );

  watch(
    () => [table.fecha_desde, table.fecha_hasta],
    () => {
      if (table.fecha_desde && table.fecha_hasta) {
        fetchList(1)
      }
    }
  );
  return {
    columns,
    listPerpage,
    listStatus,
    table,
    fetchList,
    onSort,
    refresh,

    //actions
    estadoClass,
    totalClass,
  };
}
