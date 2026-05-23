import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";

export function useVersionManagementTable() {

    const { run } = useApiAction();
    const ctrl = ref(null); // AbortController actual
    let debounceId;
    const apiList = "admin/app/versions/list";

    const table = reactive({
        items: [],
        currentPage: 1,
        totalPage: 0,
        totalItems: 0,
        filters: {
            search: "",
            perpage: "10",
            sortField: "created_at",
            sortOrder: "desc"
        },
        loading: false
    });
    const loadingRef = toRef(table, 'loading');

    const listPerpage = ref([
        { label: "5", value: "5" },
        { label: "10", value: "10" },
        { label: "20", value: "20" },
        { label: "50", value: "50" },
    ]);


    const columns = reactive([
        { label: "ID", key: "id", sortable: true, align: "text-center", thClass: "text-muted text-uppercase fw-bold", },
        { label: "Plataforma", key: "platform", sortable: true, align: "text-center", thClass: "text-muted text-uppercase fw-bold", },
        { label: "Versión", key: "version_name", sortable: true, align: "text-center", thClass: "text-muted text-uppercase fw-bold", },
        { label: "Build", key: "build_number", sortable: true, align: "text-center", thClass: "text-muted text-uppercase fw-bold", },
        { label: "Build mínimo", key: "minimum_required_build", sortable: true, align: "text-center", thClass: "text-muted text-uppercase fw-bold", },
        { label: "Peso APK", key: "apk_size_bytes", sortable: true, align: "text-center", thClass: "text-muted text-uppercase fw-bold", },
        { label: "Estado", key: "is_active", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "F. Creación", key: "created_at", sortable: true, align: "text-center", thClass: "text-muted text-uppercase fw-bold", },
    ]);

    const estadoClass = (st) => {
        switch (Boolean(st)) {
            case true:
                return "badge rounded-pill bg-success-subtle text-success border border-success-subtle fw-semibold px-3 py-2";
            case false:
                return "badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle fw-semibold px-3 py-2";
            default:
                return "badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle fw-semibold px-3 py-2";
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
            key: `lista-gestion-versiones-apk`,
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
                if (table.filters.search === "" || table.filters.search.length >= 3) {
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
        columns,
        loadingRef,
        listPerpage,
        fetchList,
        refresh,
        onSort,
        estadoClass
    }
}