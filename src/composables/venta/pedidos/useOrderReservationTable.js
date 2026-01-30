import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { useStore } from "vuex";

export function useOrderReservationTable() {
    const { run } = useApiAction();
    const store = useStore();

    const ctrl = ref(null); // AbortController actual
    let debounceId;
    const apiList = "/pedidos/listar-pedidos-reservas";
    const ptoVtaId = store.state.puntodeventaselect;

    const table = reactive({
        items: [],
        currentPage: 1,
        totalPage: 0,
        totalItems: 0,
        searchTerm: "",
        perPage: "10",
        sortField: "",
        sortOrder: "desc",
        fecha_desde: null,
        fecha_hasta: null,
        cliente: null,
        ptovta: null,
        loading: false,
    });
    const loadingRef = toRef(table, "loading");

    const columns = reactive([
        {
            label: 'Pedido',
            key: 'pedido',
            clickable: false,
            sortable: true,
            thClass: " text-center",
            tdClass: " text-center",
        },
        {
            label: 'Cotización',
            key: 'nro_cotizacion',
            clickable: false,
            sortable: true,
            thClass: " text-center d-none d-md-table-cell",
            tdClass: " text-center d-none d-md-table-cell",
        }, {
            label: "F. Factura",
            key: "fe_facturacion_reserva",
            clickable: false,
            sortable: true,
            thClass: "d-none d-md-table-cell",
            tdClass: "d-none d-md-table-cell",
        },
        {
            label: 'Factura',
            key: 'factura',
            clickable: false,
            sortable: true,
            thClass: " text-center d-none d-md-table-cell",
            tdClass: " text-center d-none d-md-table-cell",
        },
        {
            label: 'Estado',
            key: 'estado',
            clickable: false,
            sortable: true,
            thClass: "text-center",
            tdClass: "text-center",
        },
        {
            label: "AGENCIA",
            key: "pto_vta",
            clickable: false,
            sortable: true,
            thClass: "text-start",
            tdClass: "text-start",
        }, {
            label: "Cliente",
            key: "razon_social_cliente",
            clickable: false,
            sortable: true,
            thClass: "text-start",
            tdClass: "text-start",
        },
        {
            label: "Ruc",
            key: "ruc_cliente",
            clickable: false,
            sortable: true,
            thClass: "text-center",
            tdClass: "text-center",
        },

        {
            label: "Usuario",
            key: "USERID",
            clickable: false,
            sortable: true,
            thClass: "text-center",
            tdClass: "text-center",
        },
        {
            label: "COND.",
            key: "COND_ID",
            clickable: false,
            sortable: true,
            thClass: "text-start d-none d-md-table-cell",
            tdClass: "text-start d-none d-md-table-cell",
        },
        {
            label: "Total",
            key: "total",
            clickable: false,
            sortable: false,
            render: (value) => value,
            thClass: "text-end",
            tdClass: "text-end",
        },
        {
            label: "Fecha",
            key: "created_at",
            clickable: false,
            sortable: true,
            thClass: "d-none d-md-table-cell",
            tdClass: "d-none d-md-table-cell",
        },

    ]);


    const listPerpage = ref([
        { label: "5", value: "5" },
        { label: "10", value: "10" },
        { label: "20", value: "20" },
        { label: "50", value: "50" },
    ]);


    const totalClass = (total) => {
        if (total > 0) {
            return "text-end fw-semibold";
        }
        return "text-end fw-semibold";
    };
    const estadoClass = (st) => {
        switch (st || "") {
            case "espera":
                return "badge bg-danger text-light fw-semibold text-center";
            case "facturado":
                return "badge bg-success  fw-semibold text-center";
            case "order_de_compra":
                return "badge bg-primary  fw-semibold text-center";
            case "traslado":
                return "badge bg-light  text-danger fw-semibold text-center";
            default:
                return "badge bg-secondary text-center";
        }
    };

    async function fetchList(page = 1) {
        if (ctrl.value) ctrl.value.abort();
        ctrl.value = new AbortController();
        table.currentPage = page;
        const payload = {
            page: table.currentPage,
            perPage: Number(table.perPage),
            search: table.searchTerm,
            sortBy: table.sortField,
            sortOrder: table.sortOrder,
            fecha_desde: table.fecha_desde,
            fecha_hasta: table.fecha_hasta,
            cliente: table.cliente,
            ptoVtaId: table.ptovta,
        }
        return  run(() => axiosClient.post(apiList, payload, { signal: ctrl.value.signal }), {
            loadingRef,
            latestOnly: true,                         // 👈 activa takeLatest
            key: `lista-pedidos-reservas`,      // 👈 clave para este endpoint
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
        table.fecha_desde = null;
        table.fecha_hasta = null;
        table.searchTerm = "";
        table.perPage = "10"; // Reset to default perPage value
        table.sortField = "";
        table.sortOrder = "desc";
        table.currentPage = 1; // Reset to first page
        table.status = "aprobado";
        table.ptovta = null;
        table.cliente = null; // Reset cliente filter
        fetchList(1); //consulta de nuevo
    };

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
                    fetchList(1);
                }
            }, 250);
        }
    );

    watch(
        () => [table.sortField, table.sortOrder],
        () => fetchList(1)
    );

    return {
        columns,
        table,
        listPerpage,
        fetchList,
        onSort,
        refresh,
        totalClass,
        estadoClass,
    }
}