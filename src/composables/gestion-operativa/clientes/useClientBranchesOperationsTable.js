import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useClientBranchesOperationsTable() {

    const { run } = useApiAction();
    const ctrl = ref(null);
    let debounceId;
    const apiList = "/gestion/lista-sucursales";

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
            estado: "",
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
        { label: "ID", key: "id", sortable: true, align: "center", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "Ruc", key: "ruc", sortable: true, align: "center", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "Razón Social", key: "razonSocial", sortable: true, align: "center", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "Id Dirección", key: "idDireccion", sortable: true, align: "center", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "Dirección", key: "direccion", sortable: true, align: "center", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "Estado", key: "estado", sortable: true, align: "center", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "F. Creación", key: "created_at", sortable: true, align: "center", thClass: "text-muted  text-uppercase fw-bold" },
    ]);

    const estadoClass = (st) => {
        switch (Number(st)) {
            case 1:
                return "badge bg-success  fw-semibold";
            case 0:
                return "badge bg-danger  fw-semibold";
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
        return run(() => axiosClient.post(apiList, { filters: payload, page: table.currentPage }, { signal: ctrl.value.signal }), {
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
        columns,
        listPerpage,
        estadoClass,
        refresh,
        onSort,
        fetchList
    }
}