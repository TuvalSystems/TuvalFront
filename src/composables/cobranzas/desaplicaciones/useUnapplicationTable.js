import axiosClient from "@/axios";
import { watch, ref, reactive, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { getStatusBadgeClass } from "@/helpers/statusBadge";
import { LIST_PER_PAGE_OPTIONS } from "@/constants/tableOptions";
export function useUnapplicationTable() {
  const { run } = useApiAction();
  const ctrl = ref(null);
  let debounceId;
  const apiList = "cobranzas/desaplicaciones/lista";
  const table = reactive({
    items: [],
    currentPage: 1,
    totalPage: 0,
    totalItems: 0,
    filters: {
      perpage: "10",
      fecha_desde: null,
      fecha_hasta: null,
      search: "",
      cliente: "",
      sortField: "primera_fecha_aplicacion",
      sortOrder: "desc",
    },
    loading: false,
  });
  const loadingRef = toRef(table, "loading");

  const columns = reactive([
    { label: "cliente", key: "cliente", sortable: true, align: "text-start", thClass: "text-muted text-uppercase fw-bold", },
    { label: "ruc", key: "ruc", sortable: true, align: "text-start", thClass: "text-muted text-uppercase fw-bold", width: "100px" },
    { label: "factura", key: "factura", sortable: true, align: "text-start", thClass: "text-muted text-uppercase fw-bold", width: "150px" },
    { label: "recibos web", key: "recibos", sortable: false, align: "text-start", thClass: "text-muted text-uppercase fw-bold", },
    { label: "Aplicaciones Web", key: "documentos_gp", sortable: false, align: "text-start", thClass: "text-muted text-uppercase fw-bold", },
    { label: "tipo", key: "tipos_medio", sortable: false, align: "text-start", thClass: "text-muted text-uppercase fw-bold", },
    { label: "Usuarios", key: "usuarios_creadores", sortable: false, align: "text-center", thClass: "text-muted text-uppercase fw-bold", },
    { label: "total Aplicado", key: "total_aplicado", sortable: false, align: "text-end", thClass: "text-muted text-uppercase fw-bold", width: "50px" },
  ]);

  async function fetchList(page = 1) {
    if (ctrl.value) ctrl.value.abort();
    ctrl.value = new AbortController();
    table.currentPage = page;

    const payload = {
      ...table.filters,
    };

    return run(
      () =>
        axiosClient.post(
          apiList,
          { filters: payload, page: table.currentPage },
          { signal: ctrl.value.signal },
        ),
      {
        loadingRef,
        latestOnly: true,
        key: `lista-cobros-aplicados`,
        successMessage: "Información Obtenida",
        onSuccess: (paginador) => {
          const rows = paginador?.data ?? [];
          table.items = rows;
          table.totalPage = paginador?.last_page ?? 1;
          table.totalItems = paginador?.total ?? 0;
        },
      },
    );
  }

  async function refresh() {
    Object.assign(table.filters, {
      fecha_desde: null,
      fecha_hasta: null,
      search: "",
      perpage: "10",
      sortField: "primera_fecha_aplicacion",
      sortOrder: "desc",
      cliente: null
    });
    table.currentPage = 1;
    await fetchList(1);
  }

  const onSort = ({ field, order }) => {
    table.filters.sortField = field;
    table.filters.sortOrder = order;
  };


  watch(
    () => [table.filters.search, table.filters.perpage],
    () => {
      clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        if (table.filters.search === "" || table.filters.search.length >= 4) {
          fetchList(1);
        }
      }, 350);
    }
  );

    watch(
        () => [table.filters.cliente],
        () => fetchList(1)
    );
  watch(
    () => [table.filters.sortField, table.filters.sortOrder],
    () => fetchList(1)
  );

  return {
    table,
    columns,
    loadingRef,
    listPerpage: LIST_PER_PAGE_OPTIONS,
    fetchList,
    refresh,
    onSort
  };
}
