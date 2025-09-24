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
  enabledTransports: ["ws", "wss"],
  disableStats: true,

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
// Cierre limpio al navegar/cerrar (opcional)
window.addEventListener("beforeunload", () => {
  try {
    echo.disconnect();
  } catch {}
});

/** configuracion vieja  */
// const host = window.location.hostname;

// window.Echo = new Echo({
//   broadcaster: "pusher",
//   key: import.meta.env.VITE_PUSHER_APP_KEY  ,
//   cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || "mt1",
//   wsHost: host,
//   wsPort: Number(import.meta.env.VITE_PUSHER_PORT) || 6001,
//   wssPort: Number(import.meta.env.VITE_PUSHER_PORT) || 6001,
//   forceTLS: false, // importante en local
//   enabledTransports: ["ws"],
//   //   forceTLS: import.meta.env.VITE_PUSHER_FORCE_TLS === "true",
//   //   enabledTransports: ["ws", "wss"],
//   disableStats: true,
// });

// export const echo = window.Echo;
