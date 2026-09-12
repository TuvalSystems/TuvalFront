import { useApiAction } from "@/composables/core/useApiAction"
import { reactive, ref, toRef, watch, computed } from "vue";
import { DISPATCH_ORDERS_API_ROUTES } from "@/constants/apiRoutes/cobranzas/dispatchOrdersRoute";
import { getStatusBadgeClass } from "@/helpers/statusBadge";
import axiosClient from "@/axios";
import { LIST_PER_PAGE_OPTIONS } from "@/constants/tableOptions";
import { useStore } from 'vuex'

export function useDispatchOrdersTable() {
    const store = useStore();
    const ptoVtaSelect = computed(() => store.state.puntodeventaselect);
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
            sortField: "fecha_hora_liberacion",
            sortOrder: "desc",
            ruc: "",
            estado: "liberada",
            fechaInicio: "",
            fechaFin: "",
            pvCodigo: ptoVtaSelect
        },
        loading: false

    });
    const listStatus = reactive([
        { label: "Todas", value: "" },
        { label: "Pendientes", value: "pendientes" },
        { label: "Liberada", value: "liberada" },
        { label: "Despachada", value: "despachada" },
        { label: "Cancelada", value: "cancelada" }

    ]);
    const loadingRef = toRef(table, "loading");
    const statusClass = (st) => getStatusBadgeClass(st, 'dispatchOrder');
    const columns = reactive([
        { label: "#orden", key: "ordenCodigo", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", },
        { label: "estado", key: "estado", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold",  },
        { label: "pedido", key: "pedido", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold",  },
        { label: "factura", key: "factura", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold",  },
        { label: "cliente", key: "razon_social", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold",  },
        { label: "f. pedido", key: "fecha_creacion_pedido", sortable: false, align: "text-start", thClass: "text-muted  text-uppercase fw-bold",  },
        { label: "bodega", key: "bodega", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", },
        { label: "tipo despacho", key: "despacho", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", },
        { label: "f. entrega", key: "fecha_entrega", sortable: true, align: "text-start", thClass: "text-muted  text-uppercase fw-bold", },
    ]);


    async function fetchList(page = 1) {
        if (ctrl.value) ctrl.value.abort();
        ctrl.value = new AbortController();
        table.currentPage = page;
        const payload = {
            ...table.filters,
        }
        return run(() => axiosClient.post(
            DISPATCH_ORDERS_API_ROUTES.LIST,
            { filters: payload, page: table.currentPage },
            { signal: ctrl.value.signal }), {
            loadingRef,
            latestOnly: true,
            key: 'lista-consulta-ordenes-despacho',
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
        Object.assign(table.filters, {
            search: "",
            perpage: "10",
            sortField: "fecha_hora_liberacion",
            sortOrder: "desc",
            ruc: "",
            estado: "liberada",
            fechaInicio: "",
            fechaFin: "",
            pvCodigo: ptoVtaSelect
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
        () => [table.filters.fechaInicio, table.filters.fechaFin],
        () => {
            if (table.filters.fechaInicio && table.filters.fechaFin) {
                fetchList(1)
            }
        }
    );

    watch(
        () => [table.filters.sortField, table.filters.sortOrder],
        () => fetchList(1)
    );

    watch(
        () => table.filters.ruc,
        () => fetchList(1)
    );
    watch(
        () => [table.filters.estado],
        () => fetchList(1)
    );




    return {
        table,
        listPerpage: LIST_PER_PAGE_OPTIONS,
        listStatus,
        columns,
        fetchList,
        onSort,
        refresh,
        refreshAnyFilters,
        statusClass,
    }
}
