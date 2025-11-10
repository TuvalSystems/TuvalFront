import { ref, reactive, toRef, watch } from "vue";
import axiosClient from "@/axios";
import { useStore } from "vuex";
import { useApiAction } from "@/composables/core/useApiAction";
export function useReceiveReservationTransfers() {
  const { run } = useApiAction();
  const store = useStore();
  const ptoVtaId = store.state.puntodeventaselect;

  const ctrl = ref(null); // AbortController actual
  let debounceId;
  const apiFetch = 'bodegas/reservas/guia-remision/lista-transferencias-por-recibir';
  const table = reactive({
    'items': [],
    'currentPage': 1,
    'totalPage': 1,
    'totalItems': 0,
    'searchTerm': '',
    'perPage': "10",
    'sortField': 'fecha_salida',
    'sortOrder': 'desc',
    'loading': false,
    ptovta: "",
  });
  const loadingRef = toRef(table, "loading");
  const columns = reactive([
    {
      'label': 'Guia Remisión',
      'key': 'numero_guia',
      clickable: false,
      sortable: true,
      render: (value) => value,
      thClass: " text-center",
      tdClass: " text-center",
    },
    {
      'label': 'Origen',
      'key': 'bodega_origen',
      clickable: false,
      sortable: true,
      render: (value) => value,
      thClass: " text-center ",
      tdClass: " text-center ",
    },
    {
      'label': 'Cotizaciones',
      'key': 'quotes',
      clickable: false,
      sortable: true,
      render: (value) => value,
      thClass: " text-start d-none d-md-table-cell",
      tdClass: " text-start d-none d-md-table-cell",
    },
    {
      'label': 'Placa',
      'key': 'placa',
      clickable: false,
      sortable: true,
      render: (value) => value,
      thClass: " text-center d-none d-md-table-cell",
      tdClass: " text-center d-none d-md-table-cell",
    }]);
  const listPerpage = ref([
    { label: "5", value: "5" },
    { label: "10", value: "10" },
    { label: "20", value: "20" },
    { label: "50", value: "50" },
  ]);


  async function fetchListReceivedReservationTransfers(page = 1) {
    if (ctrl.value) ctrl.value.abort();
    ctrl.value = new AbortController();
    table.currentPage = page;
    table.ptovta = ptoVtaId
    const payload = {
      ptovta: ptoVtaId,
      page: table.currentPage,
      perpage: Number(table.perPage) || 10,
      search: table.searchTerm,
      sortBy: table.sortField || "fecha_salida",
      sortOrder: table.sortOrder || "desc",
    }
    return await run(() => axiosClient.post(apiFetch, payload, { signal: ctrl.value.signal }), {
      loadingRef,
      latestOnly: true,                         // 👈 activa takeLatest
      key: `receive-reservation-transfers`,      // 👈 clave para este endpoint
      successMessage: "Proceso realizado exitosamente.",
      onSuccess: (paginador) => {
        table.items = paginador?.data ?? [];
        table.totalPage = paginador?.last_page ?? 1;
        table.totalItems = paginador?.total ?? 0;
      }
    })
  }

  const onSort = ({ field, order }) => {
    table.sortField = field;
    table.sortOrder = order;
  };


  const refresh = () => {
    table.perPage = "10";
    table.searchTerm = "";
    table.sortField = "fecha_salida";
    table.sortOrder = "desc";
    table.currentPage = 1; // Reset to first page
    fetchListReceivedReservationTransfers(1);
  }



  watch(
    () => [
      table.searchTerm,
      table.perPage,
    ],
    () => {
      clearTimeout(debounceId);
      debounceId = setTimeout(() => {
        if (table.searchTerm === "" || table.searchTerm.length >= 4) {
          fetchListReceivedReservationTransfers(1);
        }
      }, 250);
    }
  );

  watch(
    () => [table.sortField, table.sortOrder],
    () => fetchListReceivedReservationTransfers(1)
  );


  return {
    // state
    table,
    columns,
    listPerpage,

    //functions
    onSort,
    refresh,
    fetchListReceivedReservationTransfers
  };
}
