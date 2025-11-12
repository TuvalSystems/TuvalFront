import { echo } from "@/resources/echo";

export function useAuthorizedReservationsRefresh({
  refreshFn,
  debounceMs = 350,
  onSubscribed,
  onEvent,
}) {
  let timer;

  const chan = echo.private("refresh-authorized-reservations");

  // Solo registra subscribed si hay callback
  if (typeof onSubscribed === "function") {
    chan.subscribed(onSubscribed);
  }

    // Manejo de errores del canal (opcional)
  if (typeof onError === "function") {
    chan.error(onError);
  }

  // .subscribed(() =>    console.log("📡 Suscrito: refresh-authorized-reservations"))
  chan.listen(".ReservedListAuthorizedChanged", (e) => {
    if (typeof onEvent === "function") onEvent(e);
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (typeof refreshFn === "function") refreshFn();
    }, debounceMs);
  });

  return () => {
    clearTimeout(timer);
    try {
      echo.leave("refresh-authorized-reservations");
    } catch {}
  };
}
