import { echo } from "@/resources/echo";
import axiosClient from "@/axios";
import { getCurrentUserId } from "@/utils/auth";
import store from "@/store";
import { bsToast } from "@/utils/bsToast";
import { useNotificationCenter } from "@/composables/notificaciones/useNotificationCenter";
// ⬇️ Estado persistente a nivel de módulo (NO dentro de la función)
let initialized = false;
let unwatch = null;
let currentUid = null;

function ensureSessionWatcher() {
  if (unwatch) return;

  unwatch = store.watch(
    (state) => [state.user?.data?.id, state.user?.token],
    () => initNotifications()
  );
}

async function loadInitialNotifications(userId) {
  if (!userId) return;

  const { clearSnapshot, setItems, setLoading, setSnapshot, setUnreadCount } = useNotificationCenter();
  setLoading(true);
  const payload = {
    page: 1,
    perPage: 10,
    search: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    orderBy: 'desc',
    userId,
  };

  try {
    const { data } = await axiosClient.post("notifications/all", payload);
    const paginator = data?.data ?? {};

    if (data?.success === true) {
      setSnapshot(paginator, payload);
    } else {
      setItems([]);
      setUnreadCount(0);
      clearSnapshot();
    }
  } catch (e) {
    setItems([]);
    setUnreadCount(0);
    clearSnapshot();
  } finally {
    setLoading(false);
  }
}

export function initNotifications() {
  const uid = getCurrentUserId();
  const token = store.state.user?.token;
  const { clearSnapshot, incrementUnread, resetUnread, setItems } = useNotificationCenter();

  if (!uid || !token) {
    if (currentUid) {
      try {
        echo.leave(`App.Models.GpUsuario.${currentUid}`);
      } catch {
        // El canal puede estar desconectado; continuar limpiando la sesión local.
      }
      currentUid = null;
      initialized = false;
    }
    resetUnread();
    setItems([]);
    clearSnapshot();
    ensureSessionWatcher();
    return;
  }

  // Ya inicializado para este uid
  if (initialized && uid === currentUid) return;

  // Cambió de usuario: salir del canal anterior
  if (currentUid && currentUid !== uid) {
    try {
      echo.leave(`App.Models.GpUsuario.${currentUid}`);
    } catch {
        // El canal puede estar desconectado; continuar limpiando la sesión local.
      }
  }

  currentUid = uid;
  initialized = true;

  const chan = echo.private(`App.Models.GpUsuario.${uid}`);
  // chan.subscribed(() => {
  //    console.log(`📡 Subscribed App.Models.GpUsuario.${uid}`);
  // });

  // (Opcional) log de errores del canal
  chan.error?.(() => {
    // console.warn("Canal notificaciones error:", err);
  });
  chan.notification((n) => {
    const title = n.title ?? "Notificación";
    const msg = n.message ?? "";
    incrementUnread(1);
    clearSnapshot();
    bsToast({
      title,
      text: msg,
      iconClass: "fa fa-bell",
      delay: 60000,
    });
  });
  loadInitialNotifications(uid);
  // Watch para cambios de sesión/token
  ensureSessionWatcher();
}
// Llamado como plugin
export default { install: () => initNotifications() };
