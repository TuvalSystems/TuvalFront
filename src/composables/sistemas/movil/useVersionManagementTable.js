import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { getStatusBadgeClass } from "@/helpers/statusBadge";
import { LIST_PER_PAGE_OPTIONS } from "@/constants/tableOptions";
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

    const estadoClass = (st) => getStatusBadgeClass(st, 'boolean');

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
        listPerpage : LIST_PER_PAGE_OPTIONS,
        fetchList,
        refresh,
        onSort,
        estadoClass
    }
}