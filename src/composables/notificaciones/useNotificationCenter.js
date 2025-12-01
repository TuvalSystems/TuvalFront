import { reactive, readonly, computed } from "vue";
const state = reactive({
    unreadCount: 0,
    items: [],
    loading: false
});

function setUnreadCount(n = 1) {
    state.unreadCount = Number(n) || 1;
}

function incrementUnread(n = 1) {
  state.unreadCount += Number(n) || 1;
}

function decrementUnread(n = 1) {
    state.unreadCount = Math.max(0, state.unreadCount - (Number(n) || 1));
}

function resetUnread() {
    state.unreadCount = 0;
}

function setItems(list) {
    state.items = Array.isArray(list) ? list : [];
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

    // mutadores controlados
    setUnreadCount,
    incrementUnread,
    decrementUnread,
    resetUnread,
    setItems,
    upsertNotificationItem,

    // opcional por si necesitas togglear loading
    setLoading(value) {
      state.loading = !!value;
    },
  };
}
