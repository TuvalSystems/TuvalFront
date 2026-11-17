import { reactive, watch, toRef, onScopeDispose } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { LIST_PER_PAGE_OPTIONS } from "@/constants/tableOptions";
import { getStatusBadgeClass, getBadgeClassByVariant } from "@/helpers/statusBadge";
import axiosClient from "@/axios";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";

export function useQuotationsTable(getPuntoVentaId) {
  const { run, invalidate } = useApiAction();
  const defaultFilters = () => ({
    search: "", perPage: "10", sortField: "created_at", sortOrder: "desc",
    estado: "pendientes", fecha_desde: null, fecha_hasta: null, cotizacion_filtro: "",
  });
  const table = reactive({
    items: [], loading: false, error: "", currentPage: 1,
    totalPage: 0, totalItems: 0, filters: defaultFilters(),
  });
  const listStatus = [
    { label: "Todos", value: "" },
    { label: "Pendientes", value: "pendientes" },
    { label: "Procesadas", value: "procesadas" },
    { label: "Prospectos", value: "prospectos" },
    { label: "Caducadas", value: "caducado" },
    { label: "Rechazadas", value: "rechazadas" },
  ];
  let controller;
  const requestKey = "lista-cotizaciones";
  const loadingRef = toRef(table, "loading");
  const errorRef = toRef(table, "error");
  let debounce;
  const columns = [
    ["cotizacion", "Cotización"], ["CLI_RAZON_SOCIAL", "Cliente"], ["CLI_RUC", "RUC"],
    ["USERID", "Usuario"], ["COND_ID", "Cond. Pago"], ["created_at", "Fecha/hora"],
    ["total", "Total"], ["estado", "Estado"], ["venta", "Facturación"],
  ].map(([key, label]) => ({
    key, label, sortable: key !== "venta",
    align: key === "total" ? "text-end" : "text-start"
  }));

  async function fetchList(page = table.currentPage) {
    clearTimeout(debounce);
    controller?.abort();
    controller = new AbortController();
    table.currentPage = page;
    const query = { ...table.filters, pv_id: getPuntoVentaId() };
    const result = await run(
      () => axiosClient.post(QUOTE_API_ROUTES.QUOTES.LIST,
        { ...query, page: table.currentPage }, { signal: controller.signal }),
      {
        loadingRef,
        errorRef,
        latestOnly: true,
        key: requestKey,
        onSuccess: (paginator) => {
          table.items = paginator.data;
          table.currentPage = paginator.current_page;
          table.totalPage = paginator.last_page;
          table.totalItems = paginator.total;
        },
        onError: () => { table.items = []; },
      }
    );
    if (result.ok && !result.stale && table.currentPage > table.totalPage) {
      return fetchList(table.totalPage);
    }
    return result;
  }
  const estadoClass = (status) => getStatusBadgeClass(status, "documento");

  function getReminderClass(row) {
    if (row.recordatorioventa == 1) return getBadgeClassByVariant("info");
    if (row.recordatorioventa == 0) {
      return getBadgeClassByVariant(
        row.cotizacion_venta_motivo_id != null || row.recordar == 1 ? "success" : "warning"
      );
    }
    return getBadgeClassByVariant("danger");
  }

  function onSort({ field, order }) {
    table.filters.sortField = field;
    table.filters.sortOrder = order;
  }

  function refresh() {
    Object.assign(table.filters, defaultFilters());
    return fetchList(1);
  }

  function clearDates() {
    table.filters.fecha_desde = null;
    table.filters.fecha_hasta = null;
  }

  watch(
    () => ({ ...table.filters, pv_id: getPuntoVentaId() }),
    () => {
      controller?.abort();
      invalidate(requestKey);
      table.currentPage = 1;
      clearTimeout(debounce);
      debounce = setTimeout(() => fetchList(1), 350);
    },
    { flush: "sync" }
  );
  onScopeDispose(() => { invalidate(requestKey); clearTimeout(debounce); controller?.abort(); });
  return { table, columns, listStatus, listPerpage: LIST_PER_PAGE_OPTIONS, fetchList, onSort, refresh, clearDates, estadoClass, getReminderClass };
}
