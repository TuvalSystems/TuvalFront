import { echo } from "@/resources/echo";
let timer;

let cleanupFns = [];
export function useApprovalsGridRefresh({
  refreshFn,
  debounceMs = 350,
  onEvent,
} = {}) {
  const chan = echo
    .private("approvals-reservations")
    .subscribed(() => console.log("📡 Suscrito: approvals-reservations"))
    .listen(".ReservationApprovalsChanged", (e) => {
      onEvent?.(e); // por si quieres log/toast local
      clearTimeout(timer);
      timer = setTimeout(() => refreshFn?.(), debounceMs);
    });

//   const onVisibility = () => {
//     if (document.visibilityState === "visible") refreshFn?.();
//   };
//   document.addEventListener("visibilitychange", onVisibility);

  return () => {
    // document.removeEventListener("visibilitychange", onVisibility);
    clearTimeout(timer);
    try {
      echo.leave("approvals-reservations");
    } catch {}
  };
}
