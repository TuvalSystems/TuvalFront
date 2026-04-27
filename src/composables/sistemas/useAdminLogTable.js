import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";


export function useAdminLogTable() {
    const { run } = useApiAction();
    const ctrl = ref(null); // AbortController actual
    let debounceId;
    const apiList = "/admin/lista-logs";

    const table = reactive({
        items: [],
        currentPage: 1,
        totalPage: 0,
        totalItems: 0,
        filters: {
            fecha_desde: null,
            fecha_hasta: null,
            search: "",
            perpage: "10",
            sortField: "created_at",
            sortOrder: "desc",
        },
        loading: false,
    });
    const loadingRef = toRef(table, "loading");


    const listPerpage = ref([
        { label: "5", value: "5" },
        { label: "10", value: "10" },
        { label: "20", value: "20" },
        { label: "50", value: "50" },
    ]);

    const columns = reactive([
        { label: "ID", key: "id", sortable: true, align: "center" },
        { label: "Acción", key: "action", sortable: true, align: "center" },
        { label: "Mensaje", key: "message", sortable: true, align: "center" },
        {label: "Estado", key: "status", sortable: true, align: "center"},
        {label: "Fecha", key: "created_at", sortable: true, align: "center"},
    ]);

    const estadoClass = (st) => {
    switch (st || "") {
      case "pending":
        return "badge bg-dark text-light fw-semibold";
      case "resolved":
        return "badge bg-success  fw-semibold";
      case "failed":
        return "badge bg-danger  fw-semibold";
      case "warning":
        return "badge bg-warning  fw-semibold";
      default:
        return "badge bg-secondary";
    }
  };



    async function fetchList(page = 1) {
        if (ctrl.value) ctrl.value.abort();
        ctrl.value = new AbortController();
        table.currentPage = page;

        const payload = {
            ...table.filters,
        }
        return run(() => axiosClient.post(apiList, {filters : payload,  page: table.currentPage}, { signal: ctrl.value.signal }), {
            loadingRef,
            latestOnly: true,
            key: `lista-logs`,
            successMessage: "Información obtenida exitosamente.",
            onSuccess: (paginador) => {
                const rows = paginador?.data ?? [];
                table.items = rows;
                table.totalPage = paginador?.last_page ?? 1;
                table.totalItems = paginador?.total ?? 0;
            }
        });
    }

    async function refresh() {
        Object.assign(table.filters, {
            fecha_desde: null,
            fecha_hasta: null,
            search: "",
            perpage: "10",
            sortField: "created_at",
            sortOrder: "desc",
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
        () => [table.filters.sortField, table.filters.sortOrder],
        () => fetchList(1)
    );

    watch(
        () => [table.filters.fecha_desde, table.filters.fecha_hasta],
        () => {
            if (table.filters.fecha_desde && table.filters.fecha_hasta) {
                fetchList(1);
            }
        }
    );

    return {
        table,
        columns,
        loadingRef,
        listPerpage,
        fetchList,
        refresh,
        onSort,
        estadoClass
    };

}