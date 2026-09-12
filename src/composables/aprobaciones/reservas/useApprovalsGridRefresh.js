import { echo } from "@/resources/echo";

export function useApprovalsGridRefresh({
  refreshFn,
  debounceMs = 350,
  onSubscribed,
  onEvent,
  onError,
} = {}) {
  let timer;

  const chan = echo.private("approvals-reservations");

  // Solo registra subscribed si hay callback
  if (typeof onSubscribed === "function") {
    chan.subscribed(onSubscribed);
  }

  // Manejo de errores del canal (opcional)
  if (typeof onError === "function") {
    chan.error(onError);
  }

  chan.listen(".ReservationApprovalsChanged", (e) => {
    if (typeof onEvent === "function") onEvent(e);
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (typeof refreshFn === "function") refreshFn();
    }, debounceMs);
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
    } catch (error) {
      if (typeof onError === "function") onError(error);
    }
  };
}
