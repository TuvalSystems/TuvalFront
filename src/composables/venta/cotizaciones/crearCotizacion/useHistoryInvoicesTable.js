import axiosClient from "@/axios";
import { ref, reactive, watch, toRef, computed } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { LIST_PER_PAGE_OPTIONS } from "@/constants/tableOptions";
import { QUOTE_API_ROUTES } from "@/constants/apiRoutes/ventas/cotizaciones/quoteRoutes";
import { useStore } from 'vuex'

export function useHistoryInvoicesTable() {
    const store = useStore();
    const selectedPointSaleId = computed(() => store.state.puntoventaselectid);
    const selectedPointSaleCode = computed(() => store.state.puntodeventaselect);

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
            sortField: "fecha_factura",
            sortOrder: "desc",
        },
        cliente_id: null,
        loading: false
    });

    const loadingRef = toRef(table, "loading");


    const columns = reactive([
        {
            label: "F.Factura",
            key: "fecha_factura",
            sortable: true,
            align: "text-start",
            thClass: "text-muted  text-uppercase fw-bold",
            width: "10px"
        },
        {
            label: "Agencia",
            key: "agencia",
            sortable: true,
            align: "text-start",
            thClass: "text-muted  text-uppercase fw-bold",
            width: "130px"
        },
        {
            label: "factura",
            key: "factura",
            sortable: false,
            align: "text-start",
            thClass: "text-muted  text-uppercase fw-bold",
            width: "150px"
        },
        {
            label: "Item",
            key: "codigo",
            sortable: false,
            align: "text-start",
            thClass: "text-muted  text-uppercase fw-bold",
            width: "80px"
        },
        {
            label: "3L",
            key: "item3l",
            sortable: false,
            align: "text-start",
            thClass: "text-muted  text-uppercase fw-bold",
            width: "15px"
        },
        {
            label: "descripcion",
            key: "descripcion",
            sortable: false,
            align: "text-start",
            thClass: "text-muted  text-uppercase fw-bold",
            width: "500px"
        },
        {
            label: "cantidad",
            key: "cantidad",
            sortable: false,
            align: "text-end",
            thClass: "text-muted  text-uppercase fw-bold",
            width: "10px"
        },
        {
            label: "descuento",
            key: "descuento",
            sortable: false,
            align: "text-end",
            thClass: "text-muted  text-uppercase fw-bold",
            width: "10px"
        },
        {
            label: "subtotal",
            key: "subtotal",
            sortable: false,
            align: "text-end",
            thClass: "text-muted  text-uppercase fw-bold",
            width: "15px"
        },
    ]);


    function clearList() {
        table.items = [];
        table.totalPage = 0;
        table.totalItems = 0;
    }

    async function fetchList(page = 1, clientId = table.cliente_id) {
        table.cliente_id = clientId ?? null;

        if (!table.cliente_id) {
            clearList();
            return { ok: true, data: [] };
        }

        if (ctrl.value) ctrl.value.abort();
        ctrl.value = new AbortController();
        table.currentPage = page;
        const payload = {
            ...table.filters,
        }
        return run(() => axiosClient.post(QUOTE_API_ROUTES.QUOTES.LIST_HISTORY_INVOICES,
            {
                filters: payload,
                page: table.currentPage,
                pvId: selectedPointSaleId.value,
                pvCode: selectedPointSaleCode.value,
                cliente_id: table.cliente_id,
            }, {
            signal: ctrl.value.signal
        }), {
            loadingRef,
            latestOnly: true,
            key: `lista-historico-facturas`,
            successMessage: "Proceso realizado exitosamente",
            onSuccess: (paginador) => {
                const rows = paginador?.data ?? [];
                table.items = rows;
                table.totalPage = paginador?.last_page ?? 1;
                table.totalItems = paginador?.total ?? 0;
            }
        })
    }

    async function refresh() {
        Object.assign(table.filters, {
            search: "",
            perpage: "10",
            sortField: "fecha_factura",
            sortOrder: "desc",
        });
        table.currentPage = 1;
        await fetchList(1, table.cliente_id);
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
                if (table.filters.search === "" || table.filters.search.length >= 2) {
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
    }
}
