import { ref, reactive, toRef, watch } from "vue";
import axiosClient from "@/axios";
import { useStore } from "vuex";
import { useApiAction } from "@/composables/core/useApiAction";
import { useNotificationCenter } from "@/composables/notificaciones/useNotificationCenter";

const apilist = 'notifications/all';
const apiMarkAsRead = 'notifications/mark-as-read';
const apiMarkAsReadAll = 'notifications/mark-all-as-read';

export function useNotifications() {

    const center = useNotificationCenter();
    const itemsCenter = center.items;
    const { run } = useApiAction();
    const store = useStore();
    const user = store.state.user.data;

    const ctrl = ref(null); // AbortController actual
    let debounceId;

    const columns = reactive([
        {
            'label': 'titulo',
            'key': 'title',
            sortable: true,
            render: (value) => value,
            thClass: " text-center",
            tdClass: " text-center",
        },
        {
            'label': 'Mensaje',
            'key': 'message',
            sortable: false,
            render: (value) => value,
            thClass: " text-start  d-none d-md-table-cell",
            tdClass: " text-start  d-none d-md-table-cell",
        },
        {
            'label': 'Hora',
            'key': 'time',
            sortable: false,
            render: (value) => value,
            thClass: " text-start d-none d-md-table-cell",
            tdClass: " text-start d-none d-md-table-cell",
        },
    ])

    const listPerpage = ref([
        { label: "5", value: "5" },
        { label: "10", value: "10" },
        { label: "20", value: "20" },
        { label: "50", value: "50" },
    ]);
    const table = reactive({
        items: [],
        currentPage: 1,
        totalPage: 1,
        totalItems: 0,
        searchTerm: '',
        perPage: "10",
        sortField: 'created_at',
        sortOrder: 'desc',
        loading: false,
        userId: "",
    });
    const loadingRef = toRef(table, "loading");

    async function fetchAllNotify(page = 1) {
        center.setLoading(true);
        if (ctrl.value) ctrl.value.abort();
        ctrl.value = new AbortController();
        table.currentPage = page;
        table.userId = user.id
        const payload = {
            page: table.currentPage,
            perPage: Number(table.perPage) || 10,
            search: table.searchTerm,
            sortBy: table.sortField,
            sortOrder: table.sortOrder,
            userId: table.userId
        }
        return  run(() => axiosClient.post(apilist, payload, { signal: ctrl.value.signal }), {
            loadingRef,
            latestOnly: true,
            key: `notifications-all`,
            successMessage: "Proceso realizado exitosamente.",
            onSuccess: (paginador) => {
                const rows = paginador?.data ?? [];
                table.items = rows;
                table.totalPage = paginador?.last_page ?? 1;
                table.totalItems = paginador?.total ?? 0;
                center.setItems(rows ?? []);
                center.setUnreadCount(paginador.unread_count ?? 0);
                center.setLoading(false);
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
        table.sortField = "created_at";
        table.sortOrder = "desc";
        table.currentPage = 1; // Reset to first page
        fetchAllNotify(1);
    }

    function debouncedFetch(ms = 250, page = 1) {
        clearTimeout(debounceId);
        debounceId = setTimeout(() => fetchAllNotify(page), ms);
    }

    // 1) search + perPage
    watch(
        [() => table.searchTerm, () => table.perPage],
        ([newSearch, newPerPage], [ oldPerPage]) => {
            const s = (newSearch ?? '').trim();

            // si cambió perPage, recarga SIEMPRE (sin esperar a 4 chars)
            if (newPerPage !== oldPerPage) {
                fetchAllNotify(1);
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
        () => fetchAllNotify(1),
        { flush: 'post' }
    );

    function onfunctionNotifyDecrement() {
        refresh();
        center.decrementUnread(1);
    }

    const loadingMarkAsRead = ref(false);
    async function markAsReadItem(id) {
        const pay1 = {
            'userId': user.id,
            'notifyId': id
        }
        return  run(() => axiosClient.post(apiMarkAsRead, pay1), {
            'loadingRef': loadingMarkAsRead,
            'successMessage': 'Proceso realizado exitosamente.',
            'onSuccess': () => onfunctionNotifyDecrement()
        });
    }


    async function markAsReadAll() {
        const pay1 = {
            'userId': user.id,
        }
        return  run(() => axiosClient.post(apiMarkAsReadAll, pay1), {
            'loadingRef': loadingMarkAsRead,
            'successMessage': 'Proceso realizado exitosamente.',
            'onSuccess': () => onFunctionCleanAllNotify()
        });
    }

    function onFunctionCleanAllNotify() {
        refresh();
        center.resetUnread();
        center.setItems(
            itemsCenter.value.map((n) => ({
                ...n,
                read_at: n.read_at ?? new Date().toISOString(),
            }))
        );
    }

    const unreadCount = center.unreadCount;
    return {
        // state
        table,
        columns,
        listPerpage,
        loadingMarkAsRead,
        unreadCount,
        //functions
        onSort,
        refresh,
        fetchAllNotify,
        markAsReadItem,
        markAsReadAll,
    }
}