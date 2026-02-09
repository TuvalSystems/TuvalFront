import axiosClient from "@/axios";
import { ref, reactive, watch, toRef } from "vue";
import { useApiAction } from "@/composables/core/useApiAction";
import { useStore } from "vuex";

export function useReceivedReservationTable() {
    const { run } = useApiAction();
    const store = useStore();
    const ctrl = ref(null);
    let debounceId;
    const apiList = "despachos/reservas-recibidas";
    const ptoVtaId = store.state.puntodeventaselect;
    const columns = reactive([
        { label: "Guia", key: "numero_guia", sortable: true,  clickable: true },
        { label: "Origen", key: "bodega_origen", sortable: true },
        { label: "Cliente", key: "razon_social_destinatario", sortable: true },
        { label: "Dirección", key: "direccion_destinatario", sortable: true },
        { label: "Fecha/Hora", key: "fecha_salida", sortable: true },
        { label: "Transportista", key: "razon_social_transportista", sortable: true },
        { label: "Vehiculo", key: "placa", sortable: true },
        { label: "usuario", key: "USERID", sortable: true },
    ]);
    const table = reactive({
        items: [],
        currentPage: 1,
        totalPage: 0,
        totalItems: 0,
        searchTerm: "",
        perPage: "10",
        sortField: "",
        sortOrder: "desc",
        ptoVtaOrigin: ptoVtaId,
        filters: {
            fecha_desde: null,
            fecha_hasta: null,
            ptoVtaDestino: null
        },
        loading: false,
    });

    const loadingRef = toRef(table, "loading");
    const listPerpage = ref([
        { label: "5", value: "5" },
        { label: "10", value: "10" },
        { label: "20", value: "20" },
        { label: "50", value: "50" },
    ]);


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
            ptoVtaOrigin: table.ptoVtaOrigin,
            fecha_desde: table.filters.fecha_desde,
            fecha_hasta: table.filters.fecha_hasta,
            ptoVtaDestino: table.filters.ptoVtaDestino
        }
        return  run(() => axiosClient.post(apiList, payload, { signal: ctrl.value.signal }), {
            loadingRef,
            latestOnly: true,                         // 👈 activa takeLatest
            key: `lista-reservas-enviadas`,      // 👈 clave para este endpoint
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
        table.searchTerm = "",
            table.perPage = "10",
            table.sortOrder = "desc",
            table.ptovta = ptoVtaId,
            table.sortField = "",
            table.currentPage = 1,
            table.filters.fecha_hasta = null;
        table.filters.fecha_desde = null;
        fetchList(1);
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

    watch(
        () => [table.filters.fecha_desde, table.filters.fecha_hasta],
        () => {
            if (table.filters.fecha_desde && table.filters.fecha_hasta) {
                fetchList(1)
            }
        }
    );

    watch(
        () => [table.filters.ptoVtaDestino],
        () => fetchList(1)
    );

    return {
        table,
        columns,
        listPerpage,
        fetchList,
        onSort,
        refresh,
    }
}