import { createRouter, createWebHistory } from "vue-router";
import backendRoutes from "./routes/backend";
import ventasRoutes from "./routes/ventas";
import cobranzasRoutes from "./routes/cobranzas";
import aprobacionesRoutes from "./routes/aprobaciones";
import devolucionesRoutes from "./routes/devoluciones";
import mensajesRoutes from "./routes/mensajes";
import bodegasRoutes from "./routes/bodegas";
import sistemasRoutes from "./routes/sistemas";
import gestionOperativaRoutes from "./routes/gestionOperativa";
import { baseRoutes, guestAndPublicRoutes } from "./routes/publicas";
import { registerRouterGuards } from "./guards";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...baseRoutes,
    ...backendRoutes,
    ...ventasRoutes,
    ...cobranzasRoutes,
    ...aprobacionesRoutes,
    ...devolucionesRoutes,
    ...mensajesRoutes,
    ...bodegasRoutes,
    ...sistemasRoutes,
    ...gestionOperativaRoutes,
    ...guestAndPublicRoutes,
  ],
});

registerRouterGuards(router);

export default router;
