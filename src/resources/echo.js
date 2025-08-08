import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const host = window.location.hostname;

window.Echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY  ,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1",
  wsHost: host,
  wsPort: Number(import.meta.env.VITE_PUSHER_PORT) || 6001,
  wssPort: Number(import.meta.env.VITE_PUSHER_PORT) || 6001,
  forceTLS: false, // importante en local
  enabledTransports: ["ws"],
  //   forceTLS: import.meta.env.VITE_PUSHER_FORCE_TLS === "true",
  //   enabledTransports: ["ws", "wss"],
  disableStats: true,
});

export const echo = window.Echo;
