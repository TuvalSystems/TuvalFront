import axiosClient from "@/axios";
import { useApiAction } from "@/composables/core/useApiAction";
import { ref, reactive, toRef, watch } from "vue";
import { HISTORICAL_DEPOSITS_API_ROUTES } from "@/constants/apiRoutes/cobranzas/historicalDepositsRoute";
import { getStatusBadgeClass } from "@/helpers/statusBadge";
import { LIST_PER_PAGE_OPTIONS } from "@/constants/tableOptions";

export function useHistoricalDepositsTable() {
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
            sortField: "fecha_creacion_cobro",
            sortOrder: "desc",
            ruc: "",
            estado: "",
        },
        loading: false,
    });
    const loadingRef = toRef(table, "loading");
    const statusClass = (st) => getStatusBadgeClass(st, 'documento');
    const columns = reactive([
        { label: "agencia", key: "agencia", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold" },
        { label: "cobro", key: "numero_recibo", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
        { label:"f. ingreso", key :"fecha_creacion_cobro", sortable: false, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
        { label:"usuario ingreso", key :"usuario_ingreso", sortable: false, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
        { label:"ruc", key :"ruc", sortable: false, align: "text-start", thClass: "text-muted  text-uppercase fw-bold" },
        { label:"razón social", key :"razon_social", sortable: false, align: "text-start", thClass: "text-muted  text-uppercase fw-bold" },
        { label:"banco", key :"banco", sortable: false, align: "text-start", thClass: "text-muted  text-uppercase fw-bold" },
        { label:"tipo", key :"tipo", sortable: false, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
        { label:"comprobante", key :"comprobante", sortable: false, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
        { label:"monto", key :"monto", sortable: false, align: "text-end", thClass: "text-muted  text-uppercase fw-bold" },
        { label:"estado", key :"estado", sortable: false, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
        { label:"f. registro", key :"fecha_registro", sortable: false, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
        { label:"usuario registro", key :"usuario_regitro", sortable: false, align: "text-center", thClass: "text-muted  text-uppercase fw-bold" },
        
        
    ]);

    async function fetchList(page = 1) {
        if (ctrl.value) ctrl.value.abort();
        ctrl.value = new AbortController();
        table.currentPage = page;
        const payload = {
            ...table.filters,
        }
        return run(() => axiosClient.post(
            HISTORICAL_DEPOSITS_API_ROUTES.LISTA_DEPOSITOS_HISTORICOS,
            { filters: payload, page: table.currentPage },
            { signal: ctrl.value.signal }), {
            loadingRef,
            latestOnly: true,
            key: 'lista-depositos-historico',
            successMessage: "Información Obtenida Exitosamente",
            onSuccess: (data) => {
                const rows = data?.data ?? [];
                table.items = rows;
                table.totalPage = data?.last_page ?? 1;
                table.totalItems = data?.total ?? 0;
            }
        });
    }

    async function refresh() {
        Object.assign(table.filters, {
            search: "",
            perpage: 10,
            sortField: "fecha_creacion_cobro",
            sortOrder: "desc"
        });
        table.currentPage = 1;
        await fetchList(1);
    }

    const onSort = ({ field, order }) => {
        table.filters.sortField = field;
        table.filters.sortOrder = order;
    }


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
        loadingRef,
        fetchList,
        onSort,
        refresh,
        statusClass,

    }


}
