import { ref, reactive, toRef, watch, onBeforeUnmount } from "vue";
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
        error: "",
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
    {label:'Guia Remisión', key: 'numero_guia',  clickable: false, sortable: true, thClass: "text-muted  text-uppercase fw-bold"},
    {label: 'Origen', key: 'bodega_origen', clickable: false, sortable: true, thClass: "text-muted  text-uppercase fw-bold"},
    {label: 'Cotizaciones',key: 'quotesText',sortable: true,thClass: "d-none d-md-table-cell text-muted  text-uppercase fw-bold",tdClass: "d-none d-md-table-cell"},
    {label: 'Placa',key: 'placa', clickable: false,sortable: true, thClass: "d-none d-md-table-cell text-muted  text-uppercase fw-bold", tdClass: "d-none d-md-table-cell"}]);
 
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
      perPage: Number(table.perPage) || 10,
      search: table.searchTerm,
      sortBy: table.sortField || "fecha_salida",
      sortOrder: table.sortOrder || "desc",
    }
    return  run(() => axiosClient.post(apiFetch, payload, { signal: ctrl.value.signal }), {
      loadingRef,
      errorRef: toRef(table, "error"),
      latestOnly: true,                         // 👈 activa takeLatest
      key: `receive-reservation-transfers`,      // 👈 clave para este endpoint
      successMessage: "Proceso realizado exitosamente.",
      onSuccess: (paginador) => {
        const rows = paginador?.data ?? [];
        table.items = rows.map(r => ({
          ...r,
          quotesText: Array.isArray(r.quotes) ? r.quotes.join(', ') : (r.quotes ?? ''),
        }));
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


  function debouncedFetch(ms = 250, page = 1) {
    clearTimeout(debounceId);
    debounceId = setTimeout(() => fetchListReceivedReservationTransfers(page), ms);
  }

  // 1) search + perPage
  watch(
    [() => table.searchTerm, () => table.perPage],
    ([newSearch, newPerPage], [ oldPerPage]) => {
      const s = (newSearch ?? '').trim();

      // si cambió perPage, recarga SIEMPRE (sin esperar a 4 chars)
      if (newPerPage !== oldPerPage) {
        fetchListReceivedReservationTransfers(1);
        return;
      }

      // si cambió search:
      if (s === '' || s.length >= 4) {
        debouncedFetch(250, 1);
      }
      // opcional: si quieres limpiar la tabla cuando s < 4, hazlo aquí
    },
    { flush: 'post' }
  );

  watch(
    [() => table.sortField, () => table.sortOrder],
    () => fetchListReceivedReservationTransfers(1),
    { flush: 'post' }
  );

  onBeforeUnmount(() => clearTimeout(debounceId));

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
