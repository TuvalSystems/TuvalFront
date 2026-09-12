import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { LIST_PER_PAGE_OPTIONS } from "@/constants/tableOptions";
import { APPROVAL_API_ROUTES } from "@/constants/apiRoutes/aprobaciones/approvalRoutes";
import { getStatusBadgeClass } from "@/helpers/statusBadge";

export function useCreditOrdersPendingTable() {
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
            sortOrder: "desc"
        },
        loading: false,
    });
    const loadingRef = toRef(table, 'loading');
    const statusBadgePendingApproval = (st) => getStatusBadgeClass(st, 'booleanInverted');
    const columns = reactive([
        { label: "pedido", key: "pedido", clickable: true, sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", width: "30px" },
        { label: "cliente", key: "razon_social", clickable: true, sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", width: "150px" },
        { label: "ruc", key: "ruc", clickable: true, sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", width: "70px" },
        { label: "usuario", key: "USERID", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", width: "50px" },
        { label: "segmento", key: "segmento", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", width: "80px" },
        { label: "subsegmento", key: "subsegmento", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", width: "80px" },
        { label: "agencia", key: "agencia", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", width: "150px" },
        { label: "motivo", key: "motivo", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", width: "120px" },
        { label: "fecha/hora", key: "created_at", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", width: "130px" },
        { label: "pend. comercial", key: "pendiente_aprobacion_comercial", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold", width: "80px" },
        { label: "total", key: "total", sortable: true, align: "text-end", thClass: "text-muted  text-uppercase fw-bold", width: "50px" },
    ]);

    async function fetchList(page = 1) {
        if (ctrl.value) ctrl.value.abort();
        ctrl.value = new AbortController();
        table.currentPage = page;
        const payload = {
            ...table.filters
        };
        return run(() => axiosClient.post(APPROVAL_API_ROUTES.CREDIT.ORDERS.LIST_PENDING,
            { filters: payload, page: table.currentPage }, { signal: ctrl.value.signal }), {
            loadingRef,
            onSuccess: (paginator) => {
                const rows = paginator?.data ?? [];
                table.items = rows;
                table.totalPage = paginator?.last_page ?? 1;
                table.totalItems = paginator?.total ?? 0;
            }
        })
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
        listPerpage: LIST_PER_PAGE_OPTIONS,
        columns,
        fetchList,
        onSort,
        refresh,
        statusBadgePendingApproval
    }
}
