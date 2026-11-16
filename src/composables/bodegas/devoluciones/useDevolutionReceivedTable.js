import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { useStore } from "vuex";


export function useDevolutionReceivedTable() {

    const { run } = useApiAction();
    const store = useStore();

    const ctrl = ref(null); // AbortController actual
    let debounceId;
    const ptoVtaId = store.state.puntodeventaselect;
    const apiList = "/devoluciones/pendiente-recepcion";

    const table = reactive({
        error: "",
        items: [],
        currentPage: 1,
        totalPage: 0,
        totalItems: 0,
        searchTerm: "",
        perPage: "10",
        sortField: "",
        sortOrder: "desc",
        ptovta: ptoVtaId,
        loading: false,
    });

    const columns = reactive([
        { label: 'Devolución', key: 'devolucion', clickable: true, sortable: true, thClass: "text-muted  text-uppercase fw-bold" },
        { label: 'Cliente', key: 'CLI_RAZON_SOCIAL', clickable: false, sortable: false , thClass: "text-muted  text-uppercase fw-bold"},
        { label: 'Ruc', key: 'CLI_RUC', clickable: false, sortable: false , thClass: "text-muted  text-uppercase fw-bold"},
        { label: 'Usuario', key: 'USERID', clickable: false, sortable: false , thClass: "text-muted  text-uppercase fw-bold"},
        { label: 'Pto. Venta', key: 'PTO_VTA_DESCRIPCION', clickable: false, sortable: false , thClass: "text-muted  text-uppercase fw-bold"},
        { label: 'Fecha/Hora', key: 'created_at', clickable: false, sortable: false ,  thClass: "text-muted  text-uppercase fw-bold"},
        { label: 'Refactura', key: 'volver_a_facturar', clickable: false, sortable: false, thClass: "text-muted  text-uppercase fw-bold", tdClass: "text-center" },
    ]);
    const loadingRef = toRef(table, "loading");

    const listPerpage = ref([
        { label: "5", value: "5" },
        { label: "10", value: "10" },
        { label: "20", value: "20" },
        { label: "50", value: "50" },
    ]);

    const refacturaClass = (it) => {
        switch (Number(it)) {
            case 1:
                return "badge rounded-pill bg-success-subtle text-success border border-success-subtle fw-semibold px-3 py-2";
            case 0:
                return "badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle fw-semibold px-3 py-2";
            default:
                return "badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle fw-semibold px-3 py-2";
        }
    };

    async function fetchData(page = 1) {
        if (ctrl.value) ctrl.value.abort();
        ctrl.value = new AbortController();
        table.currentPage = page;
        const payload = {
            page: table.currentPage,
            perPage: Number(table.perPage),
            search: table.searchTerm,
            sortBy: table.sortField,
            sortOrder: table.sortOrder,
            ptoVtaId: table.ptovta,
        }
        return run(() => axiosClient.post(apiList, payload, { signal: ctrl.value.signal }), {
            loadingRef,
            errorRef: toRef(table, "error"),
            latestOnly: true,
            key: `lista-devoluciones-pendiente-recepcion`,
            successMessage: "Proceso realizado exitosamente.",
            onSuccess: (paginador) => {
                const rows = paginador?.data ?? [];
                table.items = rows;
                table.totalPage = paginador?.last_page ?? 1;
                table.totalItems = paginador?.total ?? 0;
            }
        })
    }

    const refresh = () => {
        // Reiniciar a la primer página
        table.searchTerm = "";
        table.perPage = "10"; // Reset to default perPage value
        table.sortField = "";
        table.sortOrder = "desc";
        table.currentPage = 1; // Reset to first page
        table.status = "aprobado";
        table.ptovta = ptoVtaId;
        fetchData();
    }


    const onSort = ({ field, order }) => {
        table.sortField = field;
        table.sortOrder = order;
    };


    watch(
        () => [
            table.searchTerm,
            table.perPage,

        ],
        () => {
            clearTimeout(debounceId);
            debounceId = setTimeout(() => {
                if (table.searchTerm === "" || table.searchTerm.length >= 4) {
                    fetchData(1);
                }
            }, 250);
        }
    );

    watch(
        () => [table.sortField, table.sortOrder],
        () => fetchData(1)
    );

    return {
        table,
        columns,
        loadingRef,
        onSort,

        refresh,
        listPerpage,
        refacturaClass,
        fetchData

    };
}