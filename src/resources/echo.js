import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axiosClient from "@/axios";
import store from "@/store";

window.Pusher = Pusher;

/**configuracion nueva */
const scheme =
  import.meta.env.VITE_PUSHER_SCHEME ||
  window.location.protocol.replace(":", "");
const isTLS = scheme === "https";
const port = Number(import.meta.env.VITE_PUSHER_PORT) || (isTLS ? 443 : 6001);
const getToken = () => store?.state?.user?.token || "";

export const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1",
  wsHost: import.meta.env.VITE_PUSHER_HOST || window.location.hostname,
  wsPort: port,
  wssPort: port,
  forceTLS: isTLS,
  encrypted: isTLS,
  enabledTransports: ['ws', 'wss'],
  disableStats: true,
  wsPath: '/ws-soketi',
  // ⚡ Authorizer personalizado con Bearer desde tu store
  // (evita depender de cookies/CSRF y funciona aunque el token cambie)

  authorizer: (channel) => ({
    authorize: (socketId, cb) => {
      axiosClient
        .post("/broadcasting/auth", {
          socket_id: socketId,
          channel_name: channel.name,
        })
        .then((res) => cb(null, res.data))
        .catch((err) => cb(err));
    },
  }),
});

// debug/ diagnostico de conexion
if (echo?.connector?.pusher && !window.__ECHO_CONN_BOUND__) {
  window.__ECHO_CONN_BOUND__ = true; // evita binds dupplicados en hot-reload
  const conn = echo.connector.pusher.connection;
  // conn.bind("connected", () => console.log("🔄 Echo connected / reconnected"));
  // conn.bind("state_change", (states) => console.log("⚡ Pusher state", states));
  // conn.bind("error", (err) => console.error("❌ Pusher error", err));
  // conn.bind("disconnected", () => console.warn("⚠️ Echo disconnected"));
  // conn.bind('failed',       () => console.log('[WS] failed'));
}

// Cierre limpio al navegar/cerrar (opcional)
window.addEventListener("beforeunload", () => {
  try {
    echo.disconnect();
  } catch { }
});
