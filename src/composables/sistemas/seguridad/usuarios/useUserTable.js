import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useUserTable() {

    const { run } = useApiAction();
    const ctrl = ref(null);
    let debounceId;
    const apiList = "usuario/lista-usuarios";

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

    const estadoClass = (st) => {
        switch (Number(st)) {
            case 1:
                return "badge rounded-pill bg-success-subtle text-success border border-success-subtle fw-semibold px-3 py-2";
            case 0:
                return "badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle fw-semibold px-3 py-2";
            default:
                return "badge rounded-pill bg-secondary-subtle text-secondary border fw-semibold px-3 py-2";
        }
    };


    const columns = reactive([
        { label: "ID", key: "id", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold", width: "80px" },
        { label: "Usuario", key: "USERID", sortable: true, align: "text-start", thClass: "text-muted text-uppercase fw-bold text-end" },
        { label: "Perfil Web", key: "perfil_name", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold", width: "180px" },
        { label: "Perfil App", key: "perfil_app_name", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "estado", key: "status", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold", width: "120px" },
        { label: "F. creación", key: "created_at", sortable: false, align: "text-center", thClass: "text-muted  text-uppercase fw-bold", width: "170px" },
    ]);

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
            key: `lista-usuarios`,
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


    return {
        table,
        listPerpage,
        columns,
        loadingRef,
        fetchList,
        onSort,
        refresh,
        estadoClass
    }
}