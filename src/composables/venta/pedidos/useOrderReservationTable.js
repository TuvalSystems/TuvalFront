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
        label: "Pedido",
        key: "pedido",
        clickable: false,
        sortable: true,
        align: "text-center",
        thClass: "text-muted text-uppercase fw-bold",
        width: "120px",
    },
    {
        label: "Cotización",
        key: "nro_cotizacion",
        clickable: false,
        sortable: true,
        align: "text-center",
        thClass: "d-none d-md-table-cell text-muted text-uppercase fw-bold",
        tdClass: "d-none d-md-table-cell",
        width: "130px",
    },
    {
        label: "F. Factura",
        key: "fe_facturacion_reserva",
        clickable: false,
        sortable: true,
        align: "text-center",
        thClass: "d-none d-md-table-cell text-muted text-uppercase fw-bold",
        tdClass: "d-none d-md-table-cell",
        width: "150px",
    },
    {
        label: "Factura",
        key: "factura",
        clickable: false,
        sortable: true,
        align: "text-center",
        thClass: "d-none d-md-table-cell text-muted text-uppercase fw-bold",
        tdClass: "d-none d-md-table-cell",
        width: "130px",
    },
    {
        label: "Estado",
        key: "estado",
        clickable: false,
        sortable: true,
        align: "text-center",
        thClass: "text-muted text-uppercase fw-bold",
        width: "140px",
    },
    {
        label: "Agencia",
        key: "pto_vta",
        clickable: false,
        sortable: true,
        align: "text-start",
        thClass: "text-muted text-uppercase fw-bold",
        width: "160px",
    },
    {
        label: "Cliente",
        key: "razon_social_cliente",
        clickable: false,
        sortable: true,
        align: "text-start",
        thClass: "text-muted text-uppercase fw-bold",
        width: "260px",
    },
    {
        label: "RUC",
        key: "ruc_cliente",
        clickable: false,
        sortable: true,
        align: "text-center",
        thClass: "text-muted text-uppercase fw-bold",
        width: "140px",
    },
    {
        label: "Usuario",
        key: "USERID",
        clickable: false,
        sortable: true,
        align: "text-center",
        thClass: "text-muted text-uppercase fw-bold",
        width: "120px",
    },
    {
        label: "Cond.",
        key: "COND_ID",
        clickable: false,
        sortable: true,
        align: "text-center",
        thClass: "d-none d-md-table-cell text-muted text-uppercase fw-bold",
        tdClass: "d-none d-md-table-cell",
        width: "100px",
    },
    {
        label: "Total",
        key: "total",
        clickable: false,
        sortable: false,
        render: (value) => value,
        align: "text-end",
        thClass: "text-muted text-uppercase fw-bold",
        width: "120px",
    },
    {
        label: "Fecha",
        key: "created_at",
        clickable: false,
        sortable: true,
        align: "text-center",
        thClass: "d-none d-md-table-cell text-muted text-uppercase fw-bold",
        tdClass: "d-none d-md-table-cell",
        width: "150px",
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
        switch (String(st || "").toLowerCase()) {
            case "espera":
                return "badge rounded-pill bg-danger-subtle text-danger border border-danger-subtle fw-semibold px-3 py-2";

            case "facturado":
                return "badge rounded-pill bg-success-subtle text-success border border-success-subtle fw-semibold px-3 py-2";

            case "order_de_compra":
                return "badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle fw-semibold px-3 py-2";

            case "traslado":
                return "badge rounded-pill bg-info-subtle text-info border border-info-subtle fw-semibold px-3 py-2";

            default:
                return "badge rounded-pill bg-secondary-subtle text-secondary border border-secondary-subtle fw-semibold px-3 py-2";
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
        return run(() => axiosClient.post(apiList, payload, { signal: ctrl.value.signal }), {
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