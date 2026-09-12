import { reactive, readonly, computed } from "vue";
const state = reactive({
    unreadCount: 0,
    items: [],
    loading: false,
    snapshot: null
});

function normalizeCount(value, fallback = 0) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(0, Math.trunc(parsed));
}

function setUnreadCount(n = 0) {
    state.unreadCount = normalizeCount(n);
}

function incrementUnread(n = 1) {
    state.unreadCount += normalizeCount(n, 1);
}

function decrementUnread(n = 1) {
    state.unreadCount = Math.max(0, state.unreadCount - normalizeCount(n, 1));
}

function resetUnread() {
    state.unreadCount = 0;
}

function setItems(list) {
    state.items = Array.isArray(list) ? list : [];
}

function setSnapshot(paginator = {}, query = {}) {
    const rows = paginator?.data ?? [];
    setItems(rows);
    setUnreadCount(paginator?.unread_count ?? 0);
    state.snapshot = {
        items: rows,
        currentPage: paginator?.current_page ?? query.page ?? 1,
        totalPage: paginator?.last_page ?? 1,
        totalItems: paginator?.total ?? rows.length,
        perPage: String(paginator?.per_page ?? query.perPage ?? 10),
        searchTerm: query.search ?? '',
        sortField: query.sortBy ?? 'created_at',
        sortOrder: query.sortOrder ?? query.orderBy ?? 'desc',
        userId: query.userId ?? null,
    };
}

function clearSnapshot() {
    state.snapshot = null;
}

function upsertNotificationItem(notification) {
    if (!notification?.id) return;

    const idx = state.items.findIndex((n) => n.id === notification.id);
    if (idx === -1) {
        state.items.unshift(notification);
    } else {
        state.items[idx] = { ...state.items[idx], ...notification };
    }
}

export function useNotificationCenter() {
  return {
    // estado solo-lectura para fuera
    state: readonly(state),

    // accesos cómodos
    unreadCount: computed(() => state.unreadCount),
    items: computed(() => state.items),
    loading: computed(() => state.loading),
    snapshot: computed(() => state.snapshot),

    // mutadores controlados
    setUnreadCount,
    incrementUnread,
    decrementUnread,
    resetUnread,
    setItems,
    setSnapshot,
    clearSnapshot,
    upsertNotificationItem,

    // opcional por si necesitas togglear loading
    setLoading(value) {
      state.loading = !!value;
    },
  };
}
