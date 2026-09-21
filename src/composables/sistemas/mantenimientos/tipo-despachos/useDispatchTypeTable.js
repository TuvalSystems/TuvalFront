import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { getStatusBadgeClass } from "@/helpers/statusBadge";
import { LIST_PER_PAGE_OPTIONS } from "@/constants/tableOptions";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";

export function useDispatchTypeTable() {

    const { run } = useApiAction();
    const ctrl = ref(null);
    let debounceId;

    const table = reactive({
        items: [],
        currentPage: 1,
        totalPage: 0,
        totalItems: 0,
        filters: {
            search: "",
            perpage: "10",
            sortField: "created_at",
            sortOrder: "desc",
            // estado: ""
        },
        loading: false,
    });
    const loadingRef = toRef(table, "loading");

    const estadoClass = (st) => getStatusBadgeClass(st, 'boolean');
    const booleanBadgeClass = (value) => {
        return value
            ? "badge rounded-pill bg-success-subtle text-success border border-success-subtle fw-semibold px-3 py-2"
            : "badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle fw-semibold px-3 py-2";
    };

    const columns = reactive([
        { label: "ID", key: "id", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold", width: "80px" },
        { label: "descripción", key: "descripcion", sortable: true, align: "text-start", thClass: "text-muted text-uppercase fw-bold text-end" },
        { label: "observación", key: "observacion", sortable: true, align: "text-start", thClass: "text-muted text-uppercase fw-bold text-end" },
        { label: "estado", key: "estado", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold", width: "120px" },
        { label: "F. creación", key: "created_at", sortable: false, align: "text-center", thClass: "text-muted  text-uppercase fw-bold", width: "170px" },


    ]);

    async function fetchList(page = 1) {
        if (ctrl.value) ctrl.value.abort();
        ctrl.value = new AbortController();
        table.currentPage = page;
        const payload = {
            ...table.filters,
        }
        return run(() => axiosClient.post(QUOTE_API_ROUTES.DISPATCH_TYPE.LIST, { filters: payload, page: table.currentPage }, { signal: ctrl.value.signal }), {
            loadingRef,
            latestOnly: true,
            key: `lista-tipo-despachos`,
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
        () => [table.filters.estado],
        () => fetchList(1)
    );

    return {
        table,
        listPerpage: LIST_PER_PAGE_OPTIONS,
        columns,
        loadingRef,
        booleanBadgeClass,
        fetchList,
        onSort,
        refresh,
        estadoClass
    }
}