import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { getStatusBadgeClass } from "@/helpers/statusBadge";
import { LIST_PER_PAGE_OPTIONS } from "@/constants/tableOptions";

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
 
    const columns = reactive([
        { label: "ID", key: "id", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "Ruc", key: "ruc", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "Razón Social", key: "razonSocial", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "Id Dirección", key: "idDireccion", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "Dirección", key: "direccion", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "Estado", key: "estado", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "F. Creación", key: "created_at", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
    ]);

    const estadoClass = (st) =>  getStatusBadgeClass(st, 'boolean');

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

    async function refreshTwo() {
        Object.assign(table.filters, {
            // search: "",
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
        listPerpage: LIST_PER_PAGE_OPTIONS,
        estadoClass,
        refresh,
        refreshTwo,
        onSort,
        fetchList
    }
}