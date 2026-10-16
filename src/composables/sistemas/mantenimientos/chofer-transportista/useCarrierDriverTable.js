import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { getStatusBadgeClass } from "@/helpers/statusBadge";
import { LIST_PER_PAGE_OPTIONS } from "@/constants/tableOptions";
import { PROVIDER_API_ROUTES } from "@/constants/apiRoutes/ventas/proveedores/providerRoutes";
import { useStore } from 'vuex'
import { computed } from "vue";

export function useCarrierDriverTable() {

    const { run } = useApiAction();
    const store = useStore();
    const selectedPointSaleId = computed(() => store.state.puntoventaselectid);

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
            sortOrder: "desc",
            pv_id : selectedPointSaleId.value
        },
        loading: false,
    });
    const loadingRef = toRef(table, "loading");
    const statusBooleanClass = (st) => getStatusBadgeClass(st, 'boolean');

    const columns = reactive([
        { label: "id", key: "id", sortable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold", width: "80px" },
        { label: "proveedor", key: "ruc_proveedor", sortable: true, align: "text-start", thClass: "text-muted text-uppercase fw-bold text-end" },
        { label: "identificación", key: "identificacion", sortable: true, align: "text-start", thClass: "text-muted text-uppercase fw-bold text-end" },
        { label: "nombre", key: "nombre", sortable: true, align: "text-start", thClass: "text-muted text-uppercase fw-bold text-end" },
        { label: "placa", key: "placa", sortable: true, align: "text-start", thClass: "text-muted text-uppercase fw-bold text-end" },
        { label: "estado", key: "estado", sortable: true, clickable: true, align: "text-center", thClass: "text-muted  text-uppercase fw-bold", width: "120px" },
        { label: "F. creación", key: "created_at", sortable: false, align: "text-center", thClass: "text-muted  text-uppercase fw-bold", width: "170px" },
    ]);

    async function fetchList(page = 1) {
        if (ctrl.value) ctrl.value.abort();
        ctrl.value = new AbortController();
        table.currentPage = page;
        const payload = {
            ...table.filters,
        }
        return await run(async () => axiosClient.post(
            PROVIDER_API_ROUTES.CARRIER_DRIVER.LIST,
            { filters: payload, page: table.currentPage },
            { signal: ctrl.value.signal }), {
            loadingRef,
            latestOnly: true,
            key: `lista-chofer-transportista`,
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


    return {
        table,
        listPerpage: LIST_PER_PAGE_OPTIONS,
        columns,
        fetchList,
        onSort,
        refresh,
        statusBooleanClass,
    }
}