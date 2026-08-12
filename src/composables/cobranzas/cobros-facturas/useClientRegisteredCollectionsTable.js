import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction"
import { INVOICE_COLLECTION_API_ROUTES } from "@/constants/apiRoutes/cobranzas/invoiceCollectionRoutes";
import { LIST_PER_PAGE_OPTIONS } from "@/constants/tableOptions";
import { getStatusBadgeClass } from "@/helpers/statusBadge";
import { toRef, watch, reactive, ref } from "vue";

export function useClientRegisteredCollectionsTable() {

    const { run } = useApiAction();
    const ctrl = ref(null);
    let debounceId;
    const table = reactive({
        items: [],
        currentPage: 1,
        totalPage: 0,
        totalItems: 0,
        perpage: 10,
        filters: {
            search: "",
            perpage: "10",
            sortField: "fecha",
            sortOrder: "desc",
            cliente_id: null
        },
        loading: false
    });

    const loadingRef = toRef(table, 'loading');
    const statusClass = (st) => getStatusBadgeClass(st, 'cobros')
    const columns = reactive([
        { label: '# recibo', key: "numero_recibo", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold" },
        { label: 'fecha', key: "fecha", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold" },
        { label: 'estado', key: "estado", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold" }
    ]);


    async function fetchList(page = 1) {
        if (!table.filters.cliente_id) {
            table.items = [];
            table.currentPage = 1;
            table.totalPage = 0;
            table.totalItems = 0;
            return { ok: true, data: [], message: "Seleccione un cliente." };
        }

        if (ctrl.value) ctrl.value.abort();
        ctrl.value = new AbortController();
        table.currentPage = page;
        const payload = {
            ...table.filters
        }

        return await run(async () => axiosClient.post(
            INVOICE_COLLECTION_API_ROUTES.LIST_COLLECTION,
            { filters: payload, page: table.currentPage },
            { signal: ctrl.value.signal }
        ), {
            loadingRef,
            latestOnly: true,
            key: "lista-cobros-registrados",
            successMessage: "Información Obtenida Exitosamente",
            onSuccess: (data) => {
                const rows = data?.data ?? [];
                table.items = rows,
                    table.totalPage = data?.last_page ?? 1;
                table.totalItems = data?.total ?? 0;
            }
        });
    }

    async function refresh() {
        const clienteId = table.filters.cliente_id;
        Object.assign(table.filters, {
            search: "",
            perpage: "10",
            sortField: "fecha",
            sortOrder: "desc",
            cliente_id: clienteId,
        });
        table.currentPage = 1;
        await fetchList(1);
    }

    async function refreshAnyFilters() {
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
        statusClass,
        fetchList,
        onSort,
        refresh,
        refreshAnyFilters

    }
}
