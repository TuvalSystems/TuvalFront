import { echo } from "@/resources/echo";
import { getCurrentUserId } from "@/utils/auth";
import store from "@/store";
import { bsToast } from "@/utils/bsToast";

// ⬇️ Estado persistente a nivel de módulo (NO dentro de la función)
let initialized = false;
let unwatch = null;
let currentUid = null;

export function initNotifications() {
  const uid = getCurrentUserId();

  if (!uid) {
    if (currentUid) {
      try {
        echo.leave(`App.Models.GpUsuario.${currentUid}`);
      } catch {}
      currentUid = null;
      initialized = false;
    }
    if (!unwatch) {
      unwatch = store.watch(
        (s) => [s?.state?.user?.data, s?.state?.user?.token],
        () => initNotifications()
      );
    }
    return;
  }

  // Ya inicializado para este uid
  if (initialized && uid === currentUid) return;

  // Cambió de usuario: salir del canal anterior
  if (currentUid && currentUid !== uid) {
    try {
      echo.leave(`App.Models.GpUsuario.${currentUid}`);
    } catch {}
  }

  currentUid = uid;
  initialized = true;

  const chan = echo.private(`App.Models.GpUsuario.${uid}`);
  chan.subscribed(() => {
    //  console.log(`📡 Subscribed App.Models.GpUsuario.${uid}`);
  });

  // (Opcional) log de errores del canal
  chan.error?.((err) => {
    // console.warn("Canal notificaciones error:", err);
  });
  chan.notification((n) => {
    const title = n.titulo ?? "Notificación";
    const msg = n.message ?? "";
    bsToast({
      title,
      text: msg,
      iconClass: "fa fa-bell text-info",
      delay: 60000,
    });
  });

  // Watch para cambios de sesión/token
  if (!unwatch) {
    unwatch = store.watch(
      (s) => [s.user?.data, s.user?.token],
      () => initNotifications()
    );
  }
}
// Llamado como plugin
export default { install: () => initNotifications() };
