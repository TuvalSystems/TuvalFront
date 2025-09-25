import { echo } from "@/resources/echo";
import { getCurrentUserId } from "@/utils/auth";
import store from "@/store";
import { bsToast } from '@/utils/bsToast'
import {
  swalSimple,
  swalInfo,
  swalSuccess,
  swalWarning,
  swalError,
  toast,
} from "@/functions/swal-alert.js";

let initialized = false;
let unwatch = null;
let currentUid = null;

export function initNotifications() {
  const uid = getCurrentUserId();

  // if (!uid) return;
  // inited = true;

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

  if (initialized && uid === currentUid) return;

  if (currentUid && currentUid !== uid) {
    try {
      echo.leave(`App.Models.GpUsuario.${currentUid}`);
    } catch {}
  }

  currentUid = uid;
  initialized = true;

  echo
    .private(`App.Models.GpUsuario.${uid}`)
    .subscribed(() => console.log(`📡 Suscrito: App.Models.GpUsuario.${uid}`))
    .notification((n) => {
      console.log("🔔 Notificación recibida:", n);
      const title = n.titulo ?? "Notificación";
      const msg = n.message ?? '';
      bsToast({ title, text: msg, iconClass: 'fa fa-bell text-info', delay: 60000 });
    });

  if (!unwatch) {
    unwatch = store.watch(
      (s) => [s.user?.data, s.user?.token],
      () => initNotifications()
    );
  }
}

export default { install: () => initNotifications() };
